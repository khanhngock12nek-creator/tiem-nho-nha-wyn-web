import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  increment,
  where 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Character, PuzzleImage, StickyNote, CharacterComment, SiteConfig, CustomGenre, WynAnnouncement } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Test connection to Firestore at boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Error handling as requested by the firebase-integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Subscribe to real-time character changes
export function subscribeCharacters(onUpdate: (chars: Character[]) => void, onError?: (err: Error) => void): () => void {
  const collectionPath = 'characters';
  const q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const chars: Character[] = [];
    snapshot.forEach((doc) => {
      chars.push(doc.data() as Character);
    });
    onUpdate(chars);
  }, (error) => {
    if (onError) {
      onError(error);
    }
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  });
}

// Save (create or update) character to Firestore
export async function saveCharacterToFirestore(char: Character): Promise<void> {
  const docPath = `characters/${char.id}`;
  try {
    await setDoc(doc(db, 'characters', char.id), char);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Delete character from Firestore
export async function deleteCharacterFromFirestore(charId: string): Promise<void> {
  const docPath = `characters/${charId}`;
  try {
    await deleteDoc(doc(db, 'characters', charId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Like character in Firestore (increments likes field)
export async function likeCharacterInFirestore(charId: string, incrementValue: number): Promise<void> {
  const docPath = `characters/${charId}`;
  try {
    await updateDoc(doc(db, 'characters', charId), {
      likes: increment(incrementValue)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

// Increment character views in Firestore
export async function incrementCharacterViews(charId: string): Promise<void> {
  const docPath = `characters/${charId}`;
  try {
    await updateDoc(doc(db, 'characters', charId), {
      views: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

// Subscribe to real-time puzzle image updates
export function subscribePuzzleImages(onUpdate: (images: PuzzleImage[]) => void, onError?: (err: Error) => void): () => void {
  const collectionPath = 'puzzle_images';
  const q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const images: PuzzleImage[] = [];
    snapshot.forEach((doc) => {
      images.push(doc.data() as PuzzleImage);
    });
    onUpdate(images);
  }, (error) => {
    if (onError) {
      onError(error);
    }
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  });
}

// Save a custom puzzle image to Firestore
export async function savePuzzleImageToFirestore(img: PuzzleImage): Promise<void> {
  const docPath = `puzzle_images/${img.id}`;
  try {
    await setDoc(doc(db, 'puzzle_images', img.id), img);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Delete custom puzzle image from Firestore
export async function deletePuzzleImageFromFirestore(imageId: string): Promise<void> {
  const docPath = `puzzle_images/${imageId}`;
  try {
    await deleteDoc(doc(db, 'puzzle_images', imageId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Subscribe to real-time sticky notes from Firestore
export function subscribeStickyNotes(onUpdate: (notes: StickyNote[]) => void, onError?: (err: Error) => void): () => void {
  const collectionPath = 'sticky_notes';
  const q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const notes: StickyNote[] = [];
    snapshot.forEach((doc) => {
      notes.push(doc.data() as StickyNote);
    });
    onUpdate(notes);
  }, (error) => {
    if (onError) {
      onError(error);
    }
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  });
}

// Save a sticky note to Firestore
export async function saveStickyNoteToFirestore(note: StickyNote): Promise<void> {
  const docPath = `sticky_notes/${note.id}`;
  try {
    await setDoc(doc(db, 'sticky_notes', note.id), note);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Delete sticky note from Firestore
export async function deleteStickyNoteFromFirestore(noteId: string): Promise<void> {
  const docPath = `sticky_notes/${noteId}`;
  try {
    await deleteDoc(doc(db, 'sticky_notes', noteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Subscribe to real-time comments for a specific character
export function subscribeCharacterComments(characterId: string, onUpdate: (comments: CharacterComment[]) => void, onError?: (err: Error) => void): () => void {
  const collectionPath = 'character_comments';
  const q = query(
    collection(db, collectionPath), 
    where('characterId', '==', characterId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const comments: CharacterComment[] = [];
    snapshot.forEach((doc) => {
      comments.push(doc.data() as CharacterComment);
    });
    onUpdate(comments);
  }, (error) => {
    if (onError) {
      onError(error);
    }
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  });
}

// Save a comment to Firestore
export async function saveCommentToFirestore(comment: CharacterComment): Promise<void> {
  const docPath = `character_comments/${comment.id}`;
  try {
    await setDoc(doc(db, 'character_comments', comment.id), comment);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Delete a comment from Firestore
export async function deleteCommentFromFirestore(commentId: string): Promise<void> {
  const docPath = `character_comments/${commentId}`;
  try {
    await deleteDoc(doc(db, 'character_comments', commentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Subscribe to site configuration changes
export function subscribeSiteConfig(onUpdate: (config: SiteConfig) => void, onError?: (err: Error) => void): () => void {
  const docPath = 'site_config/main';
  return onSnapshot(doc(db, 'site_config', 'main'), (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.data() as SiteConfig);
    }
  }, (error) => {
    if (onError) {
      onError(error);
    }
    handleFirestoreError(error, OperationType.GET, docPath);
  });
}

// Save site configuration to Firestore
export async function saveSiteConfigToFirestore(config: SiteConfig): Promise<void> {
  const docPath = 'site_config/main';
  try {
    await setDoc(doc(db, 'site_config', 'main'), config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Subscribe to real-time custom genres
export function subscribeCustomGenres(onUpdate: (genres: CustomGenre[]) => void, onError?: (err: Error) => void): () => void {
  const collectionPath = 'genres';
  const q = query(collection(db, collectionPath), orderBy('createdAt', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const genres: CustomGenre[] = [];
    snapshot.forEach((doc) => {
      genres.push(doc.data() as CustomGenre);
    });
    onUpdate(genres);
  }, (error) => {
    if (onError) {
      onError(error);
    }
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  });
}

// Save a custom genre to Firestore
export async function saveCustomGenreToFirestore(genre: CustomGenre): Promise<void> {
  const docPath = `genres/${genre.id}`;
  try {
    await setDoc(doc(db, 'genres', genre.id), genre);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Delete a custom genre from Firestore
export async function deleteCustomGenreFromFirestore(genreId: string): Promise<void> {
  const docPath = `genres/${genreId}`;
  try {
    await deleteDoc(doc(db, 'genres', genreId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Subscribe to real-time announcements
export function subscribeAnnouncements(onUpdate: (announcements: WynAnnouncement[]) => void, onError?: (err: Error) => void): () => void {
  const collectionPath = 'announcements';
  const q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const announcements: WynAnnouncement[] = [];
    snapshot.forEach((doc) => {
      announcements.push(doc.data() as WynAnnouncement);
    });
    onUpdate(announcements);
  }, (error) => {
    if (onError) {
      onError(error);
    }
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  });
}

// Save (create or update) announcement to Firestore
export async function saveAnnouncementToFirestore(announcement: WynAnnouncement): Promise<void> {
  const docPath = `announcements/${announcement.id}`;
  try {
    await setDoc(doc(db, 'announcements', announcement.id), announcement);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Delete announcement from Firestore
export async function deleteAnnouncementFromFirestore(id: string): Promise<void> {
  const docPath = `announcements/${id}`;
  try {
    await deleteDoc(doc(db, 'announcements', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Like announcement in Firestore
export async function likeAnnouncementInFirestore(id: string): Promise<void> {
  const docPath = `announcements/${id}`;
  try {
    await updateDoc(doc(db, 'announcements', id), {
      likes: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}
