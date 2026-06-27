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
    <footer className="footer relative mt-auto">
      <div className="footer-top mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 pb-12 pt-20">
        <div className="grid gap-14 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="footer-brand-icon flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                <Mountain className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-heading)' }}>TrailGuard</span>
            </Link>
            <p className="footer-paragraph">
              Nepal's smartest trekking platform — real-time GPS tracking, weather intelligence, and emergency SOS for every Himalayan adventure.
            </p>
            <div className="footer-social">
              {SOCIAL_ICONS.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} aria-label={label} className="footer-social-btn">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="footer-title">Explore</h4>
            <ul className="flex flex-col gap-3">
              {EXPLORE_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link to={path} className="footer-link group">
                    <ChevronRight className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Platform</h4>
            <ul className="flex flex-col gap-3">
              {PLATFORM_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link to={path} className="footer-link group">
                    <ChevronRight className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Contact</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-sm" style={{ color: '#B8D4C8' }}>
                <MapPin className="mt-1 h-5 w-5 shrink-0" />
                <span className="leading-relaxed">Tridevi Marg, Thamel<br />Kathmandu 44600, Nepal</span>
              </li>
              <li>
                <a href="tel:+977-1-4700000" className="footer-link group">
                  <Phone className="h-5 w-5 shrink-0" />
                  +977-1-4700000
                </a>
              </li>
              <li>
                <a href="mailto:info@trailguard.com.np" className="footer-link group">
                  <Mail className="h-5 w-5 shrink-0" />
                  info@trailguard.com.np
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="text-xs leading-relaxed text-center">&copy; {new Date().getFullYear()} TrailGuard Nepal. All rights reserved.</p>
          <p className="text-xs text-center">Made with <span className="text-[#FF5F7F]">❤️</span> in Nepal</p>
        </div>
      </div>
    </footer>
  );
}
