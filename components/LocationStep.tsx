"use client";
import { useEffect, useState } from "react";

interface LocationData {
  lat: number;
  lng: number;
  displayName: string;
}

interface Props {
  onNext: (loc: LocationData) => void;
}

export default function LocationStep({ onNext }: Props) {
  const [geoStatus, setGeoStatus] = useState<"detecting" | "detected" | "denied">("detecting");
  const [detected, setDetected] = useState<{ lat: number; lng: number } | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualText, setManualText] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetected({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("detected");
      },
      () => setGeoStatus("denied"),
      { timeout: 10000 }
    );
  }, []);

  const useCurrentLocation = () => {
    if (!detected) return;
    onNext({ ...detected, displayName: "your current location" });
  };

  const geocodeManual = async () => {
    if (!manualText.trim()) return;
    setGeocoding(true);
    setError(null);
    try {
      const res = await fetch(`/api/geocode?text=${encodeURIComponent(manualText.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Location not found");
      onNext(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not find that location. Try being more specific.");
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-orange-500 text-white px-6 pt-12 pb-8">
        <h1 className="text-3xl font-bold tracking-tight">Restaurant Picker</h1>
        <p className="text-orange-100 mt-1 text-sm">Find somewhere great to eat</p>
      </div>

      <div className="flex-1 px-6 py-8 max-w-lg mx-auto w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Where are you?</h2>
        <p className="text-gray-500 text-sm mb-6">We need your location to find nearby restaurants.</p>

        {/* Detecting */}
        {geoStatus === "detecting" && (
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm mb-4">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-gray-600 text-sm">Detecting your location…</span>
          </div>
        )}

        {/* Detected */}
        {geoStatus === "detected" && !showManual && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-200">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700 text-sm font-medium">Location detected</span>
            </div>
            <button
              onClick={useCurrentLocation}
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-4 rounded-2xl transition-colors text-base shadow-sm"
            >
              Use my current location
            </button>
            <button
              onClick={() => setShowManual(true)}
              className="w-full text-orange-600 font-medium text-sm py-2 hover:text-orange-700"
            >
              Enter a different location instead
            </button>
          </div>
        )}

        {/* Denied or manual entry */}
        {(geoStatus === "denied" || showManual) && (
          <div className="space-y-3">
            {geoStatus === "denied" && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <p className="text-amber-800 text-sm">
                  Location access was denied. Enter your city or address below.
                </p>
              </div>
            )}
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && geocodeManual()}
              placeholder="e.g. Topeka, Kansas"
              className="w-full border border-gray-300 rounded-2xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white shadow-sm"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm px-1">{error}</p>}
            <button
              onClick={geocodeManual}
              disabled={geocoding || !manualText.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-orange-300 text-white font-semibold py-4 rounded-2xl transition-colors text-base shadow-sm"
            >
              {geocoding ? "Finding location…" : "Continue"}
            </button>
            {showManual && geoStatus === "detected" && (
              <button
                onClick={() => { setShowManual(false); setError(null); }}
                className="w-full text-gray-500 font-medium text-sm py-2 hover:text-gray-700"
              >
                Back to detected location
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
