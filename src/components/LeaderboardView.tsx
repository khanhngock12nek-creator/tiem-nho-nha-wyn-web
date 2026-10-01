import React, { useMemo } from 'react';
import { Trophy, Heart, ExternalLink, Sparkles, Medal, ArrowUpRight, Eye } from 'lucide-react';
import { Character } from '../types';

interface LeaderboardViewProps {
  characters: Character[];
  favorites: string[];
  onToggleFavorite: (charId: string) => void;
  onSelectCharacter: (char: Character) => void;
  onOpenGachaTab: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  characters,
  favorites,
  onToggleFavorite,
  onSelectCharacter,
  onOpenGachaTab,
}) => {
  const sortedCharacters = useMemo(() => {
    return [...characters].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }, [characters]);

  const topThree = sortedCharacters.slice(0, 3);
  const restRank = sortedCharacters.slice(3);

  const getRankBadge = (rank: number) => {
    if (rank === 0) {
      return (
        <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 text-amber-600 flex items-center justify-center font-bold text-sm shadow-sm">
          🥇
        </span>
      );
    }
    if (rank === 1) {
      return (
        <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 text-slate-600 flex items-center justify-center font-bold text-sm shadow-sm">
          🥈
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-700/30 text-amber-700 flex items-center justify-center font-bold text-sm shadow-sm">
          🥉
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono font-medium text-xs flex items-center justify-center">
        #{rank + 1}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white p-6 sm:p-8 overflow-hidden shadow-lg shadow-rose-500/10">
        <div className="absolute right-4 -bottom-6 opacity-20 pointer-events-none select-none text-9xl">
          🍓
        </div>

        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Bảng Vinh Danh Nhà Wyn</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-title">
            Bảng Xếp Hạng Nhân Vật Được Yêu Thích Nhất
          </h2>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Mỗi lượt thả tim từ bạn là một phiếu bầu quý giá giúp nhân vật thăng hạng trên bảng vàng!
          </p>
        </div>
      </div>

      {sortedCharacters.length === 0 ? (
        <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md rounded-3xl border border-dashed border-rose-200 dark:border-neutral-800 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="text-4xl animate-bounce">🏆</div>
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 font-serif-title text-lg">
            Bảng xếp hạng đang chờ nhân vật đầu tiên
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Hiện chưa có nhân vật nào trong tiệm. Quản trị viên vui lòng thêm nhân vật để bắt đầu mở bình chọn!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topThree.map((char, index) => {
                const isFav = favorites.includes(char.id);
                const podiumRanks = ['Hạng 1 - Quán Quân', 'Hạng 2 - Á Quân 1', 'Hạng 3 - Á Quân 2'];
                const cardBorders = [
                  'border-amber-300 dark:border-amber-700/80 shadow-amber-500/10',
                  'border-slate-300 dark:border-slate-700 shadow-slate-500/10',
                  'border-amber-700/30 dark:border-amber-800/40 shadow-amber-900/10',
                ];

                return (
                  <div
                    key={char.id}
                    className={`relative bg-white dark:bg-neutral-900 rounded-3xl border-2 p-5 flex flex-col justify-between shadow-lg transition-transform hover:-translate-y-1 ${cardBorders[index]}`}
                  >
                    {/* Rank Badge Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getRankBadge(index)}
                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                          {podiumRanks[index]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-rose-500 font-bold text-[10px] bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                          <Heart className="w-3 h-3 fill-rose-500" />
                          <span className="font-mono">{char.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sky-500 font-bold text-[10px] bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-900">
                          <Eye className="w-3 h-3 text-sky-500" />
                          <span className="font-mono">{char.views || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Character Avatar & Info */}
                    <div
                      onClick={() => onSelectCharacter(char)}
                      className="cursor-pointer space-y-3"
                    >
                      <div className="relative h-44 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                        {char.avatarUrl ? (
                          <img
                            src={char.avatarUrl}
                            alt={char.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-rose-300">
                            <Sparkles className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-3 right-3 text-white">
                          <h4 className="font-bold font-serif-title text-lg truncate">
                            {char.name}
                          </h4>
                          <span className="text-[11px] text-white/80 truncate block">
                            {char.genres.slice(0, 2).join(' · ')}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 italic">
                        “{char.openingMessage || char.backstory}”
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onToggleFavorite(char.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                          isFav
                            ? 'bg-rose-500 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                        <span>{isFav ? 'Đã thích' : 'Thả tim'}</span>
                      </button>

                      {char.chatLink && (
                        <a
                          href={char.chatLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-1 transition"
                        >
                          <span>Trò chuyện</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest of the Ranking Table */}
          {restRank.length > 0 && (
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl border border-rose-100 dark:border-neutral-800 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
                Bảng xếp hạng tiếp theo
              </h3>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {restRank.map((char, i) => {
                  const rankNumber = i + 3;
                  const isFav = favorites.includes(char.id);

                  return (
                    <div
                      key={char.id}
                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 rounded-xl px-2 transition"
                    >
                      <div
                        onClick={() => onSelectCharacter(char)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                      >
                        {getRankBadge(rankNumber)}

                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-700 shrink-0">
                          {char.avatarUrl ? (
                            <img
                              src={char.avatarUrl}
                              alt={char.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-rose-400">
                              🍓
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 text-sm truncate">
                            {char.name}
                          </h4>
                          <p className="text-[11px] text-neutral-400 truncate">
                            {char.genres.slice(0, 3).join(' · ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-rose-500">
                            <Heart className="w-3 h-3 fill-rose-500" />
                            <span>{char.likes || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-sky-500">
                            <Eye className="w-3 h-3 text-sky-500" />
                            <span>{char.views || 0}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleFavorite(char.id)}
                          className={`p-2 rounded-xl transition cursor-pointer ${
                            isFav
                              ? 'bg-rose-500 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-rose-500'
                          }`}
                          title="Thả tim"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                        </button>

                        {char.chatLink && (
                          <a
                            href={char.chatLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline p-1"
                          >
                            <span>Chat</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
