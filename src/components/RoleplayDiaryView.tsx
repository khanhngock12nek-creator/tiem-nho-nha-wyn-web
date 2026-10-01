import React, { useState } from 'react';
import {
  BookOpen,
  Star,
  MessageCircle,
  ExternalLink,
  Edit3,
  Trash2,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle,
  Heart,
  Sparkles,
  Bookmark,
} from 'lucide-react';
import { Character, RoleplayEntry, RoleplayStatus } from '../types';

interface RoleplayDiaryViewProps {
  characters: Character[];
  roleplayEntries: Record<string, RoleplayEntry>;
  onSaveEntry: (entry: RoleplayEntry) => void;
  onDeleteEntry: (characterId: string) => void;
  onBackToHome: () => void;
  onSelectCharacterDetail?: (char: Character) => void;
}

export const RoleplayDiaryView: React.FC<RoleplayDiaryViewProps> = ({
  characters,
  roleplayEntries,
  onSaveEntry,
  onDeleteEntry,
  onBackToHome,
  onSelectCharacterDetail,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<RoleplayEntry | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RoleplayStatus | 'unlogged'>('all');

  const statusConfigs: Record<
    RoleplayStatus,
    { label: string; icon: string; bg: string; text: string; border: string }
  > = {
    chatting: {
      label: 'Đang trò chuyện',
      icon: '💬',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    want_to_try: {
      label: 'Muốn thử',
      icon: '🎯',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
    },
    favorite: {
      label: 'Nhân vật ruột',
      icon: '💖',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
    },
    completed: {
      label: 'Đã xong plot',
      icon: '✨',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
    },
  };

  const handleOpenEdit = (char: Character) => {
    const existing = roleplayEntries[char.id];
    setEditingEntry({
      characterId: char.id,
      status: existing?.status || 'chatting',
      userNotes: existing?.userNotes || '',
      favoriteQuote: existing?.favoriteQuote || '',
      rating: existing?.rating || 5,
      updatedAt: Date.now(),
    });
    setSelectedCharId(char.id);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    onSaveEntry({
      ...editingEntry,
      updatedAt: Date.now(),
    });
    setEditingEntry(null);
    setSelectedCharId(null);
  };

  const activeEditingChar = characters.find((c) => c.id === selectedCharId);

  // Filter characters
  const filteredChars = characters.filter((c) => {
    const entry = roleplayEntries[c.id];
    if (statusFilter === 'unlogged' && entry) return false;
    if (statusFilter !== 'all' && statusFilter !== 'unlogged') {
      if (!entry || entry.status !== statusFilter) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchGenre = c.genres.some((g) => g.toLowerCase().includes(q));
      const matchNotes = entry?.userNotes.toLowerCase().includes(q);
      const matchQuote = entry?.favoriteQuote?.toLowerCase().includes(q);
      return matchName || matchGenre || matchNotes || matchQuote;
    }
    return true;
  });

  const totalLoggedCount = Object.keys(roleplayEntries).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Title */}
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
              <span className="text-xl">📖</span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-neutral-900 dark:text-white">
                Nhật Ký Roleplay & Trạng Thái Chat
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Ghi chép cốt truyện, câu thoại đáng nhớ và theo dõi tiến trình trò chuyện cùng các nhân vật của bạn
            </p>
          </div>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-rose-50 dark:bg-neutral-850 border border-rose-200 dark:border-neutral-750 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 shadow-sm">
            <Bookmark className="w-3.5 h-3.5 text-rose-500" />
            <span>Đã ghi chép: <strong>{totalLoggedCount}</strong> / {characters.length} nhân vật</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/80 dark:bg-neutral-850/80 p-3 rounded-3xl border border-rose-100 dark:border-neutral-800 shadow-sm backdrop-blur-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên nhân vật, thể loại, ghi chú plot..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-rose-50/40 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:border-rose-400 text-neutral-800 dark:text-neutral-100"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-rose-500 text-white font-medium shadow-sm'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-rose-50 dark:hover:bg-neutral-800'
            }`}
          >
            Tất cả ({characters.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('chatting')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'chatting'
                ? 'bg-emerald-500 text-white font-medium shadow-sm'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-neutral-800'
            }`}
          >
            <span>💬</span>
            <span>Đang trò chuyện</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('favorite')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'favorite'
                ? 'bg-rose-500 text-white font-medium shadow-sm'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-rose-50 dark:hover:bg-neutral-800'
            }`}
          >
            <span>💖</span>
            <span>Nhân vật ruột</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('want_to_try')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'want_to_try'
                ? 'bg-amber-500 text-white font-medium shadow-sm'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-neutral-800'
            }`}
          >
            <span>🎯</span>
            <span>Muốn thử</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'completed'
                ? 'bg-purple-500 text-white font-medium shadow-sm'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-purple-50 dark:hover:bg-neutral-800'
            }`}
          >
            <span>✨</span>
            <span>Đã xong plot</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unlogged')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'unlogged'
                ? 'bg-neutral-600 text-white font-medium shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            Chưa có ghi chép
          </button>
        </div>
      </div>

      {/* Character Cards List */}
      {filteredChars.length === 0 ? (
        <div className="py-16 text-center text-xs text-neutral-400 space-y-2 bg-white/50 dark:bg-neutral-850/50 rounded-3xl border border-dashed border-rose-200 dark:border-neutral-800">
          <p className="text-3xl">📝</p>
          <p className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm">
            Chưa có nhân vật nào trong mục này
          </p>
          <p>Hãy chọn một nhân vật để thêm nhật ký hoặc thay đổi bộ lọc tìm kiếm.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChars.map((char) => {
            const entry = roleplayEntries[char.id];
            const cfg = entry ? statusConfigs[entry.status] : null;

            return (
              <div
                key={char.id}
                className="group relative rounded-3xl bg-white dark:bg-neutral-850 border border-rose-100 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                {/* Header: Avatar, Name & Status */}
                <div className="flex items-start gap-3">
                  <img
                    src={char.avatarUrl}
                    alt={char.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-rose-200 dark:border-neutral-700 shrink-0 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => onSelectCharacterDetail && onSelectCharacterDetail(char)}
                      className="text-sm font-bold font-serif-title text-neutral-900 dark:text-white truncate hover:text-rose-500 cursor-pointer"
                    >
                      {char.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {cfg ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          <span>{cfg.icon}</span>
                          <span>{cfg.label}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                          Chưa có ghi chép
                        </span>
                      )}

                      {entry?.rating && (
                        <span className="flex items-center text-amber-400 text-xs">
                          {Array.from({ length: entry.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Entry Notes / Quote Section */}
                <div className="space-y-2 flex-1">
                  {entry?.favoriteQuote ? (
                    <div className="p-2.5 rounded-2xl bg-rose-50/60 dark:bg-neutral-800/80 border border-rose-100 dark:border-neutral-750 text-xs text-neutral-700 dark:text-neutral-200 italic font-serif leading-relaxed">
                      "{entry.favoriteQuote}"
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 text-xs text-neutral-400 italic line-clamp-2">
                      {char.openingMessage}
                    </div>
                  )}

                  {entry?.userNotes ? (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                        Ghi chú cốt truyện:
                      </span>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">
                        {entry.userNotes}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-rose-50 dark:border-neutral-800 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(char)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-neutral-800 hover:bg-rose-100 dark:hover:bg-neutral-750 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{entry ? 'Sửa nhật ký' : '+ Viết nhật ký'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {entry && (
                      <button
                        type="button"
                        onClick={() => onDeleteEntry(char.id)}
                        className="p-1.5 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-neutral-800 transition cursor-pointer"
                        title="Xóa nhật ký của nhân vật này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <a
                      href={char.chatLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold shadow-sm hover:shadow transition flex items-center gap-1 active:scale-95"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Chat ngay</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Entry Modal */}
      {editingEntry && activeEditingChar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-rose-200 dark:border-neutral-800 space-y-5 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <img
                  src={activeEditingChar.avatarUrl}
                  alt={activeEditingChar.name}
                  className="w-11 h-11 rounded-2xl object-cover border border-rose-200 dark:border-neutral-700"
                />
                <div>
                  <h3 className="text-base font-bold font-serif-title text-neutral-900 dark:text-white">
                    Nhật Ký Cùng {activeEditingChar.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400">Ghi lại cảm xúc & tình trạng trò chuyện</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* Status Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Trạng Thái Hiện Tại
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(statusConfigs) as RoleplayStatus[]).map((st) => {
                    const cfg = statusConfigs[st];
                    const isSelected = editingEntry.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEditingEntry({ ...editingEntry, status: st })}
                        className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                          isSelected
                            ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-rose-400`
                            : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        <span className="text-base">{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Mức Độ Yêu Thích
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditingEntry({ ...editingEntry, rating: star })}
                      className="p-1 text-2xl transition hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= editingEntry.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-300 dark:text-neutral-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-neutral-400 ml-2 font-mono">
                    {editingEntry.rating} / 5 sao
                  </span>
                </div>
              </div>

              {/* Favorite Quote */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Câu Thoại Ấn Tượng Nhất
                </label>
                <input
                  type="text"
                  value={editingEntry.favoriteQuote || ''}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, favoriteQuote: e.target.value })
                  }
                  placeholder="Ví dụ: 'Đêm nay sương lạnh, em còn chưa chịu về phòng sao?'"
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-rose-400 text-neutral-900 dark:text-white"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Nhật Ký & Cốt Truyện Riêng Tư
                </label>
                <textarea
                  rows={4}
                  value={editingEntry.userNotes}
                  onChange={(e) => setEditingEntry({ ...editingEntry, userNotes: e.target.value })}
                  placeholder="Ghi lại tiến trình trò chuyện, plot đã thử, các chi tiết thú vị mà bạn và bot vừa trải qua..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-rose-400 text-neutral-900 dark:text-white resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold shadow hover:shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Lưu nhật ký</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
