export { Page };

import React from 'react';
import { InfoShell } from '../../components/info/InfoShell';
import { assetPath } from '../../constants';

const sections = [
  {
    title: 'Are your muscles balanced?',
    image: '/images/misc/weeklyset.avif',
    alt: 'LiftShift interactive muscle heatmap showing training balance',
    content: (
      <>
        <p className="text-slate-300 leading-relaxed mb-4">
          Most apps show a basic body map or a list of exercises grouped by day. None of them tell you: <strong>&ldquo;You train chest 3x more than back.&rdquo;</strong>
        </p>
        <p className="text-slate-300 leading-relaxed mb-4">
          LiftShift&rsquo;s interactive muscle heatmap uses rolling 7-day windows to match real recovery patterns. Click any muscle to see exactly which exercises contribute. Primary and secondary muscle involvement is weighted separately. You get a weekly sets-per-muscle breakdown with volume zone scoring (maintenance, growth, or overreaching) personalized to your training age.
        </p>
      </>
    ),
  },
  {
    title: 'Are you actually getting stronger?',
    image: '/images/misc/plateau.avif',
    alt: 'LiftShift exercise status labels with plateau detection',
    content: (
      <>
        <p className="text-slate-300 leading-relaxed mb-4">
          Your app might show a line chart of your bench press over time. But it won&rsquo;t tell you if you&rsquo;re plateauing, regressing, or making real progress — and it certainly won&rsquo;t tell you <em>what to do about it</em>.
        </p>
        <p className="text-slate-300 leading-relaxed mb-4">
          LiftShift labels every exercise with a clear status: <strong>Getting stronger, Plateauing, Taking a dip,</strong> or <strong>New.</strong> When you&rsquo;re stuck, you get a tiny actionable suggestion: &ldquo;add 1 rep to your first set&rdquo; or &ldquo;bump the weight 2.5 kg.&rdquo; It also detects premature PRs (big jumps you couldn&rsquo;t sustain) and PR droughts (no new best in over 2 weeks).
        </p>
      </>
    ),
  },
  {
    title: 'What happened inside your last workout?',
    image: '/images/misc/setbyset.avif',
    alt: 'LiftShift set-by-set coaching feedback across 19 scenarios',
    content: (
      <>
        <p className="text-slate-300 leading-relaxed mb-4">
          Your logging app shows sets and reps. It doesn&rsquo;t tell you that your third set dropped too fast, or that your weight jump was premature, or that your back-off set was an effective way to add volume.
        </p>
        <p className="text-slate-300 leading-relaxed mb-4">
          LiftShift gives <strong>set-by-set coaching feedback</strong> across 19 scenarios. Each set gets a short badge (&ldquo;Normal Fatigue,&rdquo; &ldquo;Too Aggressive,&rdquo; &ldquo;Good Reset&rdquo;) and a tooltip with exact numbers. Beginners learn how to progress faster. Experienced lifters spot patterns they&rsquo;d miss.
        </p>
      </>
    ),
  },
  {
    title: 'What if you could ask an AI about your training?',
    image: '/images/misc/AI.avif',
    alt: 'LiftShift AI-ready training data export',
    content: (
      <p className="text-slate-300 leading-relaxed mb-4">
        LiftShift can export your full structured training data — sets, exercise stats, trends — in a format designed for AI analysis. Paste it into any AI and ask anything: &ldquo;Do I have any junk volume?&rdquo; &ldquo;Is my push-pull ratio healthy?&rdquo; &ldquo;Are my elbows at risk?&rdquo; Or write your own custom prompt.
      </p>
    ),
  },
  {
    title: 'What about comparing different training blocks?',
    image: '/images/misc/calender.avif',
    alt: 'LiftShift calendar filtering for date range comparisons',
    content: (
      <p className="text-slate-300 leading-relaxed mb-4">
        Most apps show you all-time data or a fixed window. LiftShift&rsquo;s <strong>calendar filtering</strong> lets you pick any date range — last month, all of 2025, a single week — and every chart, metric, and insight recalculates for just that window. Compare blocks of training in seconds.
      </p>
    ),
  },
];

function Page() {
  return (
    <InfoShell
      title="What your workout app doesn't tell you"
      subtitle="Hevy, Strong, and Lyfta are great at logging your workouts. But when it comes to understanding what your data actually means, their built-in charts leave you guessing."
      activeNav={null}
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Your app logs the work. Here&rsquo;s what it misses.</h2>

          {sections.map((s) => (
            <div key={s.title} className="mt-8">
              <h3 className="text-base font-semibold text-slate-200 mb-3">{s.title}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div>{s.content}</div>
<div className="rounded-xl border border-white/10 overflow-hidden bg-black/30 max-w-lg">
                  <img
                    src={assetPath(s.image)}
                    alt={s.alt}
                    loading="lazy"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 mt-6">
          <h2 className="text-base font-semibold text-emerald-200 mb-2">Try LiftShift</h2>
          <p className="text-slate-300 text-sm mb-3">All of the above is completely free. No account needed. Your data never leaves your browser.</p>
          <a href={assetPath('/')} className="text-emerald-300 underline text-sm">Open LiftShift →</a>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">What about combining apps?</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Switched from Strong to Hevy? Or use both? LiftShift merges data from multiple sources into one unified dashboard. Your exercise names are normalized automatically. No manual spreadsheet merging.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Lifetime Progress tracking</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <p className="text-slate-300 leading-relaxed">
              Every muscle gets a 9-tier journey from <strong>Seedling</strong> to <strong>Legend</strong> based on your cumulative sets. See estimated time to your next milestone. It gamifies consistency — and shows you which muscles have the deepest training history.
            </p>
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/30 max-w-lg">
              <img
                src={assetPath('/images/misc/hypertrophy.avif')}
                alt="LiftShift lifetime progress and muscle journey tiers"
                loading="lazy"
                className="w-full"
              />
            </div>
          </div>
        </section>
      </div>
    </InfoShell>
  );
}
