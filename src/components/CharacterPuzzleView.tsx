import React, { useState, useEffect, useRef } from 'react';
import { Character, PuzzleImage } from '../types';
import {
  Trophy,
  RefreshCw,
  Eye,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Play,
  CheckCircle,
  Clock,
  Award,
  Download,
  Image as ImageIcon,
  Heart,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  AlertCircle
} from 'lucide-react';
import {
  subscribePuzzleImages,
  savePuzzleImageToFirestore,
  deletePuzzleImageFromFirestore
} from '../lib/firebase';

interface CharacterPuzzleViewProps {
  characters: Character[];
  isAdmin: boolean;
  onBackToHome: () => void;
}

interface SelectablePuzzleItem {
  id: string;
  name: string;
  imageUrl: string;
  isCustom?: boolean;
  characterId: string;
  genres: string[];
}

interface PuzzlePiece {
  id: number;
  correctIndex: number;
  currentPosition: number;
}

export const CharacterPuzzleView: React.FC<CharacterPuzzleViewProps> = ({
  characters,
  isAdmin,
  onBackToHome,
}) => {
  const [customImages, setCustomImages] = useState<PuzzleImage[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectablePuzzleItem | null>(null);
  const [gridSize, setGridSize] = useState<number>(3); // 3x3, 4x4, 5x5
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Admin upload states
  const [uploadCharId, setUploadCharId] = useState<string>('');
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Game states
  const [moves, setMoves] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to real-time custom puzzle images from Firestore
  useEffect(() => {
    const unsubscribe = subscribePuzzleImages(
      (images) => {
        setCustomImages(images);
      },
      (err) => {
        console.error('Failed to subscribe to custom puzzle images:', err);
      }
    );
    return () => unsubscribe();
  }, []);

  // Merge default characters and custom uploaded images into a single list
  const defaultItems: SelectablePuzzleItem[] = characters.map((c) => ({
    id: `default-${c.id}`,
    name: c.name,
    imageUrl: c.avatarUrl,
    isCustom: false,
    characterId: c.id,
    genres: c.genres,
  }));

  const customItems: SelectablePuzzleItem[] = customImages.map((img) => ({
    id: img.id,
    name: `${img.characterName} (Ảnh phụ QTV)`,
    imageUrl: img.imageUrl,
    isCustom: true,
    characterId: img.characterId,
    genres: ['Ảnh phụ do QTV tải lên 📸'],
  }));

  const allSelectableItems = [...defaultItems, ...customItems];

  // Set default selection
  useEffect(() => {
    if (allSelectableItems.length > 0 && !selectedItem) {
      setSelectedItem(allSelectableItems[0]);
    }
  }, [characters, customImages, selectedItem]);

  // Handle timer ticks
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const startPuzzle = () => {
    if (!selectedItem) return;

    const totalPieces = gridSize * gridSize;
    const initialPieces: PuzzlePiece[] = Array.from({ length: totalPieces }).map((_, index) => ({
      id: index,
      correctIndex: index,
      currentPosition: index,
    }));

    // Scramble the pieces
    let shuffled: PuzzlePiece[] = [];
    let isSame = true;

    while (isSame) {
      shuffled = [...initialPieces].sort(() => Math.random() - 0.5);
      shuffled = shuffled.map((piece, index) => ({
        ...piece,
        currentPosition: index,
      }));
      isSame = shuffled.every((p) => p.correctIndex === p.currentPosition);
    }

    setPieces(shuffled);
    setSelectedPieceIndex(null);
    setMoves(0);
    setSeconds(0);
    setIsSolved(false);
    setIsPlaying(true);
    setTimerActive(true);
    setShowPreview(false);
  };

  const handlePieceClick = (index: number) => {
    if (isSolved || !isPlaying) return;

    if (selectedPieceIndex === null) {
      setSelectedPieceIndex(index);
    } else {
      if (selectedPieceIndex === index) {
        setSelectedPieceIndex(null);
        return;
      }

      const updatedPieces = [...pieces];
      const p1 = updatedPieces[selectedPieceIndex];
      const p2 = updatedPieces[index];

      const tempPos = p1.currentPosition;
      p1.currentPosition = p2.currentPosition;
      p2.currentPosition = tempPos;

      updatedPieces[selectedPieceIndex] = p2;
      updatedPieces[index] = p1;

      setPieces(updatedPieces);
      setSelectedPieceIndex(null);
      setMoves((prev) => prev + 1);

      const solved = updatedPieces.every((p, idx) => p.correctIndex === idx);
      if (solved) {
        setIsSolved(true);
        setTimerActive(false);
      }
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleDownloadImage = () => {
    if (!selectedItem) return;
    const link = document.createElement('a');
    link.href = selectedItem.imageUrl;
    link.target = '_blank';
    link.download = `WynTiem_${selectedItem.name.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Admin Custom Image Upload Handlers
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chỉ tải lên tệp định dạng hình ảnh!');
      return;
    }
    if (file.size > 800000) {
      setUploadError('Tệp quá lớn! Kích thước ảnh tối đa là 800KB để lưu trữ tối ưu.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result && uploadCharId) {
        const selectedChar = characters.find((c) => c.id === uploadCharId);
        if (!selectedChar) {
          setUploadError('Không tìm thấy nhân vật tương ứng!');
          setIsUploading(false);
          return;
        }

        const newImg: PuzzleImage = {
          id: `puzzle-img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          characterId: uploadCharId,
          characterName: selectedChar.name,
          imageUrl: e.target.result as string,
          createdAt: Date.now(),
        };

        try {
          await savePuzzleImageToFirestore(newImg);
          setUploadUrl('');
          setIsUploading(false);
          alert('Đã thêm ảnh ghép hình mới thành công! 🎉');
        } catch (error) {
          setUploadError('Không thể lưu ảnh lên đám mây. Vui lòng thử lại!');
          setIsUploading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadCharId) {
      setUploadError('Vui lòng chọn nhân vật tương ứng!');
      return;
    }
    if (!uploadUrl.trim()) {
      setUploadError('Vui lòng nhập đường dẫn hình ảnh!');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    const selectedChar = characters.find((c) => c.id === uploadCharId);
    if (!selectedChar) {
      setUploadError('Không tìm thấy nhân vật tương ứng!');
      setIsUploading(false);
      return;
    }

    const newImg: PuzzleImage = {
      id: `puzzle-img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      characterId: uploadCharId,
      characterName: selectedChar.name,
      imageUrl: uploadUrl.trim(),
      createdAt: Date.now(),
    };

    try {
      await savePuzzleImageToFirestore(newImg);
      setUploadUrl('');
      setIsUploading(false);
      alert('Đã thêm ảnh ghép hình mới thành công! 🎉');
    } catch (error) {
      setUploadError('Không thể lưu ảnh lên đám mây. Vui lòng thử lại!');
      setIsUploading(false);
    }
  };

  const handleDeleteCustomImage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa ảnh phụ này khỏi kho ghép hình?')) {
      try {
        await deletePuzzleImageFromFirestore(id);
        if (selectedItem?.id === id) {
          setSelectedItem(allSelectableItems[0] || null);
          setIsPlaying(false);
        }
        alert('Đã xóa ảnh phụ thành công!');
      } catch (error) {
        alert('Không thể xóa ảnh. Vui lòng thử lại!');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Header section with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100 dark:border-neutral-800">
        <div>
          <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest select-none">
            Trò Chơi Tương Tác 🧩
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-neutral-900 dark:text-white mt-1.5 flex items-center gap-2">
            Xếp Hình Săn Ảnh Nhân Vật
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Chơi ghép hình giải trí từ bất cứ bức ảnh nào trong tiệm. Hoàn thành để tải về thẻ ảnh cực nét của họ!
          </p>
        </div>
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-rose-100 dark:border-neutral-700 rounded-2xl text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-rose-50 dark:hover:bg-neutral-755 transition shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-rose-500" />
          <span>Về Trang Chủ</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Image / Character List Selector */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl p-5 border border-rose-100 dark:border-neutral-800 shadow-xs">
            <h3 className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-rose-500" />
              Chọn Bức Ảnh Muốn Xếp
            </h3>
            <p className="text-[11px] text-neutral-400 mb-4">
              Nhấp chọn ảnh gốc hoặc ảnh phụ do QTV đăng tải để cắt thành mảnh ghép.
            </p>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {allSelectableItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isPlaying && !isSolved) {
                        if (confirm('Bạn có muốn hủy lượt chơi hiện tại để chọn ảnh nhân vật khác?')) {
                          setSelectedItem(item);
                          setIsPlaying(false);
                          setIsSolved(false);
                        }
                      } else {
                        setSelectedItem(item);
                        setIsPlaying(false);
                        setIsSolved(false);
                      }
                    }}
                    className={`p-2.5 rounded-2xl text-left transition flex items-center gap-3 border cursor-pointer group ${
                      isSelected
                        ? 'bg-rose-50/80 dark:bg-neutral-800/80 border-rose-200 dark:border-rose-900/60 shadow-2xs'
                        : 'bg-neutral-50/50 dark:bg-neutral-850/50 border-neutral-100 dark:border-neutral-800/40 hover:bg-rose-50/30 dark:hover:bg-neutral-800/30'
                    }`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-10 h-10 rounded-xl object-cover border border-rose-100 dark:border-neutral-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 truncate group-hover:text-rose-500 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {item.genres.join(' • ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isAdmin && item.isCustom && (
                        <button
                          onClick={(e) => handleDeleteCustomImage(item.id, e)}
                          className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-neutral-800 rounded-lg transition"
                          title="Xóa ảnh phụ này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform ${isSelected ? 'text-rose-400' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty & Settings Selection */}
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl p-5 border border-rose-100 dark:border-neutral-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mb-1 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-rose-500" />
                Độ Khó Bản Đồ
              </h3>
              <p className="text-[11px] text-neutral-400 mb-3">
                Chia ảnh thành số lượng mảnh ghép càng nhiều, thử thách càng khó!
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 3, label: 'Dễ (3x3)', desc: '9 mảnh' },
                  { value: 4, label: 'Vừa (4x4)', desc: '16 mảnh' },
                  { value: 5, label: 'Khó (5x5)', desc: '25 mảnh' },
                ].map((item) => (
                  <button
                    key={item.value}
                    disabled={isPlaying && !isSolved}
                    onClick={() => setGridSize(item.value)}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center disabled:opacity-40 ${
                      gridSize === item.value
                        ? 'bg-rose-500 border-rose-500 text-white shadow-2xs font-bold'
                        : 'bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-150 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className="text-xs">{item.label}</span>
                    <span className={`text-[9px] mt-0.5 ${gridSize === item.value ? 'text-rose-100' : 'text-neutral-400'}`}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {selectedItem && !isPlaying && (
              <button
                onClick={startPuzzle}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg hover:scale-101 active:scale-99 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Bắt Đầu Ghép Ngay</span>
              </button>
            )}
          </div>
        </div>

        {/* Right column: The Interactive Puzzle Board */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="flex flex-col items-center">
            {selectedItem ? (
              <div className="w-full max-w-lg space-y-4">
                {/* Game Info Dashboard (Only shows when playing) */}
                {isPlaying && (
                  <div className="flex items-center justify-between bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-2xl p-4 border border-rose-100 dark:border-neutral-800 shadow-2xs w-full">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                      <Clock className="w-4 h-4 text-rose-500" />
                      <span>Thời gian:</span>
                      <strong className="font-mono text-sm text-neutral-800 dark:text-neutral-100">
                        {formatTime(seconds)}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                      <Sparkles className="w-4 h-4 text-rose-500" />
                      <span>Số lượt đổi:</span>
                      <strong className="text-sm text-neutral-800 dark:text-neutral-100">
                        {moves}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`p-1.5 rounded-lg border text-xs transition flex items-center gap-1 cursor-pointer ${
                          showPreview
                            ? 'bg-rose-500 border-rose-500 text-white font-bold'
                            : 'bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                        }`}
                        title="Xem ảnh gốc thu nhỏ làm mẫu"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Xem mẫu</span>
                      </button>

                      <button
                        onClick={startPuzzle}
                        className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Trộn lại các mảnh ghép"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Trộn lại</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* PUZZLE FIELD CONTAINER */}
                <div className="relative bg-white dark:bg-neutral-900 border-2 border-rose-100 dark:border-neutral-800 p-3 rounded-3xl shadow-md w-full aspect-square max-w-md mx-auto overflow-hidden">
                  {isPlaying ? (
                    <>
                      {/* The Scrambled Pieces Grid */}
                      <div
                        className="grid w-full h-full gap-0.5 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-950"
                        style={{
                          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                          gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
                        }}
                      >
                        {pieces.map((piece, index) => {
                          const isSelected = selectedPieceIndex === index;

                          const col = piece.correctIndex % gridSize;
                          const row = Math.floor(piece.correctIndex / gridSize);
                          const percentX = gridSize > 1 ? (col / (gridSize - 1)) * 100 : 0;
                          const percentY = gridSize > 1 ? (row / (gridSize - 1)) * 100 : 0;

                          return (
                            <button
                              key={piece.id}
                              onClick={() => handlePieceClick(index)}
                              className={`w-full h-full relative group focus:outline-hidden transition overflow-hidden cursor-pointer ${
                                isSelected
                                  ? 'ring-4 ring-rose-500 z-10 brightness-105 scale-95 shadow-lg'
                                  : 'hover:brightness-95 hover:scale-[0.98]'
                              }`}
                              style={{
                                backgroundImage: `url(${selectedItem.imageUrl})`,
                                backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                                backgroundPosition: `${percentX}% ${percentY}%`,
                              }}
                            >
                              <span className="absolute bottom-1 right-1 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold text-white select-none opacity-40 group-hover:opacity-100 transition-opacity">
                                {piece.id + 1}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Small Semi-transparent Original Image overlay when clicking "Xem mẫu" */}
                      {showPreview && (
                        <div className="absolute inset-3 bg-black/75 rounded-2xl flex flex-col items-center justify-center p-4 text-white animate-fade-in">
                          <img
                            src={selectedItem.imageUrl}
                            alt={selectedItem.name}
                            className="w-3/4 max-h-[75%] rounded-xl object-contain border-2 border-white/20 shadow-md"
                          />
                          <p className="text-[11px] text-neutral-300 mt-3 text-center">
                            Đây là hình mẫu ban đầu. Ghép các mảnh về đúng vị trí này nhé!
                          </p>
                          <button
                            onClick={() => setShowPreview(false)}
                            className="mt-2.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] rounded-lg font-bold transition cursor-pointer"
                          >
                            Đóng Xem Mẫu
                          </button>
                        </div>
                      )}

                      {/* SOLVED VICTORY OVERLAY */}
                      {isSolved && (
                        <div className="absolute inset-3 bg-black/85 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-white animate-fade-in z-20 space-y-4">
                          <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center animate-bounce shadow-md">
                            <Trophy className="w-9 h-9 text-white" />
                          </div>

                          <div>
                            <h2 className="text-xl sm:text-2xl font-black font-serif-title text-rose-400">
                              QUÁ XUẤT SẮC! 🎉
                            </h2>
                            <p className="text-xs text-neutral-200 mt-1">
                              Bạn đã hoàn thành bản đồ ghép hình của <strong className="text-rose-300">{selectedItem.name}</strong>!
                            </p>
                          </div>

                          {/* Game Score Summary */}
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-full max-w-xs grid grid-cols-2 gap-3">
                            <div className="text-center">
                              <span className="text-[9px] text-neutral-300 block uppercase">Thời Gian</span>
                              <strong className="text-base text-white font-mono">{formatTime(seconds)}</strong>
                            </div>
                            <div className="text-center">
                              <span className="text-[9px] text-neutral-300 block uppercase">Lượt Đổi</span>
                              <strong className="text-base text-white">{moves} lượt</strong>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                            <button
                              onClick={handleDownloadImage}
                              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                              <span>Tải Thẻ Ảnh Nét</span>
                            </button>

                            <button
                              onClick={startPuzzle}
                              className="flex-1 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>Chơi Lại</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* IDLE / START SCREEN OVERLAY */
                    <div className="w-full h-full rounded-2xl bg-gradient-to-b from-rose-50/50 to-pink-50/50 dark:from-neutral-850 dark:to-neutral-900/60 border border-dashed border-rose-200 dark:border-neutral-800 flex flex-col items-center justify-center p-6 text-center">
                      <div className="relative mb-4">
                        <img
                          src={selectedItem.imageUrl}
                          alt={selectedItem.name}
                          className="w-28 h-28 rounded-2xl object-cover border-4 border-white dark:border-neutral-800 shadow-md transform rotate-1"
                        />
                        <span className="absolute -bottom-2 -right-2 text-2xl animate-pulse">🧩</span>
                      </div>

                      <h3 className="text-base font-black text-neutral-800 dark:text-neutral-100">
                        Bản Đồ: {selectedItem.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1.5 max-w-xs leading-relaxed">
                        Sẵn sàng cắt bức ảnh này thành <strong className="text-rose-500">{gridSize * gridSize} mảnh ghép</strong> để thử thách trí nhớ của bạn?
                      </p>

                      <button
                        onClick={startPuzzle}
                        className="mt-5 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs hover:scale-103 active:scale-97 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-4 h-4" />
                        <span>Nhấn Để Bắt Đầu</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Instructions Footer */}
                <div className="bg-rose-50/30 dark:bg-neutral-950/20 rounded-2xl p-4 border border-rose-100/50 dark:border-neutral-800/50 text-xs text-neutral-500 dark:text-neutral-400 space-y-1 text-left">
                  <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Luật chơi cực kỳ đơn giản:
                  </span>
                  <ol className="list-decimal list-inside pl-1 space-y-1 text-[11px] leading-relaxed">
                    <li>Bấm vào một mảnh ghép để chọn, sau đó bấm vào một mảnh khác để **đổi chỗ (swap)** vị trí của chúng.</li>
                    <li>Sắp xếp lại cho đến khi các mảnh ghép tạo thành bức ảnh nguyên vẹn hoàn chỉnh ban đầu.</li>
                    <li>Nếu gặp khó khăn, hãy bấm nút <strong>"Xem mẫu"</strong> để đối chiếu bức tranh gốc.</li>
                    <li>Sau khi giành chiến thắng, bạn sẽ được hệ thống tặng nút <strong>"Tải Thẻ Ảnh Nét"</strong> độc quyền của {selectedItem.name}!</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-neutral-400">
                Vui lòng tạo hoặc thêm nhân vật vào tiệm trước để có hình xếp!
              </div>
            )}
          </div>

          {/* ADMIN PUZZLE IMAGES UPLOAD SECTION */}
          {isAdmin && (
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl p-6 border border-rose-200 dark:border-neutral-800 shadow-md space-y-5">
              <div className="pb-2 border-b border-rose-100 dark:border-neutral-800">
                <h3 className="text-sm font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-rose-500" />
                  Khu Vực QTV: Thêm Ảnh Bất Kỳ Cho Nhân Vật
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Đăng tải thêm các bức ảnh phụ khác của bất cứ nhân vật nào vào kho ghép hình để người chơi tha hồ chọn lựa.
                </p>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mode A: Paste URL */}
                <form onSubmit={handleAddImageFromUrl} className="space-y-4">
                  <span className="text-[10px] bg-rose-50 dark:bg-neutral-800 px-2 py-0.5 rounded font-bold text-rose-500">Cách 1: Dán Đường Dẫn Ảnh URL</span>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-300 mb-1">
                      Chọn Nhân Vật Sở Hữu Ảnh:
                    </label>
                    <select
                      required
                      value={uploadCharId}
                      onChange={(e) => setUploadCharId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-rose-400 focus:outline-none text-neutral-800 dark:text-neutral-100"
                    >
                      <option value="">-- Chọn một nhân vật trong tiệm --</option>
                      {characters.map((char) => (
                        <option key={char.id} value={char.id}>
                          {char.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-300 mb-1">
                      Đường dẫn ảnh (URL):
                    </label>
                    <input
                      type="url"
                      required
                      value={uploadUrl}
                      onChange={(e) => setUploadUrl(e.target.value)}
                      placeholder="VD: https://images.unsplash.com/..."
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-rose-400 focus:outline-none text-neutral-800 dark:text-neutral-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading || !uploadCharId}
                    className="w-full py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isUploading ? 'Đang Xử Lý...' : 'Thêm Vào Kho Ghép'}</span>
                  </button>
                </form>

                {/* Mode B: Drag & Drop local file */}
                <div className="space-y-4">
                  <span className="text-[10px] bg-rose-50 dark:bg-neutral-800 px-2 py-0.5 rounded font-bold text-rose-500">Cách 2: Tải Ảnh Từ Thiết Bị (Dưới 800KB)</span>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-300 mb-1">
                      Chọn Nhân Vật Sở Hữu Ảnh:
                    </label>
                    <select
                      required
                      value={uploadCharId}
                      onChange={(e) => setUploadCharId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-rose-400 focus:outline-none text-neutral-800 dark:text-neutral-100"
                    >
                      <option value="">-- Chọn một nhân vật trong tiệm --</option>
                      {characters.map((char) => (
                        <option key={char.id} value={char.id}>
                          {char.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0] && uploadCharId) {
                        handleFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => {
                      if (uploadCharId) {
                        fileInputRef.current?.click();
                      } else {
                        alert('Vui lòng chọn nhân vật tương ứng trước!');
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl py-6 px-4 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                      !uploadCharId
                        ? 'opacity-40 cursor-not-allowed border-neutral-200 bg-neutral-50/50'
                        : isDragging
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20'
                        : 'border-rose-200 dark:border-neutral-700 hover:border-rose-400'
                    }`}
                  >
                    <Upload className="w-6 h-6 text-rose-400" />
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      {isDragging ? 'Thả ảnh ra đây!' : 'Nhấp hoặc Kéo thả tệp ảnh'}
                    </span>
                    <span className="text-[9px] text-neutral-400">Hỗ trợ JPG, PNG, WEBP (Max 800KB)</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0] && uploadCharId) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                      disabled={!uploadCharId}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
