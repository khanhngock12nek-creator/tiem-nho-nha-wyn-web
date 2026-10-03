import React, { useState, useMemo } from 'react';
import { Search, Heart, ExternalLink, Sparkles, Filter, Plus, BookOpen, MessageSquare, Trash2, Edit3, Eye } from 'lucide-react';
import { Character, CustomGenre } from '../types';
import { GENRES_LIST, GENRE_THEMES } from '../constants/genres';

interface CharacterCardsViewProps {
  characters: Character[];
  favorites: string[];
  onToggleFavorite: (charId: string) => void;
  onSelectCharacter: (char: Character) => void;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onDeleteCharacter?: (charId: string) => void;
  onEditCharacter?: (char: Character) => void;
  initialGenreFilter?: string | null;
  customGenres: CustomGenre[];
}

export const CharacterCardsView: React.FC<CharacterCardsViewProps> = ({
  characters,
  favorites,
  onToggleFavorite,
  onSelectCharacter,
  isAdmin,
  onOpenAdminModal,
  onDeleteCharacter,
  onEditCharacter,
  initialGenreFilter,
  customGenres,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenreFilter || 'ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Character of the Day logic: pick one based on the current date
  const characterOfTheDay = useMemo(() => {
    if (characters.length === 0) return null;
    const today = new Date();
    // Create a seed based on day, month, year
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    // Simple deterministic pseudo-random index
    const index = seed % characters.length;
    return characters[index];
  }, [characters]);

  // Sync if initialGenreFilter changes
  React.useEffect(() => {
    if (initialGenreFilter) {
      setSelectedGenre(initialGenreFilter);
    }
  }, [initialGenreFilter]);

  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.backstory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.openingMessage.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre =
        selectedGenre === 'ALL' || char.genres.includes(selectedGenre);

      const matchesFav = !onlyFavorites || favorites.includes(char.id);

      return matchesSearch && matchesGenre && matchesFav;
    });
  }, [characters, searchQuery, selectedGenre, onlyFavorites, favorites]);

  return (
    <div className="space-y-6">
      {/* Header and Filter Control Bar */}
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-rose-100/80 dark:border-neutral-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Thẻ Nhân Vật</span>
              <span className="text-xs font-sans font-normal text-rose-500 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
                {characters.length} nhân vật
              </span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Khám phá danh sách nhân vật, đọc tin nhắn mở đầu và trò chuyện riêng
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Only Favorites */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border ${
                onlyFavorites
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-rose-300'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : 'text-rose-500'}`} />
              <span>Yêu thích ({favorites.length})</span>
            </button>

            {/* Admin Add Shortcut */}
            {isAdmin && (
              <button
                onClick={onOpenAdminModal}
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Nhân Vật</span>
              </button>
            )}
          </div>
        </div>

        {/* Search input & Genre scroll */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nhân vật, tính cách, lời mở đầu..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-200 text-neutral-800 dark:text-neutral-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>

          {selectedGenre !== 'ALL' && (
            <button
              onClick={() => setSelectedGenre('ALL')}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium px-2 py-1 cursor-pointer whitespace-nowrap self-center"
            >
              Đặt lại bộ lọc ({selectedGenre})
            </button>
          )}
        </div>

        {/* Fast Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedGenre('ALL')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition cursor-pointer border ${
              selectedGenre === 'ALL'
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-transparent hover:bg-neutral-200/70'
            }`}
          >
            Tất cả thể loại
          </button>
          {GENRES_LIST.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition cursor-pointer border ${
                selectedGenre === genre
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-transparent hover:bg-neutral-200/70'
              }`}
            >
              {genre}
            </button>
          ))}
          {customGenres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.name)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition cursor-pointer border ${
                selectedGenre === genre.name
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-50 dark:bg-neutral-850 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50 hover:bg-rose-100'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Character of the Day Section */}
      {characterOfTheDay && !searchQuery && selectedGenre === 'ALL' && !onlyFavorites && (
        <div className="relative group animate-fade-in mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 via-pink-400 to-sky-400 rounded-[2rem] blur opacity-15 group-hover:opacity-30 transition duration-1000 group-hover:duration-500"></div>
          <div className="relative bg-white dark:bg-neutral-900 rounded-[2rem] border-2 border-rose-100 dark:border-neutral-800 shadow-xl p-3 sm:p-4 overflow-hidden">
            
            {/* Inner Profile Frame - The "Khung bên trong" requested by user */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-6">
              
              {/* Left: The Identity Frame Box */}
              <div className="relative flex-shrink-0 w-full md:w-auto">
                <div className="relative p-2 rounded-3xl bg-gradient-to-br from-rose-50 to-sky-50 dark:from-rose-950/20 dark:to-sky-950/20 border-2 border-white dark:border-neutral-800 shadow-inner overflow-hidden flex items-center gap-4 md:flex-col md:items-start md:min-w-[180px] group-hover:border-rose-300 transition-colors">
                  
                  {/* Small Character Photo */}
                  <div 
                    onClick={() => onSelectCharacter(characterOfTheDay)}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-neutral-700 shadow-md cursor-pointer shrink-0"
                  >
                    {characterOfTheDay.avatarUrl ? (
                      <img
                        src={characterOfTheDay.avatarUrl}
                        alt={characterOfTheDay.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-rose-300" />
                      </div>
                    )}
                  </div>

                  {/* Name & Genres inside the Frame */}
                  <div className="flex-1 min-w-0 md:w-full">
                    <h3 className="text-base sm:text-lg md:text-xl font-black font-serif-title text-neutral-900 dark:text-white truncate md:whitespace-normal line-clamp-1 md:line-clamp-2 italic tracking-tighter uppercase mb-1">
                      {characterOfTheDay.name}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {characterOfTheDay.genres.slice(0, 3).map((g) => (
                        <span key={g} className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500 text-white shadow-xs uppercase tracking-tighter">
                          #{g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Badge Label */}
                  <div className="absolute top-0 right-0 p-1">
                     <span className="text-[7px] font-black text-rose-400/60 uppercase tracking-widest pointer-events-none select-none">FEATURED_ID</span>
                  </div>
                </div>

                {/* Floating "Nhân vật của ngày" tag */}
                <div className="absolute -top-2 -left-2 z-10">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider shadow-lg shadow-rose-500/30">
                    <Sparkles className="w-2.5 h-2.5" />
                    HÔM NAY
                  </span>
                </div>
              </div>

              {/* Right: Detailed content & CTA */}
              <div className="flex-1 space-y-4">
                <div className="relative p-4 sm:p-5 rounded-2xl bg-neutral-50/50 dark:bg-neutral-850/50 border border-neutral-100 dark:border-neutral-800 italic">
                  <div className="absolute -top-3 left-6 px-2 bg-white dark:bg-neutral-900 text-[10px] font-bold text-neutral-400 border border-neutral-100 dark:border-neutral-800 rounded-lg">MESSAGE_SIGNAL</div>
                  <p className="text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-200 leading-relaxed font-serif pt-1 line-clamp-3">
                    “{characterOfTheDay.openingMessage || characterOfTheDay.backstory}”
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onSelectCharacter(characterOfTheDay)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-black italic tracking-widest uppercase shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    BẢN HỒ SƠ
                  </button>
                  
                  {characterOfTheDay.chatLink && (
                    <a
                      href={characterOfTheDay.chatLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border-2 border-rose-100 dark:border-neutral-700 text-rose-600 dark:text-rose-400 text-xs font-black italic tracking-widest uppercase hover:bg-rose-50 dark:hover:bg-neutral-750 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                    >
                      <span>KẾT NỐI</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <div className="ml-auto hidden sm:flex items-center gap-3 pr-2">
                     <div className="flex flex-col items-end">
                       <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">POPULARITY</span>
                       <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                          <span className="text-xs font-black text-rose-600 italic">{characterOfTheDay.likes || 0}</span>
                       </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative background circle */}
            <div className="absolute top-1/2 right-0 w-64 h-64 bg-sky-300/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Characters Cards Grid */}
      {filteredCharacters.length === 0 ? (
        <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm rounded-3xl border border-dashed border-rose-200 dark:border-neutral-800 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 dark:bg-neutral-800 flex items-center justify-center text-3xl">
            🍓
          </div>
          <h3 className="text-lg font-semibold font-serif-title text-neutral-800 dark:text-white">
            {characters.length === 0
              ? 'Tiệm hiện chưa có hồ sơ nhân vật nào'
              : 'Không tìm thấy nhân vật phù hợp'}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
            {characters.length === 0
              ? 'Hồ sơ ban đầu đang để trống. Quản trị viên có thể nhấn nút "Quản trị viên" ở góc để thêm nhân vật hoặc nạp nhanh nhân vật mẫu!'
              : 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc thể loại xem sao nhé.'}
          </p>

          {isAdmin ? (
            <button
              onClick={onOpenAdminModal}
              className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium inline-flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm nhân vật đầu tiên ngay</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="px-4 py-2 rounded-xl border border-rose-200 dark:border-neutral-700 text-rose-600 dark:text-rose-400 text-xs font-medium inline-flex items-center gap-1.5 hover:bg-rose-50 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              <span>Đăng nhập Quản trị viên</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((char) => {
            const isFav = favorites.includes(char.id);

            return (
              <div
                key={char.id}
                className="group relative bg-white dark:bg-neutral-900 rounded-3xl border border-rose-100/90 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Visual Avatar / Card Header - Scrollable to see full art */}
                <div
                  className="relative h-64 sm:h-72 bg-neutral-100 dark:bg-neutral-800 overflow-y-auto scrollbar-none cursor-pointer group/image"
                  onClick={() => onSelectCharacter(char)}
                >
                  {char.avatarUrl ? (
                    <img
                      src={char.avatarUrl}
                      alt={char.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto block transition-transform duration-500 group-hover/image:scale-[1.02]"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-rose-400 bg-rose-50 dark:bg-neutral-850">
                      <Sparkles className="w-10 h-10 mb-2 opacity-80" />
                      <span className="text-xs font-medium">Tiệm Nhà Wyn</span>
                    </div>
                  )}

                  {/* Gradient Scrim - Sticky to bottom */}
                  <div className="sticky bottom-0 inset-x-0 h-20 bg-gradient-to-t from-neutral-950/90 via-neutral-950/40 to-transparent pointer-events-none" />

                  {/* Top floating actions - Sticky to top */}
                  <div className="sticky top-3 right-3 flex items-center justify-end gap-1.5 z-10 h-0 overflow-visible pr-3">
                    {isAdmin && (
                      <div className="flex gap-1.5 h-fit">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEditCharacter) onEditCharacter(char);
                          }}
                          className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition cursor-pointer shadow-sm"
                          title="Sửa nhân vật"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDeleteCharacter) onDeleteCharacter(char.id);
                          }}
                          className="p-2 rounded-full bg-red-600/70 hover:bg-red-700 text-white backdrop-blur-md transition cursor-pointer shadow-sm"
                          title="Xóa nhân vật"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Heart button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(char.id);
                      }}
                      className={`p-2 rounded-full backdrop-blur-md transition cursor-pointer h-fit ${
                        isFav
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-black/35 hover:bg-black/60 text-white'
                      }`}
                      title={isFav ? 'Bỏ thích' : 'Yêu thích'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Bottom info on image - Sticky to bottom */}
                  <div className="sticky bottom-3 left-4 right-4 text-white z-10 h-0 overflow-visible flex flex-col justify-end pb-3 px-4">
                    <h3 className="text-xl font-bold font-serif-title tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] truncate">
                      {char.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] text-white/90 mt-1">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                        <span className="font-mono">{char.likes || 0}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-sky-400" />
                        <span className="font-mono">{char.views || 0}</span>
                      </span>
                      <span>·</span>
                      <span className="truncate">{char.genres[0] || 'Chưa phân loại'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Genres pills */}
                    <div className="flex flex-wrap gap-1">
                      {char.genres.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 dark:bg-neutral-800 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-neutral-700"
                        >
                          {g}
                        </span>
                      ))}
                      {char.genres.length > 3 && (
                        <span className="text-[10px] text-neutral-400 px-1 py-0.5">
                          +{char.genres.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Opening message sneak peek */}
                    {char.openingMessage && (
                      <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 text-xs italic text-neutral-600 dark:text-neutral-300 line-clamp-2">
                        “{char.openingMessage}”
                      </div>
                    )}

                    {/* Backstory sneak peek */}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {char.backstory}
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectCharacter(char)}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-rose-50 dark:hover:bg-neutral-800 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Xem hồ sơ</span>
                    </button>

                    {char.chatLink ? (
                      <a
                        href={char.chatLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <span>Trò chuyện</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-neutral-400">Chưa có link</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
