import { useState, useMemo } from 'react';
import { Compass } from 'lucide-react';
import { FEATURED_TREKS } from '../data/treks';
import TrekCard from './TrekCard';

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

  return (
    <section id="featured-treks" className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-nature-300 font-medium mb-5">
          <Compass size={16} className="text-nature-400" />
          Curated Adventures
        </div>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Explore Nepal's{' '}
          <span className="gradient-text">Iconic Trails</span>
        </h2>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          From the legendary Everest Base Camp to the hidden valleys of Dolpo — discover world-class treks
          powered by real-time smart tracking and safety intelligence.
        </p>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 sm:mb-14">
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
              className={`px-5 py-2 rounded-full text-sm font-semibold tracking-wide transition-all duration-300
                ${
                  isActive
                    ? 'bg-nature-500 text-white shadow-lg shadow-nature-500/25'
                    : 'glass text-slate-400 hover:text-white hover:border-white/20'
                }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Trek Grid ── */}
      {visibleTreks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
        <div className="text-center py-16">
          <p className="text-slate-500 text-lg">No treks found for "{activeFilter}" difficulty.</p>
        </div>
      )}

      {/* ── Show More / Show Less ── */}
      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            id="toggle-treks"
            onClick={() => setShowAll((prev) => !prev)}
            className="group inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold
                       glass border border-white/10 text-slate-300
                       hover:text-white hover:border-nature-400/40 hover:shadow-lg hover:shadow-nature-500/10
                       transition-all duration-300"
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
