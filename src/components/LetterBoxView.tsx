import React, { useState } from 'react';
import {
  Send,
  Mail,
  Heart,
  Sparkles,
  MessageCircle,
  CheckCircle,
  RefreshCw,
  User,
  EyeOff,
  X,
  Shield,
  ShieldCheck,
  Lock,
  Trash2,
  KeyRound,
  AlertTriangle,
  Search,
  CheckSquare,
  Square,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Letter } from '../types';

interface LetterBoxViewProps {
  letters: Letter[];
  onAddLetter: (letter: Omit<Letter, 'id' | 'createdAt'>) => void;
  onLikeLetter?: (letterId: string) => void;
  isAdmin: boolean;
  onOpenAdminLogin?: () => void;
  onDeleteLetter?: (letterId: string) => void;
  onDeleteMultipleLetters?: (letterIds: string[]) => void;
  onClearAllLetters?: () => void;
}

type EnvelopeStatus = 'closed' | 'opened' | 'folding' | 'sent';

export const LetterBoxView: React.FC<LetterBoxViewProps> = ({
  letters,
  onAddLetter,
  isAdmin,
  onOpenAdminLogin,
  onDeleteLetter,
  onDeleteMultipleLetters,
  onClearAllLetters,
}) => {
  const [envelopeStatus, setEnvelopeStatus] = useState<EnvelopeStatus>('closed');
  const [author, setAuthor] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [content, setContent] = useState('');
  const [stamp, setStamp] = useState<Letter['stampType']>('heart');
  const [lastSentAuthor, setLastSentAuthor] = useState('');

  // Admin management state
  const [selectedLetterIds, setSelectedLetterIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'anonymous' | 'named'>('all');

  const stampsConfig = [
    { type: 'heart' as const, label: 'Trái Tim', icon: '💌' },
    { type: 'strawberry' as const, label: 'Dâu Tây', icon: '🍓' },
    { type: 'wax_seal' as const, label: 'Xi Đỏ', icon: '🕯️' },
    { type: 'moon' as const, label: 'Ánh Trăng', icon: '🌙' },
    { type: 'ribbon' as const, label: 'Ruy Băng', icon: '🎀' },
  ];

  // Open the envelope to reveal letter paper
  const handleOpenEnvelope = () => {
    setEnvelopeStatus('opened');
  };

  // Submit and trigger fold-and-insert animation
  const handleSendLetter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || envelopeStatus !== 'opened') return;

    const finalAuthor = isAnonymous
      ? 'Người bí mật giấu tên 💌'
      : (author.trim() || 'Khách Ghé Thăm 🌸');

    setLastSentAuthor(finalAuthor);

    // 1. Start folding & inserting paper into envelope
    setEnvelopeStatus('folding');

    // 2. Wait for paper to fold and insert into envelope, then close flap & seal
    setTimeout(() => {
      onAddLetter({
        author: finalAuthor,
        content: content.trim(),
        stampType: stamp,
        likesCount: 0,
      });

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fda4af', '#fef08a', '#fbcfe8'],
      });

      setEnvelopeStatus('sent');
      setContent('');
      if (!isAnonymous) setAuthor('');
    }, 1200);
  };

  // Reset to write a new letter
  const handleResetForNewLetter = () => {
    setEnvelopeStatus('closed');
  };

  // Filtered letters for Admin
  const filteredLetters = letters.filter((letter) => {
    if (filterType === 'anonymous' && !letter.author.includes('bí mật')) return false;
    if (filterType === 'named' && letter.author.includes('bí mật')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAuthor = letter.author.toLowerCase().includes(q);
      const matchContent = letter.content.toLowerCase().includes(q);
      return matchAuthor || matchContent;
    }

    return true;
  });

  // Selection handlers for batch delete
  const handleToggleSelectLetter = (id: string) => {
    setSelectedLetterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLetterIds.length === filteredLetters.length && filteredLetters.length > 0) {
      setSelectedLetterIds([]);
    } else {
      setSelectedLetterIds(filteredLetters.map((l) => l.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedLetterIds.length === 0) return;
    if (onDeleteMultipleLetters) {
      onDeleteMultipleLetters(selectedLetterIds);
    } else if (onDeleteLetter) {
      selectedLetterIds.forEach((id) => onDeleteLetter(id));
    }
    setSelectedLetterIds([]);
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto select-none">
      {/* Header Banner */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <Lock className="w-3.5 h-3.5 text-rose-500" />
          <span>Hòm Thư Riêng Tư & Bảo Mật</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif-title text-neutral-900 dark:text-white">
          Nơi Gửi Thư Trực Tiếp Đến Quản Trị Viên
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Lá thư bạn gửi sẽ được chuyển thẳng đến Quản Trị Viên (Wyn). Người dùng khác trên web không thể đọc được nội dung thư của bạn.
        </p>
      </div>

      {/* INTERACTIVE ENVELOPE & LETTER CONTAINER */}
      <div className="relative mx-auto max-w-2xl px-2 sm:px-4">
        {/* Cute decorative vintage stickers around the envelope */}
        <div className="hidden sm:block absolute -top-4 -left-6 z-20 pointer-events-none rotate-[-8deg] bg-amber-50/90 dark:bg-neutral-800 border border-amber-200 dark:border-neutral-700 px-3 py-1 rounded-xl shadow-sm text-[11px] font-serif-title text-amber-700 dark:text-amber-300">
          ✨ dream big
        </div>
        <div className="hidden sm:block absolute -top-5 -right-4 z-20 pointer-events-none rotate-[6deg] bg-rose-50/95 dark:bg-neutral-800 border border-rose-200 dark:border-neutral-700 px-3 py-1 rounded-xl shadow-sm text-[11px] font-serif-title text-rose-600 dark:text-rose-300">
          🌸 keep going
        </div>
        <div className="hidden sm:block absolute -bottom-5 -right-5 z-20 pointer-events-none rotate-[-6deg] bg-pink-50/90 dark:bg-neutral-800 border border-pink-200 dark:border-neutral-700 px-3 py-1 rounded-xl shadow-sm text-[11px] font-serif-title text-pink-700 dark:text-pink-300">
          🍓 Tiệm Nhỏ Nhà Wyn
        </div>

        {/* Vintage Postcard Backdrop Envelope Frame */}
        <div className="relative rounded-[2.5rem] p-4 sm:p-7 bg-gradient-to-b from-rose-100/70 via-rose-50/50 to-amber-50/40 dark:from-neutral-850 dark:via-neutral-900 dark:to-neutral-900 border-2 border-rose-200/90 dark:border-neutral-750 shadow-2xl overflow-hidden transition-all duration-500">
          {/* Postcard postmark & wavy stamp lines at top right */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 pointer-events-none opacity-80 flex items-center gap-2">
            <div className="text-[10px] sm:text-xs font-mono tracking-widest text-rose-400 font-bold uppercase border-2 border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded rotate-[-4deg]">
              POSTCARD
            </div>
            <div className="w-9 h-11 border-2 border-dashed border-rose-300 dark:border-rose-700 rounded flex flex-col items-center justify-center text-rose-400 text-xs">
              ★
              <span className="text-[8px] font-mono">WYNS</span>
            </div>
          </div>

          {/* Diagonal candy-stripe postal border accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-repeating-linear-gradient-to-r from-rose-400 via-white to-rose-400 opacity-60" />

          {/* ========================================================================= */}
          {/* STATE 1: ENVELOPE CLOSED (Hình 1 chiếc phong bì đang đóng với nút chính giữa) */}
          {/* ========================================================================= */}
          {envelopeStatus === 'closed' && (
            <div className="py-8 sm:py-14 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300">
              {/* Envelope Body Visual */}
              <div className="relative w-64 sm:w-80 h-44 sm:h-52 bg-gradient-to-b from-rose-200/90 via-pink-100 to-amber-50 dark:from-neutral-800 dark:via-neutral-850 dark:to-neutral-900 rounded-3xl border-2 border-rose-300 dark:border-neutral-700 shadow-xl flex items-center justify-center overflow-hidden group">
                {/* Envelope Flap Lines */}
                <div className="absolute top-0 left-0 right-0 h-1/2 border-b-2 border-rose-300/80 dark:border-neutral-700 bg-rose-200/50 dark:bg-neutral-800/80 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
                <div className="absolute bottom-0 left-0 w-1/2 h-full border-r border-rose-300/40 [clip-path:polygon(0_100%,100%_100%,0_0)]" />
                <div className="absolute bottom-0 right-0 w-1/2 h-full border-l border-rose-300/40 [clip-path:polygon(0_100%,100%_100%,100%_0)]" />

                {/* Sweet illustrations on envelope */}
                <div className="absolute bottom-3 left-4 text-xs opacity-60">🌸 🕊️</div>
                <div className="absolute bottom-3 right-4 text-xs opacity-60">🕊️ 🌸</div>

                {/* BIG CENTER BUTTON: "Mở để gửi lời ngọt ngào nò" */}
                <button
                  type="button"
                  onClick={handleOpenEnvelope}
                  className="relative z-10 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-500 to-pink-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2.5 cursor-pointer border border-rose-300/60 group"
                  title="Nhấn để mở phong bì và viết thư"
                >
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-12 transition-transform">
                    <Heart className="w-4 h-4 fill-white text-white animate-pulse" />
                  </div>
                  <span className="font-serif-title tracking-wide">
                    Mở để gửi lời ngọt ngào nò
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin-slow" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-rose-400" />
                  <span>Bấm vào nút chính giữa phong bì để viết thư bí mật gửi Quản Trị Viên</span>
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATE 2: ENVELOPE OPENED & WRITING */}
          {/* STATE 3: FOLDING (Hiệu ứng phong thư gấp lại được nhét vào phong bì) */}
          {/* ========================================================================= */}
          {(envelopeStatus === 'opened' || envelopeStatus === 'folding') && (
            <div className="relative py-2 sm:py-4">
              {/* Back pocket of envelope */}
              <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 bg-rose-200/40 dark:bg-neutral-800/40 rounded-b-3xl -z-0 pointer-events-none" />

              {/* STATIONERY LETTER SHEET (Trang giấy hiện lên có dòng kẻ) */}
              <div
                className={`relative z-10 bg-amber-50/80 dark:bg-neutral-850 rounded-2xl sm:rounded-3xl border-2 border-rose-200 dark:border-neutral-700 shadow-xl p-5 sm:p-7 space-y-4 transition-all duration-700 ${
                  envelopeStatus === 'folding'
                    ? 'animate-letter-fold-insert pointer-events-none'
                    : 'animate-letter-rise'
                }`}
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(transparent, transparent 31px, #fbcfe8 31px, #fbcfe8 32px)',
                }}
              >
                {/* Top header of stationery */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-rose-200/60 dark:border-neutral-700">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💌</span>
                    <span className="font-serif-title font-bold text-sm sm:text-base text-rose-700 dark:text-rose-300">
                      Gửi đến: Quản Trị Viên (Wyn),
                    </span>
                  </div>

                  {envelopeStatus === 'opened' && (
                    <button
                      type="button"
                      onClick={() => setEnvelopeStatus('closed')}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg transition cursor-pointer"
                      title="Gấp lại đóng phong bì"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* SENDER OPTIONS: Đặt tên HOẶC Ẩn danh */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm p-3 rounded-2xl border border-rose-100 dark:border-neutral-750">
                  {/* Name Input */}
                  <div className="flex-1 flex items-center gap-2">
                    <User className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 shrink-0">
                      Người gửi:
                    </span>
                    {isAnonymous ? (
                      <span className="text-xs font-medium text-rose-600 dark:text-rose-400 italic">
                        🎭 Đang bật chế độ Ẩn danh (Người bí mật giấu tên)
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Nhập tên hoặc biệt danh của bạn..."
                        className="w-full text-xs sm:text-sm px-2.5 py-1 bg-transparent border-b border-rose-300 dark:border-neutral-600 focus:outline-none focus:border-rose-500 text-neutral-800 dark:text-neutral-100"
                        maxLength={35}
                      />
                    )}
                  </div>

                  {/* Anonymous Toggle Button (Ẩn danh) */}
                  <button
                    type="button"
                    onClick={() => setIsAnonymous((prev) => !prev)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                      isAnonymous
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                        : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-rose-400'
                    }`}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{isAnonymous ? 'Đã chọn Ẩn danh' : 'Gửi Ẩn danh'}</span>
                  </button>
                </div>

                {/* RULED PAPER WRITING AREA (Nội dung viết xuống dòng kẻ tờ giấy) */}
                <div className="relative pt-1">
                  <textarea
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Viết những lời ngọt ngào, tâm sự riêng tư hay góp ý gửi riêng đến Quản Trị Viên vào các dòng kẻ này nò... (Chỉ QTV mới đọc được) ✨"
                    className="w-full text-xs sm:text-sm bg-transparent border-0 focus:outline-none text-neutral-800 dark:text-neutral-100 resize-none font-serif leading-8 pl-1 placeholder:text-neutral-400 placeholder:italic"
                    style={{ lineHeight: '32px' }}
                    autoFocus
                  />
                </div>

                {/* BOTTOM SECTION: Con dấu niêm phong + NÚT GỬI THƯ Ở GÓC TỜ GIẤY */}
                <div className="pt-2 border-t border-rose-200/60 dark:border-neutral-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 shrink-0">
                      Con dấu:
                    </span>
                    <div className="flex items-center gap-1">
                      {stampsConfig.map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setStamp(item.type)}
                          title={`Dấu ${item.label}`}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border transition cursor-pointer ${
                            stamp === item.type
                              ? 'border-rose-500 bg-rose-100 dark:bg-rose-950/60 scale-110 shadow-sm'
                              : 'border-transparent hover:bg-rose-50 dark:hover:bg-neutral-800'
                          }`}
                        >
                          {item.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* NÚT GỬI THƯ Ở GÓC TỜ GIẤY */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEnvelopeStatus('closed')}
                      className="px-3 py-2 rounded-xl text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      Để sau
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendLetter()}
                      disabled={!content.trim() || envelopeStatus === 'folding'}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer border border-rose-300/40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi thư 💌</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Envelope flap visual tucking when folding */}
              {envelopeStatus === 'folding' && (
                <div className="mt-4 text-center text-xs font-serif-title text-rose-500 animate-pulse flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Đang gấp lá thư & niêm phong gửi riêng tới QTV...</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATE 4: ENVELOPE SEALED & SENT */}
          {/* ========================================================================= */}
          {envelopeStatus === 'sent' && (
            <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-400">
              <div className="relative w-64 sm:w-72 h-40 sm:h-44 bg-gradient-to-b from-rose-200 via-pink-100 to-amber-50 dark:from-neutral-800 dark:via-neutral-850 dark:to-neutral-900 rounded-3xl border-2 border-rose-300 dark:border-neutral-700 shadow-xl flex items-center justify-center overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1/2 border-b-2 border-rose-300 bg-rose-200/80 dark:bg-neutral-800 [clip-path:polygon(0_0,100%_0,50%_100%)]" />

                <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-500 shadow-lg border-2 border-amber-200/80 flex items-center justify-center text-white animate-seal-stamp">
                  <Heart className="w-6 h-6 fill-white drop-shadow" />
                </div>
              </div>

              <div className="space-y-1.5 max-w-md px-4">
                <div className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold font-serif-title text-base sm:text-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>Đã gửi tới Quản Trị Viên thành công! 🍓💌</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Lá thư ngọt ngào của <strong className="text-rose-500">{lastSentAuthor}</strong> đã được niêm phong an toàn và gửi riêng đến hòm thư của Quản Trị Viên (Wyn). Người khác sẽ không thể đọc được nội dung thư này.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetForNewLetter}
                className="px-5 py-2.5 rounded-2xl bg-white dark:bg-neutral-800 border border-rose-300 dark:border-neutral-700 text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-neutral-750 text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Viết thêm một lá thư nữa ✨</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION FOR VISITORS (Khi không phải Quản Trị Viên) */}
      {/* ========================================================================= */}
      {!isAdmin && (
        <div className="max-w-xl mx-auto p-5 rounded-3xl bg-rose-50/60 dark:bg-neutral-900/60 border border-rose-200/70 dark:border-neutral-800 text-center space-y-3 shadow-sm">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-rose-500" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold font-serif-title text-neutral-800 dark:text-neutral-200">
              Cam kết bảo mật & Quyền riêng tư
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Mọi thư từ, lời nhắn nhủ hay tâm sự của bạn đều được gửi kín trực tiếp đến Quản Trị Viên. Người dùng khác hoàn toàn không thể xem hoặc đọc được những bức thư này.
            </p>
          </div>

          {onOpenAdminLogin && (
            <div className="pt-2 border-t border-rose-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="text-[11px] text-neutral-400 hover:text-rose-500 transition cursor-pointer flex items-center justify-center gap-1 mx-auto"
              >
                <KeyRound className="w-3 h-3" />
                <span>Bạn là Quản trị viên? Nhấn vào đây để mở hòm thư riêng</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN INBOX (CHỈ QUẢN TRỊ VIÊN MỚI THẤY & ĐỌC ĐƯỢC THƯ - XÓA TÙY THÍCH) */}
      {/* ========================================================================= */}
      {isAdmin && (
        <div className="p-6 rounded-3xl bg-white/95 dark:bg-neutral-900/95 border-2 border-rose-300 dark:border-rose-900/60 shadow-xl space-y-5 animate-in fade-in duration-200">
          {/* Top Bar: Title & Total Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-100 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif-title text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>Hòm Thư Quản Trị Viên (Admin Inbox)</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold">
                    Quản lý & Xóa thư tùy thích
                  </span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Tổng cộng: <strong className="text-rose-500">{letters.length}</strong> lá thư trong hệ thống
                </p>
              </div>
            </div>

            {/* Quick Global Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Batch Delete Selected Button */}
              {selectedLetterIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5 animate-in fade-in"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa {selectedLetterIds.length} thư đã chọn</span>
                </button>
              )}

              {/* Clear All Letters Button */}
              {letters.length > 0 && onClearAllLetters && (
                <button
                  type="button"
                  onClick={() => {
                    onClearAllLetters();
                    setSelectedLetterIds([]);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                  title="Dọn sạch toàn bộ hòm thư"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Dọn sạch tất cả thư</span>
                </button>
              )}
            </div>
          </div>

          {/* Search, Filter & Select All Toolbar */}
          {letters.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-rose-50/50 dark:bg-neutral-850 p-3 rounded-2xl border border-rose-100 dark:border-neutral-800">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm thư theo tên hoặc nội dung..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-rose-400 text-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Filter Pills & Select All */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      filterType === 'all'
                        ? 'bg-rose-500 text-white font-medium'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-rose-500'
                    }`}
                  >
                    Tất cả ({letters.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('named')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      filterType === 'named'
                        ? 'bg-rose-500 text-white font-medium'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-rose-500'
                    }`}
                  >
                    Có tên
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('anonymous')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      filterType === 'anonymous'
                        ? 'bg-rose-500 text-white font-medium'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-rose-500'
                    }`}
                  >
                    Ẩn danh
                  </button>
                </div>

                {/* Select All Checkbox Button */}
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-rose-500 text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {selectedLetterIds.length === filteredLetters.length && filteredLetters.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-rose-500" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                  <span>Chọn tất cả</span>
                </button>
              </div>
            </div>
          )}

          {/* Letter List for Admin */}
          {letters.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 space-y-1">
              <p className="text-xl">📬</p>
              <p className="font-semibold text-neutral-600 dark:text-neutral-300">
                Hòm thư quản trị viên hiện đang trống!
              </p>
              <p>Chưa có bức thư nào hoặc toàn bộ thư cũ đã được xóa sạch.</p>
            </div>
          ) : filteredLetters.length === 0 ? (
            <div className="py-10 text-center text-xs text-neutral-400 space-y-1">
              <p>Không tìm thấy bức thư nào khớp với tìm kiếm "{searchQuery}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLetters.map((letter) => {
                const stampObj =
                  stampsConfig.find((s) => s.type === letter.stampType) || stampsConfig[0];
                const isSelected = selectedLetterIds.includes(letter.id);

                return (
                  <div
                    key={letter.id}
                    className={`relative p-5 rounded-3xl border transition space-y-3 flex flex-col justify-between group ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/90 dark:bg-neutral-800 ring-2 ring-rose-400 shadow-md'
                        : 'border-rose-200 dark:border-neutral-750 bg-amber-50/40 dark:bg-neutral-850/80 shadow-sm hover:border-rose-300'
                    }`}
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(transparent, transparent 27px, #fbcfe8 27px, #fbcfe8 28px)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {/* Checkbox to select for batch delete */}
                        <button
                          type="button"
                          onClick={() => handleToggleSelectLetter(letter.id)}
                          className="p-1 rounded-lg hover:bg-white/80 dark:hover:bg-neutral-700 text-neutral-400 hover:text-rose-500 transition cursor-pointer"
                          title={isSelected ? 'Bỏ chọn' : 'Chọn để xóa'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-rose-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <div className="w-9 h-9 rounded-2xl bg-white dark:bg-neutral-800 border border-rose-200 dark:border-neutral-700 flex items-center justify-center text-base shadow-sm">
                          {stampObj.icon}
                        </div>

                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span>{letter.author}</span>
                            {letter.author.includes('bí mật') && (
                              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-600">
                                Ẩn danh
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {new Date(letter.createdAt).toLocaleDateString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Quick Delete this single letter */}
                      {onDeleteLetter && (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteLetter(letter.id);
                            setSelectedLetterIds((prev) => prev.filter((id) => id !== letter.id));
                          }}
                          className="px-2 py-1 rounded-xl text-xs text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 transition cursor-pointer flex items-center gap-1 active:scale-95"
                          title="Xóa ngay bức thư này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-[11px] hidden sm:inline">Xóa</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-100 leading-7 whitespace-pre-line font-serif pl-1 bg-white/75 dark:bg-neutral-900/60 p-3 rounded-2xl border border-rose-100 dark:border-neutral-800">
                      {letter.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
