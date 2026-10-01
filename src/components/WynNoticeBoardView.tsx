import React, { useState } from 'react';
import {
  Bell,
  Pin,
  Heart,
  PlusCircle,
  Trash2,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { WynAnnouncement, AnnouncementTag } from '../types';

interface WynNoticeBoardViewProps {
  announcements: WynAnnouncement[];
  isAdmin: boolean;
  onAddAnnouncement: (announcement: Omit<WynAnnouncement, 'id' | 'createdAt' | 'likes'>) => void;
  onDeleteAnnouncement: (id: string) => void;
  onLikeAnnouncement: (id: string) => void;
  onBackToHome: () => void;
}

export const WynNoticeBoardView: React.FC<WynNoticeBoardViewProps> = ({
  announcements,
  isAdmin,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onLikeAnnouncement,
  onBackToHome,
}) => {
  const [selectedTag, setSelectedTag] = useState<'all' | AnnouncementTag>('all');
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<AnnouncementTag>('Thông báo');
  const [isPinned, setIsPinned] = useState(false);

  const tags: AnnouncementTag[] = ['Thông báo', 'Lịch ra mắt', 'Tâm sự', 'Sự kiện'];

  const tagColors: Record<AnnouncementTag, { bg: string; text: string; border: string }> = {
    'Thông báo': {
      bg: 'bg-rose-100 dark:bg-rose-950/60',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-900',
    },
    'Lịch ra mắt': {
      bg: 'bg-sky-100 dark:bg-sky-950/60',
      text: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-200 dark:border-sky-900',
    },
    'Tâm sự': {
      bg: 'bg-amber-100 dark:bg-amber-950/60',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-900',
    },
    'Sự kiện': {
      bg: 'bg-emerald-100 dark:bg-emerald-950/60',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-900',
    },
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddAnnouncement({
      title: title.trim(),
      content: content.trim(),
      tag,
      isPinned,
    });

    setTitle('');
    setContent('');
    setIsPinned(false);
    setIsCreating(false);
  };

  // Sort pinned first, then newest
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt - a.createdAt;
  });

  const filteredAnnouncements = sortedAnnouncements.filter((item) => {
    if (selectedTag === 'all') return true;
    return item.tag === selectedTag;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="p-2.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-rose-500 hover:border-rose-300 transition cursor-pointer shadow-sm active:scale-95"
            title="Quay lại trang chính"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📢</span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-neutral-900 dark:text-white">
                Bảng Tin / Góc Thông Báo Của Wyn
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Cập nhật lịch ra mắt bot mới, tin nhắn tâm tình và các sự kiện ngọt ngào từ Wyn
            </p>
          </div>
        </div>

        {/* Admin Post Button */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold shadow-sm hover:shadow transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isCreating ? 'Đóng soạn tin' : 'Đăng thông báo mới'}</span>
          </button>
        )}
      </div>

      {/* Admin Create Form */}
      {isAdmin && isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-6 rounded-3xl bg-white dark:bg-neutral-850 border-2 border-rose-300 dark:border-rose-900/60 shadow-lg space-y-4 animate-in zoom-in-95"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif-title text-neutral-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500" />
              <span>Soạn thông báo mới (Quản Trị Viên)</span>
            </h3>
            <span className="text-[11px] text-neutral-400">Đăng công khai trên bảng tin</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Tiêu đề bài viết
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề thông báo..."
                className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-rose-400 text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Chuyên mục
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as AnnouncementTag)}
                className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-rose-400 text-neutral-900 dark:text-white cursor-pointer"
              >
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Nội dung thông báo
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết nội dung thông báo, lịch bot mới, tâm tình..."
              className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-rose-400 text-neutral-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
              <span className="flex items-center gap-1 font-medium">
                <Pin className="w-3.5 h-3.5 text-rose-500" />
                <span>Ghim bài viết lên đầu bảng tin 📌</span>
              </span>
            </label>

            <button
              type="submit"
              className="px-5 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Đăng ngay</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setSelectedTag('all')}
          className={`px-3.5 py-1.5 rounded-2xl transition cursor-pointer whitespace-nowrap ${
            selectedTag === 'all'
              ? 'bg-rose-500 text-white font-medium shadow-sm'
              : 'bg-white dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:text-rose-500'
          }`}
        >
          Tất cả ({announcements.length})
        </button>
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setSelectedTag(t)}
            className={`px-3.5 py-1.5 rounded-2xl transition cursor-pointer whitespace-nowrap ${
              selectedTag === t
                ? 'bg-rose-500 text-white font-medium shadow-sm'
                : 'bg-white dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:text-rose-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Announcements Board */}
      {filteredAnnouncements.length === 0 ? (
        <div className="py-16 text-center text-xs text-neutral-400 space-y-2 bg-white/50 dark:bg-neutral-850/50 rounded-3xl border border-dashed border-rose-200 dark:border-neutral-800">
          <p className="text-3xl">🪧</p>
          <p className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm">
            Chưa có thông báo nào trong mục này
          </p>
          <p>Wyn sẽ sớm đăng tải các thông tin mới nhất tại đây!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((item) => {
            const col = tagColors[item.tag] || tagColors['Thông báo'];

            return (
              <div
                key={item.id}
                className={`relative p-6 rounded-3xl bg-gradient-to-br from-rose-50/80 via-white/95 to-sky-50/80 dark:from-rose-950/30 dark:via-neutral-900/70 dark:to-sky-950/30 border shadow-xs transition space-y-3.5 ${
                  item.isPinned
                    ? 'border-rose-300 dark:border-rose-900/70 ring-2 ring-rose-100/50 dark:ring-rose-950/30'
                    : 'border-rose-100/70 dark:border-neutral-800'
                }`}
              >
                {/* Pinned Marker */}
                {item.isPinned && (
                  <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-white" />
                    <span>ĐÃ GHIM</span>
                  </div>
                )}

                {/* Top Meta */}
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${col.bg} ${col.text} ${col.border}`}
                    >
                      {item.tag}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold font-serif-title text-neutral-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>

                  <span className="text-[11px] text-neutral-400 font-mono shrink-0 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-400" />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                </div>

                {/* Content */}
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed font-sans pl-1">
                  {item.content}
                </p>

                {/* Bottom Bar: Like & Admin Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-rose-50 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => onLikeAnnouncement(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-neutral-800 hover:bg-rose-100 dark:hover:bg-neutral-750 text-rose-600 dark:text-rose-400 text-xs font-semibold transition active:scale-95 cursor-pointer shadow-xs"
                    title="Thả tim bài viết"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{item.likes} Yêu thích</span>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteAnnouncement(item.id);
                      }}
                      className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-neutral-800 transition cursor-pointer"
                      title="Xóa thông báo này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
