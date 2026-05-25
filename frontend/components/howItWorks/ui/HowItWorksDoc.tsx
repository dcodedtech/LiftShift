import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import { assetPath } from '../../../constants';
import type { HowItWorksSection, HowItWorksNode } from '../utils/howItWorksDocContent';
import { HOW_IT_WORKS_SECTIONS } from '../utils/howItWorksDocContent';

type Props = {
  className?: string;
  showTitle?: boolean;
  linkTarget?: '_self' | '_blank';
};

type FlatNavItem = {
  id: string;
  title: string;
  depth: number;
};

const flattenSections = (sections: HowItWorksSection[], depth: number): FlatNavItem[] => {
  const out: FlatNavItem[] = [];
  for (const s of sections) {
    out.push({ id: s.id, title: s.sidebarTitle ?? s.title, depth });
    if (s.children && s.children.length > 0) out.push(...flattenSections(s.children, depth + 1));
  }
  return out;
};

const getToneClasses = (tone: 'note' | 'warning', isLight: boolean) => {
  if (tone === 'warning') {
    return {
      border: isLight ? 'border-amber-600/25' : 'border-amber-500/25',
      bg: isLight ? 'bg-amber-100/50' : 'bg-amber-500/10',
      title: isLight ? 'text-amber-700' : 'text-amber-200',
      text: isLight ? 'text-slate-700' : 'text-slate-200',
    };
  }
  return {
    border: isLight ? 'border-emerald-600/25' : 'border-emerald-500/25',
    bg: isLight ? 'bg-emerald-100/50' : 'bg-emerald-500/10',
    title: isLight ? 'text-emerald-700' : 'text-emerald-200',
    text: isLight ? 'text-slate-700' : 'text-slate-200',
  };
};

