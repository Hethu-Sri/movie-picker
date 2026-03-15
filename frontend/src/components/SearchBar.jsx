import { useState } from "react";

export default function SearchBar({ onSearch, loading = false }) {
  const [query, setQuery] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    onSearch(query.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="cinema-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
    >
      <div className="flex-1">
        <label htmlFor="movie-search" className="mb-2 block text-sm text-paper/65">
          Search for a specific movie
        </label>
        <input
          id="movie-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for Inception, Interstellar, Dune..."
          className="w-full rounded-2xl border border-white/10 bg-ink/40 px-4 py-3 text-paper outline-none transition focus:border-gold/60"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="action-button--ghost min-w-36 self-end sm:self-auto"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

