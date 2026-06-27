import { useState } from 'react';
import { Activity, Users, AlertTriangle, TrendingUp, Battery, Signal, MapPin, Clock, BarChart3, Radio } from 'lucide-react';
import { ACTIVE_TREKKERS, ALERTS, ELEVATION_DATA, PLATFORM_STATS } from '../data/treks';
import LiveDashboard from '../components/LiveDashboard';
import SOSButton from '../components/SOSButton';

function MiniElevationChart() {
  const maxAlt = Math.max(...ELEVATION_DATA.map(d => d.altitude));
  const minAlt = Math.min(...ELEVATION_DATA.map(d => d.altitude));
  const range = maxAlt - minAlt;

  return (
    <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '24px' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{ color: '#5BB4FF' }} />
          <h3 className="font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Elevation Profile</h3>
        </div>
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(48,209,88,0.1)', color: '#30D158' }}>
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
                    background: `linear-gradient(to top, #5BB4FF, #30D158)`,
                  }}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                  style={{ color: '#5BB4FF' }}>
                  {point.altitude}m
                </div>
              </div>
              <span className="text-[9px] hidden sm:block" style={{ color: '#636366' }}>
                {point.hour.split(':')[0]}h
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-3 text-xs" style={{ color: '#636366' }}>
        <span>{ELEVATION_DATA[0].hour}</span>
        <span>Current: {ELEVATION_DATA[ELEVATION_DATA.length - 1].altitude}m</span>
        <span>{ELEVATION_DATA[ELEVATION_DATA.length - 1].hour}</span>
      </div>
    </div>
  );
}

function QuickStats() {
  const stats = [
    { label: 'Active Trekkers', value: ACTIVE_TREKKERS.length, icon: Users, color: '#30D158', live: true },
    { label: 'Critical Alerts', value: ALERTS.filter(a => a.severity === 'critical').length, icon: AlertTriangle, color: '#FF453A' },
    { label: 'Avg Battery', value: Math.round(ACTIVE_TREKKERS.reduce((a, t) => a + t.battery, 0) / ACTIVE_TREKKERS.length) + '%', icon: Battery, color: '#FFD60A' },
    { label: 'Signal Quality', value: '87%', icon: Signal, color: '#5BB4FF' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl animate-fadeInUp"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', animationDelay: `${i * 0.1}s` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            {stat.live && <div className="live-dot" />}
          </div>
          <div className="text-2xl font-bold mb-1 text-white" style={{ fontFamily: 'var(--font-heading)' }}>{stat.value}</div>
          <div className="text-xs" style={{ color: '#636366' }}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fadeInUp">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#5BB4FF' }}>
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <div className="live-dot" />
                <span className="text-xs font-medium" style={{ color: '#30D158' }}>LIVE</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Mission <span style={{ color: '#5BB4FF' }}>Control</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: '#636366' }}>
              Real-time monitoring of all active trekkers across Nepal
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <SOSButton />
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats />

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
