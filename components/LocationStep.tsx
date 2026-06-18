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
    if (!("geolocation" in navigator)) { setGeoStatus("denied"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setDetected({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoStatus("detected"); },
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
      setError(e instanceof Error ? e.message : "Could not find that location.");
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="px-6 pt-14 pb-6 border-b border-gray-800">
        <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Restaurant Picker</p>
        <h1 className="text-4xl font-extrabold text-white leading-tight">Find somewhere<br />great to eat.</h1>
      </div>

      <div className="flex-1 px-6 py-8 max-w-lg mx-auto w-full">
        <h2 className="text-xl font-bold text-white mb-1">Where are you?</h2>
        <p className="text-gray-400 text-sm mb-6">We need your location to find nearby restaurants.</p>

        {geoStatus === "detecting" && (
          <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-2xl border border-gray-800 mb-4">
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-gray-400 text-sm font-medium">Detecting your location…</span>
          </div>
        )}

        {geoStatus === "detected" && !showManual && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-2xl border border-gray-800">
              <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-200 text-sm font-semibold">Location detected</span>
            </div>
            <button onClick={useCurrentLocation} className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-4 rounded-2xl transition-colors text-base">
              Use my current location
            </button>
            <button onClick={() => setShowManual(true)} className="w-full text-gray-500 font-semibold text-sm py-2 hover:text-gray-300">
              Enter a different location
            </button>
          </div>
        )}

        {(geoStatus === "denied" || showManual) && (
          <div className="space-y-3">
            {geoStatus === "denied" && (
              <div className="p-4 bg-gray-900 rounded-2xl border border-gray-700">
                <p className="text-gray-300 text-sm font-medium">Location access was denied. Enter your city or address below.</p>
              </div>
            )}
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && geocodeManual()}
              placeholder="e.g. Topeka, Kansas"
              className="w-full border-2 border-gray-700 bg-gray-900 rounded-2xl px-4 py-3.5 text-white font-medium placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm font-medium px-1">{error}</p>}
            <button
              onClick={geocodeManual}
              disabled={geocoding || !manualText.trim()}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold py-4 rounded-2xl transition-colors text-base"
            >
              {geocoding ? "Finding location…" : "Continue"}
            </button>
            {showManual && geoStatus === "detected" && (
              <button onClick={() => { setShowManual(false); setError(null); }} className="w-full text-gray-500 font-semibold text-sm py-2 hover:text-gray-300">
                Back to detected location
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
