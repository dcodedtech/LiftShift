import React, { useRef, useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import { FANCY_FONT } from '../../../utils/ui/uiConstants';
import { assetPath } from '../../../constants';
import { RedditCard } from './RedditCard';

interface ReviewsCarouselProps {
  className?: string;
}

interface ReviewData {
  src: string;
  label: string;
  username: string;
  quote: string;
}

const REVIEWS: ReviewData[] = [
  { src: assetPath('/carousel/7.avif'), label: 'RhubarbArtistic1335: "This is so well made. its simply incredible. Hard to believe your not a Hevy Dev. Lol / Keep it up my man !"' },
  { src: assetPath('/carousel/6.avif'), label: 'suikyo1: "Amazing work, my friend. Some time ago I had suggested that they make Hevy\'s home page very similan to what you did. It turned out really good. That part of the exercises showing which ones you\'re in overload and which ones you\'re in plateau is amazing, very well done."' },
  { src: assetPath('/carousel/4.avif'), label: 'marlon1310: "Oh wow. I didn\'t even realize you built it. I thought you were just sharing it. / Crazy stuff bro!! / Post it in hevy subreddit, I\'m sure there\'s so many people who\'d benefit from this."' },
  { src: assetPath('/carousel/11.avif'), label: '_Calegos: "Wow, simply wow! Finally a project that I find easy to use, no mandatory usage of api key or login (bless you for CSV import!), not yet tested the AI analyze but nonetheless this app is so cool, starred in an instant. / Other than that, kudos!"' },
  { src: assetPath('/carousel/10.avif'), label: 'cipherninjabyte: "This is outstanding.. it decoded my hevy app data and gave me nice suggestions."' },
  { src: assetPath('/carousel/14.avif'), label: 'JustOneNodeOfMany: "Excellent app, just what I have been waiting for and dreaming about, especially being able to see the exercise history easily. I love the way it throws up warnings re plateaus, etc. / Awesome app, thank you for developing."' },
  { src: assetPath('/carousel/1.avif'), label: 'WearyStatus3898: "keep it up man. Insane work. I loved the ui and also the theme."' },
  { src: assetPath('/carousel/2.avif'), label: 'harshhat18: "Bro this shit is crazy!!!! Now off to spend my next hour analysing my workouts on liftshift"' },
  { src: assetPath('/carousel/5.avif'), label: 'marlon1310: "I just tried it for a minute. This is damn amazing OP!!! I bought Hevy premium at Black Friday sale for the advanced analytics but even that doesn\'t do a good of a job like this app does. / For someone obsessed with numbers, this is a blessing!!!! / Blessing you with a lot of gains!!"' },
  { src: assetPath('/carousel/8.avif'), label: 'Rasphy_2009: "This is so useful!! Thank you for your hard work. I\'m definitely going to use it a lot"' },
  { src: assetPath('/carousel/12.avif'), label: 'wakaokami: "A good initiative and a great way to visualize progress. 🙌 / I was just wondering how you\'re handling passwords for the login feature, and how you\'re ensuring user privacy. / I haven\'t had time to go through the code yet, but I\'d like to contribute as well."' },
  { src: assetPath('/carousel/3.avif'), label: 'malicious08: "This is crazy bhai!"' },
  { src: assetPath('/carousel/9.avif'), label: 'Constant_play0: "Super cool! Thanks a lot for this"' },
  { src: assetPath('/carousel/15.avif'), label: '1AML3G10N: "Just checked this out. Excellent work!"' },
  { src: assetPath('/carousel/13.avif'), label: 'Conflicted_Gemini: "Look man. I don\'t need an analytical tool to tell me I\'ve beg lazy this week 😂😂😂"' },
  { src: assetPath('/carousel/16.avif'), label: 'Illustrious-Tear-542: "Very nice analytics."' },
].map((r) => {
  const match = r.label.match(/^(.+?):\s*"(.*)"$/);
  return {
    ...r,
    username: match ? match[1] : r.label,
    quote: match ? match[2] : r.label,
  };
});

const ROWS_DESKTOP = [REVIEWS.slice(0, 6), REVIEWS.slice(6, 11), REVIEWS.slice(11)];
const ROWS_MOBILE  = [REVIEWS.slice(0, 8), REVIEWS.slice(8)];

// ── CSS-keyframe marquee ──
// Uses <style> with unique animation name per row. hardware-accelerated via translate3d.
// CSS :hover pauses animation-play-state → no React state toggling → zero jerk.

function MarqueeRow({
  direction,
  items,
  isLight,
  speed = 40,
  flippedId,
  onFlip,
}: {
  direction: 'left' | 'right';
  items: ReviewData[];
  isLight: boolean;
  speed?: number;
  flippedId: string | null;
  onFlip: (id: string) => void;
}) {
  const uid = useRef(`mq-${Math.random().toString(36).slice(2, 8)}`).current;
  const from = direction === 'left' ? '0' : '-50';
  const to   = direction === 'left' ? '-50' : '0';
  const duration = `${Math.max(30, 110 - speed)}s`;

  const card = (review: ReviewData, key: string) => (
    <div key={key} className="mx-2 sm:mx-3 shrink-0">
      <RedditCard
        username={review.username}
        quote={review.quote}
        src={review.src}
        isLight={isLight}
        cardId={key}
        isFlipped={flippedId === key}
        onFlip={() => onFlip(key)}
      />
    </div>
  );

  return (
    <div className="relative overflow-hidden">
      <style>{`
        @keyframes ${uid} {
          0%   { transform: translate3d(${from}%, 0, 0); }
          100% { transform: translate3d(${to}%, 0, 0); }
        }
        .${uid} {
          display: flex;
          width: fit-content;
          animation: ${uid} ${duration} linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
        .${uid}:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className={uid}>
        {items.map((r) => card(r, r.src))}
        {items.map((r) => card(r, `${r.src}-clone`))}
      </div>
    </div>
  );
}

// ── Main component ──

export const ReviewsCarousel: React.FC<ReviewsCarouselProps> = ({ className = '' }) => {
  const { mode } = useTheme();
  const isLight = mode === 'light';
  const [isMobile, setIsMobile] = useState(false);
  const [flippedId, setFlippedId] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    update(mq);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const rows = isMobile ? ROWS_MOBILE : ROWS_DESKTOP;
  const handleFlip = (id: string) => setFlippedId((prev) => (prev === id ? null : id));

  return (
    <div className={`relative ${className}`}>
      <section className="mb-9" aria-label="User reviews of LiftShift from Reddit">
        <h2 className="sr-only">LiftShift reviews from Reddit users</h2>
        <ul className="sr-only">
          {REVIEWS.map((review, i) => (
            <li key={i}>
              <blockquote>
                <p>{review.label}</p>
              </blockquote>
            </li>
          ))}
        </ul>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Quote className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Community Feedback</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 ${isLight ? 'text-slate-900' : ''}`}>
            Loved by <span className="text-emerald-400" style={FANCY_FONT}>Lifters</span> Worldwide
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            See what the fitness community is saying about LiftShift on Reddit
          </p>
        </div>
      </section>

      {/* Full-width marquee — breaks out of parent container, masked fade on edges */}
      <div className="relative" style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        maskImage: 'linear-gradient(to right, transparent, black 18vw, black 82vw, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 18vw, black 82vw, transparent)',
      }}>
        <div className="space-y-3 sm:space-y-4">
          {rows.map((row, i) => (
            <MarqueeRow
              key={i}
              direction={i % 2 === 0 ? 'left' : 'right'}
              isLight={isLight}
              speed={25 + i * 5}
              items={row}
              flippedId={flippedId}
              onFlip={handleFlip}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsCarousel;
