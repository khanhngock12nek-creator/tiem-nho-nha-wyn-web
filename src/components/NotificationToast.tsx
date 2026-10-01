import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, X, ChevronRight } from 'lucide-react';
import { SiteNotification } from '../types';
import { getStoredNotifications } from '../utils/storage';

interface NotificationToastProps {
  onSelectCharacter?: (charId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onSelectCharacter }) => {
  const [activeToast, setActiveToast] = useState<SiteNotification | null>(null);

  useEffect(() => {
    const handleNewNotif = (e: Event) => {
      const customEvent = e as CustomEvent<SiteNotification>;
      if (customEvent.detail) {
        setActiveToast(customEvent.detail);
        // Auto dismiss after 6 seconds
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 6000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('wyn_new_notification', handleNewNotif as EventListener);
    return () => window.removeEventListener('wyn_new_notification', handleNewNotif as EventListener);
  }, []);

  if (!activeToast) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-slide-in-right">
      <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-rose-200 dark:border-rose-900/50 shadow-xl shadow-rose-950/10 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0 text-rose-500">
          <Sparkles className="w-5 h-5 animate-pulse-soft" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <span>🍓</span> {activeToast.title}
            </span>
            <button
              onClick={() => setActiveToast(null)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-neutral-700 dark:text-neutral-200 mt-1 line-clamp-2">
            {activeToast.message}
          </p>

          {activeToast.characterId && (
            <button
              onClick={() => {
                if (onSelectCharacter && activeToast.characterId) {
                  onSelectCharacter(activeToast.characterId);
                }
                setActiveToast(null);
              }}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-rose-500 hover:text-rose-600 cursor-pointer"
            >
              <span>Xem hồ sơ ngay</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
