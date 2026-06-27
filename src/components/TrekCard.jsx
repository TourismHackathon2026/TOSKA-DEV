import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, TrendingUp, Route, Star, Users, X, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createBookingInFirestore } from '../utils/firebaseService';

const DIFFICULTY_COLORS = {
  'Easy':           { bg: 'bg-emerald-500/90', text: 'text-white' },
  'Easy–Moderate':  { bg: 'bg-teal-500/90',    text: 'text-white' },
  'Moderate':       { bg: 'bg-sky-500/90',      text: 'text-white' },
  'Challenging':    { bg: 'bg-orange-500/90',   text: 'text-white' },
  'Strenuous':      { bg: 'bg-red-500/90',      text: 'text-white' },
};

function StarRating({ rating, reviews }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(
        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
      );
    } else if (i === full && hasHalf) {
      stars.push(
        <span key={i} className="relative inline-block" style={{ width: 14, height: 14 }}>
          <Star size={14} className="text-surface-600 absolute inset-0" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star size={14} className="fill-amber-400 text-amber-400" />
          </span>
        </span>
      );
    } else {
      stars.push(
        <Star key={i} size={14} className="text-surface-600" />
      );
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">{stars}</div>
      <span className="text-amber-400 text-sm font-semibold">{rating}</span>
      <span className="text-xs" style={{ color: '#636366' }}>({reviews.toLocaleString()})</span>
    </div>
  );
}

