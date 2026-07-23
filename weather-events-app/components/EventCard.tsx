import type { RankedEvent } from "@/lib/types";

function directionsUrl(event: RankedEvent): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`;
}

function formatTime(startTime: string): string {
  const date = new Date(startTime);
  if (Number.isNaN(date.getTime())) return "Time TBA";
  return date.toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EventCard({ event }: { event: RankedEvent }) {
  const rainySafe = event.badge === "Rainy Day Safe";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">
            {event.name}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {formatTime(event.startTime)} ·{" "}
            {event.isIndoor ? "Indoor" : "Outdoor"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            rainySafe
              ? "bg-indigo-100 text-indigo-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {event.badge}
        </span>
      </div>

      <a
        href={directionsUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark active:scale-[0.99]"
      >
        Get Directions
      </a>
    </article>
  );
}
