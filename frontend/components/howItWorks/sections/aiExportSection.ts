import type { HowItWorksSection } from '../utils/howItWorksTypes';

export const AI_EXPORT_SECTION: HowItWorksSection = {
  id: 'ai-export',
  title: 'AI export & sharing',
  sidebarTitle: 'AI export',
  nodes: [
    {
      type: 'p',
      text:
        'LiftShift can export your full structured training data in a format designed for AI analysis. Pick a timeframe, optionally select analysis modules, then paste into any AI tool and ask your own questions.',
    },
  ],
  children: [
    {
      id: 'ai-export-how',
      title: 'How to use it',
      sidebarTitle: 'How to use it',
      nodes: [
        {
          type: 'ul',
          items: [
            'Choose your timeframe: last session, 1 month, 3 months, 6 months, or all data.',
            'Optionally select analysis modules (see below). Leaving them all unchecked exports raw logs only.',
            'Click "Generate Prompt" to build a structured prompt + data. The formatted output is copied to your clipboard.',
            'Paste into any AI tool (ChatGPT, Claude, Gemini, etc.) and get a custom analysis.',
          ],
        },
      ],
    },
    {
      id: 'ai-modules',
      title: 'Built-in analysis modules',
      sidebarTitle: 'Analysis modules',
      nodes: [
        {
          type: 'p',
          text:
            'You can include up to 8 pre-built analysis modules in your prompt:',
        },
        {
          type: 'ul',
          items: [
            'General Deep Audit: comprehensive overview, highest-impact changes.',
            'Redundancy Check: flag overlapping exercises, suggest swaps.',
            'Junk Volume Audit: identify exercises where you\'re adding sets but not progressing.',
            'Intensity Drift: detect if volume is maintained but intensity is dropping.',
            'Structural Balance: push-to-pull ratios, muscle group balance.',
            'Fatigue Correlation: heavy lifts impacting subsequent sessions ~48h later.',
            'Joint Health Audit: scan for joint irritation risks (elbows, shoulders, knees, back).',
            'Unilateral Balance Check: left/right asymmetry detection (> 10% imbalance).',
          ],
        },
        {
          type: 'p',
          text:
            'The prompt also includes your training experience level (beginner/intermediate/advanced), determined automatically from your total training history and session count.',
        },
      ],
    },
    {
      id: 'ai-privacy',
      title: 'Privacy note',
      sidebarTitle: 'Privacy note',
      nodes: [
        {
          type: 'p',
          text:
            'The export is generated in your browser. Nothing is sent to LiftShift servers. When you paste into an AI tool, you control what data is shared. See the Privacy section for more details.',
        },
      ],
    },
  ],
};
