import Database from 'better-sqlite3';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, 'trailguard.db'));

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firebase_uid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      emergency_contact TEXT,
      avatar TEXT DEFAULT 'default-avatar.png',
      role TEXT DEFAULT 'trekker',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS treks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      duration TEXT NOT NULL,
      max_altitude TEXT NOT NULL,
      distance TEXT NOT NULL,
      best_season TEXT NOT NULL,
      image TEXT NOT NULL,
      description TEXT NOT NULL,
      highlights TEXT NOT NULL,
      rating REAL DEFAULT 0,
      reviews INTEGER DEFAULT 0,
      price INTEGER NOT NULL,
      active_trekkers INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      trek_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      group_size INTEGER DEFAULT 1,
      status TEXT DEFAULT 'pending',
      total_price INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (trek_id) REFERENCES treks(id)
    );

    CREATE TABLE IF NOT EXISTS sos_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      latitude REAL,
      longitude REAL,
      altitude REAL,
      message TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS weather_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      region TEXT NOT NULL,
      temp REAL,
      feels_like REAL,
      condition TEXT,
      wind REAL,
      humidity INTEGER,
      uv INTEGER,
      visibility INTEGER,
      pressure INTEGER,
      icon TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trek_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      trek_id TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      altitude REAL,
      battery INTEGER,
      speed REAL,
      status TEXT DEFAULT 'active',
      logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (trek_id) REFERENCES treks(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      trek_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (trek_id) REFERENCES treks(id)
    );
  `);

  console.log('✅ Database tables initialized');
}

function seedDatabase() {
  // Check if data already exists (idempotent)
  const trekCount = db.prepare('SELECT COUNT(*) as count FROM treks').get();
  if (trekCount.count > 0) {
    console.log('ℹ️  Database already seeded, skipping...');
    return;
  }

  console.log('🌱 Seeding database...');

  // ── Seed Treks ──
  const insertTrek = db.prepare(`
    INSERT INTO treks (id, name, region, difficulty, duration, max_altitude, distance, best_season, image, description, highlights, rating, reviews, price, active_trekkers)
    VALUES (@id, @name, @region, @difficulty, @duration, @max_altitude, @distance, @best_season, @image, @description, @highlights, @rating, @reviews, @price, @active_trekkers)
  `);

  const treks = [
    {
      id: 'ebc-trek',
      name: 'Everest Base Camp Trek',
      region: 'Solukhumbu',
      difficulty: 'Challenging',
      duration: '14 Days',
      max_altitude: '5,364m',
      distance: '130 km',
      best_season: 'Mar-May, Sep-Nov',
      image: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=800',
      description: "The legendary trek to the foot of the world's highest peak. Experience breathtaking views of Everest, Lhotse, and Nuptse while immersing yourself in Sherpa culture.",
      highlights: JSON.stringify(['Stunning views of Mt. Everest', 'Visit Namche Bazaar', 'Tengboche Monastery', 'Sherpa culture experience', 'Kala Patthar viewpoint']),
      price: 1450,
      rating: 4.9,
      reviews: 2847,
      active_trekkers: 234
    },
    {
      id: 'abc-trek',
      name: 'Annapurna Base Camp',
      region: 'Kaski',
      difficulty: 'Moderate',
      duration: '10 Days',
      max_altitude: '4,130m',
      distance: '110 km',
      best_season: 'Mar-May, Oct-Dec',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
      description: 'Trek through diverse landscapes from lush rhododendron forests to the dramatic Annapurna Sanctuary, surrounded by towering Himalayan peaks.',
      highlights: JSON.stringify(['Annapurna Sanctuary', 'Machapuchare views', 'Hot springs at Jhinu', 'Rhododendron forests', 'Gurung villages']),
      price: 980,
      rating: 4.8,
      reviews: 3214,
      active_trekkers: 187
    },
    {
      id: 'langtang-trek',
      name: 'Langtang Valley Trek',
      region: 'Rasuwa',
      difficulty: 'Moderate',
      duration: '7 Days',
      max_altitude: '3,870m',
      distance: '68 km',
      best_season: 'Mar-May, Oct-Nov',
      image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800',
      description: 'Explore the beautiful Langtang Valley, known as the valley of glaciers. A perfect blend of natural beauty and Tamang culture.',
      highlights: JSON.stringify(['Langtang Glacier', 'Kyanjin Gompa', 'Cheese factory visit', 'Tamang heritage', 'Tserko Ri viewpoint']),
      price: 720,
      rating: 4.7,
      reviews: 1856,
      active_trekkers: 98
    },
    {
      id: 'manaslu-circuit',
      name: 'Manaslu Circuit Trek',
      region: 'Gorkha',
      difficulty: 'Strenuous',
      duration: '16 Days',
      max_altitude: '5,106m',
      distance: '177 km',
      best_season: 'Mar-May, Sep-Nov',
      image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800',
      description: 'A remote and challenging trek around the eighth highest mountain in the world. Experience pristine wilderness and authentic village life.',
      highlights: JSON.stringify(['Larkya La Pass (5,106m)', 'Remote villages', 'Manaslu views', 'Buddhist monasteries', 'Diverse ecosystems']),
      price: 1680,
      rating: 4.9,
      reviews: 987,
      active_trekkers: 45
    },
    {
      id: 'upper-mustang',
      name: 'Upper Mustang Trek',
      region: 'Mustang',
      difficulty: 'Moderate',
      duration: '12 Days',
      max_altitude: '3,810m',
      distance: '156 km',
      best_season: 'Jun-Sep',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
      description: 'Journey to the ancient kingdom of Lo, a hidden gem beyond the Himalayas. Discover cave monasteries, ancient art, and dramatic desert landscapes.',
      highlights: JSON.stringify(['Lo Manthang walled city', 'Ancient cave monasteries', 'Tibetan culture', 'Desert landscapes', 'Restricted area permit']),
      price: 2100,
      rating: 4.8,
      reviews: 654,
      active_trekkers: 32
    },
    {
      id: 'rara-lake',
      name: 'Rara Lake Trek',
      region: 'Mugu',
      difficulty: 'Moderate',
      duration: '8 Days',
      max_altitude: '3,710m',
      distance: '62 km',
      best_season: 'Sep-Nov, Apr-May',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
      description: "Trek to Nepal's largest lake, a pristine alpine jewel surrounded by dense forests and snow-capped peaks in the remote far-western region.",
      highlights: JSON.stringify(['Rara National Park', 'Crystal clear lake', 'Remote wilderness', 'Bird watching', 'Thakuri culture']),
      price: 890,
      rating: 4.6,
      reviews: 432,
      active_trekkers: 18
    },
    {
      id: 'gosaikunda',
      name: 'Gosaikunda Sacred Lake',
      region: 'Rasuwa',
      difficulty: 'Moderate',
      duration: '5 Days',
      max_altitude: '4,380m',
      distance: '42 km',
      best_season: 'Mar-May, Sep-Nov',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      description: 'A sacred pilgrimage trek to the holy lakes of Gosaikunda, believed to have been created by Lord Shiva. Popular during the Janai Purnima festival.',
      highlights: JSON.stringify(['Sacred alpine lakes', 'Laurebina Pass', 'Religious significance', 'Alpine meadows', 'Panoramic views']),
      price: 480,
      rating: 4.5,
      reviews: 1234,
      active_trekkers: 67
    },
    {
      id: 'tilicho-lake',
      name: 'Tilicho Lake Trek',
      region: 'Manang',
      difficulty: 'Strenuous',
      duration: '11 Days',
      max_altitude: '4,919m',
      distance: '92 km',
      best_season: 'Apr-May, Oct-Nov',
      image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800',
      description: 'Trek to one of the highest lakes in the world, nestled in the Annapurna massif. A challenging but rewarding journey through dramatic mountain scenery.',
      highlights: JSON.stringify(['Highest lake in world', 'Annapurna Circuit section', 'Mesokanto La Pass', 'Manang Valley', 'High altitude experience']),
      price: 1120,
      rating: 4.7,
      reviews: 876,
      active_trekkers: 54
    },
    {
      id: 'mardi-himal',
      name: 'Mardi Himal Trek',
      region: 'Kaski',
      difficulty: 'Easy-Moderate',
      duration: '5 Days',
      max_altitude: '4,500m',
      distance: '34 km',
      best_season: 'Oct-May',
      image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800',
      description: 'A hidden gem offering stunning views of the Annapurna range and Machapuchare. Perfect for those seeking a less crowded alternative to ABC.',
      highlights: JSON.stringify(['Machapuchare views', 'Less crowded trail', 'Forest camp experience', 'Ridge walking', 'Sunrise viewpoints']),
      price: 420,
      rating: 4.6,
      reviews: 2156,
      active_trekkers: 123
    },
    {
      id: 'kanchenjunga-bc',
      name: 'Kanchenjunga Base Camp',
      region: 'Taplejung',
      difficulty: 'Strenuous',
      duration: '20 Days',
      max_altitude: '5,143m',
      distance: '186 km',
      best_season: 'Mar-May, Oct-Nov',
      image: 'https://images.unsplash.com/photo-1491904768633-2b7e3e7fede5?w=800',
      description: "An epic journey to the base of the world's third highest peak. This remote trek takes you through pristine forests and high-altitude landscapes.",
      highlights: JSON.stringify(['Third highest peak', 'Remote wilderness', 'Diverse flora & fauna', 'Yalung Glacier', 'Cultural diversity']),
      price: 2450,
      rating: 4.9,
      reviews: 234,
      active_trekkers: 12
    },
    {
      id: 'makalu-bc',
      name: 'Makalu Base Camp Trek',
      region: 'Sankhuwasabha',
      difficulty: 'Strenuous',
      duration: '18 Days',
      max_altitude: '5,009m',
      distance: '145 km',
      best_season: 'Apr-May, Oct-Nov',
      image: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=800',
      description: "Trek to the base of the world's fifth highest mountain through the pristine Makalu Barun National Park, one of the most biologically diverse areas.",
      highlights: JSON.stringify(['Fifth highest peak', 'Makalu Barun National Park', 'Pristine wilderness', 'Arun Valley', 'Rare wildlife']),
      price: 2200,
      rating: 4.8,
      reviews: 178,
      active_trekkers: 8
    },
    {
      id: 'phoksundo-lake',
      name: 'Phoksundo Lake Trek',
      region: 'Dolpa',
      difficulty: 'Moderate',
      duration: '10 Days',
      max_altitude: '3,611m',
      distance: '78 km',
      best_season: 'Mar-May, Sep-Nov',
      image: 'https://images.unsplash.com/photo-1500534314263-0869cef07f0c?w=800',
      description: "Journey to Nepal's deepest lake with its mesmerizing turquoise waters. Explore the remote Dolpa region and experience Bon-po culture.",
      highlights: JSON.stringify(['Deepest lake in Nepal', 'Turquoise waters', 'Shey Phoksundo National Park', 'Bon-po culture', 'Remote Dolpa region']),
      price: 1560,
      rating: 4.7,
      reviews: 345,
      active_trekkers: 22
    }
  ];

  const insertTreks = db.transaction(() => {
    for (const trek of treks) {
      insertTrek.run(trek);
    }
  });
  insertTreks();
  console.log('  ✅ 12 treks seeded');

  // ── Seed Weather Data ──
  const insertWeather = db.prepare(`
    INSERT INTO weather_data (region, temp, feels_like, condition, wind, humidity, uv, visibility, pressure, icon)
    VALUES (@region, @temp, @feels_like, @condition, @wind, @humidity, @uv, @visibility, @pressure, @icon)
  `);

  const weatherRecords = [
    { region: 'Solukhumbu', temp: -8, feels_like: -14, condition: 'Partly Cloudy', wind: 25, humidity: 45, uv: 8, visibility: 15, pressure: 540, icon: '⛅' },
    { region: 'Kaski', temp: 12, feels_like: 8, condition: 'Clear Sky', wind: 10, humidity: 55, uv: 6, visibility: 20, pressure: 650, icon: '☀️' },
    { region: 'Rasuwa', temp: 2, feels_like: -3, condition: 'Light Snow', wind: 18, humidity: 72, uv: 4, visibility: 8, pressure: 580, icon: '🌨️' },
    { region: 'Gorkha', temp: 5, feels_like: 0, condition: 'Windy', wind: 35, humidity: 40, uv: 7, visibility: 18, pressure: 560, icon: '💨' },
    { region: 'Mustang', temp: 15, feels_like: 12, condition: 'Clear Sky', wind: 8, humidity: 30, uv: 9, visibility: 25, pressure: 620, icon: '☀️' },
    { region: 'Mugu', temp: -2, feels_like: -7, condition: 'Cloudy', wind: 20, humidity: 65, uv: 3, visibility: 10, pressure: 570, icon: '☁️' }
  ];

  const insertWeathers = db.transaction(() => {
    for (const w of weatherRecords) {
      insertWeather.run(w);
    }
  });
  insertWeathers();
  console.log('  ✅ 6 weather records seeded');

  // Users are now created via Firebase Auth
  // Demo users can be created by signing up through the app
  console.log('  ℹ️  Users are managed by Firebase Auth — sign up through the app');

  console.log('🌱 Database seeding complete!');
}

export { db, initDatabase, seedDatabase };
