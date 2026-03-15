import { useEffect, useMemo, useState } from "react";

import MovieCard from "../components/MovieCard";
import RandomPicker from "../components/RandomPicker";
import SearchBar from "../components/SearchBar";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { movieApi } from "../lib/api";

function PlaceholderCard() {
  return (
    <div className="cinema-card flex h-full min-h-[420px] flex-col justify-between p-6 sm:p-8">
      <div>
        <span className="glass-pill">Tonight&apos;s shortcut</span>
        <h2 className="mt-5 text-3xl font-bold text-paper">One click. One movie. Less scrolling.</h2>
        <p className="mt-4 max-w-md text-sm leading-7 text-paper/70">
          Use Random Pick for a balanced recommendation or Fast Pick when you want the answer
          immediately while food is on the way.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-paper/45">Includes</p>
          <p className="mt-2 text-lg font-semibold text-paper">Ratings, runtime, trailer</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-paper/45">Regions</p>
          <p className="mt-2 text-lg font-semibold text-paper">United States + India</p>
        </div>
      </div>
    </div>
  );
}

function MovieGrid({ title, subtitle, movies, onSaveToggle, savedIds }) {
  if (!movies.length) {
    return null;
  }

  return (
    <section className="mt-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-paper/45">{subtitle}</p>
          <h2 className="section-title mt-2 text-3xl sm:text-4xl">{title}</h2>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            variant="compact"
            onSaveToggle={onSaveToggle}
            saved={savedIds.has(movie.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [apiMode, setApiMode] = useState("live");
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [currentMovie, setCurrentMovie] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState({
    loading: true,
    searching: false,
    picking: false,
    message: "",
    error: "",
  });
  const [watchLater, setWatchLater] = useLocalStorage("quickpick-watch-later", []);
  const [recentlyPicked, setRecentlyPicked] = useLocalStorage("quickpick-recently-picked", []);

  useEffect(() => {
    let active = true;

    async function loadHome() {
      setStatus((previous) => ({
        ...previous,
        loading: true,
        error: "",
      }));

      try {
        const [healthPayload, genrePayload, trendingPayload] = await Promise.all([
          movieApi.getHealth(),
          movieApi.getGenres(),
          movieApi.getTrending(6),
        ]);

        if (!active) {
          return;
        }

        setApiMode(healthPayload.mode || "live");
        setGenres(genrePayload.genres || []);
        setTrendingMovies(trendingPayload.results || []);
      } catch (error) {
        if (active) {
          setStatus((previous) => ({
            ...previous,
            error: error.message,
          }));
        }
      } finally {
        if (active) {
          setStatus((previous) => ({
            ...previous,
            loading: false,
          }));
        }
      }
    }

    loadHome();

    return () => {
      active = false;
    };
  }, []);

  const savedIds = useMemo(() => new Set(watchLater.map((movie) => movie.id)), [watchLater]);

  function updateRecentlyPicked(movie) {
    setRecentlyPicked((previous) => [
      movie,
      ...previous.filter((entry) => entry.id !== movie.id),
    ].slice(0, 6));
  }

  function toggleWatchLater(movie) {
    setWatchLater((previous) => {
      const exists = previous.some((entry) => entry.id === movie.id);

      if (exists) {
        return previous.filter((entry) => entry.id !== movie.id);
      }

      return [movie, ...previous].slice(0, 12);
    });
  }

  async function fetchPick(mode) {
    setStatus((previous) => ({
      ...previous,
      picking: true,
      message:
        mode === "fast"
          ? "Fast mode is locking in a strong pick..."
          : "Looking for a movie worth watching...",
      error: "",
    }));

    try {
      const movie =
        mode === "fast"
          ? await movieApi.getFastPick(selectedGenre)
          : await movieApi.getRandomMovie(selectedGenre);

      setCurrentMovie(movie);
      updateRecentlyPicked(movie);
    } catch (error) {
      setStatus((previous) => ({
        ...previous,
        error: error.message,
      }));
    } finally {
      setStatus((previous) => ({
        ...previous,
        picking: false,
        message: "",
      }));
    }
  }

  async function handleSearch(query) {
    setSearchQuery(query);
    setStatus((previous) => ({
      ...previous,
      searching: true,
      error: "",
    }));

    try {
      const payload = await movieApi.searchMovies(query);
      setSearchResults(payload.results || []);
    } catch (error) {
      setStatus((previous) => ({
        ...previous,
        error: error.message,
      }));
    } finally {
      setStatus((previous) => ({
        ...previous,
        searching: false,
      }));
    }
  }

  return (
    <main className="cinema-shell">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-paper/45">QuickPick Movie</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-paper/65">
            A fast movie decider built for nights when the menu is easier to pick than the film.
          </p>
        </div>
        <span className="glass-pill">US + India streaming lookup</span>
      </header>

      <SearchBar onSearch={handleSearch} loading={status.searching} />

      {apiMode === "demo" ? (
        <div className="mt-5 rounded-3xl border border-teal/35 bg-teal/10 p-4 text-sm leading-7 text-paper">
          Demo mode is active because TMDB keys are not configured. The app is using a built-in
          sample movie catalog locally. Add `TMDB_API_KEY` later to switch to live data.
        </div>
      ) : null}

      {status.error ? (
        <div className="mt-5 rounded-3xl border border-ember/35 bg-ember/10 p-4 text-sm text-paper">
          {status.error}
        </div>
      ) : null}

      <div className="mt-8">
        <RandomPicker
          genres={genres}
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
          onRandomPick={() => fetchPick("random")}
          onFastPick={() => fetchPick("fast")}
          isLoading={status.picking}
          loadingLabel={status.message}
        >
          {currentMovie ? (
            <MovieCard
              movie={currentMovie}
              onPickAnother={() => fetchPick("random")}
              onSaveToggle={toggleWatchLater}
              saved={savedIds.has(currentMovie.id)}
            />
          ) : (
            <PlaceholderCard />
          )}
        </RandomPicker>
      </div>

      {status.loading ? (
        <div className="mt-14 rounded-3xl border border-white/10 bg-white/5 p-5 text-paper/65">
          Loading movies and genres...
        </div>
      ) : null}

      <MovieGrid
        title="Search Results"
        subtitle="Direct lookup"
        movies={searchResults}
        onSaveToggle={toggleWatchLater}
        savedIds={savedIds}
      />

      {searchQuery && !status.searching && !searchResults.length ? (
        <section className="mt-14 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-paper/45">Direct lookup</p>
          <h2 className="mt-2 text-2xl font-bold text-paper">No matches for “{searchQuery}”</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-paper/65">
            Try the exact movie title, or use the random picker to get a faster recommendation.
          </p>
        </section>
      ) : null}


      <MovieGrid
        title="Trending Tonight"
        subtitle="Popular picks"
        movies={trendingMovies}
        onSaveToggle={toggleWatchLater}
        savedIds={savedIds}
      />

      <MovieGrid
        title="Recently Picked"
        subtitle="Quick history"
        movies={recentlyPicked}
        onSaveToggle={toggleWatchLater}
        savedIds={savedIds}
      />

      <MovieGrid
        title="Watch Later"
        subtitle="Saved for later"
        movies={watchLater}
        onSaveToggle={toggleWatchLater}
        savedIds={savedIds}
      />
    </main>
  );
}
