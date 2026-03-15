import { Link } from "react-router-dom";

import { formatGenres, formatRating, formatRuntime } from "../lib/formatters";
import PlatformGroup from "./PlatformGroup";

function Stat({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-paper/45">{label}</p>
      <p className="mt-2 text-lg font-semibold text-paper">{value}</p>
    </div>
  );
}

export default function MovieDetail({ movie, onSaveToggle, saved = false }) {
  if (!movie) {
    return null;
  }

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[36px] border border-white/10">
        {movie.backdrop ? (
          <img
            src={movie.backdrop}
            alt=""
            className="h-[240px] w-full object-cover opacity-60 sm:h-[320px]"
          />
        ) : (
          <div className="h-[240px] w-full bg-white/5 sm:h-[320px]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
        <div className="absolute left-0 right-0 top-0 p-6">
          <Link to="/" className="action-button--ghost">
            Back home
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <span className="glass-pill">{movie.year}</span>
            {movie.originalLanguageLabel ? <span className="glass-pill">{movie.originalLanguageLabel}</span> : null}
          </div>
          <h1 className="mt-4 font-display text-5xl text-paper sm:text-6xl">{movie.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-paper/75">
            {movie.plot || movie.overview}
          </p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[300px,1fr]">
        <div className="space-y-6">
          <div className="cinema-card overflow-hidden">
            <img src={movie.poster} alt={`${movie.title} poster`} className="w-full object-cover" />
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Stat label="IMDb" value={formatRating(movie.ratings.imdb)} />
            <Stat label="TMDB" value={formatRating(movie.ratings.tmdb)} />
            <Stat label="Runtime" value={formatRuntime(movie.runtime)} />
            <Stat
              label="Language"
              value={movie.originalLanguageLabel || movie.selection?.originalLanguageLabel || "Unlisted"}
            />
            <Stat label="Genre" value={formatGenres(movie.genres) || "Unlisted"} />
            <Stat
              label="Discovery"
              value={movie.selection?.categoryLabel || "Movie Details"}
            />
          </div>

          <button type="button" onClick={() => onSaveToggle(movie)} className="action-button--ghost w-full">
            {saved ? "Remove from Watch Later" : "Save to Watch Later"}
          </button>
        </div>

        <div className="space-y-6">
          <div className="cinema-card p-6 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="glass-pill">Streaming availability</span>
              {movie.contentRating ? <span className="glass-pill">{movie.contentRating}</span> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <PlatformGroup title="United States" regionCode="US" providers={movie.providers.US} />
              <PlatformGroup title="India" regionCode="IN" providers={movie.providers.IN} />
            </div>
          </div>

          <div className="cinema-card p-6 sm:p-8">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-paper/55">
              Trailer
            </p>
            {movie.trailer?.embedUrl ? (
              <div className="overflow-hidden rounded-[28px] border border-white/10">
                <iframe
                  src={movie.trailer.embedUrl}
                  title={`${movie.title} trailer`}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : movie.trailer?.url ? (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-paper/75">
                <p className="mb-4">Trailer embed is unavailable for this title.</p>
                <a
                  href={movie.trailer.url}
                  target="_blank"
                  rel="noreferrer"
                  className="action-button--ghost"
                >
                  Open trailer search
                </a>
              </div>
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-paper/65">
                Trailer unavailable for this title.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
