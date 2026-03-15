import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import moviesRouter from "./routes/movies.js";
import providersRouter from "./routes/providers.js";
import { hasTmdbCredentials } from "./services/tmdbService.js";

const backendDir = dirname(fileURLToPath(import.meta.url));

// Support either repo-root .env or backend/.env in local development.
dotenv.config({ path: resolve(backendDir, "../.env") });
dotenv.config({ path: resolve(backendDir, ".env"), override: true });

const app = express();
const port = Number(process.env.PORT || 5001);

function getAllowedOrigins() {
  const rawOrigins = process.env.FRONTEND_URL?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (rawOrigins?.length) {
    return rawOrigins;
  }

  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return [];
}

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(compression());
app.use(
  cors({
    origin: getAllowedOrigins(),
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    mode: hasTmdbCredentials() ? "live" : "demo",
    status: "ok",
    tmdbConfigured: hasTmdbCredentials(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", moviesRouter);
app.use("/api/providers", providersRouter);

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message =
    statusCode >= 500 && process.env.NODE_ENV === "production"
      ? "Unable to process request right now."
      : err.message || "Unexpected server error.";

  console.error(err);

  res.status(statusCode).json({
    message,
    statusCode,
  });
});

app.listen(port, () => {
  console.log(`QuickPick Movies API listening on port ${port}`);

  if (!hasTmdbCredentials()) {
    console.warn(
      "TMDB is not configured. Serving the built-in demo catalog. Add TMDB_API_KEY or TMDB_ACCESS_TOKEN to switch to live data.",
    );
  }
});
