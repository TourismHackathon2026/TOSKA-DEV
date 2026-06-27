import { Link } from 'react-router-dom';
import { ArrowRight, Radio, Map, Globe } from 'lucide-react';
import { PLATFORM_STATS } from '../data/treks';
import { useScrollReveal } from '../hooks/useScrollReveal';

const STATS = [
  {
    label: 'Total Distance Tracked',
    value: PLATFORM_STATS.totalDistance,
    icon: Map,
    color: 'text-emerald-400',
  },
  {
    label: 'Avg Rescue Time',
    value: PLATFORM_STATS.rescueTime,
    icon: Radio,
    color: 'text-sky-400',
  },
  {
    label: 'Countries Served',
    value: String(PLATFORM_STATS.countriesServed),
    icon: Globe,
    color: 'text-purple-400',
  },
];

export default function CTASection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      id="cta-section"
      className="relative py-28 sm:py-36 lg:py-44 px-6 sm:px-10 lg:px-16 overflow-hidden"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 150, 94, 0.05) 0%, rgba(0, 150, 94, 0.02) 100%)',
        }}
      />

      <div ref={sectionRef} className="relative max-w-5xl mx-auto text-center">
        {/* ── Text ── */}
        <div className="mb-12 sm:mb-16">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 mb-7 leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Ready to Trek{' '}
            <span style={{ color: '#00965E' }}>Smarter?</span>
          </h2>
          <p className="text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-12" style={{ color: '#4B5563' }}>
            Join thousands of trekkers who trust TrailGuard Nepal for real-time GPS tracking,
            emergency SOS, and intelligent route planning across the Himalayas.
          </p>
        </div>

        {/* ── CTA Buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20 animate-fadeInUp animate-delay-100">
          <Link
            to="/explore"
            id="cta-start-tracking"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-base transition-all duration-300 btn-press focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 text-white"
            style={{
              background: 'linear-gradient(135deg, #00965E, #005A3C)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: '0 8px 20px rgba(0, 150, 94, 0.25)',
            }}
          >
            Start Free Tracking
            <ArrowRight size={20} />
          </Link>

          <Link
            to="/dashboard"
            id="cta-view-dashboard"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-base transition-all duration-300 btn-press focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 glass-card"
            style={{
              color: '#4B5563',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 150, 94, 0.3)';
              e.currentTarget.style.color = '#00965E';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
              e.currentTarget.style.color = '#4B5563';
            }}
          >
            View Live Dashboard
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto animate-fadeInUp animate-delay-200">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex flex-col items-center py-8 px-6 text-center rounded-2xl glass-card card-lift"
              >
                <Icon size={28} className={`${s.color} mb-4`} />
                <span
                  className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {s.value}
                </span>
                <span
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ color: '#64748B' }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
