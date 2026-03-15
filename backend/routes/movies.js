import { Router } from "express";

import {
  getAvailableGenres,
  getTrendingPicks,
  hydrateMovieById,
  searchHydratedMovies,
  selectFastPick,
  selectRandomMovie,
} from "../services/movieService.js";

const router = Router();

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function getDiscoveryParams(req) {
  return {
    category: req.query.category,
    genre: req.query.genre,
    latest: req.query.latest,
    year: req.query.year,
  };
}

const handleGenres = asyncHandler(async (_req, res) => {
  const genres = await getAvailableGenres();
  res.json({ genres });
});

const handleRandomMovie = asyncHandler(async (req, res) => {
  const movie = await selectRandomMovie(getDiscoveryParams(req));
  res.json(movie);
});

const handleFastPick = asyncHandler(async (req, res) => {
  const movie = await selectFastPick(getDiscoveryParams(req));
  res.json(movie);
});

const handleGenrePick = asyncHandler(async (req, res) => {
  if (!req.query.genre?.trim()) {
    return res.status(400).json({
      message: 'Query parameter "genre" is required.',
    });
  }

  const movie = await selectRandomMovie(getDiscoveryParams(req));
  res.json(movie);
});

const handleSearch = asyncHandler(async (req, res) => {
  const query = req.query.q?.trim();
  const limit = Number(req.query.limit || 6);

  if (!query) {
    return res.status(400).json({
      message: 'Query parameter "q" is required.',
    });
  }

  const results = await searchHydratedMovies(query, limit);
  res.json({
    query,
    results,
    total: results.length,
  });
});

const handleTrending = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit || 6);
  const results = await getTrendingPicks(limit, {
    category: req.query.category,
    latest: req.query.latest,
    year: req.query.year,
  });

  res.json({
    results,
    total: results.length,
  });
});

const handleMovieDetails = asyncHandler(async (req, res) => {
  const movie = await hydrateMovieById(req.params.id);
  res.json(movie);
});

router.get("/genres", handleGenres);
router.get("/random", handleRandomMovie);
router.get("/random-movie", handleRandomMovie);
router.get("/fast", handleFastPick);
router.get("/fast-pick", handleFastPick);
router.get("/genre", handleGenrePick);
router.get("/search", handleSearch);
router.get("/trending", handleTrending);
router.get("/movie/:id", handleMovieDetails);
router.get("/movies/:id", handleMovieDetails);

export default router;
