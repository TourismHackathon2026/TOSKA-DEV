import { useState } from 'react';
import {
  CloudSun, Wind, Droplets, Thermometer, Eye, Gauge,
  MapPin, AlertTriangle, ChevronDown, Sun, Cloud, CloudRain,
  CloudSnow, Zap, TrendingUp, Navigation
} from 'lucide-react';

const STATIONS = [
  { id: 'ebc', name: 'Everest Base Camp', altitude: '5,364 m', region: 'Solukhumbu' },
  { id: 'abc', name: 'Annapurna Base Camp', altitude: '4,130 m', region: 'Kaski' },
  { id: 'pokhara', name: 'Pokhara', altitude: '822 m', region: 'Gandaki' },
  { id: 'namche', name: 'Namche Bazaar', altitude: '3,440 m', region: 'Solukhumbu' },
  { id: 'langtang', name: 'Langtang Village', altitude: '3,307 m', region: 'Rasuwa' },
];

const WEATHER_DATA = {
  ebc: {
    temp: -8, feelsLike: -18, condition: 'Partly Cloudy', wind: 42, windDir: 'NW', humidity: 38,
    visibility: 12, pressure: 540, uvIndex: 9, snow: 0,
    alert: { level: 'warning', msg: 'High winds expected above 6,000 m after 14:00. Restrict movement.' },
    forecast: [
      { day: 'Today', icon: Cloud, high: -5, low: -14, rain: 10 },
      { day: 'Sat', icon: Sun, high: -3, low: -12, rain: 5 },
      { day: 'Sun', icon: CloudSnow, high: -9, low: -20, rain: 60 },
      { day: 'Mon', icon: Zap, high: -11, low: -22, rain: 75 },
      { day: 'Tue', icon: CloudRain, high: -7, low: -15, rain: 45 },
    ],
  },
  abc: {
    temp: 2, feelsLike: -5, condition: 'Clear Skies', wind: 18, windDir: 'N', humidity: 52,
    visibility: 30, pressure: 620, uvIndex: 8, snow: 0,
    alert: null,
    forecast: [
      { day: 'Today', icon: Sun, high: 4, low: -2, rain: 0 },
      { day: 'Sat', icon: CloudSun, high: 6, low: 0, rain: 15 },
      { day: 'Sun', icon: CloudRain, high: 3, low: -1, rain: 55 },
      { day: 'Mon', icon: Cloud, high: 2, low: -3, rain: 25 },
      { day: 'Tue', icon: Sun, high: 7, low: 1, rain: 5 },
    ],
  },
  pokhara: {
    temp: 22, feelsLike: 20, condition: 'Sunny', wind: 8, windDir: 'SE', humidity: 65,
    visibility: 25, pressure: 945, uvIndex: 6, snow: 0,
    alert: null,
    forecast: [
      { day: 'Today', icon: Sun, high: 24, low: 17, rain: 0 },
      { day: 'Sat', icon: Sun, high: 25, low: 18, rain: 5 },
      { day: 'Sun', icon: CloudRain, high: 21, low: 15, rain: 70 },
      { day: 'Mon', icon: CloudRain, high: 19, low: 14, rain: 80 },
      { day: 'Tue', icon: CloudSun, high: 22, low: 16, rain: 20 },
    ],
  },
  namche: {
    temp: 5, feelsLike: -1, condition: 'Clear', wind: 22, windDir: 'W', humidity: 45,
    visibility: 20, pressure: 680, uvIndex: 7, snow: 0,
    alert: { level: 'info', msg: 'Clear window today. Good summit window forecast for weekend.' },
    forecast: [
      { day: 'Today', icon: Sun, high: 7, low: 0, rain: 0 },
      { day: 'Sat', icon: Sun, high: 8, low: 1, rain: 5 },
      { day: 'Sun', icon: CloudSnow, high: 1, low: -6, rain: 60 },
      { day: 'Mon', icon: CloudSnow, high: -2, low: -9, rain: 70 },
      { day: 'Tue', icon: Cloud, high: 3, low: -4, rain: 20 },
    ],
  },
  langtang: {
    temp: 1, feelsLike: -6, condition: 'Overcast', wind: 30, windDir: 'NE', humidity: 72,
    visibility: 8, pressure: 695, uvIndex: 4, snow: 2,
    alert: { level: 'danger', msg: 'Avalanche risk ELEVATED. Do not venture above 4,000 m today.' },
    forecast: [
      { day: 'Today', icon: Cloud, high: 2, low: -5, rain: 30 },
      { day: 'Sat', icon: CloudSnow, high: -1, low: -8, rain: 65 },
      { day: 'Sun', icon: CloudSnow, high: -3, low: -10, rain: 80 },
      { day: 'Mon', icon: Cloud, high: 0, low: -7, rain: 35 },
      { day: 'Tue', icon: Sun, high: 4, low: -3, rain: 10 },
    ],
  },
};

const ALERT_STYLES = {
  danger:  { bg: '#FEF2F2', border: '#D32F2F', text: '#B71C1C', icon: '#D32F2F' },
  warning: { bg: '#FFFBEB', border: '#EF6C00', text: '#B45309', icon: '#EF6C00' },
  info:    { bg: '#E5F5EE', border: '#00965E', text: '#005A3C', icon: '#00965E' },
};

