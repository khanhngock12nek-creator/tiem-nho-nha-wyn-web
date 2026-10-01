import React from 'react';
import { Tag, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { GENRES_LIST, GENRE_THEMES } from '../constants/genres';
import { Character, CustomGenre } from '../types';

interface GenreExplorerViewProps {
  characters: Character[];
  onSelectGenre: (genre: string) => void;
  customGenres: CustomGenre[];
}

export const GenreExplorerView: React.FC<GenreExplorerViewProps> = ({
  characters,
  onSelectGenre,
  customGenres,
}) => {
  // Count characters per genre
  const genreCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    GENRES_LIST.forEach((g) => {
      counts[g] = 0;
    });
    customGenres.forEach((g) => {
      counts[g.name] = 0;
    });

    characters.forEach((char) => {
      char.genres.forEach((g) => {
        if (counts[g] !== undefined) {
          counts[g] = (counts[g] || 0) + 1;
        } else {
          counts[g] = 1;
        }
      });
    });
    return counts;
  }, [characters, customGenres]);

  const allSortedGenres = React.useMemo(() => {
    const combined = Array.from(new Set([...GENRES_LIST, ...customGenres.map(g => g.name)]));
    return combined.sort((a, b) => {
      const countA = genreCounts[a] || 0;
      const countB = genreCounts[b] || 0;
      if (countB !== countA) return countB - countA;
      return a.localeCompare(b);
    });
  }, [genreCounts, customGenres]);

  // Flavor text / vibe description for Vietnamese trope genres
  const genreDescriptions: Record<string, string> = {
    'Thanh mai trúc mã': 'Lớn lên bên nhau từ tấm bé, thấu hiểu từng thói quen nhỏ nhất.',
    'Thanh xuân vườn trường': 'Tà áo trắng, sân trường rợp bóng cây và những rung động đầu đời trong trẻo.',
    'Văn nhã bại hoại': 'Kính gọng vàng trí thức, phong thái lịch lãm điềm đạm nhưng nội tâm thâm trầm khó dò.',
    'R18': 'Cốt truyện nồng nhiệt, cảm xúc thăng hoa và những tương tác táo bạo.',
    'R21': 'Sâu sắc, mãnh liệt và đầy quyến rũ không dành cho người dưới tuổi.',
    'Ngụy côn trùng': 'Thiết lập kỳ ảo độc đáo, cảm giác rợn ngợp quyến luyến mới lạ.',
    'Oan gia': 'Gặp nhau là khắc khẩu, ngoài mặt chê bai nhưng trong lòng rung động.',
    'Vừa hận phải yêu': 'Tình thù giằng xé, bên hận thù sâu sắc bên khát khao chở che khôn nguôi.',
    'Ngược luyến tàn tâm': 'Nước mắt rơi vì hiểu lầm cay đắng, đau đớn khắc cốt ghi tâm.',
    'cổ trang': 'Cung đình vương giả, kiếm hiệp giang hồ, tà áo thướt tha phong nhã.',
    'Game thủ': 'Chiến thần đấu trường ảo, lạnh lùng bảo kê bé cưng trên mọi bản đồ.',
    'Ngoài lạnh trong nóng': 'Mặt lạnh như tiền nhưng bàn tay luôn dịu dàng kéo áo khoác cho em.',
    'Chữa lành': 'Góc trú ẩn dịu êm sau những ngày mỏi mệt giữa bộn bề cuộc sống.',
    'Nuông chiều': 'Muốn trăng hái trăng, muốn sao hái sao, coi người ấy là cả bầu trời.',
    'Ngọt sủng': 'Đường phèn mật ong, từng cử chỉ lời nói đều ngập tràn mật ngọt say đắm.',
    'Boy phố': 'Phong trần đường phố, chút phóng khoáng bất cần nhưng chân thành hết mực.',
    'Tổng tài': 'Quyền lực tài phiệt, quyết đoán bá đạo một tay che trời.',
    'Cún con nuôi vợ từ bé': 'Một mực quấn quýt, trung thành chờ ngày rước người thương về dinh.',
    'Chiếm hữu': 'Ánh mắt chỉ được phép hướng về ta, không ai được chạm vào em.',
    'hài hước': 'Tiếng cười rộn rã, những tình huống dở khóc dở cười giải tỏa căng thẳng.',
    'hiện đại': 'Nhịp sống đô thị, công sở, tình cảm thời đại mới thân thuộc gần gũi.',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <Tag className="w-3.5 h-3.5" />
          <span>Kho Tàng 21 Thể Loại</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif-title text-neutral-900 dark:text-white">
          Khám Phá Theo Thể Loại
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Lựa chọn hương vị truyện bạn say mê để xem danh sách nhân vật mang đúng thiết lập ấy.
        </p>
      </div>

      {/* Genre Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allSortedGenres.map((genre) => {
          const theme = GENRE_THEMES[genre] || {
            bgLight: 'bg-rose-50',
            textLight: 'text-rose-700',
            borderLight: 'border-rose-200',
            bgDark: 'dark:bg-rose-950/40',
            textDark: 'dark:text-rose-300',
            borderDark: 'dark:border-rose-800',
          };
          const count = genreCounts[genre] || 0;
          const desc = genreDescriptions[genre] || 'Thể loại nhân vật đặc sắc tại tiệm.';

          return (
            <div
              key={genre}
              onClick={() => onSelectGenre(genre)}
              className="group p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-rose-300 dark:hover:border-rose-800 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${theme.bgLight} ${theme.textLight} ${theme.borderLight} ${theme.bgDark} ${theme.textDark} ${theme.borderDark}`}
                  >
                    {genre}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {count} nhân vật
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-rose-500 group-hover:text-rose-600 font-medium">
                <span>Xem nhân vật</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
