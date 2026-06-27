import { Router } from 'express';
import { db } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// GET /api/treks — all treks with filtering and sorting
router.get('/', (req, res) => {
  try {
    const { region, difficulty, search, sort } = req.query;
    let query = 'SELECT * FROM treks WHERE 1=1';
    const params = [];

    if (region) {
      query += ' AND region = ?';
      params.push(region);
    }

    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }

    if (search) {
      query += ' AND (name LIKE ? OR region LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    switch (sort) {
      case 'price-asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY price DESC';
        break;
      case 'rating':
        query += ' ORDER BY rating DESC';
        break;
      case 'name':
        query += ' ORDER BY name ASC';
        break;
      default:
        query += ' ORDER BY rating DESC';
    }

    const treks = db.prepare(query).all(...params);

    // Parse highlights JSON for each trek
    const parsedTreks = treks.map(trek => ({
      ...trek,
      highlights: JSON.parse(trek.highlights)
    }));

    res.json(parsedTreks);
  } catch (error) {
    console.error('Get treks error:', error);
    res.status(500).json({ error: 'Failed to fetch treks' });
  }
});

// GET /api/treks/:id — single trek
router.get('/:id', (req, res) => {
  try {
    const trek = db.prepare('SELECT * FROM treks WHERE id = ?').get(req.params.id);

    if (!trek) {
      return res.status(404).json({ error: 'Trek not found' });
    }

    trek.highlights = JSON.parse(trek.highlights);
    res.json(trek);
  } catch (error) {
    console.error('Get trek error:', error);
    res.status(500).json({ error: 'Failed to fetch trek' });
  }
});

// GET /api/treks/:id/reviews — get reviews for a trek
router.get('/:id/reviews', (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name, u.avatar as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.trek_id = ?
      ORDER BY r.created_at DESC
    `).all(req.params.id);

    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/treks/:id/reviews — add review (auth required)
router.post('/:id/reviews', auth, (req, res) => {
  try {
    const { rating, comment } = req.body;
    const trekId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify trek exists
    const trek = db.prepare('SELECT id FROM treks WHERE id = ?').get(trekId);
    if (!trek) {
      return res.status(404).json({ error: 'Trek not found' });
    }

    // Insert the review
    const result = db.prepare(`
      INSERT INTO reviews (user_id, trek_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, trekId, rating, comment || null);

    // Recompute average rating and review count for the trek
    const stats = db.prepare(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
      FROM reviews WHERE trek_id = ?
    `).get(trekId);

    db.prepare(`
      UPDATE treks SET rating = ROUND(?, 1), reviews = ? WHERE id = ?
    `).run(stats.avg_rating, stats.review_count, trekId);

    // Return the new review with user info
    const newReview = db.prepare(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name, u.avatar as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

export default router;
