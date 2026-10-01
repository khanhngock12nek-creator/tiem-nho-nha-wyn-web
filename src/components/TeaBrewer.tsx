import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Wind, 
  Sparkles, 
  BookOpen, 
  RefreshCw, 
  Award, 
  Coffee, 
  History, 
  Smile, 
  ChevronRight, 
  ArrowLeft 
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { AppUser } from '../types';

interface TeaBrewerProps {
  currentUser: AppUser | null;
  onBackToHome: () => void;
  onSelectCharacterById?: (charId: string) => void;
  characters: any[];
}

interface BrewedTea {
  id?: string;
  teaName: string;
  teaEmoji: string;
  harmonyScore: number;
  ingredients: string[];
  message: string;
  matchingCharName: string;
  matchingCharId: string;
  brewedAt: number;
}

// 5 Magical Strawberry Blends
const TEA_RECIPES = [
  {
    name: "Trà Dâu Trăng Khuyết 🌙",
    emoji: "🍵✨",
    ingredients: ["3 lát dâu chín mọng", "2 đóa hoa cúc vàng xoa dịu", "1 giọt mật ong rừng", "100% sự vỗ về"],
    message: "Bạn đã vất vả nhiều rồi. Trách nhiệm, âu lo hãy tạm để ngoài hiên nhé. Tách trà này mang vị ngọt thanh từ dâu tây kết hợp hoa cúc dịu mát, giúp làm dịu đi những xốn xang trong lồng ngực. Tối nay, hãy ngủ một giấc thật ngon và yêu thương bản thân nhiều hơn nha.",
  },
  {
    name: "Trà Dâu Thảo Mộc Bình Yên 🌿",
    emoji: "🍓🫖",
    ingredients: ["4 quả dâu dại núi cao", "1 nhành bạc hà mát rượi", "vài cánh hoa oải hương", "tình cảm ấm áp từ Wyn"],
    message: "Nhịp thở của bạn lúc nãy rất đằm thắm. Tách trà thảo mộc mát rượi này là món quà dành tặng cho sự điềm tĩnh và thấu đáo của bạn. Hãy nhấp một ngụm, cảm nhận hơi mát bạc hà len lỏi qua lồng ngực, mang đi mọi muộn phiền tích tụ bấy lâu nay nhé.",
  },
  {
    name: "Hồng Trà Dâu Tây Mặt Trời ☀️",
    emoji: "🍷☀️",
    ingredients: ["Hồng trà cổ thụ nguyên lá", "Dâu tây nghiền nhuyễn ấm", "Một lát cam vàng rực rỡ", "99% năng lượng tích cực"],
    message: "Một ngày mới tràn đầy ánh nắng đang đợi bạn! Tách trà dâu đỏ rực này mang hương thơm nồng nàn và hậu vị ngọt hậu sâu sắc, giúp kích hoạt niềm vui, sự tự tin và lòng nhiệt huyết trong bạn. Đừng ngần ngại bước tiếp, Wyn luôn tin tưởng và cổ vũ bạn!",
  },
  {
    name: "Trà Dâu Sương Mai Tinh Khiết ❄️",
    emoji: "🍶🍓",
    ingredients: ["Dâu tây tuyết đông đá", "Nước sương mai hứng trên lá sen", "Vài hạt kỷ tử bồi bổ", "Sự mát lành tinh khôi"],
    message: "Đôi khi đầu óc ta cần một khoảng lặng tinh khiết để sắp xếp lại mọi thứ. Tách trà sương mai trong trẻo này sẽ giúp tinh thần bạn bừng sáng, xua tan những sương mù suy nghĩ dồn dập. Hãy để tâm trí tự do như mây ngàn, bạn sẽ tìm thấy câu trả lời.",
  },
  {
    name: "Trà Dâu Sữa Hoa Anh Đào 🌸",
    emoji: "🥛🌸",
    ingredients: ["Dâu tây tươi ngọt lịm", "Sữa tươi organic ấm áp", "Cánh hoa đào ướp muối mềm", "Cái ôm xoa dịu ấm sực"],
    message: "Ngọt ngào và êm dịu vô ngần, tách trà sữa dâu anh đào này như một lời nhắc nhở rằng bạn xứng đáng được nâng niu và chở che. Không sao cả nếu hôm nay bạn cảm thấy mệt mỏi; hãy nép vào góc nhỏ này, thưởng trà ấm và để sự dịu dàng xoa dịu trái tim bạn.",
  }
];

