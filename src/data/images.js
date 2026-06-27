// Nepal Trekking Destinations — Stock Image URLs from Unsplash
// All images are served via Unsplash Source for high-quality Nepal photography

const NEPAL_IMAGES = {
  // Hero & Landing Images
  everestSunrise: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&q=80&auto=format',
  annapurnaRange: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1920&q=80&auto=format',
  himalayaPanorama: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=1920&q=80&auto=format',
  poonHillSunrise: 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=1920&q=80&auto=format',
  mountainTrail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80&auto=format',

  // Trek Destinations
  everestBaseCamp: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800&q=80&auto=format',
  annapurnaCircuit: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320?w=800&q=80&auto=format',
  langtangValley: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=800&q=80&auto=format',
  manasluCircuit: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format',
  upperMustang: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=800&q=80&auto=format',
  raraLake: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80&auto=format',
  gosaikunda: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80&auto=format',
  tilichoLake: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80&auto=format',
  mardiHimal: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80&auto=format',
  kanchenjunga: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=800&q=80&auto=format',
  makaluBaseCamp: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80&auto=format',
  dolpoRegion: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80&auto=format',
  phoksundoLake: 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=800&q=80&auto=format',
  khopraRidge: 'https://images.unsplash.com/photo-1540390769625-2fc3f8b1d50c?w=800&q=80&auto=format',
  pikeyPeak: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=800&q=80&auto=format',

  // Cultural & City
  namcheBazaar: 'https://images.unsplash.com/photo-1526712318848-5f38e2740d44?w=800&q=80&auto=format',
  pokharaLakeside: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80&auto=format',
  kathmanduValley: 'https://images.unsplash.com/photo-1558799401-1dcba79834c2?w=800&q=80&auto=format',
  bhaktapurDurbar: 'https://images.unsplash.com/photo-1562462181-0e5f19c89090?w=800&q=80&auto=format',
  prayerFlags: 'https://images.unsplash.com/photo-1529963183134-61a647bbb5a0?w=800&q=80&auto=format',

  // Misc Trekking
  trekkerSilhouette: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80&auto=format',
  suspensionBridge: 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=800&q=80&auto=format',
  campfire: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800&q=80&auto=format',
  mountainLake: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80&auto=format',
  nightSky: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80&auto=format',
};

export default NEPAL_IMAGES;

// Hero Slider images (curated for full-width hero)
export const HERO_SLIDES = [
  {
    image: NEPAL_IMAGES.everestSunrise,
    title: 'Conquer the Roof of the World',
    subtitle: 'Real-time GPS tracking for Everest Base Camp and beyond',
    location: 'Sagarmatha National Park',
  },
  {
    image: NEPAL_IMAGES.annapurnaRange,
    title: 'Annapurna Awaits',
    subtitle: 'Navigate the world\'s most iconic circuit with live telemetry',
    location: 'Annapurna Conservation Area',
  },
  {
    image: NEPAL_IMAGES.himalayaPanorama,
    title: 'Himalayan Intelligence',
    subtitle: 'Weather forecasts, altitude monitoring, and emergency SOS at your fingertips',
    location: 'The Great Himalayan Range',
  },
  {
    image: NEPAL_IMAGES.poonHillSunrise,
    title: 'Every Step Tracked',
    subtitle: 'Smart monitoring keeps your loved ones informed, and rescue teams ready',
    location: 'Poon Hill, Ghorepani',
  },
  {
    image: NEPAL_IMAGES.mountainTrail,
    title: 'Trek Fearlessly',
    subtitle: 'Battery-aware tracking, offline maps, and dead-reckoning navigation',
    location: 'Nepal Himalaya',
  },
];
