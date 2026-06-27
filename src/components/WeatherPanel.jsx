import { Cloud, Wind, Droplets, Sun } from 'lucide-react';
import { WEATHER_DATA } from '../data/treks';

/**
 * Returns border/glow classes for severe weather conditions.
 */
function getSeverityStyle(condition) {
  const lower = condition.toLowerCase();
  if (lower.includes('heavy')) {
    return 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
  }
  if (lower === 'snow') {
    return 'border-orange-400/40 shadow-[0_0_20px_rgba(251,146,60,0.2)]';
  }
  return '';
}

/**
 * Returns a temperature color based on value.
 */
function getTempColor(temp) {
  if (temp <= -5) return 'text-sky-300';
  if (temp <= 0) return 'text-sky-400';
  if (temp <= 10) return 'text-emerald-400';
  return 'text-amber-400';
}

export default function WeatherPanel() {
  return (
    <section id="weather-panel" className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-sky-300 font-medium mb-5">
          <Cloud size={16} className="text-sky-400" />
          Live Conditions
        </div>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Mountain{' '}
          <span className="gradient-text">Weather Intelligence</span>
        </h2>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Real-time weather monitoring across Nepal's major trekking regions.
          Plan smarter, trek safer.
        </p>
      </div>

      {/* ── Weather Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {WEATHER_DATA.map((w, index) => {
          const severity = getSeverityStyle(w.condition);
          const isSevere = severity !== '';

          return (
            <article
              key={w.region}
              id={`weather-${w.region.toLowerCase().replace(/\s+/g, '-')}`}
              className={`glass-card p-6 relative overflow-hidden animate-fadeInUp ${severity}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Severe weather pulse ring */}
              {isSevere && (
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-red-500/5 animate-breathe" />
              )}

              {/* Region Name */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white text-sm tracking-wide">{w.region}</h3>
                {isSevere && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/20">
                    Alert
                  </span>
                )}
              </div>

              {/* Temperature + Icon */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className={`text-5xl font-extrabold tracking-tighter ${getTempColor(w.temp)}`}>
                    {w.temp > 0 ? '+' : ''}{w.temp}°
                  </span>
                  <span className="text-slate-500 text-sm ml-1 font-medium">C</span>
                  <div className="text-slate-500 text-xs mt-0.5">
                    Feels like {w.feels > 0 ? '+' : ''}{w.feels}°C
                  </div>
                </div>
                <span className="text-5xl" role="img" aria-label={w.condition}>
                  {w.icon}
                </span>
              </div>

              {/* Condition Label */}
              <p className={`text-sm font-medium mb-5 ${isSevere ? 'text-orange-300' : 'text-slate-300'}`}>
                {w.condition}
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.05]">
                  <Wind size={14} className="text-sky-400 mb-1" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Wind</span>
                  <span className="text-xs font-semibold text-slate-200">{w.wind} km/h</span>
                </div>
                <div className="flex flex-col items-center py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.05]">
                  <Droplets size={14} className="text-sky-400 mb-1" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Humidity</span>
                  <span className="text-xs font-semibold text-slate-200">{w.humidity}%</span>
                </div>
                <div className="flex flex-col items-center py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.05]">
                  <Sun size={14} className="text-amber-400 mb-1" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">UV</span>
                  <span className={`text-xs font-semibold ${w.uv >= 8 ? 'text-red-400' : 'text-slate-200'}`}>
                    {w.uv}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
