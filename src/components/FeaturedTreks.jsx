import { useState, useMemo } from 'react';
import { Compass } from 'lucide-react';
import { FEATURED_TREKS } from '../data/treks';
import TrekCard from './TrekCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

const FILTER_TABS = ['All', 'Easy', 'Moderate', 'Challenging', 'Strenuous'];
const INITIAL_COUNT = 6;

export default function FeaturedTreks() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAll, setShowAll] = useState(false);

  const filteredTreks = useMemo(() => {
    if (activeFilter === 'All') return FEATURED_TREKS;
    return FEATURED_TREKS.filter((t) => {
      // "Easy–Moderate" should match the "Easy" filter too
      if (activeFilter === 'Easy') {
        return t.difficulty === 'Easy' || t.difficulty === 'Easy–Moderate';
      }
      return t.difficulty === activeFilter;
    });
  }, [activeFilter]);

  const visibleTreks = showAll ? filteredTreks : filteredTreks.slice(0, INITIAL_COUNT);
  const hasMore = filteredTreks.length > INITIAL_COUNT;

  const headerRef = useScrollReveal();

  return (
    <section id="featured-treks" className="py-24 sm:py-32 lg:py-40 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div ref={headerRef} className="text-center mb-16 sm:mb-20 lg:mb-24">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5"
          style={{ background: '#E5F5EE', border: '1px solid #C2EAD9', color: '#00965E' }}
        >
          <Compass size={16} style={{ color: '#00965E' }} />
          Curated Adventures
        </div>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Explore Nepal's{' '}
          <span style={{ color: '#00965E' }}>Iconic Trails</span>
        </h2>
        <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#4B5563' }}>
          From the legendary Everest Base Camp to the hidden valleys of Dolpo — discover world-class treks
          powered by real-time smart tracking and safety intelligence.
        </p>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex flex-wrap justify-center gap-3 mb-14 sm:mb-18 lg:mb-20">
        {FILTER_TABS.map((tab) => {
          const isActive = tab === activeFilter;
          return (
            <button
              key={tab}
              id={`filter-${tab.toLowerCase()}`}
              onClick={() => {
                setActiveFilter(tab);
                setShowAll(false); // reset when switching filters
              }}
              className="px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 shadow-sm cursor-pointer hover:shadow-md"
              style={
                isActive
                  ? { background: 'linear-gradient(135deg, #00965E, #005A3C)', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(0, 150, 94, 0.25)' }
                  : { background: '#FFFFFF', border: '1.5px solid #E2E8F0', color: '#4B5563' }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#00965E';
                  e.currentTarget.style.borderColor = '#00965E';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#4B5563';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Trek Grid ── */}
      {visibleTreks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {visibleTreks.map((trek, index) => (
            <div
              key={trek.id}
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <TrekCard trek={trek} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg" style={{ color: '#64748B' }}>No treks found for "{activeFilter}" difficulty.</p>
        </div>
      )}

      {/* ── Show More / Show Less ── */}
      {hasMore && (
        <div className="flex justify-center mt-16 lg:mt-20">
          <button
            id="toggle-treks"
            onClick={() => setShowAll((prev) => !prev)}
            className="group inline-flex items-center gap-2 px-10 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 btn-press"
            style={{ background: '#FFFFFF', border: '1.5px solid #D2D7D5', color: '#4B5563' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00965E';
              e.currentTarget.style.color = '#00965E';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 150, 94, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D2D7D5';
              e.currentTarget.style.color = '#4B5563';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {showAll ? 'Show Less' : 'View All Treks'}
            <span
              className={`transition-transform duration-300 text-lg ${showAll ? 'rotate-90' : ''}`}
            >
              →
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
