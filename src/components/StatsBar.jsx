import { Users, Map, ShieldCheck, Star } from 'lucide-react';
import { PLATFORM_STATS } from '../data/treks';

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
    color: 'text-sky-400',
    bgColor: 'bg-sky-400/10',
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
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon, live, color, bgColor }, i) => (
          <div
            key={label}
            className={`
              glass-card animate-fadeInUp flex items-center gap-4 p-5
              animate-delay-${(i + 1) * 100}
              ${live ? 'animate-breathe' : ''}
            `}
          >
            {/* Icon */}
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bgColor} ${color}`}
            >
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className="gradient-text text-2xl font-bold leading-none"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {value}
                </span>
                {live && <span className="live-dot" />}
              </div>
              <span className="mt-1 text-xs font-medium text-slate-400">
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
