import { Response } from 'express';
import { dbManager } from '../db/database';
import { AuthRequest } from '../middleware/auth';

function logActivity(adminId: number, adminName: string, action: string, entityType: string, entityId?: number, details?: string) {
  try {
    dbManager.run(
      'INSERT INTO admin_activity_logs (admin_id, admin_name, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
      [adminId, adminName, action, entityType, entityId || null, details || '']
    );
  } catch (e) {
    console.error('Failed to log admin activity:', e);
  }
}

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usersCount = dbManager.queryOne<any>('SELECT COUNT(*) as c FROM users')?.c || 0;
    const citiesCount = dbManager.queryOne<any>('SELECT COUNT(*) as c FROM cities')?.c || 0;
    const placesCount = dbManager.queryOne<any>('SELECT COUNT(*) as c FROM tourist_places')?.c || 0;
    const gemsCount = dbManager.queryOne<any>('SELECT COUNT(*) as c FROM hidden_gems')?.c || 0;
    const hotelsCount = dbManager.queryOne<any>('SELECT COUNT(*) as c FROM hotels')?.c || 0;
    const restaurantsCount = dbManager.queryOne<any>('SELECT COUNT(*) as c FROM restaurants')?.c || 0;
    const taxisCount = dbManager.queryOne<any>('SELECT COUNT(*) as c FROM taxi_services')?.c || 0;
    const tripsCount = dbManager.queryOne<any>('SELECT COUNT(*) as c FROM trips')?.c || 0;
    const bookingsCount = dbManager.queryOne<any>('SELECT COUNT(*) as c FROM taxi_bookings')?.c || 0;
    const reviewsCount = dbManager.queryOne<any>('SELECT COUNT(*) as c FROM reviews')?.c || 0;

    const pendingHotels = dbManager.queryOne<any>('SELECT COUNT(*) as c FROM hotels WHERE approval_status = "PENDING"')?.c || 0;
    const pendingRestaurants = dbManager.queryOne<any>('SELECT COUNT(*) as c FROM restaurants WHERE approval_status = "PENDING"')?.c || 0;
    const pendingTaxis = dbManager.queryOne<any>('SELECT COUNT(*) as c FROM taxi_services WHERE approval_status = "PENDING"')?.c || 0;
    const pendingBusinesses = pendingHotels + pendingRestaurants + pendingTaxis;

    // Popular cities based on trips & places
    const popularCities = dbManager.query(
      `SELECT c.name, COUNT(p.id) as place_count
       FROM cities c
       LEFT JOIN tourist_places p ON p.city_id = c.id
       GROUP BY c.id
       ORDER BY place_count DESC
       LIMIT 6`
    );

    // Recent activity
    const recentActivity = dbManager.query(
      'SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 8'
    );

    res.json({
      success: true,
      stats: {
        users: usersCount,
        cities: citiesCount,
        places: placesCount,
        gems: gemsCount,
        hotels: hotelsCount,
        restaurants: restaurantsCount,
        taxis: taxisCount,
        trips: tripsCount,
        bookings: bookingsCount,
        reviews: reviewsCount,
        pendingBusinesses,
      },
      popularCities,
      recentActivity,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load admin stats' });
  }
};

