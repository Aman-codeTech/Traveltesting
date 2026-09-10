import { Request, Response } from 'express';
import { dbManager } from '../db/database';
import { AuthRequest } from '../middleware/auth';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Please log in to leave a review.' });
      return;
    }

    const { entity_type, entity_id, rating, comment } = req.body;

    if (!entity_type || !entity_id || !rating || !comment) {
      res.status(400).json({ success: false, message: 'Entity, rating, and comment are required.' });
      return;
    }

    const validTypes = ['PLACE', 'HOTEL', 'RESTAURANT', 'TAXI'];
    if (!validTypes.includes(entity_type)) {
      res.status(400).json({ success: false, message: 'Invalid entity type.' });
      return;
    }

    const score = Math.max(1, Math.min(5, Number(rating)));

    // Prevent excessive duplicate reviews from same user within short time
    const existing = dbManager.queryOne<any>(
      'SELECT id FROM reviews WHERE user_id = ? AND entity_type = ? AND entity_id = ?',
      [req.user.id, entity_type, entity_id]
    );

    if (existing) {
      dbManager.run(
        'UPDATE reviews SET rating = ?, comment = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?',
        [score, comment, existing.id]
      );
    } else {
      dbManager.run(
        'INSERT INTO reviews (user_id, entity_type, entity_id, rating, comment, is_moderated) VALUES (?, ?, ?, ?, ?, 1)',
        [req.user.id, entity_type, entity_id, score, comment]
      );
    }

    // Recalculate average rating
    const stats = dbManager.queryOne<any>(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE entity_type = ? AND entity_id = ? AND is_moderated = 1',
      [entity_type, entity_id]
    );

    const avgRating = stats ? Math.round(stats.avg_rating * 10) / 10 : score;
    const reviewCount = stats ? stats.count : 1;

    // Update parent entity rating
    if (entity_type === 'PLACE') {
      dbManager.run('UPDATE tourist_places SET rating = ?, review_count = ? WHERE id = ?', [avgRating, reviewCount, entity_id]);
    } else if (entity_type === 'HOTEL') {
      dbManager.run('UPDATE hotels SET rating = ? WHERE id = ?', [avgRating, entity_id]);
    } else if (entity_type === 'RESTAURANT') {
      dbManager.run('UPDATE restaurants SET rating = ? WHERE id = ?', [avgRating, entity_id]);
    } else if (entity_type === 'TAXI') {
      dbManager.run('UPDATE taxi_services SET rating = ? WHERE id = ?', [avgRating, entity_id]);
    }

    res.status(201).json({
      success: true,
      message: 'Review posted successfully! Thank you for helping other travellers.',
      avgRating,
      reviewCount,
    });
  } catch (err: any) {
    console.error('Create review error:', err);
    res.status(500).json({ success: false, message: 'Failed to post review' });
  }
};

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entity_type, entity_id } = req.query;

    if (!entity_type || !entity_id) {
      res.status(400).json({ success: false, message: 'entity_type and entity_id are required' });
      return;
    }

    const reviews = dbManager.query(
      `SELECT r.*, u.name as user_name, p.avatar_url
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE r.entity_type = ? AND r.entity_id = ? AND r.is_moderated = 1
       ORDER BY r.created_at DESC`,
      [entity_type, entity_id]
    );

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};
