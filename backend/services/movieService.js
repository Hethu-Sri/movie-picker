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
  };
}

function isEligiblePick(movie) {
  const effectiveRating = movie.ratings.imdb || movie.ratings.tmdb;
  return Boolean(movie.poster && movie.availableToStream && effectiveRating >= 6.5);
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

async function hydrateFromCandidates(candidates, limit = 5) {
  const shortlist = shuffle(candidates)
    .filter((candidate) => candidate.poster_path)
    .slice(0, limit);

  const hydratedMovies = await Promise.all(shortlist.map((movie) => hydrateMovieById(movie.id)));
  return hydratedMovies.filter(Boolean);
}

export async function selectRandomMovie({ genre } = {}) {
  if (!hasTmdbCredentials()) {
    return getDemoRandomMovie({ genre });
  }

  const genreId = await resolveGenreId(genre);
  const page = Math.floor(Math.random() * 5) + 1;
  const discoveryPayload = await discoverMovies({
    genreId,
    page,
  });

  const hydratedMovies = await hydrateFromCandidates(discoveryPayload.results || []);
  const eligibleMovies = hydratedMovies.filter(isEligiblePick);

  if (eligibleMovies.length) {
    return pickRandom(eligibleMovies);
  }

  const fallbackMovie = hydratedMovies[0];

  if (!fallbackMovie) {
    const error = new Error("No movie recommendations are available right now.");
    error.statusCode = 404;
    throw error;
  }

  return fallbackMovie;
}

async function getFastPickPool(genreId) {
  return getOrSetCache(`movie:fast-pool:${genreId || "all"}`, FAST_PICK_TTL, async () => {
    const [firstPage, secondPage, trendingPage] = await Promise.all([
      discoverMovies({ genreId, page: 1, fastMode: true }),
      discoverMovies({ genreId, page: 2, fastMode: true }),
      getTrendingMovies(1),
    ]);

    const candidates = [
      ...(firstPage.results || []),
      ...(secondPage.results || []),
      ...(trendingPage.results || []),
    ];

    const hydratedMovies = await hydrateFromCandidates(candidates, 10);
    return hydratedMovies.filter(isEligiblePick);
  });
}

export async function selectFastPick({ genre } = {}) {
  if (!hasTmdbCredentials()) {
    return getDemoFastPick({ genre });
  }

  const genreId = await resolveGenreId(genre);
  const fastPool = await getFastPickPool(genreId);

  if (fastPool.length) {
    return pickRandom(fastPool);
  }

  return selectRandomMovie({ genre });
}

export async function searchHydratedMovies(query, limit = 6) {
  if (!hasTmdbCredentials()) {
    return searchDemoMovies(query, limit);
  }

  const searchPayload = await searchMovies(query, 1);
  const hydratedMovies = await hydrateFromCandidates(searchPayload.results || [], limit);

  return hydratedMovies.slice(0, limit);
}

export async function getTrendingPicks(limit = 6) {
  if (!hasTmdbCredentials()) {
    return getDemoTrending(limit);
  }

  const trendingPayload = await getTrendingMovies(1);
  const hydratedMovies = await hydrateFromCandidates(trendingPayload.results || [], limit + 2);

  return hydratedMovies.filter(isEligiblePick).slice(0, limit);
}
