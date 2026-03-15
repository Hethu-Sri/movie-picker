import { useEffect, useMemo, useState } from "react";

import MovieCard from "../components/MovieCard";
import MovieLoader from "../components/MovieLoader";
import RandomPicker from "../components/RandomPicker";
import SearchBar from "../components/SearchBar";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { movieApi } from "../lib/api";

const CATEGORY_OPTIONS = [
  {
    id: "all",
    emoji: "🎲",
    label: "Pick Random",
    description: "Pull one strong movie from the full catalog.",
  },
  {
    id: "fast",
    emoji: "🍿",
    label: "Pick Fast",
    description: "Return one highly rated pick with minimal delay.",
  },
  {
    id: "indian-cinema",
    emoji: "🇮🇳",
    label: "Indian Cinema",
    description: "Hindi, Tamil, Telugu, Malayalam, Kannada and more.",
  },
  {
    id: "hollywood",
    emoji: "🎬",
    label: "Hollywood",
    description: "English-language picks tuned for US-region discovery.",
  },
  {
    id: "world-cinema",
    emoji: "🌍",
    label: "World Cinema",
    description: "Korean, Japanese, French, Spanish, Italian, German.",
  },
];

function getCategoryOption(categoryId) {
  return CATEGORY_OPTIONS.find((option) => option.id === categoryId) || CATEGORY_OPTIONS[0];
}

function buildLoadingMessage(mode, categoryLabel, genre) {
  const baseMessage =
    mode === "fast"
      ? `Scanning ${categoryLabel} for a fast decision pick...`
      : `Picking a ${categoryLabel} recommendation...`;

  return genre ? `${baseMessage} Genre filter: ${genre}.` : baseMessage;
}

