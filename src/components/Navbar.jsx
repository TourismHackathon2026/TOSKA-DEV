import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Mountain,
  Search,
  Bell,
  Menu,
  X,
  Home,
  Compass,
  LayoutDashboard,
  CloudSun,
  ShieldAlert,
  MapPin,
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Explore', path: '/explore', icon: Compass },
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Weather', path: '/weather', icon: CloudSun },
  { label: 'Safety', path: '/safety', icon: ShieldAlert },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <nav
      className={`
        animate-fadeInDown glass sticky top-0 z-50
        transition-all duration-300
        ${scrolled
          ? 'border-b border-white/10 bg-surface-950/80 shadow-lg shadow-black/20'
          : 'border-b border-transparent'}
      `}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* ── Logo ─────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-nature-500/20 text-nature-400 transition-transform duration-300 group-hover:scale-110">
            <Mountain className="h-5 w-5" />
          </div>
          <span className="gradient-text text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            TrailGuard
          </span>
        </Link>

        {/* ── Desktop Nav Links ─────────────────── */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, path }) => {
            const isActive = location.pathname === path;
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={`
                    relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200
                    ${isActive
                      ? 'text-white bg-white/8'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent-start via-accent-mid to-accent-end" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── Right Actions ────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            aria-label="Search"
            className="hidden rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white sm:flex"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-safety-red text-[10px] font-bold text-white">
              3
            </span>
          </button>

          {/* Start Tracking CTA */}
          <Link
            to="/explore"
            className="hidden items-center gap-1.5 rounded-xl bg-nature-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-nature-400 hover:shadow-[var(--shadow-glow-green)] sm:flex"
          >
            <MapPin className="h-4 w-4" />
            Start Tracking
          </Link>

          {/* Mobile Toggle */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/5 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Overlay ─────────────────────── */}
      {mobileOpen && (
        <div className="animate-fadeIn fixed inset-0 top-16 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-surface-950/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div className="animate-slideInRight glass relative mx-4 mt-2 flex flex-col gap-1 rounded-2xl p-4">
            {NAV_LINKS.map(({ label, path, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}

            <div className="my-2 border-t border-white/8" />

            <Link
              to="/explore"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-nature-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-nature-400"
            >
              <MapPin className="h-4 w-4" />
              Start Tracking
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
