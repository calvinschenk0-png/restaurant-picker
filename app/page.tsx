"use client";
import { useState } from "react";
import LocationStep from "@/components/LocationStep";
import PreferencesStep from "@/components/PreferencesStep";
import ResultsView from "@/components/ResultsView";
import { rankRestaurants } from "@/lib/ranking";
import type { Restaurant } from "@/lib/ranking";

interface LocationData {
  lat: number;
  lng: number;
  displayName: string;
}

interface Preferences {
  cuisineValues: string[];
  price: string;
  radiusMeters: number;
}

type Step = "location" | "preferences" | "loading" | "results";

export default function Home() {
  const [step, setStep] = useState<Step>("location");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleLocationNext = (loc: LocationData) => {
    setLocationData(loc);
    setStep("preferences");
  };

  const handleSearch = async (prefs: Preferences) => {
    if (!locationData) return;
    setStep("loading");
    setSearchError(null);

    try {
      const params = new URLSearchParams({
        lat: locationData.lat.toString(),
        lng: locationData.lng.toString(),
        radiusMeters: prefs.radiusMeters.toString(),
      });
      if (prefs.cuisineValues.length > 0) {
        params.set("cuisines", prefs.cuisineValues.join(","));
      }

      const res = await fetch(`/api/restaurants?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      // Rank once and freeze — this list never changes until the user restarts
      const ranked = rankRestaurants(data.restaurants, prefs.cuisineValues);
      setRestaurants(ranked);
      setStep("results");
    } catch (e: unknown) {
      setSearchError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStep("preferences");
    }
  };

  const handleRestart = () => {
    setStep("location");
    setLocationData(null);
    setRestaurants([]);
    setSearchError(null);
  };

  if (step === "location") {
    return <LocationStep onNext={handleLocationNext} />;
  }

  if (step === "preferences") {
    return (
      <PreferencesStep
        locationName={locationData?.displayName ?? ""}
        onBack={() => setStep("location")}
        onSearch={handleSearch}
        error={searchError}
      />
    );
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-extrabold text-lg">Finding restaurants…</p>
          <p className="text-gray-500 text-sm mt-1 font-medium">This won&apos;t take long.</p>
        </div>
      </div>
    );
  }

  return (
    <ResultsView
      restaurants={restaurants}
      locationName={locationData?.displayName ?? ""}
      onRestart={handleRestart}
    />
  );
}
