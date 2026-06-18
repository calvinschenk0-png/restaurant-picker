"use client";
import { useEffect, useRef, useState } from "react";
import type { Restaurant } from "@/lib/ranking";
import DetailOverlay from "@/components/DetailOverlay";

const COLORS = [
  "#dc2626", "#f97316", "#eab308", "#22c55e", "#3b82f6",
  "#a855f7", "#ec4899", "#14b8a6", "#f43f5e", "#8b5cf6",
  "#fb923c", "#84cc16", "#06b6d4", "#e879f9",
];

interface Props {
  restaurants: Restaurant[];
}

const EMPTY = "· · ·";

export default function SlotMachine({ restaurants }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(restaurants.slice(0, 5).map((r) => r.id))
  );
  const [spinning, setSpinning] = useState(false);
  const [reelNames, setReelNames] = useState<[string, string, string]>([EMPTY, EMPTY, EMPTY]);
  const [locked, setLocked] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [overlayRestaurant, setOverlayRestaurant] = useState<Restaurant | null>(null);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const wheelItems = restaurants.filter((r) => selected.has(r.id));

  const reset = () => {
    setWinner(null);
    setReelNames([EMPTY, EMPTY, EMPTY]);
    setLocked([false, false, false]);
  };

  const pull = () => {
    if (spinning || wheelItems.length < 1) return;
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];

    setWinner(null);
    setSpinning(true);
    setLocked([false, false, false]);

    const winnerRestaurant = wheelItems[Math.floor(Math.random() * wheelItems.length)];

    [0, 1, 2].forEach((reelIdx) => {
      const interval = setInterval(() => {
        const r = wheelItems[Math.floor(Math.random() * wheelItems.length)];
        setReelNames((prev) => {
          const next = [...prev] as [string, string, string];
          next[reelIdx] = r.name;
          return next;
        });
      }, 75);

      intervalsRef.current.push(interval);

      const stopDelay = 1400 + reelIdx * 900;
      setTimeout(() => {
        clearInterval(interval);
        setReelNames((prev) => {
          const next = [...prev] as [string, string, string];
          next[reelIdx] = winnerRestaurant.name;
          return next;
        });
        setLocked((prev) => {
          const next = [...prev] as [boolean, boolean, boolean];
          next[reelIdx] = true;
          return next;
        });
        if (reelIdx === 2) {
          setTimeout(() => {
            setSpinning(false);
            setWinner(winnerRestaurant);
          }, 300);
        }
      }, stopDelay);
    });
  };

  useEffect(() => {
    return () => intervalsRef.current.forEach(clearInterval);
  }, []);

  const toggleRestaurant = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    reset();
  };

  const selectAll = () => { setSelected(new Set(restaurants.map((r) => r.id))); reset(); };
  const selectTop5 = () => { setSelected(new Set(restaurants.slice(0, 5).map((r) => r.id))); reset(); };
  const selectNone = () => { setSelected(new Set()); reset(); };

  return (
    <>
      <div className="flex flex-1 min-h-0">

        {/* Left: checklist */}
        <div className="w-48 flex-shrink-0 flex flex-col border-r-2 border-gray-800 bg-black">
          <div className="px-3 pt-3 pb-2 border-b-2 border-gray-800 flex-shrink-0">
            <p className="text-xs font-extrabold text-gray-300 uppercase tracking-wider mb-2">
              In the mix ({wheelItems.length})
            </p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={selectTop5} className="text-xs text-red-500 font-bold hover:text-red-400">Top 5</button>
              <button onClick={selectAll} className="text-xs text-gray-500 font-bold hover:text-gray-300">All</button>
              <button onClick={selectNone} className="text-xs text-gray-700 font-bold hover:text-gray-500">None</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
            {restaurants.map((r, i) => {
              const isOn = selected.has(r.id);
              const dotColor = isOn ? COLORS[i % COLORS.length] : "#374151";
              return (
                <button
                  key={r.id}
                  onClick={() => toggleRestaurant(r.id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl text-left transition-all ${isOn ? "bg-gray-900" : "opacity-30"}`}
                >
                  <div className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-colors ${isOn ? "bg-red-600 border-red-600" : "border-gray-700"}`}>
                    {isOn && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
                  <span className="text-xs font-bold text-gray-300 leading-tight line-clamp-2">{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: slot machine */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6 overflow-hidden bg-gray-950">

          <p className="text-xs font-extrabold text-gray-600 uppercase tracking-widest">Pull to decide</p>

          {/* Reels */}
          <div className="flex gap-3">
            {([0, 1, 2] as const).map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div
                  className={`w-40 h-28 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 overflow-hidden ${
                    locked[i]
                      ? "bg-gray-900 border-red-600"
                      : "bg-gray-900 border-gray-800"
                  }`}
                >
                  <div className="relative w-full h-full flex items-center justify-center px-3">
                    <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-900 to-transparent z-10 pointer-events-none" />
                    <p
                      className={`text-white font-extrabold text-center text-sm leading-tight transition-all ${
                        spinning && !locked[i] ? "blur-[1px] opacity-70" : "opacity-100"
                      }`}
                    >
                      {reelNames[i]}
                    </p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${locked[i] ? "bg-red-600" : "bg-gray-800"}`} />
              </div>
            ))}
          </div>

          {/* Pull button */}
          <button
            onClick={pull}
            disabled={spinning || wheelItems.length < 1}
            className="w-full max-w-xs bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-gray-800 disabled:text-gray-600 text-white font-extrabold py-4 rounded-2xl transition-colors text-base tracking-wide"
          >
            {spinning ? "Spinning…" : wheelItems.length < 1 ? "Select restaurants" : "Pull"}
          </button>

          {/* Winner — fixed height */}
          <div className="w-full max-w-xs h-16 flex-shrink-0">
            {winner && !spinning ? (
              <button
                onClick={() => setOverlayRestaurant(winner)}
                className="w-full h-full bg-red-600 hover:bg-red-700 rounded-2xl px-4 text-left transition-colors flex flex-col justify-center"
              >
                <p className="text-xs text-red-200 font-bold uppercase tracking-widest">Tonight&apos;s pick — tap for details</p>
                <p className="font-extrabold text-white text-sm truncate">{winner.name}</p>
              </button>
            ) : (
              <div className="w-full h-full border-2 border-gray-800 rounded-2xl flex items-center justify-center bg-gray-900">
                <p className="text-xs text-gray-700 font-bold uppercase tracking-wider">Result appears here</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {overlayRestaurant && (
        <DetailOverlay restaurant={overlayRestaurant} onClose={() => setOverlayRestaurant(null)} />
      )}
    </>
  );
}