// CITIES CRUD
export const getCitiesAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cities = dbManager.query(
      `SELECT c.*, s.name as state_name, COUNT(p.id) as place_count
       FROM cities c
       JOIN states s ON s.id = c.state_id
       LEFT JOIN tourist_places p ON p.city_id = c.id
       GROUP BY c.id
       ORDER BY c.name ASC`
    ).map((c) => ({
      ...c,
      categories: JSON.parse(c.categories_json || '[]'),
      gallery: JSON.parse(c.gallery_json || '[]'),
    }));
    res.json({ success: true, data: cities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
};

export const createCity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, state_id, description, cover_image, latitude, longitude, categories = [], is_featured = 0 } = req.body;
    if (!name || !state_id) {
      res.status(400).json({ success: false, message: 'City name and state are required' });
      return;
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const result = dbManager.run(
      `INSERT INTO cities (name, slug, state_id, description, cover_image, gallery_json, latitude, longitude, categories_json, is_featured, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        name,
        slug,
        state_id,
        description || '',
        cover_image || 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
        JSON.stringify([cover_image || 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80']),
        latitude || 28.6139,
        longitude || 77.2090,
        JSON.stringify(categories),
        is_featured ? 1 : 0,
      ]
    );

    logActivity(req.user!.id, req.user!.name, 'CREATE_CITY', 'CITY', result.lastInsertRowid, `Created city ${name}`);
    res.status(201).json({ success: true, message: `City ${name} created successfully!`, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create city' });
  }
};

export const updateCity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, state_id, description, cover_image, latitude, longitude, categories, is_featured, is_published } = req.body;

    dbManager.run(
      `UPDATE cities SET
         name = COALESCE(?, name),
         state_id = COALESCE(?, state_id),
         description = COALESCE(?, description),
         cover_image = COALESCE(?, cover_image),
         latitude = COALESCE(?, latitude),
         longitude = COALESCE(?, longitude),
         categories_json = COALESCE(?, categories_json),
         is_featured = COALESCE(?, is_featured),
         is_published = COALESCE(?, is_published)
       WHERE id = ?`,
      [
        name,
        state_id,
        description,
        cover_image,
        latitude,
        longitude,
        categories ? JSON.stringify(categories) : null,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        is_published !== undefined ? (is_published ? 1 : 0) : null,
        id,
      ]
    );

    logActivity(req.user!.id, req.user!.name, 'UPDATE_CITY', 'CITY', Number(id), `Updated city ID ${id}`);
    res.json({ success: true, message: 'City updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update city' });
  }
};

export const deleteCity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    dbManager.run('DELETE FROM cities WHERE id = ?', [id]);
    logActivity(req.user!.id, req.user!.name, 'DELETE_CITY', 'CITY', Number(id), `Deleted city ID ${id}`);
    res.json({ success: true, message: 'City deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete city' });
  }
};

// PLACES CRUD
export const getPlacesAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const places = dbManager.query(
      `SELECT p.*, c.name as city_name, s.name as state_name
       FROM tourist_places p
       JOIN cities c ON c.id = p.city_id
       JOIN states s ON s.id = c.state_id
       ORDER BY p.id DESC`
    ).map((p) => ({
      ...p,
      gallery: JSON.parse(p.gallery_json || '[]'),
    }));
    res.json({ success: true, data: places });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch tourist places' });
  }
};

export const createPlace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      city_id,
      name,
      description,
      cover_image,
      category,
      address,
      latitude,
      longitude,
      opening_time = '09:00 AM',
      closing_time = '06:00 PM',
      entry_fee = 0,
      best_visiting_time = 'Morning / Sunset',
      recommended_duration_hours = 2.0,
      ai_priority = 5,
      is_featured = 0,
    } = req.body;

    if (!name || !city_id || !category) {
      res.status(400).json({ success: false, message: 'Name, city, and category are required' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const result = dbManager.run(
      `INSERT INTO tourist_places (
        city_id, name, slug, description, cover_image, gallery_json, category, address,
        latitude, longitude, opening_time, closing_time, entry_fee, best_visiting_time,
        recommended_duration_hours, is_featured, is_published, ai_priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        city_id,
        name,
        slug,
        description || '',
        cover_image || 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1000&q=80',
        JSON.stringify([cover_image || 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1000&q=80']),
        category,
        address || '',
        latitude || 28.6139,
        longitude || 77.2090,
        opening_time,
        closing_time,
        Number(entry_fee),
        best_visiting_time,
        Number(recommended_duration_hours),
        is_featured ? 1 : 0,
        Number(ai_priority),
      ]
    );

    logActivity(req.user!.id, req.user!.name, 'CREATE_PLACE', 'PLACE', result.lastInsertRowid, `Added tourist place ${name}`);
    res.status(201).json({ success: true, message: `Place ${name} created successfully!`, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create place' });
  }
};

export const updatePlace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      city_id,
      description,
      cover_image,
      category,
      address,
      entry_fee,
      opening_time,
      closing_time,
      best_visiting_time,
      recommended_duration_hours,
      ai_priority,
      is_featured,
      is_published,
    } = req.body;

    dbManager.run(
      `UPDATE tourist_places SET
         name = COALESCE(?, name),
         city_id = COALESCE(?, city_id),
         description = COALESCE(?, description),
         cover_image = COALESCE(?, cover_image),
         category = COALESCE(?, category),
         address = COALESCE(?, address),
         entry_fee = COALESCE(?, entry_fee),
         opening_time = COALESCE(?, opening_time),
         closing_time = COALESCE(?, closing_time),
         best_visiting_time = COALESCE(?, best_visiting_time),
         recommended_duration_hours = COALESCE(?, recommended_duration_hours),
         ai_priority = COALESCE(?, ai_priority),
         is_featured = COALESCE(?, is_featured),
         is_published = COALESCE(?, is_published)
       WHERE id = ?`,
      [
        name,
        city_id,
        description,
        cover_image,
        category,
        address,
        entry_fee !== undefined ? Number(entry_fee) : null,
        opening_time,
        closing_time,
        best_visiting_time,
        recommended_duration_hours !== undefined ? Number(recommended_duration_hours) : null,
        ai_priority !== undefined ? Number(ai_priority) : null,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        is_published !== undefined ? (is_published ? 1 : 0) : null,
        id,
      ]
    );

    logActivity(req.user!.id, req.user!.name, 'UPDATE_PLACE', 'PLACE', Number(id), `Updated place ID ${id}`);
    res.json({ success: true, message: 'Place updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update place' });
  }
};

