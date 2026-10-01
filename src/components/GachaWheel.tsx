import React, { useState } from 'react';
import { Sparkles, Dices, RotateCcw, Heart, ExternalLink, BookOpen, Star, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Character } from '../types';

interface GachaWheelProps {
  characters: Character[];
  favorites: string[];
  onToggleFavorite: (charId: string) => void;
  onSelectCharacter: (char: Character) => void;
  onOpenAdminModal: () => void;
}

export const GachaWheel: React.FC<GachaWheelProps> = ({
  characters,
  favorites,
  onToggleFavorite,
  onSelectCharacter,
  onOpenAdminModal,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Character | null>(null);
  const [pullHistory, setPullHistory] = useState<Character[]>([]);
  const [spinDegree, setSpinDegree] = useState(0);

  const handleRollGacha = () => {
    if (characters.length === 0) return;
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedResult(null);

    // Spin animation degree calculation
    const extraRotations = 5 + Math.floor(Math.random() * 4);
    const randomStopDeg = Math.floor(Math.random() * 360);
    const targetDeg = spinDegree + extraRotations * 360 + randomStopDeg;
    setSpinDegree(targetDeg);

    // Sound chime or synthesis simulation
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * characters.length);
      const chosen = characters[randomIndex];

      setSelectedResult(chosen);
      setIsSpinning(false);
      setPullHistory((prev) => [chosen, ...prev.slice(0, 5)]);

      // Confetti burst
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#f59e0b', '#8b5cf6'],
      });
    }, 2400);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Vòng Quay Duyên Phận</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif-title text-neutral-900 dark:text-white">
          Quay Gacha Nhân Vật Ngẫu Nhiên
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Hôm nay vũ trụ dâu tây sẽ đưa ai đến trò chuyện cùng bạn? Hãy xoay vòng quay để tìm thấy định mệnh nhé!
        </p>
      </div>

      {characters.length === 0 ? (
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl border border-dashed border-rose-200 dark:border-neutral-800 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-rose-50 dark:bg-neutral-800 flex items-center justify-center text-4xl">
            🍓
          </div>
          <h3 className="font-semibold text-neutral-800 dark:text-white font-serif-title text-lg">
            Vòng quay chưa có nhân vật để triệu hồi
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Hiện tại tiệm chưa có nhân vật nào trong hồ sơ. Quản trị viên vui lòng thêm nhân vật trước khi kích hoạt vòng quay.
          </p>
          <button
            onClick={onOpenAdminModal}
            className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium transition cursor-pointer"
          >
            Mở bảng Quản Trị Viên
          </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Wheel / Crystal Ball Section */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-6">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Glowing Aura Ring */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-tr from-rose-400/30 via-pink-300/20 to-amber-200/30 blur-xl transition-all duration-700 ${
                  isSpinning ? 'scale-110 opacity-100' : 'scale-100 opacity-60'
                }`}
              />

              {/* The Spinning Wheel */}
              <div
                className="relative w-full h-full rounded-full border-4 border-white dark:border-neutral-800 shadow-2xl flex items-center justify-center overflow-hidden transition-transform ease-out"
                style={{
                  transform: `rotate(${spinDegree}deg)`,
                  transitionDuration: isSpinning ? '2.4s' : '0.4s',
                  transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.25, 1)',
                  background:
                    'conic-gradient(from 0deg, #ffe4e6 0deg 45deg, #fce7f3 45deg 90deg, #fef3c7 90deg 135deg, #e0f2fe 135deg 180deg, #ffe4e6 180deg 225deg, #fce7f3 225deg 270deg, #fef3c7 270deg 315deg, #e0f2fe 315deg 360deg)',
                }}
              >
                {/* Visual Segments */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-rose-200 dark:bg-neutral-700" />
                  <div className="h-full w-0.5 bg-rose-200 dark:bg-neutral-700 absolute" />
                </div>

                {/* Strawberry icons around the wheel */}
                <div className="absolute top-4 text-xl">🍓</div>
                <div className="absolute bottom-4 text-xl">✨</div>
                <div className="absolute left-4 text-xl">🌸</div>
                <div className="absolute right-4 text-xl">💖</div>
              </div>

              {/* Center Wheel Hub Button */}
              <button
                onClick={handleRollGacha}
                disabled={isSpinning}
                className="absolute w-24 h-24 rounded-full bg-white dark:bg-neutral-900 border-4 border-rose-300 dark:border-rose-800 shadow-xl flex flex-col items-center justify-center text-rose-500 hover:scale-105 active:scale-95 disabled:pointer-events-none transition cursor-pointer z-10"
              >
                <span className="text-2xl animate-bounce">🍓</span>
                <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mt-0.5">
                  {isSpinning ? 'Đang quay...' : 'QUAY'}
                </span>
              </button>

              {/* Pointer indicator */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-rose-600 filter drop-shadow-md">
                ▼
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleRollGacha}
                disabled={isSpinning}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 transition cursor-pointer"
              >
                <Dices className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'Đang tìm nhân vật...' : 'Quay Ngay (1 Lượt)'}</span>
              </button>
            </div>
          </div>

          {/* Reveal Card / Result Section */}
          <div className="lg:col-span-6">
            {selectedResult ? (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border-2 border-rose-300 dark:border-rose-800/80 shadow-2xl p-6 space-y-4 animate-scale-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-500 text-xs font-semibold">
                    <Award className="w-4 h-4" />
                    <span>NHÂN VẬT ĐƯỢC TRIỆU HỒI</span>
                  </div>
                  <span className="text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    Duyên Phận Hôm Nay
                  </span>
                </div>

                {/* Character preview */}
                <div className="relative h-48 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  {selectedResult.avatarUrl ? (
                    <img
                      src={selectedResult.avatarUrl}
                      alt={selectedResult.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🍓
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-2xl font-bold font-serif-title">
                      {selectedResult.name}
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      {selectedResult.genres.join(' · ')}
                    </p>
                  </div>
                </div>

                {/* Dialogue preview */}
                <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-xs italic text-neutral-700 dark:text-neutral-300">
                  “{selectedResult.openingMessage || selectedResult.backstory}”
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => onSelectCharacter(selectedResult)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-neutral-700 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Xem toàn bộ hồ sơ</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleFavorite(selectedResult.id)}
                      className="p-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-500 hover:bg-rose-50 dark:hover:bg-neutral-800 transition cursor-pointer"
                      title="Thả tim"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favorites.includes(selectedResult.id) ? 'fill-rose-500' : ''
                        }`}
                      />
                    </button>

                    {selectedResult.chatLink && (
                      <a
                        href={selectedResult.chatLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <span>Trò chuyện ngay</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md rounded-3xl border border-rose-100 dark:border-neutral-800 p-8 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 dark:bg-neutral-800 flex items-center justify-center text-3xl animate-pulse">
                  🔮
                </div>
                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 font-serif-title">
                  Chưa quay gacha
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                  Hãy nhấn nút "QUAY" hoặc nút quay ngay để triệu hồi ngẫu nhiên một nhân vật bí mật từ tiệm nhà Wyn.
                </p>
              </div>
            )}

            {/* Recent Roll History */}
            {pullHistory.length > 0 && (
              <div className="mt-6 p-4 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-100 dark:border-neutral-800">
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Lịch sử quay gần đây:
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {pullHistory.map((item, idx) => (
                    <button
                      key={`${item.id}-${idx}`}
                      onClick={() => onSelectCharacter(item)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 hover:text-rose-500 whitespace-nowrap cursor-pointer transition"
                    >
                      <span>🍓</span>
                      <span className="font-medium">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
