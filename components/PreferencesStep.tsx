"use client";
import { useState } from "react";

interface Preferences {
  cuisineValues: string[];
  price: string;
  radiusMeters: number;
}

interface Props {
  locationName: string;
  onBack: () => void;
  onSearch: (prefs: Preferences) => void;
  error: string | null;
}

const CUISINES = [
  { label: "Burgers", values: ["burger"] },
  { label: "Pizza", values: ["pizza"] },
  { label: "Mexican", values: ["mexican"] },
  { label: "Italian", values: ["italian"] },
  { label: "Chinese", values: ["chinese"] },
  { label: "Japanese / Sushi", values: ["japanese", "sushi"] },
  { label: "American", values: ["american"] },
  { label: "Indian", values: ["indian"] },
  { label: "Mediterranean", values: ["mediterranean"] },
  { label: "Korean", values: ["korean"] },
  { label: "Chicken", values: ["chicken"] },
  { label: "Breakfast", values: ["breakfast"] },
  { label: "Sandwiches", values: ["sandwich"] },
  { label: "Steak", values: ["steak_house"] },
];

const PRICE_OPTIONS = [
  { label: "$", value: "1" },
  { label: "$$", value: "2" },
  { label: "$$$", value: "3" },
  { label: "Any", value: "" },
];

const DISTANCE_OPTIONS = [
  { label: "1 mi", value: 1609 },
  { label: "3 mi", value: 4828 },
  { label: "5 mi", value: 8047 },
  { label: "10 mi", value: 16093 },
];

export default function PreferencesStep({ locationName, onBack, onSearch, error }: Props) {
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [noPreferenceCuisine, setNoPreferenceCuisine] = useState(true);
  const [price, setPrice] = useState("");
  const [radiusMeters, setRadiusMeters] = useState(8047);

  const toggleCuisine = (label: string) => {
    const next = selectedLabels.includes(label)
      ? selectedLabels.filter((l) => l !== label)
      : [...selectedLabels, label];
    setSelectedLabels(next);
    setNoPreferenceCuisine(next.length === 0);
  };

  const selectNoPreference = () => {
    setSelectedLabels([]);
    setNoPreferenceCuisine(true);
  };

  const handleSearch = () => {
    const cuisineValues = CUISINES.filter((c) => selectedLabels.includes(c.label)).flatMap(
      (c) => c.values
    );
    onSearch({ cuisineValues, price, radiusMeters });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-orange-500 text-white px-6 pt-10 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-orange-100 text-sm mb-4 -ml-0.5 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Restaurant Picker</h1>
        <p className="text-orange-100 mt-1 text-sm">Near {locationName}</p>
      </div>

      <div className="flex-1 px-6 py-6 max-w-lg mx-auto w-full space-y-7">

        {/* Cuisine */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-1">What are you in the mood for?</h2>
          <p className="text-gray-500 text-xs mb-3">Select one or more — or choose no preference.</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {CUISINES.map((c) => {
              const active = selectedLabels.includes(c.label);
              return (
                <button
                  key={c.label}
                  onClick={() => toggleCuisine(c.label)}
                  className={`py-3 px-3 rounded-xl text-sm font-medium border transition-all ${
                    active
                      ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                      : "bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={selectNoPreference}
            className={`w-full py-3 px-3 rounded-xl text-sm font-medium border transition-all ${
              noPreferenceCuisine
                ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                : "bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
            }`}
          >
            No preference — surprise me
          </button>
        </section>

        {/* Price */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Price range?</h2>
          <div className="grid grid-cols-4 gap-2">
            {PRICE_OPTIONS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPrice(p.value)}
                className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                  price === p.value
                    ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* Distance */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">How far are you willing to go?</h2>
          <div className="grid grid-cols-4 gap-2">
            {DISTANCE_OPTIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setRadiusMeters(d.value)}
                className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                  radiusMeters === d.value
                    ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSearch}
          className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-4 rounded-2xl transition-colors text-base shadow-sm"
        >
          Find Restaurants
        </button>
      </div>
    </div>
  );
}
