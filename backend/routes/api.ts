import { Router, Request, Response } from 'express';
import * as authCtrl from '../controllers/authController';
import * as tourismCtrl from '../controllers/tourismController';
import * as tripCtrl from '../controllers/tripController';
import * as hotelCtrl from '../controllers/hotelController';
import * as restCtrl from '../controllers/restaurantController';
import * as taxiCtrl from '../controllers/taxiController';
import * as reviewCtrl from '../controllers/reviewController';
import * as favCtrl from '../controllers/favoriteController';
import * as adminCtrl from '../controllers/adminController';
import * as bizCtrl from '../controllers/businessController';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { dbManager } from '../db/database';

const router = Router();

// ==================== AUTHENTICATION ====================
router.post('/auth/signup', authCtrl.signup);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authMiddleware, authCtrl.me);
router.put('/auth/profile', authMiddleware, authCtrl.updateProfile);

// ==================== PUBLIC CMS & SETTINGS ====================
router.get('/cms/settings', async (req: Request, res: Response) => {
  try {
    const settings = dbManager.query('SELECT * FROM site_settings');
    const dict: Record<string, string> = {};
    settings.forEach((s) => { dict[s.key] = s.value; });
    res.json({ success: true, data: dict });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error loading settings' });
  }
});

router.get('/cms/features', async (req: Request, res: Response) => {
  try {
    const features = dbManager.query('SELECT * FROM feature_settings');
    const dict: Record<string, boolean> = {};
    features.forEach((f) => { dict[f.key] = Boolean(f.is_enabled); });
    res.json({ success: true, data: dict });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error loading features' });
  }
});

