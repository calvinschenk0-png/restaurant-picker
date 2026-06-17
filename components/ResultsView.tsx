"use client";
import { useState } from "react";
import type { Restaurant } from "@/lib/ranking";
import RestaurantCard from "@/components/RestaurantCard";
import DetailOverlay from "@/components/DetailOverlay";
import WheelTab from "@/components/WheelTab";

interface Props {
  restaurants: Restaurant[];
  locationName: string;
  onRestart: () => void;
}

type Tab = "top5" | "full" | "wheel";

export default function ResultsView({ restaurants, locationName, onRestart }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("top5");
  const [selected, setSelected] = useState<Restaurant | null>(null);

  const top5 = restaurants.slice(0, 5);

  const tabs: { id: Tab; label: string }[] = [
    { id: "top5", label: "Top 5" },
    { id: "full", label: "Full List" },
    { id: "wheel", label: "Wheel" },
  ];

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-orange-500 text-white px-6 pt-10 pb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Restaurant Picker</h1>
          <p className="text-orange-100 mt-0.5 text-sm">Near {locationName}</p>
        </div>
        <button
          onClick={onRestart}
          className="flex-shrink-0 mt-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
        >
          New search
        </button>
      </div>

      {/* Tab bar */}
      <div className="bg-orange-500 px-6 pb-0 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-colors ${
              activeTab === tab.id
                ? "bg-orange-50 text-orange-600"
                : "text-orange-100 hover:text-white hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 bg-orange-50 flex flex-col overflow-hidden">
        {activeTab === "top5" && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
              {top5.length === 0 ? (
                <EmptyState />
              ) : (
                top5.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} onTap={() => setSelected(r)} />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "full" && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
              {restaurants.length === 0 ? (
                <EmptyState />
              ) : (
                restaurants.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} onTap={() => setSelected(r)} />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "wheel" && (
          <WheelTab restaurants={restaurants} />
        )}
      </div>

      {/* Detail overlay */}
      {selected && (
        <DetailOverlay restaurant={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <p className="text-gray-500 font-medium">No restaurants found nearby.</p>
      <p className="text-gray-400 text-sm mt-1">Try a wider distance or different cuisine.</p>
    </div>
  );
}
