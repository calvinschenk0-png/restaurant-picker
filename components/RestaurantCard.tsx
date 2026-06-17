"use client";
import type { Restaurant } from "@/lib/ranking";

interface Props {
  restaurant: Restaurant;
  onTap: () => void;
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

export default function RestaurantCard({ restaurant: r, onTap }: Props) {
  const distance = formatDistance(r.distanceMeters);
  const cuisine = formatCuisine(r.cuisine);

  return (
    <button
      onClick={onTap}
      className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left hover:shadow-md hover:border-orange-200 active:scale-[0.99] transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
            {r.name}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            {cuisine && (
              <span className="text-xs text-orange-600 font-medium">{cuisine}</span>
            )}
            {cuisine && distance && (
              <span className="text-gray-300 text-xs">·</span>
            )}
            {distance && (
              <span className="text-xs text-gray-500">{distance} away</span>
            )}
          </div>
          {r.address && (
            <p className="text-xs text-gray-400 mt-1 truncate">{r.address}</p>
          )}
        </div>
        <svg
          className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
