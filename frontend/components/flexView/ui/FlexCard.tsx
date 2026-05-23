import React from 'react';

export type CardTheme = 'dark' | 'light';

interface FlexCardProps {
  children: React.ReactNode;
  theme: CardTheme;
  className?: string;
}

// Shared card wrapper for consistent styling
export const FlexCard: React.FC<FlexCardProps> = ({ children, theme, className = '' }) => {
  const isDark = theme === 'dark';
  const cardGradient = isDark
    ? 'bg-gradient-to-b from-[#0B1220] via-[#0F172A] to-[#0F4C5C]'
    : 'bg-gradient-to-b from-[#F5F7FA] via-[#EAF2F5] to-[#5CC6D0]';
  const glassSurface = isDark ? 'bg-[#0F172A]/72' : 'bg-white/70';
  const cardShadow = isDark
    ? 'shadow-[0_28px_65px_rgba(0,0,0,0.42)]'
    : 'shadow-[0_28px_60px_rgba(13,71,88,0.14)]';
  const glowClass = isDark ? 'bg-[#39B8C8]/8' : 'bg-cyan-100/45';

  return (
    <div className={`relative isolate overflow-hidden rounded-3xl ${cardShadow} transition-all duration-500`}>
      <div className={`absolute inset-0 ${cardGradient}`} />
      <div className={`absolute inset-0  ${glassSurface}`} />
      <div className={`pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full blur-3xl ${glowClass}`} />
      <div className={`relative z-10 h-full ${className}`}>
        {children}
      </div>
    </div>
  );
};

// Branding footer component
export function FlexCardFooter({ theme }: { theme: CardTheme }) {
  const isDark = theme === 'dark';
  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none select-none">
      <span className={`text-[11px] font-semibold tracking-wide ${isDark ? '!text-slate-400/80' : '!text-slate-500'}`}>
        LiftShift.app
      </span>
    </div>
  );
}
