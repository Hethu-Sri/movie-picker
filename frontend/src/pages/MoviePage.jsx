import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import MovieDetail from "../components/MovieDetail";
import MovieLoader from "../components/MovieLoader";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { movieApi } from "../lib/api";

export default function MoviePage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [status, setStatus] = useState({
    loading: true,
    error: "",
  });
  const [watchLater, setWatchLater] = useLocalStorage("quickpick-watch-later", []);

  useEffect(() => {
    let active = true;

    async function loadMovie() {
      setStatus({
        loading: true,
        error: "",
      });

      try {
        const payload = await movieApi.getMovie(id);

        if (active) {
          setMovie(payload);
        }
      } catch (error) {
        if (active) {
          setStatus({
            loading: false,
            error: error.message,
          });
        }
        return;
      }

      if (active) {
        setStatus({
          loading: false,
          error: "",
        });
      }
    }

    loadMovie();

    return () => {
      active = false;
    };
  }, [id]);

  function toggleWatchLater(selectedMovie) {
    setWatchLater((previous) => {
      const exists = previous.some((entry) => entry.id === selectedMovie.id);

      if (exists) {
        return previous.filter((entry) => entry.id !== selectedMovie.id);
      }

      return [selectedMovie, ...previous].slice(0, 12);
    });
  }

  const savedIds = useMemo(() => new Set(watchLater.map((entry) => entry.id)), [watchLater]);

  return (
    <main className="cinema-shell">
      {status.loading ? (
        <MovieLoader
          compact
          title="Loading movie details"
          message="Pulling ratings, trailer, and streaming availability..."
        />
      ) : null}

      {status.error ? (
        <div className="rounded-3xl border border-ember/35 bg-ember/10 p-5 text-paper">
          {status.error}
        </div>
      ) : null}

      {!status.loading && !status.error ? (
        <MovieDetail
          movie={movie}
          onSaveToggle={toggleWatchLater}
          saved={savedIds.has(movie.id)}
        />
      ) : null}
    </main>
  );
}
