/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Character, Letter, ActiveTab, SiteNotification, RoleplayEntry, WynAnnouncement, AppUser, SiteConfig, CustomGenre } from './types';
import {
  getStoredCharacters,
  saveStoredCharacters,
  getStoredFavorites,
  saveStoredFavorites,
  toggleFavorite,
  getStoredLetters,
  saveStoredLetters,
  deleteStoredLetter,
  deleteMultipleStoredLetters,
  clearAllStoredLetters,
  isGateUnlocked,
  setGateUnlocked,
  addNotification,
  getStoredLogo,
  saveStoredLogo,
  getStoredRoleplayEntries,
  saveStoredRoleplayEntries,
  setRoleplayEntry,
  deleteRoleplayEntry,
  getStoredAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
  likeAnnouncement,
  getStoredLastReadTimestamp,
  saveStoredLastReadTimestamp,
} from './utils/storage';
import { AccessGate } from './components/AccessGate';
import { StrawberryBackground } from './components/StrawberryBackground';
import { MusicPlayer } from './components/MusicPlayer';
import { Header } from './components/Header';
import { CharacterCardsView } from './components/CharacterCardsView';
import { LeaderboardView } from './components/LeaderboardView';
import { GachaWheel } from './components/GachaWheel';
import { LetterBoxView } from './components/LetterBoxView';
import { GenreExplorerView } from './components/GenreExplorerView';
import { CharacterDetailModal } from './components/CharacterDetailModal';
import { AdminModal } from './components/AdminModal';
import { FavoritesModal } from './components/FavoritesModal';
import { NotificationToast } from './components/NotificationToast';
import { ThemeSettingsModal, ThemeMode } from './components/ThemeSettingsModal';
import { VerticalBrightnessWidget } from './components/VerticalBrightnessWidget';
import { RoleplayDiaryView } from './components/RoleplayDiaryView';
import { WynNoticeBoardView } from './components/WynNoticeBoardView';
import { PolaroidCardGeneratorView } from './components/PolaroidCardGeneratorView';
import { CharacterPuzzleView } from './components/CharacterPuzzleView';
import { StickyNotesWall } from './components/StickyNotesWall';
import { Shield, Lock, Sliders, Image as ImageIcon, Upload } from 'lucide-react';
import { 
  subscribeCharacters, 
  saveCharacterToFirestore, 
  deleteCharacterFromFirestore, 
  likeCharacterInFirestore,
  incrementCharacterViews,
  subscribeSiteConfig,
  saveSiteConfigToFirestore,
  subscribeCustomGenres,
  saveCustomGenreToFirestore,
  deleteCustomGenreFromFirestore,
  subscribeAnnouncements,
  saveAnnouncementToFirestore,
  deleteAnnouncementFromFirestore,
  likeAnnouncementInFirestore,
  auth
} from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { UserProfileView } from './components/UserProfileView';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { TeaBrewer } from './components/TeaBrewer';

