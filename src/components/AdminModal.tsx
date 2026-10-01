import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, KeyRound, Plus, Trash2, Edit3, Sparkles, Check, AlertCircle, Save, RotateCcw, Mail, Shield, Settings, Upload, Megaphone } from 'lucide-react';
import { Character, Letter, SiteConfig, CustomGenre, WynAnnouncement, AnnouncementTag } from '../types';
import { GENRES_LIST } from '../constants/genres';
import { SAMPLE_CHARACTERS_PRESET } from '../utils/storage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onAdminLogin: () => void;
  onAdminLogout: () => void;
  characters: Character[];
  onSaveCharacter: (char: Character, isNew: boolean) => void;
  onDeleteCharacter: (charId: string) => void;
  onSeedCharacters: (sampleChars: Character[]) => void;
  editingCharacter: Character | null;
  onClearEditing: () => void;
  letters?: Letter[];
  onDeleteLetter?: (letterId: string) => void;
  onDeleteMultipleLetters?: (letterIds: string[]) => void;
  onClearAllLetters?: () => void;
  customLogo: string | null;
  onLogoChange: (logo: string | null) => void;
  siteConfig: SiteConfig;
  onConfigChange: (updates: Partial<SiteConfig>) => void;
  customGenres: CustomGenre[];
  onSaveGenre: (genre: CustomGenre) => void;
  onDeleteGenre: (genreId: string) => void;
  announcements: WynAnnouncement[];
  onAddAnnouncement: (a: Omit<WynAnnouncement, 'id' | 'createdAt' | 'likes'>) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onAdminLogin,
  onAdminLogout,
  characters,
  onSaveCharacter,
  onDeleteCharacter,
  onSeedCharacters,
  editingCharacter,
  onClearEditing,
  letters = [],
  onDeleteLetter,
  onDeleteMultipleLetters,
  onClearAllLetters,
  customLogo,
  onLogoChange,
  siteConfig,
  onConfigChange,
  customGenres,
  onSaveGenre,
  onDeleteGenre,
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [backstory, setBackstory] = useState('');
  const [openingMessage, setOpeningMessage] = useState('');
  const [chatLink, setChatLink] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [likes, setLikes] = useState<number>(0);
  const [customGenre, setCustomGenre] = useState('');
  const [formError, setFormError] = useState('');
  const [activeTab, setActiveTab] = useState<'form' | 'list' | 'inbox' | 'settings' | 'announcements'>('form');

  // Announcement form fields
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announceTag, setAnnounceTag] = useState<AnnouncementTag>('Thông báo');
  const [announceIsPinned, setAnnounceIsPinned] = useState(false);

  // Avatar upload state
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);

  // Logo upload state
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  // Inbox management state
  const [selectedInboxIds, setSelectedInboxIds] = useState<string[]>([]);
  const [inboxSearch, setInboxSearch] = useState('');

  // Sync when editingCharacter changes
  useEffect(() => {
    if (editingCharacter) {
      setName(editingCharacter.name);
      setSelectedGenres(editingCharacter.genres || []);
      setBackstory(editingCharacter.backstory || '');
      setOpeningMessage(editingCharacter.openingMessage || '');
      setChatLink(editingCharacter.chatLink || '');
      setAvatarUrl(editingCharacter.avatarUrl || '');
      setLikes(editingCharacter.likes || 0);
      setActiveTab('form');
    } else {
      resetForm();
    }
  }, [editingCharacter]);

  const resetForm = () => {
    setName('');
    setSelectedGenres([]);
    setBackstory('');
    setOpeningMessage('');
    setChatLink('');
    setAvatarUrl('');
    setLikes(0);
    setFormError('');
    onClearEditing();
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '0712' || pin === '5512') {
      setPinError(false);
      setPin('');
      onAdminLogin();
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleAddCustomGenre = () => {
    const trimmed = customGenre.trim();
    if (!trimmed) return;
    
    // Check if already in default list
    if ((GENRES_LIST as readonly string[]).includes(trimmed)) {
      if (!selectedGenres.includes(trimmed)) {
        setSelectedGenres([...selectedGenres, trimmed]);
      }
      setCustomGenre('');
      return;
    }

    // Check if already in custom list
    const existing = customGenres.find(g => g.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (!selectedGenres.includes(existing.name)) {
        setSelectedGenres([...selectedGenres, existing.name]);
      }
      setCustomGenre('');
      return;
    }

    // Save to Firestore
    const newGenre: CustomGenre = {
      id: `genre-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: trimmed,
      createdAt: Date.now(),
    };

    onSaveGenre(newGenre);
    setSelectedGenres([...selectedGenres, trimmed]);
    setCustomGenre('');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Vui lòng nhập tên nhân vật!');
      return;
    }
    if (selectedGenres.length === 0) {
      setFormError('Vui lòng chọn ít nhất một thể loại cho nhân vật!');
      return;
    }

    const isNew = !editingCharacter;
    const charToSave: Character = {
      id: editingCharacter ? editingCharacter.id : `char-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      genres: selectedGenres,
      backstory: backstory.trim(),
      openingMessage: openingMessage.trim(),
      chatLink: chatLink.trim(),
      avatarUrl: avatarUrl.trim(),
      likes: editingCharacter ? likes : 0,
      createdAt: editingCharacter ? editingCharacter.createdAt : Date.now(),
    };

    onSaveCharacter(charToSave, isNew);
    resetForm();
  };

  const handleSeedSamples = () => {
    const seededList: Character[] = SAMPLE_CHARACTERS_PRESET.map((p, idx) => ({
      ...p,
      id: `sample-char-${Date.now()}-${idx}`,
      createdAt: Date.now() - idx * 1000 * 60 * 60,
    }));
    onSeedCharacters(seededList);
  };

  const handleAvatarUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError('Vui lòng chỉ tải lên tệp định dạng hình ảnh!');
      return;
    }
    if (file.size > 800000) {
      setFormError('Tệp quá lớn! Kích thước ảnh đại diện tối đa là 800KB để lưu trữ tối ưu.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setAvatarUrl(e.target.result as string);
        setFormError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onLogoChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOverLogo = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(true);
  };

  const handleDragLeaveLogo = () => {
    setIsDraggingLogo(false);
  };

  const handleDropLogo = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl border border-rose-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-rose-100 dark:border-neutral-800 flex items-center justify-between bg-rose-50/50 dark:bg-neutral-850">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
              👑
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif-title text-neutral-900 dark:text-white">
                Khu Vực Quản Trị Viên
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {isAdmin ? 'Đã xác thực quyền quản trị tiệm' : 'Yêu cầu mật khẩu phân quyền'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={onAdminLogout}
                className="text-xs text-neutral-400 hover:text-red-500 px-2 py-1 transition cursor-pointer"
              >
                Đăng xuất
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAdmin ? (
          /* Password Input Screen */
          <div className="p-8 text-center max-w-md mx-auto my-auto space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-serif-title text-neutral-800 dark:text-neutral-100">
                Nhập Mật Khẩu Quản Trị
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Mật khẩu được bảo mật ẩn hoàn toàn. Vui lòng nhập mã truy cập của bạn.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.trim());
                    setPinError(false);
                  }}
                  placeholder="••••"
                  autoFocus
                  className="w-full text-center text-2xl tracking-[0.4em] font-mono py-3 px-4 rounded-xl border border-rose-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <KeyRound className="w-4 h-4 text-neutral-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {pinError && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Mật khẩu chưa chính xác. Vui lòng thử lại!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-medium text-sm transition cursor-pointer shadow-md shadow-rose-500/20"
              >
                Xác Thực Quyền Quản Trị
              </button>
            </form>
          </div>
        ) : (
          /* Admin Dashboard & Management */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Actions & Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-850 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('form');
                    resetForm();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'form' && !editingCharacter
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Mới</span>
                </button>

                <button
                  onClick={() => setActiveTab('list')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    activeTab === 'list'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <span>Danh Sách ({characters.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('inbox')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'inbox'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Hòm Thư ({letters.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'announcements'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Thông Báo ({announcements.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'settings'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Cài đặt Tiệm</span>
                </button>
              </div>

              {/* Quick Seed Button */}
              <button
                onClick={handleSeedSamples}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
                title="Tạo sẵn 5 nhân vật phong phú để kiểm tra tính năng"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nạp 5 nhân vật mẫu</span>
              </button>
            </div>

            {activeTab === 'form' && (
              /* Add / Edit Character Form */
              <form onSubmit={handleSaveForm} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                    {editingCharacter ? `Chỉnh sửa: ${editingCharacter.name}` : 'Thêm Nhân Vật Mới'}
                  </h3>
                  {editingCharacter && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs text-rose-500 hover:underline cursor-pointer"
                    >
                      Hủy sửa (Tạo mới)
                    </button>
                  )}
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Tên nhân vật: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Cố Thừa Dực, Hạ Triệt..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-rose-400 focus:outline-none text-neutral-800 dark:text-neutral-100"
                  />
                </div>

                {/* Genre Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Thể loại (chọn từ danh sách hoặc tự thêm): <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Custom Genre Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customGenre}
                      onChange={(e) => setCustomGenre(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomGenre();
                        }
                      }}
                      placeholder="Thêm thể loại mới (VD: Ngọt sủng, Ngược...)"
                      className="flex-1 px-3.5 py-1.5 text-[11px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-rose-400 focus:outline-none text-neutral-800 dark:text-neutral-100"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomGenre}
                      className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-xl text-[11px] font-bold hover:bg-rose-100 transition cursor-pointer"
                    >
                      Thêm
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/40">
                    {/* Default Genres */}
                    {GENRES_LIST.map((genre) => {
                      const isSelected = selectedGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => toggleGenre(genre)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            isSelected
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-rose-300'
                          }`}
                        >
                          {genre} {isSelected && '✓'}
                        </button>
                      );
                    })}

                    {/* Custom Genres from Firestore */}
                    {customGenres.map((genre) => {
                      const isSelected = selectedGenres.includes(genre.name);
                      return (
                        <div key={genre.id} className="relative group/genre">
                          <button
                            type="button"
                            onClick={() => toggleGenre(genre.name)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer pr-6 ${
                              isSelected
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-rose-50 dark:bg-neutral-850 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50 hover:border-rose-300'
                            }`}
                          >
                            {genre.name} {isSelected && '✓'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Xóa thể loại "${genre.name}" khỏi toàn bộ web?`)) {
                                onDeleteGenre(genre.id);
                              }
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-red-500 opacity-0 group-hover/genre:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Selected genres that aren't in either list (just in case) */}
                    {selectedGenres.filter(g => 
                      !(GENRES_LIST as readonly string[]).includes(g) && 
                      !customGenres.some(cg => cg.name === g)
                    ).map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className="text-xs px-2.5 py-1 rounded-lg border bg-rose-500 text-white border-rose-500 transition cursor-pointer"
                      >
                        {genre} ✓
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Đã chọn: {selectedGenres.length > 0 ? selectedGenres.join(', ') : 'Chưa chọn'}
                  </p>
                </div>

                {/* Opening Message */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Tin nhắn mở đầu (Lời chào / Lời thoại đầu tiên):
                  </label>
                  <textarea
                    rows={2}
                    value={openingMessage}
                    onChange={(e) => setOpeningMessage(e.target.value)}
                    placeholder="VD: Đêm nay sương lạnh, em còn chưa chịu về phòng ngủ sao? Hay là... đang đợi tôi?"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-rose-400 focus:outline-none text-neutral-800 dark:text-neutral-100 resize-none"
                  />
                </div>

                {/* Backstory */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Cốt truyện & Tiểu sử nhân vật:
                  </label>
                  <textarea
                    rows={4}
                    value={backstory}
                    onChange={(e) => setBackstory(e.target.value)}
                    placeholder="Mô tả bối cảnh xuất thân, tính cách, quá khứ và mối liên hệ với người dùng..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-rose-400 focus:outline-none text-neutral-800 dark:text-neutral-100 resize-none"
                  />
                </div>

                {/* Chat Link */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Liên kết nhân vật (Link trò chuyện):
                  </label>
                  <input
                    type="url"
                    value={chatLink}
                    onChange={(e) => setChatLink(e.target.value)}
                    placeholder="https://c.ai/c/... hoặc link bot trò chuyện"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-rose-400 focus:outline-none text-neutral-800 dark:text-neutral-100"
                  />
                </div>

                {/* Avatar URL & Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Ảnh đại diện nhân vật: <span className="text-red-500">*</span>
                  </label>
                  
                  {avatarUrl && (
                    <div className="flex items-center gap-3 p-2 bg-rose-50/50 dark:bg-neutral-850 rounded-xl border border-rose-100 dark:border-neutral-800 animate-fade-in">
                      <img 
                        src={avatarUrl} 
                        alt="Avatar Preview" 
                        className="w-12 h-12 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">✓ Đã nạp ảnh thành công</span>
                        <p className="text-[9px] text-neutral-400 truncate font-mono">{avatarUrl.startsWith('data:') ? 'Dữ liệu ảnh tải lên (Base64)' : avatarUrl}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="p-1 text-xs text-neutral-400 hover:text-red-500 transition shrink-0 cursor-pointer font-bold"
                        title="Xóa ảnh hiện tại"
                      >
                        Xóa
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Cách 1: URL */}
                    <div className="space-y-1 font-sans">
                      <span className="text-[10px] text-neutral-400 font-bold block">Cách 1: Nhập đường dẫn ảnh (URL)</span>
                      <input
                        type="url"
                        value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-rose-400 focus:outline-none text-neutral-800 dark:text-neutral-100"
                      />
                    </div>

                    {/* Cách 2: File Upload */}
                    <div className="space-y-1 font-sans">
                      <span className="text-[10px] text-neutral-400 font-bold block">Cách 2: Tải lên từ thiết bị</span>
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingAvatar(true);
                        }}
                        onDragLeave={() => setIsDraggingAvatar(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingAvatar(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleAvatarUpload(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => avatarFileInputRef.current?.click()}
                        className={`py-1.5 px-3 rounded-xl border border-dashed text-center transition cursor-pointer flex items-center justify-center gap-1.5 h-[34px] ${
                          isDraggingAvatar
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20'
                            : 'border-rose-200 dark:border-neutral-700 hover:border-rose-400 bg-white dark:bg-neutral-800/40'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 truncate">
                          {isDraggingAvatar ? 'Thả ảnh ra!' : 'Nhấp / Thả ảnh vào'}
                        </span>
                        <input
                          type="file"
                          ref={avatarFileInputRef}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleAvatarUpload(e.target.files[0]);
                            }
                          }}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition cursor-pointer"
                  >
                    Làm mới
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingCharacter ? 'Cập Nhật Hồ Sơ' : 'Lưu & Đăng Nhân Vật'}</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'list' && (
              /* Character List in Admin */
              <div className="space-y-3">
                {characters.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-xs">
                    Chưa có nhân vật nào trong danh sách.
                  </div>
                ) : (
                  characters.map((char) => (
                    <div
                      key={char.id}
                      className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-700 shrink-0">
                          {char.avatarUrl ? (
                            <img
                              src={char.avatarUrl}
                              alt={char.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">
                              🍓
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                            {char.name}
                          </h4>
                          <p className="text-[11px] text-neutral-400 truncate">
                            {char.genres.join(', ')} · {char.likes || 0} tim
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setName(char.name);
                            setSelectedGenres(char.genres);
                            setBackstory(char.backstory);
                            setOpeningMessage(char.openingMessage);
                            setChatLink(char.chatLink);
                            setAvatarUrl(char.avatarUrl);
                            setLikes(char.likes || 0);
                            setActiveTab('form');
                          }}
                          className="p-2 rounded-xl bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:text-rose-500 transition cursor-pointer"
                          title="Sửa nhân vật"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            onDeleteCharacter(char.id);
                          }}
                          className="p-2 rounded-xl bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-red-500 hover:bg-red-50 transition cursor-pointer active:scale-95"
                          title="Xóa nhân vật"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'inbox' && (
              /* Inbox Tab: Hòm thư đến của Quản trị viên (Xóa tùy thích) */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-rose-500" />
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                      Hòm Thư Riêng Tư ({letters.length} thư)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedInboxIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onDeleteMultipleLetters) {
                            onDeleteMultipleLetters(selectedInboxIds);
                          } else if (onDeleteLetter) {
                            selectedInboxIds.forEach((id) => onDeleteLetter(id));
                          }
                          setSelectedInboxIds([]);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa {selectedInboxIds.length} thư đã chọn</span>
                      </button>
                    )}

                    {letters.length > 0 && onClearAllLetters && (
                      <button
                        type="button"
                        onClick={() => {
                          onClearAllLetters();
                          setSelectedInboxIds([]);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa tất cả thư</span>
                      </button>
                    )}
                  </div>
                </div>

                {letters.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={inboxSearch}
                        onChange={(e) => setInboxSearch(e.target.value)}
                        placeholder="Tìm kiếm thư..."
                        className="w-full text-xs px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const filtered = letters.filter((l) => {
                          if (!inboxSearch.trim()) return true;
                          const q = inboxSearch.toLowerCase();
                          return l.author.toLowerCase().includes(q) || l.content.toLowerCase().includes(q);
                        });
                        if (selectedInboxIds.length === filtered.length && filtered.length > 0) {
                          setSelectedInboxIds([]);
                        } else {
                          setSelectedInboxIds(filtered.map((l) => l.id));
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs transition cursor-pointer shrink-0"
                    >
                      {selectedInboxIds.length > 0 ? 'Bỏ chọn hết' : 'Chọn tất cả'}
                    </button>
                  </div>
                )}

                {letters.length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-400 space-y-1 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                    <p className="text-xl">📬</p>
                    <p className="font-semibold text-neutral-600 dark:text-neutral-300">
                      Hòm thư hiện tại đang trống!
                    </p>
                    <p>Chưa có thư mới nào gửi đến hoặc toàn bộ thư cũ đã được xóa.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {letters
                      .filter((l) => {
                        if (!inboxSearch.trim()) return true;
                        const q = inboxSearch.toLowerCase();
                        return l.author.toLowerCase().includes(q) || l.content.toLowerCase().includes(q);
                      })
                      .map((letter) => {
                        const isSelected = selectedInboxIds.includes(letter.id);
                        return (
                          <div
                            key={letter.id}
                            className={`p-4 rounded-2xl border shadow-sm space-y-2.5 transition ${
                              isSelected
                                ? 'bg-rose-50/90 dark:bg-neutral-800 border-rose-400 ring-1 ring-rose-400'
                                : 'bg-white dark:bg-neutral-800 border-rose-100 dark:border-neutral-700'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    setSelectedInboxIds((prev) =>
                                      prev.includes(letter.id)
                                        ? prev.filter((id) => id !== letter.id)
                                        : [...prev, letter.id]
                                    );
                                  }}
                                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                                      {letter.author}
                                    </span>
                                    {letter.author.includes('bí mật') && (
                                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-600">
                                        Ẩn danh
                                      </span>
                                    )}
                                  </div>
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

                              {onDeleteLetter && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteLetter(letter.id);
                                    setSelectedInboxIds((prev) => prev.filter((id) => id !== letter.id));
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-xs text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-neutral-700 transition cursor-pointer flex items-center gap-1 active:scale-95"
                                  title="Xóa lá thư này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Xóa</span>
                                </button>
                              )}
                            </div>

                            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed bg-neutral-50 dark:bg-neutral-850 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 font-serif">
                              {letter.content}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'announcements' && (
              /* Announcements Management Tab */
              <div className="space-y-6">
                <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-rose-500" />
                      Gửi Thông Báo Mới
                    </h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                      Các thông báo này sẽ hiển thị công khai trên Bảng tin của Wyn.
                    </p>
                  </div>
                </div>

                {/* Announcement Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!announceTitle.trim() || !announceContent.trim()) return;
                    onAddAnnouncement({
                      title: announceTitle.trim(),
                      content: announceContent.trim(),
                      tag: announceTag,
                      isPinned: announceIsPinned
                    });
                    setAnnounceTitle('');
                    setAnnounceContent('');
                    setAnnounceTag('Thông báo');
                    setAnnounceIsPinned(false);
                  }} 
                  className="space-y-4 bg-rose-50/30 dark:bg-neutral-850 p-4 rounded-2xl border border-rose-100 dark:border-neutral-800"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tiêu đề</label>
                      <input 
                        type="text"
                        required
                        value={announceTitle}
                        onChange={(e) => setAnnounceTitle(e.target.value)}
                        placeholder="VD: Ra mắt nhân vật mới..."
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-rose-100 dark:border-neutral-700 rounded-xl focus:border-rose-400 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Thẻ phân loại</label>
                      <select 
                        value={announceTag}
                        onChange={(e) => setAnnounceTag(e.target.value as AnnouncementTag)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-rose-100 dark:border-neutral-700 rounded-xl focus:border-rose-400 focus:outline-none"
                      >
                        <option value="Thông báo">📢 Thông báo</option>
                        <option value="Lịch ra mắt">📅 Lịch ra mắt</option>
                        <option value="Tâm sự">💌 Tâm sự</option>
                        <option value="Sự kiện">🎉 Sự kiện</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Nội dung thông báo</label>
                    <textarea 
                      rows={3}
                      required
                      value={announceContent}
                      onChange={(e) => setAnnounceContent(e.target.value)}
                      placeholder="Viết nội dung chi tiết tại đây..."
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-rose-100 dark:border-neutral-700 rounded-xl focus:border-rose-400 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={announceIsPinned}
                        onChange={(e) => setAnnounceIsPinned(e.target.checked)}
                        className="w-4 h-4 accent-rose-500 rounded border-rose-200"
                      />
                      <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300 group-hover:text-rose-500 transition-colors flex items-center gap-1">
                        📌 Ghim thông báo lên đầu trang
                      </span>
                    </label>

                    <button 
                      type="submit"
                      className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all active:scale-95"
                    >
                      Đăng Thông Báo
                    </button>
                  </div>
                </form>

                {/* Announcement List */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Lịch sử thông báo gần đây</h4>
                  {announcements.length === 0 ? (
                    <div className="text-center py-10 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 text-xs">
                      Chưa có thông báo nào được đăng.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {announcements.map((a) => (
                        <div key={a.id} className="p-3 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl flex items-start justify-between gap-3 group">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              {a.isPinned && <span className="text-[10px]">📌</span>}
                              <span className="text-xs font-bold text-neutral-800 dark:text-white truncate">{a.title}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 font-bold">{a.tag}</span>
                            </div>
                            <p className="text-[10px] text-neutral-500 line-clamp-1">{a.content}</p>
                            <span className="text-[9px] text-neutral-300 mt-1 block">
                              {new Date(a.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <button 
                            onClick={() => {
                              if (confirm('Xóa thông báo này?')) {
                                onDeleteAnnouncement(a.id);
                              }
                            }}
                            className="p-1.5 text-neutral-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Xóa thông báo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              /* Settings Tab: Cài đặt ảnh đại diện Tiệm */
              <div className="space-y-6">
                <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                    Cấu Hình Thương Hiệu Tiệm
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Quản lý hình ảnh đại diện thương hiệu hiển thị bên cạnh tiêu đề "Tiệm Nhỏ Nhà Wyn" ở thanh đầu trang.
                  </p>
                </div>

                <div className="bg-rose-50/40 dark:bg-neutral-850/40 border border-rose-100 dark:border-neutral-800 rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
                  {/* Current Logo Preview */}
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-full bg-white dark:bg-neutral-800 border-4 border-rose-100 dark:border-neutral-700 overflow-hidden shadow-lg flex items-center justify-center transition-transform group-hover:scale-105">
                      {customLogo ? (
                        <img
                          src={customLogo}
                          alt="Custom Store Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl select-none">🍓</span>
                      )}
                    </div>
                    {customLogo && (
                      <button
                        type="button"
                        onClick={() => onLogoChange(null)}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition active:scale-90"
                        title="Xóa ảnh đại diện tự chọn, khôi phục quả dâu mặc định"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 max-w-md">
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200">
                      {customLogo ? 'Ảnh Đại Diện Tự Chọn Hiện Tại' : 'Đang Sử Dụng Quả Dâu Mặc Định'}
                    </h4>
                    <p className="text-[11px] text-neutral-400 leading-normal">
                      Kéo thả trực tiếp hình ảnh (JPG, PNG, WEBP,...) vào vùng bên dưới hoặc nhấp nút để thay đổi logo thương hiệu.
                    </p>
                  </div>

                  {/* Drag and Drop Area */}
                  <div
                    onDragOver={handleDragOverLogo}
                    onDragLeave={handleDragLeaveLogo}
                    onDrop={handleDropLogo}
                    onClick={() => logoInputRef.current?.click()}
                    className={`w-full max-w-md py-8 px-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                      isDraggingLogo
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 scale-[1.01]'
                        : 'border-rose-200 dark:border-neutral-700 hover:border-rose-400 bg-white dark:bg-neutral-800/60'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-rose-400" />
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      {isDraggingLogo ? 'Thả ảnh ra để cập nhật!' : 'Nhấp hoặc Kéo thả ảnh mới vào đây'}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Hỗ trợ định dạng ảnh phổ biến (JPEG, PNG, WEBP, GIF,...)
                    </span>

                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleLogoUpload(e.target.files[0]);
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {customLogo && (
                    <button
                      type="button"
                      onClick={() => onLogoChange(null)}
                      className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100/50 dark:hover:bg-rose-950/20 text-xs font-semibold transition active:scale-95 cursor-pointer"
                    >
                      Khôi Phục Logo Quả Dâu Mặc Định 🍓
                    </button>
                  )}
                </div>

                <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                      Hình Nền Website (Background)
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Dán đường dẫn ảnh để thay đổi hình nền cho toàn bộ trang web.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={siteConfig.backgroundUrl || ''}
                      onChange={(e) => onConfigChange({ backgroundUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-rose-400 focus:outline-none text-neutral-800 dark:text-neutral-100"
                    />
                    {siteConfig.backgroundUrl && (
                      <button
                        type="button"
                        onClick={() => onConfigChange({ backgroundUrl: '' })}
                        className="px-3 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-bold hover:bg-red-100 transition cursor-pointer"
                      >
                        Xóa nền
                      </button>
                    )}
                  </div>

                  {siteConfig.backgroundUrl && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-rose-100 dark:border-neutral-800 shadow-sm">
                      <img 
                        src={siteConfig.backgroundUrl} 
                        alt="Background Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Invalid+Image+URL';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] text-white font-bold border border-white/20">
                          Xem trước hình nền hiện tại
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
