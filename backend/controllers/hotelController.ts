import { Request, Response } from 'express';
import { dbManager } from '../db/database';

export const getHotels = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city_id, min_rating, max_price, facility, search, featured } = req.query;

    let sql = `
      SELECT h.*, c.name as city_name, s.name as state_name
      FROM hotels h
      JOIN cities c ON c.id = h.city_id
      JOIN states s ON s.id = c.state_id
      WHERE h.approval_status = 'APPROVED' AND h.is_published = 1
    `;
    const params: any[] = [];

    if (city_id) {
      sql += ' AND h.city_id = ?';
      params.push(city_id);
    }

    if (min_rating) {
      sql += ' AND h.rating >= ?';
      params.push(Number(min_rating));
    }

    if (max_price) {
      sql += ' AND h.price_per_night <= ?';
      params.push(Number(max_price));
    }

    if (facility) {
      sql += ' AND h.facilities_json LIKE ?';
      params.push(`%${facility}%`);
    }

    if (featured === 'true' || featured === '1') {
      sql += ' AND h.is_featured = 1';
    }

    if (search) {
      sql += ' AND (h.name LIKE ? OR h.description LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY h.is_featured DESC, h.rating DESC';

    const hotels = dbManager.query(sql, params).map((h) => ({
      ...h,
      photos: JSON.parse(h.photos_json || '[]'),
      facilities: JSON.parse(h.facilities_json || '[]'),
    }));

    res.json({ success: true, count: hotels.length, data: hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch hotels' });
  }
};

export const getHotelById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const hotel = dbManager.queryOne<any>(
      `SELECT h.*, c.name as city_name, s.name as state_name, u.name as owner_name
       FROM hotels h
       JOIN cities c ON c.id = h.city_id
       JOIN states s ON s.id = c.state_id
       LEFT JOIN users u ON u.id = h.owner_id
       WHERE h.id = ? AND h.approval_status = 'APPROVED' AND h.is_published = 1`,
      [id]
    );

    if (!hotel) {
      res.status(404).json({ success: false, message: 'Hotel not found or pending approval' });
      return;
    }

    // Increment views
    dbManager.run('UPDATE hotels SET views_count = views_count + 1 WHERE id = ?', [hotel.id]);

    hotel.photos = JSON.parse(hotel.photos_json || '[]');
    hotel.facilities = JSON.parse(hotel.facilities_json || '[]');

    const rooms = dbManager.query(
      'SELECT * FROM hotel_rooms WHERE hotel_id = ? ORDER BY price_per_night ASC',
      [hotel.id]
    ).map((r) => ({
      ...r,
      photos: JSON.parse(r.photos_json || '[]'),
      amenities: JSON.parse(r.amenities_json || '[]'),
    }));

    const reviews = dbManager.query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.entity_type = 'HOTEL' AND r.entity_id = ? AND r.is_moderated = 1
       ORDER BY r.created_at DESC`,
      [hotel.id]
    );

    const nearbyPlaces = dbManager.query(
      'SELECT id, name, category, rating, entry_fee, cover_image, address FROM tourist_places WHERE city_id = ? AND is_published = 1 LIMIT 4',
      [hotel.city_id]
    );

    res.json({ success: true, data: { hotel, rooms, reviews, nearbyPlaces } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch hotel details' });
  }
};
