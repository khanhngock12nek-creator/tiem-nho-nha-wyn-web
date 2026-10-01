import React, { useState, useRef } from 'react';
import {
  Camera,
  Download,
  Copy,
  Sparkles,
  ArrowLeft,
  Check,
  RefreshCw,
  Heart,
  Palette,
  Type,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Character } from '../types';

interface PolaroidCardGeneratorViewProps {
  characters: Character[];
  onBackToHome: () => void;
}

type FrameColor = 'white' | 'pink' | 'cream' | 'dark' | 'lavender';
type TapeStyle = 'washi_pink' | 'washi_strawberry' | 'clip_gold' | 'wax_seal' | 'none';

export const PolaroidCardGeneratorView: React.FC<PolaroidCardGeneratorViewProps> = ({
  characters,
  onBackToHome,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(
    characters[0]?.id || ''
  );
  const [frameColor, setFrameColor] = useState<FrameColor>('white');
  const [tapeStyle, setTapeStyle] = useState<TapeStyle>('washi_pink');
  const [customCaption, setCustomCaption] = useState<string>('');
  const [authorSignature, setAuthorSignature] = useState<string>('Tiệm Nhỏ Nhà Wyn 🍓');
  const [showDate, setShowDate] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const selectedChar =
    characters.find((c) => c.id === selectedCharId) || characters[0];

  const currentCaption =
    customCaption.trim() ||
    selectedChar?.openingMessage ||
    'Một khoảnh khắc dịu dàng được lưu giữ lại...';

  // Frame themes configuration
  const frameThemes: Record<
    FrameColor,
    { label: string; bg: string; text: string; subText: string; border: string }
  > = {
    white: {
      label: 'Trắng Cổ Điển',
      bg: 'bg-white',
      text: 'text-neutral-800',
      subText: 'text-neutral-400',
      border: 'border-neutral-200 shadow-xl',
    },
    pink: {
      label: 'Hồng Dâu Tây',
      bg: 'bg-rose-50',
      text: 'text-rose-900',
      subText: 'text-rose-400',
      border: 'border-rose-200 shadow-xl',
    },
    cream: {
      label: 'Kem Vintage',
      bg: 'bg-amber-50',
      text: 'text-amber-950',
      subText: 'text-amber-600/70',
      border: 'border-amber-200 shadow-xl',
    },
    dark: {
      label: 'Đêm Huyền Bí',
      bg: 'bg-neutral-900',
      text: 'text-neutral-100',
      subText: 'text-neutral-400',
      border: 'border-neutral-700 shadow-2xl',
    },
    lavender: {
      label: 'Tím Lavender',
      bg: 'bg-purple-50',
      text: 'text-purple-900',
      subText: 'text-purple-400',
      border: 'border-purple-200 shadow-xl',
    },
  };

  // Canvas-based download generator for high quality crisp Polaroid image
  const handleDownloadPolaroid = async () => {
    if (!selectedChar) return;
    setIsExporting(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 800;
      const height = 1050;
      canvas.width = width;
      canvas.height = height;

      // Draw background frame based on frameColor
      let bgColor = '#ffffff';
      let textColor = '#262626';
      let subTextColor = '#737373';

      if (frameColor === 'pink') {
        bgColor = '#fff1f2';
        textColor = '#881337';
        subTextColor = '#fb7185';
      } else if (frameColor === 'cream') {
        bgColor = '#fefce8';
        textColor = '#451a03';
        subTextColor = '#b45309';
      } else if (frameColor === 'dark') {
        bgColor = '#171717';
        textColor = '#f5f5f5';
        subTextColor = '#a3a3a3';
      } else if (frameColor === 'lavender') {
        bgColor = '#faf5ff';
        textColor = '#3b0764';
        subTextColor = '#c084fc';
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // Frame border
      ctx.strokeStyle = frameColor === 'dark' ? '#333333' : '#e5e5e5';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, width - 4, height - 4);

      // Load and draw avatar
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedChar.avatarUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // proceed even if CORS fails
      });

      const photoMarginX = 60;
      const photoMarginY = 70;
      const photoWidth = width - photoMarginX * 2;
      const photoHeight = 650;

      // Photo background placeholder
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(photoMarginX, photoMarginY, photoWidth, photoHeight);

      if (img.complete && img.naturalWidth > 0) {
        // Center crop image
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const targetAspect = photoWidth / photoHeight;
        let sx = 0,
          sy = 0,
          sw = img.naturalWidth,
          sh = img.naturalHeight;

        if (imgAspect > targetAspect) {
          sw = img.naturalHeight * targetAspect;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          sh = img.naturalWidth / targetAspect;
          sy = (img.naturalHeight - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, photoMarginX, photoMarginY, photoWidth, photoHeight);
      }

      // Draw photo inner border
      ctx.strokeStyle = frameColor === 'dark' ? '#262626' : '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(photoMarginX, photoMarginY, photoWidth, photoHeight);

      // Character Name
      ctx.fillStyle = textColor;
      ctx.font = 'bold 36px "Merriweather", Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText(selectedChar.name, photoMarginX, photoMarginY + photoHeight + 60);

      // Character Genres tags
      ctx.fillStyle = subTextColor;
      ctx.font = '18px "Inter", sans-serif';
      const genreString = selectedChar.genres.map((g) => `#${g}`).join('  ');
      ctx.fillText(genreString, photoMarginX, photoMarginY + photoHeight + 95);

      // Caption (multi-line wrap)
      ctx.fillStyle = textColor;
      ctx.font = 'italic 22px "Merriweather", Georgia, serif';

      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
            if (currentY > height - 100) break; // prevent overflow
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, currentY);
      };

      wrapText(`"${currentCaption}"`, photoMarginX, photoMarginY + photoHeight + 140, photoWidth, 32);

      // Signature & Date Stamp at bottom
      ctx.fillStyle = subTextColor;
      ctx.font = '16px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(authorSignature, photoMarginX, height - 40);

      if (showDate) {
        ctx.textAlign = 'right';
        const dateStr = new Date().toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        ctx.fillText(`📅 ${dateStr}`, width - photoMarginX, height - 40);
      }

      // Convert canvas to download link
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `polaroid-${selectedChar.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f43f5e', '#fda4af', '#fef08a'],
      });
    } catch (e) {
      console.error('Failed to export polaroid', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLinkOrText = () => {
    if (!selectedChar) return;
    const textToCopy = `Thẻ ảnh Polaroid: ${selectedChar.name}\n"${currentCaption}"\nKhám phá tại Tiệm Nhỏ Nhà Wyn 🍓`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  if (!selectedChar) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-xl">Chưa có nhân vật nào trong hệ thống để tạo thẻ Polaroid.</p>
        <button
          onClick={onBackToHome}
          className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold"
        >
          Quay lại trang chính
        </button>
      </div>
    );
  }

  const activeTheme = frameThemes[frameColor];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
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
              <span className="text-xl">📸</span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-neutral-900 dark:text-white">
                Xuất Thẻ Nhân Vật Phong Cách Polaroid
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Tạo ảnh thẻ chụp lấy liền vintage kèm lời nhắn ngọt ngào để lưu giữ hoặc chia sẻ cùng bạn bè
            </p>
          </div>
        </div>

        {/* Quick Download Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLinkOrText}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:border-rose-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSuccess ? 'Đã sao chép!' : 'Sao chép trích dẫn'}</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPolaroid}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isExporting ? 'Đang tạo ảnh...' : 'Tải Thẻ Về Máy (PNG)'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: Left Controls, Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customization Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-white/80 dark:bg-neutral-850/80 p-5 rounded-3xl border border-rose-100 dark:border-neutral-800 shadow-sm backdrop-blur-sm">
          {/* Character Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <span>1. Chọn Nhân Vật</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-neutral-100 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/50">
              {characters.map((c) => {
                const isSelected = c.id === selectedCharId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCharId(c.id);
                      setCustomCaption(''); // reset to char opening
                    }}
                    className={`relative rounded-2xl overflow-hidden border p-1 text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50 dark:bg-neutral-800'
                        : 'border-transparent hover:bg-white dark:hover:bg-neutral-800'
                    }`}
                  >
                    <img
                      src={c.avatarUrl}
                      alt={c.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200 truncate w-full px-0.5">
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frame Color Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-500" />
              <span>2. Màu Khung Polaroid</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(frameThemes) as FrameColor[]).map((colorKey) => {
                const item = frameThemes[colorKey];
                const isSelected = frameColor === colorKey;
                return (
                  <button
                    key={colorKey}
                    type="button"
                    onClick={() => setFrameColor(colorKey)}
                    className={`p-2 rounded-2xl border text-xs font-medium transition cursor-pointer text-center ${
                      isSelected
                        ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50 dark:bg-neutral-800 text-rose-600 font-bold'
                        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tape / Pin Decorator */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>3. Phụ Kiện Trang Trí (Kẹp / Băng Keo)</span>
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTapeStyle('washi_pink')}
                className={`p-2 rounded-2xl border transition cursor-pointer flex items-center gap-1.5 ${
                  tapeStyle === 'washi_pink'
                    ? 'border-rose-500 bg-rose-50 dark:bg-neutral-800 text-rose-600 font-bold'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <span>🎀</span>
                <span>Washi Hồng Nhạt</span>
              </button>
              <button
                type="button"
                onClick={() => setTapeStyle('washi_strawberry')}
                className={`p-2 rounded-2xl border transition cursor-pointer flex items-center gap-1.5 ${
                  tapeStyle === 'washi_strawberry'
                    ? 'border-rose-500 bg-rose-50 dark:bg-neutral-800 text-rose-600 font-bold'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <span>🍓</span>
                <span>Băng Keo Dâu</span>
              </button>
              <button
                type="button"
                onClick={() => setTapeStyle('wax_seal')}
                className={`p-2 rounded-2xl border transition cursor-pointer flex items-center gap-1.5 ${
                  tapeStyle === 'wax_seal'
                    ? 'border-rose-500 bg-rose-50 dark:bg-neutral-800 text-rose-600 font-bold'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <span>🕯️</span>
                <span>Dấu Xi Đỏ</span>
              </button>
              <button
                type="button"
                onClick={() => setTapeStyle('none')}
                className={`p-2 rounded-2xl border transition cursor-pointer flex items-center gap-1.5 ${
                  tapeStyle === 'none'
                    ? 'border-rose-500 bg-rose-50 dark:bg-neutral-800 text-rose-600 font-bold'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <span>🚫</span>
                <span>Không dùng kẹp</span>
              </button>
            </div>
          </div>

          {/* Caption text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-rose-500" />
                <span>4. Lời Nhắn / Câu Thoại Dưới Thẻ</span>
              </label>
              <button
                type="button"
                onClick={() => setCustomCaption(selectedChar.openingMessage)}
                className="text-[10px] text-rose-500 hover:underline cursor-pointer"
              >
                Dùng lời mở đầu
              </button>
            </div>
            <textarea
              rows={3}
              value={customCaption}
              onChange={(e) => setCustomCaption(e.target.value)}
              placeholder={selectedChar.openingMessage}
              className="w-full text-xs p-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:border-rose-400 text-neutral-900 dark:text-white resize-none"
            />
          </div>

          {/* Signature & Date */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                Chữ ký góc thẻ
              </label>
              <input
                type="text"
                value={authorSignature}
                onChange={(e) => setAuthorSignature(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:border-rose-400 text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300 pb-2">
                <input
                  type="checkbox"
                  checked={showDate}
                  onChange={(e) => setShowDate(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
                <span>Hiện tem ngày tháng</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Live Realistic Polaroid Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-rose-50/40 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-rose-200 dark:border-neutral-800">
          <div className="text-center space-y-1 mb-4">
            <span className="px-3 py-1 rounded-full bg-white dark:bg-neutral-800 text-[11px] font-bold text-rose-500 border border-rose-100 dark:border-neutral-700 shadow-xs">
              Xem trước trực tiếp (Live Preview)
            </span>
          </div>

          {/* Realistic Polaroid Card */}
          <div
            ref={cardRef}
            className={`relative w-full max-w-[360px] sm:max-w-[400px] p-4 sm:p-5 rounded-2xl border transition-all duration-300 transform hover:rotate-1 shadow-2xl ${activeTheme.bg} ${activeTheme.border}`}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
            }}
          >
            {/* Top Tape Ornament */}
            {tapeStyle === 'washi_pink' && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-pink-300/80 backdrop-blur-xs border-y border-pink-400/50 shadow-xs rotate-[-2deg] z-20 pointer-events-none opacity-90" />
            )}
            {tapeStyle === 'washi_strawberry' && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-32 h-7 bg-rose-300/90 backdrop-blur-xs border-y border-rose-400/60 shadow-xs rotate-[1.5deg] z-20 pointer-events-none flex items-center justify-around text-xs opacity-95">
                <span>🍓</span>
                <span>🍓</span>
                <span>🍓</span>
              </div>
            )}
            {tapeStyle === 'wax_seal' && (
              <div className="absolute -top-4 right-6 w-9 h-9 rounded-full bg-gradient-to-tr from-rose-700 to-red-500 border border-amber-300 text-white flex items-center justify-center text-xs shadow-md z-20 pointer-events-none">
                <Heart className="w-4 h-4 fill-white" />
              </div>
            )}

            {/* Photo Square Frame */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/80 dark:border-neutral-800 shadow-inner group">
              <img
                src={selectedChar.avatarUrl}
                alt={selectedChar.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Polaroid Bottom Note Area */}
            <div className="pt-4 pb-2 px-1 space-y-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className={`text-lg font-bold font-serif-title ${activeTheme.text}`}>
                  {selectedChar.name}
                </h3>
                <div className="flex items-center gap-1 text-[10px] text-rose-500 font-semibold">
                  {selectedChar.genres.slice(0, 2).map((g) => (
                    <span key={g} className="px-1.5 py-0.5 rounded bg-rose-100/70 dark:bg-rose-950/60">
                      #{g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <p
                className={`text-xs sm:text-sm font-serif italic leading-relaxed whitespace-pre-line line-clamp-4 ${activeTheme.text}`}
              >
                "{currentCaption}"
              </p>

              {/* Bottom Meta */}
              <div className={`flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[10px] ${activeTheme.subText}`}>
                <span className="font-medium tracking-wide">{authorSignature}</span>
                {showDate && (
                  <span className="font-mono">
                    {new Date().toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 mt-4 text-center">
            💡 Thẻ ảnh có độ nét cao (800x1050px) khi bấm "Tải Thẻ Về Máy (PNG)"
          </p>
        </div>
      </div>
    </div>
  );
};
