const YEAR_OPTIONS = Array.from({ length: 36 }, (_, index) => {
  const year = new Date().getFullYear() - index;
  return year;
});

export default function ReleaseFilter({
  selectedYear,
  latestOnly,
  onYearChange,
  onLatestToggle,
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[220px,1fr]">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-paper/55">
          Release Year
        </span>
        <select
          value={selectedYear}
          onChange={(event) => onYearChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-ink/40 px-4 py-3 text-paper outline-none transition focus:border-gold/60"
        >
          <option value="">All years</option>
          {YEAR_OPTIONS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>

      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-paper/55">
          Freshness
        </p>
        <button
          type="button"
          onClick={() => onLatestToggle(!latestOnly)}
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
            latestOnly
              ? "border-gold/45 bg-gold/15 text-paper"
              : "border-white/10 bg-white/5 text-paper/80 hover:border-white/25"
          }`}
        >
          {latestOnly ? "Latest releases on" : "Show latest releases"}
        </button>
      </div>
    </div>
  );
}
