import {
  ShieldCheck,
  PhoneCall,
  Navigation,
  CloudLightning,
  Shield,
  BatteryCharging,
  Users,
} from 'lucide-react';

const FEATURES = [
  {
    icon: PhoneCall,
    title: 'SOS & Emergency Rescue',
    description: 'One-tap SOS with helicopter rescue coordination and real-time GPS broadcast to local emergency teams.',
    gradient: 'from-red-500 to-orange-500',
    glow: 'rgba(239, 68, 68, 0.25)',
  },
  {
    icon: Navigation,
    title: 'Real-Time GPS Tracking',
    description: 'Live position, speed, and altitude monitoring with breadcrumb trail history across all devices.',
    gradient: 'from-sky-500 to-cyan-400',
    glow: 'rgba(10, 126, 245, 0.25)',
  },
  {
    icon: CloudLightning,
    title: 'Weather Alerts',
    description: 'Severe weather and lightning detection with predictive storm tracking for mountain regions.',
    gradient: 'from-amber-400 to-yellow-500',
    glow: 'rgba(251, 191, 36, 0.25)',
  },
  {
    icon: Shield,
    title: 'Geofence Protection',
    description: 'Automatic route deviation warnings and danger zone alerts when trekkers enter risky areas.',
    gradient: 'from-purple-500 to-indigo-500',
    glow: 'rgba(139, 92, 246, 0.25)',
  },
  {
    icon: BatteryCharging,
    title: 'Battery Smart Mode',
    description: 'Auto power-saving with dead-reckoning navigation and intelligent GPS polling to extend battery life.',
    gradient: 'from-emerald-500 to-green-400',
    glow: 'rgba(34, 197, 94, 0.25)',
  },
  {
    icon: Users,
    title: 'Group Sync',
    description: 'Group tracking, supply sharing dashboard, and real-time chat for coordinated team trekking.',
    gradient: 'from-pink-500 to-rose-500',
    glow: 'rgba(236, 72, 153, 0.25)',
  },
];

export default function SafetyFeatures() {
  return (
    <section
      id="safety-features"
      className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto"
    >
      {/* ── Header ── */}
      <div className="text-center mb-12 sm:mb-16 animate-fadeInUp">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-emerald-300 font-medium mb-5">
          <ShieldCheck size={16} className="text-emerald-400" />
          Trek Safely
        </div>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Safety First,{' '}
          <span className="gradient-text">Always</span>
        </h2>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Every feature is built to keep you safe in the most remote corners of the Himalayas.
        </p>
      </div>

      {/* ── Feature Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <article
              key={f.title}
              id={`safety-${f.title.toLowerCase().replace(/[\s&]+/g, '-')}`}
              className="glass-card p-6 relative overflow-hidden group animate-fadeInUp"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Hover glow */}
              <div
                className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${f.glow}, transparent 70%)` }}
              />

              {/* Icon circle */}
              <div
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${f.gradient} shadow-lg`}
                style={{ boxShadow: `0 4px 20px ${f.glow}` }}
              >
                <Icon size={24} className="text-white" strokeWidth={1.8} />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {f.title}
              </h3>

              {/* Description */}
              <p className="text-slate-400 text-sm leading-relaxed">
                {f.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
