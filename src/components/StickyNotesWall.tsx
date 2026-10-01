import React, { useState, useEffect, useMemo } from 'react';
import { StickyNote } from '../types';
import {
  Heart,
  Plus,
  Trash2,
  X,
  Search,
  Sparkles,
  User,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import {
  subscribeStickyNotes,
  saveStickyNoteToFirestore,
  deleteStickyNoteFromFirestore
} from '../lib/firebase';

interface StickyNotesWallProps {
  isAdmin: boolean;
  onBackToHome: () => void;
}

const COLOR_PRESETS = [
  { id: 'yellow', name: 'Vàng nắng', bgClass: 'bg-amber-100 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 pin-red shadow-amber-200/40 dark:shadow-none' },
  { id: 'pink', name: 'Hồng thơ', bgClass: 'bg-rose-100 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 pin-blue shadow-rose-200/40 dark:shadow-none' },
  { id: 'blue', name: 'Xanh mây', bgClass: 'bg-sky-100 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/60 text-sky-900 dark:text-sky-200 pin-yellow shadow-sky-200/40 dark:shadow-none' },
  { id: 'green', name: 'Lá non', bgClass: 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 pin-purple shadow-emerald-200/40 dark:shadow-none' },
  { id: 'purple', name: 'Oải hương', bgClass: 'bg-purple-100 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60 text-purple-900 dark:text-purple-200 pin-green shadow-purple-200/40 dark:shadow-none' },
];

export const StickyNotesWall: React.FC<StickyNotesWallProps> = ({
  isAdmin,
  onBackToHome,
}) => {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sender, setSender] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subscribe to real-time sticky notes from Firestore
  useEffect(() => {
    const unsubscribe = subscribeStickyNotes(
      (firebaseNotes) => {
        setNotes(firebaseNotes);
      },
      (err) => {
        console.error('Failed to subscribe sticky notes:', err);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setFormError('Vui lòng viết nội dung lời nhắn nhé!');
      return;
    }
    if (content.length > 250) {
      setFormError('Lời nhắn chỉ được tối đa 250 ký tự thui nha!');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const finalSender = isAnonymous ? 'Người bạn bí mật 🤫' : (sender.trim() || 'Người bạn giấu tên ✨');

    // Generating random positions within safe bounds of corkboard
    const randomX = Math.round(5 + Math.random() * 80);
    const randomY = Math.round(5 + Math.random() * 80);

    const newNote: StickyNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: finalSender,
      content: content.trim(),
      color: selectedColor,
      x: randomX,
      y: randomY,
      createdAt: Date.now(),
    };

    try {
      await saveStickyNoteToFirestore(newNote);
      // Reset & Close
      setContent('');
      setSender('');
      setIsAnonymous(false);
      setIsModalOpen(false);
      setIsSubmitting(false);
    } catch (error) {
      setFormError('Không thể gửi lời nhắn lên tường. Vui lòng thử lại!');
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('QTV muốn gỡ bức thư nhắn này khỏi tường?')) {
      try {
        await deleteStickyNoteFromFirestore(noteId);
      } catch (error) {
        alert('Gặp lỗi khi xóa lời nhắn!');
      }
    }
  };

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return note.sender.toLowerCase().includes(q) || note.content.toLowerCase().includes(q);
    });
  }, [notes, searchQuery]);

  // Compute a deterministic rotation & tilt based on id so they stay statically rotated
  const getNoteRotation = (id: string) => {
    let sum = 0;
    for (let i = 0; i < id.length; i++) {
      sum += id.charCodeAt(i);
    }
    const deg = (sum % 8) - 4; // -4deg to +3deg
    return deg === 0 ? 'rotate-1' : `rotate-[${deg}deg]`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      {/* Header section with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100 dark:border-neutral-800">
        <div>
          <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest select-none">
            Tương Tác Đám Mây 📌
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-neutral-900 dark:text-white mt-1.5 flex items-center gap-2">
            Bức Tường Lời Nhắn Ngọt Ngào
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Gửi gắm những lời chúc, tâm tư dễ thương lên bức tường kẹp giấy gỗ sồi của Tiệm. Mọi người sẽ thấy ngay tức thì!
          </p>
        </div>
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-amber-200 dark:border-neutral-700 rounded-2xl text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-amber-50 dark:hover:bg-neutral-750 transition shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-600" />
          <span>Về Trang Chủ</span>
        </button>
      </div>

      {/* Control panel: Search & Add Note */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md p-4 rounded-2xl border border-rose-100 dark:border-neutral-850 shadow-2xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm lời nhắn hoặc người gửi..."
            className="w-full text-xs pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-amber-400 focus:outline-none text-neutral-800 dark:text-neutral-100"
          />
        </div>

        <button
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition transform hover:scale-102 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Dán Lời Nhắn Mới</span>
        </button>
      </div>

      {/* The Wood Corkboard Wall */}
      <div className="relative rounded-3xl overflow-hidden border-8 border-amber-800 dark:border-neutral-800 shadow-2xl bg-amber-50/50 dark:bg-neutral-900 min-h-[500px] p-6">
        {/* Corkboard texture pattern simulating cork */}
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1.1px,transparent_1.1px)] [background-size:16px_16px] opacity-15 dark:opacity-5 pointer-events-none" />

        {filteredNotes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <span className="text-4xl animate-bounce">📌</span>
            <h3 className="text-sm font-bold text-amber-900/80 dark:text-neutral-300">Bức tường hiện tại chưa có lời nhắn nào khớp!</h3>
            <p className="text-[11px] text-neutral-400 max-w-xs">Hãy là người đầu tiên đặt một tờ giấy nhắn xinh xắn lên bức tường này thui nào!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
            {filteredNotes.map((note) => {
              const colorConfig = COLOR_PRESETS.find((c) => c.id === note.color) || COLOR_PRESETS[0];
              const rotationDegree = getNoteRotation(note.id);

              return (
                <div
                  key={note.id}
                  className={`relative p-5 rounded-xl border shadow-md font-serif hover:shadow-xl transition-all hover:scale-103 duration-300 group flex flex-col justify-between min-h-[160px] ${colorConfig.bgClass} ${rotationDegree}`}
                  style={{
                    transform: `rotate(${(note.id.charCodeAt(0) % 6) - 3}deg)`
                  }}
                >
                  {/* Real-looking color Pushpin on top */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 drop-shadow-sm select-none text-base z-10">
                    📌
                  </div>

                  {/* Trash can for Admin moderation */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="absolute top-2.5 right-2.5 p-1 rounded-md bg-black/5 hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-500 hover:text-red-500 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Quy chế QTV: Gỡ lời nhắn này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Message Content */}
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-neutral-850 dark:text-neutral-250 leading-relaxed font-serif break-words select-all italic">
                      "{note.content}"
                    </p>
                  </div>

                  {/* Sender & Stamp Footer */}
                  <div className="border-t border-black/5 dark:border-white/5 pt-2.5 mt-4 flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400 font-sans">
                    <span className="font-bold flex items-center gap-1">
                      <User className="w-3 h-3 text-rose-500" />
                      {note.sender}
                    </span>
                    <span className="font-mono scale-90 origin-right">
                      {new Date(note.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE STICKY NOTE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-rose-100 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-rose-100 dark:border-neutral-800 flex items-center justify-between bg-amber-50/50 dark:bg-neutral-850">
              <div className="flex items-center gap-2">
                <span className="text-xl">📌</span>
                <div>
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                    Ghim Lời Nhắn Lên Tường
                  </h2>
                  <p className="text-[10px] text-neutral-500">
                    Để lại lời nhắn ngọt ngào của bạn cho Tiệm nhé!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleCreateNote} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Sender Name */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Tên của bạn:
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer"
                    />
                    <span>Gửi ẩn danh 🤫</span>
                  </label>
                </div>
                {!isAnonymous && (
                  <input
                    type="text"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    maxLength={20}
                    placeholder="VD: Bé dâu tây, Một bạn giấu tên..."
                    className="w-full px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-amber-400 focus:outline-none text-neutral-800 dark:text-neutral-100"
                  />
                )}
              </div>

              {/* Note Content */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Nội dung lời nhắn: <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={250}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ghi những lời mật ngọt chúc Tiệm Nhỏ ngày càng đông vui, hoặc bày tỏ tình yêu của bạn dành cho nhân vật nhé... (Dưới 250 ký tự)"
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-amber-400 focus:outline-none text-neutral-800 dark:text-neutral-100 resize-none font-serif leading-relaxed"
                />
                <div className="text-right text-[10px] text-neutral-400 font-mono">
                  {content.length}/250 ký tự
                </div>
              </div>

              {/* Color Preset Choice */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Màu giấy note xinh xắn:
                </label>
                <div className="flex gap-2.5">
                  {COLOR_PRESETS.map((color) => {
                    const isSelected = selectedColor === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColor(color.id)}
                        className={`w-9 h-9 rounded-xl border relative transition shadow-2xs cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 ${
                          color.id === 'yellow' ? 'bg-amber-100 border-amber-300' :
                          color.id === 'pink' ? 'bg-rose-100 border-rose-300' :
                          color.id === 'blue' ? 'bg-sky-100 border-sky-300' :
                          color.id === 'green' ? 'bg-emerald-100 border-emerald-300' :
                          'bg-purple-100 border-purple-300'
                        }`}
                        title={color.name}
                      >
                        {isSelected && (
                          <span className="w-2.5 h-2.5 bg-neutral-850 dark:bg-white rounded-full animate-scale-up" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Đang dán...' : 'Dán Lên Tường 📌'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
