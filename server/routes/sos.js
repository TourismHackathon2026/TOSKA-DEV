import { Router } from 'express';
import { db } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// All SOS routes require authentication
router.use(auth);

// POST /api/sos — create SOS alert
router.post('/', (req, res) => {
  try {
    const { latitude, longitude, altitude, message } = req.body;

    const result = db.prepare(`
      INSERT INTO sos_alerts (user_id, latitude, longitude, altitude, message)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      latitude || null,
      longitude || null,
      altitude || null,
      message || null
    );

    const alert = db.prepare('SELECT * FROM sos_alerts WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(alert);
  } catch (error) {
    console.error('Create SOS error:', error);
    res.status(500).json({ error: 'Failed to create SOS alert' });
  }
});

// GET /api/sos — get SOS alerts
router.get('/', (req, res) => {
  try {
    let alerts;

    if (req.user.role === 'admin') {
      // Admins see all alerts
      alerts = db.prepare(`
        SELECT s.*, u.name as user_name, u.email as user_email, u.phone as user_phone
        FROM sos_alerts s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.created_at DESC
      `).all();
    } else {
      // Regular users see only their own alerts
      alerts = db.prepare(`
        SELECT s.*, u.name as user_name
        FROM sos_alerts s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
      `).all(req.user.id);
    }

    res.json(alerts);
  } catch (error) {
    console.error('Get SOS alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch SOS alerts' });
  }
});

// PUT /api/sos/:id/resolve — resolve an alert
router.put('/:id/resolve', (req, res) => {
  try {
    const alertId = req.params.id;

    // Get the alert
    const alert = db.prepare('SELECT * FROM sos_alerts WHERE id = ?').get(alertId);
    if (!alert) {
      return res.status(404).json({ error: 'SOS alert not found' });
    }

    // Only admin or alert creator can resolve
    if (req.user.role !== 'admin' && alert.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to resolve this alert' });
    }

    const resolvedAt = new Date().toISOString();

    db.prepare(`
      UPDATE sos_alerts SET status = 'resolved', resolved_at = ? WHERE id = ?
    `).run(resolvedAt, alertId);

    const updated = db.prepare('SELECT * FROM sos_alerts WHERE id = ?').get(alertId);

    res.json(updated);
  } catch (error) {
    console.error('Resolve SOS error:', error);
    res.status(500).json({ error: 'Failed to resolve SOS alert' });
  }
});

export default router;