export const deletePlace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    dbManager.run('DELETE FROM tourist_places WHERE id = ?', [id]);
    logActivity(req.user!.id, req.user!.name, 'DELETE_PLACE', 'PLACE', Number(id), `Deleted place ID ${id}`);
    res.json({ success: true, message: 'Place deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete place' });
  }
};

// HIDDEN GEMS CRUD
export const getHiddenGemsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gems = dbManager.query(
      `SELECT g.*, c.name as city_name, s.name as state_name
       FROM hidden_gems g
       JOIN cities c ON c.id = g.city_id
       JOIN states s ON s.id = c.state_id
       ORDER BY g.id DESC`
    ).map((g) => ({
      ...g,
      photos: JSON.parse(g.photos_json || '[]'),
    }));
    res.json({ success: true, data: gems });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch hidden gems' });
  }
};

export const createHiddenGem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { city_id, name, description, category, location, best_time, duration_hours, entry_fee, distance_from_city_km, route_info, photos = [] } = req.body;
    const result = dbManager.run(
      `INSERT INTO hidden_gems (
        city_id, name, description, photos_json, category, location, best_time,
        duration_hours, entry_fee, distance_from_city_km, route_info, is_featured, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)`,
      [
        city_id,
        name,
        description || '',
        JSON.stringify(photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80']),
        category || 'Nature',
        location || '',
        best_time || 'Morning',
        Number(duration_hours) || 2,
        Number(entry_fee) || 0,
        Number(distance_from_city_km) || 10,
        route_info || '',
      ]
    );

    logActivity(req.user!.id, req.user!.name, 'CREATE_GEM', 'HIDDEN_GEM', result.lastInsertRowid, `Created hidden gem ${name}`);
    res.status(201).json({ success: true, message: `Hidden gem ${name} added!`, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create hidden gem' });
  }
};

export const deleteHiddenGem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    dbManager.run('DELETE FROM hidden_gems WHERE id = ?', [id]);
    logActivity(req.user!.id, req.user!.name, 'DELETE_GEM', 'HIDDEN_GEM', Number(id), `Deleted hidden gem ID ${id}`);
    res.json({ success: true, message: 'Hidden gem deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete hidden gem' });
  }
};

// BUSINESS APPROVALS & MODERATION
export const getBusinessApprovals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hotels = dbManager.query(
      `SELECT h.id, h.name, 'HOTEL' as type, h.approval_status, h.created_at, u.name as owner_name, u.email as owner_email, c.name as city_name
       FROM hotels h
       JOIN users u ON u.id = h.owner_id
       JOIN cities c ON c.id = h.city_id`
    );

    const restaurants = dbManager.query(
      `SELECT r.id, r.name, 'RESTAURANT' as type, r.approval_status, r.created_at, u.name as owner_name, u.email as owner_email, c.name as city_name
       FROM restaurants r
       JOIN users u ON u.id = r.owner_id
       JOIN cities c ON c.id = r.city_id`
    );

    const taxis = dbManager.query(
      `SELECT t.id, t.service_name as name, 'TAXI' as type, t.approval_status, t.created_at, u.name as owner_name, u.email as owner_email, c.name as city_name
       FROM taxi_services t
       JOIN users u ON u.id = t.owner_id
       JOIN cities c ON c.id = t.city_id`
    );

    const all = [...hotels, ...restaurants, ...taxis].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    res.json({ success: true, data: all });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch business approvals' });
  }
};

