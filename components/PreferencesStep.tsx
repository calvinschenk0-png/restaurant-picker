"use client";
import { useState } from "react";

interface Preferences {
  cuisineValues: string[];
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

export default function PreferencesStep({ locationName, onBack, onSearch, error }: Props) {
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [noPreferenceCuisine, setNoPreferenceCuisine] = useState(true);

  const handleToggle = (label: string) => {
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
    const cuisineValues = CUISINES.filter((c) => selectedLabels.includes(c.label)).flatMap((c) => c.values);
    onSearch({ cuisineValues });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="px-6 pt-10 pb-5 border-b border-gray-800">
        <button onClick={onBack} className="flex items-center gap-1 text-gray-500 text-sm font-semibold mb-4 hover:text-gray-300">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Restaurant Picker</p>
        <h1 className="text-3xl font-extrabold text-white leading-tight">What are you<br />in the mood for?</h1>
        <p className="text-gray-500 text-sm mt-1">Near {locationName}</p>
      </div>

      <div className="flex-1 px-6 py-6 max-w-lg mx-auto w-full space-y-7 overflow-y-auto">

        {/* Cuisine */}
        <section>
          <h2 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">Cuisine</h2>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {CUISINES.map((c) => {
              const active = selectedLabels.includes(c.label);
              return (
                <button
                  key={c.label}
                  onClick={() => handleToggle(c.label)}
                  className={`py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all text-left ${
                    active
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-gray-900 border-gray-800 text-gray-300 hover:border-red-800 hover:bg-gray-800"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={selectNoPreference}
            className={`w-full py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
              noPreferenceCuisine
                ? "bg-red-600 border-red-600 text-white"
                : "bg-gray-900 border-gray-800 text-gray-300 hover:border-red-800 hover:bg-gray-800"
            }`}
          >
            No preference — surprise me
          </button>
        </section>

        {error && (
          <div className="p-4 bg-gray-900 border-2 border-red-900 rounded-xl">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={handleSearch}
          className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold py-4 rounded-2xl transition-colors text-base tracking-wide"
        >
          Find Restaurants
        </button>
      </div>
    </div>
  );
}
