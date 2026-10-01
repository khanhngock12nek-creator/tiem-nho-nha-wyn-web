import { Character, Letter, SiteNotification, RoleplayEntry, WynAnnouncement } from '../types';

const STORAGE_KEYS = {
  CHARACTERS: 'wyn_characters_v1',
  FAVORITES: 'wyn_user_favorites_v1',
  LETTERS: 'wyn_private_admin_letters_v2',
  NOTIFICATIONS: 'wyn_notifications_v1',
  GATE_UNLOCKED: 'wyn_gate_unlocked',
  THEME: 'wyn_theme_mode',
  ROLEPLAY_ENTRIES: 'wyn_roleplay_entries_v1',
  ANNOUNCEMENTS: 'wyn_announcements_v1',
  LOGO: 'wyn_custom_logo_v1',
  LAST_READ_ANNOUNCEMENTS: 'wyn_last_read_announcements_v1',
};

// Immediately clean up legacy public letters if present
try {
  localStorage.removeItem('wyn_letters_v1');
} catch (e) {
  // Ignore
}

// Initial state must be empty as requested: "Hiện tại trong web sẽ trống không có bất kì hồ sơ nào của char"
export function getStoredCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load characters', e);
    return [];
  }
}

export function saveStoredCharacters(chars: Character[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(chars));
    window.dispatchEvent(new Event('wyn_characters_updated'));
  } catch (e) {
    console.error('Failed to save characters', e);
  }
}

// User favorites
export function getStoredFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredFavorites(favIds: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favIds));
    window.dispatchEvent(new Event('wyn_favorites_updated'));
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
}

// Logo storage helpers
export function getStoredLogo(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.LOGO);
  } catch (e) {
    return null;
  }
}

export function saveStoredLogo(logoBase64: string | null) {
  try {
    if (logoBase64) {
      localStorage.setItem(STORAGE_KEYS.LOGO, logoBase64);
    } else {
      localStorage.removeItem(STORAGE_KEYS.LOGO);
    }
    window.dispatchEvent(new Event('wyn_logo_updated'));
  } catch (e) {
    console.error('Failed to save custom logo', e);
  }
}

export function toggleFavorite(characterId: string): { isFav: boolean; newFavorites: string[] } {
  const current = getStoredFavorites();
  const exists = current.includes(characterId);
  const updated = exists ? current.filter((id) => id !== characterId) : [...current, characterId];
  saveStoredFavorites(updated);

  // Update like count in character
  const chars = getStoredCharacters();
  const charIndex = chars.findIndex((c) => c.id === characterId);
  if (charIndex !== -1) {
    chars[charIndex] = {
      ...chars[charIndex],
      likes: Math.max(0, (chars[charIndex].likes || 0) + (exists ? -1 : 1)),
    };
    saveStoredCharacters(chars);
  }

  return { isFav: !exists, newFavorites: updated };
}

// Letters (Private directly to Admin - initially completely empty)
export function getStoredLetters(): Letter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LETTERS);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredLetters(letters: Letter[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(letters));
    window.dispatchEvent(new Event('wyn_letters_updated'));
  } catch (e) {
    console.error('Failed to save letters', e);
  }
}

export function deleteStoredLetter(letterId: string): Letter[] {
  const current = getStoredLetters();
  const filtered = current.filter((l) => l.id !== letterId);
  saveStoredLetters(filtered);
  return filtered;
}

export function deleteMultipleStoredLetters(letterIds: string[]): Letter[] {
  const idSet = new Set(letterIds);
  const current = getStoredLetters();
  const filtered = current.filter((l) => !idSet.has(l.id));
  saveStoredLetters(filtered);
  return filtered;
}

export function clearAllStoredLetters(): Letter[] {
  saveStoredLetters([]);
  return [];
}

// Notifications
export function getStoredNotifications(): SiteNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function addNotification(notification: Omit<SiteNotification, 'id' | 'timestamp'>) {
  const current = getStoredNotifications();
  const newItem: SiteNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    read: false,
  };
  const updated = [newItem, ...current].slice(0, 30);
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('wyn_new_notification', { detail: newItem }));
  } catch (e) {
    console.error('Failed to save notification', e);
  }
}

