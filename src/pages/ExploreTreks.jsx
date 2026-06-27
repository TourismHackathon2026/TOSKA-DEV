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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#5BB4FF' }}>
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-sm font-medium px-3 py-1 rounded-full"
              style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#5BB4FF' }}
            >
              {FEATURED_TREKS.length} Treks Available
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Explore <span style={{ color: '#5BB4FF' }}>Nepal's Trails</span>
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: '#8E8E9A' }}>
            Discover the world's most breathtaking trekking routes, from the roof of the world to hidden valleys.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div
          className="p-4 sm:p-6 animate-fadeInUp animate-delay-100"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px' }}
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#636366' }} />
              <input
                type="text"
                placeholder="Search treks by name or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-0 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
                style={{ background: '#111', focusRingColor: '#5BB4FF' }}
              />
            </div>
            {/* Toggle Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{
                background: showFilters ? '#5BB4FF' : '#222',
                color: showFilters ? '#000' : '#e2e8f0',
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 animate-fadeIn" style={{ borderTop: '1px solid #2A2A2A' }}>
              {/* Region */}
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: '#636366' }}>Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-white border-0 focus:outline-none"
                  style={{ background: '#111' }}
                >
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {/* Difficulty */}
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: '#636366' }}>Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-white border-0 focus:outline-none"
                  style={{ background: '#111' }}
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {/* Sort */}
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: '#636366' }}>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-white border-0 focus:outline-none"
                  style={{ background: '#111' }}
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
        <p className="text-sm" style={{ color: '#636366' }}>
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
          <div
            className="text-center py-20 rounded-2xl"
            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
          >
            <Mountain className="w-16 h-16 mx-auto mb-4" style={{ color: '#636366' }} />
            <h3 className="text-xl font-semibold mb-2 text-white">No treks found</h3>
            <p style={{ color: '#636366' }}>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
