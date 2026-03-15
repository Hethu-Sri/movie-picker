# QuickPick Movies

QuickPick Movies is a production-style movie decision app built to cut choice paralysis down to one fast pick. It combines TMDB discovery, OMDb IMDb ratings, and TMDB watch providers so users can see what to watch and where to stream it in the United States and India.

If you do not have API keys yet, the app now runs in a built-in demo mode locally with a curated sample catalog. Add TMDB and OMDb keys later to switch to live data automatically.

## Stack

- Frontend: React, Vite, TailwindCSS
- Backend: Node.js, Express
- APIs: TMDB, OMDb
- Deployment targets: Vercel (frontend), Render or Railway (backend)

## Features

- Random movie picker with category-aware discovery
- Fast decision mode for an immediate recommendation
- Dedicated lanes for Indian Cinema, Hollywood, and World Cinema
- IMDb and TMDB ratings
- Streaming availability in `US` and `IN`
- Search for a specific title
- Dedicated movie detail page with trailer embed
- Local `Watch Later` and `Recently Picked` lists

## Project Structure

```text
frontend/
  src/
    components/
    hooks/
    lib/
    pages/
backend/
  routes/
  services/
```

## Environment Variables

Create local env files from the examples before running the app.

Quick fix if you want live TMDB data instead of demo mode:

```bash
cp backend/.env.example backend/.env
```

Then replace `your_tmdb_api_key` with a real TMDB key and restart `npm run dev`.

### Backend: `backend/.env`

```bash
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
TMDB_API_KEY=your_tmdb_api_key
TMDB_ACCESS_TOKEN=
OMDB_API_KEY=your_omdb_api_key
```

Notes:

- `TMDB_API_KEY` is enough for this app.
- `TMDB_ACCESS_TOKEN` is optional. If present, it is used instead of the API key query parameter.
- `OMDB_API_KEY` is optional but recommended for IMDb ratings and richer plot data.
- The backend also supports loading the same variables from a repo-root `.env`, but `backend/.env` is the clearest local setup.

### Frontend: `frontend/.env`

```bash
VITE_API_BASE_URL=http://localhost:5001/api
```

If you prefer using the Vite proxy in local development, you can omit this file and the frontend will use `/api`.

## Run Locally

Install dependencies from the repo root:

```bash
npm install
```

Start frontend and backend together:

```bash
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`
- Health check: `http://localhost:5001/api/health`

## Discovery Categories

- `all`: any highly rated movie
- `indian-cinema`: random language from `hi`, `ta`, `te`, `ml`, `kn`, `bn`, `mr`, `pa`
- `hollywood`: `with_original_language=en` and `region=US`
- `world-cinema`: random language from `ko`, `ja`, `fr`, `es`, `it`, `de`

## API Endpoints

- `GET /api/health`
- `GET /api/genres`
- `GET /api/random?category=indian-cinema&genre=Drama`
- `GET /api/genre?category=world-cinema&genre=Thriller`
- `GET /api/fast-pick?category=hollywood`
- `GET /api/search?q=interstellar`
- `GET /api/trending?limit=6&category=world-cinema`
- `GET /api/movie/:id`
- `GET /api/providers/:id`

Backward-compatible aliases still exist for the older routes:

- `GET /api/random-movie`
- `GET /api/fast`
- `GET /api/movies/:id`

Example response shape:

```json
{
  "id": 27205,
  "title": "Inception",
  "year": 2010,
  "originalLanguage": "en",
  "genres": ["Action", "Science Fiction", "Adventure"],
  "runtime": 148,
  "ratings": {
    "imdb": 8.8,
    "tmdb": 8.4
  },
  "poster": "https://image.tmdb.org/t/p/w500/...",
  "platforms": {
    "US": ["Netflix", "Max"],
    "IN": ["Prime Video", "JioHotstar"]
  },
  "selection": {
    "categoryId": "hollywood",
    "categoryLabel": "Hollywood",
    "originalLanguage": "en",
    "originalLanguageLabel": "English",
    "fastMode": false
  }
}
```

## Deployment

### Frontend on Vercel

Configure the Vercel project with:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://your-backend-domain/api`

`frontend/vercel.json` is included to rewrite all routes to `index.html`.

### Backend on Render

Two options:

- Use the included [`render.yaml`](/Users/hethusri/movie-picker/render.yaml)
- Create a Render Web Service manually with:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Required backend env vars:

- `FRONTEND_URL=https://your-vercel-domain.vercel.app`
- `TMDB_API_KEY`
- `OMDB_API_KEY`

### Backend on Railway

Create a Node service pointing to the `backend` directory and set the same environment variables as Render.

## Notes

- Streaming availability uses TMDB watch providers, which is an official TMDB data source and avoids scraping.
- The backend caches TMDB and OMDb responses in memory to reduce duplicate API calls and improve fast-pick response times.
- When OMDb is not configured, the UI still works and falls back to TMDB ratings.
- When TMDB is not configured, the app falls back to the built-in demo catalog for local UI development.
