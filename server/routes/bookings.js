import { Router } from 'express';
import { db } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// All booking routes require authentication
router.use(auth);

// GET /api/bookings — get user's bookings
router.get('/', (req, res) => {
  try {
    const bookings = db.prepare(`
      SELECT b.*, t.name as trek_name, t.image as trek_image, t.region as trek_region,
             t.difficulty as trek_difficulty, t.duration as trek_duration
      FROM bookings b
      JOIN treks t ON b.trek_id = t.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `).all(req.user.id);

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST /api/bookings — create booking
router.post('/', (req, res) => {
  try {
    const { trek_id, start_date, group_size, notes } = req.body;

    if (!trek_id || !start_date) {
      return res.status(400).json({ error: 'Trek ID and start date are required' });
    }

    // Look up trek price
    const trek = db.prepare('SELECT price, name FROM treks WHERE id = ?').get(trek_id);
    if (!trek) {
      return res.status(404).json({ error: 'Trek not found' });
    }

    const size = group_size || 1;
    const total_price = trek.price * size;

    const result = db.prepare(`
      INSERT INTO bookings (user_id, trek_id, start_date, group_size, total_price, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, trek_id, start_date, size, total_price, notes || null);

    const booking = db.prepare(`
      SELECT b.*, t.name as trek_name, t.image as trek_image, t.region as trek_region
      FROM bookings b
      JOIN treks t ON b.trek_id = t.id
      WHERE b.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// PUT /api/bookings/:id — update booking
router.put('/:id', (req, res) => {
  try {
    const { start_date, group_size, status, notes } = req.body;
    const bookingId = req.params.id;

    // Verify ownership
    const existing = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(bookingId, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Recalculate total price if group size changed
    let total_price = existing.total_price;
    if (group_size && group_size !== existing.group_size) {
      const trek = db.prepare('SELECT price FROM treks WHERE id = ?').get(existing.trek_id);
      total_price = trek.price * group_size;
    }

    db.prepare(`
      UPDATE bookings
      SET start_date = COALESCE(?, start_date),
          group_size = COALESCE(?, group_size),
          status = COALESCE(?, status),
          notes = COALESCE(?, notes),
          total_price = ?
      WHERE id = ? AND user_id = ?
    `).run(
      start_date || null,
      group_size || null,
      status || null,
      notes !== undefined ? notes : null,
      total_price,
      bookingId,
      req.user.id
    );

    const booking = db.prepare(`
      SELECT b.*, t.name as trek_name, t.image as trek_image, t.region as trek_region
      FROM bookings b
      JOIN treks t ON b.trek_id = t.id
      WHERE b.id = ?
    `).get(bookingId);

    res.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// DELETE /api/bookings/:id — cancel booking
router.delete('/:id', (req, res) => {
  try {
    const bookingId = req.params.id;

    // Verify ownership
    const existing = db.prepare('SELECT id FROM bookings WHERE id = ? AND user_id = ?').get(bookingId, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    db.prepare('DELETE FROM bookings WHERE id = ? AND user_id = ?').run(bookingId, req.user.id);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;
