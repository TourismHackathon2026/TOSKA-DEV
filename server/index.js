import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

import { initDatabase, seedDatabase } from './db.js';
import authRoutes from './routes/auth.js';
import trekRoutes from './routes/treks.js';
import bookingRoutes from './routes/bookings.js';
import weatherRoutes from './routes/weather.js';
import sosRoutes from './routes/sos.js';
import dashboardRoutes from './routes/dashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// ── Middleware ──
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ── Static uploads ──
const uploadsDir = join(__dirname, 'uploads');
if (fs.existsSync(uploadsDir)) {
  app.use('/uploads', express.static(uploadsDir));
}

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/treks', trekRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Initialize and start ──
try {
  initDatabase();
  seedDatabase();
} catch (error) {
  console.error('Database initialization failed:', error);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`\n🏔️  TrailGuard API Server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for http://localhost:5173`);
  console.log(`🗄️  Database: server/data/trailguard.db\n`);
});

export default app;
