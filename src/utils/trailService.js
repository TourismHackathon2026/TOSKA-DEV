import { FEATURED_TREKS } from '../data/treks';

const STORAGE_KEY = 'trailguard_treks';

function normalizeTrail(trail, index = 0) {
  const id = trail.id || `trail-${index + 1}`;
  const image = trail.image || '/images/default-trek.jpg';
  return {
    ...trail,
    id,
    image,
    name: trail.name || 'Untitled trail',
    region: trail.region || 'Unknown region',
    difficulty: trail.difficulty || 'Moderate',
    duration: trail.duration || '5 Days',
    maxAltitude: trail.maxAltitude || '3,000m',
    distance: trail.distance || '50 km',
    bestSeason: trail.bestSeason || 'Year-round',
    description: trail.description || 'A scenic trek curated by TrailGuard Nepal.',
    highlights: Array.isArray(trail.highlights) && trail.highlights.length > 0 ? trail.highlights : ['Scenic views'],
    rating: Number(trail.rating || 4.7),
    reviews: Number(trail.reviews || 0),
    price: Number(trail.price || 0),
    activeTrekkers: Number(trail.activeTrekkers || 0),
  };
}

export function getDefaultTrails() {
  return FEATURED_TREKS.map((trail, index) => normalizeTrail(trail, index));
}

export function getTrails() {
  if (typeof window === 'undefined') return getDefaultTrails();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultTrails();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return getDefaultTrails();
    return parsed.map((trail, index) => normalizeTrail(trail, index));
  } catch (error) {
    console.warn('Unable to load custom trails:', error.message);
    return getDefaultTrails();
  }
}

export function saveTrails(trails) {
  if (typeof window === 'undefined') return trails;
  const normalized = (Array.isArray(trails) ? trails : []).map((trail, index) => normalizeTrail(trail, index));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event('trail-data-updated'));
  return normalized;
}

export function upsertTrail(trail) {
  const existing = getTrails();
  const normalizedTrail = normalizeTrail(trail, existing.length);
  const nextTrails = existing.some((item) => item.id === normalizedTrail.id)
    ? existing.map((item) => (item.id === normalizedTrail.id ? normalizedTrail : item))
    : [normalizedTrail, ...existing];
  return saveTrails(nextTrails);
}

export function deleteTrail(trailId) {
  const nextTrails = getTrails().filter((trail) => trail.id !== trailId);
  return saveTrails(nextTrails);
}

export function resetTrails() {
  return saveTrails(getDefaultTrails());
}
