import { Radio, Mountain, Battery, Gauge, AlertTriangle, CloudLightning, MapPin, Shield, Zap } from 'lucide-react';
import { ACTIVE_TREKKERS, ALERTS } from '../data/treks';

/**
 * Returns a pseudo-random position (%) for each trekker on the simulated map.
 * Uses a deterministic seed from the trekker id so dots stay stable across renders.
 */
function trekkerPosition(trekker) {
  const seed = trekker.id * 7919; // prime-based seed
  const x = ((seed * 13) % 80) + 10;  // 10–90 %
  const y = ((seed * 29) % 70) + 15;  // 15–85 %
  return { x, y };
}

/** Status dot color */
function statusColor(status) {
  if (status === 'critical') return 'bg-safety-red';
  if (status === 'warning') return 'bg-safety-orange';
  return 'bg-safety-green';
}

/** Status text color */
function statusTextColor(status) {
  if (status === 'critical') return 'text-red-400';
  if (status === 'warning') return 'text-orange-400';
  return 'text-emerald-400';
}

/** Alert severity badge */
function severityBadge(severity) {
  const map = {
    critical: 'bg-red-500/15 text-red-400 border-red-500/25',
    warning: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    info: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  };
  return map[severity] || map.info;
}

/** Alert icon */
function alertIcon(type) {
  switch (type) {
    case 'sos': return <AlertTriangle size={14} />;
    case 'weather': return <CloudLightning size={14} />;
    case 'battery': return <Battery size={14} />;
    case 'geofence': return <Shield size={14} />;
    case 'deviation': return <MapPin size={14} />;
    default: return <Zap size={14} />;
  }
}

export default function LiveDashboard() {
  return (
    <section
      id="live-dashboard"
      className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto"
    >
      {/* ── Header ── */}
      <div className="text-center mb-12 sm:mb-16 animate-fadeInUp">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-emerald-300 font-medium mb-5">
          <Radio size={16} className="text-emerald-400" />
          <span className="relative flex items-center gap-1.5">
            <span className="live-dot" />
            Live
          </span>
        </div>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Live Monitoring{' '}
          <span className="gradient-text">Dashboard</span>
        </h2>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Real-time tracking of all active trekkers across Nepal's Himalayan trails.
        </p>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Simulated Map (spans 3 cols on desktop) ── */}
        <div
          className="lg:col-span-3 glass-card overflow-hidden animate-fadeInUp"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center gap-2 px-5 pt-5 pb-3">
            <Mountain size={16} className="text-nature-400" />
            <span className="text-sm font-semibold text-white tracking-wide">Topographic View</span>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <span className="live-dot" /> Live
            </span>
          </div>

          {/* Map area */}
          <div
            className="relative w-full min-h-[400px] sm:min-h-[440px]"
            style={{
              background: `
                linear-gradient(145deg, var(--color-surface-900) 0%, rgba(26,35,50,1) 60%, rgba(36,48,66,1) 100%)
              `,
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px),
                radial-gradient(ellipse at 30% 50%, rgba(61,122,71,0.08) 0%, transparent 60%),
                radial-gradient(ellipse at 70% 30%, rgba(10,126,245,0.06) 0%, transparent 50%)
              `,
              backgroundSize: '32px 32px, 32px 32px, 100% 100%, 100% 100%',
            }}
          >
            {/* Contour-style decorative rings */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute top-[20%] left-[25%] w-40 h-32 rounded-full border border-white/[0.03] rotate-12" />
              <div className="absolute top-[28%] left-[28%] w-28 h-20 rounded-full border border-white/[0.04] rotate-12" />
              <div className="absolute top-[50%] right-[20%] w-52 h-36 rounded-full border border-white/[0.03] -rotate-6" />
              <div className="absolute top-[55%] right-[24%] w-36 h-24 rounded-full border border-white/[0.04] -rotate-6" />
            </div>

            {/* Trekker dots */}
            {ACTIVE_TREKKERS.map((t) => {
              const pos = trekkerPosition(t);
              const color =
                t.status === 'critical'
                  ? 'bg-safety-red shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                  : t.status === 'warning'
                  ? 'bg-safety-orange shadow-[0_0_12px_rgba(255,107,53,0.5)]'
                  : 'bg-safety-green shadow-[0_0_10px_rgba(34,197,94,0.5)]';

              return (
                <div
                  key={t.id}
                  className="absolute group"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  {/* Ping ring */}
                  <span
                    className={`absolute -inset-2 rounded-full opacity-30 animate-breathe ${
                      t.status === 'critical' ? 'bg-red-500' : t.status === 'warning' ? 'bg-orange-500' : 'bg-emerald-500'
                    }`}
                  />
                  {/* Dot */}
                  <span className={`relative block w-3 h-3 rounded-full ${color} border border-white/20`} />

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 glass rounded-lg text-[11px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                    <span className="font-semibold">{t.name}</span>
                    <br />
                    <span className="text-slate-400">{t.trek}</span>
                    <br />
                    <span className="text-slate-400">{t.altitude}m • {t.battery}%</span>
                  </div>
                </div>
              );
            })}

            {/* Map legend */}
            <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-safety-green" /> Active</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-safety-orange" /> Warning</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-safety-red" /> Critical</span>
            </div>
          </div>
        </div>

        {/* ── Trekker List (spans 2 cols on desktop) ── */}
        <div
          className="lg:col-span-2 glass-card p-5 flex flex-col animate-fadeInUp"
          style={{ animationDelay: '0.2s' }}
        >
          <h3 className="text-sm font-semibold text-white tracking-wide mb-4 flex items-center gap-2">
            <MapPin size={15} className="text-nature-400" />
            Active Trekkers
            <span className="ml-auto text-[10px] font-bold text-nature-400 bg-nature-500/15 px-2 py-0.5 rounded-full">
              {ACTIVE_TREKKERS.length}
            </span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[400px]">
            {ACTIVE_TREKKERS.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors animate-fadeInUp"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Status dot */}
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColor(t.status)}`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white truncate">{t.name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${statusTextColor(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate block">{t.trek}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-shrink-0">
                  <span className="flex items-center gap-1" title="Altitude">
                    <Mountain size={12} className="text-sky-400" />
                    {t.altitude}m
                  </span>
                  <span className="flex items-center gap-1" title="Battery">
                    <Battery size={12} className={t.battery < 30 ? 'text-red-400' : 'text-emerald-400'} />
                    {t.battery}%
                  </span>
                  <span className="flex items-center gap-1" title="Speed">
                    <Gauge size={12} className="text-amber-400" />
                    {t.speed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Alert Feed ── */}
      <div
        className="mt-6 glass-card p-5 animate-fadeInUp"
        style={{ animationDelay: '0.3s' }}
      >
        <h3 className="text-sm font-semibold text-white tracking-wide mb-4 flex items-center gap-2">
          <AlertTriangle size={15} className="text-safety-orange" />
          Recent Alerts
        </h3>

        <div className="space-y-2.5">
          {ALERTS.map((a, i) => (
            <div
              key={a.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors animate-fadeInUp"
              style={{ animationDelay: `${0.35 + i * 0.06}s` }}
            >
              {/* Severity badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border flex-shrink-0 ${severityBadge(a.severity)}`}>
                {alertIcon(a.type)}
                {a.severity}
              </span>

              {/* Message */}
              <p className="flex-1 text-sm text-slate-300 leading-snug">{a.message}</p>

              {/* Time */}
              <span className="text-[11px] text-slate-500 flex-shrink-0 whitespace-nowrap">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
