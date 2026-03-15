const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || "Unable to complete the request.");
  }

  return payload;
}

export const movieApi = {
  getHealth: () => request("/health"),
  getGenres: () => request("/genres"),
  getRandomMovie: (genre) =>
    request(`/random-movie${genre ? `?genre=${encodeURIComponent(genre)}` : ""}`),
  getFastPick: (genre) =>
    request(`/fast-pick${genre ? `?genre=${encodeURIComponent(genre)}` : ""}`),
  searchMovies: (query) => request(`/search?q=${encodeURIComponent(query)}`),
  getMovie: (id) => request(`/movies/${id}`),
  getTrending: (limit = 6) => request(`/trending?limit=${limit}`),
};
