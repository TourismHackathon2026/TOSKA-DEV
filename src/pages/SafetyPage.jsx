import {
  ShieldAlert, Radio, Phone, AlertTriangle, CheckCircle2,
  MapPin, Battery, Signal, Clock, Users, Zap,
  HeartPulse, Mountain, BookOpen, Activity
} from 'lucide-react';
import SOSButton from '../components/SOSButton';
import SafetyFeatures from '../components/SafetyFeatures';
import GoogleMapsTrace from '../components/GoogleMapsTrace';
import TripSafetyPlanner from '../components/TripSafetyPlanner';
import { ACTIVE_TREKKERS } from '../data/treks';

const EMERGENCY_CONTACTS = [
  { name: 'Nepal Police', number: '100', color: '#1A56DB', bg: '#EFF6FF', desc: 'General emergency' },
  { name: 'High Altitude Rescue', number: '4488649', color: '#D32F2F', bg: '#FEF2F2', desc: 'Mountain rescue ops' },
  { name: 'Tourist Police', number: '1144', color: '#00965E', bg: '#E5F5EE', desc: 'Trekker assistance' },
  { name: 'CIWEC Clinic', number: '4435232', color: '#7C3AED', bg: '#F5F3FF', desc: 'High-altitude medicine' },
];

const SAFETY_TIPS = [
  { icon: Activity, title: 'Acclimatize Properly', desc: 'Ascend no more than 300–500m per day above 3,000m. Rest one day for every 1,000m gained.', color: '#00965E' },
  { icon: Battery, title: 'Keep Devices Charged', desc: 'Cold drains batteries fast. Carry a power bank and keep devices close to your body overnight.', color: '#EF6C00' },
  { icon: Signal, title: 'Check In Regularly', desc: 'Update your live location every 4–6 hours. Inform your teahouse or guide of your daily plan.', color: '#1A56DB' },
  { icon: HeartPulse, title: 'Know AMS Signs', desc: 'Headache, nausea, fatigue above 3,000m = rest immediately. Descend if symptoms worsen.', color: '#D32F2F' },
  { icon: Mountain, title: 'Study Your Route', desc: 'Download offline maps before departure. Know your bail-out points and alternative routes.', color: '#7C3AED' },
  { icon: Users, title: 'Trek With a Buddy', desc: 'Solo trekking above 4,000m is not recommended. Register with a licensed guide or agency.', color: '#D97706' },
];

const ACTIVE_ALERTS = [
  { region: 'Langtang Valley', type: 'Avalanche Risk', level: 'danger', time: '08:45 AM' },
  { region: 'Everest Zone', type: 'High Winds >6000m', level: 'warning', time: '06:00 AM' },
  { region: 'Thorong La Pass', type: 'Snow Expected', level: 'info', time: 'Today 14:00' },
];

const ALERT_STYLE = {
  danger:  { bg: '#FEF2F2', border: '#D32F2F', dot: '#D32F2F', text: '#B71C1C', label: '⛔ Danger' },
  warning: { bg: '#FFFBEB', border: '#EF6C00', dot: '#EF6C00', text: '#92400E', label: '⚠️ Warning' },
  info:    { bg: '#E5F5EE', border: '#00965E', dot: '#00965E', text: '#005A3C', label: 'ℹ️ Advisory' },
};

function EmergencyCard({ name, number, color, bg, desc }) {
  return (
    <a
      href={`tel:${number}`}
      className="group flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:shadow-md"
      style={{ background: bg, border: `1.5px solid ${color}30` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}30`; }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ background: color }}>
        <Phone size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 text-sm">{name}</p>
        <p className="text-[11px] text-slate-500">{desc}</p>
      </div>
      <div className="text-right">
        <p className="font-extrabold text-lg" style={{ color, fontFamily: 'var(--font-heading)' }}>{number}</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Tap to call</p>
      </div>
    </a>
  );
}

export default function SafetyPage() {
  return (
    <div className="page-shell">
      <div className="page-container">

        {/* Page Header */}
        <div className="animate-fadeInUp mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-danger text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <div className="live-dot" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary-dark">Always On</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-1 section-heading">
            Safety <span className="text-danger">Center</span>
          </h1>
          <p className="text-slate-500 text-sm">Emergency contacts, live alerts, and critical mountain safety protocols</p>
        </div>

        {/* SOS + Active Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fadeInUp animate-delay-100">

          {/* SOS Widget */}
          <div className="section-card p-6 rounded-3xl flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <Radio size={16} className="animate-pulse text-danger" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Emergency SOS Beacon</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              TrailGuard SOS instantly broadcasts your GPS coordinates to rescue teams, park HQ, and your emergency contacts via satellite link.
            </p>
            <SOSButton />
            <p className="text-[10px] text-slate-400 text-center">⚠️ Only activate in genuine life-threatening emergencies</p>
          </div>

          {/* Active Alerts */}
          <div className="section-card p-6 rounded-3xl flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-warning" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Live Alerts</h3>
              </div>
              <span className="badge-pill badge-pill--danger">
                {ACTIVE_ALERTS.length} Active
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {ACTIVE_ALERTS.map((alert, i) => {
                const s = ALERT_STYLE[alert.level];
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: s.bg, border: `1px solid ${s.border}30` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: s.dot }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold" style={{ color: s.text }}>{s.label}</p>
                      <p className="text-xs text-slate-700 font-semibold">{alert.type}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={10} style={{ color: '#64748B' }} />
                        <span className="text-[10px] text-slate-400">{alert.region}</span>
                        <Clock size={10} style={{ color: '#64748B' }} className="ml-2" />
                        <span className="text-[10px] text-slate-400">{alert.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mb-8 animate-fadeInUp animate-delay-200">
          <div className="section-card p-6 rounded-3xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Live Mission Map</h3>
                <p className="text-xs text-slate-500 mt-1">Google Maps tracing for critical trekkers and active rescue hotspots.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                {ACTIVE_TREKKERS.filter((item) => item.status === 'critical').length} critical alert{ACTIVE_TREKKERS.filter((item) => item.status === 'critical').length !== 1 ? 's' : ''}
                <span className="ml-3 text-xs text-slate-400">{ACTIVE_TREKKERS.filter((item) => item.status === 'active').length} active trackers</span>
              </div>
            </div>

            <GoogleMapsTrace markers={ACTIVE_TREKKERS} />
          </div>
        </div>

        <div className="mb-8 animate-fadeInUp animate-delay-300">
          <div className="section-card p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-5">
              <Phone size={16} className="text-primary-dark" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Emergency Contacts — Nepal</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EMERGENCY_CONTACTS.map((c, i) => (
                <EmergencyCard key={i} {...c} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 animate-fadeInUp animate-delay-300">
          <TripSafetyPlanner />
        </div>

        {/* Safety Features Component */}
        <div className="mt-8 animate-fadeInUp animate-delay-300">
          <SafetyFeatures />
        </div>

        {/* Safety Tips */}
        <div className="mt-8 animate-fadeInUp animate-delay-400">
          <div className="section-card p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen size={16} className="text-primary-dark" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Essential Safety Protocols</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 reveal-children">
              {SAFETY_TIPS.map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-2xl transition-all duration-200 hover:shadow-md group cursor-default"
                    style={{ background: '#F9FAFB', border: '1px solid #E2E8F0' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = tip.color; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ background: `${tip.color}15` }}>
                      <Icon size={20} style={{ color: tip.color }} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1.5">{tip.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{tip.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