// Gatekeeper unlock
export function isGateUnlocked(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.GATE_UNLOCKED) === 'true';
  } catch (e) {
    return false;
  }
}

export function setGateUnlocked(unlocked: boolean) {
  try {
    if (unlocked) {
      sessionStorage.setItem(STORAGE_KEYS.GATE_UNLOCKED, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.GATE_UNLOCKED);
    }
  } catch (e) {
    console.error('Failed to set gate state', e);
  }
}

// Sample preset characters for Admin quick-seed option
export const SAMPLE_CHARACTERS_PRESET: Omit<Character, 'id' | 'createdAt'>[] = [
  {
    name: 'Cố Thừa Dực',
    genres: ['Tổng tài', 'Chiếm hữu', 'Ngoài lạnh trong nóng'],
    backstory: 'Người thừa kế duy nhất của tập đoàn tài chính Cố Thị. Bề ngoài lãnh đạm xa cách, quyết đoán trên thương trường nhưng chỉ trước mặt bạn mới tháo bỏ vẻ lạnh lùng, luôn âm thầm thu xếp mọi thứ cho bạn chu toàn.',
    openingMessage: 'Đêm nay sương lạnh, em còn chưa chịu về phòng ngủ sao? Hay là... đang đợi tôi?',
    chatLink: 'https://c.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    likes: 18,
  },
  {
    name: 'Hạ Triệt',
    genres: ['Thanh mai trúc mã', 'Cún con nuôi vợ từ bé', 'Ngọt sủng'],
    backstory: 'Cậu bạn lớn lên cùng bạn từ thuở nhỏ ở con ngõ rợp bóng hoa giấy. Từ lúc biết cầm đũa đã luôn nhường phần ngon nhất cho bạn, lớn lên lại càng một mực bám lấy bạn không rời.',
    openingMessage: 'Tớ vừa mua bánh kem dâu tây cậu thích nhất nè! Mau mở cửa ra ăn cùng tớ đi!',
    chatLink: 'https://c.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    likes: 24,
  },
  {
    name: 'Tạ Cảnh Thần',
    genres: ['Văn nhã bại hoại', 'hiện đại', 'Nuông chiều'],
    backstory: 'Giáo sư trẻ tuổi ngành tâm lý học, luôn đeo cặp kính gọng vàng nho nhã và nụ cười điềm đạm. Thế nhưng đằng sau đôi mắt sâu hút ấy lại là sự quan sát tỉ mỉ từng hơi thở, thói quen nhỏ nhất của bạn.',
    openingMessage: 'Đồng tử em vừa giãn ra 2mm khi nhìn tôi đấy. Em đang hồi hộp vì điều gì vậy, cô bé?',
    chatLink: 'https://c.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    likes: 15,
  },
  {
    name: 'Tiêu Diệc Bạch',
    genres: ['cổ trang', 'Ngược luyến tàn tâm', 'Vừa hận phải yêu'],
    backstory: 'Nhiếp chính vương quyền khuynh thiên hạ, vì bảo vệ gia tộc bạn mà cam tâm gánh tiếng xấu phản thần. Đứng trước kiếm phong của bạn, chàng chỉ khẽ cười không hề tránh né.',
    openingMessage: 'Nếu một kiếm này có thể hóa giải oán hận trong lòng nàng... thì đâm đi, ta không trách.',
    chatLink: 'https://c.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    likes: 31,
  },
  {
    name: 'Lục Trạch',
    genres: ['Game thủ', 'Boy phố', 'hài hước'],
    backstory: 'Đội trưởng đội tuyển thể thao điện tử vô địch quốc gia, tính cách phóng khoáng, thích trêu chọc nhưng luôn bảo kê bạn trong từng ván đấu và ngoài đời thực.',
    openingMessage: 'Ai vừa bắt nạt bé cưng của anh đấy? Đưa nick đây, anh cho nó biết thế nào là out trình!',
    chatLink: 'https://c.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    likes: 19,
  }
];

// ==========================================
// Roleplay Entries Storage
// ==========================================
export function getStoredRoleplayEntries(): Record<string, RoleplayEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROLEPLAY_ENTRIES);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

