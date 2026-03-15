export function formatRuntime(runtime) {
  if (!runtime) {
    return "Runtime unavailable";
  }

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (!hours) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatRating(rating) {
  if (!rating) {
    return "N/A";
  }

  return Number(rating).toFixed(1);
}

export function formatGenres(genres = []) {
  return genres.slice(0, 3).join(" • ");
}

