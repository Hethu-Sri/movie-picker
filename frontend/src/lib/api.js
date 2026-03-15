const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || "Unable to complete the request.");
  }

  return payload;
}

function withQuery(path, params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export const movieApi = {
  getHealth: () => request("/health"),
  getGenres: () => request("/genres"),
  getRandomMovie: ({ genre, category, year, latest } = {}) =>
    request(withQuery("/random", { genre, category, latest, year })),
  getGenreMovie: ({ genre, category, year, latest } = {}) =>
    request(withQuery("/genre", { genre, category, latest, year })),
  getFastPick: ({ genre, category, year, latest } = {}) =>
    request(withQuery("/fast-pick", { genre, category, latest, year })),
  searchMovies: (query) => request(`/search?q=${encodeURIComponent(query)}`),
  getMovie: (id) => request(`/movie/${id}`),
  getTrending: (limit = 6, category, year, latest) =>
    request(withQuery("/trending", { category, latest, limit, year })),
};
