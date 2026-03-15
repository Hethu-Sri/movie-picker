import { getOrSetCache } from "./cache.js";

const OMDB_API_BASE_URL = "https://www.omdbapi.com/";
const ONE_DAY = 24 * 60 * 60 * 1000;

async function omdbFetch(params) {
  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    return null;
  }

  const url = new URL(OMDB_API_BASE_URL);
  url.searchParams.set("apikey", apiKey);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(`OMDb request failed with status ${response.status}.`);
    error.statusCode = response.status;
    throw error;
  }

  const payload = await response.json();

  if (payload.Response === "False") {
    return null;
  }

  return payload;
}

export async function getOmdbMovie({ imdbId, title, year }) {
  if (!process.env.OMDB_API_KEY) {
    return null;
  }

  const cacheKey = imdbId ? `omdb:${imdbId}` : `omdb:${title}:${year || ""}`;

  return getOrSetCache(cacheKey, ONE_DAY, () =>
    omdbFetch(
      imdbId
        ? {
            i: imdbId,
            plot: "full",
          }
        : {
            t: title,
            y: year,
            plot: "full",
          },
    ),
  );
}

export function parseImdbRating(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

