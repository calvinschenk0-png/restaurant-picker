"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Restaurant } from "@/lib/ranking";
import DetailOverlay from "@/components/DetailOverlay";

const COLORS = [
  "#f97316", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa",
  "#f472b6", "#fb923c", "#a3e635", "#38bdf8", "#c084fc",
  "#f87171", "#facc15", "#4ade80", "#818cf8",
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
    ctx.fillStyle = "#e5e7eb";
    ctx.fill();
    ctx.fillStyle = "#9ca3af";
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
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(mid);
    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    const fontSize = Math.min(13, Math.max(7, 200 / n));
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 3;
    const label = r.name.length > 14 ? r.name.slice(0, 13) + "…" : r.name;
    ctx.fillText(label, radius - 10, fontSize / 3);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 2;
  ctx.stroke();
}

export default function WheelTab({ restaurants }: Props) {
  // Default: top 5 selected
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

  const selectAll = () => {
    setSelected(new Set(restaurants.map((r) => r.id)));
    resetWheel();
  };

  const selectTop5 = () => {
    setSelected(new Set(restaurants.slice(0, 5).map((r) => r.id)));
    resetWheel();
  };

  const selectNone = () => {
    setSelected(new Set());
    resetWheel();
  };

  return (
    <>
      {/* Side-by-side layout: checklist left, wheel right */}
      <div className="flex flex-1 min-h-0">

        {/* Left: scrollable checklist — width matches the tab bar above (~192px) */}
        <div className="w-48 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white">
          <div className="px-3 pt-3 pb-2 border-b border-gray-100 flex-shrink-0">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              On wheel ({wheelItems.length})
            </p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={selectTop5} className="text-xs text-orange-600 font-semibold hover:text-orange-700">Top 5</button>
              <button onClick={selectAll} className="text-xs text-gray-500 font-medium hover:text-gray-700">All</button>
              <button onClick={selectNone} className="text-xs text-gray-400 font-medium hover:text-gray-600">None</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
            {restaurants.map((r, i) => {
              const isOn = selected.has(r.id);
              const wheelIdx = wheelItems.findIndex((w) => w.id === r.id);
              const dotColor = wheelIdx >= 0 ? COLORS[wheelIdx % COLORS.length] : "#d1d5db";
              return (
                <button
                  key={r.id}
                  onClick={() => toggleRestaurant(r.id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all ${
                    isOn ? "bg-orange-50" : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                      isOn ? "bg-orange-500 border-orange-500" : "border-gray-300"
                    }`}
                  >
                    {isOn && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
                  <span className="text-xs font-medium text-gray-800 leading-tight line-clamp-2">{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: wheel + controls
            Wheel size = min(available width, available height).
            Available height = 100dvh - header(~114px) - spin+padding(~80px) = 100dvh - 194px
            Available width  = 100dvw - left panel(192px) - padding(32px)    = 100dvw - 224px  */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 overflow-hidden">
          <div
            className="relative flex-shrink-0"
            style={{
              width: "min(calc(100dvw - 224px), calc(100dvh - 310px))",
              aspectRatio: "1",
            }}
          >
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
              <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[26px] border-l-transparent border-r-transparent border-t-orange-500 drop-shadow-md" />
            </div>
            <div ref={wheelRef} className="absolute inset-0 pointer-events-none" style={{ willChange: "transform" }}>
              <canvas ref={canvasRef} width={512} height={512} className="w-full h-full rounded-full shadow-xl" />
            </div>
          </div>

          <button
            onClick={spin}
            disabled={spinning || wheelItems.length < 2}
            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-orange-300 text-white font-bold py-3 rounded-2xl transition-colors shadow-sm text-base"
          >
            {spinning ? "Spinning…" : wheelItems.length < 2 ? "Select at least 2" : "Spin"}
          </button>

          {/* Winner area — fixed height so wheel never shifts */}
          <div className="w-full h-16 flex-shrink-0">
            {winner && !spinning ? (
              <button
                onClick={() => setOverlayRestaurant(winner)}
                className="w-full h-full bg-white border-2 border-orange-400 rounded-2xl px-3 text-left hover:bg-orange-50 transition-colors shadow-sm flex flex-col justify-center"
              >
                <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">
                  Winner — tap for details
                </p>
                <p className="font-bold text-gray-900 text-sm truncate">{winner.name}</p>
              </button>
            ) : (
              <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center">
                <p className="text-xs text-gray-300 font-medium">Winner appears here</p>
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
