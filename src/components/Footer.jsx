import { Link } from 'react-router-dom';
import {
  Mountain,
  Globe,
  MessageCircle,
  Camera,
  Play,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';

const EXPLORE_LINKS = [
  { label: 'Everest Base Camp', path: '/explore/ebc-trek' },
  { label: 'Annapurna Circuit', path: '/explore/abc-trek' },
  { label: 'Langtang Valley', path: '/explore/langtang-trek' },
  { label: 'Manaslu Circuit', path: '/explore/manaslu-circuit' },
  { label: 'Upper Mustang', path: '/explore/upper-mustang' },
];

const PLATFORM_LINKS = [
  { label: 'Live Dashboard', path: '/dashboard' },
  { label: 'Weather Intel', path: '/weather' },
  { label: 'Safety Center', path: '/safety' },
  { label: 'SOS & Rescue', path: '/safety#sos' },
  { label: 'Trek Planner', path: '/explore' },
];

const SOCIAL_ICONS = [
  { icon: Globe, label: 'Facebook', href: '#' },
  { icon: MessageCircle, label: 'Twitter', href: '#' },
  { icon: Camera, label: 'Instagram', href: '#' },
  { icon: Play, label: 'YouTube', href: '#' },
];

export default function Footer() {
  return (
    <footer className="relative mt-auto" style={{ background: '#0A0A0A', borderTop: '1px solid #2A2A2A' }}>
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg transition-opacity group-hover:opacity-80" style={{ background: 'rgba(91,180,255,0.12)' }}>
                <Mountain className="h-5 w-5" style={{ color: '#5BB4FF' }} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-heading)' }}>TrailGuard</span>
            </Link>
            <p style={{ color: '#636366', fontSize: '14px', lineHeight: '1.6', maxWidth: '280px' }}>
              Nepal's smartest trekking platform &mdash; real-time GPS tracking, weather intelligence, and emergency SOS for every Himalayan adventure.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_ICONS.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200"
                  style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#636366' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#5BB4FF'; e.currentTarget.style.color = '#5BB4FF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#636366'; }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase" style={{ color: '#8E8E9A', letterSpacing: '0.08em', fontFamily: 'var(--font-heading)' }}>Explore</h4>
            <ul className="flex flex-col gap-2.5">
              {EXPLORE_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link to={path} className="group flex items-center gap-1.5 text-sm transition-colors" style={{ color: '#636366' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#636366'; }}
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" style={{ color: '#5BB4FF' }} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase" style={{ color: '#8E8E9A', letterSpacing: '0.08em', fontFamily: 'var(--font-heading)' }}>Platform</h4>
            <ul className="flex flex-col gap-2.5">
              {PLATFORM_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link to={path} className="group flex items-center gap-1.5 text-sm transition-colors" style={{ color: '#636366' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#636366'; }}
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" style={{ color: '#5BB4FF' }} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase" style={{ color: '#8E8E9A', letterSpacing: '0.08em', fontFamily: 'var(--font-heading)' }}>Contact</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-sm" style={{ color: '#636366' }}>
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#5BB4FF' }} />
                <span>Tridevi Marg, Thamel<br />Kathmandu 44600, Nepal</span>
              </li>
              <li>
                <a href="tel:+977-1-4700000" className="flex items-center gap-3 text-sm transition-colors" style={{ color: '#636366' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#636366'; }}
                >
                  <Phone className="h-4 w-4 shrink-0" style={{ color: '#5BB4FF' }} />
                  +977-1-4700000
                </a>
              </li>
              <li>
                <a href="mailto:info@trailguard.com.np" className="flex items-center gap-3 text-sm transition-colors" style={{ color: '#636366' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#FFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#636366'; }}
                >
                  <Mail className="h-4 w-4 shrink-0" style={{ color: '#5BB4FF' }} />
                  info@trailguard.com.np
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 pt-6 sm:flex-row" style={{ borderTop: '1px solid #2A2A2A' }}>
          <p className="text-xs" style={{ color: '#636366' }}>&copy; {new Date().getFullYear()} TrailGuard Nepal. All rights reserved.</p>
          <p className="text-xs" style={{ color: '#636366' }}>Made with <span style={{ color: '#FF453A' }}>&#x2764;&#xFE0F;</span> in Nepal</p>
        </div>
      </div>
    </footer>
  );
}