router.get('/cms/homepage', async (req: Request, res: Response) => {
  try {
    const featuredCities = dbManager.query(
      'SELECT * FROM cities WHERE is_featured = 1 AND is_published = 1 LIMIT 8'
    ).map(c => ({ ...c, categories: JSON.parse(c.categories_json || '[]') }));

    const featuredPlaces = dbManager.query(
      'SELECT p.*, c.name as city_name FROM tourist_places p JOIN cities c ON c.id = p.city_id WHERE p.is_featured = 1 AND p.is_published = 1 LIMIT 8'
    ).map(p => ({ ...p, gallery: JSON.parse(p.gallery_json || '[]') }));

    const hiddenGems = dbManager.query(
      'SELECT g.*, c.name as city_name FROM hidden_gems g JOIN cities c ON c.id = g.city_id WHERE g.is_published = 1 LIMIT 6'
    ).map(g => ({ ...g, photos: JSON.parse(g.photos_json || '[]') }));

    const featuredHotels = dbManager.query(
      'SELECT h.*, c.name as city_name FROM hotels h JOIN cities c ON c.id = h.city_id WHERE h.is_featured = 1 AND h.approval_status = "APPROVED" AND h.is_published = 1 LIMIT 6'
    ).map(h => ({ ...h, photos: JSON.parse(h.photos_json || '[]'), facilities: JSON.parse(h.facilities_json || '[]') }));

    const featuredRestaurants = dbManager.query(
      'SELECT r.*, c.name as city_name FROM restaurants r JOIN cities c ON c.id = r.city_id WHERE r.is_featured = 1 AND r.approval_status = "APPROVED" AND r.is_published = 1 LIMIT 6'
    ).map(r => ({ ...r, photos: JSON.parse(r.photos_json || '[]'), popular_dishes: JSON.parse(r.popular_dishes_json || '[]') }));

    const featuredTaxis = dbManager.query(
      'SELECT t.*, c.name as city_name FROM taxi_services t JOIN cities c ON c.id = t.city_id WHERE t.approval_status = "APPROVED" AND t.is_published = 1 LIMIT 4'
    );

    res.json({
      success: true,
      data: {
        featuredCities,
        featuredPlaces,
        hiddenGems,
        featuredHotels,
        featuredRestaurants,
        featuredTaxis,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error loading homepage CMS content' });
  }
});

// ==================== TOURISM DISCOVERY ====================
router.get('/states', tourismCtrl.getStates);
router.get('/cities', tourismCtrl.getCities);
router.get('/cities/:id', tourismCtrl.getCityById);
router.get('/places', tourismCtrl.getPlaces);
router.get('/places/:id', tourismCtrl.getPlaceById);
router.get('/hidden-gems', tourismCtrl.getHiddenGems);

// ==================== HOTELS ====================
router.get('/hotels', hotelCtrl.getHotels);
router.get('/hotels/:id', hotelCtrl.getHotelById);

// ==================== RESTAURANTS ====================
router.get('/restaurants', restCtrl.getRestaurants);
router.get('/restaurants/:id', restCtrl.getRestaurantById);

// ==================== TAXIS & TAXI NEAR ME ====================
router.get('/taxis', taxiCtrl.getTaxis);
router.get('/taxis/near-me', taxiCtrl.getTaxiNearMe);
router.get('/taxis/:id', taxiCtrl.getTaxiById);
router.post('/bookings/taxi', authMiddleware, taxiCtrl.createBooking);
router.get('/bookings/my-bookings', authMiddleware, taxiCtrl.getMyBookings);
router.put('/bookings/:id/status', authMiddleware, taxiCtrl.updateBookingStatus);

// ==================== AI TRIP PLANNER ====================
router.post('/trips/generate', tripCtrl.generateTrip);
router.post('/trips/optimize', tripCtrl.optimizeTrip);
router.post('/trips/save', authMiddleware, tripCtrl.saveTrip);
router.get('/trips/my-trips', authMiddleware, tripCtrl.getUserTrips);
router.get('/trips/:id', tripCtrl.getTripById);
router.delete('/trips/:id', authMiddleware, tripCtrl.deleteTrip);

// ==================== REVIEWS & RATINGS ====================
router.post('/reviews', authMiddleware, reviewCtrl.createReview);
router.get('/reviews', reviewCtrl.getReviews);

// ==================== FAVORITES ====================
router.post('/favorites/toggle', authMiddleware, favCtrl.toggleFavorite);
router.get('/favorites', authMiddleware, favCtrl.getFavorites);

// ==================== NOTIFICATIONS ====================
router.get('/notifications', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const notifications = dbManager.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user!.id]
    );
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

router.put('/notifications/:id/read', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    dbManager.run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

// ==================== BUSINESS OWNER ====================
router.post('/business/register', authMiddleware, bizCtrl.registerBusiness);
router.get('/business/dashboard', authMiddleware, bizCtrl.getBusinessDashboard);
router.put('/business/:type/:id', authMiddleware, bizCtrl.updateBusinessProfile);

// ==================== GLOBAL SEARCH ====================
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      res.json({ success: true, data: { cities: [], places: [], hotels: [], restaurants: [], hiddenGems: [] } });
      return;
    }

    const searchTerm = `%${q}%`;
    const cities = dbManager.query(
      'SELECT * FROM cities WHERE is_published = 1 AND (name LIKE ? OR description LIKE ?) LIMIT 6',
      [searchTerm, searchTerm]
    );

    const places = dbManager.query(
      `SELECT p.*, c.name as city_name FROM tourist_places p
       JOIN cities c ON c.id = p.city_id
       WHERE p.is_published = 1 AND (p.name LIKE ? OR p.category LIKE ? OR p.description LIKE ?) LIMIT 6`,
      [searchTerm, searchTerm, searchTerm]
    );

    const hotels = dbManager.query(
      `SELECT h.*, c.name as city_name FROM hotels h
       JOIN cities c ON c.id = h.city_id
       WHERE h.approval_status = "APPROVED" AND h.is_published = 1 AND (h.name LIKE ? OR h.description LIKE ? OR c.name LIKE ?) LIMIT 6`,
      [searchTerm, searchTerm, searchTerm]
    );

    const restaurants = dbManager.query(
      `SELECT r.*, c.name as city_name FROM restaurants r
       JOIN cities c ON c.id = r.city_id
       WHERE r.approval_status = "APPROVED" AND r.is_published = 1 AND (r.name LIKE ? OR r.cuisine LIKE ? OR c.name LIKE ?) LIMIT 6`,
      [searchTerm, searchTerm, searchTerm]
    );

    const hiddenGems = dbManager.query(
      `SELECT g.*, c.name as city_name FROM hidden_gems g
       JOIN cities c ON c.id = g.city_id
       WHERE g.is_published = 1 AND (g.name LIKE ? OR g.description LIKE ? OR c.name LIKE ?) LIMIT 6`,
      [searchTerm, searchTerm, searchTerm]
    );

    res.json({
      success: true,
      data: {
        cities,
        places,
        hotels,
        restaurants,
        hiddenGems,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

// ==================== AI ASSISTANT CHAT ====================
router.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    const lower = message.toLowerCase();

    // Detect if user mentions a city
    const allCities = dbManager.query<any>('SELECT id, name FROM cities WHERE is_published = 1');
    const matchedCity = allCities.find((c) => lower.includes(c.name.toLowerCase()));

    let reply = '';
    let suggestions = [
      'Top places to visit in Jaipur',
      'Plan a 3-day trip under ₹15,000',
      'Best street food in Delhi',
      'Hidden gems in Agra',
    ];

    if (matchedCity) {
      const places = dbManager.query<any>('SELECT name, category, rating, entry_fee FROM tourist_places WHERE city_id = ? AND is_published = 1 LIMIT 4', [matchedCity.id]);
      const hotels = dbManager.query<any>('SELECT name, price_per_night, rating FROM hotels WHERE city_id = ? AND approval_status = "APPROVED" LIMIT 2', [matchedCity.id]);
      const restaurants = dbManager.query<any>('SELECT name, cuisine, avg_cost_for_two FROM restaurants WHERE city_id = ? AND approval_status = "APPROVED" LIMIT 2', [matchedCity.id]);
      const gems = dbManager.query<any>('SELECT name, best_time FROM hidden_gems WHERE city_id = ? AND is_published = 1 LIMIT 2', [matchedCity.id]);

      if (lower.includes('hotel') || lower.includes('stay') || lower.includes('resort')) {
        reply = `Here are verified hotels in **${matchedCity.name}**:\n\n` +
          hotels.map((h) => `🏨 **${h.name}** (⭐ ${h.rating}) — ₹${h.price_per_night}/night`).join('\n') +
          `\n\n💡 *Tip: You can book these stays or customize your accommodation tier directly in the Trip Planner.*`;
      } else if (lower.includes('food') || lower.includes('eat') || lower.includes('restaurant') || lower.includes('dish')) {
        reply = `Here are top recommended culinary spots in **${matchedCity.name}**:\n\n` +
          restaurants.map((r) => `🍽️ **${r.name}** — ${r.cuisine} (approx. ₹${r.avg_cost_for_two} for two)`).join('\n') +
          `\n\nMust try authentic regional delicacies and local sweets!`;
      } else if (lower.includes('hidden gem') || lower.includes('secret') || lower.includes('offbeat')) {
        reply = `Here are enchanting hidden gems in **${matchedCity.name}**:\n\n` +
          gems.map((g) => `✨ **${g.name}** — Best visited at ${g.best_time || 'Morning'}`).join('\n') +
          `\n\nThese spots are uncrowded and preserve timeless architectural charm.`;
      } else {
        reply = `**${matchedCity.name}** is a splendid destination! Here are top highlights:\n\n` +
          `🏛️ **Iconic Attractions:**\n` +
          places.map((p) => `• **${p.name}** (${p.category}) — ₹${p.entry_fee || 'Free'} entry`).join('\n') +
          (hotels.length > 0 ? `\n\n🏨 **Recommended Stay:** ${hotels[0].name} (₹${hotels[0].price_per_night}/night)` : '') +
          (gems.length > 0 ? `\n\n✨ **Hidden Gem:** ${gems[0].name}` : '') +
          `\n\nReady to explore? Click **Plan My Trip** to generate an optimized AI day-by-day itinerary!`;
      }

      suggestions = [
        `Hotels in ${matchedCity.name}`,
        `Best food in ${matchedCity.name}`,
        `Hidden gems in ${matchedCity.name}`,
        `Plan a 2-day trip to ${matchedCity.name}`,
      ];
    } else if (lower.includes('budget') || lower.includes('cost') || lower.includes('rupee') || lower.includes('₹') || lower.includes('10000') || lower.includes('15000') || lower.includes('25000')) {
      reply = `To plan an optimal trip within your budget:\n\n` +
        `1. **₹5,000 – ₹10,000 (Budget):** Perfect for 2-3 days in Rishikesh, Amritsar, or Jaipur with train/bus transit and heritage dharamshalas/guesthouses.\n` +
        `2. **₹15,000 – ₹25,000 (Mid-Range):** Ideal for a 3-4 day couple or family getaway in Udaipur, Manali, or Goa with boutique hotels and self-drive routes.\n` +
        `3. **₹30,000+ (Premium):** Luxurious stays in palace suites, private SUV chauffeurs, and royal fine dining.\n\n` +
        `Use our **Smart Budget Engine** in **Plan My Trip** to automatically optimize hotel, dining, and transit savings!`;
    } else {
      reply = `Namaste! 🙏 I am your **TravelSaathi AI Assistant**.\n\n` +
        `I can help you:\n` +
        `• Generate day-by-day itineraries across 16+ verified Indian destinations\n` +
        `• Suggest verified hotels, culinary hotspots, and secret hidden gems\n` +
        `• Estimate road travel, FASTag tolls, and fuel expenses for self-vehicle trips\n` +
        `• Optimize travel budgets to prevent overspending\n\n` +
        `Which city or experience would you like to explore today?`;
    }

    res.json({ success: true, reply, suggestions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI Assistant error' });
  }
});

// ==================== SUPER ADMIN CONTROL PANEL ====================
router.get('/admin/stats', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER', 'BUSINESS_MODERATOR'), adminCtrl.getDashboardStats);

// Cities
router.get('/admin/cities', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.getCitiesAdmin);
router.post('/admin/cities', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.createCity);
router.put('/admin/cities/:id', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.updateCity);
router.delete('/admin/cities/:id', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.deleteCity);

// Places
router.get('/admin/places', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.getPlacesAdmin);
router.post('/admin/places', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.createPlace);
router.put('/admin/places/:id', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.updatePlace);
router.delete('/admin/places/:id', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.deletePlace);

// Hidden Gems
router.get('/admin/hidden-gems', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.getHiddenGemsAdmin);
router.post('/admin/hidden-gems', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.createHiddenGem);
router.delete('/admin/hidden-gems/:id', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.deleteHiddenGem);

// Business Approvals & Moderation
router.get('/admin/business-approvals', authMiddleware, requireRole('SUPER_ADMIN', 'BUSINESS_MODERATOR'), adminCtrl.getBusinessApprovals);
router.put('/admin/business-approvals/:type/:id', authMiddleware, requireRole('SUPER_ADMIN', 'BUSINESS_MODERATOR'), adminCtrl.updateBusinessStatus);

// Users Management
router.get('/admin/users', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.getUsersAdmin);
router.put('/admin/users/:id', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.updateUserAdmin);

// Bookings
router.get('/admin/bookings', authMiddleware, requireRole('SUPER_ADMIN', 'BUSINESS_MODERATOR'), adminCtrl.getBookingsAdmin);

// Reviews Moderation
router.get('/admin/reviews', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.getReviewsAdmin);
router.put('/admin/reviews/:id/moderation', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.toggleReviewModeration);

// CMS & Settings
router.get('/admin/settings', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.getSiteSettings);
router.post('/admin/settings', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.updateSiteSetting);

// Features
router.get('/admin/features', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.getFeatureFlags);
router.put('/admin/features/:key', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.toggleFeatureFlag);

// Logs & Search
router.get('/admin/activity-logs', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.getActivityLogs);
router.get('/admin/search', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.globalAdminSearch);

export default router;
