"use client";
import { useState } from "react";
import type { Restaurant } from "@/lib/ranking";
import RestaurantCard from "@/components/RestaurantCard";
import DetailOverlay from "@/components/DetailOverlay";
import WheelTab from "@/components/WheelTab";
import SlotMachine from "@/components/SlotMachine";
import KnockoutTournament from "@/components/KnockoutTournament";

interface Props {
  restaurants: Restaurant[];
  locationName: string;
  onRestart: () => void;
}

type Tab = "top5" | "full" | "wheel" | "slots" | "knockout";

export default function ResultsView({ restaurants, locationName, onRestart }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("top5");
  const [selected, setSelected] = useState<Restaurant | null>(null);

  const top5 = restaurants.slice(0, 5);

  const tabs: { id: Tab; label: string }[] = [
    { id: "top5", label: "Top 5" },
    { id: "full", label: "Full List" },
    { id: "wheel", label: "Wheel" },
    { id: "slots", label: "Slots" },
    { id: "knockout", label: "Knockout" },
  ];

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="px-6 pt-10 pb-0 bg-white border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-0.5">Restaurant Picker</p>
            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Near {locationName}</h1>
          </div>
          <button
            onClick={onRestart}
            className="flex-shrink-0 mt-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
          >
            New search
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
        {activeTab === "top5" && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-lg mx-auto px-4 py-4 space-y-2">
              {top5.length === 0 ? <EmptyState /> : top5.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} onTap={() => setSelected(r)} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "full" && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-lg mx-auto px-4 py-4 space-y-2">
              {restaurants.length === 0 ? <EmptyState /> : restaurants.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} onTap={() => setSelected(r)} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "wheel" && <WheelTab restaurants={restaurants} />}
        {activeTab === "slots" && <SlotMachine restaurants={restaurants} />}
        {activeTab === "knockout" && <KnockoutTournament restaurants={restaurants} />}
      </div>

      {selected && <DetailOverlay restaurant={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <p className="text-gray-500 font-bold">No restaurants found nearby.</p>
      <p className="text-gray-400 text-sm mt-1">Try a wider distance or different cuisine.</p>
    </div>
  );
}