export const updateBusinessStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params;
    const { status } = req.body; // APPROVED, REJECTED, CHANGES_REQUESTED

    if (type === 'HOTEL') {
      dbManager.run('UPDATE hotels SET approval_status = ? WHERE id = ?', [status, id]);
    } else if (type === 'RESTAURANT') {
      dbManager.run('UPDATE restaurants SET approval_status = ? WHERE id = ?', [status, id]);
    } else if (type === 'TAXI') {
      dbManager.run('UPDATE taxi_services SET approval_status = ? WHERE id = ?', [status, id]);
    }

    logActivity(req.user!.id, req.user!.name, 'MODERATE_BUSINESS', String(type), Number(id), `Set status to ${status}`);
    res.json({ success: true, message: `Business ${type} marked as ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update business status' });
  }
};

// USERS MANAGEMENT
export const getUsersAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = dbManager.query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.status, u.created_at, p.location
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       ORDER BY u.created_at DESC`
    );
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const updateUserAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    if (role) {
      dbManager.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    }
    if (status) {
      dbManager.run('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    }

    logActivity(req.user!.id, req.user!.name, 'UPDATE_USER', 'USER', Number(id), `Updated user role=${role}, status=${status}`);
    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

// BOOKINGS ADMIN
export const getBookingsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = dbManager.query(
      `SELECT b.*, u.name as customer_name, u.email as customer_email,
              t.service_name, t.driver_name, t.phone as driver_phone, c.name as city_name
       FROM taxi_bookings b
       JOIN users u ON u.id = b.customer_id
       JOIN taxi_services t ON t.id = b.taxi_service_id
       JOIN cities c ON c.id = t.city_id
       ORDER BY b.created_at DESC`
    );
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

// REVIEW MODERATION
export const getReviewsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = dbManager.query(
      `SELECT r.*, u.name as user_name, u.email as user_email
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       ORDER BY r.created_at DESC`
    );
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

export const toggleReviewModeration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_moderated } = req.body; // 1 = visible, 0 = hidden
    dbManager.run('UPDATE reviews SET is_moderated = ? WHERE id = ?', [is_moderated ? 1 : 0, id]);
    res.json({ success: true, message: `Review visibility updated` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update review status' });
  }
};

// CMS & SITE SETTINGS
export const getSiteSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = dbManager.query('SELECT * FROM site_settings');
    const dict: Record<string, string> = {};
    settings.forEach((s) => {
      dict[s.key] = s.value;
    });
    res.json({ success: true, data: dict, list: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch site settings' });
  }
};

export const updateSiteSetting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key, value } = req.body;
    dbManager.run('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', [key, value, value]);
    logActivity(req.user!.id, req.user!.name, 'UPDATE_CMS', 'SETTING', 0, `Updated setting ${key}`);
    res.json({ success: true, message: `Setting ${key} updated` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update setting' });
  }
};

// FEATURE FLAGS
export const getFeatureFlags = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const flags = dbManager.query('SELECT * FROM feature_settings');
    res.json({ success: true, data: flags });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch feature flags' });
  }
};

export const toggleFeatureFlag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { is_enabled } = req.body;
    dbManager.run('UPDATE feature_settings SET is_enabled = ? WHERE key = ?', [is_enabled ? 1 : 0, key]);
    logActivity(req.user!.id, req.user!.name, 'TOGGLE_FEATURE', 'FEATURE', 0, `Set feature ${key} to ${is_enabled ? 'ON' : 'OFF'}`);
    res.json({ success: true, message: `Feature flag updated` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update feature flag' });
  }
};

// ACTIVITY LOGS
export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = dbManager.query('SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 50');
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch activity logs' });
  }
};

// GLOBAL ADMIN SEARCH
export const globalAdminSearch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q) {
      res.json({ success: true, data: {} });
      return;
    }

    const term = `%${q}%`;
    const cities = dbManager.query('SELECT id, name, "CITY" as type FROM cities WHERE name LIKE ? LIMIT 5', [term]);
    const places = dbManager.query('SELECT id, name, "PLACE" as type FROM tourist_places WHERE name LIKE ? LIMIT 5', [term]);
    const hotels = dbManager.query('SELECT id, name, "HOTEL" as type FROM hotels WHERE name LIKE ? LIMIT 5', [term]);
    const users = dbManager.query('SELECT id, name, email, "USER" as type FROM users WHERE name LIKE ? OR email LIKE ? LIMIT 5', [term, term]);

    res.json({ success: true, results: { cities, places, hotels, users } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};