export const TeaBrewer: React.FC<TeaBrewerProps> = ({
  currentUser,
  onBackToHome,
  onSelectCharacterById,
  characters
}) => {
  // Phase state: 'intro' | 'breathing' | 'result' | 'history'
  const [phase, setPhase] = useState<'intro' | 'breathing' | 'result' | 'history'>('intro');
  
  // Breathing animation state: 'inhale' | 'hold' | 'exhale'
  const [breathState, setBreathState] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathProgress, setBreathProgress] = useState(0); // 0 to 100 for current circle
  const [totalProgress, setTotalProgress] = useState(0); // 0 to 100 for overall tea brewing
  const [isPressing, setIsPressing] = useState(false);

  // Score metrics
  const [goodBreathCount, setGoodBreathCount] = useState(0);
  const [totalTicks, setTotalTicks] = useState(0);
  const [finalTea, setFinalTea] = useState<BrewedTea | null>(null);
  
  // Brew History
  const [history, setHistory] = useState<BrewedTea[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);

  // Audio elements (optional, synthesized using Web Audio API for cozy immersive hum!)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Web Audio synth helper for deep calming vibration
  const startCalmingSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, ctx.currentTime); // Calming hum
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1); // low soft volume

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
    } catch (e) {
      console.log("Audio Web Synth not supported or blocked by user browser", e);
    }
  };

  const stopCalmingSound = () => {
    try {
      if (gainRef.current && audioCtxRef.current) {
        gainRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.5);
        setTimeout(() => {
          oscRef.current?.stop();
          oscRef.current = null;
        }, 500);
      }
    } catch (e) {
      // ignore
    }
  };

  // Synchronized Breathing Guide timer (Cycle is 4s Inhale, 4s Hold, 4s Exhale = 12 seconds total)
  useEffect(() => {
    if (phase !== 'breathing') return;

    const interval = setInterval(() => {
      setBreathProgress((prev) => {
        const next = prev + 1;
        
        // At 100%, transition the breath stage
        if (next >= 100) {
          setBreathState((curr) => {
            if (curr === 'inhale') return 'hold';
            if (curr === 'hold') return 'exhale';
            return 'inhale';
          });
          return 0;
        }
        return next;
      });

      // Update total tea brewing progress based on whether the user is pressing and breathing!
      setTotalProgress((prevTotal) => {
        if (prevTotal >= 100) {
          clearInterval(interval);
          finishBrewing();
          return 100;
        }

        // Increment total progress slightly faster if pressing matching the flow
        const increment = isPressing ? 0.6 : 0.2;
        return Math.min(100, prevTotal + increment);
      });

      // Vibe tracker: check if user holds correctly during Inhale/Hold and lets go during Exhale
      setTotalTicks((t) => t + 1);
      if (isPressing) {
        if (breathState === 'inhale' || breathState === 'hold') {
          setGoodBreathCount((g) => g + 1);
        }
      } else {
        if (breathState === 'exhale') {
          setGoodBreathCount((g) => g + 1);
        }
      }

    }, 30); // 33 ticks per second roughly

    return () => clearInterval(interval);
  }, [phase, breathState, isPressing]);

  // Handle sound oscillator pitch based on breath phase
  useEffect(() => {
    if (phase === 'breathing' && oscRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      if (breathState === 'inhale') {
        oscRef.current.frequency.exponentialRampToValueAtTime(160, now + 4);
      } else if (breathState === 'hold') {
        oscRef.current.frequency.setValueAtTime(160, now);
      } else {
        oscRef.current.frequency.exponentialRampToValueAtTime(110, now + 4);
      }
    }
  }, [breathState, phase]);

  // Load user's brewing history from Firestore
  const fetchHistory = async () => {
    if (!currentUser) return;
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, 'brewed_teas'),
        where('userId', '==', currentUser.uid),
        orderBy('brewedAt', 'desc'),
        limit(15)
      );
      const querySnapshot = await getDocs(q);
      const items: BrewedTea[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as BrewedTea);
      });
      setHistory(items);
    } catch (e) {
      console.error("Error fetching tea history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const startBrewingSession = () => {
    setBreathProgress(0);
    setTotalProgress(0);
    setGoodBreathCount(0);
    setTotalTicks(0);
    setBreathState('inhale');
    setPhase('breathing');
    startCalmingSound();
  };

  const finishBrewing = async () => {
    stopCalmingSound();
    
    // Calculate harmony score (percentage of ticks matching optimal breath pattern)
    const rawScore = totalTicks > 0 ? Math.round((goodBreathCount / totalTicks) * 100) : 85;
    // Boost a bit so it feels encouraging
    const finalScore = Math.max(65, Math.min(100, rawScore + 15));

    // Choose tea based on score ranges and a bit of randomness
    let selectedRecipe = TEA_RECIPES[0];
    if (finalScore >= 95) {
      selectedRecipe = TEA_RECIPES[4]; // Sakura Strawberry (perfect harmony)
    } else if (finalScore >= 88) {
      selectedRecipe = TEA_RECIPES[1]; // Serene Strawberry
    } else if (finalScore >= 80) {
      selectedRecipe = TEA_RECIPES[2]; // Golden Sun
    } else if (finalScore >= 70) {
      selectedRecipe = TEA_RECIPES[3]; // Pure Morning Dew
    } else {
      selectedRecipe = TEA_RECIPES[0]; // Moon Strawberry
    }

    // Pick a matching character randomly from the app characters list
    let matchChar = { name: "Wyn 🧸", id: "wyn" };
    if (characters && characters.length > 0) {
      const idx = Math.floor(Math.random() * characters.length);
      matchChar = {
        name: characters[idx].name,
        id: characters[idx].id
      };
    }

    const newTea: BrewedTea = {
      teaName: selectedRecipe.name,
      teaEmoji: selectedRecipe.emoji,
      harmonyScore: finalScore,
      ingredients: selectedRecipe.ingredients,
      message: selectedRecipe.message,
      matchingCharName: matchChar.name,
      matchingCharId: matchChar.id,
      brewedAt: Date.now()
    };

    setFinalTea(newTea);
    setPhase('result');

    // Save automatically to Firestore if logged in
    if (currentUser) {
      setSavingRecord(true);
      try {
        await addDoc(collection(db, 'brewed_teas'), {
          ...newTea,
          userId: currentUser.uid,
          userDisplayName: currentUser.displayName
        });
      } catch (e) {
        console.error("Error saving tea brewing record:", e);
      } finally {
        setSavingRecord(false);
      }
    }
  };

  // Trigger when exiting tab or finishing
  useEffect(() => {
    return () => {
      stopCalmingSound();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-5 border-b border-rose-100/60 dark:border-neutral-800/60">
        <div>
          <button 
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay về tiệm</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold font-serif-title text-neutral-900 dark:text-neutral-50 flex items-center gap-2.5">
            <span>🍃 Quán Trà Trị Liệu Hơi Thở</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Chậm lại một nhịp, lắng nghe hơi thở và tự tay pha tặng mình một ly trà dâu ấm áp xoa dịu tâm hồn.
          </p>
        </div>

        {/* Top Toggle buttons */}
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          {phase !== 'intro' && (
            <button
              onClick={() => {
                stopCalmingSound();
                setPhase('intro');
              }}
              className="flex-1 md:flex-none text-center px-4 py-2 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-xs font-bold text-neutral-700 dark:text-neutral-300 transition cursor-pointer"
            >
              Về Trang Chủ Trà
            </button>
          )}
          {currentUser && (
            <button
              onClick={() => {
                stopCalmingSound();
                setPhase('history');
                fetchHistory();
              }}
              className="flex-1 md:flex-none text-center px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/45 border border-rose-100/50 dark:border-rose-900/30 text-xs font-bold text-rose-600 dark:text-rose-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Nhật Ký Thưởng Trà</span>
            </button>
          )}
        </div>
      </div>

      {/* PHASE 1: INTRO */}
      {phase === 'intro' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Visual card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-rose-50/50 via-white to-orange-50/20 dark:from-neutral-900 dark:via-neutral-850 dark:to-orange-950/5 rounded-3xl border border-rose-100 dark:border-neutral-800 p-8 text-center shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/10 dark:bg-rose-500/5 rounded-full blur-2xl" />
            
            {/* Pulsing beautiful pot emoji */}
            <div className="relative w-40 h-40 mx-auto my-6 bg-white dark:bg-neutral-800 rounded-full border border-rose-100/80 dark:border-neutral-700/60 shadow-lg flex items-center justify-center animate-pulse">
              <span className="text-7xl">🫖</span>
              <span className="absolute text-3xl -top-1 right-4 animate-bounce">🍓</span>
              <span className="absolute text-2xl bottom-2 left-4 animate-spin-slow">🌿</span>
              {/* Steamy clouds */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 justify-center">
                <span className="text-rose-400/40 text-lg animate-bounce duration-1000">~</span>
                <span className="text-rose-400/40 text-lg animate-bounce duration-700">~</span>
                <span className="text-rose-400/40 text-lg animate-bounce duration-1200">~</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 font-serif-title mb-2">
              Bạn đang mệt mỏi hay dồn nén điều gì?
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto mb-4">
              Pha trà thiền không chỉ là chế nước nóng. Đó là sự hòa quyện của hơi thở khoan thai, đôi bàn tay trân quý và sự tĩnh lặng trong sâu thẳm tâm hồn bạn.
            </p>
          </div>

          {/* Guide & Start Button */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <Wind className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span>Hướng dẫn pha trà phép thuật</span>
              </h2>

              <div className="space-y-3">
                <div className="flex gap-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">1</div>
                  <p>Màn hình sẽ hiển thị <strong>Vòng Tròn Hơi Thở</strong> lặp lại theo nhịp 4 giây: <span className="text-emerald-500 font-bold">Hít vào</span> ➡️ <span className="text-blue-500 font-bold">Giữ hơi</span> ➡️ <span className="text-amber-500 font-bold">Thở ra</span>.</p>
                </div>
                <div className="flex gap-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">2</div>
                  <p>Hãy <strong>nhấn và giữ ngón tay/chuột vào nút truyền khí</strong> khi vòng tròn nở ra (Inhale/Hold), và <strong>thả ngón tay ra</strong> để thư giãn khi vòng tròn thu nhỏ (Exhale).</p>
                </div>
                <div className="flex gap-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">3</div>
                  <p>Nhịp giữ càng chuẩn khớp với tự nhiên, <strong>Chỉ số hòa hợp (Vibe Harmony)</strong> sẽ càng cao và tách trà đặc chế dành riêng cho tâm trạng của bạn sẽ càng ngát hương thơm!</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl border border-amber-100/60 dark:border-amber-950/40 text-[11px] text-amber-700 dark:text-amber-400/80 leading-relaxed flex items-start gap-2.5">
              <span className="text-base">💡</span>
              <p>Mẹo nhỏ: Wyn khuyến khích bạn nên nhắm khẽ mắt hoặc nhìn nhẹ nhàng vào tâm vòng tròn, hít thở thật sâu bằng mũi để cảm thấy lồng ngực được thư thái nhất nhé.</p>
            </div>

            <button
              onClick={startBrewingSession}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-rose-500 text-white text-sm font-extrabold shadow-md shadow-emerald-500/10 hover:from-emerald-600 hover:to-rose-600 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <Coffee className="w-4 h-4 animate-bounce" />
              <span>Bắt Đầu Thiền & Pha Trà Phép Thuật</span>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: BREATHING SIMULATOR */}
      {phase === 'breathing' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 md:p-8 shadow-xl text-center relative overflow-hidden">
          
          {/* Calming abstract light backgrounds */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-200/10 dark:bg-emerald-500/5 rounded-full blur-3xl transition-opacity" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-200/10 dark:bg-rose-500/5 rounded-full blur-3xl transition-opacity" />

          {/* Guide banner */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30">
              <Wind className="w-3 h-3 animate-spin-slow" />
              <span>Tiến trình pha trà phép thuật: {Math.round(totalProgress)}%</span>
            </span>
          </div>

          {/* Master Progress Bar */}
          <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-8 overflow-hidden relative">
            <div 
              className="absolute h-full left-0 bg-gradient-to-r from-emerald-400 via-rose-400 to-amber-400 transition-all duration-100"
              style={{ width: `${totalProgress}%` }}
            />
          </div>

          {/* LARGE INTERACTIVE BREATHING CIRCLE */}
          <div className="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
            
            {/* Background ripple ring */}
            <div 
              className={`absolute inset-0 rounded-full border border-dashed transition-all duration-300 ${
                breathState === 'inhale' ? 'border-emerald-300 dark:border-emerald-700 animate-ping-slow' :
                breathState === 'hold' ? 'border-blue-300 dark:border-blue-700 scale-105' :
                'border-amber-300 dark:border-amber-700 scale-95'
              }`}
            />

            {/* Pulsing Breathing Core Orb */}
            <div 
              className={`rounded-full flex flex-col items-center justify-center shadow-lg border transition-all duration-100 ${
                breathState === 'inhale' ? 'bg-emerald-50/70 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40' :
                breathState === 'hold' ? 'bg-blue-50/70 border-blue-100 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/40' :
                'bg-amber-50/70 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40'
              }`}
              style={{
                width: breathState === 'inhale' ? `${140 + breathProgress * 0.6}px` : 
                       breathState === 'hold' ? '200px' : 
                       `${200 - breathProgress * 0.6}px`,
                height: breathState === 'inhale' ? `${140 + breathProgress * 0.6}px` : 
                        breathState === 'hold' ? '200px' : 
                        `${200 - breathProgress * 0.6}px`,
              }}
            >
              {/* Breath instructions icon & text */}
              <div className="animate-pulse flex flex-col items-center">
                {breathState === 'inhale' && (
                  <>
                    <span className="text-3xl mb-1.5">🌬️</span>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Hít vào</h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Mở rộng lồng ngực...</p>
                  </>
                )}
                {breathState === 'hold' && (
                  <>
                    <span className="text-3xl mb-1.5">🧘‍♀️</span>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Giữ hơi</h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Lắng đọng suy tư...</p>
                  </>
                )}
                {breathState === 'exhale' && (
                  <>
                    <span className="text-3xl mb-1.5">🍃</span>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Thở ra</h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Giải tỏa âu lo...</p>
                  </>
                )}
              </div>
            </div>

            {/* Steaming elements on top based on holding status */}
            {isPressing && (
              <div className="absolute top-0 flex gap-2 justify-center animate-bounce">
                <span className="text-lg opacity-60">🍵</span>
                <span className="text-lg opacity-30">✨</span>
              </div>
            )}
          </div>

          {/* HOLD INTERACTION BUTTON */}
          <div className="mt-8 space-y-4">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
              {breathState === 'exhale' 
                ? "Thả ngón tay ra để rũ bỏ phiền muộn, thanh lọc cơ thể..." 
                : "Chạm và Giữ nút đỏ ấm bên dưới để truyền năng lượng thở..."}
            </p>

            <button
              onMouseDown={() => setIsPressing(true)}
              onMouseUp={() => setIsPressing(false)}
              onMouseLeave={() => setIsPressing(false)}
              onTouchStart={() => setIsPressing(true)}
              onTouchEnd={() => setIsPressing(false)}
              className={`w-full py-5 rounded-2xl font-extrabold text-sm transition-all duration-150 border cursor-pointer select-none ${
                isPressing 
                  ? 'bg-rose-500 border-rose-600 text-white scale-98 shadow-inner shadow-black/10' 
                  : 'bg-white hover:bg-rose-50 dark:bg-neutral-800 dark:hover:bg-rose-950/20 border-rose-200 dark:border-neutral-700 text-rose-500 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Heart className={`w-4 h-4 ${isPressing ? 'animate-ping fill-white' : 'animate-pulse text-rose-500'}`} />
                <span>{isPressing ? "🔥 Đang Truyền Hơi Thở..." : "Chạm & Giữ Vào Đây Để Pha Trà"}</span>
              </div>
            </button>

            <div className="text-[10px] text-neutral-400 italic">
              Nếu dùng điện thoại, hãy chạm giữ ngón tay trực tiếp vào nút trên nhé!
            </div>
          </div>

        </div>
      )}

      {/* PHASE 3: BREWED RESULT CARD */}
      {phase === 'result' && finalTea && (
        <div className="max-w-xl mx-auto space-y-6">
          
          {/* Main Beautiful Tea Card */}
          <div className="bg-gradient-to-br from-white via-rose-50/20 to-amber-50/20 dark:from-neutral-900 dark:via-rose-950/5 dark:to-amber-950/5 rounded-3xl border border-rose-100/80 dark:border-neutral-800/80 shadow-2xl p-6 md:p-8 text-center relative overflow-hidden animate-scale-up">
            
            {/* Top Confetti & Sparkles */}
            <div className="absolute top-4 left-4 text-lg animate-bounce">🎈</div>
            <div className="absolute top-6 right-6 text-lg animate-spin-slow">✨</div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 mb-6">
              <Award className="w-3.5 h-3.5" />
              <span>Chỉ số hòa hợp hơi thở: {finalTea.harmonyScore}%</span>
            </span>

            {/* Glowing Teacup representation */}
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white dark:bg-neutral-850 shadow-inner border border-rose-100 dark:border-neutral-800 flex items-center justify-center text-5xl relative animate-pulse">
              <span>{finalTea.teaEmoji}</span>
              <span className="absolute -top-1 -right-1 text-2xl animate-bounce">🍵</span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold font-serif-title text-neutral-900 dark:text-neutral-50 mb-1">
              {finalTea.teaName}
            </h2>
            <div className="text-xs text-rose-500/80 dark:text-rose-400/80 font-bold mb-4">
              ✨ Đã đặc pha hoàn tất dưới nhịp thở bình yên ✨
            </div>

            {/* Steamy message container */}
            <div className="bg-white/80 dark:bg-neutral-950/60 p-5 rounded-2xl border border-rose-100/50 dark:border-neutral-800 text-left space-y-3 mb-6 shadow-sm">
              <h4 className="text-xs font-extrabold text-neutral-800 dark:text-neutral-300 flex items-center gap-1.5 border-b border-neutral-100 dark:border-neutral-800 pb-1.5">
                <Smile className="w-3.5 h-3.5 text-rose-400" />
                <span>Bức thư chữa lành từ Wyn:</span>
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                "{finalTea.message}"
              </p>
            </div>

            {/* Ingredients & Synergy section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">
              
              {/* Recipe list */}
              <div className="bg-rose-50/60 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-100/50 dark:border-rose-900/40 shadow-xs">
                <h5 className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2">Thành phần đặc chế:</h5>
                <ul className="space-y-1.5">
                  {finalTea.ingredients.map((ing, idx) => (
                    <li key={idx} className="text-xs text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5 font-medium">
                      <span className="text-rose-500">♥</span>
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vibe match character recommendation */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/40 shadow-xs flex flex-col justify-between">
                <div>
                  <h5 className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Đồng điệu tần số hôm nay:</h5>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-bold mt-1">
                    ✨ {finalTea.matchingCharName}
                  </p>
                  <p className="text-[10px] text-neutral-600 dark:text-neutral-300 mt-1.5 leading-relaxed">
                    Nhân vật có cùng tần số rung động và hơi thở dịu êm của bạn ngày hôm nay!
                  </p>
                </div>

                {/* Redirect back to character chat link */}
                {onSelectCharacterById && finalTea.matchingCharId !== 'wyn' && (
                  <button
                    onClick={() => onSelectCharacterById(finalTea.matchingCharId)}
                    className="mt-3 py-1.5 px-3 rounded-xl bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Trò chuyện ngay</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

            </div>

            {/* Back action */}
            <div className="pt-2 border-t border-rose-100/50 dark:border-neutral-850">
              <button
                onClick={() => setPhase('intro')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-rose-500 text-white text-xs font-bold shadow-md shadow-emerald-500/10 hover:from-emerald-600 hover:to-rose-600 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Pha lại một tách trà khác</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PHASE 4: TEA HISTORY DIARY */}
      {phase === 'history' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 shadow-xl">
          
          <h2 className="text-lg font-bold font-serif-title text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-rose-500" />
            <span>Nhật Ký Thưởng Trà Tâm Hồn</span>
          </h2>
          
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
            Lịch sử lưu lại những ấm trà bạn đã gieo mầm hơi thở tại Tiệm. Mỗi ấm trà là một cột mốc bình yên trên hành trình yêu thương bản thân của bạn.
          </p>

          {loadingHistory ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-rose-400 mx-auto" />
              <p className="text-xs text-neutral-400">Đang lục tìm sổ sách pha trà...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center space-y-3 border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-2xl">
              <span className="text-4xl block">🫖</span>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Sổ tay trống rỗng. Bạn chưa lưu lại tách trà thảo mộc nào cả!
              </p>
              <button
                onClick={() => setPhase('intro')}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition cursor-pointer"
              >
                Pha Tách Trà Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin">
              {history.map((item, idx) => (
                <div 
                  key={item.id || idx} 
                  className="bg-neutral-50 dark:bg-neutral-850 p-4 rounded-2xl border border-neutral-100/80 dark:border-neutral-800 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 border border-rose-100/50 dark:border-neutral-700/50 flex items-center justify-center text-xl shrink-0 shadow-xs">
                    <span>{item.teaEmoji.substring(0, 2)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200">
                        {item.teaName}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {new Date(item.brewedAt).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2 italic">
                      "{item.message}"
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] py-0.5 px-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30">
                        Hòa hợp: {item.harmonyScore}%
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Đồng tần số: <strong>{item.matchingCharName}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
