import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToNotifications } from '../utils/firebaseService';
import NotificationsPanel from './NotificationsPanel';
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
  ShieldCheck,
  MapPin,
  Mail,
  Users,
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Explore', path: '/explore', icon: Compass },
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Groups', path: '/groups', icon: Users },
  { label: 'Weather', path: '/weather', icon: CloudSun },
  { label: 'Safety', path: '/safety', icon: ShieldAlert },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const activeLinks = isAdmin
    ? [...NAV_LINKS, { label: 'Admin', path: '/admin', icon: ShieldCheck }]
    : NAV_LINKS;

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return undefined;
    }

    let isMounted = true;
    let unsubscribe = null;

    const loadNotifications = async () => {
      try {
        unsubscribe = subscribeToNotifications(user.uid, setNotifications);
      } catch (error) {
        console.warn('Notifications unavailable:', error.message);
        if (isMounted) setNotifications([]);
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [user]);

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
    <nav className={`animate-fadeInDown sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md border-b border-slate-100' : 'bg-white/98 backdrop-blur-md'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm"
            style={{ background: 'linear-gradient(135deg, rgba(0,150,94,0.1), rgba(0,150,94,0.05))' }}
          >
            <Mountain className="h-5 w-5" style={{ color: '#00965E' }} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            TrailGuard
          </span>
        </Link>

        <ul className="hidden items-center gap-2 md:flex lg:gap-3">
          {activeLinks.map(({ label, path }) => {
            const isActive = location.pathname === path;
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={`nav-link ${isActive ? 'active text-primary' : 'text-slate-700 hover:text-primary hover:bg-slate-100'}`}>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <button aria-label="Search" className="hidden sm:flex rounded-lg p-2.5 transition-all text-slate-600 hover:text-primary hover:bg-slate-100 duration-200">
            <Search className="h-5 w-5" />
          </button>

          {user && (
            <div className="hidden items-center gap-2.5 rounded-full border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-2 sm:flex hover:border-primary transition-colors duration-200">
              <Mail className="h-4 w-4 text-primary" />
              <span className="max-w-[150px] truncate text-sm font-medium text-slate-700">
                {user.email || 'Signed in'}
              </span>
            </div>
          )}

          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:border-primary hover:text-primary hover:bg-primary/5 duration-200 shadow-sm"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 px-1 text-xs font-bold text-white shadow-md">
                  {notifications.length}
                </span>
              )}
            </button>
            <NotificationsPanel
              notifications={notifications}
              visible={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </div>

          <Link to="/explore" className="hidden sm:inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200 bg-gradient-to-r from-primary to-primary/90 text-white shadow-md">
            <MapPin className="h-4 w-4" />
            Start Tracking
          </Link>

          <button aria-label="Toggle menu" onClick={() => setMobileOpen((v) => !v)} className="rounded-lg p-2.5 md:hidden text-slate-600 hover:text-primary hover:bg-slate-100 transition-all duration-200">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-fadeIn fixed inset-0 top-16 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="animate-slideInRight relative mx-4 mt-3 flex flex-col gap-2 rounded-2xl p-5 shadow-xl bg-white border border-slate-200">
            {activeLinks.map(({ label, path, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link key={path} to={path} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all duration-200 ${isActive ? 'text-primary bg-primary/10 border border-primary/20' : 'text-slate-700 hover:bg-slate-100 hover:text-primary'}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {label}
                </Link>
              );
            })}
            <div className="my-3 border-t border-slate-200" />
            <Link to="/explore" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <MapPin className="h-5 w-5" /> Start Tracking
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
