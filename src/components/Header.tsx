import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Heart,
  Shield,
  Bell,
  Sliders,
  MoreHorizontal,
  BookOpen,
  Camera,
  Check,
  Upload,
  X,
} from 'lucide-react';
import { ActiveTab, SiteNotification, AppUser } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenThemeSettings: () => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  favoritesCount: number;
  hasNewAnnouncements?: boolean;
  notifications: SiteNotification[];
  onOpenFavorites: () => void;
  customLogo: string | null;
  onLogoChange: (logo: string | null) => void;
  currentUser: AppUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isDarkMode,
  onToggleTheme,
  onOpenThemeSettings,
  onOpenAdmin,
  isAdmin,
  favoritesCount,
  hasNewAnnouncements = false,
  onOpenFavorites,
  customLogo,
  onLogoChange,
  currentUser,
  onLogout,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onLogoChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  };

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'bxh', label: 'BXH', icon: '🏆' },
    { id: 'gacha', label: 'Quay Gacha', icon: '🔮' },
    { id: 'letters', label: 'Nơi Gửi Thư', icon: '💌' },
    { id: 'genres', label: 'Thể Loại', icon: '🏷️' },
    { id: 'characters', label: 'Thẻ Nhân Vật', icon: '✨' },
  ];

  const moreFeatures: { id: ActiveTab; label: string; subLabel: string; icon: string }[] = [
    {
      id: 'roleplay-diary',
      label: 'Nhật Ký Roleplay & Trạng Tính Chat',
      subLabel: 'Ghi chú cốt truyện, theo dõi tình trạng trò chuyện cùng bot',
      icon: '📖',
    },
    {
      id: 'character-puzzle',
      label: 'Xếp Hình Săn Ảnh Nhân Vật',
      subLabel: 'Ghép tranh giải trí cùng các nhân vật, nhận ngay thẻ ảnh cực nét',
      icon: '🧩',
    },
    {
      id: 'sticky-wall',
      label: 'Bức Tường Lời Nhắn Ngọt Ngào',
      subLabel: 'Ghi giấy note, ghim lời nhắn dễ thương gửi đến Tiệm thời gian thực',
      icon: '📌',
    },
    {
      id: 'tea-brewer',
      label: 'Quán Trà Trị Liệu Hơi Thở',
      subLabel: 'Thiền hít thở sâu, tự pha trà dâu thảo mộc chữa lành và nhận quẻ bói',
      icon: '🍃',
    },
    {
      id: 'wyn-board',
      label: 'Bảng Tin / Góc Thông Báo của Wyn',
      subLabel: 'Lịch ra mắt nhân vật mới, tâm tình & tin tức ngọt ngào',
      icon: '📢',
    },
    {
      id: 'polaroid',
      label: 'Xuất Thẻ Nhân Vật Phong Cách Polaroid',
      subLabel: 'Thiết kế & tải ảnh thẻ chụp lấy liền vintage cực xinh',
      icon: '📸',
    },
  ];

  const isMoreTabActive = ['roleplay-diary', 'character-puzzle', 'sticky-wall', 'tea-brewer', 'wyn-board', 'polaroid'].includes(activeTab);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-rose-100 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark with Custom Logo Upload for Admin */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex items-center justify-center rounded-full transition-all duration-200 ${
              isAdmin ? 'cursor-pointer hover:ring-2 hover:ring-rose-400' : ''
            } ${isDragging ? 'ring-4 ring-rose-500 scale-110 bg-rose-50' : ''}`}
            onClick={(e) => {
              if (isAdmin) {
                e.stopPropagation();
                fileInputRef.current?.click();
              } else {
                onTabChange('characters');
              }
            }}
            title={isAdmin ? 'Kéo thả ảnh hoặc click để đổi avatar Dâu Tây' : 'Bấm để về Trang Chủ'}
          >
            {customLogo ? (
              <img
                src={customLogo}
                alt="Logo"
                className="w-12 h-12 rounded-full object-cover shadow-sm shrink-0 border border-rose-200 dark:border-neutral-700"
              />
            ) : (
              <span className="text-3xl hover:scale-110 transition-transform shrink-0 select-none">🍓</span>
            )}

            {/* Hidden Input File */}
            {isAdmin && (
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleLogoUpload(e.target.files[0]);
                  }
                }}
                accept="image/*"
                className="hidden"
              />
            )}

            {/* Pencil edit indicator badge for Admin */}
            {isAdmin && (
              <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 border border-white dark:border-neutral-900 shadow-xs scale-90">
                <Camera className="w-2.5 h-2.5" />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                onClick={() => onTabChange('characters')}
                className="text-base sm:text-lg font-bold font-serif-title tracking-tight text-neutral-900 dark:text-white whitespace-nowrap cursor-pointer hover:text-rose-500 transition-colors select-none"
              >
                Tiệm Nhỏ Nhà Wyn
              </span>
              
              {/* Reset Custom Logo Button for Admin */}
              {isAdmin && customLogo && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogoChange(null);
                  }}
                  className="p-1 rounded-md text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                  title="Khôi phục logo Dâu Tây mặc định 🍓"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 font-medium leading-tight select-none mt-[-2px]">
              Nơi tiệm gửi gắm những anh chồng nhỏ
            </span>
            {isAdmin && (
              <span className="text-[9px] text-rose-500 font-bold tracking-wider uppercase select-none mt-0.5">
                Admin Custom Mode
              </span>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation Links (BXH, Quay Gacha, Nơi Gửi Thư, Thể Loại, Thẻ Nhân Vật) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-neutral-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Favorites, Theme, Brightness, Admin & 3-Dots More Menu) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Favorites quick counter */}
          <button
            onClick={onOpenFavorites}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer relative"
            title="Nhân vật yêu thích"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold font-mono flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Quick Theme Mode Toggle (Sáng / Tối) */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            title={isDarkMode ? 'Đang ở chế độ Tối (Bấm để chuyển Sáng)' : 'Đang ở chế độ Sáng (Bấm để chuyển Tối)'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-600" />
            )}
          </button>

          {/* Detailed Brightness & Theme Settings */}
          <button
            onClick={onOpenThemeSettings}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            title="Tùy chỉnh độ sáng tối theo sở thích"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Admin shortcut button */}
          <button
            onClick={onOpenAdmin}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isAdmin
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title={isAdmin ? 'Bảng quản trị viên (Đã đăng nhập)' : 'Quản trị viên'}
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* User Profile Quick Avatar Button */}
          {currentUser && (
            <button
              onClick={() => onTabChange('profile')}
              className={`w-8 h-8 rounded-full border transition flex items-center justify-center cursor-pointer overflow-hidden relative shrink-0 ${
                activeTab === 'profile'
                  ? 'border-rose-500 ring-2 ring-rose-300'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-rose-400 bg-neutral-50 dark:bg-neutral-800'
              }`}
              title={`Xem trang cá nhân của ${currentUser.displayName}`}
            >
              {currentUser.photoURL.length > 2 ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg leading-none shrink-0 select-none pb-0.5">{currentUser.photoURL}</span>
              )}
            </button>
          )}

          {/* 3-DOTS MORE MENU BUTTON (Dấu ba chấm ở góc) */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center relative ${
                isMoreMenuOpen || isMoreTabActive
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-neutral-700 dark:text-neutral-200 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700'
              }`}
              title="Khám phá thêm tính năng (Dấu 3 chấm)"
            >
              <MoreHorizontal className="w-4 h-4" />
              {/* Notification dot */}
              {hasNewAnnouncements && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-neutral-900 animate-pulse" />
              )}
            </button>

            {/* 3-Dots Popover Dropdown */}
            {isMoreMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-3xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-rose-200 dark:border-neutral-750 shadow-2xl p-2.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-rose-100 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-100">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>Góc Khám Phá Thêm</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 font-mono">
                    {moreFeatures.length} mục
                  </span>
                </div>

                <div className="space-y-1 pt-1 max-h-[320px] sm:max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                  {moreFeatures.map((feat) => {
                    const isSelected = activeTab === feat.id;

                    return (
                      <button
                        key={feat.id}
                        type="button"
                        onClick={() => {
                          onTabChange(feat.id);
                          setIsMoreMenuOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-2xl text-left transition cursor-pointer flex items-start gap-3 group ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-neutral-800 border border-rose-200 dark:border-neutral-700'
                            : 'hover:bg-rose-50/60 dark:hover:bg-neutral-800/60'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-800 border border-rose-100 dark:border-neutral-700 flex items-center justify-center text-base shadow-2xs shrink-0 group-hover:scale-110 transition-transform">
                          {feat.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4
                              className={`text-xs font-bold truncate flex items-center gap-1.5 ${
                                isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-800 dark:text-neutral-100'
                              }`}
                            >
                              {feat.label}
                              {feat.id === 'wyn-board' && hasNewAnnouncements && (
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                              )}
                            </h4>
                            {isSelected && <Check className="w-3 h-3 text-rose-500 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mt-0.5">
                            {feat.subLabel}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Logout button at the very bottom of the popover */}
                {currentUser && onLogout && (
                  <div className="pt-2 border-t border-rose-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full p-2.5 rounded-2xl text-left transition cursor-pointer flex items-center gap-3 bg-red-50/50 hover:bg-red-50 dark:bg-red-950/10 dark:hover:bg-red-950/25 border border-red-100/50 dark:border-red-900/40 text-red-600 dark:text-red-400 font-bold group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-850 border border-red-100 dark:border-red-900 flex items-center justify-center text-base shadow-2xs shrink-0 group-hover:scale-110 transition-transform">
                        🚪
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate">
                          Đăng xuất tài khoản
                        </h4>
                        <p className="text-[10px] text-red-500/80 dark:text-red-400/80 mt-0.5 font-normal">
                          Thoát và khóa cổng tiệm (0712)
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-rose-100 dark:border-neutral-800 px-2 py-1.5 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1 ${
                isActive
                  ? 'bg-rose-500 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-rose-500'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