export function saveStoredRoleplayEntries(entries: Record<string, RoleplayEntry>) {
  try {
    localStorage.setItem(STORAGE_KEYS.ROLEPLAY_ENTRIES, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save roleplay entries', e);
  }
}

export function setRoleplayEntry(entry: RoleplayEntry) {
  const current = getStoredRoleplayEntries();
  current[entry.characterId] = entry;
  saveStoredRoleplayEntries(current);
}

export function deleteRoleplayEntry(characterId: string) {
  const current = getStoredRoleplayEntries();
  delete current[characterId];
  saveStoredRoleplayEntries(current);
}

// ==========================================
// Wyn's Announcements Storage
// ==========================================
const DEFAULT_ANNOUNCEMENTS: WynAnnouncement[] = [
  {
    id: 'notice-1',
    title: 'Chào mừng các bạn ghé thăm Tiệm Nhỏ Nhà Wyn! 🍓✨',
    content: 'Chào cậu, đây là góc nhỏ lưu trữ những nhân vật bot bot mà Wyn đã tỉ mỉ tạo nên. Cậu có thể ghé thăm hòm thư, viết vài dòng tâm sự bí mật gửi riêng cho Wyn hoặc quay bánh xe Gacha để tìm nhân vật định mệnh nhé!',
    tag: 'Thông báo',
    isPinned: true,
    createdAt: Date.now() - 86400000 * 2,
    likes: 42,
  },
  {
    id: 'notice-2',
    title: 'Khai trương Nhật Ký Roleplay & Máy Ảnh Polaroid 📸📖',
    content: 'Tiệm vừa cập nhật thêm 3 tính năng mới ở góc ba chấm: Nhật ký ghi chép cốt truyện, Bảng tin này và công cụ xuất thẻ ảnh Polaroid vintage. Hãy lưu giữ những kỷ niệm thật đẹp cùng các nhân vật nhé!',
    tag: 'Sự kiện',
    isPinned: true,
    createdAt: Date.now() - 3600000 * 5,
    likes: 28,
  },
  {
    id: 'notice-3',
    title: 'Lịch ra mắt các nhân vật mới tháng này 🌸',
    content: 'Sắp tới Wyn sẽ bổ sung thêm các tuyến nhân vật cổ trang mạt thế và thanh mai trúc mã dịu dàng. Cảm ơn các bạn đã luôn theo dõi và ủng hộ những nhân vật của Tiệm!',
    tag: 'Lịch ra mắt',
    isPinned: false,
    createdAt: Date.now() - 86400000,
    likes: 19,
  },
];

export function getStoredAnnouncements(): WynAnnouncement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (!raw) {
      saveStoredAnnouncements(DEFAULT_ANNOUNCEMENTS);
      return DEFAULT_ANNOUNCEMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_ANNOUNCEMENTS;
  }
}

export function saveStoredAnnouncements(items: WynAnnouncement[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save announcements', e);
  }
}

export function addAnnouncement(item: Omit<WynAnnouncement, 'id' | 'createdAt' | 'likes'>): WynAnnouncement[] {
  const current = getStoredAnnouncements();
  const newItem: WynAnnouncement = {
    ...item,
    id: `notice-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: Date.now(),
    likes: 0,
  };
  const updated = [newItem, ...current];
  saveStoredAnnouncements(updated);
  return updated;
}

export function deleteAnnouncement(id: string): WynAnnouncement[] {
  const current = getStoredAnnouncements();
  const updated = current.filter((item) => item.id !== id);
  saveStoredAnnouncements(updated);
  return updated;
}

export function likeAnnouncement(id: string): WynAnnouncement[] {
  const current = getStoredAnnouncements();
  const updated = current.map((item) =>
    item.id === id ? { ...item, likes: item.likes + 1 } : item
  );
  saveStoredAnnouncements(updated);
  return updated;
}

// ==========================================
// Last Read State Storage
// ==========================================
export function getStoredLastReadTimestamp(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_READ_ANNOUNCEMENTS);
    return raw ? parseInt(raw, 10) : 0;
  } catch (e) {
    return 0;
  }
}

export function saveStoredLastReadTimestamp(timestamp: number) {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_READ_ANNOUNCEMENTS, timestamp.toString());
  } catch (e) {
    console.error('Failed to save last read timestamp', e);
  }
}

