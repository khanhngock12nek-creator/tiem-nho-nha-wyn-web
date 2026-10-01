import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  KeyRound, 
  AlertCircle, 
  ArrowRight, 
  Sun, 
  Moon, 
  Sliders
} from 'lucide-react';
import { AppUser } from '../types';
import confetti from 'canvas-confetti';

interface AccessGateProps {
  onUnlock: (user: AppUser) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onOpenThemeSettings?: () => void;
}

export const AccessGate: React.FC<AccessGateProps> = ({
  onUnlock,
  isDarkMode = false,
  onToggleTheme,
  onOpenThemeSettings,
}) => {
  // Phase 1: PIN code
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isPinPassed, setIsPinPassed] = useState(false);

  // Phase 2: Authentication Screen
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<AppUser | null>(null);

  // Phase 3: Rolling Strawberry Progress
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePinSubmit = (code: string) => {
    if (code === '0712') {
      setPinError(false);
      setIsPinPassed(true);
      
      // Auto-login as reader since 3P auth is removed
      const readerUser: AppUser = {
        uid: 'reader-' + Math.random().toString(36).substring(2, 8),
        displayName: 'Độc giả yêu thương 🍓',
        photoURL: '🍓',
        provider: 'guest',
        createdAt: Date.now(),
      };
      setLoggedInUser(readerUser);
      setIsVerifying(true);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setPin(val);
    setPinError(false);
    if (val.length === 4) {
      handlePinSubmit(val);
    }
  };

  // Progress animation
  useEffect(() => {
    if (!isVerifying || !loggedInUser) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f43f5e', '#fb7185', '#fda4af', '#10b981'],
          });
          setTimeout(() => {
            onUnlock(loggedInUser);
          }, 350);
          return 100;
        }
        return prev + 3; // ~1 second
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isVerifying, loggedInUser, onUnlock]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative z-10 select-none">
      <div className="w-full max-w-md bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-3xl border border-rose-100 dark:border-neutral-800 shadow-2xl p-8 text-center transition-all duration-300 relative">
        
        {/* Top Theme Buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-rose-500 transition cursor-pointer"
              title={isDarkMode ? 'Giao diện Sáng' : 'Giao diện Tối'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
            </button>
          )}
          {onOpenThemeSettings && (
            <button
              type="button"
              onClick={onOpenThemeSettings}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-rose-500 transition cursor-pointer"
              title="Tùy chỉnh độ sáng"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Brand Logo Header */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-500 shadow-inner">
          <span className={`text-3xl ${isVerifying ? 'animate-bounce' : 'animate-pulse'}`}>🍓</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-serif-title tracking-tight text-neutral-900 dark:text-white mb-2 select-none">
          Tiệm Nhỏ Nhà Wyn
        </h1>

        {/* SCREEN 1: PASSCODE LOCK */}
        {!isPinPassed && (
          <div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              Khu vườn lưu giữ những nhân vật ngọt ngào. Nhập mật mã mở cổng vườn hoa của Wyn.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePinSubmit(pin);
              }}
              className="space-y-4"
            >
              <div className="relative max-w-xs mx-auto">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pin}
                  onChange={handleInputChange}
                  placeholder="Nhập 0712"
                  autoFocus
                  className={`w-full text-center text-2xl tracking-[0.4em] font-mono py-3 px-4 rounded-2xl border bg-white dark:bg-neutral-800 transition-all outline-none focus:ring-2 ${
                    pinError
                      ? 'border-red-400 focus:ring-red-300 dark:border-red-600'
                      : 'border-rose-200 dark:border-neutral-700 focus:border-rose-400 focus:ring-rose-200 dark:focus:ring-rose-900/40 text-neutral-850 dark:text-neutral-100'
                  }`}
                />
                <KeyRound className="w-4 h-4 text-neutral-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {pinError && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Mật khẩu chưa đúng (Gợi ý: 0712)</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pin.length === 0}
                className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-semibold text-xs text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-40 transition-all shadow-md shadow-rose-500/20 cursor-pointer"
              >
                <span>Mở Cổng Tiệm</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 pt-2 font-mono">
                Mật mã gợi ý: 0712
              </p>
            </form>
          </div>
        )}

        {/* SCREEN 3: VERIFYING / ENTRANCE PROGRESS BAR */}
        {isVerifying && loggedInUser && (
          <div className="py-4 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-medium px-1">
              <span className="flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-rose-500" />
                Chào bạn! Wyn đang pha trà đón bạn...
              </span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>

            {/* Track Progress with rolling Strawberry */}
            <div className="relative w-full h-4 bg-rose-100/70 dark:bg-neutral-800 rounded-full overflow-visible p-0.5 border border-rose-200 dark:border-neutral-700">
              <div
                className="h-full bg-gradient-to-r from-rose-300 via-rose-400 to-rose-500 rounded-full transition-all duration-75"
                style={{ width: `${progress}%` }}
              />

              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-75 pointer-events-none filter drop-shadow-md z-10"
                style={{ left: `${Math.min(96, Math.max(4, progress))}%` }}
              >
                <div className="text-2xl animate-spin-slow">🍓</div>
              </div>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
              Nước trà đang sôi, tách trà dâu sắp sẵn sàng mời bạn rồi nè~
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
