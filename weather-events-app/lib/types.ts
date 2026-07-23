export interface Weather {
  tempF: number;
  condition: string;
  isOutdoorFriendly: boolean;
}

export interface EventItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isIndoor: boolean;
  startTime: string;
  url: string;
}

export type EventBadge = "Rainy Day Safe" | "Great Day Out";

export interface RankedEvent extends EventItem {
  badge: EventBadge;
}
