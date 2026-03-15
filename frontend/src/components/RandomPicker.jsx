import GenreFilter from "./GenreFilter";
import ReleaseFilter from "./ReleaseFilter";

function ActionTile({ action, disabled = false }) {
  const activeClasses = action.active
    ? "border-gold/50 bg-gold/15 text-paper shadow-glow"
    : "border-white/10 bg-white/5 text-paper/85 hover:border-white/25 hover:bg-white/10";

  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={disabled}
      className={`rounded-[28px] border p-5 text-left transition duration-200 ${activeClasses} ${
        disabled ? "cursor-not-allowed opacity-70" : "hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-paper">{action.label}</p>
          <p className="mt-2 text-sm leading-6 text-paper/65">{action.description}</p>
        </div>
        <span className="text-2xl">{action.emoji}</span>
      </div>
    </button>
  );
}

export default function RandomPicker({
  actions,
  genres,
  selectedCategoryLabel,
  selectedGenre,
  selectedYear,
  latestOnly,
  selectionLanguage,
  onGenreChange,
  onLatestToggle,
  onYearChange,
  isLoading,
  loadingLabel,
  children,
}) {
  return (
    <section className="grid gap-8 xl:grid-cols-[1.2fr,0.8fr] xl:items-start">
      <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-ink/50 p-6 sm:p-8">
        <div className="shine-grid absolute inset-0 opacity-30" />
        <div className="relative">
          <span className="glass-pill mb-6">Production-ready movie decider</span>
          <h1 className="font-display text-5xl leading-none text-paper sm:text-7xl">
            Can&apos;t decide what to watch?
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-paper/70">
            QuickPick Movies compresses the choice down to one strong recommendation with
            ratings, runtime, trailer, and streaming availability in the US and India.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {actions.map((action) => (
              <ActionTile key={action.id} action={action} disabled={isLoading} />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="glass-pill">Lane: {selectedCategoryLabel}</span>
            {selectionLanguage ? <span className="glass-pill">Language: {selectionLanguage}</span> : null}
            {selectedGenre ? <span className="glass-pill">Genre: {selectedGenre}</span> : null}
            {selectedYear ? <span className="glass-pill">Year: {selectedYear}</span> : null}
            {latestOnly ? <span className="glass-pill">Latest</span> : null}
          </div>

          <div id="genre-browser" className="mt-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-paper/55">
              Filter by genre before you pick
            </p>
            <GenreFilter
              genres={genres}
              selectedGenre={selectedGenre}
              onSelect={onGenreChange}
            />
          </div>

          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-paper/55">
              Filter by year or latest releases
            </p>
            <ReleaseFilter
              selectedYear={selectedYear}
              latestOnly={latestOnly}
              onYearChange={onYearChange}
              onLatestToggle={onLatestToggle}
            />
          </div>

          {isLoading ? (
            <div className="mt-8 rounded-3xl border border-gold/20 bg-gold/10 p-4 text-sm text-paper/80">
              {loadingLabel}
            </div>
          ) : null}
        </div>
      </div>

      <div>{children}</div>
    </section>
  );
}
