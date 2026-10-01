import React from 'react';
import { X, Heart, ExternalLink, BookOpen, Trash2 } from 'lucide-react';
import { Character } from '../types';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  characters: Character[];
  onToggleFavorite: (charId: string) => void;
  onSelectCharacter: (char: Character) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  characters,
  onToggleFavorite,
  onSelectCharacter,
}) => {
  if (!isOpen) return null;

  const favoriteCharacters = characters.filter((c) => favorites.includes(c.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl border border-rose-100 dark:border-neutral-800 shadow-2xl p-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-title text-neutral-900 dark:text-white">
                Bộ Sưu Tập Yêu Thích Cá Nhân
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {favoriteCharacters.length} nhân vật đã lưu
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

        {/* List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {favoriteCharacters.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <span className="text-4xl block">💌</span>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                Bạn chưa lưu nhân vật nào vào mục yêu thích. Hãy bấm vào biểu tượng trái tim trên thẻ nhân vật để lưu lại nhé!
              </p>
            </div>
          ) : (
            favoriteCharacters.map((char) => (
              <div
                key={char.id}
                className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between gap-3"
              >
                <div
                  onClick={() => {
                    onClose();
                    onSelectCharacter(char);
                  }}
                  className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-700 shrink-0">
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
                      <div className="w-full h-full flex items-center justify-center text-xs">
                        🍓
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                      {char.name}
                    </h4>
                    <p className="text-xs text-neutral-400 truncate">
                      {char.genres.slice(0, 2).join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {char.chatLink && (
                    <a
                      href={char.chatLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-medium flex items-center gap-1 hover:bg-rose-600 transition"
                    >
                      <span>Chat</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <button
                    onClick={() => onToggleFavorite(char.id)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-neutral-700 transition cursor-pointer"
                    title="Xóa khỏi yêu thích"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
