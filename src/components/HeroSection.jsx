import { useState, useEffect, useCallback } from 'react';
import { MapPin, ChevronRight, Radio } from 'lucide-react';
import { HERO_SLIDES } from '../data/images';

const ROTATE_INTERVAL = 6000;

const FEATURE_PILLS = [
  { emoji: '🛰️', label: 'Real-Time GPS' },
  { emoji: '🆘', label: 'Instant SOS' },
  { emoji: '🌤️', label: 'Weather Intel' },
];

/**
 * Extracts the first and last word(s) of a title to apply gradient styling.
 * Returns JSX with the "keyword" portion wrapped in a gradient-text span.
 */
function renderGradientTitle(title) {
  const words = title.split(' ');
  if (words.length <= 2) {
    return <span className="gradient-text">{title}</span>;
  }
  // Highlight the last two words
  const plain = words.slice(0, -2).join(' ');
  const highlighted = words.slice(-2).join(' ');
  return (
    <>
      {plain}{' '}
      <span className="gradient-text">{highlighted}</span>
    </>
  );
}

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((index) => {
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, goNext]);

  const slide = HERO_SLIDES[activeIndex];

  return (
    <section
      id="hero"
      className="relative w-full h-screen min-h-[600px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Background Images with Crossfade ── */}
      {HERO_SLIDES.map((s, i) => (
        <img
          key={i}
          src={s.image}
          alt={s.title}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: i === activeIndex ? 1 : 0, zIndex: 0 }}
          loading={i === 0 ? 'eager' : 'lazy'}
          draggable={false}
        />
      ))}

      {/* ── Dark Overlay Gradient ── */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(6,8,12,0.55) 0%, rgba(6,8,12,0.7) 50%, var(--color-surface-950) 100%)',
        }}
      />
      {/* Side vignette */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to right, rgba(6,8,12,0.6) 0%, transparent 50%, rgba(6,8,12,0.3) 100%)',
        }}
      />

      {/* ── Hero Content ── */}
      <div className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="max-w-3xl">
          {/* Location Badge */}
          <div
            key={`loc-${activeIndex}`}
            className="animate-fadeInUp flex items-center gap-2 mb-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase glass text-nature-300 border-nature-700/40">
              <MapPin size={14} className="text-nature-400" />
              {slide.location}
            </span>
          </div>

          {/* Title */}
          <h1
            key={`title-${activeIndex}`}
            className="animate-fadeInUp animate-delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight text-white mb-5"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {renderGradientTitle(slide.title)}
          </h1>

          {/* Subtitle */}
          <p
            key={`sub-${activeIndex}`}
            className="animate-fadeInUp animate-delay-200 text-base sm:text-lg md:text-xl text-slate-300/90 max-w-xl leading-relaxed mb-8"
          >
            {slide.subtitle}
          </p>

          {/* CTAs */}
          <div
            key={`cta-${activeIndex}`}
            className="animate-fadeInUp animate-delay-300 flex flex-wrap gap-4 mb-10"
          >
            <button
              id="hero-explore-treks"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm tracking-wide
                         bg-nature-500 hover:bg-nature-400 text-white shadow-lg shadow-nature-500/25
                         transition-all duration-300 hover:shadow-nature-400/40 hover:scale-[1.03] active:scale-[0.98]"
            >
              Explore Treks
              <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
            <button
              id="hero-live-dashboard"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm tracking-wide
                         glass border border-white/15 text-white hover:border-white/30
                         transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              <Radio size={16} className="text-safety-green animate-pulse" />
              Live Dashboard
            </button>
          </div>

          {/* Feature Pills */}
          <div
            key={`pills-${activeIndex}`}
            className="animate-fadeInUp animate-delay-500 flex flex-wrap gap-3"
          >
            {FEATURE_PILLS.map((pill) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium
                           bg-white/[0.06] border border-white/[0.08] text-slate-300
                           backdrop-blur-md hover:bg-white/[0.1] transition-colors duration-300"
              >
                <span className="text-sm">{pill.emoji}</span>
                {pill.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Slide Indicator Dots ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            id={`hero-dot-${i}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`relative h-2.5 rounded-full transition-all duration-500 ease-out
              ${
                i === activeIndex
                  ? 'w-9 bg-nature-400 shadow-[0_0_12px_rgba(98,158,108,0.5)]'
                  : 'w-2.5 bg-white/25 hover:bg-white/45'
              }`}
          />
        ))}
      </div>

      {/* ── Bottom Gradient Fade ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-[2] pointer-events-none"
        style={{
          background: 'linear-gradient(to top, var(--color-surface-950) 0%, transparent 100%)',
        }}
      />
    </section>
  );
}
