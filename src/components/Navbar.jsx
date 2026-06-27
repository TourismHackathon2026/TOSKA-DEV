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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <nav
      className="animate-fadeInDown sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? '#000000' : 'rgba(0,0,0,0.85)',
        borderBottom: scrolled ? '1px solid #2A2A2A' : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 group-hover:opacity-80"
            style={{ background: 'rgba(91,180,255,0.12)' }}
          >
            <Mountain className="h-5 w-5" style={{ color: '#5BB4FF' }} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            TrailGuard
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, path }) => {
            const isActive = location.pathname === path;
            return (
              <li key={path}>
                <Link
                  to={path}
                  className="relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200"
                  style={{ color: isActive ? '#FFFFFF' : '#8E8E9A' }}
                  onMouseEnter={(e) => { if (!isActive) e.target.style.color = '#FFFFFF'; }}
                  onMouseLeave={(e) => { if (!isActive) e.target.style.color = '#8E8E9A'; }}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full" style={{ width: 20, height: 2, background: '#5BB4FF' }} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <button aria-label="Search" className="hidden sm:flex rounded-lg p-2 transition-colors" style={{ color: '#8E8E9A' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8E8E9A'; }}
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          <button aria-label="Notifications" className="relative rounded-lg p-2 transition-colors" style={{ color: '#8E8E9A' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8E8E9A'; }}
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: '#FF453A' }}>3</span>
          </button>

          <Link to="/explore" className="hidden sm:flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-85" style={{ background: '#5BB4FF', color: '#000' }}>
            <MapPin className="h-3.5 w-3.5" />
            Start Tracking
          </Link>

          <button aria-label="Toggle menu" onClick={() => setMobileOpen((v) => !v)} className="rounded-lg p-2 md:hidden" style={{ color: '#8E8E9A' }}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-fadeIn fixed inset-0 top-16 z-40 md:hidden">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setMobileOpen(false)} />
          <div className="animate-slideInRight relative mx-4 mt-2 flex flex-col gap-1 rounded-xl p-4" style={{ background: '#111', border: '1px solid #2A2A2A' }}>
            {NAV_LINKS.map(({ label, path, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link key={path} to={path} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
                  style={{ color: isActive ? '#FFF' : '#8E8E9A', background: isActive ? '#1A1A1A' : 'transparent' }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
            <div style={{ margin: '8px 0', borderTop: '1px solid #2A2A2A' }} />
            <Link to="/explore" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{ background: '#5BB4FF', color: '#000' }}
            >
              <MapPin className="h-4 w-4" /> Start Tracking
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
