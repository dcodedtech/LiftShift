export { Page };

import React from 'react';
import { InfoShell } from '../../components/info/InfoShell';
import { assetPath } from '../../constants';

function Page() {
  return (
    <InfoShell
      title="Hevy vs Lyfta &mdash; which workout tracker should you use?"
      subtitle="Both Hevy and Lyfta are excellent workout loggers. But neither gives you deep analytics. Here's a practical comparison of the two apps, plus how LiftShift &mdash; a free and open source analytics tool &mdash; fills the gap both leave behind."
      activeNav={null}
    >
      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Quick comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-4 text-white font-semibold">Feature</th>
                  <th className="py-2 pr-4 text-white font-semibold">Hevy</th>
                  <th className="py-2 text-white font-semibold">Lyfta</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">Workout logging</td>
                  <td className="py-2 pr-4">Excellent, polished UI</td>
                  <td className="py-2">Excellent, modern UI</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">Exercise library</td>
                  <td className="py-2 pr-4">Large, with exercise GIFs</td>
                  <td className="py-2">Large, with video demos</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">RPE/RIR tracking</td>
                  <td className="py-2 pr-4">Yes (RPE)</td>
                  <td className="py-2">Yes (RIR)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">Routine builder</td>
                  <td className="py-2 pr-4">Yes, flexible</td>
                  <td className="py-2">Yes, plan-based</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">Social features</td>
                  <td className="py-2 pr-4">Yes (feed, followers)</td>
                  <td className="py-2">Community features</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">Built-in analytics</td>
                  <td className="py-2 pr-4">Basic charts</td>
                  <td className="py-2">Basic charts</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-4">CSV export</td>
                  <td className="py-2 pr-4">Yes</td>
                  <td className="py-2">Yes</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">API access</td>
                  <td className="py-2 pr-4">Yes (REST API + OAuth)</td>
                  <td className="py-2">No public API</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">When to choose Hevy</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed">
            <li>You want the most polished workout logging experience with exercise GIFs, a large community, and social features.</li>
            <li>You care about API access &mdash; Hevy&rsquo;s REST API lets LiftShift sync your data automatically without CSV files.</li>
            <li>You want the best support for programs, routines, and workout templates.</li>
            <li>You&rsquo;re on iOS and want Apple Watch support for logging.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">When to choose Lyfta</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed">
            <li>You prefer a cleaner, more modern interface with video exercise demos.</li>
            <li>You use RIR (reps in reserve) instead of RPE for intensity tracking.</li>
            <li>You like plan-based workout structures rather than freeform routines.</li>
            <li>You&rsquo;re comfortable importing via CSV into LiftShift for analytics.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">What both lack</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Neither Hevy nor Lyfta provides deep analytics. Both show you basic line charts of your training history, but neither tells you whether your muscles are balanced, whether you&rsquo;re plateauing, what your set quality looks like, or how to interpret your data. They&rsquo;re loggers, not analysts.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed">
            <li>No muscle heatmaps or volume zone scoring.</li>
            <li>No plateau detection or exercise status labels.</li>
            <li>No set-by-set feedback or coaching suggestions.</li>
            <li>No AI-ready export with structured analysis modules.</li>
            <li>No way to combine data if you switch apps or use both.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">How LiftShift makes either better</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            LiftShift plugs into either app and adds the analytics layer both are missing. Connect Hevy via API for automatic sync, or upload a CSV from Hevy or Lyfta. You get the same dashboard regardless of which app you use &mdash; and if you&rsquo;ve used both, LiftShift merges the data.
          </p>
          <p className="text-slate-300 leading-relaxed mb-4">
            See the <a href={assetPath('how-it-works/')} className="text-slate-400 hover:text-emerald-300 hover:underline transition-all duration-200">How it works</a> guide for a full walkthrough of every feature.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Bottom line</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Both Hevy and Lyfta are great workout loggers. The difference comes down to polish vs. simplicity, and API access vs. manual CSV imports. Either way, LiftShift works with both &mdash; so pick the logger you enjoy using, and let LiftShift handle the analytics.
          </p>
        </section>

        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 mt-6">
          <p className="text-slate-300 text-sm">
            Ready to see what your training data actually says? <a href={assetPath('/')} className="text-slate-400 hover:text-emerald-300 hover:underline transition-all duration-200">Open the dashboard</a> and connect Hevy or upload a CSV from Strong or Lyfta. It&rsquo;s free and takes under a minute.
          </p>
        </div>
      </div>
    </InfoShell>
  );
}
