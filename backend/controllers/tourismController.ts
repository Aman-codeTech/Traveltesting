import { Request, Response } from 'express';
import { dbManager } from '../db/database';

export const getStates = async (req: Request, res: Response): Promise<void> => {
  try {
    const states = dbManager.query('SELECT * FROM states ORDER BY name ASC');
    res.json({ success: true, count: states.length, data: states });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch states' });
  }
};

export const getCities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, state_id, featured, category } = req.query;

    let sql = `
      SELECT c.*, s.name as state_name, s.code as state_code
      FROM cities c
      JOIN states s ON s.id = c.state_id
      WHERE c.is_published = 1
    `;
    const params: any[] = [];

    if (search) {
      sql += ` AND (c.name LIKE ? OR c.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (state_id) {
      sql += ` AND c.state_id = ?`;
      params.push(state_id);
    }

    if (featured === 'true' || featured === '1') {
      sql += ` AND c.is_featured = 1`;
    }

    if (category) {
      sql += ` AND c.categories_json LIKE ?`;
      params.push(`%${category}%`);
    }

    sql += ` ORDER BY c.is_featured DESC, c.name ASC`;

    const cities = dbManager.query(sql, params).map((city) => ({
      ...city,
      categories: JSON.parse(city.categories_json || '[]'),
      gallery: JSON.parse(city.gallery_json || '[]'),
    }));

    res.json({ success: true, count: cities.length, data: cities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
};

export const getCityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const city = dbManager.queryOne<any>(
      `SELECT c.*, s.name as state_name, s.code as state_code
       FROM cities c
       JOIN states s ON s.id = c.state_id
       WHERE (c.id = ? OR c.slug = ?) AND c.is_published = 1`,
      [id, id]
    );

    if (!city) {
      res.status(404).json({ success: false, message: 'City not found' });
      return;
    }

    city.categories = JSON.parse(city.categories_json || '[]');
    city.gallery = JSON.parse(city.gallery_json || '[]');

    // Get places in this city
    const places = dbManager.query(
      'SELECT * FROM tourist_places WHERE city_id = ? AND is_published = 1 ORDER BY ai_priority DESC, rating DESC',
      [city.id]
    ).map((p) => ({
      ...p,
      gallery: JSON.parse(p.gallery_json || '[]'),
    }));

    // Get hidden gems in this city
    const hiddenGems = dbManager.query(
      'SELECT * FROM hidden_gems WHERE city_id = ? AND is_published = 1 ORDER BY rating DESC',
      [city.id]
    ).map((g) => ({
      ...g,
      photos: JSON.parse(g.photos_json || '[]'),
    }));

    // Get approved hotels
    const hotels = dbManager.query(
      'SELECT * FROM hotels WHERE city_id = ? AND approval_status = "APPROVED" AND is_published = 1 ORDER BY rating DESC',
      [city.id]
    ).map((h) => ({
      ...h,
      photos: JSON.parse(h.photos_json || '[]'),
      facilities: JSON.parse(h.facilities_json || '[]'),
    }));

    // Get approved restaurants
    const restaurants = dbManager.query(
      'SELECT * FROM restaurants WHERE city_id = ? AND approval_status = "APPROVED" AND is_published = 1 ORDER BY rating DESC',
      [city.id]
    ).map((r) => ({
      ...r,
      photos: JSON.parse(r.photos_json || '[]'),
      popular_dishes: JSON.parse(r.popular_dishes_json || '[]'),
    }));

    // Get taxis
    const taxis = dbManager.query(
      'SELECT * FROM taxi_services WHERE city_id = ? AND approval_status = "APPROVED" AND is_published = 1 ORDER BY rating DESC',
      [city.id]
    ).map((t) => ({
      ...t,
      vehicle_photos: JSON.parse(t.vehicle_photos_json || '[]'),
    }));

    res.json({
      success: true,
      data: {
        city,
        places,
        hiddenGems,
        hotels,
        restaurants,
        taxis,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch city details' });
  }
};

export const getPlaces = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      city_id,
      category,
      min_rating,
      max_price,
      family_friendly,
      couple_friendly,
      solo_friendly,
      budget_friendly,
      search,
    } = req.query;

    let sql = `
      SELECT p.*, c.name as city_name, s.name as state_name
      FROM tourist_places p
      JOIN cities c ON c.id = p.city_id
      JOIN states s ON s.id = c.state_id
      WHERE p.is_published = 1 AND c.is_published = 1
    `;
    const params: any[] = [];

    if (city_id) {
      sql += ` AND p.city_id = ?`;
      params.push(city_id);
    }

    if (category) {
      sql += ` AND p.category = ?`;
      params.push(category);
    }

    if (min_rating) {
      sql += ` AND p.rating >= ?`;
      params.push(Number(min_rating));
    }

    if (max_price !== undefined && max_price !== '') {
      sql += ` AND p.entry_fee <= ?`;
      params.push(Number(max_price));
    }

    if (family_friendly === 'true' || family_friendly === '1') {
      sql += ` AND p.family_friendly = 1`;
    }

    if (couple_friendly === 'true' || couple_friendly === '1') {
      sql += ` AND p.couple_friendly = 1`;
    }

    if (solo_friendly === 'true' || solo_friendly === '1') {
      sql += ` AND p.solo_friendly = 1`;
    }

    if (budget_friendly === 'true' || budget_friendly === '1') {
      sql += ` AND p.budget_friendly = 1`;
    }

    if (search) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY p.is_featured DESC, p.ai_priority DESC, p.rating DESC`;

    const places = dbManager.query(sql, params).map((p) => ({
      ...p,
      gallery: JSON.parse(p.gallery_json || '[]'),
    }));

    res.json({ success: true, count: places.length, data: places });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch places' });
  }
};

