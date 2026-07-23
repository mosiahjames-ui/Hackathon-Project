# WeatherEvents

A Next.js 14 (App Router) PWA that finds nearby events and matches them to the
current weather — indoor events get boosted on rainy days, outdoor events on
clear days.

## Features

- **Geolocation** via the browser HTML5 API with a 5s timeout and NYC fallback
  (`40.7128, -74.0060`).
- **Weather** from OpenWeatherMap via a server route (`/api/weather`), returning
  `{ tempF, condition, isOutdoorFriendly }`.
- **Events** from the Ticketmaster Discovery API via a server route
  (`/api/events`), mapped to a simplified shape with indoor/outdoor inference.
- **Resilient fallbacks** — both routes catch errors/timeouts (>3s) and serve
  `data/fallback-events.json` (10 realistic NYC events).
- **Weather-aware ranking** with "Rainy Day Safe" / "Great Day Out" badges.
- **Mobile-first Tailwind UI** with a card feed and Google Maps "Get Directions"
  deep links.
- **Installable PWA** (manifest + service worker).

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then add your API keys
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable                | Description                          |
| ----------------------- | ------------------------------------ |
| `OPENWEATHER_API_KEY`   | OpenWeatherMap current weather key   |
| `TICKETMASTER_API_KEY`  | Ticketmaster Discovery API key       |

> Without keys, the app automatically serves fallback data, so the demo still
> works end-to-end.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm start` — run the production build

## Deployment

This app has server-side API routes, so it needs a Node/serverless host (not a
static-only host like GitHub Pages). The app lives in the `weather-events-app/`
subfolder, so set the project's **Root Directory** to `weather-events-app`.

Set `OPENWEATHER_API_KEY` and `TICKETMASTER_API_KEY` in the host's environment.
Geolocation only works over HTTPS (all hosts below provide it automatically).

### Vercel

Dashboard: import the GitHub repo at [vercel.com/new](https://vercel.com/new),
set **Root Directory** to `weather-events-app`, add the two env vars, deploy.

CLI:

```bash
cd weather-events-app
npx vercel                       # link/create project, choose this folder as root
npx vercel env add OPENWEATHER_API_KEY
npx vercel env add TICKETMASTER_API_KEY
npx vercel --prod                # production deploy
```

### Docker / self-host

Uses Next.js `output: "standalone"` for a small image.

```bash
cd weather-events-app
docker build -t weatherevents .
docker run -p 3000:3000 \
  -e OPENWEATHER_API_KEY=your_key \
  -e TICKETMASTER_API_KEY=your_key \
  weatherevents
```

The same build works on Render, Railway, Fly.io, or any VPS.
