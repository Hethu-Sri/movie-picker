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

  return (
    <article
      className={`cinema-card overflow-hidden ${
        compact ? "h-full animate-float-in" : "animate-float-in"
      }`}
    >
      <div className={`${compact ? "block" : "grid gap-0 lg:grid-cols-[280px,1fr]"}`}>
        <div className={`${compact ? "aspect-[3/4]" : "aspect-[3/4] lg:h-full"}`}>
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            className="h-full w-full object-cover"
          />
        </div>

        <div className={`${compact ? "p-5" : "p-6 sm:p-8"}`}>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="glass-pill">{movie.year || "Upcoming"}</span>
            {movie.contentRating ? <span className="glass-pill">{movie.contentRating}</span> : null}
            <span className="glass-pill">{formatRuntime(movie.runtime)}</span>
          </div>

          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className={`${compact ? "text-2xl" : "text-4xl"} font-bold text-paper`}>
                {movie.title}
              </h3>
              <p className="mt-2 text-sm text-paper/65">{formatGenres(movie.genres)}</p>
            </div>

            <div className="flex gap-2">
              <RatingBadge label="IMDb" value={movie.ratings.imdb} />
              <RatingBadge label="TMDB" value={movie.ratings.tmdb} accent="teal" />
            </div>
          </div>

          {!compact ? (
            <p className="max-w-2xl text-sm leading-7 text-paper/75">
              {movie.plot || movie.overview}
            </p>
          ) : null}

          <div className={`mt-6 grid gap-4 ${compact ? "" : "md:grid-cols-2"}`}>
            <PlatformGroup title="Available in US" regionCode="US" providers={movie.providers.US} />
            <PlatformGroup
              title="Available in India"
              regionCode="IN"
              providers={movie.providers.IN}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {!compact && onPickAnother ? (
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
      </div>
    </article>
  );
}

