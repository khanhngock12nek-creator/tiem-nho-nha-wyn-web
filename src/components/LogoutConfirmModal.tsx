import React from 'react';
import { LogOut, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop blur overlay */}
      <div 
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />

      {/* Cozy Dialogue Card */}
      <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl border border-rose-100 dark:border-neutral-800 shadow-2xl p-6 text-center z-10 animate-scale-up">
        
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Decorative Emoji */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-rose-500 shadow-inner">
          <span className="text-3xl animate-bounce">🥺</span>
        </div>

        {/* Modal Text */}
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-serif-title mb-2">
          Đăng xuất tài khoản?
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
          Bạn chắc chắn muốn đăng xuất và đóng cổng tiệm chứ? Bạn sẽ cần nhập mật khẩu <strong className="text-rose-500 font-mono">0712</strong> và đăng nhập lại vào lần tới nhé!
        </p>

        {/* Button Actions: "Có" và "Không" */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-extrabold transition hover:bg-neutral-50 dark:hover:bg-neutral-850 cursor-pointer active:scale-97"
          >
            Không, ở lại 🧸
          </button>
          
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-extrabold shadow-md shadow-red-500/15 hover:from-red-600 hover:to-rose-600 transition cursor-pointer active:scale-97 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Có, đăng xuất</span>
          </button>
        </div>

      </div>
    </div>
  );
};
