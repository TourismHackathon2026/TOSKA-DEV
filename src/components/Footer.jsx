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
    <footer className="glass-light relative mt-auto overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-start to-transparent" />

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* ── Col 1: Brand ───────────────────── */}
          <div className="flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-nature-500/20 text-nature-400 transition-transform duration-300 group-hover:scale-110">
                <Mountain className="h-5 w-5" />
              </div>
              <span
                className="gradient-text text-xl font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                TrailGuard
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              Nepal's smartest trekking platform — real-time GPS tracking,
              weather intelligence, and emergency SOS for every Himalayan
              adventure.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_ICONS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-all duration-200 hover:bg-white/10 hover:text-white hover:scale-110"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2: Explore ─────────────────── */}
          <div>
            <h4
              className="mb-4 text-sm font-semibold uppercase tracking-wider text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Explore
            </h4>
            <ul className="flex flex-col gap-2.5">
              {EXPLORE_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="group flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    <ChevronRight className="h-3 w-3 text-nature-500 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Platform ────────────────── */}
          <div>
            <h4
              className="mb-4 text-sm font-semibold uppercase tracking-wider text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Platform
            </h4>
            <ul className="flex flex-col gap-2.5">
              {PLATFORM_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="group flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    <ChevronRight className="h-3 w-3 text-sky-500 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Contact ─────────────────── */}
          <div>
            <h4
              className="mb-4 text-sm font-semibold uppercase tracking-wider text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Contact
            </h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-nature-400" />
                <span>
                  Tridevi Marg, Thamel
                  <br />
                  Kathmandu 44600, Nepal
                </span>
              </li>
              <li>
                <a
                  href="tel:+977-1-4700000"
                  className="flex items-center gap-3 text-sm text-slate-400 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-sky-400" />
                  +977-1-4700000
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@trailguard.com.np"
                  className="flex items-center gap-3 text-sm text-slate-400 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-accent-mid" />
                  info@trailguard.com.np
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ───────────────────────── */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/8 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} TrailGuard Nepal. All rights
            reserved.
          </p>
          <p className="text-xs text-slate-500">
            Made with <span className="text-safety-red">❤️</span> in Nepal
          </p>
        </div>
      </div>
    </footer>
  );
}
