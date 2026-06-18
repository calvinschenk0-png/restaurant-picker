"use client";
import { useState } from "react";
import type { Restaurant } from "@/lib/ranking";
import DetailOverlay from "@/components/DetailOverlay";

const COLORS = [
  "#f97316", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa",
  "#f472b6", "#fb923c", "#a3e635", "#38bdf8", "#c084fc",
  "#f87171", "#facc15", "#4ade80", "#818cf8",
];

interface Matchup { a: Restaurant; b: Restaurant; }
type Phase = "selection" | "fighting" | "champion";

function createRound(restaurants: Restaurant[]): { matchups: Matchup[]; byes: Restaurant[] } {
  const shuffled = [...restaurants].sort(() => Math.random() - 0.5);
  const byes: Restaurant[] = [];
  let list = shuffled;
  if (list.length % 2 !== 0) {
    byes.push(list[list.length - 1]);
    list = list.slice(0, -1);
  }
  const matchups: Matchup[] = [];
  for (let i = 0; i < list.length; i += 2) {
    matchups.push({ a: list[i], b: list[i + 1] });
  }
  return { matchups, byes };
}

function formatCuisine(cuisine: string | null): string {
  if (!cuisine) return "";
  return cuisine.split(";")[0].trim().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDistance(meters: number | null): string {
  if (!meters) return "";
  return `${(meters / 1609.34).toFixed(1)} mi away`;
}

interface Props { restaurants: Restaurant[]; }

export default function KnockoutTournament({ restaurants }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(restaurants.slice(0, Math.min(8, restaurants.length)).map((r) => r.id))
  );
  const [phase, setPhase] = useState<Phase>("selection");
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [roundWinners, setRoundWinners] = useState<Restaurant[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalMatchups, setTotalMatchups] = useState(0);
  const [champion, setChampion] = useState<Restaurant | null>(null);
  const [overlayRestaurant, setOverlayRestaurant] = useState<Restaurant | null>(null);
  const [picking, setPicking] = useState<string | null>(null);

  const contestants = restaurants.filter((r) => selected.has(r.id));

  const startTournament = () => {
    const { matchups: round, byes } = createRound(contestants);
    setMatchups(round);
    setMatchIndex(0);
    setRoundWinners(byes);
    setRoundNumber(1);
    setTotalMatchups(round.length);
    setChampion(null);
    setPicking(null);
    setPhase("fighting");
  };

  const advanceWinner = (winner: Restaurant) => {
    setPicking(winner.id);
    setTimeout(() => {
      setPicking(null);
      const newWinners = [...roundWinners, winner];
      const nextIdx = matchIndex + 1;

      if (nextIdx < matchups.length) {
        setRoundWinners(newWinners);
        setMatchIndex(nextIdx);
      } else {
        // Round over
        if (newWinners.length === 1) {
          setChampion(newWinners[0]);
          setPhase("champion");
        } else {
          const { matchups: nextRound, byes } = createRound(newWinners);
          setMatchups(nextRound);
          setMatchIndex(0);
          setRoundWinners(byes);
          setRoundNumber((n) => n + 1);
          setTotalMatchups(nextRound.length);
        }
      }
    }, 350);
  };

  const resetToSelection = () => { setPhase("selection"); setChampion(null); };

  const toggleRestaurant = (id: string) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const selectAll = () => setSelected(new Set(restaurants.map((r) => r.id)));
  const selectTop8 = () => setSelected(new Set(restaurants.slice(0, Math.min(8, restaurants.length)).map((r) => r.id)));
  const selectNone = () => setSelected(new Set());

  // ── CHAMPION SCREEN ──
  if (phase === "champion" && champion) {
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 bg-white overflow-hidden text-center">
          <p className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-3">Champion</p>
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight mb-2">{champion.name}</h2>
          {formatCuisine(champion.cuisine) && (
            <p className="text-sm font-bold text-gray-400 mb-1">{formatCuisine(champion.cuisine)}</p>
          )}
          {formatDistance(champion.distanceMeters) && (
            <p className="text-xs font-semibold text-gray-300 mb-8">{formatDistance(champion.distanceMeters)}</p>
          )}
          <button
            onClick={() => setOverlayRestaurant(champion)}
            className="w-full max-w-xs bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-4 rounded-2xl transition-colors mb-3"
          >
            View details
          </button>
          <button
            onClick={startTournament}
            className="w-full max-w-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold py-4 rounded-2xl transition-colors mb-3"
          >
            Run again
          </button>
          <button onClick={resetToSelection} className="text-xs font-bold text-gray-300 hover:text-gray-500 uppercase tracking-wider mt-1">
            Change contestants
          </button>
        </div>
        {overlayRestaurant && <DetailOverlay restaurant={overlayRestaurant} onClose={() => setOverlayRestaurant(null)} />}
      </>
    );
  }

  // ── FIGHTING SCREEN ──
  if (phase === "fighting") {
    const match = matchups[matchIndex];
    const remaining = (matchups.length - matchIndex) * 2 + roundWinners.length;

    return (
      <>
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Header */}
          <div className="border-b-2 border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <p className="text-xs font-extrabold text-orange-500 uppercase tracking-widest">Round {roundNumber}</p>
              <p className="text-sm font-bold text-gray-900">
                Match {matchIndex + 1} of {totalMatchups}
                <span className="text-gray-400 font-semibold"> · {remaining} left</span>
              </p>
            </div>
            <button onClick={resetToSelection} className="text-xs text-gray-300 font-bold hover:text-gray-500 uppercase tracking-wider">
              Restart
            </button>
          </div>

          {/* Matchup cards */}
          <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center gap-4 px-6 py-6">
            {/* Card A */}
            <button
              onClick={() => advanceWinner(match.a)}
              disabled={!!picking}
              className={`w-full max-w-sm border-2 rounded-2xl p-5 text-left transition-all duration-200 ${
                picking === match.a.id
                  ? "border-orange-500 bg-orange-500 scale-95"
                  : "border-gray-100 bg-white hover:border-orange-400 hover:bg-orange-50 active:scale-95"
              }`}
            >
              <p className={`font-extrabold text-xl leading-tight ${picking === match.a.id ? "text-white" : "text-gray-900"}`}>
                {match.a.name}
              </p>
              {formatCuisine(match.a.cuisine) && (
                <p className={`text-sm font-bold mt-1 ${picking === match.a.id ? "text-orange-100" : "text-orange-500"}`}>
                  {formatCuisine(match.a.cuisine)}
                </p>
              )}
              {formatDistance(match.a.distanceMeters) && (
                <p className={`text-xs font-semibold mt-0.5 ${picking === match.a.id ? "text-orange-200" : "text-gray-400"}`}>
                  {formatDistance(match.a.distanceMeters)}
                </p>
              )}
              <div className={`mt-4 text-xs font-extrabold uppercase tracking-widest py-2 px-4 rounded-xl inline-block transition-colors ${
                picking === match.a.id ? "bg-white/20 text-white" : "bg-orange-500 text-white"
              }`}>
                Pick this
              </div>
            </button>

            {/* VS */}
            <div className="flex items-center gap-3 w-full max-w-sm">
              <div className="flex-1 h-0.5 bg-gray-100" />
              <span className="text-xs font-extrabold text-gray-300 uppercase tracking-widest">VS</span>
              <div className="flex-1 h-0.5 bg-gray-100" />
            </div>

            {/* Card B */}
            <button
              onClick={() => advanceWinner(match.b)}
              disabled={!!picking}
              className={`w-full max-w-sm border-2 rounded-2xl p-5 text-left transition-all duration-200 ${
                picking === match.b.id
                  ? "border-orange-500 bg-orange-500 scale-95"
                  : "border-gray-100 bg-white hover:border-orange-400 hover:bg-orange-50 active:scale-95"
              }`}
            >
              <p className={`font-extrabold text-xl leading-tight ${picking === match.b.id ? "text-white" : "text-gray-900"}`}>
                {match.b.name}
              </p>
              {formatCuisine(match.b.cuisine) && (
                <p className={`text-sm font-bold mt-1 ${picking === match.b.id ? "text-orange-100" : "text-orange-500"}`}>
                  {formatCuisine(match.b.cuisine)}
                </p>
              )}
              {formatDistance(match.b.distanceMeters) && (
                <p className={`text-xs font-semibold mt-0.5 ${picking === match.b.id ? "text-orange-200" : "text-gray-400"}`}>
                  {formatDistance(match.b.distanceMeters)}
                </p>
              )}
              <div className={`mt-4 text-xs font-extrabold uppercase tracking-widest py-2 px-4 rounded-xl inline-block transition-colors ${
                picking === match.b.id ? "bg-white/20 text-white" : "bg-orange-500 text-white"
              }`}>
                Pick this
              </div>
            </button>
          </div>
        </div>
        {overlayRestaurant && <DetailOverlay restaurant={overlayRestaurant} onClose={() => setOverlayRestaurant(null)} />}
      </>
    );
  }

  // ── SELECTION SCREEN ──
  return (
    <>
      <div className="flex flex-1 min-h-0">
        {/* Left: checklist */}
        <div className="w-48 flex-shrink-0 flex flex-col border-r-2 border-gray-100 bg-white">
          <div className="px-3 pt-3 pb-2 border-b-2 border-gray-100 flex-shrink-0">
            <p className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2">
              Contestants ({contestants.length})
            </p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={selectTop8} className="text-xs text-orange-500 font-bold hover:text-orange-600">Top 8</button>
              <button onClick={selectAll} className="text-xs text-gray-400 font-bold hover:text-gray-600">All</button>
              <button onClick={selectNone} className="text-xs text-gray-300 font-bold hover:text-gray-500">None</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
            {restaurants.map((r, i) => {
              const isOn = selected.has(r.id);
              const dotColor = isOn ? COLORS[i % COLORS.length] : "#e5e7eb";
              return (
                <button
                  key={r.id}
                  onClick={() => toggleRestaurant(r.id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl text-left transition-all ${isOn ? "bg-orange-50" : "opacity-30"}`}
                >
                  <div className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-colors ${isOn ? "bg-orange-500 border-orange-500" : "border-gray-200"}`}>
                    {isOn && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
                  <span className="text-xs font-bold text-gray-800 leading-tight line-clamp-2">{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: start panel */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-xs font-extrabold text-gray-300 uppercase tracking-widest">Knockout Tournament</p>
          <p className="text-4xl font-extrabold text-gray-900">{contestants.length}</p>
          <p className="text-sm font-bold text-gray-400 -mt-2">restaurants selected</p>
          <p className="text-sm text-gray-400 max-w-xs">
            They&apos;ll battle head-to-head until one champion remains. You decide every matchup.
          </p>
          <button
            onClick={startTournament}
            disabled={contestants.length < 2}
            className="w-full max-w-xs bg-orange-500 hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 text-white font-extrabold py-4 rounded-2xl transition-colors mt-2"
          >
            {contestants.length < 2 ? "Select at least 2" : "Start Tournament"}
          </button>
        </div>
      </div>
      {overlayRestaurant && <DetailOverlay restaurant={overlayRestaurant} onClose={() => setOverlayRestaurant(null)} />}
    </>
  );
}