const NodeView: React.FC<{ node: HowItWorksNode; linkTarget: '_self' | '_blank'; isLight: boolean }> = ({ node, linkTarget, isLight }) => {
  if (node.type === 'p') {
    return <p className={`leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{node.text}</p>;
  }

  if (node.type === 'ul') {
    return (
      <ul className={`list-disc list-inside space-y-1 leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
        {node.items.map((t, idx) => (
          <li key={idx}>{t}</li>
        ))}
      </ul>
    );
  }

  if (node.type === 'links') {
    return (
      <div className="flex flex-wrap gap-2">
        {node.links.map((l) => (
          <a
            key={l.hrefPath}
            href={assetPath(l.hrefPath)}
            target={linkTarget}
            rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${isLight ? 'border-black/10 bg-black/5 text-emerald-700 hover:bg-black/10' : 'border-white/10 bg-white/5 text-emerald-200 hover:bg-white/10'}`}
          >
            {l.label}
          </a>
        ))}
      </div>
    );
  }

  const tone = getToneClasses(node.tone, isLight);
  return (
    <div className={`rounded-2xl border ${tone.border} ${tone.bg} p-4`}>
      <div className={`text-sm font-semibold ${tone.title}`}>{node.title}</div>
      <div className={`mt-2 text-sm ${tone.text} leading-relaxed`}>{node.text}</div>
    </div>
  );
};

const SectionView: React.FC<{ section: HowItWorksSection; level: number; linkTarget: '_self' | '_blank'; flashingId: string | null; isLight: boolean }> = ({ section, level, linkTarget, flashingId, isLight }) => {
  const HeadingTag = level === 2 ? 'h2' : 'h3';
  const isFlashing = flashingId === section.id;
  const isDimmed = flashingId !== null && !isFlashing;
  return (
    <section id={section.id} className="space-y-4 scroll-mt-16">
      <div className={'transition-opacity duration-400' + (isDimmed ? ' opacity-50' : '')}>
        <HeadingTag
          className={[
            'transition-all duration-700',
            level === 2 ? 'text-xl font-bold' : 'text-lg font-semibold',
            isFlashing ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : (isLight ? 'text-slate-900' : 'text-white'),
          ].join(' ')}
        >
          {section.title}
        </HeadingTag>
        <div className="mt-3 space-y-3">
          {section.nodes.map((n, idx) => (
            <NodeView key={idx} node={n} linkTarget={linkTarget} isLight={isLight} />
          ))}
        </div>
      </div>

      {section.children && section.children.length > 0 ? (
        <div className="mt-6 space-y-6">
          {section.children.map((c) => (
            <SectionView key={c.id} section={c} level={3} linkTarget={linkTarget} flashingId={flashingId} isLight={isLight} />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export const HowItWorksDoc: React.FC<Props> = ({ className = '', showTitle = true, linkTarget = '_self' }) => {
  const { mode } = useTheme();
  const isLight = mode === 'light';
  const navItems = useMemo(() => flattenSections(HOW_IT_WORKS_SECTIONS, 0), []);

  const parentMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    const walk = (sections: HowItWorksSection[], parentId: string | null) => {
      for (const s of sections) {
        map[s.id] = parentId;
        if (s.children) walk(s.children, s.id);
      }
    };
    walk(HOW_IT_WORKS_SECTIONS, null);
    return map;
  }, []);

  const resolveParentId = useCallback((id: string): string => parentMap[id] ?? id, [parentMap]);

  const [activeId, setActiveId] = useState<string>(HOW_IT_WORKS_SECTIONS[0]?.id ?? '');
  const contentRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const flexRef = useRef<HTMLDivElement | null>(null);
  const [paneHeight, setPaneHeight] = useState(0);
  const [flashingId, setFlashingId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerSuppressed = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    if (!sidebarRef.current) return;
    setPaneHeight(sidebarRef.current.getBoundingClientRect().height);
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const scrollToIdInPane = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const heading = el.querySelector('h2, h3') ?? el;
    const pane = contentRef.current;
    if (pane) {
      const paneRect = pane.getBoundingClientRect();
      const headingRect = heading.getBoundingClientRect();
      const visibleTop = Math.max(paneRect.top, 0);
      const visibleCenterY = visibleTop + (Math.min(paneRect.bottom, window.innerHeight) - visibleTop) / 2;
      const headingCenterY = headingRect.top + headingRect.height / 2;
      pane.scrollBy({ top: headingCenterY - visibleCenterY, behavior: 'smooth' });
    }

    const navLink = sidebarRef.current?.querySelector(`a[href="#${id}"]`);
    if (navLink) navLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();

    observerSuppressed.current = true;
    clearTimeout(scrollTimerRef.current ?? undefined);
    scrollTimerRef.current = setTimeout(() => { observerSuppressed.current = false; }, 800);

    setActiveId(resolveParentId(id));
    scrollToIdInPane(id);

    setFlashingId(id);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlashingId(null), 2000);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.location.hash || '';
    const id = raw.startsWith('#') ? raw.slice(1) : raw;
    if (!id) return;

    scrollToIdInPane(id);
    setActiveId(resolveParentId(id));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parentIds = navItems.filter(i => i.depth === 0).map(i => i.id);

    const handleIntersect = () => {
      if (observerSuppressed.current) return;

      const cr = contentRef.current!.getBoundingClientRect();
      const centerY = cr.top + cr.height / 2;

      let closestDist = Infinity;
      let closestId: string | null = null;

      for (const id of parentIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < cr.top || rect.top > cr.bottom) continue;
        const dist = Math.abs(rect.top - centerY);
        if (dist < closestDist) {
          closestDist = dist;
          closestId = id;
        }
      }

      if (closestId) setActiveId(resolveParentId(closestId));
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: contentRef.current,
      rootMargin: '-10% 0px -30% 0px',
      threshold: [0],
    });

    for (const id of parentIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [navItems]);

  return (
    <div className={`space-y-8 ${className}`}>
      {showTitle ? (
        <div className="px-5 sm:px-6">
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>How LiftShift works</h1>
          <p className={`mt-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            A user-friendly overview of the features, assumptions, and definitions behind the workout analytics dashboard.
          </p>
        </div>
      ) : null}

      {/* Mobile burger */}
      <div className="lg:hidden flex justify-end px-5 sm:px-6">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`p-2.5 rounded-xl border transition-colors ${
            isLight
              ? 'border-black/10 text-slate-600 hover:bg-black/5'
              : 'border-white/10 text-slate-300 hover:bg-white/5'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile slide-out */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div
            className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] shadow-2xl overflow-y-auto ${
              isLight ? 'bg-white' : 'bg-black border-l border-white/10'
            }`}
          >
            <div className={`sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b ${
              isLight ? 'border-slate-300/30 bg-white' : 'border-slate-800/30 bg-black'
            }`}>
              <span className={`text-[11px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Contents</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight ? 'hover:bg-black/5 text-slate-500' : 'hover:bg-white/5 text-slate-400'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="py-3">
              {navItems.map((i) => (
                <a
                  key={i.id}
                  href={`#${i.id}`}
                  onClick={(e) => {
                    handleNavClick(e, i.id);
                    setMobileMenuOpen(false);
                  }}
                  className={[
                    'block transition-colors',
                    i.depth === 0 ? 'pl-5' : i.depth === 1 ? 'pl-8' : 'pl-12',
                    'pr-5 py-2.5 text-sm leading-snug',
                    i.depth === 0
                      ? 'text-[13px] font-semibold tracking-wide text-emerald-400'
                      : `text-[13px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`,
                  ].join(' ')}
                >
                  {i.title}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Docs layout: sidebar (left) + content (right) */}
      <div ref={flexRef} className="flex items-start">
        {/* Sidebar */}
        <aside ref={sidebarRef} className={`hidden lg:flex lg:flex-col w-[280px] shrink-0 border-r sticky top-0 self-start ${isLight ? 'border-slate-300/50' : 'border-slate-800/40'}`}>
          <div className={`sticky top-0 z-10 shrink-0 px-5 py-3.5 border-b ${isLight ? 'border-slate-300/30 bg-white/50' : 'border-slate-800/30 bg-black/25'}`}>
            <span className={`text-[11px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Contents</span>
          </div>
          <nav className="py-3 space-y-0">
            {navItems.map((i) => {
              const isActive = i.id === activeId;
              const isParent = i.depth === 0;
              return (
                <a
                  key={i.id}
                  href={`#${i.id}`}
                  onClick={(e) => handleNavClick(e, i.id)}
                  className={[
                    'block transition-colors rounded-r-lg',
                    isParent ? 'mt-2 first:mt-0' : '',
                    i.depth === 0 ? 'pl-5' : i.depth === 1 ? 'pl-8' : 'pl-12',
                    'pr-4 py-1.5 text-sm leading-snug',
                    isParent ? 'text-[13px] font-semibold tracking-wide text-emerald-400' : `text-[13px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`,
                    isActive
                      ? `text-emerald-200 bg-emerald-500/8`
                      : `${isLight ? 'hover:text-emerald-600 hover:bg-black/[0.03]' : 'hover:text-emerald-300 hover:bg-white/[0.03]'}`,
                  ].join(' ')}
                >
                  {i.title}
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto min-w-0 scroll-pt-8 relative" style={{ maxHeight: paneHeight }}>
          <div className="max-w-3xl mx-auto px-8 py-10 space-y-14">
            {HOW_IT_WORKS_SECTIONS.map((s) => (
              <SectionView key={s.id} section={s} level={2} linkTarget={linkTarget} flashingId={flashingId} isLight={isLight} />
            ))}
            <div className="pb-16" />
          </div>
        </div>
      </div>
    </div>
  );
};
