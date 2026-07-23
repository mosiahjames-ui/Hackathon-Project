import type { EventItem, RankedEvent, Weather } from "./types";

/**
 * Sort events based on the current weather.
 *
 * - When the weather is NOT outdoor friendly (rain/snow/storm), indoor events
 *   are ranked first and every event gets a "Rainy Day Safe" badge.
 * - When the weather IS outdoor friendly, outdoor events are ranked first and
 *   every event gets a "Great Day Out" badge.
 *
 * A stable secondary sort by start time keeps the feed deterministic.
 */
export function matchEvents(
  weather: Weather,
  events: EventItem[]
): RankedEvent[] {
  const preferIndoor = !weather.isOutdoorFriendly;
  const badge = preferIndoor ? "Rainy Day Safe" : "Great Day Out";

  const byPreference = [...events].sort((a, b) => {
    const aPreferred = a.isIndoor === preferIndoor;
    const bPreferred = b.isIndoor === preferIndoor;

    if (aPreferred !== bPreferred) {
      return aPreferred ? -1 : 1;
    }

    const aTime = Date.parse(a.startTime) || 0;
    const bTime = Date.parse(b.startTime) || 0;
    return aTime - bTime;
  });

  return byPreference.map((event) => ({ ...event, badge }));
}
