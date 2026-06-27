import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mountain,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, register, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        setSuccess('Account created successfully!');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 pt-24">
      {/* ── Subtle Background ───────────────── */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #5BB4FF, transparent 70%)' }}
        />
      </div>

      {/* ── Auth Card ───────────────── */}
      <div className="animate-fadeInUp relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link to="/" className="group flex items-center gap-2.5">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
              style={{ background: 'rgba(91,180,255,0.15)', color: '#5BB4FF' }}
            >
              <Mountain className="h-6 w-6" />
            </div>
            <span
              className="text-2xl font-bold tracking-tight text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              TrailGuard
            </span>
          </Link>
          <p className="text-sm" style={{ color: '#8E8E9A' }}>
            {isLogin ? 'Welcome back, adventurer' : 'Begin your mountain journey'}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 shadow-2xl shadow-black/20"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
        >
          {/* Tab Switcher */}
          <div className="mb-6 flex rounded-xl p-1" style={{ background: '#111' }}>
            <button
              onClick={() => toggleMode()}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-300`}
              style={{
                background: isLogin ? '#5BB4FF' : 'transparent',
                color: isLogin ? '#000' : '#8E8E9A',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => toggleMode()}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-300`}
              style={{
                background: !isLogin ? '#5BB4FF' : 'transparent',
                color: !isLogin ? '#000' : '#8E8E9A',
              }}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="animate-fadeIn mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
              style={{ background: '#1A1A1A', borderLeft: '3px solid #FF453A', color: '#FF453A' }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              className="animate-fadeIn mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
              style={{ background: '#1A1A1A', borderLeft: '3px solid #30D158', color: '#30D158' }}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          {/* Google Sign-In */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="group mb-5 flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-200 transition-all duration-300 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: '#111', border: '1px solid #2A2A2A' }}
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: '#2A2A2A' }} />
            <span className="text-xs" style={{ color: '#636366' }}>or continue with email</span>
            <div className="h-px flex-1" style={{ background: '#2A2A2A' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
            {/* Name (Register only) */}
            {!isLogin && (
              <div className="animate-fadeIn group relative">
                <User className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-[#5BB4FF]" />
                <input
                  id="auth-name"
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:ring-1"
                  style={{ background: '#111', border: '1px solid #2A2A2A' }}
                  onFocus={(e) => { e.target.style.borderColor = '#5BB4FF'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#2A2A2A'; }}
                />
              </div>
            )}

            {/* Email */}
            <div className="group relative">
              <Mail className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-[#5BB4FF]" />
              <input
                id="auth-email"
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:ring-1"
                style={{ background: '#111', border: '1px solid #2A2A2A' }}
                onFocus={(e) => { e.target.style.borderColor = '#5BB4FF'; }}
                onBlur={(e) => { e.target.style.borderColor = '#2A2A2A'; }}
              />
            </div>

            {/* Password */}
            <div className="group relative">
              <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-[#5BB4FF]" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full rounded-xl py-3 pl-11 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:ring-1"
                style={{ background: '#111', border: '1px solid #2A2A2A' }}
                onFocus={(e) => { e.target.style.borderColor = '#5BB4FF'; }}
                onBlur={(e) => { e.target.style.borderColor = '#2A2A2A'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: '#5BB4FF', color: '#000' }}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer text */}
          <p className="mt-6 text-center text-xs" style={{ color: '#636366' }}>
            {isLogin ? (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={toggleMode} style={{ color: '#5BB4FF' }} className="transition-colors hover:opacity-80">
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={toggleMode} style={{ color: '#5BB4FF' }} className="transition-colors hover:opacity-80">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs" style={{ color: '#636366' }}>
          <Lock className="h-3 w-3" />
          <span>Secured by Firebase Authentication</span>
        </div>
      </div>
    </div>
  );
}
