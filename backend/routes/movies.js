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

router.get(
  "/genres",
  asyncHandler(async (_req, res) => {
    const genres = await getAvailableGenres();
    res.json({ genres });
  }),
);

router.get(
  "/random-movie",
  asyncHandler(async (req, res) => {
    const movie = await selectRandomMovie({
      genre: req.query.genre,
    });

    res.json(movie);
  }),
);

router.get(
  "/fast-pick",
  asyncHandler(async (req, res) => {
    const movie = await selectFastPick({
      genre: req.query.genre,
    });

    res.json(movie);
  }),
);

router.get(
  "/search",
  asyncHandler(async (req, res) => {
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
  }),
);

router.get(
  "/trending",
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit || 6);
    const results = await getTrendingPicks(limit);

    res.json({
      results,
      total: results.length,
    });
  }),
);

router.get(
  "/movies/:id",
  asyncHandler(async (req, res) => {
    const movie = await hydrateMovieById(req.params.id);
    res.json(movie);
  }),
);

export default router;
