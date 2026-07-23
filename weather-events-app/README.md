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
