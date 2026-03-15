function FilmReelIcon() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <div className="absolute inset-0 animate-spin rounded-full border-4 border-gold/20 border-t-gold/90 border-r-teal/70 bg-white/5" />
      <svg
        viewBox="0 0 120 120"
        aria-hidden="true"
        className="relative h-16 w-16 text-paper/90"
        fill="none"
      >
        <circle cx="60" cy="60" r="34" stroke="currentColor" strokeWidth="6" />
        <circle cx="60" cy="60" r="10" fill="currentColor" fillOpacity="0.85" />
        <circle cx="60" cy="28" r="7" fill="currentColor" fillOpacity="0.85" />
        <circle cx="92" cy="60" r="7" fill="currentColor" fillOpacity="0.85" />
        <circle cx="60" cy="92" r="7" fill="currentColor" fillOpacity="0.85" />
        <circle cx="28" cy="60" r="7" fill="currentColor" fillOpacity="0.85" />
        <circle cx="82" cy="38" r="6" fill="currentColor" fillOpacity="0.65" />
        <circle cx="82" cy="82" r="6" fill="currentColor" fillOpacity="0.65" />
        <circle cx="38" cy="82" r="6" fill="currentColor" fillOpacity="0.65" />
        <circle cx="38" cy="38" r="6" fill="currentColor" fillOpacity="0.65" />
      </svg>
    </div>
  );
}

export default function MovieLoader({
  title = "Loading movie",
  message = "Finding a strong pick for tonight...",
  compact = false,
}) {
  return (
    <div
      className={`cinema-card flex flex-col items-center justify-center text-center ${
        compact ? "min-h-[180px] p-6" : "min-h-[420px] p-8"
      }`}
    >
      <FilmReelIcon />
      <span className="glass-pill mt-5">Now Loading</span>
      <h2 className={`mt-5 font-bold text-paper ${compact ? "text-2xl" : "text-3xl"}`}>{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-7 text-paper/65">{message}</p>
    </div>
  );
}
