import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NEPAL_IMAGES from '../data/images';
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
  const [activeField, setActiveField] = useState('');

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

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim().toLowerCase();
    const trimmedPassword = formData.password.trim();

    if (!trimmedEmail || !trimmedPassword || (!isLogin && !trimmedName)) {
      setError(isLogin ? 'Please enter your email and password.' : 'Please enter your full name, email, and password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(trimmedEmail, trimmedPassword);
      } else {
        await register({
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
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
    setActiveField('');
    setFormData({ name: '', email: '', password: '' });
  };

  const showFieldHint = (fieldName) => activeField !== fieldName && !formData[fieldName];

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 pt-24"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(7, 23, 16, 0.86) 0%, rgba(0, 92, 60, 0.72) 45%, rgba(10, 25, 34, 0.88) 100%), url(${NEPAL_IMAGES.himalayaPanorama})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* ── Scenic Overlay ───────────────── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.2),_transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.08)_0%,_transparent_40%,_rgba(255,255,255,0.06)_100%)]" />

      {/* ── Auth Card ───────────────── */}
      <div className="animate-fadeInUp relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm bg-[rgba(0,150,94,0.1)] text-primary-dark">
              <Mountain className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-800 font-heading">
              TrailGuard
            </span>
          </Link>
          <p className="text-sm text-slate-500">
            {isLogin ? 'Welcome back, adventurer' : 'Begin your mountain journey'}
          </p>
        </div>

        {/* Card */}
        <div className="section-card glass-soft rounded-[28px] p-8 shadow-[0_30px_120px_rgba(2,12,8,0.35)]">
          {/* Tab Switcher */}
          <div className="mb-6 flex rounded-xl border border-[#DDEBE2] bg-[#F4F8F5] p-1">
            <button
              onClick={() => toggleMode()}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 cursor-pointer ${isLogin ? 'btn-primary-solid text-white' : 'btn-ghost text-slate-700'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => toggleMode()}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 cursor-pointer ${!isLogin ? 'btn-primary-solid text-white' : 'btn-ghost text-slate-700'}`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="animate-fadeIn mb-4 flex items-center gap-2 rounded-xl border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="animate-fadeIn mb-4 flex items-center gap-2 rounded-xl border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <Sparkles className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          {/* Google Sign-In */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="group mb-6 flex w-full items-center justify-center gap-3 rounded-xl btn-primary-outline disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="mb-7 mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">or continue with email</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-5">
            {/* Name (Register only) */}
            {!isLogin && (
              <div className="animate-fadeIn group relative">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">Full Name</label>
                {showFieldHint('name') && (
                  <div className="pointer-events-none absolute left-3.5 top-10 flex items-center gap-2 text-slate-400 transition-all duration-200">
                    <User className="h-[16px] w-[16px]" />
                  </div>
                )}
                <input
                  id="auth-name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  aria-label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full rounded-2xl border border-[#DCE8DE] bg-[#F8FCF9] px-4 py-3.5 pl-11 text-sm text-slate-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#00965E] focus:bg-[#F5FFF9] focus:ring-2 focus:ring-[#00965E]/20"
                />
              </div>
            )}

            {/* Email */}
            <div className="group relative">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">Email Address</label>
              {showFieldHint('email') && (
                <div className="pointer-events-none absolute left-3.5 top-10 flex items-center gap-2 text-slate-400 transition-all duration-200">
                  <Mail className="h-[16px] w-[16px]" />
                </div>
              )}
              <input
                id="auth-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                aria-label="Email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-[#DCE8DE] bg-[#F8FCF9] px-4 py-3.5 pl-11 text-sm text-slate-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#00965E] focus:bg-[#F5FFF9] focus:ring-2 focus:ring-[#00965E]/20"
              />
            </div>

            {/* Password */}
            <div className="group relative">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">Password</label>
              {showFieldHint('password') && (
                <div className="pointer-events-none absolute left-3.5 top-10 flex items-center gap-2 text-slate-400 transition-all duration-200">
                  <Lock className="h-[16px] w-[16px]" />
                </div>
              )}
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                aria-label="Password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full rounded-2xl border border-[#DCE8DE] bg-[#F8FCF9] px-4 py-3.5 pl-11 pr-12 text-sm text-slate-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#00965E] focus:bg-[#F5FFF9] focus:ring-2 focus:ring-[#00965E]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-10 text-slate-400 transition-colors hover:text-slate-600"
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
              className="btn-primary-solid group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-50"
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
          <p className="mt-7 text-center text-xs text-slate-500">
            {isLogin ? (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={toggleMode} className="transition-colors hover:opacity-80 font-bold text-primary-dark cursor-pointer">
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={toggleMode} className="transition-colors hover:opacity-80 font-bold text-primary-dark cursor-pointer">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Lock className="h-3 w-3" />
          <span>Secured by Firebase Authentication</span>
        </div>
      </div>
    </div>
  );
}
