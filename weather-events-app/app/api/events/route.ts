import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import fallbackEvents from "@/data/fallback-events.json";
import type { EventItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const OUTDOOR_HINTS = ["festival", "outdoor", "fair", "parade", "park"];
const INDOOR_SEGMENTS = ["music", "arts & theatre", "arts", "theatre", "film"];

/**
 * Infer whether an event is indoor.
 * Music/arts segments default to indoor, unless a name/classification hints
 * at an explicitly outdoor experience (festival, fair, park, etc.).
 */
function inferIsIndoor(event: any): boolean {
  const classification = event?.classifications?.[0] ?? {};
  const segment: string = (classification?.segment?.name ?? "").toLowerCase();
  const genre: string = (classification?.genre?.name ?? "").toLowerCase();
  const name: string = (event?.name ?? "").toLowerCase();

  const haystack = `${segment} ${genre} ${name}`;
  const looksOutdoor = OUTDOOR_HINTS.some((hint) => haystack.includes(hint));
  if (looksOutdoor) {
    return false;
  }

  const looksIndoor = INDOOR_SEGMENTS.some((seg) => segment.includes(seg));
  // Sports and everything else default to indoor arenas for this demo.
  return looksIndoor || segment === "sports" || segment === "";
}

function mapEvent(event: any): EventItem {
  const venue = event?._embedded?.venues?.[0];
  const lat = Number(venue?.location?.latitude);
  const lng = Number(venue?.location?.longitude);

  return {
    id: String(event?.id ?? crypto.randomUUID()),
    name: String(event?.name ?? "Untitled Event"),
    lat: Number.isFinite(lat) ? lat : 40.7128,
    lng: Number.isFinite(lng) ? lng : -74.006,
    isIndoor: inferIsIndoor(event),
    startTime: String(
      event?.dates?.start?.dateTime ??
        event?.dates?.start?.localDate ??
        new Date().toISOString()
    ),
    url: String(event?.url ?? ""),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat") ?? "40.7128";
  const lng = searchParams.get("lng") ?? "-74.0060";
  const radius = searchParams.get("radius") ?? "25";
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      events: fallbackEvents as EventItem[],
      fallback: true,
    });
  }

  const url =
    `https://app.ticketmaster.com/discovery/v2/events.json` +
    `?apikey=${apiKey}` +
    `&latlong=${encodeURIComponent(`${lat},${lng}`)}` +
    `&radius=${encodeURIComponent(radius)}&unit=miles` +
    `&sort=date,asc&size=20`;

  try {
    const res = await fetchWithTimeout(url, 3000);
    if (!res.ok) {
      throw new Error(`Ticketmaster responded ${res.status}`);
    }

    const data = await res.json();
    const rawEvents: any[] = data?._embedded?.events ?? [];

    if (rawEvents.length === 0) {
      return NextResponse.json({
        events: fallbackEvents as EventItem[],
        fallback: true,
      });
    }

    const events = rawEvents.map(mapEvent);
    return NextResponse.json({ events, fallback: false });
  } catch (err) {
    console.error("events route falling back:", err);
    return NextResponse.json({
      events: fallbackEvents as EventItem[],
      fallback: true,
    });
  }
}