function PlaceholderCard({ activeCategory, selectedGenre }) {
  return (
    <div className="cinema-card flex h-full min-h-[420px] flex-col justify-between p-6 sm:p-8">
      <div>
        <span className="glass-pill">Current lane</span>
        <h2 className="mt-5 text-3xl font-bold text-paper">{activeCategory.label}</h2>
        <p className="mt-4 max-w-md text-sm leading-7 text-paper/70">
          {activeCategory.description}
        </p>
        <p className="mt-4 max-w-md text-sm leading-7 text-paper/65">
          {selectedGenre
            ? `Genre filter is set to ${selectedGenre}. Pick a movie to get one clear answer with ratings, runtime, trailer, and stream availability.`
            : "Use the lane buttons to jump straight into Indian Cinema, Hollywood, World Cinema, or a fast overall pick."}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-paper/45">Fast Decision</p>
          <p className="mt-2 text-lg font-semibold text-paper">Ratings + runtime + platforms</p>
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [latestOnly, setLatestOnly] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState({
    bootstrapping: true,
    trending: true,
    searching: false,
    picking: false,
    message: "",
    error: "",
  });
  const [lastPickRequest, setLastPickRequest] = useState({
    category: "all",
    genre: "",
    mode: "random",
  });
  const [watchLater, setWatchLater] = useLocalStorage("quickpick-watch-later", []);
  const [recentlyPicked, setRecentlyPicked] = useLocalStorage("quickpick-recently-picked", []);

  useEffect(() => {
    let active = true;

    async function loadBootstrap() {
      setStatus((previous) => ({
        ...previous,
        bootstrapping: true,
        error: "",
      }));

      try {
        const [healthPayload, genrePayload] = await Promise.all([
          movieApi.getHealth(),
          movieApi.getGenres(),
        ]);

        if (!active) {
          return;
        }

        setApiMode(healthPayload.mode || "live");
        setGenres(genrePayload.genres || []);
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
            bootstrapping: false,
          }));
        }
      }
    }

    loadBootstrap();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadTrending() {
      setStatus((previous) => ({
        ...previous,
        trending: true,
        error: "",
      }));

      try {
        const payload = await movieApi.getTrending(
          6,
          selectedCategory === "all" ? undefined : selectedCategory,
          selectedYear || undefined,
          latestOnly,
        );

        if (!active) {
          return;
        }

        setTrendingMovies(payload.results || []);
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
            trending: false,
          }));
        }
      }
    }

    loadTrending();

    return () => {
      active = false;
    };
  }, [latestOnly, selectedCategory, selectedYear]);

  const activeCategory = useMemo(
    () => getCategoryOption(selectedCategory),
    [selectedCategory],
  );
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

  async function fetchPick(mode, categoryOverride, genreOverride) {
    const nextCategory = categoryOverride || selectedCategory;
    const nextGenre = genreOverride !== undefined ? genreOverride : selectedGenre;
    const nextCategoryOption = getCategoryOption(nextCategory);

    if (nextCategory !== selectedCategory) {
      setSelectedCategory(nextCategory);
    }

    setStatus((previous) => ({
      ...previous,
      picking: true,
      message: buildLoadingMessage(mode, nextCategoryOption.label, nextGenre),
      error: "",
    }));

    try {
      const params = {
        category: nextCategory === "all" ? undefined : nextCategory,
        genre: nextGenre || undefined,
        latest: latestOnly,
        year: selectedYear || undefined,
      };

      const movie =
        mode === "fast"
          ? await movieApi.getFastPick(params)
          : await movieApi.getRandomMovie(params);

      setCurrentMovie(movie);
      updateRecentlyPicked(movie);
      setLastPickRequest({
        mode,
        category: nextCategory,
        genre: nextGenre || "",
      });
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

  async function handleGenreChange(nextGenre) {
    setSelectedGenre(nextGenre);

    if (!nextGenre) {
      return;
    }

    setStatus((previous) => ({
      ...previous,
      picking: true,
      message: `Browsing ${nextGenre} movies in ${activeCategory.label}...`,
      error: "",
    }));

    try {
      const movie = await movieApi.getGenreMovie({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        genre: nextGenre,
        latest: latestOnly,
        year: selectedYear || undefined,
      });

      setCurrentMovie(movie);
      updateRecentlyPicked(movie);
      setLastPickRequest({
        mode: "random",
        category: selectedCategory,
        genre: nextGenre,
      });
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

  const pickerActions = [
    {
      ...getCategoryOption("all"),
      active: selectedCategory === "all",
      onClick: () => fetchPick("random", "all"),
    },
    {
      ...getCategoryOption("fast"),
      active: false,
      onClick: () => fetchPick("fast", selectedCategory),
    },
    {
      ...getCategoryOption("indian-cinema"),
      active: selectedCategory === "indian-cinema",
      onClick: () => fetchPick("random", "indian-cinema"),
    },
    {
      ...getCategoryOption("hollywood"),
      active: selectedCategory === "hollywood",
      onClick: () => fetchPick("random", "hollywood"),
    },
    {
      ...getCategoryOption("world-cinema"),
      active: selectedCategory === "world-cinema",
      onClick: () => fetchPick("random", "world-cinema"),
    },
  ];

  const trendingTitle =
    selectedCategory === "all" ? "Trending Tonight" : `${activeCategory.label} Trending`;
  const trendingSubtitle =
    selectedCategory === "all" ? "Popular picks" : "Popular movies in the active lane";

  return (
    <main className="cinema-shell">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-paper/45">QuickPick Movies</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-paper/65">
            A movie decision app built for the moment food arrives and nobody wants to spend
            another ten minutes comparing ratings and streamers.
          </p>
        </div>
        <span className="glass-pill">US + India streaming lookup</span>
      </header>

      <SearchBar onSearch={handleSearch} loading={status.searching} />

      {apiMode === "demo" ? (
        <div className="mt-5 rounded-3xl border border-teal/35 bg-teal/10 p-4 text-sm leading-7 text-paper">
          Demo mode is active because TMDB keys are not configured. Add TMDB credentials to switch
          to live movie data automatically.
        </div>
      ) : null}

      {status.error ? (
        <div className="mt-5 rounded-3xl border border-ember/35 bg-ember/10 p-4 text-sm text-paper">
          {status.error}
        </div>
      ) : null}

      <div className="mt-8">
        <RandomPicker
          actions={pickerActions}
          genres={genres}
          selectedCategoryLabel={activeCategory.label}
          selectedGenre={selectedGenre}
          selectedYear={selectedYear}
          latestOnly={latestOnly}
          selectionLanguage={currentMovie?.selection?.originalLanguageLabel}
          onGenreChange={handleGenreChange}
          onLatestToggle={setLatestOnly}
          onYearChange={setSelectedYear}
          isLoading={status.picking}
          loadingLabel={status.message}
        >
          {status.picking ? (
            <MovieLoader
              title="Loading your next movie"
              message={status.message || "Finding a strong pick with ratings and streaming options..."}
            />
          ) : currentMovie ? (
            <MovieCard
              movie={currentMovie}
              onPickAnother={() =>
                fetchPick(
                  lastPickRequest.mode,
                  lastPickRequest.category,
                  lastPickRequest.genre,
                )
              }
              onSaveToggle={toggleWatchLater}
              saved={savedIds.has(currentMovie.id)}
            />
          ) : (
            <PlaceholderCard
              activeCategory={activeCategory}
              selectedGenre={selectedGenre}
            />
          )}
        </RandomPicker>
      </div>

      {status.bootstrapping || status.trending ? (
        <div className="mt-14">
          <MovieLoader
            compact
            title="Loading movie lanes"
            message="Fetching genres, live discovery lanes, and trending titles..."
          />
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
            Try the exact movie title, or use one of the category buttons to get a faster pick.
          </p>
        </section>
      ) : null}

      <MovieGrid
        title={trendingTitle}
        subtitle={trendingSubtitle}
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
