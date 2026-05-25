export { Page };

import React from 'react';
import { InfoShell } from '../../components/info/InfoShell';
import { Info } from 'lucide-react';
import { assetPath } from '../../constants';

const featureGroups = [
  {
    group: 'Training insights',
    image: '/images/misc/weeklyset.avif',
    alt: 'LiftShift interactive muscle heatmap with exercise drill-down and volume zone scoring',
    items: [
      'Interactive muscle heatmaps — click any muscle to see contributing exercises, with rolling 7-day windows and volume zone scoring.',
      'GitHub-style yearly consistency heatmap with streaks, consistency scores, and workout day highlights.',
      'Rolling window comparisons: last week vs. previous week, last month vs. previous month, on every metric.',
      'Training focus breakdown by rep ranges (strength / hypertrophy / endurance).',
    ],
  },
  {
    group: 'Progress tracking',
    image: '/images/misc/plateau.avif',
    alt: 'LiftShift exercise status labels: Getting stronger, Plateauing, or Taking a dip',
    items: [
      'Smart PR tracking — all-time bests, 2-month bests, premature PR detection, and PR drought alerts.',
      'Exercise status labels — Getting stronger, Plateauing, or Taking a dip — with confidence levels.',
      'Plateau detection with specific, actionable suggestions for what to change next session.',
    ],
  },
  {
    group: 'Coaching feedback',
    image: '/images/misc/setbyset.avif',
    alt: 'LiftShift set-by-set coaching feedback on every set in a workout',
    items: [
      'Set-by-set analysis — 19 scenarios with badges, tooltips, and improvement suggestions.',
      'AI-ready export — one-click structured data export with built-in analysis modules (junk volume audit, structural balance, joint health, and more).',
      'Weight-up / weight-down suggestions based on your actual performance quality.',
    ],
  },
  {
    group: 'Data tools',
    image: '/images/misc/calender.avif',
    alt: 'LiftShift calendar filtering with date range selection',
    items: [
      'Calendar filtering — pick any date range and all metrics recalculate for just that window.',
      'Combine data from Hevy, Strong, and Lyfta into one unified dashboard.',
      'Lifetime Progress — 9-tier per-muscle journey from Seedling to Legend.',
      'Flex cards — shareable year-in-review summaries of your training.',
    ],
  },
];

function Page() {
  return (
    <InfoShell
      activeNav="features"
      title="Features"
      subtitle="Everything LiftShift can do with your workout data. Connect Hevy, Strong, or Lyfta in seconds."
    >
      <div className="space-y-12">
        {featureGroups.map((g, idx) => (
          <section key={g.group}>
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${idx % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}>
              <div className={idx % 2 === 1 ? 'lg:[direction:ltr]' : ''}>
                <h2 className="text-lg font-semibold text-white mb-3">{g.group}</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-300 leading-relaxed">
                  {g.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 overflow-hidden bg-black/30 max-w-lg">
                <img
                  src={assetPath(g.image)}
                  alt={g.alt}
                  loading="lazy"
                  className="w-full"
                />
              </div>
            </div>
          </section>
        ))}

        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 mt-6">
          <div className="flex items-center gap-2 text-emerald-200 text-sm font-semibold mb-2">
            <Info className="w-4 h-4" />
            Full documentation
          </div>
          <p className="text-slate-300 text-sm">
            See <a href={assetPath('how-it-works/')} className="text-emerald-300 underline">How it works</a> for detailed explanations of every feature, metric definition, and design choice.
          </p>
        </div>
      </div>
    </InfoShell>
  );
}
