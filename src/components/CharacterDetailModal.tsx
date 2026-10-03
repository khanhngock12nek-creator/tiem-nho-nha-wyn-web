import React from 'react';
import { X, Heart, BookOpen, ExternalLink, Sparkles, Tag, Edit3, Eye, Cloud, Smile, MessageSquare } from 'lucide-react';
import { Character, AppUser } from '../types';
import { GENRE_THEMES } from '../constants/genres';

interface CharacterDetailModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (charId: string) => void;
  isAdmin?: boolean;
  onEditCharacter?: (char: Character) => void;
  currentUser: AppUser | null;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  isAdmin,
  onEditCharacter,
  currentUser,
}) => {
  if (!isOpen || !character) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-sky-950/40 backdrop-blur-md animate-fade-in">
      {/* Main Container - Streaming Layout Style */}
      <div className="relative w-full max-w-4xl bg-sky-50 dark:bg-neutral-950 rounded-3xl border-4 border-white dark:border-neutral-800 shadow-[0_0_40px_rgba(125,211,252,0.3)] overflow-hidden flex flex-col max-h-[95vh] font-sans">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.03] bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Top Header Section - Streaming Title Style */}
        <div className="relative z-10 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-sky-400 to-rose-400 border-b-4 border-white dark:border-neutral-800 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_2px_0_rgba(0,0,0,0.1)]">
                CHARACTER PROFILE: {character.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] font-bold text-white/90 tracking-widest uppercase">STREAMS ONLINE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-rose-500 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/30 shadow-sm"
            >
              <X className="w-5 h-5 stroke-[3px]" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Main Visual Box - Scrollable to see full art */}
            <div className="relative h-[350px] sm:h-[500px] bg-white dark:bg-neutral-900 rounded-2xl border-4 border-sky-200 dark:border-neutral-800 shadow-xl overflow-y-auto custom-scrollbar group">
                {/* Decorative Corners - Fixed to container so they don't scroll away */}
                <div className="sticky top-2 left-2 z-20 flex gap-1 h-0 overflow-visible px-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <div className="w-2 h-2 rounded-full bg-sky-400" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                
                <div className="sticky top-2 right-4 z-20 h-0 overflow-visible flex justify-end pr-4">
                   <div className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-black text-white italic tracking-widest h-fit">
                     LIVE PREVIEW
                   </div>
                </div>

                {/* The Character Image */}
                {character.avatarUrl ? (
                  <img
                    src={character.avatarUrl}
                    alt={character.name}
                    className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-sky-50 dark:bg-neutral-800 text-sky-200">
                    <Sparkles className="w-20 h-20 animate-pulse" />
                  </div>
                )}

                {/* Bottom Overlay Info - Sticky to bottom */}
                <div className="sticky bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex items-end justify-between z-10">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase drop-shadow-md">
                      {character.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {character.genres.map(genre => (
                        <span key={genre} className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500 text-white border border-sky-400 shadow-sm">
                          #{genre.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleFavorite(character.id)}
                      className={`group flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border-2 transition-all active:scale-95 ${
                        isFavorite 
                        ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_#f43f5e80]' 
                        : 'bg-black/40 border-white/20 text-white hover:bg-rose-500/40 hover:border-rose-400'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white animate-heartbeat' : ''}`} />
                      <span className="text-sm font-black italic">{character.likes || 0}</span>
                    </button>
                  </div>
                </div>

                {/* Floating Decoration Icons */}
                <Smile className="absolute top-8 left-4 w-6 h-6 text-sky-400/50 rotate-[-15deg] group-hover:scale-110 transition-transform" />
                <Cloud className="absolute bottom-16 right-6 w-8 h-8 text-rose-300/50 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Backstory & Info Boxes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* About Me Box */}
                <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border-4 border-rose-200 dark:border-neutral-800 p-4 shadow-lg overflow-hidden">
                  <div className="absolute -top-1 -right-1">
                    <Cloud className="w-12 h-12 text-rose-100 dark:text-neutral-800 opacity-50" />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-4 bg-rose-400 rounded-full" />
                    <h4 className="text-xs font-black text-rose-500 dark:text-rose-400 uppercase italic tracking-widest flex items-center gap-1.5">
                       <BookOpen className="w-3.5 h-3.5" />
                       ABOUT ME
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar italic font-medium">
                    {character.backstory || 'No biography data available for this session...'}
                  </p>
                </div>

                {/* Status/Stats Box */}
                <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border-4 border-sky-200 dark:border-neutral-800 p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-4 bg-sky-400 rounded-full" />
                    <h4 className="text-xs font-black text-sky-500 dark:text-sky-400 uppercase italic tracking-widest flex items-center gap-1.5">
                       <MessageSquare className="w-3.5 h-3.5" />
                       MESSAGE LOG
                    </h4>
                  </div>
                  <div className="relative p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border-2 border-sky-100 dark:border-sky-900/40 italic">
                    <span className="absolute -top-2 left-4 px-2 bg-white dark:bg-neutral-900 text-[10px] font-black text-sky-400 border-2 border-sky-100 dark:border-sky-900/40 rounded-full">OPENING</span>
                    <p className="text-xs text-neutral-600 dark:text-neutral-200 leading-relaxed font-serif pt-1">
                      "{character.openingMessage || 'Incoming signal lost...'}"
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                       <Eye className="w-4 h-4 text-sky-400" />
                       <span className="text-[10px] font-black text-neutral-400">TOTAL VIEWS</span>
                    </div>
                    <span className="text-xs font-black text-sky-600 dark:text-sky-400">{character.views || 0}</span>
                  </div>
                </div>
              </div>
          </div>
        </div>

        {/* Bottom Navigation Buttons Bar */}
        <div className="relative z-10 p-4 sm:p-6 bg-white dark:bg-neutral-900 border-t-4 border-sky-100 dark:border-neutral-800 flex flex-wrap items-center justify-center sm:justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-neutral-400 uppercase italic tracking-widest">LAST UPDATED</span>
               <span className="text-xs font-black text-sky-600 italic">{new Date(character.createdAt).toLocaleDateString('vi-VN')}</span>
             </div>
             
             {isAdmin && onEditCharacter && (
                <button
                  onClick={() => {
                    onClose();
                    onEditCharacter(character);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 border-2 border-rose-100 dark:border-rose-900/40 text-xs font-black italic hover:bg-rose-100 transition-all active:scale-95 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  EDIT CORE
                </button>
              )}
          </div>

          <div className="flex items-center gap-3">
             <button
               onClick={onClose}
               className="px-6 py-2.5 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 text-xs font-black text-neutral-400 italic uppercase hover:bg-neutral-50 transition-all cursor-pointer"
             >
               DISCONNECT
             </button>

             {character.chatLink ? (
                <a
                  href={character.chatLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 to-rose-400 text-white font-black text-xs italic tracking-widest uppercase flex items-center gap-2 shadow-xl shadow-rose-400/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group"
                >
                  <span>CONNECT CHAT</span>
                  <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
             ) : (
                <button
                  disabled
                  className="px-8 py-2.5 rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-400 text-xs font-black italic tracking-widest uppercase cursor-not-allowed border-2 border-neutral-300 dark:border-neutral-700"
                >
                  NO LINK AVAILABLE
                </button>
             )}
          </div>
        </div>

        {/* Decorative Floating Elements (Absolute corner decorations like the image) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-300/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-300/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
      </div>
    </div>
  );
};
