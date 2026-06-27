import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, Radio } from 'lucide-react';
import { HERO_SLIDES } from '../data/images';

const ROTATE_INTERVAL = 6000;
const FEATURE_PILLS = [
  { emoji: '\uD83D\uDEF0\uFE0F', label: 'Real-Time GPS' },
  { emoji: '\uD83C\uDD98', label: 'Instant SOS' },
  { emoji: '\uD83C\uDF24\uFE0F', label: 'Weather Intel' },
];

function renderAccentTitle(title) {
  const words = title.split(' ');
  if (words.length <= 2) return <span style={{ color: '#5BB4FF' }}>{title}</span>;
  const plain = words.slice(0, -2).join(' ');
  const highlighted = words.slice(-2).join(' ');
  return <>{plain}{' '}<span style={{ color: '#5BB4FF' }}>{highlighted}</span></>;
}

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const goTo = useCallback((index) => setActiveIndex(index), []);
  const goNext = useCallback(() => setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length), []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, goNext]);

  const slide = HERO_SLIDES[activeIndex];

  return (
    <section id="hero" className="relative w-full h-screen min-h-[600px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}
    >
      {HERO_SLIDES.map((s, i) => (
        <img key={i} src={s.image} alt={s.title}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: i === activeIndex ? 1 : 0, zIndex: 0 }}
          loading={i === 0 ? 'eager' : 'lazy'} draggable={false}
        />
      ))}

      <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 50%, #000 100%)' }} />

      <div className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="max-w-3xl">
          <div key={`loc-${activeIndex}`} className="animate-fadeInUp flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase"
              style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#8E8E9A' }}
            >
              <MapPin size={14} style={{ color: '#5BB4FF' }} />
              {slide.location}
            </span>
          </div>

          <h1 key={`title-${activeIndex}`}
            className="animate-fadeInUp animate-delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight text-white mb-5"
            style={{ fontFamily: 'var(--font-heading)' }}
          >{renderAccentTitle(slide.title)}</h1>

          <p key={`sub-${activeIndex}`}
            className="animate-fadeInUp animate-delay-200 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed mb-8"
            style={{ color: '#8E8E9A' }}
          >{slide.subtitle}</p>

          <div key={`cta-${activeIndex}`} className="animate-fadeInUp animate-delay-300 flex flex-wrap gap-4 mb-10">
            <Link to="/explore" id="hero-explore-treks"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-85 active:scale-[0.98]"
              style={{ background: '#5BB4FF', color: '#000' }}
            >
              Explore Treks
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/dashboard" id="hero-live-dashboard"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all hover:border-[#5BB4FF] active:scale-[0.98]"
              style={{ border: '1px solid #2A2A2A', color: '#8E8E9A', background: 'transparent' }}
            >
              <Radio size={14} style={{ color: '#30D158' }} className="animate-pulse" />
              Live Dashboard
            </Link>
          </div>

          <div key={`pills-${activeIndex}`} className="animate-fadeInUp animate-delay-500 flex flex-wrap gap-3">
            {FEATURE_PILLS.map((pill) => (
              <span key={pill.label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-colors"
                style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#8E8E9A' }}
              >
                <span className="text-sm">{pill.emoji}</span>
                {pill.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5">
        {HERO_SLIDES.map((_, i) => (
          <button key={i} id={`hero-dot-${i}`} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`}
            className="relative h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: i === activeIndex ? 36 : 10, background: i === activeIndex ? '#5BB4FF' : '#444' }}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 z-[2] pointer-events-none"
        style={{ background: 'linear-gradient(to top, #000 0%, transparent 100%)' }}
      />
    </section>
  );
}
