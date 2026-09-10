import bcrypt from 'bcryptjs';
import { dbManager } from './database';
import {
  STATES_DATA,
  CITIES_DATA,
  TOURIST_PLACES_DATA,
  HIDDEN_GEMS_DATA,
  HOTELS_DATA,
  RESTAURANTS_DATA,
  TAXI_SERVICES_DATA,
} from '../data/seedData';

export async function runSeed(force: boolean = false) {
  await dbManager.init();

  const userCount = dbManager.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users');
  if (userCount && userCount.count > 0 && !force) {
    console.log('Database already seeded. Skipping initial seed.');
    return;
  }

  if (force) {
    console.log('Force re-seeding: clearing existing tables...');
    const tables = [
      'admin_activity_logs', 'notifications', 'site_settings', 'feature_settings',
      'reviews', 'favorites', 'itinerary_stops', 'itinerary_days', 'trips',
      'taxi_bookings', 'taxi_services', 'menu_items', 'restaurants',
      'hotel_rooms', 'hotels', 'hidden_gems', 'tourist_places', 'cities',
      'states', 'cms_hero_slides', 'profiles', 'users'
    ];
    for (const t of tables) {
      try {
        dbManager.run(`DELETE FROM ${t}`);
      } catch (e) {
        // Table might not exist yet
      }
    }
  }

  console.log('🌱 Starting database seeding for TravelSaathi AI...');

  // 1. Seed Users
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('Admin@123', salt);
  const contentHash = bcrypt.hashSync('Content@123', salt);
  const modHash = bcrypt.hashSync('Moderator@123', salt);
  const bizHash = bcrypt.hashSync('Business@123', salt);
  const touristHash = bcrypt.hashSync('Tourist@123', salt);

  const users = [
    { name: 'Super Administrator', email: 'admin@travelsaathi.ai', hash: adminHash, role: 'SUPER_ADMIN', phone: '+91 99999 00001' },
    { name: 'Priya Sharma (Content)', email: 'content@travelsaathi.ai', hash: contentHash, role: 'CONTENT_MANAGER', phone: '+91 99999 00002' },
    { name: 'Arun Verma (Moderator)', email: 'moderator@travelsaathi.ai', hash: modHash, role: 'BUSINESS_MODERATOR', phone: '+91 99999 00003' },
    { name: 'Vikram Rajput (Owner)', email: 'business@travelsaathi.ai', hash: bizHash, role: 'BUSINESS_OWNER', phone: '+91 99999 00004' },
    { name: 'Aditi Deshmukh (Tourist)', email: 'tourist@travelsaathi.ai', hash: touristHash, role: 'TOURIST', phone: '+91 99999 00005' },
  ];

  const userIds: Record<string, number> = {};
  for (const u of users) {
    const res = dbManager.run(
      'INSERT INTO users (name, email, password_hash, role, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
      [u.name, u.email, u.hash, u.role, u.phone, 'ACTIVE']
    );
    userIds[u.role] = res.lastInsertRowid;

    // Insert profile
    dbManager.run(
      'INSERT INTO profiles (user_id, bio, avatar_url, location) VALUES (?, ?, ?, ?)',
      [
        res.lastInsertRowid,
        `${u.name} - Welcome to TravelSaathi AI`,
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name)}`,
        'India'
      ]
    );
  }

  // 2. Seed States
  const stateIds: Record<string, number> = {};
  for (const s of STATES_DATA) {
    const res = dbManager.run(
      'INSERT INTO states (name, code, capital, region, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [s.name, s.code, s.capital, s.region, s.description, s.image_url]
    );
    stateIds[s.code] = res.lastInsertRowid;
  }

  // 3. Seed Cities
  const cityIds: Record<string, number> = {};
  for (const c of CITIES_DATA) {
    const stateId = stateIds[c.state_code] || 1;
    const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const res = dbManager.run(
      'INSERT INTO cities (state_id, name, slug, description, cover_image, gallery_json, latitude, longitude, categories_json, is_featured, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        stateId,
        c.name,
        slug,
        c.description,
        c.cover_image,
        JSON.stringify([c.cover_image]),
        c.latitude,
        c.longitude,
        JSON.stringify(c.categories),
        c.is_featured ? 1 : 0,
        1
      ]
    );
    cityIds[c.name] = res.lastInsertRowid;
  }

  // 4. Seed Tourist Places
  for (const p of TOURIST_PLACES_DATA) {
    const cityId = cityIds[p.cityName];
    if (!cityId) continue;
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    dbManager.run(
      `INSERT INTO tourist_places (
        city_id, name, slug, description, cover_image, gallery_json, category, address,
        latitude, longitude, opening_time, closing_time, entry_fee, best_visiting_time,
        recommended_duration_hours, rating, review_count, family_friendly, couple_friendly,
        solo_friendly, budget_friendly, is_premium, is_featured, is_published, ai_priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cityId,
        p.name,
        slug,
        p.description,
        p.cover_image,
        JSON.stringify([
          p.cover_image,
          'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=1200&q=80'
        ]),
        p.category,
        p.address,
        p.latitude,
        p.longitude,
        p.opening_time,
        p.closing_time,
        p.entry_fee,
        p.best_visiting_time,
        p.recommended_duration_hours,
        p.rating,
        p.review_count,
        p.family_friendly ? 1 : 0,
        p.couple_friendly ? 1 : 0,
        p.solo_friendly ? 1 : 0,
        p.budget_friendly ? 1 : 0,
        p.is_premium ? 1 : 0,
        p.is_featured ? 1 : 0,
        1,
        p.ai_priority
      ]
    );
  }

  // 5. Seed Hidden Gems
  for (const g of HIDDEN_GEMS_DATA) {
    const cityId = cityIds[g.cityName];
    if (!cityId) continue;
    dbManager.run(
      `INSERT INTO hidden_gems (
        city_id, name, description, photos_json, category, location, best_time,
        duration_hours, entry_fee, distance_from_city_km, route_info, rating,
        is_featured, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cityId,
        g.name,
        g.description,
        JSON.stringify(g.photos),
        g.category,
        g.location,
        g.best_time,
        g.duration_hours,
        g.entry_fee,
        g.distance_from_city_km,
        g.route_info,
        g.rating,
        g.is_featured ? 1 : 0,
        1
      ]
    );
  }

  // 6. Seed Hotels & Rooms
  const bizOwnerId = userIds['BUSINESS_OWNER'] || 4;
  for (const h of HOTELS_DATA) {
    const cityId = cityIds[h.cityName];
    if (!cityId) continue;
    const hotelRes = dbManager.run(
      `INSERT INTO hotels (
        owner_id, city_id, name, description, photos_json, address, latitude, longitude,
        price_per_night, facilities_json, rating, phone, email, website, approval_status,
        is_featured, is_published, views_count, saves_count, contact_clicks, website_clicks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bizOwnerId,
        cityId,
        h.name,
        h.description,
        JSON.stringify(h.photos || ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80']),
        `${h.name}, City Center, ${h.cityName}`,
        28.6139,
        77.2090,
        h.price_per_night,
        JSON.stringify(h.facilities),
        h.rating,
        h.phone,
        h.email,
        'https://travelsaathi.ai',
        'APPROVED',
        h.is_featured ? 1 : 0,
        1,
        120,
        34,
        22,
        15
      ]
    );

    // Add rooms
    dbManager.run(
      'INSERT INTO hotel_rooms (hotel_id, room_type, price_per_night, capacity, photos_json, amenities_json) VALUES (?, ?, ?, ?, ?, ?)',
      [
        hotelRes.lastInsertRowid,
        'Deluxe King Room',
        h.price_per_night,
        2,
        JSON.stringify(['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80']),
        JSON.stringify(['King Bed', 'AC', 'Free Wi-Fi', 'Attached Bath', 'City View'])
      ]
    );
    dbManager.run(
      'INSERT INTO hotel_rooms (hotel_id, room_type, price_per_night, capacity, photos_json, amenities_json) VALUES (?, ?, ?, ?, ?, ?)',
      [
        hotelRes.lastInsertRowid,
        'Executive Suite',
        Math.round(h.price_per_night * 1.6),
        4,
        JSON.stringify(['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80']),
        JSON.stringify(['Living Area', 'King Bed', 'Mini Bar', 'Bathtub', 'Balcony'])
      ]
    );
  }

  // 7. Seed Restaurants & Menu
  for (const r of RESTAURANTS_DATA) {
    const cityId = cityIds[r.cityName];
    if (!cityId) continue;
    const restRes = dbManager.run(
      `INSERT INTO restaurants (
        owner_id, city_id, name, description, photos_json, cuisine, popular_dishes_json,
        facilities_json, opening_hours, avg_cost_for_two, rating, phone, email, website,
        approval_status, is_featured, is_published, views_count, saves_count, contact_clicks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bizOwnerId,
        cityId,
        r.name,
        `Famous dining destination in ${r.cityName} celebrated for authentic culinary flavours and traditional ambiance.`,
        JSON.stringify(r.photos || ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80']),
        r.cuisine,
        JSON.stringify(r.popular_dishes),
        JSON.stringify(['Air Conditioned', 'Family Seating', 'Takeaway', 'Card Payments']),
        '11:00 AM - 11:00 PM',
        r.avg_cost_for_two,
        r.rating,
        r.phone,
        'dining@travelsaathi.ai',
        'https://travelsaathi.ai',
        'APPROVED',
        r.is_featured ? 1 : 0,
        1,
        185,
        42,
        30
      ]
    );

    for (const dish of r.popular_dishes) {
      dbManager.run(
        'INSERT INTO menu_items (restaurant_id, name, description, price, is_veg, category) VALUES (?, ?, ?, ?, ?, ?)',
        [
          restRes.lastInsertRowid,
          dish,
          `Chef’s signature preparation of ${dish} with authentic herbs and spices.`,
          Math.round(r.avg_cost_for_two / 3),
          dish.toLowerCase().includes('chicken') || dish.toLowerCase().includes('mutton') || dish.toLowerCase().includes('prawn') || dish.toLowerCase().includes('fish') ? 0 : 1,
          'Main Course'
        ]
      );
    }
  }

  // 8. Seed Taxi Services
  for (const t of TAXI_SERVICES_DATA) {
    const cityId = cityIds[t.cityName];
    if (!cityId) continue;
    dbManager.run(
      `INSERT INTO taxi_services (
        owner_id, city_id, service_name, driver_name, phone, vehicle_type, vehicle_photos_json,
        passenger_capacity, base_fare, per_km_fare, per_hour_fare, airport_fare, outstation_fare,
        service_location, service_area, latitude, longitude, availability_status, services_offered,
        description, rating, approval_status, is_featured, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bizOwnerId,
        cityId,
        t.service_name,
        t.driver_name,
        t.phone,
        t.vehicle_type,
        JSON.stringify(['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80']),
        t.capacity,
        t.base_fare,
        t.per_km_fare,
        t.per_hour_fare,
        t.airport_fare,
        t.per_km_fare * 1.5,
        `${t.cityName} Center & Airport`,
        `Entire ${t.cityName} Metropolitan Region`,
        28.6139,
        77.2090,
        'AVAILABLE',
        'Local Sightseeing, Airport Transfers, Outstation Trips',
        `Reliable, air-conditioned ${t.vehicle_type} driven by verified professional driver ${t.driver_name}.`,
        t.rating,
        'APPROVED',
        1,
        1
      ]
    );
  }

  // 9. Seed Site Settings
  const settings = [
    { key: 'site_name', value: 'TravelSaathi AI', category: 'General', description: 'Application display name' },
    { key: 'site_tagline', value: 'Discover India. Plan Smarter. Travel Better.', category: 'General', description: 'Hero tagline' },
    { key: 'contact_email', value: 'namaste@travelsaathi.ai', category: 'Contact', description: 'Public support email' },
    { key: 'contact_phone', value: '+91 11 2345 6789', category: 'Contact', description: 'Public contact phone' },
    { key: 'currency_symbol', value: '₹', category: 'Localization', description: 'Default currency symbol' },
    { key: 'default_country', value: 'India', category: 'Localization', description: 'Default country' },
    { key: 'about_text', value: 'TravelSaathi AI is an India-focused AI tourism ecosystem bridging travellers, local businesses, hidden gems, and state-of-the-art itinerary planning into one seamless journey.', category: 'CMS', description: 'About us content' },
    { key: 'hero_heading', value: 'Discover India. Plan Smarter. Travel Better.', category: 'CMS', description: 'Homepage hero title' },
    { key: 'hero_subtitle', value: 'Your AI-powered travel companion for personalized trips, hidden gems, hotels, restaurants and local transport across India.', category: 'CMS', description: 'Homepage hero description' }
  ];

  for (const s of settings) {
    dbManager.run(
      'INSERT INTO site_settings (key, value, category, description) VALUES (?, ?, ?, ?)',
      [s.key, s.value, s.category, s.description]
    );
  }

  // 10. Seed Feature Settings
  const features = [
    { key: 'ai_trip_planner', name: 'AI Trip Planner', description: 'AI-driven custom multi-day itinerary generation' },
    { key: 'taxi_booking', name: 'Taxi Booking', description: 'Direct customer taxi discovery and booking engine' },
    { key: 'reviews', name: 'Ratings & Reviews', description: 'Customer feedback on places, hotels, and taxis' },
    { key: 'hidden_gems', name: 'Hidden Gems Discovery', description: 'Offbeat and uncrowded tourism destinations' },
    { key: 'business_registration', name: 'Business Portal', description: 'Hotel, Restaurant, and Taxi partner registration' },
    { key: 'location_services', name: 'Taxi Near Me (GPS)', description: 'Geolocation-based transport finder' },
    { key: 'notifications', name: 'In-app Notifications', description: 'Real-time booking and trip alerts' },
  ];

  for (const f of features) {
    dbManager.run(
      'INSERT INTO feature_settings (key, name, description, is_enabled) VALUES (?, ?, ?, 1)',
      [f.key, f.name, f.description]
    );
  }

  // 11. Seed Sample Booking & Notification
  const touristId = userIds['TOURIST'] || 5;
  const taxi = dbManager.queryOne<{ id: number }>('SELECT id FROM taxi_services LIMIT 1');
  if (taxi) {
    const bookingRes = dbManager.run(
      `INSERT INTO taxi_bookings (
        booking_reference, customer_id, taxi_service_id, pickup_address, drop_address,
        pickup_date, pickup_time, passengers, vehicle_type, estimated_fare, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'TS-DEL-8942',
        touristId,
        taxi.id,
        'Indira Gandhi International Airport, Terminal 3',
        'Connaught Place, New Delhi',
        '2026-09-15',
        '10:30 AM',
        2,
        'Sedan',
        650,
        'ACCEPTED',
        'Arriving on Indigo flight 6E-204'
      ]
    );

    dbManager.run(
      'INSERT INTO notifications (user_id, title, message, type, is_read, link) VALUES (?, ?, ?, ?, ?, ?)',
      [
        touristId,
        'Taxi Booking Confirmed!',
        'Your taxi booking TS-DEL-8942 for Delhi has been accepted by the driver.',
        'BOOKING',
        0,
        '/dashboard'
      ]
    );
  }

  // 12. Seed Activity Log
  dbManager.run(
    'INSERT INTO admin_activity_logs (admin_id, admin_name, action, entity_type, details) VALUES (?, ?, ?, ?, ?)',
    [
      userIds['SUPER_ADMIN'] || 1,
      'Super Administrator',
      'INITIAL_SEED',
      'SYSTEM',
      'Initialized TravelSaathi AI database with 40+ cities, monuments, hotels, restaurants, and taxis.'
    ]
  );

  dbManager.save();
  console.log('✅ Seeding completed successfully and saved to disk!');
}

const isDirectRun = process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed');
if (isDirectRun) {
  runSeed(true).then(() => {
    console.log('Database ready.');
    process.exit(0);
  }).catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}
