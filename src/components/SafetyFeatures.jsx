import {
  ShieldCheck,
  PhoneCall,
  Navigation,
  CloudLightning,
  Shield,
  BatteryCharging,
  Users,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

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
  const headerRef = useScrollReveal();

  return (
    <section
      id="safety-features"
      className="py-24 sm:py-32 lg:py-40 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto"
    >
      {/* ── Header ── */}
      <div ref={headerRef} className="text-center mb-16 sm:mb-20 lg:mb-24">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-5 shadow-sm"
          style={{ background: '#E5F5EE', border: '1px solid #C2EAD9', color: '#00965E' }}
        >
          <ShieldCheck size={16} style={{ color: '#00965E' }} />
          Trek Safely
        </div>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 mb-6"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Safety First,{' '}
          <span style={{ color: '#00965E' }}>Always</span>
        </h2>
        <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#64748B' }}>
          Every feature is built to keep you safe in the most remote corners of the Himalayas.
        </p>
      </div>

      {/* ── Feature Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <article
              key={f.title}
              id={`safety-${f.title.toLowerCase().replace(/[\s&]+/g, '-')}`}
              className="p-8 relative overflow-hidden group rounded-2xl animate-fadeInUp transition-all duration-300 card-lift glass-card"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {/* Icon circle */}
              <div
                className={`relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${f.gradient} shadow-lg`}
                style={{ boxShadow: `0 8px 24px ${f.glow}` }}
              >
                <Icon size={28} className="text-white" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                {f.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
                {f.description}
              </p>

              {/* Gradient overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${f.glow} 0%, transparent 100%)`,
                  pointerEvents: 'none',
                }}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
