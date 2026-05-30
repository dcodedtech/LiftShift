import React, { useEffect, useRef } from 'react';

import { LazyRender } from '../../ui/LazyRender';
import type { FlexCardId } from '../utils/flexViewConstants';

interface FlexCarouselProps {
  cards: { id: FlexCardId; label: string }[];
  onSelectCard: (id: FlexCardId) => void;
  renderCard: (id: FlexCardId) => React.ReactNode;
}

const FlexCarouselPlaceholder = () => (
  <div className="min-h-[500px] rounded-2xl border border-slate-700/50 bg-black/20 p-6" style={{ backgroundColor: 'rgb(var(--panel-rgb) / 0.5)' }}>
    <div className="animate-pulse">
      <div className="h-6 w-1/2 rounded bg-slate-800/60" />
      <div className="mt-4 h-24 rounded bg-slate-800/40" />
      <div className="mt-3 h-24 rounded bg-slate-800/35" />
      <div className="mt-3 h-24 rounded bg-slate-800/30" />
    </div>
  </div>
);

export const FlexCarousel: React.FC<FlexCarouselProps> = ({ cards, onSelectCard, renderCard }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      drag.current = { active: true, startX: e.pageX, scrollLeft: el.scrollLeft, moved: false };
    };

    const onMouseMove = (e: MouseEvent) => {
      const state = drag.current;
      if (!state.active) return;
      const dx = Math.abs(e.pageX - state.startX);
      if (dx > 5) state.moved = true;
      el.scrollLeft = state.scrollLeft - (e.pageX - state.startX);
    };

    const onMouseUp = () => {
      drag.current.active = false;
    };

    const onClickCapture = (e: MouseEvent) => {
      if (drag.current.moved) {
        e.stopPropagation();
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('click', onClickCapture, true);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className="relative w-full mt-10">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 pb-20 px-3 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex-shrink-0 w-[calc(100%-2rem)] max-w-md snap-center mx-auto cursor-pointer"
            onClick={() => onSelectCard(card.id)}
          >
            <LazyRender className="w-full" placeholder={<FlexCarouselPlaceholder />} rootMargin="600px 0px">
              {renderCard(card.id)}
            </LazyRender>
          </div>
        ))}
      </div>
    </div>
  );
};