export const getPlaceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const place = dbManager.queryOne<any>(
      `SELECT p.*, c.name as city_name, s.name as state_name
       FROM tourist_places p
       JOIN cities c ON c.id = p.city_id
       JOIN states s ON s.id = c.state_id
       WHERE (p.id = ? OR p.slug = ?) AND p.is_published = 1`,
      [id, id]
    );

    if (!place) {
      res.status(404).json({ success: false, message: 'Tourist place not found' });
      return;
    }

    place.gallery = JSON.parse(place.gallery_json || '[]');

    // Nearby hotels
    const nearbyHotels = dbManager.query(
      'SELECT * FROM hotels WHERE city_id = ? AND approval_status = "APPROVED" AND is_published = 1 LIMIT 3',
      [place.city_id]
    ).map((h) => ({
      ...h,
      photos: JSON.parse(h.photos_json || '[]'),
      facilities: JSON.parse(h.facilities_json || '[]'),
    }));

    // Nearby restaurants
    const nearbyRestaurants = dbManager.query(
      'SELECT * FROM restaurants WHERE city_id = ? AND approval_status = "APPROVED" AND is_published = 1 LIMIT 3',
      [place.city_id]
    ).map((r) => ({
      ...r,
      photos: JSON.parse(r.photos_json || '[]'),
      popular_dishes: JSON.parse(r.popular_dishes_json || '[]'),
    }));

    // Nearby taxis
    const nearbyTaxis = dbManager.query(
      'SELECT * FROM taxi_services WHERE city_id = ? AND approval_status = "APPROVED" AND is_published = 1 LIMIT 3',
      [place.city_id]
    ).map((t) => ({
      ...t,
      vehicle_photos: JSON.parse(t.vehicle_photos_json || '[]'),
    }));

    // Reviews
    const reviews = dbManager.query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.entity_type = 'PLACE' AND r.entity_id = ? AND r.is_moderated = 1
       ORDER BY r.created_at DESC`,
      [place.id]
    );

    res.json({
      success: true,
      data: {
        place,
        nearbyHotels,
        nearbyRestaurants,
        nearbyTaxis,
        reviews,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch place details' });
  }
};

export const getHiddenGems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city_id, category, featured } = req.query;

    let sql = `
      SELECT g.*, c.name as city_name, s.name as state_name
      FROM hidden_gems g
      JOIN cities c ON c.id = g.city_id
      JOIN states s ON s.id = c.state_id
      WHERE g.is_published = 1 AND c.is_published = 1
    `;
    const params: any[] = [];

    if (city_id) {
      sql += ` AND g.city_id = ?`;
      params.push(city_id);
    }

    if (category) {
      sql += ` AND g.category = ?`;
      params.push(category);
    }

    if (featured === 'true' || featured === '1') {
      sql += ` AND g.is_featured = 1`;
    }

    sql += ` ORDER BY g.is_featured DESC, g.rating DESC`;

    const gems = dbManager.query(sql, params).map((g) => ({
      ...g,
      photos: JSON.parse(g.photos_json || '[]'),
    }));

    res.json({ success: true, count: gems.length, data: gems });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch hidden gems' });
  }
};
