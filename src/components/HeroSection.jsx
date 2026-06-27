import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, Radio, Lock, User, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { HERO_SLIDES } from '../data/images';
import { useAuth } from '../context/AuthContext';

const ROTATE_INTERVAL = 8000;
const FEATURE_PILLS = [
  { emoji: '🛰️', label: 'Real-Time GPS' },
  { emoji: '🚨', label: 'Instant SOS' },
  { emoji: '☀️', label: 'Weather Intel' },
];

function renderAccentTitle(title) {
  const words = title.split(' ');
  if (words.length <= 2) return <span style={{ color: '#00965E' }}>{title}</span>;
  const plain = words.slice(0, -2).join(' ');
  const highlighted = words.slice(-2).join(' ');
  return <>{plain}{' '}<span style={{ color: '#00965E' }}>{highlighted}</span></>;
}

export default function HeroSection() {
  const { user, login, logout, error: authError } = useAuth();
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [accountType, setAccountType] = useState('trekker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const goTo = useCallback((index) => setActiveIndex(index), []);
  const goNext = useCallback(() => setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length), []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, goNext]);

  const slide = HERO_SLIDES[activeIndex];

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section id="hero" className="hero-section relative w-full flex items-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images */}
      {HERO_SLIDES.map((s, i) => (
        <img key={i} src={s.image} alt={s.title}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: i === activeIndex ? 1 : 0, zIndex: 0 }}
          loading={i === 0 ? 'eager' : 'lazy'} draggable={false}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 z-[1] gradient-hero" />

      {/* Content Grid */}
      <div className="hero-content relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Heading and Tagline */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <div key={`loc-${activeIndex}`} className="animate-fadeInUp flex items-center gap-2 mb-4">
              <span className="hero-badge">
                <MapPin size={14} className="text-primary" />
                {slide.location}
              </span>
            </div>

            <h1 key={`title-${activeIndex}`} className="animate-fadeInUp animate-delay-100 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              {renderAccentTitle(slide.title)}
            </h1>

            <p key={`sub-${activeIndex}`}
              className="animate-fadeInUp animate-delay-200 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mb-6 text-slate-200"
            >
              {slide.subtitle}
            </p>

            <div key={`cta-${activeIndex}`} className="animate-fadeInUp animate-delay-300 hero-cta-group mb-8">
              <Link to="/explore" id="hero-explore-treks" className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider btn-primary">
                Explore Treks
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/dashboard" id="hero-live-dashboard" className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider btn-primary-outline">
                <Radio size={14} className="text-primary animate-pulse" />
                Live Dashboard
              </Link>
            </div>

            <div key={`pills-${activeIndex}`} className="animate-fadeInUp animate-delay-500 hero-pills">
              {FEATURE_PILLS.map((pill) => (
                <span key={pill.label} className="hero-pill">
                  <span className="text-sm">{pill.emoji}</span>
                  {pill.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Citizens Bank-Style "Secure Access" Widget */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="hero-panel p-6 sm:p-8 animate-fadeInUp">
              
              {/* Login State: NOT Logged In */}
              {!user ? (
                <>
                  <div className="mb-5">
                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      <Lock className="text-primary h-5 w-5" />
                      Secure Online Access
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Select your account type to manage safety permits.</p>
                  </div>

                  {(localError || authError) && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-xs bg-red-50 border-l-4 border-red-500 text-red-700 animate-fadeIn">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {localError || authError}
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Account Type Selector */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Login to:</label>
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                        className="w-full rounded-lg border border-[#D2D7D5] px-3.5 py-2.5 text-xs text-slate-700 font-medium bg-[#F9FAFB] outline-none focus:ring-1 focus:ring-[#00965E] focus:border-[#00965E] transition-all cursor-pointer"
                      >
                        <option value="trekker">Personal Safety Account</option>
                        <option value="guide">Guide & Mountain Operator</option>
                        <option value="rescue">Emergency / Rescue Operator</option>
                      </select>
                    </div>

                    {/* Email Input */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="yourname@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-lg border border-[#D2D7D5] pl-9 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 bg-white outline-none focus:ring-1 focus:ring-[#00965E] focus:border-[#00965E] transition-all"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-lg border border-[#D2D7D5] pl-9 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 bg-white outline-none focus:ring-1 focus:ring-[#00965E] focus:border-[#00965E] transition-all"
                        />
                      </div>
                    </div>

                    {/* Login Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 active:scale-[0.98] cursor-pointer shadow-md btn-primary"
                    >
                      {loading ? (
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          Log In
                        </>
                      )}
                    </button>
                  </form>

                    <div className="mt-5 pt-4 border-t border-surface-300 flex justify-between items-center text-xs">
                    <Link to="/login" className="inline-link font-bold text-primary">Enroll / Register</Link>
                    <Link to="/login" className="inline-link text-slate-500">Forgot Details?</Link>
                  </div>
                </>
              ) : (
                /* Login State: ALREADY Logged In */
                <>
                  <div className="mb-5">
                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      <Sparkles className="text-[#00965E] h-5 w-5" />
                      TrailGuard Safety
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Hello, {user.displayName || 'Adventurer'}!</p>
                  </div>

                  <div className="space-y-4">
                    {/* User Profile Overview */}
                    <div className="p-4 rounded-xl bg-[#E5F5EE] border border-[#C2EAD9] flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#00965E] text-white flex items-center justify-center font-bold text-sm">
                        {(user.displayName || user.email || 'A')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate block">{user.displayName || 'Trekker Profile'}</span>
                        <span className="text-[10px] text-slate-500 truncate block">{user.email}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      <Link to="/dashboard" className="p-3 rounded-lg border border-[#E2E8F0] hover:border-[#00965E] font-semibold text-slate-700 text-center transition-all bg-[#F9FAFB]">
                        Go to Dashboard
                      </Link>
                      <Link to="/explore" className="p-3 rounded-lg border border-[#E2E8F0] hover:border-[#00965E] font-semibold text-slate-700 text-center transition-all bg-[#F9FAFB]">
                        Book Permit
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold uppercase tracking-wider text-[#00965E] border border-[#00965E] hover:bg-[#E5F5EE] transition-all cursor-pointer"
                    >
                      Log Out Profile
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Carousel dots indicator */}
      <div className="hero-dots">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            id={`hero-dot-${i}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`hero-dot ${i === activeIndex ? 'active' : ''}`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 z-[2] pointer-events-none"
        style={{ background: 'linear-gradient(to top, #F4F6F5 0%, transparent 100%)' }}
      />
    </section>
  );
}
