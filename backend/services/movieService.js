import { getOrSetCache } from "./cache.js";
import {
  getDemoFastPick,
  getDemoGenres,
  getDemoMovieById,
  getDemoProvidersById,
  getDemoRandomMovie,
  getDemoTrending,
  searchDemoMovies,
} from "./demoMovieService.js";
import {
  buildDiscoveryContext,
  getCategoryLanguageCodes,
  resolveLanguageLabel,
} from "./discoveryConfig.js";
import { getOmdbMovie, parseImdbRating } from "./omdbService.js";
import {
  buildImageUrl,
  discoverMovies,
  extractTrailer,
  getGenres,
  getMovieDetails,
  getMovieWatchProviders,
  getTrendingMovies,
  hasTmdbCredentials,
  resolveGenreId,
  searchMovies,
} from "./tmdbService.js";

const FAST_PICK_TTL = 15 * 60 * 1000;
const HYDRATED_MOVIE_TTL = 6 * 60 * 60 * 1000;
const SUPPORTED_REGIONS = ["US", "IN"];

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function pickRandom(items) {
  if (!items.length) {
    return null;
  }

  return items[Math.floor(Math.random() * items.length)];
}

function safeYear(dateString) {
  return dateString ? Number(dateString.slice(0, 4)) : null;
}