export default function TrekCard({ trek }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [formData, setFormData] = useState({
    startDate: '',
    groupSize: 1,
    notes: '',
  });

  const diff = DIFFICULTY_COLORS[trek.difficulty] || DIFFICULTY_COLORS['Moderate'];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBookTrek = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setBookingError('');
    setBookingSuccess(false);
    setBookingLoading(true);

    try {
      const totalPrice = trek.price * formData.groupSize;
      await createBookingInFirestore({
        trekId: trek.id,
        startDate: formData.startDate,
        groupSize: formData.groupSize,
        totalPrice,
        notes: formData.notes,
      });
      setBookingSuccess(true);
      setFormData({ startDate: '', groupSize: 1, notes: '' });
    } catch (err) {
      console.error(err);
      setBookingError(err.message || 'Failed to place booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <>
      <article
        id={`trek-card-${trek.id}`}
        className="group flex flex-col overflow-hidden transition-all duration-400"
        style={{
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          borderRadius: '16px',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#444'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; }}
      >
        {/* ── Image ── */}
        <div className="relative h-52 sm:h-56 overflow-hidden">
          <img
            src={trek.image}
            alt={trek.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          {/* Dark overlay on image */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, #000 0%, transparent 60%)' }}
          />

          {/* Difficulty Badge */}
          <span
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                        backdrop-blur-md ${diff.bg} ${diff.text}`}
          >
            {trek.difficulty}
          </span>

          {/* Active Trekkers Badge */}
          {trek.activeTrekkers > 0 && (
            <div
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #2A2A2A', color: '#ccc' }}
            >
              <span className="live-dot" style={{ width: 6, height: 6 }} />
              <Users size={12} style={{ color: '#30D158' }} />
              <span className="font-semibold" style={{ color: '#30D158' }}>{trek.activeTrekkers}</span>
              <span className="hidden sm:inline">active</span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col flex-1 p-5">
          {/* Name */}
          <h3
            className="text-lg font-bold text-white mb-1 transition-colors duration-300 line-clamp-1"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {trek.name}
          </h3>

          {/* Region */}
          <div className="flex items-center gap-1 text-sm mb-4" style={{ color: '#8E8E9A' }}>
            <MapPin size={13} style={{ color: '#5BB4FF' }} className="flex-shrink-0" />
            {trek.region}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: Clock,      label: 'Duration', value: trek.duration },
              { icon: TrendingUp, label: 'Altitude', value: trek.maxAltitude },
              { icon: Route,      label: 'Distance', value: trek.distance },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center px-1 py-2.5 rounded-xl"
                style={{ background: '#111', border: '1px solid #1A1A1A' }}
              >
                <Icon size={15} style={{ color: '#5BB4FF' }} className="mb-1" />
                <span className="text-[11px] uppercase tracking-wider" style={{ color: '#636366' }}>{label}</span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5">{value}</span>
              </div>
            ))}
          </div>

          {/* Rating */}
          <div className="mb-5">
            <StarRating rating={trek.rating} reviews={trek.reviews} />
          </div>

          {/* Price + CTA */}
          <div className="mt-auto flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider block" style={{ color: '#636366' }}>From</span>
              <span className="text-xl font-bold text-white">${trek.price.toLocaleString()}</span>
            </div>
            <button
              id={`trek-view-${trek.id}`}
              onClick={() => setIsOpen(true)}
              className="px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300"
              style={{
                background: 'transparent',
                color: '#5BB4FF',
                border: '1px solid #5BB4FF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#5BB4FF';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#5BB4FF';
              }}
            >
              View Details
            </button>
          </div>
        </div>
      </article>

      {/* ── Trek Details & Booking Modal ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 overflow-y-auto animate-fadeIn"
          style={{ background: 'rgba(0, 0, 0, 0.85)' }}
          onClick={() => {
            setIsOpen(false);
            setBookingSuccess(false);
            setBookingError('');
          }}
        >
          <div
            className="relative w-full max-w-4xl rounded-3xl overflow-hidden animate-fadeInUp flex flex-col md:flex-row"
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                setBookingSuccess(false);
                setBookingError('');
              }}
              className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white transition-colors p-2 rounded-full cursor-pointer"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Left Column: Trek Media & Info */}
            <div className="md:w-1/2 flex flex-col overflow-y-auto max-h-[45vh] md:max-h-none" style={{ borderRight: '1px solid #2A2A2A' }}>
              <div className="relative h-60 md:h-72 overflow-hidden flex-shrink-0">
                <img
                  src={trek.image}
                  alt={trek.name}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, #1A1A1A 0%, rgba(26,26,26,0.3) 40%, transparent 100%)' }}
                />
                <div className="absolute bottom-5 left-6 right-6">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${diff.bg} ${diff.text}`}>
                    {trek.difficulty}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    {trek.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm mt-1" style={{ color: '#8E8E9A' }}>
                    <MapPin size={12} style={{ color: '#5BB4FF' }} />
                    {trek.region}
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 flex-1">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">About this Trek</h4>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#8E8E9A' }}>
                  {trek.description}
                </p>

                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Highlights</h4>
                <ul className="space-y-2 mb-6">
                  {trek.highlights && trek.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#ccc' }}>
                      <span style={{ color: '#5BB4FF' }} className="mt-0.5">✦</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl" style={{ background: '#111', border: '1px solid #2A2A2A' }}>
                  <div className="text-center">
                    <span className="block text-[10px] uppercase tracking-wider" style={{ color: '#636366' }}>Duration</span>
                    <span className="text-xs font-semibold text-slate-200">{trek.duration}</span>
                  </div>
                  <div className="text-center" style={{ borderLeft: '1px solid #2A2A2A', borderRight: '1px solid #2A2A2A' }}>
                    <span className="block text-[10px] uppercase tracking-wider" style={{ color: '#636366' }}>Altitude</span>
                    <span className="text-xs font-semibold text-slate-200">{trek.maxAltitude}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] uppercase tracking-wider" style={{ color: '#636366' }}>Distance</span>
                    <span className="text-xs font-semibold text-slate-200">{trek.distance}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Booking System */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center overflow-y-auto max-h-[45vh] md:max-h-none">
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Book Your Adventure
              </h3>
              <p className="text-xs mb-6" style={{ color: '#636366' }}>
                Secure your permit, local guide, and telemetry safety kit for the trek.
              </p>

              {bookingSuccess ? (
                <div
                  className="text-center py-8 px-4 rounded-2xl text-slate-200 animate-fadeIn"
                  style={{ background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)' }}
                >
                  <span className="text-4xl block mb-3">🏔️</span>
                  <h4 className="text-lg font-bold mb-1" style={{ color: '#30D158' }}>Trek Booking Requested!</h4>
                  <p className="text-xs mb-6" style={{ color: '#8E8E9A' }}>
                    Our safety guides will review your booking itinerary and approve it.
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setBookingSuccess(false);
                    }}
                    className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                    style={{ background: '#5BB4FF', color: '#000' }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookTrek} className="flex flex-col gap-4">
                  {/* Status Banner */}
                  {bookingError && (
                    <div
                      className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs animate-fadeIn"
                      style={{ background: '#1A1A1A', borderLeft: '3px solid #FF453A', color: '#FF453A' }}
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {bookingError}
                    </div>
                  )}

                  {!user ? (
                    <div className="text-center py-6 rounded-2xl" style={{ border: '1px solid #2A2A2A', background: '#111' }}>
                      <p className="text-sm mb-4" style={{ color: '#8E8E9A' }}>Please log in to manage and confirm bookings.</p>
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer"
                        style={{ background: '#5BB4FF', color: '#000' }}
                      >
                        Sign In / Register
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Date */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium" style={{ color: '#8E8E9A' }}>Select Start Date</label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#636366' }} />
                          <input
                            type="date"
                            name="startDate"
                            required
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="w-full rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-slate-500 outline-none transition-all"
                            style={{ background: '#111', border: '1px solid #2A2A2A' }}
                            onFocus={(e) => { e.target.style.borderColor = '#5BB4FF'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#2A2A2A'; }}
                          />
                        </div>
                      </div>

                      {/* Group Size */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium" style={{ color: '#8E8E9A' }}>Number of Trekkers</label>
                        <input
                          type="number"
                          name="groupSize"
                          min="1"
                          max="20"
                          required
                          value={formData.groupSize}
                          onChange={handleInputChange}
                          className="w-full rounded-xl py-3 px-4 text-xs text-white placeholder-slate-500 outline-none transition-all"
                          style={{ background: '#111', border: '1px solid #2A2A2A' }}
                          onFocus={(e) => { e.target.style.borderColor = '#5BB4FF'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#2A2A2A'; }}
                        />
                      </div>

                      {/* Notes */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium" style={{ color: '#8E8E9A' }}>Special Notes / Medical Info</label>
                        <textarea
                          name="notes"
                          rows="3"
                          placeholder="e.g. Dietary requirements, medical concerns, or request a specific guide..."
                          value={formData.notes}
                          onChange={handleInputChange}
                          className="w-full rounded-xl py-3 px-4 text-xs text-white placeholder-slate-500 outline-none resize-none transition-all"
                          style={{ background: '#111', border: '1px solid #2A2A2A' }}
                          onFocus={(e) => { e.target.style.borderColor = '#5BB4FF'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#2A2A2A'; }}
                        />
                      </div>

                      {/* Live Price Estimation */}
                      <div className="mt-2 flex items-center justify-between p-4 rounded-2xl" style={{ background: '#111', border: '1px solid #2A2A2A' }}>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider block" style={{ color: '#636366' }}>Price per Person</span>
                          <span className="text-sm font-semibold" style={{ color: '#8E8E9A' }}>${trek.price.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider block" style={{ color: '#636366' }}>Total Booking Est.</span>
                          <span className="text-lg font-bold text-white">${(trek.price * formData.groupSize).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={bookingLoading}
                        className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        style={{ background: '#5BB4FF', color: '#000' }}
                      >
                        {bookingLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          'Request Booking Reservation'
                        )}
                      </button>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
