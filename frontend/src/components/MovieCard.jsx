import { Link } from "react-router-dom";

import { formatGenres, formatRating, formatRuntime } from "../lib/formatters";
import PlatformGroup from "./PlatformGroup";

function RatingBadge({ label, value, accent = "gold" }) {
  const accentClass = accent === "teal" ? "bg-teal/15 text-teal" : "bg-gold/15 text-gold";

  return (
    <div className={`rounded-full px-3 py-2 text-sm font-semibold ${accentClass}`}>
      {label}: {formatRating(value)}
    </div>
  );
}

function SummaryText({ text }) {
  return (
    <p
      className="text-sm leading-7 text-paper/75"
      style={{
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: 7,
        display: "-webkit-box",
        overflow: "hidden",
      }}
    >
      {text}
    </p>
  );
}

export default function MovieCard({
  movie,
  variant = "featured",
  onPickAnother,
  onSaveToggle,
  saved = false,
}) {
  if (!movie) {
    return null;
  }

  const compact = variant === "compact";
  const languageLabel = movie.selection?.originalLanguageLabel || movie.originalLanguageLabel;
  const categoryLabel = movie.selection?.categoryLabel;

  if (!compact) {
    return (
      <article className="cinema-card overflow-hidden animate-float-in">
        <div className="relative aspect-[4/5]">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <div className="mb-3 flex flex-wrap gap-2">
              {movie.selection?.fastMode ? <span className="glass-pill">Fast Pick</span> : null}
              {categoryLabel ? <span className="glass-pill">{categoryLabel}</span> : null}
              {languageLabel ? <span className="glass-pill">{languageLabel}</span> : null}
              <span className="glass-pill">{movie.year || "Upcoming"}</span>
            </div>

            <h3 className="text-4xl font-bold text-paper sm:text-5xl">{movie.title}</h3>
            <p className="mt-2 text-sm text-paper/70">{formatGenres(movie.genres)}</p>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-paper/45">IMDb</p>
              <p className="mt-2 text-2xl font-bold text-gold">{formatRating(movie.ratings.imdb)}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-paper/45">TMDB</p>
              <p className="mt-2 text-2xl font-bold text-teal">{formatRating(movie.ratings.tmdb)}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-paper/45">Runtime</p>
              <p className="mt-2 text-xl font-bold text-paper">{formatRuntime(movie.runtime)}</p>
            </div>
          </div>

          {movie.contentRating ? (
            <div className="flex flex-wrap gap-2">
              <span className="glass-pill">{movie.contentRating}</span>
            </div>
          ) : null}

          <SummaryText text={movie.plot || movie.overview} />

          <div className="grid gap-3">
            <PlatformGroup title="Available in US" regionCode="US" providers={movie.providers.US} />
            <PlatformGroup
              title="Available in India"
              regionCode="IN"
              providers={movie.providers.IN}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {onPickAnother ? (
              <button type="button" onClick={onPickAnother} className="action-button--ghost">
                Pick another
              </button>
            ) : null}

            <Link to={`/movie/${movie.id}`} className="action-button--primary">
              View details
            </Link>

            {movie.trailer?.url ? (
              <a
                href={movie.trailer.url}
                target="_blank"
                rel="noreferrer"
                className="action-button--ghost"
              >
                Watch trailer
              </a>
            ) : null}

            {onSaveToggle ? (
              <button type="button" onClick={() => onSaveToggle(movie)} className="action-button--ghost">
                {saved ? "Remove from Watch Later" : "Save to Watch Later"}
              </button>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="cinema-card h-full overflow-hidden animate-float-in">
      <div className="block">
        <div className="aspect-[3/4]">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-5">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="glass-pill">{movie.year || "Upcoming"}</span>
            {movie.contentRating ? <span className="glass-pill">{movie.contentRating}</span> : null}
            <span className="glass-pill">{formatRuntime(movie.runtime)}</span>
          </div>

          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-paper">{movie.title}</h3>
              <p className="mt-2 text-sm text-paper/65">{formatGenres(movie.genres)}</p>
            </div>

            <div className="flex gap-2">
              <RatingBadge label="IMDb" value={movie.ratings.imdb} />
              <RatingBadge label="TMDB" value={movie.ratings.tmdb} accent="teal" />
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <PlatformGroup title="Available in US" regionCode="US" providers={movie.providers.US} />
            <PlatformGroup
              title="Available in India"
              regionCode="IN"
              providers={movie.providers.IN}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/movie/${movie.id}`} className="action-button--primary">
              View details
            </Link>

            {movie.trailer?.url ? (
              <a
                href={movie.trailer.url}
                target="_blank"
                rel="noreferrer"
                className="action-button--ghost"
              >
                Watch trailer
              </a>
            ) : null}

            {onSaveToggle ? (
              <button type="button" onClick={() => onSaveToggle(movie)} className="action-button--ghost">
                {saved ? "Remove from Watch Later" : "Save to Watch Later"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
