import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/dashboard/stats — aggregate stats
router.get('/stats', (req, res) => {
  try {
    const totalTreks = db.prepare('SELECT COUNT(*) as count FROM treks').get().count;
    const activeTrekkers = db.prepare('SELECT COALESCE(SUM(active_trekkers), 0) as total FROM treks').get().total;
    const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
    const activeAlerts = db.prepare("SELECT COUNT(*) as count FROM sos_alerts WHERE status = 'active'").get().count;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const averageRating = db.prepare('SELECT ROUND(AVG(rating), 1) as avg FROM treks').get().avg || 0;

    res.json({
      totalTreks,
      activeTrekkers,
      totalBookings,
      activeAlerts,
      totalUsers,
      averageRating
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/dashboard/active-trekkers — treks with active trekkers
router.get('/active-trekkers', (req, res) => {
  try {
    const trekkers = db.prepare(`
      SELECT id, name, region, active_trekkers
      FROM treks
      WHERE active_trekkers > 0
      ORDER BY active_trekkers DESC
      LIMIT 10
    `).all();

    res.json(trekkers);
  } catch (error) {
    console.error('Get active trekkers error:', error);
    res.status(500).json({ error: 'Failed to fetch active trekkers' });
  }
});

// GET /api/dashboard/alerts — recent SOS alerts
router.get('/alerts', (req, res) => {
  try {
    const alerts = db.prepare(`
      SELECT s.*, u.name as user_name
      FROM sos_alerts s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `).all();

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

export default router;
