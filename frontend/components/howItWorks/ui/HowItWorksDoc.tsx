import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
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

const getToneClasses = (tone: 'note' | 'warning') => {
  if (tone === 'warning') {
    return {
      border: 'border-amber-500/25',
      bg: 'bg-amber-500/10',
      title: 'text-amber-200',
      text: 'text-slate-200',
    };
  }
  return {
    border: 'border-emerald-500/25',
    bg: 'bg-emerald-500/10',
    title: 'text-emerald-200',
    text: 'text-slate-200',
  };
};

const NodeView: React.FC<{ node: HowItWorksNode; linkTarget: '_self' | '_blank' }> = ({ node, linkTarget }) => {
  if (node.type === 'p') {
    return <p className="text-slate-300 leading-relaxed">{node.text}</p>;
  }

  if (node.type === 'ul') {
    return (
      <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed">
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
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-emerald-200 hover:bg-white/10"
          >
            {l.label}
          </a>
        ))}
      </div>
    );
  }

  const tone = getToneClasses(node.tone);
  return (
    <div className={`rounded-2xl border ${tone.border} ${tone.bg} p-4`}>
      <div className={`text-sm font-semibold ${tone.title}`}>{node.title}</div>
      <div className={`mt-2 text-sm ${tone.text} leading-relaxed`}>{node.text}</div>
    </div>
  );
};

const SectionView: React.FC<{ section: HowItWorksSection; level: number; linkTarget: '_self' | '_blank'; flashingId: string | null }> = ({ section, level, linkTarget, flashingId }) => {
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
            isFlashing ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'text-white',
          ].join(' ')}
        >
          {section.title}
        </HeadingTag>
        <div className="mt-3 space-y-3">
          {section.nodes.map((n, idx) => (
            <NodeView key={idx} node={n} linkTarget={linkTarget} />
          ))}
        </div>
      </div>

      {section.children && section.children.length > 0 ? (
        <div className="mt-6 space-y-6">
          {section.children.map((c) => (
            <SectionView key={c.id} section={c} level={3} linkTarget={linkTarget} flashingId={flashingId} />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export const HowItWorksDoc: React.FC<Props> = ({ className = '', showTitle = true, linkTarget = '_self' }) => {
  const navItems = useMemo(() => flattenSections(HOW_IT_WORKS_SECTIONS, 0), []);
  const [activeId, setActiveId] = useState<string>(HOW_IT_WORKS_SECTIONS[0]?.id ?? '');
  const contentRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const [sidebarHeight, setSidebarHeight] = useState<number>(0);
  const [flashingId, setFlashingId] = useState<string | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    if (!sidebarRef.current) return;
    setSidebarHeight(sidebarRef.current.offsetHeight);
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const scrollToIdInPane = (id: string, relativePos: number = 0) => {
    const el = document.getElementById(id);
    const container = contentRef.current;
    if (!el || !container) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const targetScroll = container.scrollTop + (elRect.top - containerRect.top) - containerRect.height * relativePos;
    container.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveId(id);

    const navRect = e.currentTarget.getBoundingClientRect();
    const sidebar = sidebarRef.current;
    if (sidebar) {
      const sidebarRect = sidebar.getBoundingClientRect();
      const relativePos = (navRect.top + navRect.height / 2 - sidebarRect.top) / sidebarRect.height;
      scrollToIdInPane(id, Math.max(0, Math.min(1, relativePos)));
    } else {
      scrollToIdInPane(id);
    }

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
    setActiveId(id);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nodes = navItems
      .map((i) => document.getElementById(i.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0));
        const first = visible[0]?.target as HTMLElement | undefined;
        if (first?.id) setActiveId(first.id);
      },
      { root: contentRef.current, rootMargin: '-20% 0px -70% 0px', threshold: [0, 1] }
    );

    for (const el of nodes) observer.observe(el);

    return () => observer.disconnect();
  }, [navItems]);

  return (
    <div className={`space-y-8 ${className}`}>
      {showTitle ? (
        <div className="px-5 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">How LiftShift works</h1>
          <p className="mt-2 text-slate-300">
            A user-friendly overview of the features, assumptions, and definitions behind the workout analytics dashboard.
          </p>
        </div>
      ) : null}

      <details className="lg:hidden mx-5 sm:mx-6 rounded-2xl border border-white/10 bg-black/20">
        <summary className="cursor-pointer select-none px-4 py-3 flex items-center justify-between text-sm font-semibold text-slate-200">
          Table of contents
          <ChevronDown className="w-4 h-4" />
        </summary>
        <div className="px-3 pb-3">
          <nav className="space-y-1">
            {navItems.map((i) => (
              <a
                key={i.id}
                href={`#${i.id}`}
                onClick={(e) => handleNavClick(e, i.id)}
                className="block rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {i.title}
              </a>
            ))}
          </nav>
        </div>
      </details>

      {/* Docs layout: sidebar (left) + content (right) */}
      <div className="flex items-start rounded-2xl overflow-hidden border border-slate-800/30 bg-black/20">
        {/* Sidebar */}
        <aside ref={sidebarRef} className="hidden lg:flex lg:flex-col w-[280px] shrink-0 border-r border-slate-800/40 bg-black/25">
          <div className="shrink-0 px-5 py-3.5 border-b border-slate-800/30">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Contents</span>
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
                    isParent ? 'text-[13px] font-semibold tracking-wide text-emerald-400' : 'text-[13px] text-slate-400',
                    isActive
                      ? 'text-emerald-200 bg-emerald-500/8'
                      : 'hover:text-emerald-300 hover:bg-white/[0.03]',
                  ].join(' ')}
                >
                  {i.title}
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto min-w-0 scroll-pt-8" style={{ maxHeight: sidebarHeight }}>
          <div className="max-w-3xl mx-auto px-8 py-10 space-y-14">
            {HOW_IT_WORKS_SECTIONS.map((s) => (
              <SectionView key={s.id} section={s} level={2} linkTarget={linkTarget} flashingId={flashingId} />
            ))}
            <div className="pb-16" />
          </div>
        </div>
      </div>
    </div>
  );
};
