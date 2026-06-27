import { useState, useEffect } from 'react';
import { Cloud, Wind, Droplets, Sun } from 'lucide-react';
import { WEATHER_DATA } from '../data/treks';
import { getLiveWeatherFromFirestore } from '../utils/firebaseService';

/**
 * Returns border/shadow styles for severe weather conditions.
 */
function getSeverityStyle(condition) {
  const lower = condition.toLowerCase();
  if (lower.includes('heavy')) {
    return { border: '1px solid #FF453A', boxShadow: '0 0 15px rgba(255,69,58,0.15)' };
  }
  if (lower === 'snow') {
    return { border: '1px solid #FF453A', boxShadow: '0 0 15px rgba(255,69,58,0.1)' };
  }
  return null;
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
  const [weatherData, setWeatherData] = useState(WEATHER_DATA);

  useEffect(() => {
    async function loadWeather() {
      try {
        const data = await getLiveWeatherFromFirestore();
        if (data && data.length > 0) {
          setWeatherData(data);
        }
      } catch (err) {
        console.warn('Could not load weather from Firestore, using mock data.', err);
      }
    }
    loadWeather();
  }, []);

  return (
    <section id="weather-panel" className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="text-center mb-12 sm:mb-16">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-5"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#8E8E9A' }}
        >
          <Cloud size={16} style={{ color: '#8E8E9A' }} />
          Live Conditions
        </div>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Mountain{' '}
          <span style={{ color: '#5BB4FF' }}>Weather Intelligence</span>
        </h2>
        <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#8E8E9A' }}>
          Real-time weather monitoring across Nepal's major trekking regions.
          Plan smarter, trek safer.
        </p>
      </div>

      {/* ── Weather Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {weatherData.map((w, index) => {
          const severityStyle = getSeverityStyle(w.condition);
          const isSevere = severityStyle !== null;

          const cardStyle = {
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '16px',
            animationDelay: `${index * 0.1}s`,
            ...(isSevere ? severityStyle : {}),
          };

          return (
            <article
              key={w.region}
              id={`weather-${w.region.toLowerCase().replace(/\s+/g, '-')}`}
              className="p-6 relative overflow-hidden animate-fadeInUp"
              style={cardStyle}
            >
              {/* Region Name */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white text-sm tracking-wide">{w.region}</h3>
                {isSevere && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: 'rgba(255,69,58,0.15)', color: '#FF453A', border: '1px solid rgba(255,69,58,0.2)' }}
                  >
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
                  <span className="text-sm ml-1 font-medium" style={{ color: '#8E8E9A' }}>C</span>
                  <div className="text-xs mt-0.5" style={{ color: '#8E8E9A' }}>
                    Feels like {w.feels_like !== undefined ? (w.feels_like > 0 ? '+' : '') + w.feels_like : (w.feels > 0 ? '+' : '') + w.feels}°C
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
                <div
                  className="flex flex-col items-center py-2.5 rounded-xl"
                  style={{ background: '#111', border: '1px solid #1A1A1A' }}
                >
                  <Wind size={14} className="text-sky-400 mb-1" />
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: '#8E8E9A' }}>Wind</span>
                  <span className="text-xs font-semibold text-slate-200">{w.wind} km/h</span>
                </div>
                <div
                  className="flex flex-col items-center py-2.5 rounded-xl"
                  style={{ background: '#111', border: '1px solid #1A1A1A' }}
                >
                  <Droplets size={14} className="text-sky-400 mb-1" />
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: '#8E8E9A' }}>Humidity</span>
                  <span className="text-xs font-semibold text-slate-200">{w.humidity}%</span>
                </div>
                <div
                  className="flex flex-col items-center py-2.5 rounded-xl"
                  style={{ background: '#111', border: '1px solid #1A1A1A' }}
                >
                  <Sun size={14} className="text-amber-400 mb-1" />
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: '#8E8E9A' }}>UV</span>
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
