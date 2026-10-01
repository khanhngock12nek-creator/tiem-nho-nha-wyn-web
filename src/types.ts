export interface Character {
  id: string;
  name: string;
  genres: string[];
  backstory: string;
  openingMessage: string;
  chatLink: string;
  avatarUrl: string;
  likes: number;
  views?: number;
  createdAt: number;
}

export interface Letter {
  id: string;
  author: string;
  content: string;
  stampType: 'strawberry' | 'moon' | 'heart' | 'ribbon' | 'wax_seal';
  createdAt: number;
  likesCount?: number;
}

export interface SiteNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  characterId?: string;
  read?: boolean;
}

export type ActiveTab =
  | 'characters'
  | 'gacha'
  | 'bxh'
  | 'letters'
  | 'genres'
  | 'roleplay-diary'
  | 'wyn-board'
  | 'polaroid'
  | 'character-puzzle'
  | 'sticky-wall'
  | 'tea-brewer'
  | 'profile';

export type RoleplayStatus = 'chatting' | 'want_to_try' | 'favorite' | 'completed';

export interface RoleplayEntry {
  characterId: string;
  status: RoleplayStatus;
  userNotes: string;
  favoriteQuote?: string;
  rating: number; // 1 to 5
  updatedAt: number;
}

export type AnnouncementTag = 'Thông báo' | 'Lịch ra mắt' | 'Tâm sự' | 'Sự kiện';

export interface WynAnnouncement {
  id: string;
  title: string;
  content: string;
  tag: AnnouncementTag;
  isPinned?: boolean;
  createdAt: number;
  likes: number;
}

export interface PuzzleImage {
  id: string;
  characterId: string;
  characterName: string;
  imageUrl: string;
  createdAt: number;
}

export interface StickyNote {
  id: string;
  sender: string;
  content: string;
  color: string; // 'yellow' | 'pink' | 'blue' | 'green' | 'purple'
  x: number;
  y: number;
  createdAt: number;
}

export interface AppUser {
  uid: string;
  displayName: string;
  photoURL: string;
  email?: string;
  provider: 'google' | 'facebook' | 'guest';
  createdAt: number;
}

export interface CharacterComment {
  id: string;
  characterId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  createdAt: number;
}

export interface SiteConfig {
  id: 'main';
  backgroundUrl?: string;
  customLogo?: string;
  updatedAt: number;
}

export interface CustomGenre {
  id: string;
  name: string;
  createdAt: number;
}
