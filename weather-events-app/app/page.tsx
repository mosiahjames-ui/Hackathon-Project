"use client";

import { useCallback, useEffect, useState } from "react";
import EventCard from "@/components/EventCard";
import { matchEvents } from "@/lib/matching";
import type { EventItem, RankedEvent, Weather } from "@/lib/types";

const DEFAULT_LOCATION = { lat: 40.7128, lng: -74.006 }; // NYC
const GEO_TIMEOUT_MS = 5000;

interface Coords {
  lat: number;
  lng: number;
}

function getLocation(): Promise<{ coords: Coords; usedDefault: boolean }> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      resolve({ coords: DEFAULT_LOCATION, usedDefault: true });
      return;
    }

    let settled = false;
    const fallback = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve({ coords: DEFAULT_LOCATION, usedDefault: true });
      }
    }, GEO_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (settled) return;
        settled = true;
        clearTimeout(fallback);
        resolve({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          usedDefault: false,
        });
      },
      () => {
        if (settled) return;
        settled = true;
        clearTimeout(fallback);
        resolve({ coords: DEFAULT_LOCATION, usedDefault: true });
      },
      { timeout: GEO_TIMEOUT_MS, maximumAge: 60000 }
    );
  });
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [events, setEvents] = useState<RankedEvent[]>([]);
  const [usedDefaultLocation, setUsedDefaultLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { coords, usedDefault } = await getLocation();
      setUsedDefaultLocation(usedDefault);

      const query = `lat=${coords.lat}&lng=${coords.lng}`;
      const [weatherRes, eventsRes] = await Promise.all([
        fetch(`/api/weather?${query}`).then((r) => r.json()),
        fetch(`/api/events?${query}&radius=25`).then((r) => r.json()),
      ]);

      const w: Weather = weatherRes;
      const rawEvents: EventItem[] = eventsRes?.events ?? [];

      setWeather(w);
      setEvents(matchEvents(w, rawEvents));
    } catch (err) {
      console.error(err);
      setError("Something went wrong loading your feed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 pb-16 pt-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          WeatherEvents
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Events matched to the sky above you.
        </p>
      </header>

      {weather && (
        <section
          className={`mb-6 rounded-2xl p-4 text-white shadow-sm ${
            weather.isOutdoorFriendly
              ? "bg-gradient-to-br from-amber-400 to-orange-500"
              : "bg-gradient-to-br from-slate-600 to-indigo-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm/5 opacity-90">
                {weather.isOutdoorFriendly
                  ? "Great day to be outside"
                  : "Better to stay dry today"}
              </p>
              <p className="text-3xl font-bold">{weather.tempF}°F</p>
              <p className="text-sm opacity-90">{weather.condition}</p>
            </div>
            <div className="text-5xl" aria-hidden>
              {weather.isOutdoorFriendly ? "☀️" : "🌧️"}
            </div>
          </div>
          {usedDefaultLocation && (
            <p className="mt-3 text-xs opacity-80">
              Using default location (NYC) — location unavailable.
            </p>
          )}
        </section>
      )}

      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={load}
            className="mt-3 block rounded-lg bg-red-600 px-3 py-1.5 text-white"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <section className="space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-slate-500">
              No events found nearby right now.
            </p>
          ) : (
            events.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </section>
      )}
    </main>
  );
}
