import { MapPin, Clock, TrendingUp, Route, Star, Users } from 'lucide-react';

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
      <span className="text-slate-500 text-xs">({reviews.toLocaleString()})</span>
    </div>
  );
}

export default function TrekCard({ trek }) {
  const diff = DIFFICULTY_COLORS[trek.difficulty] || DIFFICULTY_COLORS['Moderate'];

  return (
    <article
      id={`trek-card-${trek.id}`}
      className="glass-card group flex flex-col overflow-hidden hover:shadow-2xl hover:shadow-nature-900/20
                 transition-all duration-400 hover:-translate-y-1.5"
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
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/70 via-transparent to-transparent" />

        {/* Difficulty Badge */}
        <span
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                      backdrop-blur-md ${diff.bg} ${diff.text}`}
        >
          {trek.difficulty}
        </span>

        {/* Active Trekkers Badge */}
        {trek.activeTrekkers > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full
                          bg-surface-950/60 backdrop-blur-md border border-white/10 text-xs text-slate-300">
            <span className="live-dot" style={{ width: 6, height: 6 }} />
            <Users size={12} className="text-safety-green" />
            <span className="font-semibold text-safety-green">{trek.activeTrekkers}</span>
            <span className="hidden sm:inline">active</span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5">
        {/* Name */}
        <h3
          className="text-lg font-bold text-white mb-1 group-hover:text-nature-300 transition-colors duration-300 line-clamp-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {trek.name}
        </h3>

        {/* Region */}
        <div className="flex items-center gap-1 text-slate-400 text-sm mb-4">
          <MapPin size={13} className="text-nature-400 flex-shrink-0" />
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
              className="flex flex-col items-center text-center px-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.05]"
            >
              <Icon size={15} className="text-sky-400 mb-1" />
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">{label}</span>
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
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block">From</span>
            <span className="text-xl font-bold text-white">${trek.price.toLocaleString()}</span>
          </div>
          <button
            id={`trek-view-${trek.id}`}
            className="px-5 py-2 rounded-xl text-sm font-semibold
                       bg-nature-500/15 text-nature-300 border border-nature-500/25
                       hover:bg-nature-500 hover:text-white hover:border-nature-400
                       transition-all duration-300 hover:shadow-lg hover:shadow-nature-500/20"
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}
