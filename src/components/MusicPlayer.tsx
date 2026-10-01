import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music,
  Disc3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  ListMusic,
  Headphones,
} from 'lucide-react';

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  videoId: string;
  tag: string;
}

export const PLAYLIST: SongItem[] = [
  {
    id: 'trang-oi-trang-a',
    title: 'Trăng ơi Trăng à',
    artist: 'Trang Đông Như (庄东茹) & LvJam',
    videoId: 'UY8cbuRVfUU',
    tag: 'Chữa lành',
  },
  {
    id: 'for-ya',
    title: 'For ya',
    artist: 'Tưởng Tiểu Ni',
    videoId: 'qz495ltcbaU',
    tag: 'Ngọt ngào',
  },
  {
    id: 'dam-chim',
    title: 'Đắm chìm',
    artist: 'Trâu Bái Bái',
    videoId: 'j2ua5ZbfMfk',
    tag: 'Sâu lắng',
  },
  {
    id: 'nuong-chieu-den-hu-hong',
    title: 'Nuông chiều đến hư hỏng',
    artist: 'Lý Tuấn Hữu & Tiểu Phan Phan',
    videoId: 'xE2geKyJPFs',
    tag: 'Dễ thương',
  },
  {
    id: 'luu-nien',
    title: 'Lưu Niên',
    artist: 'Jack - J97',
    videoId: 'boKJ5XDs_mY',
    tag: 'Tâm tình',
  },
];

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export const MusicPlayer: React.FC = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isTucked, setIsTucked] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const cardsScrollRef = useRef<HTMLDivElement>(null);
  const containerId = 'yt-music-player-audio-only';

  const currentSong = PLAYLIST[currentSongIndex] || PLAYLIST[0];

  // Initialize YouTube Iframe Player in background (audio only)
  useEffect(() => {
    let isMounted = true;

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return;

      try {
        playerRef.current = new window.YT.Player(containerId, {
          height: '120',
          width: '200',
          videoId: currentSong.videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            enablejsapi: 1,
            playsinline: 1,
            origin: window.location.origin,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              setIsReady(true);
              try {
                event.target.setVolume(volume);
              } catch (e) {
                // Ignore
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              // 1: PLAYING, 2: PAUSED, 0: ENDED
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                // Auto play next track
                handleNextSong(true);
              }
            },
            onError: (err: any) => {
              console.warn('YouTube audio player notice:', err);
            },
          },
        });
      } catch (err) {
        console.warn('Could not initialize audio player:', err);
      }
    };

    if (!window.YT) {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        setupPlayer();
      };
    } else {
      setupPlayer();
    }

    return () => {
      isMounted = false;
      try {
        if (playerRef.current && playerRef.current.destroy) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Switch song by index
  const selectSong = (index: number, autoPlay: boolean = true) => {
    if (index < 0 || index >= PLAYLIST.length) return;
    setCurrentSongIndex(index);
    const targetSong = PLAYLIST[index];

    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        if (autoPlay) {
          playerRef.current.loadVideoById(targetSong.videoId);
          if (isMuted) {
            playerRef.current.mute();
          } else {
            playerRef.current.unMute();
            playerRef.current.setVolume(volume);
          }
          setIsPlaying(true);
        } else {
          playerRef.current.cueVideoById(targetSong.videoId);
          setIsPlaying(false);
        }
      } catch (err) {
        console.warn('Error loading song:', err);
      }
    }
  };

  // Next Song
  const handleNextSong = (autoPlay: boolean = true) => {
    const nextIdx = (currentSongIndex + 1) % PLAYLIST.length;
    selectSong(nextIdx, autoPlay);
  };

  // Previous Song
  const handlePrevSong = (autoPlay: boolean = true) => {
    const prevIdx = (currentSongIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    selectSong(prevIdx, autoPlay);
  };

  // Scroll horizontal cards container
  const scrollCards = (direction: 'left' | 'right') => {
    if (!cardsScrollRef.current) return;
    const amount = direction === 'left' ? -200 : 200;
    cardsScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Handle Play / Pause Toggle
  const togglePlay = () => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        if (typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
        setIsPlaying(false);
      } else {
        if (typeof playerRef.current.unMute === 'function' && !isMuted) {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume);
        }
        if (typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('Error toggling play:', e);
    }
  };

  // Handle Volume Change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (!playerRef.current) return;

    try {
      if (newVol === 0) {
        setIsMuted(true);
        if (typeof playerRef.current.mute === 'function') {
          playerRef.current.mute();
        }
      } else {
        if (isMuted) {
          setIsMuted(false);
          if (typeof playerRef.current.unMute === 'function') {
            playerRef.current.unMute();
          }
        }
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(newVol);
        }
      }
    } catch (e) {
      console.warn('Error adjusting volume:', e);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        setIsMuted(false);
        if (typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
        }
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(volume || 70);
        }
      } else {
        setIsMuted(true);
        if (typeof playerRef.current.mute === 'function') {
          playerRef.current.mute();
        }
      }
    } catch (e) {
      console.warn('Error toggling mute:', e);
    }
  };

  return (
    <aside 
      aria-label="Trình phát âm nhạc"
      className={`fixed bottom-4 right-4 z-40 select-none flex flex-col items-end transition-transform duration-500 ease-out-back ${
        isTucked ? 'translate-x-[calc(100%+16px)]' : 'translate-x-0'
      }`}
    >
      {/* Hidden offscreen container so YouTube engine plays audio seamlessly with zero video UI */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: 200,
          height: 120,
          opacity: 0.001,
          pointerEvents: 'none',
        }}
      >
        <div id={containerId} />
      </div>

      {/* Expanded Audio Card Player (Chỉ hiển thị tên bài hát & tác giả, KHÔNG có ảnh video) */}
      {isExpanded && (
        <div className="mb-2 w-80 sm:w-96 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-rose-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-rose-100 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
              <span className="text-base">🍓</span>
              <span>Tiệm Nhạc Nhà Wyn</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 font-mono">
                {currentSongIndex + 1}/{PLAYLIST.length}
              </span>
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer"
              title="Thu nhỏ"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Minimalist Audio Playing Banner (Chỉ chữ, biểu tượng đĩa than xoay & sóng nhạc) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/80 via-white to-amber-50/50 dark:from-neutral-800/80 dark:via-neutral-850 dark:to-neutral-800 border border-rose-100 dark:border-neutral-700 shadow-sm flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 shrink-0 border border-rose-200/60 dark:border-rose-900/40">
              <Disc3 className={`w-7 h-7 text-rose-500 ${isPlaying ? 'animate-spin-slow' : 'opacity-80'}`} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Music className="w-3 h-3 text-rose-600" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold font-serif-title text-neutral-900 dark:text-white truncate">
                  {currentSong.title}
                </h4>
                {isPlaying && (
                  <span className="flex gap-0.5 items-end h-3 shrink-0">
                    <span className="w-0.5 h-2 bg-rose-500 animate-pulse" />
                    <span className="w-0.5 h-3 bg-rose-400 animate-pulse delay-75" />
                    <span className="w-0.5 h-1.5 bg-rose-600 animate-pulse delay-150" />
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                Tác giả: <span className="font-medium text-neutral-700 dark:text-neutral-300">{currentSong.artist}</span>
              </p>
              <span className="inline-block mt-1 text-[10px] font-medium text-rose-500">
                {isPlaying ? '• Đang phát nhạc' : '• Đang tạm dừng'}
              </span>
            </div>
          </div>

          {/* Controls: Prev / Play / Next & Volume */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePrevSong(true)}
                className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition cursor-pointer active:scale-95"
                title="Bài trước"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Tạm dừng' : 'Phát nhạc'}</span>
              </button>

              <button
                onClick={() => handleNextSong(true)}
                className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition cursor-pointer active:scale-95"
                title="Bài tiếp theo"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="text-neutral-400 hover:text-rose-500 transition cursor-pointer p-1"
                title={isMuted ? 'Bật âm' : 'Tắt tiếng'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-neutral-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-700 accent-rose-500 rounded-lg cursor-pointer"
                title={`Âm lượng: ${isMuted ? 0 : volume}%`}
              />
            </div>
          </div>

          {/* SWIPEABLE SONG CARDS (Chỉ hiển thị tên nhạc và tên tác giả, KHÔNG có hình ảnh/video) */}
          <div className="space-y-2 pt-2 border-t border-rose-100 dark:border-neutral-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <ListMusic className="w-3.5 h-3.5 text-rose-500" />
                <span>Lướt chọn bài hát ({PLAYLIST.length} bài):</span>
              </span>

              {/* Scroll navigation arrows */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollCards('left')}
                  className="p-1 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition cursor-pointer"
                  title="Lướt sang trái"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCards('right')}
                  className="p-1 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition cursor-pointer"
                  title="Lướt sang phải"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Horizontal Swipeable Cards List (Clean Text Only) */}
            <div
              ref={cardsScrollRef}
              className="flex items-stretch gap-2.5 overflow-x-auto scroll-smooth py-1 px-0.5 no-scrollbar snap-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {PLAYLIST.map((song, idx) => {
                const isSelected = idx === currentSongIndex;
                return (
                  <div
                    key={song.id}
                    onClick={() => selectSong(idx, true)}
                    className={`snap-start shrink-0 w-48 p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-95 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/90 dark:bg-rose-950/40 shadow-sm ring-1 ring-rose-400'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 hover:border-rose-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    {/* Top Tag & Number */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-neutral-200/80 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        {song.tag}
                      </span>

                      <span className="text-[10px] font-mono text-neutral-400">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Song Title & Author Name ONLY */}
                    <div className="space-y-1 my-1">
                      <p
                        className={`text-xs font-bold leading-snug line-clamp-1 ${
                          isSelected
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-neutral-900 dark:text-neutral-100 group-hover:text-rose-500'
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
                        Tác giả: <span className="font-medium">{song.artist}</span>
                      </p>
                    </div>

                    {/* Bottom Status Indicator */}
                    <div className="pt-2 mt-1 border-t border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between text-[10px]">
                      <span
                        className={`font-medium flex items-center gap-1 ${
                          isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-400'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            {isPlaying ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                <span>Đang phát 🎶</span>
                              </>
                            ) : (
                              <span>Đã chọn</span>
                            )}
                          </>
                        ) : (
                          <span>Bấm để nghe</span>
                        )}
                      </span>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          isSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-neutral-200/70 dark:bg-neutral-700 text-neutral-500 group-hover:bg-rose-100 group-hover:text-rose-500'
                        }`}
                      >
                        <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Docked Music Bar (Chỉ hiển thị tên bài hát & tác giả) */}
      <div className="relative bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-rose-200/90 dark:border-neutral-800 rounded-2xl shadow-lg shadow-rose-950/5 px-3 py-2 flex items-center gap-2.5 sm:gap-3 transition-all duration-300">
        {/* The Pull-out / Tuck-in Tab Handle (Xếp gọn / Kéo ra) */}
        <button
          type="button"
          onClick={() => {
            setIsTucked(!isTucked);
            if (isExpanded) setIsExpanded(false);
          }}
          className={`absolute top-1/2 -translate-y-1/2 -left-9 w-9 h-11 rounded-l-2xl shadow-md border-y border-l transition-all duration-300 flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 ${
            isTucked 
              ? 'bg-rose-500 border-rose-400 text-white hover:bg-rose-600 animate-pulse' 
              : 'bg-white/90 dark:bg-neutral-900/90 border-rose-100 dark:border-neutral-800 text-neutral-500 hover:text-rose-500'
          }`}
          title={isTucked ? 'Kéo Máy Phát Nhạc Ra' : 'Thu Gọn Máy Nhạc Vào Lề'}
        >
          {isTucked ? (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <Music className="w-3.5 h-3.5 shrink-0 -mt-1 animate-spin-slow" />
            </>
          ) : (
            <>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <Music className="w-3.5 h-3.5 shrink-0 -mt-1" />
            </>
          )}
        </button>

        {/* Animated Vinyl Disc / Play Button */}
        <button
          onClick={togglePlay}
          title={isPlaying ? 'Tạm dừng nhạc' : `Bấm để phát nhạc ${currentSong.title}`}
          className="relative flex items-center justify-center w-9 h-9 rounded-full bg-rose-50 dark:bg-neutral-800 border border-rose-200 dark:border-neutral-700 text-rose-500 hover:scale-105 active:scale-95 transition cursor-pointer group shrink-0"
        >
          <Disc3
            className={`w-5 h-5 text-rose-500 transition-all ${
              isPlaying ? 'animate-spin-slow' : 'opacity-70 group-hover:opacity-100'
            }`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {isPlaying ? (
              <Pause className="w-2.5 h-2.5 text-rose-600 fill-rose-600" />
            ) : (
              <Play className="w-2.5 h-2.5 text-rose-600 fill-rose-600 ml-0.5" />
            )}
          </div>
        </button>

        {/* Track Info: Chỉ tên bài & tên tác giả */}
        <div
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-left pr-1 max-w-[130px] sm:max-w-[170px] cursor-pointer group"
          title="Nhấn để lướt chọn bài hát khác"
        >
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-rose-500 transition">
              {currentSong.title}
            </p>
            {isPlaying && (
              <span className="flex gap-0.5 items-end h-2.5 shrink-0">
                <span className="w-0.5 h-2 bg-rose-500 animate-pulse" />
                <span className="w-0.5 h-3 bg-rose-400 animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-rose-600 animate-pulse delay-150" />
              </span>
            )}
          </div>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
            {currentSong.artist}
          </p>
        </div>

        {/* Quick Prev / Next Song buttons on dock */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => handlePrevSong(true)}
            className="p-1 rounded-lg text-neutral-400 hover:text-rose-500 transition cursor-pointer"
            title="Bài trước"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleNextSong(true)}
            className="p-1 rounded-lg text-neutral-400 hover:text-rose-500 transition cursor-pointer"
            title="Bài tiếp theo"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="hidden sm:flex items-center gap-1.5 pl-1 border-l border-neutral-100 dark:border-neutral-800">
          <button
            onClick={toggleMute}
            className="text-neutral-400 hover:text-rose-500 transition cursor-pointer p-1"
            title={isMuted ? 'Bật âm' : 'Tắt tiếng'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-neutral-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-14 sm:w-16 h-1.5 bg-neutral-200 dark:bg-neutral-700 accent-rose-500 rounded-lg cursor-pointer"
            title={`Âm lượng: ${isMuted ? 0 : volume}%`}
          />
        </div>

        {/* Expand button (lướt bài hát) */}
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          title={isExpanded ? 'Đóng thẻ chọn nhạc' : 'Lướt chọn bài hát'}
          className="text-neutral-400 hover:text-rose-500 p-1 rounded-lg transition cursor-pointer flex items-center gap-0.5"
        >
          <ListMusic className="w-3.5 h-3.5 text-rose-500" />
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
};
