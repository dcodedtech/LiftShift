import React, { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../theme/ThemeProvider';
import { FANCY_FONT } from '../../../utils/ui/uiConstants';
import { assetPath } from '../../../constants';

interface ReviewsCarouselProps {
  className?: string;
}

const REVIEWS = [
  { src: assetPath('/carousel/7.avif'), label: 'RhubarbArtistic1335: "so well made, simply incredible. Hard to believe you\'re not a Hevy dev. Keep it up my man!"' },
  { src: assetPath('/carousel/6.avif'), label: 'suikyo1: "amazing work — the overload vs plateau breakdown is amazing, very well done"' },
  { src: assetPath('/carousel/4.avif'), label: 'marlon1310: "I didn\'t even realize you built it. Crazy stuff bro!! Post it in the Hevy subreddit"' },
  { src: assetPath('/carousel/11.avif'), label: '_Calegos: "finally a project I find easy to use, no mandatory API key or login"' },
  { src: assetPath('/carousel/10.avif'), label: 'cipherninjabyte: "outstanding — decoded my Hevy app data and gave me nice suggestions"' },
  { src: assetPath('/carousel/14.avif'), label: 'JustOneNodeOfMany: "excellent app, especially the plateau warnings and exercise history"' },
  { src: assetPath('/carousel/1.avif'), label: 'WearyStatus3898: "keep it up man. Insane work. I loved the UI and also the theme"' },
  { src: assetPath('/carousel/2.avif'), label: 'harshhat18: "bro this is crazy!!!! Now off to spend my next hour analysing my workouts on liftshift"' },
  { src: assetPath('/carousel/5.avif'), label: 'marlon1310: "this is damn amazing!!! I bought Hevy premium for advanced analytics but this does a better job — blessing you with gains"' },
  { src: assetPath('/carousel/8.avif'), label: 'Rasphy_2009: "this is so useful!! Thank you for your hard work, I\'m definitely going to use it a lot"' },
  { src: assetPath('/carousel/12.avif'), label: 'wakaokami: "a good initiative and a great way to visualize progress"' },
  { src: assetPath('/carousel/3.avif'), label: 'malicious08: "this is crazy bhai!"' },
  { src: assetPath('/carousel/9.avif'), label: 'Constant_play0: "super cool! Thanks a lot for this"' },
  { src: assetPath('/carousel/15.avif'), label: '1AML3G10N: "just checked this out, excellent work"' },
  { src: assetPath('/carousel/13.avif'), label: 'Conflicted_Gemini: "I don\'t need an analytical tool to tell me I\'ve been lazy this week"' },
  { src: assetPath('/carousel/16.avif'), label: 'Illustrious-Tear-542: "very nice analytics"' },
];

export const ReviewsCarousel: React.FC<ReviewsCarouselProps> = ({ className = '' }) => {
  const { mode } = useTheme();
  const isLight = mode === 'light';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 250);
  }, [isTransitioning]);

  const goNext = useCallback(() => {
    goToSlide((currentIndex + 1) % REVIEWS.length);
  }, [currentIndex, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide((currentIndex - 1 + REVIEWS.length) % REVIEWS.length);
  }, [currentIndex, goToSlide]);

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isTransitioning]);

  const handleManualNav = (index: number) => {
    goToSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 15 seconds
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  return (
    <div className={`relative ${className}`}>
      {/* SEO: All reviews as semantic HTML for crawlers and screen readers.
          Visually hidden so the carousel UI isn't cluttered. */}
      <section className="sr-only" aria-label="User reviews of LiftShift from Reddit">
        <h2>LiftShift reviews from Reddit users</h2>
        <ul>
          {REVIEWS.map((review, i) => (
            <li key={i}>
              <blockquote>
                <p>{review.label}</p>
              </blockquote>
            </li>
          ))}
        </ul>
      </section>

      {/* Section Header */}
      <div className="text-center mb-9">
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

      {/* Image — fixed 3.5:1 container (tallest image) keeps controls stable across slides */}
      <div onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
         <div className="aspect-[7/2] flex items-center justify-center p-1.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <img
                src={REVIEWS[currentIndex].src}
                alt={REVIEWS[currentIndex].label}
                className="w-full h-full object-contain rounded-xl"
                loading={currentIndex < 3 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>
          <img
            src={REVIEWS[(currentIndex + 1) % REVIEWS.length].src}
            alt=""
            aria-hidden="true"
            className="hidden"
            loading="lazy"
          />
        </div>

      {/* Quote — concise text visible to users and crawlers */}
      <p className={`text-center text-sm sm:text-base lg:text-lg italic leading-relaxed px-2 pt-4 sm:pt-5 max-w-3xl mx-auto ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
        {REVIEWS[currentIndex].label.replace(/^[^:]+:\s*"(.*)"$/, '$1')}
      </p>

      {/* Arrows — centered below the quote */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4">
        <button
          onClick={() => handleManualNav((currentIndex - 1 + REVIEWS.length) % REVIEWS.length)}
          className="p-1.5 sm:p-2 rounded-full border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
          aria-label="Previous review"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={() => handleManualNav((currentIndex + 1) % REVIEWS.length)}
          className="p-1.5 sm:p-2 rounded-full border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
          aria-label="Next review"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Dots — below the arrows */}
      <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3">
        {REVIEWS.map((_, index) => (
          <button
            key={index}
            onClick={() => handleManualNav(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex 
                ? 'w-8 h-2 bg-emerald-400' 
                : `w-2 h-2 ${isLight ? 'bg-slate-400 hover:bg-slate-500' : 'bg-neutral-600 hover:bg-neutral-500'}`
            }`}
            aria-label={`Go to review ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>
      </div>
      
    </div>
  );
};

export default ReviewsCarousel;
