import { Activity, Users, AlertTriangle, TrendingUp, Battery, Signal, MapPin, Clock, BarChart3, Radio, LogOut, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ACTIVE_TREKKERS, ALERTS, ELEVATION_DATA, PLATFORM_STATS } from '../data/treks';
import LiveDashboard from '../components/LiveDashboard';
import SOSButton from '../components/SOSButton';
import AdminSOSAlerts from '../components/AdminSOSAlerts';
import GroupManager from '../components/GroupManager';
import TrailRegistration from '../components/TrailRegistration';
import TripSafetyPlanner from '../components/TripSafetyPlanner';
import { useAuth } from '../context/AuthContext';

function MiniElevationChart() {
  const maxAlt = Math.max(...ELEVATION_DATA.map(d => d.altitude));
  const minAlt = Math.min(...ELEVATION_DATA.map(d => d.altitude));
  const range = maxAlt - minAlt;

  return (
    <div className="section-card p-6 shadow-sm card-border-light">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00965E]" />
          <h3 className="font-semibold text-slate-800 section-heading">Elevation Profile</h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: '#E5F5EE', color: '#00965E' }}>
          Live Tracking
        </span>
      </div>
      <div className="flex items-end gap-1 h-32">
        {ELEVATION_DATA.map((point, i) => {
          const height = ((point.altitude - minAlt) / range) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
              <div className="relative w-full">
                <div
                  className="w-full rounded-t-sm transition-all duration-300 group-hover:opacity-80"
                  style={{
                    height: `${height}%`,
                    minHeight: '8px',
                    background: `linear-gradient(to top, #00965E, #47C18E)`,
                  }}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[#00965E]">
                  {point.altitude}m
                </div>
              </div>
              <span className="text-[9px] hidden sm:block text-slate-400">
                {point.hour.split(':')[0]}h
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-3 text-xs text-slate-500">
        <span>{ELEVATION_DATA[0].hour}</span>
        <span className="font-semibold text-slate-700">Current: {ELEVATION_DATA[ELEVATION_DATA.length - 1].altitude}m</span>
        <span>{ELEVATION_DATA[ELEVATION_DATA.length - 1].hour}</span>
      </div>
    </div>
  );
}

function QuickStats() {
  const stats = [
    { label: 'Active Trekkers', value: ACTIVE_TREKKERS.length, icon: Users, color: '#2E7D32', bgColor: '#E5F5EE', live: true },
    { label: 'Critical Alerts', value: ALERTS.filter(a => a.severity === 'critical').length, icon: AlertTriangle, color: '#D32F2F', bgColor: '#FEF2F2' },
    { label: 'Avg Battery', value: Math.round(ACTIVE_TREKKERS.reduce((a, t) => a + t.battery, 0) / ACTIVE_TREKKERS.length) + '%', icon: Battery, color: '#EF6C00', bgColor: '#FFF8E1' },
    { label: 'Signal Quality', value: '87%', icon: Signal, color: '#00965E', bgColor: '#E5F5EE' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="section-card-sm rounded-2xl animate-fadeInUp bg-white transition-all duration-300 hover:shadow-md card-border-light"
          style={{ animationDelay: `${i * 0.1}s` }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00965E'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bgColor }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            {stat.live && <div className="live-dot" />}
          </div>
          <div className="text-2xl font-bold mb-1 text-slate-800" style={{ fontFamily: 'var(--font-heading)' }}>{stat.value}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleAuthAction = async () => {
    if (user) {
      await logout();
    }
    navigate('/login');
  };

  return (
    <div className="page-shell">
      <div className="page-container">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fadeInUp">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#00965E' }}>
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <div className="live-dot" />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2E7D32' }}>LIVE</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-heading)' }}>
              Mission <span style={{ color: '#00965E' }}>Control</span>
            </h1>
            <p className="text-sm mt-1 text-slate-500">
              Real-time monitoring of all active trekkers across Nepal
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
            <button
              type="button"
              onClick={handleAuthAction}
              className="btn-primary-solid rounded-full px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
            >
              {user ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {user ? 'Logout' : 'Login'}
            </button>
            <SOSButton />
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Admin SOS Alerts */}
        <AdminSOSAlerts />

        {/* Group Management */}
        <GroupManager />

        <div className="mb-8 animate-fadeInUp animate-delay-200">
          <TripSafetyPlanner />
        </div>

        {/* Trail registration and live telemetry */}
        <TrailRegistration />

        {/* Elevation Chart */}
        <div className="mb-8 animate-fadeInUp animate-delay-200">
          <MiniElevationChart />
        </div>

        {/* Live Dashboard */}
        <LiveDashboard />
      </div>
    </div>
  );
}
