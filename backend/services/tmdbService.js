import { getOrSetCache } from "./cache.js";

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

export function hasTmdbCredentials() {
  return Boolean(process.env.TMDB_API_KEY || process.env.TMDB_ACCESS_TOKEN);
}

function getTmdbHeaders(useAccessToken = true) {
  if (useAccessToken && process.env.TMDB_ACCESS_TOKEN) {
    return {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    };
  }

  return {};
}

function buildTmdbUrl(endpoint, params = {}, useAccessToken = true) {
  const url = new URL(`${TMDB_API_BASE_URL}${endpoint}`);
  const apiKey = process.env.TMDB_API_KEY;

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  if (!useAccessToken || !process.env.TMDB_ACCESS_TOKEN) {
    if (!apiKey) {
      throw new Error("TMDB credentials are missing. Set TMDB_API_KEY or TMDB_ACCESS_TOKEN.");
    }

    url.searchParams.set("api_key", apiKey);
  }

  return url;
}

async function runTmdbRequest(endpoint, params = {}, useAccessToken = true) {
  const response = await fetch(buildTmdbUrl(endpoint, params, useAccessToken), {
    headers: {
      accept: "application/json",
      ...getTmdbHeaders(useAccessToken),
    },
  });

  return response;
}

async function tmdbFetch(endpoint, params = {}) {
  const canTryAccessToken = Boolean(process.env.TMDB_ACCESS_TOKEN);
  const canTryApiKey = Boolean(process.env.TMDB_API_KEY);

  let response = await runTmdbRequest(endpoint, params, canTryAccessToken);

  // If the bearer token is misconfigured, fall back to the API key when available.
  if (response.status === 401 && canTryAccessToken && canTryApiKey) {
    response = await runTmdbRequest(endpoint, params, false);
  }

  if (!response.ok) {
    const error = new Error(`TMDB request failed with status ${response.status}.`);
    error.statusCode = response.status;
    throw error;
  }

  return response.json();
}

export function buildImageUrl(path, size = "w500") {
  if (!path) {
    return null;
  }

  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export async function getGenres() {
  return getOrSetCache("tmdb:genres", ONE_DAY, async () => {
    const payload = await tmdbFetch("/genre/movie/list", {
      language: "en-US",
    });

    return payload.genres || [];
  });
}

export async function resolveGenreId(genreInput) {
  if (!genreInput) {
    return null;
  }

  if (/^\d+$/.test(String(genreInput))) {
    return Number(genreInput);
  }

  const genres = await getGenres();
  const match = genres.find(
    (genre) => genre.name.toLowerCase() === String(genreInput).trim().toLowerCase(),
  );

  if (!match) {
    const error = new Error(`Unknown genre "${genreInput}".`);
    error.statusCode = 400;
    throw error;
  }

  return match.id;
}

export async function discoverMovies({
  genreId,
  page = 1,
  fastMode = false,
  minVoteAverage,
  minVoteCount,
  originalLanguage,
  region,
  sortBy,
  year,
  primaryReleaseDateGte,
} = {}) {
  const cacheKey = `tmdb:discover:${genreId || "all"}:${page}:${fastMode}:${minVoteAverage || ""}:${minVoteCount || ""}:${originalLanguage || ""}:${region || ""}:${sortBy || ""}:${year || ""}:${primaryReleaseDateGte || ""}`;

  return getOrSetCache(cacheKey, 10 * 60 * 1000, () =>
    tmdbFetch("/discover/movie", {
      include_adult: false,
      include_video: false,
      language: "en-US",
      page,
      primary_release_date_gte: primaryReleaseDateGte,
      primary_release_date_lte: new Date().toISOString().slice(0, 10),
      primary_release_year: year,
      region,
      sort_by: sortBy || (fastMode ? "popularity.desc" : "popularity.desc"),
      "vote_average.gte": minVoteAverage ?? (fastMode ? 7 : 6.5),
      "vote_count.gte": minVoteCount ?? (fastMode ? 500 : 250),
      with_genres: genreId,
      with_original_language: originalLanguage,
    }),
  );
}

export async function searchMovies(query, page = 1) {
  const cacheKey = `tmdb:search:${query.toLowerCase()}:${page}`;

  return getOrSetCache(cacheKey, ONE_HOUR, () =>
    tmdbFetch("/search/movie", {
      include_adult: false,
      language: "en-US",
      page,
      query,
    }),
  );
}

export async function getTrendingMovies(page = 1) {
  const cacheKey = `tmdb:trending:${page}`;

  return getOrSetCache(cacheKey, 15 * 60 * 1000, () =>
    tmdbFetch("/trending/movie/day", {
      language: "en-US",
      page,
    }),
  );
}

export async function getMovieDetails(movieId) {
  return getOrSetCache(`tmdb:movie:${movieId}`, ONE_DAY, () =>
    tmdbFetch(`/movie/${movieId}`, {
      append_to_response: "videos",
      language: "en-US",
    }),
  );
}

export async function getMovieWatchProviders(movieId) {
  return getOrSetCache(`tmdb:providers:${movieId}`, ONE_DAY, () =>
    tmdbFetch(`/movie/${movieId}/watch/providers`),
  );
}

export function extractTrailer(videosPayload = {}) {
  const videos = videosPayload.results || [];
  const youtubeTrailers = videos.filter(
    (video) => video.site === "YouTube" && video.type === "Trailer",
  );

  return (
    youtubeTrailers.find((video) => video.official) ||
    youtubeTrailers[0] ||
    videos.find((video) => video.site === "YouTube") ||
    null
  );
}
