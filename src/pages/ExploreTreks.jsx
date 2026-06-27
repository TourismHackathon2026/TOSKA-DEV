import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, Mountain, Star, ChevronDown } from 'lucide-react';
import { FEATURED_TREKS } from '../data/treks';
import TrekCard from '../components/TrekCard';

const REGIONS = ['All Regions', 'Solukhumbu', 'Kaski', 'Rasuwa', 'Gorkha', 'Mustang', 'Mugu', 'Manang', 'Taplejung', 'Sankhuwasabha', 'Dolpa'];
const DIFFICULTIES = ['All', 'Easy–Moderate', 'Moderate', 'Challenging', 'Strenuous'];
const SORT_OPTIONS = ['Popular', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Duration'];

export default function ExploreTreks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');
  const [showFilters, setShowFilters] = useState(false);

  let filtered = FEATURED_TREKS.filter(trek => {
    const matchesSearch = trek.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trek.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All Regions' || trek.region === selectedRegion;
    const matchesDifficulty = selectedDifficulty === 'All' || trek.difficulty === selectedDifficulty;
    return matchesSearch && matchesRegion && matchesDifficulty;
  });

  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'Price: Low to High': return a.price - b.price;
      case 'Price: High to Low': return b.price - a.price;
      case 'Rating': return b.rating - a.rating;
      case 'Duration': return parseInt(a.duration) - parseInt(b.duration);
      default: return b.reviews - a.reviews;
    }
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="animate-fadeInUp">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-nature-600), var(--color-nature-400))' }}>
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(61,122,71,0.15)', color: 'var(--color-nature-400)' }}>
              {FEATURED_TREKS.length} Treks Available
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Explore <span className="gradient-text">Nepal's Trails</span>
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: 'rgba(226,232,240,0.6)' }}>
            Discover the world's most breathtaking trekking routes, from the roof of the world to hidden valleys.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="glass-card p-4 sm:p-6 animate-fadeInUp animate-delay-100">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(226,232,240,0.4)' }} />
              <input
                type="text"
                placeholder="Search treks by name or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-0 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
                style={{ background: 'var(--color-surface-800)', focusRingColor: 'var(--color-nature-500)' }}
              />
            </div>
            {/* Toggle Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{ background: showFilters ? 'var(--color-nature-600)' : 'var(--color-surface-700)', color: '#e2e8f0' }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 animate-fadeIn" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Region */}
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(226,232,240,0.5)' }}>Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-white border-0 focus:outline-none"
                  style={{ background: 'var(--color-surface-800)' }}
                >
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {/* Difficulty */}
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(226,232,240,0.5)' }}>Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-white border-0 focus:outline-none"
                  style={{ background: 'var(--color-surface-800)' }}
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {/* Sort */}
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(226,232,240,0.5)' }}>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-white border-0 focus:outline-none"
                  style={{ background: 'var(--color-surface-800)' }}
                >
                  {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <p className="text-sm" style={{ color: 'rgba(226,232,240,0.5)' }}>
          Showing <span className="font-semibold text-white">{filtered.length}</span> trek{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Trek Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((trek, i) => (
              <div key={trek.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s` }}>
                <TrekCard trek={trek} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-2xl">
            <Mountain className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(226,232,240,0.2)' }} />
            <h3 className="text-xl font-semibold mb-2">No treks found</h3>
            <p style={{ color: 'rgba(226,232,240,0.5)' }}>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
