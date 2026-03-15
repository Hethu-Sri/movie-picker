import GenreFilter from "./GenreFilter";

export default function RandomPicker({
  genres,
  selectedGenre,
  onGenreChange,
  onRandomPick,
  onFastPick,
  isLoading,
  loadingLabel,
  children,
}) {
  return (
    <section className="grid gap-8 xl:grid-cols-[1.2fr,0.8fr] xl:items-start">
      <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-ink/50 p-6 sm:p-8">
        <div className="shine-grid absolute inset-0 opacity-30" />
        <div className="relative">
          <span className="glass-pill mb-6">Fast movie decisions in under 10 seconds</span>
          <h1 className="font-display text-5xl leading-none text-paper sm:text-7xl">
            Can&apos;t decide what to watch?
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-paper/70">
            QuickPick Movie narrows the choice down to one strong recommendation with
            ratings, runtime, trailer, and where you can stream it in the US and India.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onRandomPick}
              disabled={isLoading}
              className="action-button--primary min-w-48"
            >
              Pick a Movie for Me
            </button>
            <button
              type="button"
              onClick={onFastPick}
              disabled={isLoading}
              className={`action-button--accent min-w-48 ${isLoading ? "animate-pulse-ring" : ""}`}
            >
              I&apos;m Eating — Pick Fast
            </button>
            <a href="#genre-browser" className="action-button--ghost min-w-48">
              Browse by Genre
            </a>
          </div>

          <div id="genre-browser" className="mt-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-paper/55">
              Filter before you pick
            </p>
            <GenreFilter
              genres={genres}
              selectedGenre={selectedGenre}
              onSelect={onGenreChange}
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

