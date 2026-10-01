import React, { useMemo } from 'react';

interface HeartProps {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  animType: 'left' | 'right' | 'straight';
  opacity: number;
}

interface StrawberryBackgroundProps {
  opacityMultiplier?: number;
  speedMultiplier?: number;
  zIndex?: number;
}

// Keeping the component name StrawberryBackground to avoid breaking imports, but rendering lovely floating hearts!
export const StrawberryBackground: React.FC<StrawberryBackgroundProps> = ({
  opacityMultiplier = 1,
  speedMultiplier = 1,
  zIndex = 0,
}) => {
  const hearts = useMemo<HeartProps[]>(() => {
    const list: HeartProps[] = [];
    const count = 28; // Rich, enchanting coverage across the entire background
    const animTypes: ('left' | 'right' | 'straight')[] = ['left', 'right', 'straight'];

    for (let i = 0; i < count; i++) {
      // Base fast flight duration: between 4.2s and 7.5s (fast and lively)
      const baseDuration = 4.2 + (i % 6) * 0.65;
      // Negative delay distributes hearts across all heights (top, middle, bottom) from 0s
      const delay = -1 * ((i * 1.45) % baseDuration);

      list.push({
        id: i,
        // Evenly and naturally spread from left 2% to 96%
        left: Math.round(((i * 3.57) % 94 + (i % 3) * 1.5 + 2) * 10) / 10,
        size: 16 + (i % 5) * 5, // 16px to 36px
        duration: baseDuration,
        delay: delay,
        animType: animTypes[i % 3],
        opacity: 0.35 + (i % 4) * 0.15,
      });
    }
    return list;
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none transition-opacity duration-700"
      style={{ zIndex }}
      aria-hidden="true"
    >
      {hearts.map((item) => {
        let animClass = 'animate-rise-berry-straight';
        if (item.animType === 'left') animClass = 'animate-rise-berry-left';
        if (item.animType === 'right') animClass = 'animate-rise-berry-right';

        const finalDuration = item.duration / speedMultiplier;

        return (
          <div
            key={item.id}
            className={`absolute top-0 ${animClass}`}
            style={{
              left: `${item.left}%`,
              animationDuration: `${finalDuration}s`,
              animationDelay: `${item.delay}s`,
              opacity: Math.min(1, Math.max(0, item.opacity * opacityMultiplier)),
            }}
          >
            {/* Detailed SVG Heart */}
            <svg
              width={item.size}
              height={item.size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-xs hover:scale-130 transition-transform cursor-pointer"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                className="fill-rose-400 dark:fill-rose-500 opacity-90"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
