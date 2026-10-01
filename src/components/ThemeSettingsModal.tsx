import React, { useRef, useState } from 'react';
import { Sun, Moon, Monitor, X, Eye, Sparkles, Sliders, ChevronUp, ChevronDown } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  brightness: number; // 50 to 120
  onBrightnessChange: (value: number) => void;
  berryOpacity: number; // 20 to 100
  onBerryOpacityChange: (value: number) => void;
  berrySpeed?: number;
  onBerrySpeedChange?: (value: number) => void;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  themeMode,
  onThemeModeChange,
  brightness,
  onBrightnessChange,
  berryOpacity,
  onBerryOpacityChange,
  berrySpeed = 1.3,
  onBerrySpeedChange,
}) => {
  const [isDraggingModalSlider, setIsDraggingModalSlider] = useState<boolean>(false);
  const modalTrackRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Percentage for vertical capsule (50 to 120)
  const percentFill = Math.max(0, Math.min(100, ((brightness - 50) / 70) * 100));

  const updateFromPointer = (clientY: number) => {
    if (!modalTrackRef.current) return;
    const rect = modalTrackRef.current.getBoundingClientRect();
    const offsetY = clientY - rect.top;
    const ratio = 1 - Math.max(0, Math.min(1, offsetY / rect.height));
    const newBrightness = Math.round(50 + ratio * 70);
    const snapped = Math.round(newBrightness / 5) * 5;
    onBrightnessChange(Math.max(50, Math.min(120, snapped)));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingModalSlider(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointer(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingModalSlider) return;
    updateFromPointer(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingModalSlider(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-md max-h-[88vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-3xl border border-rose-100 dark:border-neutral-800 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-neutral-800 sticky top-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur z-10 -mx-2 px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-title text-neutral-900 dark:text-white">
                Tùy Chỉnh Sáng / Tối
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Điều chỉnh giao diện & độ sáng theo sở thích của bạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Mode Selector (Sáng / Tối / Tự động) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
            Giao diện màu nền:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* Light Mode */}
            <button
              onClick={() => onThemeModeChange('light')}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition cursor-pointer ${
                themeMode === 'light'
                  ? 'border-rose-500 bg-rose-50/80 text-rose-700 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-300 font-semibold shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Sun className={`w-5 h-5 ${themeMode === 'light' ? 'text-amber-500' : ''}`} />
              <span className="text-xs">Sáng</span>
              <span className="text-[10px] opacity-75">Trắng tinh khôi</span>
            </button>

            {/* Dark Mode */}
            <button
              onClick={() => onThemeModeChange('dark')}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition cursor-pointer ${
                themeMode === 'dark'
                  ? 'border-rose-500 bg-rose-50/80 text-rose-700 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-300 font-semibold shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Moon className={`w-5 h-5 ${themeMode === 'dark' ? 'text-indigo-400' : ''}`} />
              <span className="text-xs">Tối</span>
              <span className="text-[10px] opacity-75">Dạ khúc dịu mắt</span>
            </button>

            {/* System Auto */}
            <button
              onClick={() => onThemeModeChange('system')}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition cursor-pointer ${
                themeMode === 'system'
                  ? 'border-rose-500 bg-rose-50/80 text-rose-700 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-300 font-semibold shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Monitor className={`w-5 h-5 ${themeMode === 'system' ? 'text-rose-500' : ''}`} />
              <span className="text-xs">Tự động</span>
              <span className="text-[10px] opacity-75">Theo máy</span>
            </button>
          </div>
        </div>

        {/* Brightness Adjustment Slider (Độ sáng màn hình - Lướt lên xuống) */}
        <div className="space-y-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-rose-500" />
              <span>Độ sáng màn hình:</span>
            </span>
            <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
              {brightness}% {brightness < 90 ? '(Dịu tối)' : brightness > 105 ? '(Rực rỡ)' : '(Vừa vặn)'}
            </span>
          </div>

          {/* Interactive Dual-Mode: Vertical Swipe Capsule + Controls */}
          <div className="flex items-center gap-4 pt-1">
            {/* Vertical Swipe Capsule (Thanh lướt lên xuống như điện thoại) */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="flex items-center gap-0.5 text-[9px] text-neutral-400 font-medium">
                <ChevronUp className="w-3 h-3 text-rose-500 animate-bounce" />
                <span>Sáng</span>
              </div>

              <div
                ref={modalTrackRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="relative w-11 h-36 rounded-2xl bg-neutral-200 dark:bg-neutral-700 overflow-hidden cursor-ns-resize touch-none border border-neutral-300 dark:border-neutral-600 shadow-inner group"
                title="Lướt ngón tay hoặc chuột lên / xuống để chỉnh sáng tối"
              >
                {/* Active Height Fill */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-rose-500 via-rose-400 to-amber-400 transition-all duration-75"
                  style={{ height: `${percentFill}%` }}
                />

                {/* Center Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-between py-2 pointer-events-none text-white">
                  <Sun className={`w-4 h-4 ${brightness >= 100 ? 'text-amber-100' : 'text-neutral-400'}`} />
                  <span className="text-[10px] font-bold font-mono drop-shadow">{brightness}%</span>
                  <Moon className={`w-3.5 h-3.5 ${brightness < 80 ? 'text-indigo-200' : 'text-neutral-300'}`} />
                </div>
              </div>

              <div className="flex items-center gap-0.5 text-[9px] text-neutral-400 font-medium">
                <ChevronDown className="w-3 h-3 text-neutral-400" />
                <span>Tối</span>
              </div>
            </div>

            {/* Right side: Detailed Horizontal Slider & Quick Chips */}
            <div className="flex-1 space-y-3">
              <div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center justify-between">
                  <span>Kéo thanh trượt ngang:</span>
                  <span className="font-mono font-medium text-rose-500">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={120}
                  step={5}
                  value={brightness}
                  onChange={(e) => onBrightnessChange(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* Quick Select Buttons */}
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 block">Chọn nhanh mức độ:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onBrightnessChange(70)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-medium border transition cursor-pointer text-center ${
                      brightness === 70
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-bold'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    🌙 70% Đêm
                  </button>
                  <button
                    type="button"
                    onClick={() => onBrightnessChange(100)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-medium border transition cursor-pointer text-center ${
                      brightness === 100
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-bold'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    ✨ 100% Chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={() => onBrightnessChange(115)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-medium border transition cursor-pointer text-center ${
                      brightness === 115
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-bold'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    ☀️ 115% Nét
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strawberry floating particles opacity */}
        <div className="space-y-2 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Độ hiện rõ của quả dâu bay:</span>
            </span>
            <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
              {berryOpacity}%
            </span>
          </div>

          <input
            type="range"
            min={10}
            max={100}
            step={10}
            value={berryOpacity}
            onChange={(e) => onBerryOpacityChange(Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />

          <div className="flex justify-between text-[10px] text-neutral-400 pt-1">
            <button
              type="button"
              onClick={() => onBerryOpacityChange(20)}
              className="hover:text-rose-500 cursor-pointer"
            >
              Mờ nhẹ
            </button>
            <button
              type="button"
              onClick={() => onBerryOpacityChange(70)}
              className="hover:text-rose-500 cursor-pointer"
            >
              Tiêu chuẩn (70%)
            </button>
            <button
              type="button"
              onClick={() => onBerryOpacityChange(100)}
              className="hover:text-rose-500 cursor-pointer"
            >
              Rõ nét (100%)
            </button>
          </div>
        </div>

        {/* Strawberry flight speed */}
        {onBerrySpeedChange && (
          <div className="space-y-2 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <span>🚀</span>
                <span>Tốc độ dâu tây bay lên:</span>
              </span>
              <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
                {berrySpeed >= 1.5 ? 'Nhanh vút 🍓' : berrySpeed >= 1.2 ? 'Nhanh sinh động' : 'Thong thả'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onBerrySpeedChange(0.9)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition cursor-pointer text-center ${
                  berrySpeed < 1.1
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Chậm êm
              </button>

              <button
                type="button"
                onClick={() => onBerrySpeedChange(1.35)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition cursor-pointer text-center ${
                  berrySpeed >= 1.1 && berrySpeed < 1.5
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-semibold shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Nhanh vừa ⚡
              </button>

              <button
                type="button"
                onClick={() => onBerrySpeedChange(1.75)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition cursor-pointer text-center ${
                  berrySpeed >= 1.5
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-semibold shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Siêu nhanh 🍓
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition cursor-pointer"
        >
          Hoàn Tất Tùy Chỉnh
        </button>
      </div>
    </div>
  );
};
