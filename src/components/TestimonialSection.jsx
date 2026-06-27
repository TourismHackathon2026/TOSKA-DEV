import { Star, Quote } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    role: 'Everest Base Camp Trekker',
    image: '👨‍🏔️',
    rating: 5,
    text: 'TrailGuard\'s real-time tracking gave me complete peace of mind. The SOS feature is a lifesaver!',
    trek: 'Everest Base Camp'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Mountain Enthusiast',
    image: '👩‍🏔️',
    rating: 5,
    text: 'Best safety app I\'ve used. The weather alerts prevented a dangerous storm situation.',
    trek: 'Annapurna Circuit'
  },
  {
    id: 3,
    name: 'Amit Patel',
    role: 'Adventure Guide',
    image: '👨‍💼',
    rating: 5,
    text: 'Group tracking feature makes coordination so easy. My teams feel safer with TrailGuard.',
    trek: 'Langtang Valley'
  },
  {
    id: 4,
    name: 'Sofia Gonzalez',
    role: 'International Trekker',
    image: '🧑‍🤝‍🧑',
    rating: 5,
    text: 'The geofence protection and battery smart mode are incredibly innovative features.',
    trek: 'Manaslu Circuit'
  },
];

export default function TestimonialSection() {
  const headerRef = useScrollReveal();

  return (
    <section className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto space-section-y">
      {/* ── Header ── */}
      <div ref={headerRef} className="text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-5 shadow-sm"
          style={{ background: '#E5F5EE', border: '1px solid #C2EAD9', color: '#00965E' }}
        >
          <Star size={16} style={{ color: '#00965E' }} />
          Trusted by Trekkers
        </div>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 mb-4"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Loved by Our{' '}
          <span style={{ color: '#00965E' }}>Community</span>
        </h2>
        <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#4B5563' }}>
          Join thousands of trekkers who trust TrailGuard for their mountain adventures.
        </p>
      </div>

      {/* ── Testimonials Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {TESTIMONIALS.map((testimonial) => (
          <div
            key={testimonial.id}
            className="glass-card p-card card-lift group overflow-hidden"
            style={{ borderRadius: '20px' }}
          >
            {/* Quote Icon */}
            <div className="mb-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <Quote size={32} style={{ color: '#00965E' }} />
            </div>

            {/* Star Rating */}
            <div className="flex gap-1 mb-4">
              {Array(testimonial.rating).fill(0).map((_, i) => (
                <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-slate-700 mb-6 leading-relaxed font-medium">
              "{testimonial.text}"
            </p>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-5" />

            {/* Author Info */}
            <div className="flex items-center gap-3">
              <div className="text-3xl">{testimonial.image}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{testimonial.name}</p>
                <p className="text-xs" style={{ color: '#4B5563' }}>{testimonial.trek}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Stats Line ── */}
      <div
        className="flex flex-col sm:flex-row items-center justify-around gap-6 p-6 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 150, 94, 0.05) 0%, rgba(0, 150, 94, 0.02) 100%)',
          border: '1px solid rgba(0, 150, 94, 0.1)',
        }}
      >
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: '#00965E' }}>4.9/5</p>
          <p className="text-xs mt-1" style={{ color: '#4B5563' }}>Average Rating</p>
        </div>
        <div className="hidden sm:block w-px h-12 bg-slate-200" />
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: '#00965E' }}>12K+</p>
          <p className="text-xs mt-1" style={{ color: '#4B5563' }}>Happy Trekkers</p>
        </div>
        <div className="hidden sm:block w-px h-12 bg-slate-200" />
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: '#00965E' }}>98%</p>
          <p className="text-xs mt-1" style={{ color: '#4B5563' }}>Would Recommend</p>
        </div>
      </div>
    </section>
  );
}
