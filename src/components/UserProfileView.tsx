import React, { useMemo } from 'react';
import { AppUser, Character } from '../types';
import {
  Heart,
  BookOpen,
  Mail,
  LogOut,
  Sparkles,
  ArrowLeft,
  Calendar,
  Lock,
  Compass,
  Star,
  Coffee
} from 'lucide-react';

interface UserProfileViewProps {
  user: AppUser;
  favoritesCount: number;
  diaryCount: number;
  lettersCount: number;
  characters: Character[];
  favorites: string[];
  onLogout: () => void;
  onBackToHome: () => void;
  onSelectCharacter: (char: Character) => void;
  onSelectTab: (tab: any) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  favoritesCount,
  diaryCount,
  lettersCount,
  characters,
  favorites,
  onLogout,
  onBackToHome,
  onSelectCharacter,
  onSelectTab,
}) => {
  // Get favorited character objects
  const favoriteCharacters = useMemo(() => {
    return characters.filter((c) => favorites.includes(c.id));
  }, [characters, favorites]);

  // Determine provider badges
  const providerLabel = {
    google: 'Tài khoản Google 🌐',
    facebook: 'Tài khoản Facebook 🔵',
    guest: 'Độc giả Khách ✨',
  }[user.provider];

  const providerColor = {
    google: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
    facebook: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900',
    guest: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
  }[user.provider];

  const formattedDate = useMemo(() => {
    return new Date(user.createdAt).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [user.createdAt]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-rose-100 dark:border-neutral-800">
        <div>
          <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest select-none">
            Góc Cá Nhân 🍓
          </span>
          <h1 className="text-2xl font-bold font-serif-title text-neutral-900 dark:text-white mt-1.5 flex items-center gap-2">
            Trang Cá Nhân Của Bạn
          </h1>
        </div>
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-rose-500" />
          <span>Về Trang Chủ</span>
        </button>
      </div>

      {/* Main Grid Layout: Profile Card & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Info Card */}
        <div className="md:col-span-1 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl border border-rose-100 dark:border-neutral-850 p-6 flex flex-col items-center text-center space-y-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-r from-rose-100 via-pink-100 to-amber-100 dark:from-rose-950/20 dark:via-pink-950/10 dark:to-amber-950/20" />
          
          {/* Avatar frame */}
          <div className="relative z-10 pt-4">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-850 shadow-md flex items-center justify-center bg-rose-50 text-neutral-800 dark:text-neutral-100 overflow-hidden shrink-0 select-none">
              {user.photoURL.length > 2 ? (
                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl block animate-bounce duration-1000">{user.photoURL}</span>
              )}
            </div>
            
            {/* Stamp decoration */}
            <span className="absolute bottom-0 right-0 text-xl bg-white dark:bg-neutral-800 p-1 rounded-full shadow-xs border border-rose-100 dark:border-neutral-750">
              🍓
            </span>
          </div>

          <div className="space-y-1 relative z-10">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-serif-title">
              {user.displayName}
            </h2>
            <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${providerColor}`}>
              {providerLabel}
            </span>
          </div>

          <div className="w-full border-t border-rose-50 dark:border-neutral-800 pt-4 space-y-2 text-xs text-neutral-500 text-left">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Gia nhập tiệm: <strong className="text-neutral-700 dark:text-neutral-300">{formattedDate}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Cấp bậc hội viên: <strong className="text-neutral-700 dark:text-neutral-300">Khách Thân Thiết 🧸</strong></span>
            </div>
          </div>

          {/* Log Out button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-red-500 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>

        {/* Dynamic Activity Stats Grid */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Góc Lưu Giữ Kỷ Niệm Đã Lưu
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Stat Item 1: Favorites */}
            <div 
              onClick={() => onSelectTab('characters')}
              className="bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-3xl p-5 shadow-md shadow-rose-500/10 cursor-pointer transform hover:-translate-y-1 transition flex flex-col justify-between min-h-[120px]"
            >
              <Heart className="w-6 h-6 text-rose-100" />
              <div>
                <span className="text-3xl font-extrabold font-mono block">{favoritesCount}</span>
                <span className="text-[11px] font-bold opacity-90 block">Nhân vật yêu thích</span>
              </div>
            </div>

            {/* Stat Item 2: Diary entries */}
            <div 
              onClick={() => onSelectTab('roleplay-diary')}
              className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-3xl p-5 shadow-md shadow-indigo-500/10 cursor-pointer transform hover:-translate-y-1 transition flex flex-col justify-between min-h-[120px]"
            >
              <BookOpen className="w-6 h-6 text-indigo-100" />
              <div>
                <span className="text-3xl font-extrabold font-mono block">{diaryCount}</span>
                <span className="text-[11px] font-bold opacity-90 block">Nhật ký Roleplay đã ghi</span>
              </div>
            </div>

            {/* Stat Item 3: Letters sent */}
            <div 
              onClick={() => onSelectTab('letters')}
              className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-3xl p-5 shadow-md shadow-amber-500/10 cursor-pointer transform hover:-translate-y-1 transition flex flex-col justify-between min-h-[120px]"
            >
              <Mail className="w-6 h-6 text-amber-100" />
              <div>
                <span className="text-3xl font-extrabold font-mono block">{lettersCount}</span>
                <span className="text-[11px] font-bold opacity-90 block">Lá thư gửi Wyn</span>
              </div>
            </div>

          </div>

          {/* Quick jump actions section */}
          <div className="bg-white/50 dark:bg-neutral-900/40 rounded-2xl p-4 border border-rose-50 dark:border-neutral-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">Bạn muốn khám phá điều mới mẻ?</span>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => onSelectTab('tea-brewer')}
                className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Trà trị liệu 🍃</span>
              </button>
              <button
                onClick={() => onSelectTab('gacha')}
                className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-bold rounded-lg hover:bg-amber-100 transition flex items-center gap-1 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Quay định mệnh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAVORITE CHARACTERS POLAROID SECTION */}
      <div className="space-y-4 pt-4 border-t border-rose-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-serif-title text-neutral-800 dark:text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 animate-pulse fill-rose-500" />
            <span>Bộ Sưu Tập Thẻ Polaroid Yêu Thích</span>
          </h3>
          <span className="text-[11px] text-neutral-400 font-bold">
            {favoriteCharacters.length} nhân vật
          </span>
        </div>

        {favoriteCharacters.length === 0 ? (
          <div className="bg-white/40 dark:bg-neutral-900/40 rounded-3xl p-8 text-center border border-dashed border-rose-200 dark:border-neutral-800 space-y-2 flex flex-col items-center">
            <span className="text-3xl">🧸</span>
            <p className="text-xs text-neutral-500">Bạn chưa thả tim nhân vật nào!</p>
            <button
              onClick={() => onSelectTab('characters')}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 underline mt-1 cursor-pointer"
            >
              Xem danh sách nhân vật và thả tim ngay nha!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favoriteCharacters.map((char) => (
              <div
                key={char.id}
                onClick={() => onSelectCharacter(char)}
                className="bg-white dark:bg-neutral-900 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group flex flex-col"
              >
                {/* Polaroid square image */}
                <div className="aspect-square rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-850 bg-neutral-50 shrink-0">
                  <img
                    src={char.avatarUrl}
                    alt={char.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Polaroid text margin */}
                <div className="pt-2 text-center flex-1 flex flex-col justify-center min-w-0">
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 truncate font-serif">
                    {char.name}
                  </h4>
                  <div className="flex items-center justify-center gap-1 text-[9px] text-neutral-400 mt-0.5">
                    <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                    <span>{char.likes} tim</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
