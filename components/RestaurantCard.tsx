"use client";
import type { Restaurant } from "@/lib/ranking";

interface Props {
  restaurant: Restaurant;
  onTap: () => void;
  rank?: number;
}

function formatDistance(meters: number | null): string {
  if (meters === null) return "";
  const miles = meters / 1609.34;
  return miles < 0.1 ? "< 0.1 mi" : `${miles.toFixed(1)} mi`;
}

function formatCuisine(cuisine: string | null): string {
  if (!cuisine) return "";
  const first = cuisine.split(";")[0].trim();
  return first.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RestaurantCard({ restaurant: r, onTap, rank }: Props) {
  const distance = formatDistance(r.distanceMeters);
  const cuisine = formatCuisine(r.cuisine);
  const isTop = rank !== undefined;

  return (
    <button
      onClick={onTap}
      className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
        isTop
          ? "bg-white border-orange-200 hover:border-orange-400 hover:bg-orange-50 active:bg-orange-100"
          : "bg-white border-gray-100 hover:border-orange-300 hover:bg-orange-50 active:bg-orange-100"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {isTop && (
          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-extrabold">{rank}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className={`font-bold text-gray-900 leading-tight truncate ${isTop ? "text-base" : "text-sm"}`}>{r.name}</h3>
          <div className="flex flex-wrap items-center gap-x-2 mt-1">
            {cuisine && (
              <span className="text-xs font-bold text-orange-500">{cuisine}</span>
            )}
            {cuisine && distance && <span className="text-gray-300 text-xs">·</span>}
            {distance && (
              <span className="text-xs font-semibold text-gray-400">{distance} away</span>
            )}
          </div>
          {r.address && (
            <p className="text-xs text-gray-400 mt-1 truncate">{r.address}</p>
          )}
        </div>
        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
