"use client";
import { useCallback, useEffect, useRef, useState } from "react";
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

function drawWheel(canvas: HTMLCanvasElement, items: Restaurant[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 2;

  ctx.clearRect(0, 0, size, size);

  if (items.length === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#1f2937";
    ctx.fill();
    ctx.fillStyle = "#6b7280";
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No restaurants", cx, cy - 8);
    ctx.fillText("selected", cx, cy + 12);
    return;
  }

  const n = items.length;
  const segAngle = (Math.PI * 2) / n;
  const startOffset = -Math.PI / 2;

  items.forEach((r, i) => {
    const start = startOffset + i * segAngle;
    const end = start + segAngle;
    const mid = start + segAngle / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(mid);
    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    const fontSize = Math.min(22, Math.max(12, 280 / n));
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 3;
    const label = r.name.length > 14 ? r.name.slice(0, 13) + "…" : r.name;
    ctx.fillText(label, radius - 10, fontSize / 3);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fillStyle = "#111";
  ctx.fill();
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 2;
  ctx.stroke();
}

export default function WheelTab({ restaurants }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(restaurants.slice(0, 5).map((r) => r.id))
  );
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [overlayRestaurant, setOverlayRestaurant] = useState<Restaurant | null>(null);
  const totalRotationRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const wheelItems = restaurants.filter((r) => selected.has(r.id));

  useEffect(() => {
    if (canvasRef.current) drawWheel(canvasRef.current, wheelItems);
  }, [wheelItems]);

  const handleTransitionEnd = useCallback(() => {
    setSpinning(false);
    const n = wheelItems.length;
    if (n === 0) return;
    const finalAngle = totalRotationRef.current % 360;
    const pointerAngle = (360 - finalAngle + 360) % 360;
    const segAngle = 360 / n;
    const idx = Math.floor(pointerAngle / segAngle) % n;
    setWinner(wheelItems[idx]);
  }, [wheelItems]);

  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    el.addEventListener("transitionend", handleTransitionEnd);
    return () => el.removeEventListener("transitionend", handleTransitionEnd);
  }, [handleTransitionEnd]);

  const spin = () => {
    if (spinning || wheelItems.length < 2) return;
    setSpinning(true);
    setWinner(null);
    const newTotal =
      totalRotationRef.current + 360 * (5 + Math.floor(Math.random() * 3)) + Math.random() * 360;
    totalRotationRef.current = newTotal;
    if (wheelRef.current) {
      wheelRef.current.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)";
      wheelRef.current.style.transform = `rotate(${newTotal}deg)`;
    }
  };

  const resetWheel = () => {
    if (wheelRef.current) {
      wheelRef.current.style.transition = "none";
      wheelRef.current.style.transform = "rotate(0deg)";
    }
    totalRotationRef.current = 0;
    setWinner(null);
  };

  const toggleRestaurant = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    resetWheel();
  };

  const selectAll = () => { setSelected(new Set(restaurants.map((r) => r.id))); resetWheel(); };
  const selectTop5 = () => { setSelected(new Set(restaurants.slice(0, 5).map((r) => r.id))); resetWheel(); };
  const selectNone = () => { setSelected(new Set()); resetWheel(); };

  return (
    <>
      <div className="flex flex-1 min-h-0">

        {/* Left: scrollable checklist */}
        <div className="w-48 flex-shrink-0 flex flex-col border-r-2 border-gray-800 bg-black">
          <div className="px-3 pt-3 pb-2 border-b-2 border-gray-800 flex-shrink-0">
            <p className="text-xs font-extrabold text-gray-300 uppercase tracking-wider mb-2">
              On wheel ({wheelItems.length})
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
              const wheelIdx = wheelItems.findIndex((w) => w.id === r.id);
              const dotColor = wheelIdx >= 0 ? COLORS[wheelIdx % COLORS.length] : "#374151";
              return (
                <button
                  key={r.id}
                  onClick={() => toggleRestaurant(r.id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl text-left transition-all ${
                    isOn ? "bg-gray-900" : "opacity-30"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                    isOn ? "bg-red-600 border-red-600" : "border-gray-700"
                  }`}>
                    {isOn && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
                  <span className="text-xs font-medium text-gray-300 leading-tight line-clamp-2">{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: wheel + controls */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 overflow-hidden bg-gray-950">
          <div
            className="relative flex-shrink-0"
            style={{
              width: "min(calc(100dvw - 224px), calc(100dvh - 310px))",
              aspectRatio: "1",
            }}
          >
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[26px] border-l-transparent border-r-transparent border-t-red-600 drop-shadow-md" />
            </div>
            <div ref={wheelRef} className="absolute inset-0 pointer-events-none" style={{ willChange: "transform" }}>
              <canvas ref={canvasRef} width={512} height={512} className="w-full h-full rounded-full" />
            </div>
          </div>

          <button
            onClick={spin}
            disabled={spinning || wheelItems.length < 2}
            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-gray-800 disabled:text-gray-600 text-white font-extrabold py-3 rounded-2xl transition-colors text-base tracking-wide"
          >
            {spinning ? "Spinning…" : wheelItems.length < 2 ? "Select at least 2" : "Spin"}
          </button>

          {/* Winner area — fixed height so wheel never shifts */}
          <div className="w-full h-16 flex-shrink-0">
            {winner && !spinning ? (
              <button
                onClick={() => setOverlayRestaurant(winner)}
                className="w-full h-full bg-red-600 rounded-2xl px-4 text-left hover:bg-red-700 transition-colors flex flex-col justify-center"
              >
                <p className="text-xs text-red-200 font-bold uppercase tracking-widest">Winner — tap for details</p>
                <p className="font-extrabold text-white text-sm truncate">{winner.name}</p>
              </button>
            ) : (
              <div className="w-full h-full border-2 border-gray-800 rounded-2xl flex items-center justify-center bg-gray-900">
                <p className="text-xs text-gray-700 font-bold uppercase tracking-wider">Winner appears here</p>
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
