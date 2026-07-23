import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { Weather } from "@/lib/types";

export const dynamic = "force-dynamic";

const BAD_CONDITIONS = ["rain", "snow", "storm", "thunderstorm", "drizzle"];

function isOutdoorFriendly(condition: string): boolean {
  const c = condition.toLowerCase();
  return !BAD_CONDITIONS.some((bad) => c.includes(bad));
}

// Reasonable fallback so the demo never shows an empty state.
const FALLBACK_WEATHER: Weather = {
  tempF: 72,
  condition: "Clear",
  isOutdoorFriendly: true,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat") ?? "40.7128";
  const lng = searchParams.get("lng") ?? "-74.0060";
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ...FALLBACK_WEATHER, fallback: true });
  }

  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}` +
    `&units=imperial&appid=${apiKey}`;

  try {
    const res = await fetchWithTimeout(url, 3000);
    if (!res.ok) {
      throw new Error(`OpenWeatherMap responded ${res.status}`);
    }

    const data = await res.json();
    const condition: string = data?.weather?.[0]?.main ?? "Clear";
    const tempF: number =
      typeof data?.main?.temp === "number" ? Math.round(data.main.temp) : 72;

    const weather: Weather = {
      tempF,
      condition,
      isOutdoorFriendly: isOutdoorFriendly(condition),
    };

    return NextResponse.json(weather);
  } catch (err) {
    console.error("weather route falling back:", err);
    return NextResponse.json({ ...FALLBACK_WEATHER, fallback: true });
  }
}