function safeRuntime(tmdbRuntime, omdbRuntime) {
  if (Number.isFinite(tmdbRuntime) && tmdbRuntime > 0) {
    return tmdbRuntime;
  }

  const match = String(omdbRuntime || "").match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function normalizeYearInput(year) {
  if (year === undefined || year === null || year === "") {
    return null;
  }

  const numericYear = Number(year);

  if (!Number.isInteger(numericYear) || numericYear < 1900 || numericYear > 2100) {
    const error = new Error(`Invalid year "${year}".`);
    error.statusCode = 400;
    throw error;
  }

  return numericYear;
}

function normalizeLatestFlag(value) {
  return value === true || value === "true" || value === "1" || value === 1;
}

function mapProviderGroup(providers = []) {
  const seen = new Set();

  return providers
    .filter(Boolean)
    .filter((provider) => {
      if (seen.has(provider.provider_id)) {
        return false;
      }

      seen.add(provider.provider_id);
      return true;
    })
    .map((provider) => ({
      id: provider.provider_id,
      name: provider.provider_name,
      logo: buildImageUrl(provider.logo_path, "w92"),
    }));
}

function mapProvidersByRegion(payload = {}) {
  const results = payload.results || {};

  return Object.fromEntries(
    SUPPORTED_REGIONS.map((region) => {
      const regionPayload = results[region] || {};
      const streaming = mapProviderGroup(regionPayload.flatrate);

      return [
        region,
        {
          link: regionPayload.link || null,
          streaming,
          rent: mapProviderGroup(regionPayload.rent),
          buy: mapProviderGroup(regionPayload.buy),
        },
      ];
    }),
  );
}

function buildPlatformSummary(providerMap) {
  return Object.fromEntries(
    Object.entries(providerMap).map(([region, details]) => [
      region,
      details.streaming.map((provider) => provider.name),
    ]),
  );
}

function hasStreamingAccess(providerMap) {
  return Object.values(providerMap).some((region) => region.streaming.length > 0);
}

function normalizeMoviePayload(details, watchProviders, omdbMovie) {
  const providers = mapProvidersByRegion(watchProviders);
  const trailer = extractTrailer(details.videos);
  const imdbRating = parseImdbRating(omdbMovie?.imdbRating);

  return {
    id: details.id,
    title: details.title,
    year: safeYear(details.release_date),
    releaseDate: details.release_date,
    overview: details.overview,
    plot:
      omdbMovie?.Plot && omdbMovie.Plot !== "N/A" ? omdbMovie.Plot : details.overview,
    genres: (details.genres || []).map((genre) => genre.name),
    runtime: safeRuntime(details.runtime, omdbMovie?.Runtime),
    ratings: {
      imdb: imdbRating,
      tmdb: Number(details.vote_average?.toFixed?.(1) || details.vote_average || 0),
    },
    contentRating: omdbMovie?.Rated && omdbMovie.Rated !== "N/A" ? omdbMovie.Rated : null,
    poster: buildImageUrl(details.poster_path, "w500"),
    backdrop: buildImageUrl(details.backdrop_path, "w1280"),
    imdbId: details.imdb_id || null,
    originalLanguage: details.original_language || null,
    originalLanguageLabel: resolveLanguageLabel(details.original_language),
    trailer: trailer
      ? {
          key: trailer.key,
          name: trailer.name,
          url: `https://www.youtube.com/watch?v=${trailer.key}`,
          embedUrl: `https://www.youtube.com/embed/${trailer.key}`,
        }
      : null,
    providers,
    platforms: buildPlatformSummary(providers),
    availableToStream: hasStreamingAccess(providers),
    source: "tmdb",
  };
}

function isEligiblePick(movie) {
  const effectiveRating = movie.ratings.imdb || movie.ratings.tmdb;
  return Boolean(movie.poster && movie.availableToStream && effectiveRating >= 6.5);
}

function buildSelectionMetadata(movie, discoveryContext) {
  return {
    ...movie,
    selection: {
      categoryId: discoveryContext.categoryId,
      categoryLabel: discoveryContext.categoryLabel,
      fastMode: discoveryContext.fastMode,
      originalLanguage:
        movie.originalLanguage || discoveryContext.originalLanguage || null,
      originalLanguageLabel:
        movie.originalLanguageLabel ||
        discoveryContext.originalLanguageLabel ||
        null,
      region: discoveryContext.region || null,
    },
  };
}

function calculateFastScore(movie) {
  const imdb = movie.ratings.imdb || movie.ratings.tmdb || 0;
  const tmdb = movie.ratings.tmdb || 0;
  const providerBoost =
    (movie.providers?.US?.streaming?.length || 0) +
    (movie.providers?.IN?.streaming?.length || 0);

  return imdb * 2 + tmdb + providerBoost / 5 - (movie.runtime || 120) / 200;
}

function buildDiscoveryFilters({ year, latest } = {}) {
  const normalizedYear = normalizeYearInput(year);
  const latestEnabled = normalizeLatestFlag(latest);
  const latestCutoffYear = new Date().getFullYear() - 2;

  return {
    year: normalizedYear,
    latest: latestEnabled,
    primaryReleaseDateGte:
      latestEnabled && !normalizedYear ? `${latestCutoffYear}-01-01` : null,
    sortBy: latestEnabled ? "primary_release_date.desc" : "popularity.desc",
  };
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function rankSearchCandidate(candidate, normalizedQuery) {
  const normalizedTitle = normalizeSearchText(candidate.title);
  const normalizedOriginalTitle = normalizeSearchText(candidate.original_title);

  if (normalizedTitle === normalizedQuery || normalizedOriginalTitle === normalizedQuery) {
    return 100;
  }

  if (
    normalizedTitle.startsWith(normalizedQuery) ||
    normalizedOriginalTitle.startsWith(normalizedQuery)
  ) {
    return 80;
  }

  if (
    normalizedTitle.includes(normalizedQuery) ||
    normalizedOriginalTitle.includes(normalizedQuery)
  ) {
    return 60;
  }

  return 0;
}

function buildDiscoveryAttempts(category, fastMode) {
  const initialContext = buildDiscoveryContext({
    category,
    fastMode,
  });
  const alternateLanguageCodes = getCategoryLanguageCodes(category).filter(
    (code) => code !== initialContext.originalLanguage,
  );

  return [
    initialContext,
    ...alternateLanguageCodes.map((code) => ({
      ...initialContext,
      originalLanguage: code,
      originalLanguageLabel: resolveLanguageLabel(code),
    })),
  ];
}

export async function getAvailableGenres() {
  if (!hasTmdbCredentials()) {
    return getDemoGenres();
  }

  return getGenres();
}

export async function hydrateMovieById(movieId) {
  if (!hasTmdbCredentials()) {
    return getDemoMovieById(movieId);
  }

  return getOrSetCache(`movie:hydrated:${movieId}`, HYDRATED_MOVIE_TTL, async () => {
    const [details, watchProviders] = await Promise.all([
      getMovieDetails(movieId),
      getMovieWatchProviders(movieId),
    ]);

    const omdbMovie = await getOmdbMovie({
      imdbId: details.imdb_id,
      title: details.title,
      year: safeYear(details.release_date),
    });

    return normalizeMoviePayload(details, watchProviders, omdbMovie);
  });
}

export async function getMovieProvidersById(movieId) {
  if (!hasTmdbCredentials()) {
    return getDemoProvidersById(movieId);
  }

  const providerPayload = await getMovieWatchProviders(movieId);
  return mapProvidersByRegion(providerPayload);
}

async function hydrateFromCandidates(
  candidates,
  { limit = 5, shuffleCandidates = true } = {},
) {
  const filteredCandidates = candidates.filter((candidate) => candidate.poster_path);
  const shortlist = (shuffleCandidates ? shuffle(filteredCandidates) : filteredCandidates).slice(
    0,
    limit,
  );

  const hydratedMovies = await Promise.all(shortlist.map((movie) => hydrateMovieById(movie.id)));
  return hydratedMovies.filter(Boolean);
}

export async function selectRandomMovie({ genre, category, year, latest } = {}) {
  const discoveryAttempts = buildDiscoveryAttempts(category, false);
  const primaryContext = discoveryAttempts[0];
  const discoveryFilters = buildDiscoveryFilters({ year, latest });

  if (!hasTmdbCredentials()) {
    return buildSelectionMetadata(
      getDemoRandomMovie({
        genre,
        category: primaryContext.categoryId,
        latest: discoveryFilters.latest,
        year: discoveryFilters.year,
      }),
      primaryContext,
    );
  }

  const genreId = await resolveGenreId(genre);

  for (const discoveryContext of discoveryAttempts) {
    const page = Math.floor(Math.random() * 5) + 1;
    const discoveryPayload = await discoverMovies({
      genreId,
      minVoteAverage: 6.5,
      minVoteCount: 250,
      originalLanguage: discoveryContext.originalLanguage,
      page,
      primaryReleaseDateGte: discoveryFilters.primaryReleaseDateGte,
      region: discoveryContext.region,
      sortBy: discoveryFilters.sortBy,
      year: discoveryFilters.year,
    });

    const hydratedMovies = await hydrateFromCandidates(discoveryPayload.results || [], {
      limit: 8,
    });
    const eligibleMovies = hydratedMovies.filter(isEligiblePick);
    const selectedMovie = pickRandom(eligibleMovies.length ? eligibleMovies : hydratedMovies);

    if (selectedMovie) {
      return buildSelectionMetadata(selectedMovie, discoveryContext);
    }
  }

  const error = new Error("No movie recommendations are available right now.");
  error.statusCode = 404;
  throw error;
}

async function getFastPickPool(genreId, discoveryContext, discoveryFilters) {
  return getOrSetCache(
    `movie:fast-pool:${discoveryContext.categoryId}:${discoveryContext.originalLanguage || "all"}:${discoveryContext.region || "all"}:${genreId || "all"}:${discoveryFilters.year || "all"}:${discoveryFilters.latest}`,
    FAST_PICK_TTL,
    async () => {
      const [firstPage, secondPage] = await Promise.all([
        discoverMovies({
          fastMode: true,
          genreId,
          minVoteAverage: 7,
          minVoteCount: 500,
          originalLanguage: discoveryContext.originalLanguage,
          page: 1,
          primaryReleaseDateGte: discoveryFilters.primaryReleaseDateGte,
          region: discoveryContext.region,
          sortBy: discoveryFilters.sortBy,
          year: discoveryFilters.year,
        }),
        discoverMovies({
          fastMode: true,
          genreId,
          minVoteAverage: 7,
          minVoteCount: 500,
          originalLanguage: discoveryContext.originalLanguage,
          page: 2,
          primaryReleaseDateGte: discoveryFilters.primaryReleaseDateGte,
          region: discoveryContext.region,
          sortBy: discoveryFilters.sortBy,
          year: discoveryFilters.year,
        }),
      ]);

      const candidates = [...(firstPage.results || []), ...(secondPage.results || [])];

      const hydratedMovies = await hydrateFromCandidates(candidates, {
        limit: 10,
        shuffleCandidates: false,
      });

      return hydratedMovies
        .filter((movie) => {
          const effectiveRating = movie.ratings.imdb || movie.ratings.tmdb;
          return Boolean(movie.poster && movie.availableToStream && effectiveRating >= 7);
        })
        .sort((left, right) => calculateFastScore(right) - calculateFastScore(left));
    },
  );
}

export async function selectFastPick({ genre, category, year, latest } = {}) {
  const discoveryAttempts = buildDiscoveryAttempts(category, true);
  const primaryContext = discoveryAttempts[0];
  const discoveryFilters = buildDiscoveryFilters({ year, latest });

  if (!hasTmdbCredentials()) {
    return buildSelectionMetadata(
      getDemoFastPick({
        genre,
        category: primaryContext.categoryId,
        latest: discoveryFilters.latest,
        year: discoveryFilters.year,
      }),
      primaryContext,
    );
  }

  const genreId = await resolveGenreId(genre);

  for (const discoveryContext of discoveryAttempts) {
    const fastPool = await getFastPickPool(genreId, discoveryContext, discoveryFilters);

    if (fastPool.length) {
      return buildSelectionMetadata(fastPool[0], discoveryContext);
    }
  }

  return selectRandomMovie({ category, genre, year, latest });
}

export async function searchHydratedMovies(query, limit = 6) {
  if (!hasTmdbCredentials()) {
    return searchDemoMovies(query, limit);
  }

  const normalizedQuery = normalizeSearchText(query);
  const [firstPage, secondPage] = await Promise.all([searchMovies(query, 1), searchMovies(query, 2)]);
  const dedupedCandidates = [];
  const seenIds = new Set();

  [...(firstPage.results || []), ...(secondPage.results || [])].forEach((candidate) => {
    if (!seenIds.has(candidate.id)) {
      seenIds.add(candidate.id);
      dedupedCandidates.push(candidate);
    }
  });

  const rankedCandidates = dedupedCandidates.sort((left, right) => {
    const leftRank = rankSearchCandidate(left, normalizedQuery);
    const rightRank = rankSearchCandidate(right, normalizedQuery);

    if (leftRank !== rightRank) {
      return rightRank - leftRank;
    }

    if ((left.popularity || 0) !== (right.popularity || 0)) {
      return (right.popularity || 0) - (left.popularity || 0);
    }

    return (right.vote_count || 0) - (left.vote_count || 0);
  });

  const hydratedMovies = await hydrateFromCandidates(rankedCandidates, {
    limit: Math.max(limit, 8),
    shuffleCandidates: false,
  });

  return hydratedMovies.slice(0, limit);
}

export async function getTrendingPicks(limit = 6, { category, year, latest } = {}) {
  const discoveryAttempts = buildDiscoveryAttempts(category, false);
  const primaryContext = discoveryAttempts[0];
  const discoveryFilters = buildDiscoveryFilters({ year, latest });

  if (!hasTmdbCredentials()) {
    return getDemoTrending(limit, {
      category: primaryContext.categoryId,
      latest: discoveryFilters.latest,
      year: discoveryFilters.year,
    });
  }

  if (primaryContext.categoryId !== "all" || discoveryFilters.year || discoveryFilters.latest) {
    const results = [];
    const seenIds = new Set();

    for (const discoveryContext of discoveryAttempts) {
      const payload = await discoverMovies({
        fastMode: false,
        minVoteAverage: 6.8,
        minVoteCount: 350,
        originalLanguage: discoveryContext.originalLanguage,
        page: 1,
        primaryReleaseDateGte: discoveryFilters.primaryReleaseDateGte,
        region: discoveryContext.region,
        sortBy: discoveryFilters.sortBy,
        year: discoveryFilters.year,
      });

      const hydratedMovies = await hydrateFromCandidates(payload.results || [], {
        limit: limit + 2,
        shuffleCandidates: false,
      });

      hydratedMovies.filter(isEligiblePick).forEach((movie) => {
        if (!seenIds.has(movie.id) && results.length < limit) {
          seenIds.add(movie.id);
          results.push(movie);
        }
      });

      if (results.length >= limit) {
        break;
      }
    }

    return results;
  }

  const trendingPayload = await getTrendingMovies(1);
  const hydratedMovies = await hydrateFromCandidates(trendingPayload.results || [], {
    limit: limit + 2,
    shuffleCandidates: false,
  });

  return hydratedMovies.filter(isEligiblePick).slice(0, limit);
}
