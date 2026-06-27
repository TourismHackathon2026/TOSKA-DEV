import { Users, Map, ShieldCheck, Star } from 'lucide-react';
import { PLATFORM_STATS } from '../data/treks';
import { useCountUp } from '../hooks/useCountUp';
import { useScrollReveal } from '../hooks/useScrollReveal';

function AnimatedStat({ label, value, icon: Icon, live, color, bgColor }) {
  const [counterRef, displayValue] = useCountUp(value, 1600);

  return (
    <div
      ref={counterRef}
      className="flex items-center gap-4 p-6 sm:p-7 glass-card card-lift transition-all duration-300"
      style={{
        borderRadius: '18px',
      }}
    >
      {/* Icon */}
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${bgColor} ${color}`}
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Content */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className="text-2xl sm:text-3xl font-bold leading-none"
            style={{ fontFamily: 'var(--font-heading)', color: '#1E293B' }}
          >
            {displayValue}
          </span>
          {live && <span className="live-dot" />}
        </div>
        <span
          className="mt-2 text-xs font-medium"
          style={{
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

const STATS = [
  {
    label: 'Active Trekkers',
    value: PLATFORM_STATS.activeNow,
    icon: Users,
    live: true,
    color: 'text-safety-green',
    bgColor: 'bg-safety-green/10',
  },
  {
    label: 'Total Treks',
    value: PLATFORM_STATS.totalTreks.toLocaleString(),
    icon: Map,
    live: false,
    color: 'text-[#00965E]',
    bgColor: 'bg-[#E5F5EE]',
  },
  {
    label: 'SOS Resolved',
    value: PLATFORM_STATS.sosResolved,
    icon: ShieldCheck,
    live: false,
    color: 'text-safety-orange',
    bgColor: 'bg-safety-orange/10',
  },
  {
    label: 'Avg Rating',
    value: PLATFORM_STATS.averageRating,
    icon: Star,
    live: false,
    color: 'text-safety-yellow',
    bgColor: 'bg-safety-yellow/10',
  },
];

export default function StatsBar() {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef} className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16 py-8 lg:py-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
        {STATS.map((stat) => (
          <AnimatedStat key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
