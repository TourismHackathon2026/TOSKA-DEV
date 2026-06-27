import { Link } from 'react-router-dom';
import { ArrowRight, Radio, Map, Globe } from 'lucide-react';
import { PLATFORM_STATS } from '../data/treks';

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
  return (
    <section
      id="cta-section"
      className="relative py-24 sm:py-32 px-6 sm:px-10 lg:px-16 overflow-hidden"
    >
      <div className="relative max-w-4xl mx-auto text-center">
        {/* ── Text ── */}
        <div className="animate-fadeInUp">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Ready to Trek{' '}
            <span style={{ color: '#5BB4FF' }}>Smarter?</span>
          </h2>
          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: '#8E8E9A' }}>
            Join thousands of trekkers who trust TrailGuard Nepal for real-time GPS tracking,
            emergency SOS, and intelligent route planning across the Himalayas.
          </p>
        </div>

        {/* ── CTA Buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fadeInUp animate-delay-100">
          <Link
            to="/explore"
            id="cta-start-tracking"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:scale-[1.03] hover:brightness-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
            style={{
              background: '#5BB4FF',
              color: '#000',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Start Free Tracking
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/dashboard"
            id="cta-view-dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-[1.03] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            style={{
              background: 'transparent',
              border: '1px solid #2A2A2A',
              color: '#8E8E9A',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#5BB4FF';
              e.currentTarget.style.color = '#FFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2A2A2A';
              e.currentTarget.style.color = '#8E8E9A';
            }}
          >
            View Live Dashboard
          </Link>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto animate-fadeInUp animate-delay-200">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex flex-col items-center py-6 px-4 text-center rounded-xl"
                style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
              >
                <Icon size={20} className={`${s.color} mb-2`} />
                <span
                  className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {s.value}
                </span>
                <span
                  className="text-[11px] uppercase tracking-widest font-medium"
                  style={{ color: '#8E8E9A' }}
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