function StatCard({ icon: Icon, label, value, unit, color = '#00965E' }) {
  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-2xl transition-all duration-300 hover:shadow-md"
      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748B' }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div>
        <span className="text-2xl font-extrabold text-slate-800">{value}</span>
        {unit && <span className="text-sm font-medium ml-1 text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}

export default function WeatherPage() {
  const [selectedStation, setSelectedStation] = useState('ebc');
  const station = STATIONS.find(s => s.id === selectedStation);
  const weather = WEATHER_DATA[selectedStation];
  const alert = weather.alert ? ALERT_STYLES[weather.alert.level] : null;

  return (
    <div className="page-shell">
      <div className="page-container">

        {/* Page Header */}
        <div className="animate-fadeInUp mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-white">
              <CloudSun className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <div className="live-dot" />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Live Data</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-1 section-heading">
            Weather <span className="text-primary-dark">Intelligence</span>
          </h1>
          <p className="text-slate-500 text-sm">Real-time mountain weather & safety alerts for active trail stations</p>
        </div>

        {/* Station Selector */}
        <div className="animate-fadeInUp animate-delay-100 mb-8">
          <div className="flex flex-wrap gap-2">
            {STATIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStation(s.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={{
                  background: selectedStation === s.id ? '#00965E' : '#FFFFFF',
                  color: selectedStation === s.id ? '#FFFFFF' : '#4B5563',
                  border: `1px solid ${selectedStation === s.id ? '#00965E' : '#E2E8F0'}`,
                }}
              >
                <MapPin size={14} />
                {s.name}
                <span className="text-[10px] opacity-70">{s.altitude}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Alert Banner */}
        {weather.alert && (
          <div
            className="mb-6 animate-fadeIn flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: alert.bg, border: `1.5px solid ${alert.border}` }}
          >
            <AlertTriangle size={18} style={{ color: alert.icon, flexShrink: 0, marginTop: 2 }} />
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider block mb-0.5" style={{ color: alert.text }}>
                {weather.alert.level === 'danger' ? '⛔ Danger Alert' : weather.alert.level === 'warning' ? '⚠️ Weather Warning' : 'ℹ️ Advisory'}
              </span>
              <span className="text-sm" style={{ color: alert.text }}>{weather.alert.msg}</span>
            </div>
          </div>
        )}

        {/* Main Weather Card */}
        <div className="animate-fadeInUp animate-delay-200 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Current Conditions */}
          <div className="section-card p-6 rounded-3xl text-white relative overflow-hidden bg-primary">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10" style={{ background: '#FFFFFF' }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={14} style={{ color: '#A3CBB9' }} />
                <span className="text-xs font-semibold" style={{ color: '#A3CBB9' }}>{station.name}</span>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-7xl font-black tracking-tight">{weather.temp}°</span>
                <span className="text-2xl mb-4 opacity-70">C</span>
              </div>
              <p className="text-lg font-semibold opacity-90 mb-1">{weather.condition}</p>
              <p className="text-sm opacity-60">Feels like {weather.feelsLike}°C</p>
              <div className="mt-6 pt-4 border-t border-white/20 flex items-center gap-2">
                <Navigation size={14} style={{ color: '#A3CBB9' }} />
                <span className="text-xs" style={{ color: '#A3CBB9' }}>Wind {weather.windDir} · {weather.wind} km/h</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <TrendingUp size={14} style={{ color: '#A3CBB9' }} />
                <span className="text-xs" style={{ color: '#A3CBB9' }}>Altitude: {station.altitude}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard icon={Wind} label="Wind Speed" value={weather.wind} unit="km/h" color="#00965E" />
            <StatCard icon={Droplets} label="Humidity" value={weather.humidity} unit="%" color="#0284C7" />
            <StatCard icon={Eye} label="Visibility" value={weather.visibility} unit="km" color="#6366F1" />
            <StatCard icon={Gauge} label="Pressure" value={weather.pressure} unit="hPa" color="#D97706" />
            <StatCard icon={Thermometer} label="UV Index" value={weather.uvIndex} unit="" color={weather.uvIndex > 7 ? '#D32F2F' : '#EF6C00'} />
            <StatCard icon={CloudSnow} label="Snowfall" value={weather.snow} unit="cm" color="#7C3AED" />
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="section-card p-6 rounded-3xl animate-fadeInUp animate-delay-300">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 section-heading">
            5-Day Forecast
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {weather.forecast.map((day, i) => {
              const Icon = day.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 hover:shadow-md"
                  style={{
                    background: i === 0 ? '#E5F5EE' : '#F9FAFB',
                    border: `1px solid ${i === 0 ? '#C2EAD9' : '#E2E8F0'}`,
                  }}
                >
                  <span className="text-[11px] font-bold text-slate-500">{day.day}</span>
                  <Icon size={20} style={{ color: i === 0 ? '#00965E' : '#64748B' }} />
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-800 block">{day.high}°</span>
                    <span className="text-[10px] text-slate-400">{day.low}°</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets size={10} style={{ color: '#0284C7' }} />
                    <span className="text-[10px] font-semibold" style={{ color: '#0284C7' }}>{day.rain}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
