import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/weather — all weather records
router.get('/', (req, res) => {
  try {
    const weather = db.prepare('SELECT * FROM weather_data ORDER BY region ASC').all();
    res.json(weather);
  } catch (error) {
    console.error('Get weather error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET /api/weather/:region — weather for specific region
router.get('/:region', (req, res) => {
  try {
    const weather = db.prepare(
      'SELECT * FROM weather_data WHERE LOWER(region) = LOWER(?)'
    ).get(req.params.region);

    if (!weather) {
      return res.status(404).json({ error: 'Weather data not found for this region' });
    }

    res.json(weather);
  } catch (error) {
    console.error('Get region weather error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

export default router;