export default function App() {
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('characters');

  // Theme & Brightness state
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [berryOpacity, setBerryOpacity] = useState<number>(80);
  const [berrySpeed, setBerrySpeed] = useState<number>(1.35);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  // Core Data
  const [characters, setCharacters] = useState<Character[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string | null>(null);

  // Admin & Modals
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState<boolean>(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  // New Extension States
  const [customLogo, setCustomLogo] = useState<string | null>(getStoredLogo());
  const [roleplayEntries, setRoleplayEntries] = useState<Record<string, RoleplayEntry>>(getStoredRoleplayEntries());
  const [announcements, setAnnouncements] = useState<WynAnnouncement[]>([]);
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(getStoredLastReadTimestamp());
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({ id: 'main', updatedAt: Date.now() });
  const [customGenres, setCustomGenres] = useState<CustomGenre[]>([]);

  const hasNewAnnouncements = announcements.some(a => a.createdAt > lastReadTimestamp);

  const handleTabChange = (tab: ActiveTab) => {
    if (tab !== 'characters') setSelectedGenreFilter(null);
    setActiveTab(tab);
    if (tab === 'wyn-board') {
      const now = Date.now();
      setLastReadTimestamp(now);
      saveStoredLastReadTimestamp(now);
    }
  };

  const handleViewCharacter = (char: Character) => {
    setSelectedCharacter(char);
    incrementCharacterViews(char.id).catch(console.error);
  };

  const handleConfigChange = async (updates: Partial<SiteConfig>) => {
    const newConfig = { ...siteConfig, ...updates, updatedAt: Date.now() };
    setSiteConfig(newConfig);
    try {
      await saveSiteConfigToFirestore(newConfig);
    } catch (error) {
      console.error("Failed to save site config", error);
    }
  };

  // Apply theme class to document
  const applyTheme = (mode: ThemeMode) => {
    let shouldBeDark = false;
    if (mode === 'dark') {
      shouldBeDark = true;
    } else if (mode === 'light') {
      shouldBeDark = false;
    } else {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Listen to Auth State Changes
  useEffect(() => {
    // Check localStorage for logged in guest user or facebook user
    const storedUser = localStorage.getItem('wyn_current_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        setUnlocked(true);
      } catch (e) {
        // ignore
      }
    }

    // Subscribe to Google Firebase Auth changes
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Độc giả Google ✨',
          photoURL: firebaseUser.photoURL || '🍓',
          email: firebaseUser.email || undefined,
          provider: 'google',
          createdAt: Date.now(),
        };
        setCurrentUser(appUser);
        localStorage.setItem('wyn_current_user', JSON.stringify(appUser));
        setUnlocked(true);
        if (firebaseUser.email === "khanhngock12nek@gmail.com") {
          setIsAdmin(true);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Initialize gate status, dark theme, and storage
  useEffect(() => {
    // Check gate status
    const gateStatus = isGateUnlocked();
    setUnlocked(gateStatus);

    // Initial theme check
    const savedMode = (localStorage.getItem('wyn_theme_mode') as ThemeMode) || 'light';
    const savedBrightness = Number(localStorage.getItem('wyn_site_brightness')) || 100;
    const savedBerryOpacity = Number(localStorage.getItem('wyn_berry_opacity')) || 80;
    const savedBerrySpeed = Number(localStorage.getItem('wyn_berry_speed')) || 1.35;

    setThemeMode(savedMode);
    setBrightness(savedBrightness);
    setBerryOpacity(savedBerryOpacity);
    setBerrySpeed(savedBerrySpeed);
    applyTheme(savedMode);

    // System dark mode listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      const currentSavedMode = (localStorage.getItem('wyn_theme_mode') as ThemeMode) || 'light';
      if (currentSavedMode === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Load initial data
    setFavorites(getStoredFavorites());
    setLetters(getStoredLetters());
    setCustomLogo(getStoredLogo());
    setRoleplayEntries(getStoredRoleplayEntries());
    setAnnouncements(getStoredAnnouncements());
    setSiteConfig({ id: 'main', updatedAt: Date.now() });

    // Subscribe to Firestore for characters
    const unsubscribeChars = subscribeCharacters(
      async (firestoreChars) => {
        const localChars = getStoredCharacters();
        if (firestoreChars.length === 0 && localChars.length > 0) {
          console.log("Migrating local characters to Firestore...");
          for (const char of localChars) {
            await saveCharacterToFirestore(char);
          }
        } else {
          setCharacters(firestoreChars);
        }
      },
      (err) => {
        console.error("Failed to subscribe to characters", err);
      }
    );

    // Subscribe to Site Configuration
    const unsubscribeConfig = subscribeSiteConfig(
      (config) => {
        setSiteConfig(config);
        if (config.customLogo) setCustomLogo(config.customLogo);
      },
      (err) => {
        console.error("Failed to subscribe to site config", err);
      }
    );

    // Listen to storage sync events
    const onFavsUpdated = () => setFavorites(getStoredFavorites());
    const onLettersUpdated = () => setLetters(getStoredLetters());
    const onLogoUpdated = () => setCustomLogo(getStoredLogo());

    window.addEventListener('wyn_favorites_updated', onFavsUpdated);
    window.addEventListener('wyn_letters_updated', onLettersUpdated);
    window.addEventListener('wyn_logo_updated', onLogoUpdated);

    // Subscribe to Custom Genres
    const unsubscribeGenres = subscribeCustomGenres(setCustomGenres);

    // Subscribe to Announcements
    const unsubscribeAnnouncements = subscribeAnnouncements(setAnnouncements);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      unsubscribeChars();
      unsubscribeConfig();
      unsubscribeGenres();
      unsubscribeAnnouncements();
      window.removeEventListener('wyn_favorites_updated', onFavsUpdated);
      window.removeEventListener('wyn_letters_updated', onLettersUpdated);
      window.removeEventListener('wyn_logo_updated', onLogoUpdated);
    };
  }, []);

  // Custom Logo and Extensions Handlers
  const handleLogoChange = (newLogo: string | null) => {
    saveStoredLogo(newLogo);
    setCustomLogo(newLogo);
  };

  const handleSaveRoleplayEntry = (entry: RoleplayEntry) => {
    setRoleplayEntry(entry);
    setRoleplayEntries(getStoredRoleplayEntries());
  };

  const handleDeleteRoleplayEntry = (characterId: string) => {
    deleteRoleplayEntry(characterId);
    setRoleplayEntries(getStoredRoleplayEntries());
  };

  const handleAddAnnouncement = async (item: Omit<WynAnnouncement, 'id' | 'createdAt' | 'likes'>) => {
    const newAnnouncement: WynAnnouncement = {
      ...item,
      id: `announce-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      likes: 0
    };
    try {
      await saveAnnouncementToFirestore(newAnnouncement);
      addNotification({
        title: 'Thông báo mới!',
        message: 'Thông báo của bạn đã được đăng lên bảng tin.',
      });
    } catch (error) {
      console.error("Failed to add announcement", error);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncementFromFirestore(id);
    } catch (error) {
      console.error("Failed to delete announcement", error);
    }
  };

  const handleLikeAnnouncement = async (id: string) => {
    try {
      await likeAnnouncementInFirestore(id);
    } catch (error) {
      console.error("Failed to like announcement", error);
    }
  };

  const handleSaveGenre = async (genre: CustomGenre) => {
    try {
      await saveCustomGenreToFirestore(genre);
    } catch (error) {
      console.error("Failed to save genre", error);
    }
  };

  const handleDeleteGenre = async (genreId: string) => {
    try {
      await deleteCustomGenreFromFirestore(genreId);
    } catch (error) {
      console.error("Failed to delete genre", error);
    }
  };

  // Theme mode change handler
  const handleThemeModeChange = (newMode: ThemeMode) => {
    setThemeMode(newMode);
    localStorage.setItem('wyn_theme_mode', newMode);
    applyTheme(newMode);
  };

  // Quick toggle between Light and Dark
  const toggleTheme = () => {
    const nextMode: ThemeMode = isDarkMode ? 'light' : 'dark';
    handleThemeModeChange(nextMode);
  };

  // Brightness handler
  const handleBrightnessChange = (val: number) => {
    setBrightness(val);
    localStorage.setItem('wyn_site_brightness', val.toString());
  };

  // Berry opacity handler
  const handleBerryOpacityChange = (val: number) => {
    setBerryOpacity(val);
    localStorage.setItem('wyn_berry_opacity', val.toString());
  };

  // Berry flight speed handler
  const handleBerrySpeedChange = (val: number) => {
    setBerrySpeed(val);
    localStorage.setItem('wyn_berry_speed', val.toString());
  };

  // Gate Unlock Handler
  const handleGateUnlock = (user: AppUser) => {
    setGateUnlocked(true);
    setCurrentUser(user);
    localStorage.setItem('wyn_current_user', JSON.stringify(user));
    setUnlocked(true);
  };

  // User Log out handler
  const handleUserLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('wyn_current_user');
    setCurrentUser(null);
    setGateUnlocked(false);
    setUnlocked(false);
    setActiveTab('characters');
  };

  // Favorite toggle
  const handleToggleFavorite = async (charId: string) => {
    const { isFav, newFavorites } = toggleFavorite(charId);
    setFavorites(newFavorites);
    await likeCharacterInFirestore(charId, isFav ? 1 : -1);
  };

  // Save Character (Add / Edit by Admin)
  const handleSaveCharacter = async (char: Character, isNew: boolean) => {
    await saveCharacterToFirestore(char);
    if (isNew) {
      // Automatically trigger notification for new character
      addNotification({
        title: 'Nhân vật mới đã xuất hiện!',
        message: `Chào đón ${char.name} vừa bước vào Tiệm Nhỏ Nhà Wyn. Nhấn để đọc hồ sơ và trò chuyện ngay!`,
        characterId: char.id,
      });
    }
    setIsAdminModalOpen(false);
    setEditingCharacter(null);
  };

  // Delete Character
  const handleDeleteCharacter = async (charId: string) => {
    await deleteCharacterFromFirestore(charId);
  };

  // Seed sample characters
  const handleSeedCharacters = async (sampleChars: Character[]) => {
    for (const char of sampleChars) {
      await saveCharacterToFirestore(char);
    }
    addNotification({
      title: 'Đã nạp nhân vật mẫu!',
      message: '5 nhân vật mẫu đa dạng thể loại đã được kích hoạt trong tiệm.',
    });
  };

  // Add guestbook letter
  const handleAddLetter = (letterData: Omit<Letter, 'id' | 'createdAt'>) => {
    const current = getStoredLetters();
    const newLetter: Letter = {
      ...letterData,
      id: `letter-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    const updated = [newLetter, ...current];
    saveStoredLetters(updated);
    setLetters(updated);
  };

  // Like letter
  const handleLikeLetter = (letterId: string) => {
    const current = getStoredLetters();
    const updated = current.map((l) =>
      l.id === letterId ? { ...l, likesCount: (l.likesCount || 0) + 1 } : l
    );
    saveStoredLetters(updated);
    setLetters(updated);
  };

  // Delete private letter by Admin
  const handleDeleteLetter = (letterId: string) => {
    const updated = deleteStoredLetter(letterId);
    setLetters(updated);
    addNotification({
      title: 'Đã xóa lá thư',
      message: 'Lá thư đã được xóa vĩnh viễn khỏi hòm thư quản trị viên.',
    });
  };

  // Delete multiple selected letters by Admin
  const handleDeleteMultipleLetters = (letterIds: string[]) => {
    if (letterIds.length === 0) return;
    const updated = deleteMultipleStoredLetters(letterIds);
    setLetters(updated);
    addNotification({
      title: `Đã xóa ${letterIds.length} lá thư`,
      message: `Đã xóa thành công ${letterIds.length} bức thư đã chọn khỏi hòm thư.`,
    });
  };

  // Clear all letters by Admin
  const handleClearAllLetters = () => {
    const updated = clearAllStoredLetters();
    setLetters(updated);
    addNotification({
      title: 'Đã dọn sạch hòm thư',
      message: 'Toàn bộ tất cả các bức thư hiện có đã được xóa thành công.',
    });
  };

  // Genre selection from Explorer
  const handleSelectGenre = (genre: string) => {
    setSelectedGenreFilter(genre);
    setActiveTab('characters');
  };

  // If locked, show only the Access Gate
  if (!unlocked) {
    return (
      <div 
        className="relative min-h-screen bg-rose-50/40 dark:bg-neutral-950 font-sans antialiased text-neutral-800 dark:text-neutral-100 flex flex-col justify-center overflow-hidden transition-all duration-500"
        style={{
          backgroundImage: siteConfig.backgroundUrl ? `url(${siteConfig.backgroundUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Background Overlay if custom image is set */}
        {siteConfig.backgroundUrl && (
          <div className="fixed inset-0 bg-white/40 dark:bg-neutral-950/60 pointer-events-none z-0" />
        )}

        {/* Background Layer */}
        <StrawberryBackground zIndex={0} opacityMultiplier={(berryOpacity / 100) * 0.7} speedMultiplier={berrySpeed} />
        
        <AccessGate
          onUnlock={handleGateUnlock}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onOpenThemeSettings={() => setIsThemeModalOpen(true)}
        />

        {/* Foreground Layer (In front of gate) */}
        <StrawberryBackground zIndex={50} opacityMultiplier={berryOpacity / 100} speedMultiplier={berrySpeed * 1.2} />

        {/* Global Brightness Dimmer Overlay */}
        {brightness < 100 && (
          <div
            className="fixed inset-0 pointer-events-none z-[999] transition-opacity duration-200 bg-black"
            style={{ opacity: ((100 - brightness) / 100) * 0.7 }}
            aria-hidden="true"
          />
        )}
        {brightness > 100 && (
          <div
            className="fixed inset-0 pointer-events-none z-[999] transition-opacity duration-200 bg-white"
            style={{ opacity: ((brightness - 100) / 100) * 0.25 }}
            aria-hidden="true"
          />
        )}

        <ThemeSettingsModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          themeMode={themeMode}
          onThemeModeChange={handleThemeModeChange}
          brightness={brightness}
          onBrightnessChange={handleBrightnessChange}
          berryOpacity={berryOpacity}
          onBerryOpacityChange={handleBerryOpacityChange}
          berrySpeed={berrySpeed}
          onBerrySpeedChange={handleBerrySpeedChange}
        />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-rose-50/30 dark:bg-neutral-950 font-sans antialiased text-neutral-800 dark:text-neutral-100 flex flex-col transition-all duration-500 relative overflow-x-hidden"
      style={{
        backgroundImage: siteConfig.backgroundUrl ? `url(${siteConfig.backgroundUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Overlay if custom image is set to improve readability */}
      {siteConfig.backgroundUrl && (
        <div className="fixed inset-0 bg-white/40 dark:bg-neutral-950/60 pointer-events-none z-0" />
      )}

      {/* Background Layer (Behind everything) */}
      <StrawberryBackground zIndex={0} opacityMultiplier={(berryOpacity / 100) * 0.6} speedMultiplier={berrySpeed * 0.8} />

      {/* Global Brightness Dimmer Overlay */}
      {brightness < 100 && (
        <div
          className="fixed inset-0 pointer-events-none z-[999] transition-opacity duration-200 bg-black"
          style={{ opacity: ((100 - brightness) / 100) * 0.7 }}
          aria-hidden="true"
        />
      )}
      {brightness > 100 && (
        <div
          className="fixed inset-0 pointer-events-none z-[999] transition-opacity duration-200 bg-white"
          style={{ opacity: ((brightness - 100) / 100) * 0.25 }}
          aria-hidden="true"
        />
      )}

      {/* Real-time Notification Banner */}
      <NotificationToast
        onSelectCharacter={(charId) => {
          const target = characters.find((c) => c.id === charId);
          if (target) setSelectedCharacter(target);
        }}
      />

      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenThemeSettings={() => setIsThemeModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        isAdmin={isAdmin}
        favoritesCount={favorites.length}
        hasNewAnnouncements={hasNewAnnouncements}
        notifications={[]}
        onOpenFavorites={() => setIsFavoritesModalOpen(true)}
        customLogo={customLogo}
        onLogoChange={handleLogoChange}
        currentUser={currentUser}
        onLogout={() => setIsLogoutConfirmOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {activeTab === 'characters' && (
          <CharacterCardsView
            characters={characters}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectCharacter={handleViewCharacter}
            isAdmin={isAdmin}
            onOpenAdminModal={() => {
              setEditingCharacter(null);
              setIsAdminModalOpen(true);
            }}
            onDeleteCharacter={handleDeleteCharacter}
            onEditCharacter={(char) => {
              setEditingCharacter(char);
              setIsAdminModalOpen(true);
            }}
            initialGenreFilter={selectedGenreFilter}
            customGenres={customGenres}
          />
        )}

        {activeTab === 'gacha' && (
          <GachaWheel
            characters={characters}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectCharacter={handleViewCharacter}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
          />
        )}

        {activeTab === 'bxh' && (
          <LeaderboardView
            characters={characters}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectCharacter={handleViewCharacter}
            onOpenGachaTab={() => handleTabChange('gacha')}
          />
        )}

        {activeTab === 'letters' && (
          <LetterBoxView
            letters={letters}
            onAddLetter={handleAddLetter}
            isAdmin={isAdmin}
            onOpenAdminLogin={() => setIsAdminModalOpen(true)}
            onDeleteLetter={handleDeleteLetter}
            onDeleteMultipleLetters={handleDeleteMultipleLetters}
            onClearAllLetters={handleClearAllLetters}
          />
        )}

        {activeTab === 'genres' && (
          <GenreExplorerView
            characters={characters}
            onSelectGenre={handleSelectGenre}
            customGenres={customGenres}
          />
        )}

        {activeTab === 'roleplay-diary' && (
          <RoleplayDiaryView
            characters={characters}
            roleplayEntries={roleplayEntries}
            onSaveEntry={handleSaveRoleplayEntry}
            onDeleteEntry={handleDeleteRoleplayEntry}
            onBackToHome={() => handleTabChange('characters')}
            onSelectCharacterDetail={handleViewCharacter}
          />
        )}

        {activeTab === 'wyn-board' && (
          <WynNoticeBoardView
            announcements={announcements}
            isAdmin={isAdmin}
            onAddAnnouncement={handleAddAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onLikeAnnouncement={handleLikeAnnouncement}
            onBackToHome={() => handleTabChange('characters')}
          />
        )}

        {activeTab === 'polaroid' && (
          <PolaroidCardGeneratorView
            characters={characters}
            onBackToHome={() => handleTabChange('characters')}
          />
        )}

        {activeTab === 'character-puzzle' && (
          <CharacterPuzzleView
            characters={characters}
            isAdmin={isAdmin}
            onBackToHome={() => setActiveTab('characters')}
          />
        )}

        {activeTab === 'sticky-wall' && (
          <StickyNotesWall
            isAdmin={isAdmin}
            onBackToHome={() => setActiveTab('characters')}
          />
        )}

        {activeTab === 'tea-brewer' && (
          <TeaBrewer
            currentUser={currentUser}
            onBackToHome={() => setActiveTab('characters')}
            onSelectCharacterById={(charId) => {
              const char = characters.find((c) => c.id === charId);
              if (char) {
                handleViewCharacter(char);
                setActiveTab('characters');
              }
            }}
            characters={characters}
          />
        )}

        {activeTab === 'profile' && currentUser && (
          <UserProfileView
            user={currentUser}
            favoritesCount={favorites.length}
            diaryCount={Object.keys(roleplayEntries).length}
            lettersCount={letters.filter((l) => l.author === currentUser.displayName).length}
            characters={characters}
            favorites={favorites}
            onLogout={() => setIsLogoutConfirmOpen(true)}
            onBackToHome={() => setActiveTab('characters')}
            onSelectCharacter={handleViewCharacter}
            onSelectTab={(tab) => {
              setActiveTab(tab);
            }}
          />
        )}
      </main>

      {/* Background Music Player ("Trăng ơi Trăng à") */}
      <MusicPlayer />

      {/* Floating Vertical Brightness Slider Widget (Lướt lên xuống để chỉnh sáng tối) */}
      <VerticalBrightnessWidget
        brightness={brightness}
        onBrightnessChange={handleBrightnessChange}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenThemeSettings={() => setIsThemeModalOpen(true)}
      />

      {/* Character Detail Modal */}
      <CharacterDetailModal
        character={selectedCharacter}
        isOpen={!!selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        isFavorite={selectedCharacter ? favorites.includes(selectedCharacter.id) : false}
        onToggleFavorite={handleToggleFavorite}
        isAdmin={isAdmin}
        onEditCharacter={(char) => {
          setSelectedCharacter(null);
          setEditingCharacter(char);
          setIsAdminModalOpen(true);
        }}
        currentUser={currentUser}
      />

      {/* Admin Portal Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setEditingCharacter(null);
        }}
        isAdmin={isAdmin}
        onAdminLogin={() => setIsAdmin(true)}
        onAdminLogout={() => setIsAdmin(false)}
        characters={characters}
        onSaveCharacter={handleSaveCharacter}
        onDeleteCharacter={handleDeleteCharacter}
        onSeedCharacters={handleSeedCharacters}
        editingCharacter={editingCharacter}
        onClearEditing={() => setEditingCharacter(null)}
        letters={letters}
        onDeleteLetter={handleDeleteLetter}
        onDeleteMultipleLetters={handleDeleteMultipleLetters}
        onClearAllLetters={handleClearAllLetters}
        customLogo={customLogo}
        onLogoChange={handleLogoChange}
        siteConfig={siteConfig}
        onConfigChange={handleConfigChange}
        customGenres={customGenres}
        onSaveGenre={handleSaveGenre}
        onDeleteGenre={handleDeleteGenre}
        announcements={announcements}
        onAddAnnouncement={handleAddAnnouncement}
        onDeleteAnnouncement={handleDeleteAnnouncement}
      />

      {/* Personal Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
        favorites={favorites}
        characters={characters}
        onToggleFavorite={handleToggleFavorite}
        onSelectCharacter={handleViewCharacter}
      />

      {/* Theme & Brightness Customization Modal */}
      <ThemeSettingsModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        themeMode={themeMode}
        onThemeModeChange={handleThemeModeChange}
        brightness={brightness}
        onBrightnessChange={handleBrightnessChange}
        berryOpacity={berryOpacity}
        onBerryOpacityChange={handleBerryOpacityChange}
        berrySpeed={berrySpeed}
        onBerrySpeedChange={handleBerrySpeedChange}
      />

      {/* Quiet Footer with corner admin button & relock */}
      <footer className="relative z-10 border-t border-rose-100/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm py-6 mt-12 text-center text-xs text-neutral-400 select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-center">
            <span>🍓</span>
            <span className="font-serif-title font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
              Tiệm Nhỏ Nhà Wyn
            </span>
            <span className="text-neutral-400">· Nơi kết nối cảm xúc & những câu chuyện ngọt ngào</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {/* Theme settings shortcut */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="inline-flex items-center gap-1 text-neutral-500 hover:text-rose-500 transition cursor-pointer"
              title="Tùy chỉnh sáng tối theo sở thích"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Chỉnh sáng / tối</span>
            </button>

            {/* Corner Admin Icon button as explicitly required */}
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="inline-flex items-center gap-1 text-neutral-500 hover:text-rose-500 transition cursor-pointer"
              title="Quản trị viên"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Quản Trị Viên (Đã mở)' : 'Quản Trị Viên'}</span>
            </button>

            <button
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer"
              title="Khóa cổng vào"
            >
              <Lock className="w-3 h-3" />
              <span>Khóa cổng (0712)</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Foreground Layer (Floating in front of everything) */}
      <StrawberryBackground zIndex={100} opacityMultiplier={berryOpacity / 100} speedMultiplier={berrySpeed * 1.3} />

      {/* Cozy Custom Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleUserLogout}
      />
    </div>
  );
}
