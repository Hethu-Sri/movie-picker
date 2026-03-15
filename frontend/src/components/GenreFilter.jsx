const CURATED_GENRES = [
  { label: "Action", value: "Action" },
  { label: "Comedy", value: "Comedy" },
  { label: "Thriller", value: "Thriller" },
  { label: "Horror", value: "Horror" },
  { label: "Sci-Fi", value: "Science Fiction" },
  { label: "Romance", value: "Romance" },
  { label: "Drama", value: "Drama" },
  { label: "Adventure", value: "Adventure" },
  { label: "Animation", value: "Animation" },
];

export default function GenreFilter({ genres = [], selectedGenre, onSelect }) {
  const availableGenreNames = new Set(genres.map((genre) => genre.name));
  const availableGenres = CURATED_GENRES.filter(
    (genre) => !availableGenreNames.size || availableGenreNames.has(genre.value),
  );

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect("")}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          !selectedGenre
            ? "bg-gold text-ink"
            : "border border-white/15 bg-white/5 text-paper/80 hover:border-white/30"
        }`}
      >
        All genres
      </button>

      {availableGenres.map((genre) => {
        const active = selectedGenre === genre.value;

        return (
          <button
            key={genre.value}
            type="button"
            onClick={() => onSelect(genre.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-ember text-paper"
                : "border border-white/15 bg-white/5 text-paper/80 hover:border-white/30"
            }`}
          >
            {genre.label}
          </button>
        );
      })}
    </div>
  );
}
