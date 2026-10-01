import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, ChevronUp, ChevronDown, Sliders } from 'lucide-react';

interface VerticalBrightnessWidgetProps {
  brightness: number; // 50 - 120
  onBrightnessChange: (value: number) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenThemeSettings: () => void;
}

export const VerticalBrightnessWidget: React.FC<VerticalBrightnessWidgetProps> = ({
  brightness,
  onBrightnessChange,
  isDarkMode,
  onToggleTheme,
  onOpenThemeSettings,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Calculate percentage height in track (50% is min, 120% is max -> span of 70)
  const percentFill = Math.max(0, Math.min(100, ((brightness - 50) / 70) * 100));

  const updateFromPointer = (clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const offsetY = clientY - rect.top;
    const ratio = 1 - Math.max(0, Math.min(1, offsetY / rect.height));
    const newBrightness = Math.round(50 + ratio * 70);
    // snap to multiples of 5
    const snapped = Math.round(newBrightness / 5) * 5;
    onBrightnessChange(Math.max(50, Math.min(120, snapped)));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointer(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFromPointer(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if already released
    }
  };

  return (
    <aside 
      aria-label="Thanh điều chỉnh độ sáng"
      className="fixed right-3 bottom-24 sm:bottom-28 z-40 flex flex-col items-center select-none"
    >
      {/* Expanded Vertical Slider Panel */}
      {isExpanded && (
        <div className="mb-2 p-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-3xl border border-rose-200 dark:border-neutral-800 shadow-2xl flex flex-col items-center gap-2.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between w-full px-1 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
            <span className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Sáng tối</span>
            </span>
            <span className="font-mono text-rose-500 font-bold">{brightness}%</span>
          </div>

          <div className="text-[10px] text-neutral-400 flex items-center gap-0.5">
            <ChevronUp className="w-3 h-3 text-rose-400 animate-pulse" />
            <span>Vuốt lên để tăng sáng</span>
          </div>

          {/* Vertical Capsule Track (Lướt lên xuống) */}
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-12 h-44 rounded-2xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden cursor-ns-resize touch-none border border-neutral-200 dark:border-neutral-700 shadow-inner group"
            title="Nhấn hoặc lướt ngón tay lên / xuống để chỉnh độ sáng"
          >
            {/* Active Brightness Fill Bar rising from bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-rose-500 via-rose-400 to-amber-400 transition-all duration-75"
              style={{ height: `${percentFill}%` }}
            />

            {/* Glowing Icon Inside Capsule */}
            <div className="absolute inset-0 flex flex-col items-center justify-between py-3 pointer-events-none">
              <Sun
                className={`w-5 h-5 transition-transform ${
                  brightness >= 100
                    ? 'text-amber-100 scale-110 drop-shadow'
                    : 'text-neutral-400 dark:text-neutral-500'
                }`}
              />
              <span className="text-[11px] font-bold font-mono tracking-tight text-white drop-shadow-md">
                {brightness}%
              </span>
              <Moon
                className={`w-4 h-4 transition-transform ${
                  brightness < 80 ? 'text-indigo-200' : 'text-neutral-300 dark:text-neutral-600'
                }`}
              />
            </div>

            {/* Handle Gripper Line */}
            <div
              className="absolute left-1 right-1 h-1 bg-white/90 rounded-full shadow-md pointer-events-none transition-all duration-75"
              style={{ bottom: `calc(${percentFill}% - 2px)` }}
            />
          </div>

          <div className="text-[10px] text-neutral-400 flex items-center gap-0.5">
            <ChevronDown className="w-3 h-3 text-neutral-400" />
            <span>Vuốt xuống để dịu tối</span>
          </div>

          {/* Quick preset step buttons */}
          <div className="grid grid-cols-3 gap-1 w-full pt-1">
            <button
              onClick={() => onBrightnessChange(70)}
              className={`py-1 px-1 rounded-lg text-[10px] font-mono border transition cursor-pointer text-center ${
                brightness === 70
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-600 dark:text-rose-300 font-bold'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              70%
            </button>
            <button
              onClick={() => onBrightnessChange(100)}
              className={`py-1 px-1 rounded-lg text-[10px] font-mono border transition cursor-pointer text-center ${
                brightness === 100
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-600 dark:text-rose-300 font-bold'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              100%
            </button>
            <button
              onClick={() => onBrightnessChange(115)}
              className={`py-1 px-1 rounded-lg text-[10px] font-mono border transition cursor-pointer text-center ${
                brightness === 115
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-600 dark:text-rose-300 font-bold'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              115%
            </button>
          </div>

          {/* Quick theme switch & detail modal buttons */}
          <div className="flex items-center justify-between w-full pt-1.5 border-t border-neutral-100 dark:border-neutral-800 text-[11px]">
            <button
              onClick={onToggleTheme}
              className="text-neutral-500 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
              title={isDarkMode ? 'Đổi sang giao diện Sáng' : 'Đổi sang giao diện Tối'}
            >
              {isDarkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3" />}
              <span>{isDarkMode ? 'Sáng' : 'Tối'}</span>
            </button>

            <button
              onClick={onOpenThemeSettings}
              className="text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>Cài đặt</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Trigger Button (Biểu tượng thanh chỉnh độ sáng lướt lên xuống) */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className={`px-2.5 py-2 rounded-2xl border shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 ${
          isExpanded
            ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/30'
            : 'bg-white/90 dark:bg-neutral-900/90 text-neutral-700 dark:text-neutral-200 border-rose-200/80 dark:border-neutral-700 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-neutral-800'
        }`}
        title="Thanh chỉnh độ sáng tối (Lướt lên xuống)"
      >
        <div className="flex flex-col items-center">
          <Sun className={`w-3.5 h-3.5 ${isExpanded ? 'text-amber-200' : 'text-amber-500'}`} />
          <div className="w-1.5 h-3 my-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden relative">
            <div
              className="absolute bottom-0 w-full bg-rose-500"
              style={{ height: `${percentFill}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[10px] font-bold font-mono">{brightness}%</span>
          <span className="text-[9px] opacity-75">Sáng tối</span>
        </div>
      </button>
    </aside>
  );
};
