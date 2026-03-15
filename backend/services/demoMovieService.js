const DEMO_GENRES = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 53, name: "Thriller" },
  { id: 27, name: "Horror" },
  { id: 878, name: "Science Fiction" },
  { id: 10749, name: "Romance" },
  { id: 18, name: "Drama" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toDataUrl(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function createArtwork({ title, subtitle, width, height, primary, secondary, accent }) {
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  const titleSize = width > 1200 ? 84 : 72;
  const subtitleSize = width > 1200 ? 26 : 22;

  return toDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="42" fill="url(#bg)" />
      <circle cx="${Math.round(width * 0.82)}" cy="${Math.round(height * 0.2)}" r="${Math.round(width * 0.16)}" fill="${accent}" fill-opacity="0.18" />
      <circle cx="${Math.round(width * 0.18)}" cy="${Math.round(height * 0.78)}" r="${Math.round(width * 0.12)}" fill="${accent}" fill-opacity="0.14" />
      <path d="M0 ${Math.round(height * 0.68)} C ${Math.round(width * 0.2)} ${Math.round(height * 0.6)}, ${Math.round(width * 0.45)} ${Math.round(height * 0.84)}, ${width} ${Math.round(height * 0.7)} L ${width} ${height} L 0 ${height} Z" fill="${accent}" fill-opacity="0.14" />
      <text x="${Math.round(width * 0.08)}" y="${Math.round(height * 0.2)}" fill="#F5F0EA" font-family="Georgia, serif" font-size="${subtitleSize}" letter-spacing="4">${safeSubtitle}</text>
      <text x="${Math.round(width * 0.08)}" y="${Math.round(height * 0.74)}" fill="#F5F0EA" font-family="Arial, sans-serif" font-size="${titleSize}" font-weight="700">${safeTitle}</text>
    </svg>
  `);
}

function createPoster(title, year, palette) {
  return createArtwork({
    title,
    subtitle: year,
    width: 900,
    height: 1350,
    ...palette,
  });
}

function createBackdrop(title, genres, palette) {
  return createArtwork({
    title,
    subtitle: genres.join(" / "),
    width: 1600,
    height: 900,
    ...palette,
  });
}

function createProviders(names = []) {
  return names.map((name) => ({
    id: slugify(name),
    name,
    logo: null,
  }));
}

function buildPlatforms(providers) {
  return Object.fromEntries(
    Object.entries(providers).map(([region, details]) => [
      region,
      details.streaming.map((provider) => provider.name),
    ]),
  );
}

function normalizeGenreInput(genre) {
  if (!genre) {
    return "";
  }

  const normalized = String(genre).trim().toLowerCase();

  if (["sci-fi", "scifi", "science fiction"].includes(normalized)) {
    return "Science Fiction";
  }

  const match = DEMO_GENRES.find((entry) => entry.name.toLowerCase() === normalized);
  return match?.name || "";
}

function normalizeQuery(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function createTrailer(title) {
  return {
    key: null,
    name: `${title} trailer search`,
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} official trailer`)}`,
    embedUrl: null,
  };
}

const RAW_MOVIES = [
  {
    id: 1001,
    title: "Inception",
    year: 2010,
    releaseDate: "2010-07-16",
    overview: "A dream-heist specialist is hired for one last impossible job: planting an idea instead of stealing one.",
    plot: "Dom Cobb leads a crew through layered dream worlds where time stretches, memories interfere, and one planted thought could buy his way home.",
    genres: ["Action", "Science Fiction", "Adventure"],
    runtime: 148,
    ratings: { imdb: 8.8, tmdb: 8.4 },
    contentRating: "PG-13",
    usPlatforms: ["Netflix", "Max"],
    inPlatforms: ["Prime Video", "JioHotstar"],
    palette: { primary: "#0F172A", secondary: "#1D4ED8", accent: "#F59E0B" },
  },
  {
    id: 1002,
    title: "Palm Springs",
    year: 2020,
    releaseDate: "2020-07-10",
    overview: "Two wedding guests get trapped in a looping day and turn cosmic frustration into offbeat romance.",
    plot: "A jaded drifter and a reluctant bridesmaid keep reliving the same desert wedding, forcing them to choose between endless detours and actual change.",
    genres: ["Comedy", "Romance", "Science Fiction"],
    runtime: 90,
    ratings: { imdb: 7.4, tmdb: 7.3 },
    contentRating: "R",
    usPlatforms: ["Hulu"],
    inPlatforms: ["Prime Video"],
    palette: { primary: "#7C2D12", secondary: "#FB7185", accent: "#FDE68A" },
  },
  {
    id: 1003,
    title: "Get Out",
    year: 2017,
    releaseDate: "2017-02-24",
    overview: "A weekend visit with his girlfriend's family turns into a social nightmare with something far darker underneath.",
    plot: "Chris expects awkward introductions and subtle tension, but the deeper he looks into the estate around him, the more terrifying its real purpose becomes.",
    genres: ["Horror", "Thriller"],
    runtime: 104,
    ratings: { imdb: 7.8, tmdb: 7.6 },
    contentRating: "R",
    usPlatforms: ["Peacock", "Prime Video"],
    inPlatforms: ["Netflix", "Prime Video"],
    palette: { primary: "#111827", secondary: "#374151", accent: "#EF4444" },
  },
  {
    id: 1004,
    title: "Arrival",
    year: 2016,
    releaseDate: "2016-11-11",
    overview: "A linguist is brought in when alien vessels appear around the world and time itself starts to feel different.",
    plot: "Louise Banks races to understand a mysterious language while the pressure of global panic turns first contact into a test of empathy and perception.",
    genres: ["Drama", "Science Fiction", "Thriller"],
    runtime: 116,
    ratings: { imdb: 7.9, tmdb: 7.6 },
    contentRating: "PG-13",
    usPlatforms: ["Paramount+", "Prime Video"],
    inPlatforms: ["Netflix", "Sony LIV"],
    palette: { primary: "#0F172A", secondary: "#475569", accent: "#22D3EE" },
  },
  {
    id: 1005,
    title: "Mad Max: Fury Road",
    year: 2015,
    releaseDate: "2015-05-15",
    overview: "A breakneck desert escape turns into a war rig chase across a scorched wasteland.",
    plot: "Max and Furiosa form an uneasy alliance as they outrun a brutal tyrant, an army of fanatics, and the collapse of whatever order still exists.",
    genres: ["Action", "Adventure", "Science Fiction"],
    runtime: 120,
    ratings: { imdb: 8.1, tmdb: 7.6 },
    contentRating: "R",
    usPlatforms: ["Max", "Prime Video"],
    inPlatforms: ["JioHotstar", "Prime Video"],
    palette: { primary: "#7C2D12", secondary: "#EA580C", accent: "#FCD34D" },
  },
  {
    id: 1006,
    title: "La La Land",
    year: 2016,
    releaseDate: "2016-12-09",
    overview: "A pianist and an aspiring actor chase ambition and love through a modern musical version of Los Angeles.",
    plot: "Mia and Sebastian keep choosing each other and their careers in different combinations, learning that timing can be as decisive as talent.",
    genres: ["Romance", "Drama", "Comedy"],
    runtime: 128,
    ratings: { imdb: 8.0, tmdb: 7.9 },
    contentRating: "PG-13",
    usPlatforms: ["Prime Video", "Hulu"],
    inPlatforms: ["Netflix", "Lionsgate Play"],
    palette: { primary: "#312E81", secondary: "#C026D3", accent: "#FDE68A" },
  },
  {
    id: 1007,
    title: "Spider-Man: Into the Spider-Verse",
    year: 2018,
    releaseDate: "2018-12-14",
    overview: "Miles Morales discovers that becoming Spider-Man means learning from versions of the hero from every corner of the multiverse.",
    plot: "A teenager from Brooklyn inherits a heroic burden just as the walls between dimensions start collapsing and a whole team of Spider-people arrives to help.",
    genres: ["Animation", "Action", "Adventure"],
    runtime: 117,
    ratings: { imdb: 8.4, tmdb: 8.3 },
    contentRating: "PG",
    usPlatforms: ["Netflix"],
    inPlatforms: ["Netflix", "Sony LIV"],
    palette: { primary: "#1E3A8A", secondary: "#7C3AED", accent: "#38BDF8" },
  },
  {
    id: 1008,
    title: "Knives Out",
    year: 2019,
    releaseDate: "2019-11-27",
    overview: "A private detective sorts through a wealthy family's stories after a celebrated novelist dies under suspicious circumstances.",
    plot: "Each relative seems polished until the details stop lining up, and Benoit Blanc pulls at the smallest lies until the entire household starts unraveling.",
    genres: ["Comedy", "Thriller", "Drama"],
    runtime: 130,
    ratings: { imdb: 7.9, tmdb: 7.8 },
    contentRating: "PG-13",
    usPlatforms: ["Netflix"],
    inPlatforms: ["Netflix"],
    palette: { primary: "#1F2937", secondary: "#92400E", accent: "#FBBF24" },
  },
  {
    id: 1009,
    title: "Coco",
    year: 2017,
    releaseDate: "2017-11-22",
    overview: "A music-loving boy slips into the Land of the Dead and finds the family story he never knew he was part of.",
    plot: "Miguel follows a forbidden song across an afterlife bursting with color, where memory, legacy, and forgiveness shape every step back home.",
    genres: ["Animation", "Adventure", "Drama"],
    runtime: 105,
    ratings: { imdb: 8.4, tmdb: 8.2 },
    contentRating: "PG",
    usPlatforms: ["Disney+"],
    inPlatforms: ["Disney+ Hotstar"],
    palette: { primary: "#134E4A", secondary: "#0EA5E9", accent: "#F59E0B" },
  },
  {
    id: 1010,
    title: "Dune",
    year: 2021,
    releaseDate: "2021-10-22",
    overview: "A noble heir is thrust into a desert conflict that could shape the future of an entire empire.",
    plot: "Paul Atreides lands on Arrakis as politics, prophecy, and survival collide, forcing him toward a destiny he never asked to inherit.",
    genres: ["Action", "Adventure", "Science Fiction"],
    runtime: 155,
    ratings: { imdb: 8.0, tmdb: 7.8 },
    contentRating: "PG-13",
    usPlatforms: ["Max"],
    inPlatforms: ["Prime Video", "JioCinema"],
    palette: { primary: "#451A03", secondary: "#A16207", accent: "#FDE68A" },
  },
  {
    id: 1011,
    title: "The Martian",
    year: 2015,
    releaseDate: "2015-10-02",
    overview: "A stranded astronaut turns science, humor, and stubbornness into a plan for survival on Mars.",
    plot: "Mark Watney is left for dead after a violent storm, then starts farming, engineering, and improvising his way through one impossible problem after another.",
    genres: ["Adventure", "Drama", "Science Fiction"],
    runtime: 144,
    ratings: { imdb: 8.0, tmdb: 7.7 },
    contentRating: "PG-13",
    usPlatforms: ["Hulu", "Disney+"],
    inPlatforms: ["Disney+ Hotstar"],
    palette: { primary: "#7C2D12", secondary: "#DC2626", accent: "#FBBF24" },
  },
  {
    id: 1012,
    title: "Parasite",
    year: 2019,
    releaseDate: "2019-11-08",
    overview: "A struggling family slowly inserts itself into an elite household until every role becomes impossible to hold.",
    plot: "What begins as a sly hustle becomes a sharp class thriller where every room, secret, and favor carries a cost.",
    genres: ["Thriller", "Drama", "Comedy"],
    runtime: 132,
    ratings: { imdb: 8.5, tmdb: 8.5 },
    contentRating: "R",
    usPlatforms: ["Hulu", "Max"],
    inPlatforms: ["Prime Video", "MUBI"],
    palette: { primary: "#14532D", secondary: "#065F46", accent: "#A7F3D0" },
  },
];

const DEMO_MOVIES = RAW_MOVIES.map((movie) => {
  const providers = {
    US: {
      link: null,
      streaming: createProviders(movie.usPlatforms),
      rent: [],
      buy: [],
    },
    IN: {
      link: null,
      streaming: createProviders(movie.inPlatforms),
      rent: [],
      buy: [],
    },
  };

  return {
    id: movie.id,
    title: movie.title,
    year: movie.year,
    releaseDate: movie.releaseDate,
    overview: movie.overview,
    plot: movie.plot,
    genres: movie.genres,
    runtime: movie.runtime,
    ratings: movie.ratings,
    contentRating: movie.contentRating,
    poster: createPoster(movie.title, movie.year, movie.palette),
    backdrop: createBackdrop(movie.title, movie.genres, movie.palette),
    imdbId: null,
    trailer: createTrailer(movie.title),
    providers,
    platforms: buildPlatforms(providers),
    availableToStream: true,
    source: "demo",
  };
});

function getGenreFilteredMovies(genre) {
  if (!genre) {
    return DEMO_MOVIES;
  }

  const normalizedGenre = normalizeGenreInput(genre);

  if (!normalizedGenre) {
    const error = new Error(`Unknown genre "${genre}".`);
    error.statusCode = 400;
    throw error;
  }

  return DEMO_MOVIES.filter((movie) => movie.genres.includes(normalizedGenre));
}

function getMovieById(movieId) {
  const movie = DEMO_MOVIES.find((entry) => String(entry.id) === String(movieId));

  if (!movie) {
    const error = new Error("Movie not found in demo catalog.");
    error.statusCode = 404;
    throw error;
  }

  return movie;
}

export function getDemoGenres() {
  return DEMO_GENRES;
}

export function getDemoMovieById(movieId) {
  return getMovieById(movieId);
}

export function getDemoProvidersById(movieId) {
  return getMovieById(movieId).providers;
}

export function getDemoRandomMovie({ genre } = {}) {
  const pool = getGenreFilteredMovies(genre);
  return pickRandom(pool);
}

export function getDemoFastPick({ genre } = {}) {
  const pool = [...getGenreFilteredMovies(genre)];
  const sortedPool = pool.sort((left, right) => {
    const leftScore = left.ratings.imdb * 2 + left.ratings.tmdb - left.runtime / 100;
    const rightScore = right.ratings.imdb * 2 + right.ratings.tmdb - right.runtime / 100;
    return rightScore - leftScore;
  });

  return sortedPool[0];
}

export function searchDemoMovies(query, limit = 6) {
  const normalizedQuery = normalizeQuery(query);

  const results = DEMO_MOVIES.filter((movie) => {
    const haystack = normalizeQuery(
      `${movie.title} ${movie.genres.join(" ")} ${movie.overview} ${movie.plot}`,
    );

    return haystack.includes(normalizedQuery);
  }).sort((left, right) => {
    const leftStartsWith = normalizeQuery(left.title).startsWith(normalizedQuery);
    const rightStartsWith = normalizeQuery(right.title).startsWith(normalizedQuery);

    if (leftStartsWith !== rightStartsWith) {
      return leftStartsWith ? -1 : 1;
    }

    return right.ratings.imdb - left.ratings.imdb;
  });

  return results.slice(0, limit);
}

export function getDemoTrending(limit = 6) {
  return [...DEMO_MOVIES]
    .sort((left, right) => right.ratings.imdb - left.ratings.imdb)
    .slice(0, limit);
}

