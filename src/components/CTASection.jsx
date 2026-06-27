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
      {/* ── Radial gradient glow background ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(61,122,71,0.15) 0%, rgba(10,126,245,0.08) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(130,140,248,0.1) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* ── Text ── */}
        <div className="animate-fadeInUp">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Ready to Trek{' '}
            <span className="gradient-text">Smarter?</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Join thousands of trekkers who trust TrailGuard Nepal for real-time GPS tracking,
            emergency SOS, and intelligent route planning across the Himalayas.
          </p>
        </div>

        {/* ── CTA Buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fadeInUp animate-delay-100">
          <Link
            to="/explore"
            id="cta-start-tracking"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-nature-500 text-white font-bold text-base tracking-wide transition-all duration-300 hover:bg-nature-400 hover:scale-[1.03] hover:shadow-[0_0_28px_rgba(61,122,71,0.45)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-nature-400/60"
          >
            Start Free Tracking
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/dashboard"
            id="cta-view-dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl glass text-slate-200 font-semibold text-base tracking-wide border border-white/10 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-[1.03] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
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
                className="glass-card flex flex-col items-center py-6 px-4 text-center"
              >
                <Icon size={20} className={`${s.color} mb-2`} />
                <span
                  className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {s.value}
                </span>
                <span className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">
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
