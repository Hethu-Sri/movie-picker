import { Router } from "express";

import { getMovieProvidersById } from "../services/movieService.js";

const router = Router();

router.get("/:id", async (req, res, next) => {
  try {
    const providers = await getMovieProvidersById(req.params.id);
    res.json(providers);
  } catch (error) {
    next(error);
  }
});

export default router;

