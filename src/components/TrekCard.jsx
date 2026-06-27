import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, TrendingUp, Route, Star, Users, X, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createBookingInFirestore } from '../utils/firebaseService';

const DIFFICULTY_COLORS = {
  Easy: { bg: 'bg-emerald-500/90', text: 'text-white' },
  'Easy–Moderate': { bg: 'bg-teal-500/90', text: 'text-white' },
  Moderate: { bg: 'bg-sky-500/90', text: 'text-white' },
  Challenging: { bg: 'bg-orange-500/90', text: 'text-white' },
  Strenuous: { bg: 'bg-red-500/90', text: 'text-white' },
};

function StarRating({ rating, reviews }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<Star key={i} size={14} className="fill-amber-400 text-amber-400" />);
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
      stars.push(<Star key={i} size={14} className="text-surface-600" />);
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

  const diff = DIFFICULTY_COLORS[trek.difficulty] || DIFFICULTY_COLORS.Moderate;

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
      <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition duration-300 card-lift glass-card">
        <div className="relative h-64 overflow-hidden rounded-t-2xl">
          <img
            src={trek.image}
            alt={trek.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className={`absolute top-5 left-5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm ${diff.bg} ${diff.text}`}>
            {trek.difficulty}
          </span>
          {trek.activeTrekkers > 0 && (
            <div className="absolute top-5 right-5 flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-semibold text-slate-700 shadow-md backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <Users className="h-4 w-4 text-primary" />
              <span className="text-primary">{trek.activeTrekkers}</span>
              <span className="hidden sm:inline">active</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 line-clamp-2" style={{ fontFamily: 'var(--font-heading)' }}>
              {trek.name}
            </h3>
            <div className="mt-3 flex items-center gap-2.5 text-sm text-slate-500">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{trek.region}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Clock, label: 'Duration', value: trek.duration },
              { icon: TrendingUp, label: 'Altitude', value: trek.maxAltitude },
              { icon: Route, label: 'Distance', value: trek.distance },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-5 text-center hover:from-slate-100 hover:to-slate-150 transition-all duration-300">
                <Icon className="mx-auto mb-2.5 h-5 w-5 text-primary" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-bold text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          <div className="h-px bg-gradient-to-r from-slate-200 via-slate-200 to-slate-200" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">From</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">${trek.price.toLocaleString()}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="rounded-xl border-2 border-primary px-6 py-3 text-sm font-bold text-primary transition duration-300 hover:bg-primary hover:text-white btn-press"
            >
              Book Now
            </button>
          </div>
        </div>
      </article>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-6 top-6 rounded-full border-2 border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-100 hover:border-slate-300 z-10"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-8 border-b border-slate-200 p-7 md:border-r md:border-b-0 md:p-10">
                <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                  <img src={trek.image} alt={trek.name} className="h-64 w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <span className={`inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] ${diff.bg} ${diff.text}`}>
                      {trek.difficulty}
                    </span>
                    <h3 className="mt-4 text-2xl font-extrabold leading-tight">{trek.name}</h3>
                    <div className="mt-3 flex items-center gap-2.5 text-sm text-slate-200">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{trek.region}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">About this trek</p>
                    <p className="mt-4 text-base leading-8 text-slate-700">{trek.description}</p>
                  </div>

                  {trek.highlights?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Highlights</p>
                      <ul className="mt-4 space-y-3 text-sm text-slate-700">
                        {trek.highlights.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="mt-1 text-primary font-bold text-lg">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 text-sm">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-slate-900">{trek.duration}</div>
                        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Duration</div>
                      </div>
                      <div className="border-x border-slate-200">
                        <div className="text-lg font-bold text-slate-900">{trek.maxAltitude}</div>
                        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Altitude</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-slate-900">{trek.distance}</div>
                        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Distance</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-7 md:p-10 flex flex-col">
                <div className="mb-8">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Book your adventure</p>
                  <h4 className="mt-4 text-xl font-bold text-slate-900">Reserve your safety-certified trek</h4>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Secure your permit, local guide, and telemetry kit for a safer journey.</p>
                </div>

                {bookingSuccess ? (
                  <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-8 text-center flex-1 flex flex-col items-center justify-center">
                    <p className="text-5xl mb-4">✅</p>
                    <p className="text-lg font-bold text-emerald-900">Booking requested!</p>
                    <p className="mt-3 text-sm leading-6 text-slate-700">Our safety team will review your reservation and follow up soon.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setBookingSuccess(false);
                      }}
                      className="mt-8 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white transition hover:opacity-90 btn-press"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookTrek} className="space-y-6 flex flex-col">
                    {bookingError && (
                      <div className="rounded-2xl border-l-4 border-red-500 bg-red-50 p-5 text-sm font-medium text-red-700">
                        <AlertTriangle className="inline mr-2 h-4 w-4" />
                        {bookingError}
                      </div>
                    )}

                    {!user ? (
                      <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/80 p-8 text-center flex-1 flex flex-col items-center justify-center">
                        <p className="text-base leading-7 text-slate-700 mb-6">Please sign in to confirm and manage bookings.</p>
                        <button
                          type="button"
                          onClick={() => navigate('/login')}
                          className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white transition hover:opacity-90 btn-press"
                        >
                          Sign In / Register
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-600">Start date</label>
                          <div className="relative">
                            <Calendar className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-slate-400" />
                            <input
                              type="date"
                              name="startDate"
                              required
                              value={formData.startDate}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border-2 border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/10"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-600">Group size</label>
                          <input
                            type="number"
                            name="groupSize"
                            min="1"
                            max="20"
                            required
                            value={formData.groupSize}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border-2 border-slate-200 bg-white py-3.5 px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/10"
                          />
                        </div>

                        <div className="space-y-4">
                          <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-600">Special requests</label>
                          <textarea
                            name="notes"
                            rows="5"
                            placeholder="Add medical info or special requests..."
                            value={formData.notes}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border-2 border-slate-200 bg-white py-3.5 px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/10 resize-none"
                          />
                        </div>

                        <div className="rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 text-sm">
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                            <span className="text-slate-600">Price per person</span>
                            <span className="font-bold text-slate-900">${trek.price.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-base font-bold text-slate-900">
                            <span>Total estimate</span>
                            <span className="text-primary text-xl">${(trek.price * formData.groupSize).toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={bookingLoading}
                          className="w-full rounded-xl bg-primary px-6 py-4 text-sm font-bold text-white transition btn-press disabled:opacity-60"
                        >
                          {bookingLoading ? (
                            <>
                              <Loader2 className="inline mr-2 h-5 w-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Request Booking'
                          )}
                        </button>
                      </>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
