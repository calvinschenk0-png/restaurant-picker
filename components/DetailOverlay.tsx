"use client";
import type { Restaurant } from "@/lib/ranking";

interface Props {
  restaurant: Restaurant;
  onClose: () => void;
}

function formatDistance(meters: number | null): string {
  if (meters === null) return "";
  const miles = meters / 1609.34;
  return miles < 0.1 ? "less than 0.1 mi away" : `${miles.toFixed(1)} mi away`;
}

function formatCuisine(cuisine: string | null): string {
  if (!cuisine) return "";
  return cuisine
    .split(";")
    .map((c) => c.trim().replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()))
    .join(", ");
}

export default function DetailOverlay({ restaurant: r, onClose }: Props) {
  const cuisine = formatCuisine(r.cuisine);
  const distance = formatDistance(r.distanceMeters);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-gray-900 rounded-t-3xl max-h-[85vh] overflow-y-auto border-t border-gray-800">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-700" />
        </div>

        <div className="px-6 pb-10 pt-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-2xl font-extrabold text-white pr-10 leading-tight">{r.name}</h2>

          <div className="flex flex-wrap gap-2 mt-3">
            {cuisine && (
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                {cuisine}
              </span>
            )}
            {distance && (
              <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full">
                {distance}
              </span>
            )}
          </div>

          {r.address && (
            <p className="text-sm text-gray-500 font-medium mt-4 leading-relaxed">{r.address}</p>
          )}

          <div className="mt-6 space-y-3">
            {r.mapsUrl && (
              <a
                href={r.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-4 rounded-2xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Get directions
              </a>
            )}
            {r.googleSearchUrl && (
              <a
                href={r.googleSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-extrabold py-4 rounded-2xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search on Google
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
