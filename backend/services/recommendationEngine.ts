import { dbManager } from '../db/database';

export interface PlanTripInput {
  cityId: number;
  budgetTarget: number;
  daysCount: number;
  travellersCount: number;
  adultsCount: number;
  childrenCount: number;
  transportMode: 'Self / Own Vehicle' | 'Own Car' | 'Own Bike' | 'Bus' | 'Train' | 'Flight' | 'Taxi' | 'Local Transport' | string;
  interests: string[];
  travellerType: 'Family' | 'Friends' | 'Solo' | 'Couple';
}

export interface GeneratedStop {
  stopOrder: number;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  stopType: 'BREAKFAST' | 'PLACE' | 'LUNCH' | 'HIDDEN_GEM' | 'DINNER' | 'HOTEL';
  entityType?: 'PLACE' | 'HOTEL' | 'RESTAURANT' | 'HIDDEN_GEM';
  entityId?: number;
  title: string;
  category?: string;
  imageUrl: string;
  description: string;
  startTime: string;
  durationHours: number;
  bestVisitingTime: string;
  entryFee: number;
  estimatedCost: number;
  distanceKm: number;
  travelTimeMins: number;
  transportNotes: string;
  latitude?: number;
  longitude?: number;
}

export interface GeneratedDay {
  dayNumber: number;
  dayTitle: string;
  notes: string;
  stops: GeneratedStop[];
}

export interface BudgetBreakdown {
  budgetTarget: number;
  estimatedTotalCost: number;
  remainingBudget: number;
  budgetPercentageUsed: number;
  isExceeded: boolean;
  excessAmount: number;
  hotelCost: number;
  foodCost: number;
  transportCost: number;
  activitiesCost: number;
  entryFeesCost: number;
  taxiCost: number;
  miscCost: number;
  savingsTips: string[];
  optimizationOptions?: {
    key: string;
    label: string;
    description: string;
    savings: number;
  }[];
}

export interface GeneratedTripResult {
  city: {
    id: number;
    name: string;
    description: string;
    coverImage: string;
    stateName?: string;
  };
  title: string;
  daysCount: number;
  travellersCount: number;
  adultsCount: number;
  childrenCount: number;
  transportMode: string;
  travellerType: string;
  interests: string[];
  budget: BudgetBreakdown;
  days: GeneratedDay[];
  routeSummary: {
    totalDistanceKm: number;
    totalTravelTimeMins: number;
    suggestedRoute: string;
    majorStops: string[];
    placesToVisitOnRoute: string[];
    fuelEstimate: number;
    tollEstimate: number;
    parkingTips: string;
    transitAdvice?: string;
  };
  recommendedHotels: any[];
  recommendedRestaurants: any[];
  recommendedHiddenGems: any[];
  availableTaxis: any[];
}

// Haversine distance in kilometers
function calculateDistance(lat1?: number, lon1?: number, lat2?: number, lon2?: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 3.5; // realistic fallback city transit km
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function safeParseJsonArray(str?: string): string[] {
  if (!str) return [];
  try {
    const res = JSON.parse(str);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export class RecommendationEngine {
  public static generateTrip(input: PlanTripInput, forceBudgetOptimization: boolean = false): GeneratedTripResult {
    // 1. Fetch City
    const city = dbManager.queryOne<{ id: number; name: string; description: string; cover_image: string; latitude: number; longitude: number }>(
      'SELECT id, name, description, cover_image, latitude, longitude FROM cities WHERE id = ? AND is_published = 1',
      [input.cityId]
    );

    if (!city) {
      throw new Error('Destination city not found or currently unpublished.');
    }

    // 2. Fetch Tourist Places
    let places = dbManager.query<any>(
      'SELECT * FROM tourist_places WHERE city_id = ? AND is_published = 1',
      [input.cityId]
    );

    // Fallback: if no tourist places exist for this city, create synthetic ones
    if (places.length === 0) {
      places = [
        {
          id: null, name: `${city.name} Historical Fort & Palace`, category: 'Heritage',
          description: `An impressive historical landmark and heritage architectural site reflecting the rich royal legacy of ${city.name}.`,
          cover_image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1000&q=80', entry_fee: 100, rating: 4.8, review_count: 350,
          recommended_duration_hours: 2.5, latitude: city.latitude + 0.005, longitude: city.longitude + 0.005,
          family_friendly: 1, couple_friendly: 1, solo_friendly: 1, budget_friendly: 1, is_premium: 0, ai_priority: 10,
        },
        {
          id: null, name: `${city.name} Cultural Heritage Pavilion`, category: 'Culture',
          description: `A vibrant cultural center showcasing the art, music, folk traditions and handicrafts of ${city.name}.`,
          cover_image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80', entry_fee: 50, rating: 4.5, review_count: 180,
          recommended_duration_hours: 1.5, latitude: city.latitude - 0.004, longitude: city.longitude + 0.006,
          family_friendly: 1, couple_friendly: 1, solo_friendly: 1, budget_friendly: 1, is_premium: 0, ai_priority: 8,
        },
        {
          id: null, name: `${city.name} Panoramic Viewpoint`, category: 'Nature',
          description: `A breathtaking viewpoint offering sunset panoramas and lush landscapes around ${city.name}.`,
          cover_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80', entry_fee: 0, rating: 4.7, review_count: 240,
          recommended_duration_hours: 1.5, latitude: city.latitude + 0.008, longitude: city.longitude - 0.005,
          family_friendly: 1, couple_friendly: 1, solo_friendly: 1, budget_friendly: 1, is_premium: 0, ai_priority: 9,
        },
        {
          id: null, name: `${city.name} Spice & Craft Bazaar`, category: 'Shopping',
          description: `Browse through aromatic spices, traditional textiles, and street delicacies at ${city.name}'s famous bazaar.`,
          cover_image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1000&q=80', entry_fee: 0, rating: 4.6, review_count: 310,
          recommended_duration_hours: 2.0, latitude: city.latitude - 0.002, longitude: city.longitude - 0.003,
          family_friendly: 1, couple_friendly: 1, solo_friendly: 1, budget_friendly: 1, is_premium: 0, ai_priority: 7,
        },
      ];
    }

    // 3. Fetch Hidden Gems
    const hiddenGems = dbManager.query<any>(
      'SELECT * FROM hidden_gems WHERE city_id = ? AND is_published = 1',
      [input.cityId]
    );

    // 4. Fetch Approved Hotels
    let hotels = dbManager.query<any>(
      'SELECT * FROM hotels WHERE city_id = ? AND approval_status = "APPROVED" AND is_published = 1 ORDER BY price_per_night ASC',
      [input.cityId]
    );

    // Fallback hotel if none seeded
    if (hotels.length === 0) {
      hotels = [{
        id: null, name: `${city.name} Heritage Inn & Suites`, description: `Comfortable boutique accommodation with modern amenities in the heart of ${city.name}.`,
        price_per_night: 2800, rating: 4.6, photos_json: JSON.stringify([
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80'
        ]),
      }];
    }

    // 5. Fetch Approved Restaurants
    let restaurants = dbManager.query<any>(
      'SELECT * FROM restaurants WHERE city_id = ? AND approval_status = "APPROVED" AND is_published = 1',
      [input.cityId]
    );

    // Fallback restaurants if none seeded
    if (restaurants.length === 0) {
      restaurants = [
        { id: null, name: `${city.name} Royal Heritage Kitchen`, avg_cost_for_two: 600, cuisine: 'Traditional Thali & Regional', photos_json: JSON.stringify(['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80']) },
        { id: null, name: `${city.name} Street Food & Chaat Corner`, avg_cost_for_two: 350, cuisine: 'Street Food & Snacks', photos_json: JSON.stringify(['https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80']) },
        { id: null, name: `${city.name} Grand Courtyard Dining`, avg_cost_for_two: 900, cuisine: 'Multi-Cuisine & Tandoor', photos_json: JSON.stringify(['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=80']) },
      ];
    }

    // 6. Fetch Taxi Services
    const taxis = dbManager.query<any>(
      'SELECT * FROM taxi_services WHERE city_id = ? AND approval_status = "APPROVED" AND is_published = 1',
      [input.cityId]
    );

    // Filter hotels by budget tier
    const dailyTargetPerPerson = input.budgetTarget / (input.daysCount * input.travellersCount);
    let chosenHotel = hotels[0];
    if (forceBudgetOptimization || dailyTargetPerPerson < 2000) {
      // Pick the cheapest hotel available
      chosenHotel = hotels.reduce((prev: any, curr: any) => (curr.price_per_night < prev.price_per_night ? curr : prev), hotels[0]);
    } else if (dailyTargetPerPerson > 6000) {
      // Luxury tier
      const luxury = hotels.filter((h: any) => h.price_per_night > 6000);
      chosenHotel = luxury.length > 0 ? luxury[0] : hotels[hotels.length - 1];
    } else {
      // Mid range
      const mid = hotels.filter((h: any) => h.price_per_night <= 5000);
      chosenHotel = mid.length > 0 ? mid[mid.length - 1] : hotels[0];
    }

    // 7. Score Tourist Places
    const scoredPlaces = places.map((p) => {
      let score = 0;

      // Interest Match (USP 1)
      if (input.interests.some((i) => p.category.toLowerCase().includes(i.toLowerCase()))) {
        score += 35;
      }

      // Traveller compatibility
      if (input.travellerType === 'Family' && p.family_friendly) score += 20;
      if (input.travellerType === 'Couple' && p.couple_friendly) score += 20;
      if (input.travellerType === 'Solo' && p.solo_friendly) score += 20;

      // Budget friendliness
      if (forceBudgetOptimization || dailyTargetPerPerson < 2500) {
        if (p.budget_friendly) score += 25;
        if (p.entry_fee === 0) score += 15;
        if (p.is_premium) score -= 30;
      } else if (dailyTargetPerPerson > 6000 && p.is_premium) {
        score += 25;
      }

      // Ratings & Popularity
      score += (p.rating || 4.5) * 6;
      score += Math.min(20, (p.review_count || 0) / 100);

      // AI Recommendation Priority (USP 2: Software Owner Direct CMS Control)
      score += (p.ai_priority || 5) * 5;

      return { ...p, calculatedScore: score };
    });

    // Sort places by highest score
    scoredPlaces.sort((a, b) => b.calculatedScore - a.calculatedScore);

    // 8. Generate Day-by-Day Stops
    const days: GeneratedDay[] = [];
    let placeIndex = 0;
    let gemIndex = 0;
    let totalDistanceKm = 0;
    let totalTravelTimeMins = 0;
    let totalEntryFees = 0;
    let totalFoodCost = 0;

    const baseTaxi = taxis.length > 0 ? taxis[0] : null;
    const roomsNeeded = Math.ceil(input.travellersCount / 2);
    const hotelCostPerDay = chosenHotel ? chosenHotel.price_per_night * roomsNeeded : 1500 * roomsNeeded;

    for (let d = 1; d <= input.daysCount; d++) {
      const dayStops: GeneratedStop[] = [];
      let stopOrder = 1;
      let lastLat = city.latitude;
      let lastLng = city.longitude;

      // 1. Morning Breakfast (08:30 AM)
      const breakfastRest = restaurants[d % restaurants.length] || {
        name: 'Traditional Indian Breakfast Corner',
        avg_cost_for_two: 400,
        cuisine: 'Local Heritage Breakfast',
      };
      const breakfastCost = Math.round((breakfastRest.avg_cost_for_two / 2) * input.travellersCount * 0.6);
      totalFoodCost += breakfastCost;
      const breakfastPhoto = safeParseJsonArray(breakfastRest.photos_json)[0] || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80';

      dayStops.push({
        stopOrder: stopOrder++,
        timeSlot: 'Morning',
        stopType: 'BREAKFAST',
        entityType: 'RESTAURANT',
        entityId: breakfastRest.id,
        title: `Breakfast at ${breakfastRest.name}`,
        category: 'Breakfast & Refreshment',
        imageUrl: breakfastPhoto,
        description: `Start Day ${d} energized with hot local delicacies, fresh masala chai, and authentic local breakfast.`,
        startTime: '08:30 AM',
        durationHours: 1.0,
        bestVisitingTime: '08:30 AM - 09:30 AM',
        entryFee: 0,
        estimatedCost: breakfastCost,
        distanceKm: 2.0,
        travelTimeMins: 10,
        transportNotes: input.transportMode === 'Taxi' ? 'Short morning ride via local cab' : 'Quick morning walk or transit',
      });

      // 2. Morning Tourist Place (10:00 AM)
      const morningPlace = scoredPlaces[placeIndex % scoredPlaces.length];
      placeIndex++;
      const morningDist = calculateDistance(lastLat, lastLng, morningPlace.latitude, morningPlace.longitude);
      lastLat = morningPlace.latitude || lastLat;
      lastLng = morningPlace.longitude || lastLng;
      totalDistanceKm += morningDist;
      const morningEntry = (morningPlace.entry_fee || 0) * input.travellersCount;
      totalEntryFees += morningEntry;

      dayStops.push({
        stopOrder: stopOrder++,
        timeSlot: 'Morning',
        stopType: 'PLACE',
        entityType: 'PLACE',
        entityId: morningPlace.id,
        title: morningPlace.name,
        category: morningPlace.category,
        imageUrl: morningPlace.cover_image,
        description: morningPlace.description,
        startTime: '10:00 AM',
        durationHours: morningPlace.recommended_duration_hours || 2.0,
        bestVisitingTime: morningPlace.best_visiting_time || 'Morning (09:30 AM - 12:30 PM)',
        entryFee: morningPlace.entry_fee || 0,
        estimatedCost: morningEntry,
        distanceKm: morningDist,
        travelTimeMins: Math.round(morningDist * 3),
        transportNotes: `Arrive via ${input.transportMode}. Best visited in morning soft light.`,
        latitude: morningPlace.latitude,
        longitude: morningPlace.longitude,
      });

      // 3. Afternoon Lunch (01:30 PM)
      const lunchRest = restaurants[(d + 1) % restaurants.length] || breakfastRest;
      const lunchCost = Math.round((lunchRest.avg_cost_for_two / 2) * input.travellersCount);
      totalFoodCost += lunchCost;
      const lunchPhoto = safeParseJsonArray(lunchRest.photos_json)[0] || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';

      dayStops.push({
        stopOrder: stopOrder++,
        timeSlot: 'Afternoon',
        stopType: 'LUNCH',
        entityType: 'RESTAURANT',
        entityId: lunchRest.id,
        title: `Authentic Lunch at ${lunchRest.name}`,
        category: lunchRest.cuisine,
        imageUrl: lunchPhoto,
        description: `Delight in traditional culinary specialties, thalis, and local chef favourites.`,
        startTime: '01:30 PM',
        durationHours: 1.25,
        bestVisitingTime: '01:00 PM - 02:30 PM',
        entryFee: 0,
        estimatedCost: lunchCost,
        distanceKm: 2.5,
        travelTimeMins: 12,
        transportNotes: 'Convenient central dining near tourist hubs',
      });

      // 4. Afternoon Tourist Place (03:00 PM)
      const afternoonPlace = scoredPlaces[placeIndex % scoredPlaces.length];
      placeIndex++;
      const afternoonDist = calculateDistance(lastLat, lastLng, afternoonPlace.latitude, afternoonPlace.longitude);
      lastLat = afternoonPlace.latitude || lastLat;
      lastLng = afternoonPlace.longitude || lastLng;
      totalDistanceKm += afternoonDist;
      const afternoonEntry = (afternoonPlace.entry_fee || 0) * input.travellersCount;
      totalEntryFees += afternoonEntry;

      dayStops.push({
        stopOrder: stopOrder++,
        timeSlot: 'Afternoon',
        stopType: 'PLACE',
        entityType: 'PLACE',
        entityId: afternoonPlace.id,
        title: afternoonPlace.name,
        category: afternoonPlace.category,
        imageUrl: afternoonPlace.cover_image,
        description: afternoonPlace.description,
        startTime: '03:00 PM',
        durationHours: afternoonPlace.recommended_duration_hours || 2.0,
        bestVisitingTime: afternoonPlace.best_visiting_time || 'Afternoon (02:30 PM - 05:00 PM)',
        entryFee: afternoonPlace.entry_fee || 0,
        estimatedCost: afternoonEntry,
        distanceKm: afternoonDist,
        travelTimeMins: Math.round(afternoonDist * 3),
        transportNotes: 'Short transit without unnecessary backtracking',
        latitude: afternoonPlace.latitude,
        longitude: afternoonPlace.longitude,
      });

      // 5. Evening Hidden Gem (05:30 PM)
      const gem = hiddenGems.length > 0 ? hiddenGems[gemIndex % hiddenGems.length] : null;
      if (gem) {
        gemIndex++;
        const gemCost = (gem.entry_fee || 0) * input.travellersCount;
        totalEntryFees += gemCost;
        totalDistanceKm += gem.distance_from_city_km ? Math.min(gem.distance_from_city_km, 12) : 4;

        dayStops.push({
          stopOrder: stopOrder++,
          timeSlot: 'Evening',
          stopType: 'HIDDEN_GEM',
          entityType: 'HIDDEN_GEM',
          entityId: gem.id,
          title: `Hidden Gem: ${gem.name}`,
          category: gem.category,
          imageUrl: safeParseJsonArray(gem.photos_json)[0] || city.cover_image,
          description: `${gem.description} (${gem.route_info})`,
          startTime: '05:30 PM',
          durationHours: gem.duration_hours || 1.5,
          bestVisitingTime: gem.best_time || 'Sunset / Golden Hour (05:00 PM - 07:00 PM)',
          entryFee: gem.entry_fee || 0,
          estimatedCost: gemCost,
          distanceKm: gem.distance_from_city_km || 4.5,
          travelTimeMins: 20,
          transportNotes: 'Offbeat uncrowded route. Wonderful sunset photography spot.',
        });
      }

      // 6. Evening Dinner (08:00 PM)
      const dinnerRest = restaurants[(d + 2) % restaurants.length] || lunchRest;
      const dinnerCost = Math.round((dinnerRest.avg_cost_for_two / 2) * input.travellersCount * 1.1);
      totalFoodCost += dinnerCost;
      const dinnerPhoto = safeParseJsonArray(dinnerRest.photos_json)[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';

      dayStops.push({
        stopOrder: stopOrder++,
        timeSlot: 'Evening',
        stopType: 'DINNER',
        entityType: 'RESTAURANT',
        entityId: dinnerRest.id,
        title: `Dinner at ${dinnerRest.name}`,
        category: 'Dinner Dining',
        imageUrl: dinnerPhoto,
        description: `Unwind with a comforting dinner accompanied by pleasant music and ambience.`,
        startTime: '08:00 PM',
        durationHours: 1.5,
        bestVisitingTime: 'Evening (07:30 PM - 09:30 PM)',
        entryFee: 0,
        estimatedCost: dinnerCost,
        distanceKm: 3.0,
        travelTimeMins: 15,
        transportNotes: 'Centrally located dinner spot',
      });

      // 7. Night Stay (09:30 PM)
      if (chosenHotel) {
        const hotelPhoto = safeParseJsonArray(chosenHotel.photos_json)[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
        dayStops.push({
          stopOrder: stopOrder++,
          timeSlot: 'Night',
          stopType: 'HOTEL',
          entityType: 'HOTEL',
          entityId: chosenHotel.id,
          title: `Overnight Stay: ${chosenHotel.name}`,
          category: 'Accommodation',
          imageUrl: hotelPhoto,
          description: `${chosenHotel.description} Rest well for Day ${d + 1}.`,
          startTime: '09:30 PM',
          durationHours: 10,
          bestVisitingTime: 'Night Check-in (09:30 PM onward)',
          entryFee: 0,
          estimatedCost: Math.round(hotelCostPerDay),
          distanceKm: 3.5,
          travelTimeMins: 15,
          transportNotes: `Hotel check-in / stay. Parking available for ${input.transportMode}.`,
        });
      }

      days.push({
        dayNumber: d,
        dayTitle: `Day ${d}: Iconic Highlights & Culture of ${city.name}`,
        notes: `Paced for comfortable exploration with minimum travel stress and maximum immersion.`,
        stops: dayStops,
      });
    }

    // 9. Detailed Budget Planner Calculation (SIH Section 4)
    const isSelfVehicle =
      input.transportMode === 'Self / Own Vehicle' ||
      input.transportMode === 'Own Car' ||
      input.transportMode === 'Own Bike';

    let transportCost = 0;
    let taxiCost = 0;
    let fuelEstimate = 0;
    let tollEstimate = 0;

    if (isSelfVehicle) {
      const isBike = input.transportMode === 'Own Bike';
      fuelEstimate = Math.round(totalDistanceKm * (isBike ? 3.5 : 8.5));
      tollEstimate = isBike ? 100 : Math.round(input.daysCount * 350);
      transportCost = fuelEstimate + tollEstimate + (input.daysCount * (isBike ? 50 : 200));
      taxiCost = 0;
    } else if (input.transportMode === 'Taxi') {
      const perKm = baseTaxi ? baseTaxi.per_km_fare : 15;
      const baseFare = baseTaxi ? baseTaxi.base_fare : 150;
      taxiCost = Math.round((baseFare * input.daysCount) + (totalDistanceKm * perKm));
      transportCost = 0;
    } else if (input.transportMode === 'Local Transport') {
      transportCost = input.daysCount * input.travellersCount * 120;
      taxiCost = input.daysCount * 250; // occasional auto/rickshaw connectivity
    } else {
      // Flight / Train / Bus
      transportCost = input.daysCount * input.travellersCount * 200;
      taxiCost = input.daysCount * 450; // airport/station to city transfers
    }

    const totalHotelCost = Math.round(hotelCostPerDay * input.daysCount);
    const activitiesCost = Math.round(input.daysCount * 400 * Math.max(1, input.adultsCount));
    const miscCost = Math.round((totalHotelCost + totalFoodCost + transportCost + taxiCost + totalEntryFees + activitiesCost) * 0.06);

    const estimatedTotalCost = totalHotelCost + totalFoodCost + transportCost + activitiesCost + totalEntryFees + taxiCost + miscCost;
    const remainingBudget = Math.max(0, input.budgetTarget - estimatedTotalCost);
    const budgetPercentageUsed = Math.min(100, Math.round((estimatedTotalCost / input.budgetTarget) * 100));

    const isExceeded = estimatedTotalCost > input.budgetTarget;
    const excessAmount = isExceeded ? estimatedTotalCost - input.budgetTarget : 0;

    const savingsTips: string[] = [];
    if (isExceeded) {
      savingsTips.push(`Switching to boutique verified homestays or standard rooms saves up to ₹${Math.round(totalHotelCost * 0.35)}.`);
      savingsTips.push(`Dining at verified local heritage dhabas saves up to ₹${Math.round(totalFoodCost * 0.3)}.`);
      savingsTips.push(`Using public transport & metro saves up to ₹${Math.round((transportCost + taxiCost) * 0.5)}.`);
    }

    const optimizationOptions = [
      {
        key: 'hotel',
        label: 'Cheaper hotel',
        description: 'Swap luxury havelis with verified boutique heritage homestays',
        savings: Math.round(totalHotelCost * 0.35),
      },
      {
        key: 'food',
        label: 'Local restaurant',
        description: 'Enjoy delicious iconic thalis and authentic street bazaars',
        savings: Math.round(totalFoodCost * 0.28),
      },
      {
        key: 'transport',
        label: 'Public transport',
        description: 'Utilize air-conditioned metro and local buses instead of private cabs',
        savings: Math.round((transportCost + taxiCost) * 0.55),
      },
      {
        key: 'activity',
        label: 'Remove expensive activity',
        description: 'Skip paid light & sound private shows and explore free heritage plazas',
        savings: Math.round(activitiesCost * 0.5),
      },
      {
        key: 'taxi',
        label: 'Reduce taxi usage',
        description: 'Use shared e-rickshaws and walking routes between close monuments',
        savings: Math.round(taxiCost * 0.45),
      },
    ];

    const budget: BudgetBreakdown = {
      budgetTarget: input.budgetTarget,
      estimatedTotalCost,
      remainingBudget,
      budgetPercentageUsed,
      isExceeded,
      excessAmount,
      hotelCost: totalHotelCost,
      foodCost: totalFoodCost,
      transportCost,
      activitiesCost,
      entryFeesCost: totalEntryFees,
      taxiCost,
      miscCost,
      savingsTips,
      optimizationOptions,
    };

    // Route Summary and Waypoints (SIH Section 8)
    const suggestedRoute = isSelfVehicle
      ? `${city.name} Heritage & Bypass Ring Road Corridor via NH 48 / National Highway Network`
      : `${city.name} Central Sightseeing Circuit`;

    const majorStops = [
      `${city.name} Historical Gate & Toll Plaza Waypoint`,
      `Central Heritage Heritage Plaza (Midway Refreshment)`,
      `Scenic Lake / Sunset Overlook Promenade`,
    ];

    const placesToVisitOnRoute = [
      scoredPlaces[0]?.name || `${city.name} Royal Pavilion`,
      scoredPlaces[1]?.name || `${city.name} Fort Vista`,
      hiddenGems[0]?.name || `${city.name} Ancient Baori`,
    ];

    let transitAdvice = '';
    if (isSelfVehicle) {
      transitAdvice = 'Fuel stations, EV charging points, and FASTag toll lanes are available every 15-20 km. Dedicated parking exists at all major ASI monuments.';
    } else if (input.transportMode === 'Flight') {
      transitAdvice = `Nearest commercial airport to ${city.name} connects to all major metros. Pre-paid taxi booths operate 24x7 at the arrivals terminal.`;
    } else if (input.transportMode === 'Train') {
      transitAdvice = `${city.name} Railway Junction is well-served by Rajdhani, Shatabdi, and Vande Bharat Express services with seamless platform e-rickshaws.`;
    } else if (input.transportMode === 'Bus') {
      transitAdvice = `State Tourism AC Volvo buses arrive at the Central ISBT terminal with luggage assistance and connecting city autos.`;
    } else {
      transitAdvice = `Local verified taxi fleet drivers are available round-the-clock for pre-booked airport and full-day monument tours.`;
    }

    // Recommended items for section 5 & 6
    const recommendedHotels = hotels.slice(0, 3).map((h) => ({
      ...h,
      photos: safeParseJsonArray(h.photos_json),
      facilities: safeParseJsonArray(h.facilities_json),
    }));

    const recommendedRestaurants = restaurants.slice(0, 3).map((r) => ({
      ...r,
      photos: safeParseJsonArray(r.photos_json),
      popular_dishes: safeParseJsonArray(r.popular_dishes_json),
      facilities: safeParseJsonArray(r.facilities_json),
    }));

    const recommendedHiddenGems = hiddenGems.slice(0, 3).map((g) => ({
      ...g,
      photos: safeParseJsonArray(g.photos_json),
    }));

    return {
      city: {
        id: city.id,
        name: city.name,
        description: city.description,
        coverImage: city.cover_image,
      },
      title: `${input.daysCount}-Day ${city.name} Experiential Journey`,
      daysCount: input.daysCount,
      travellersCount: input.travellersCount,
      adultsCount: input.adultsCount || Math.max(1, input.travellersCount),
      childrenCount: input.childrenCount || 0,
      transportMode: input.transportMode,
      travellerType: input.travellerType,
      interests: input.interests,
      budget,
      days,
      routeSummary: {
        totalDistanceKm: Math.round(totalDistanceKm),
        totalTravelTimeMins: Math.round(totalDistanceKm * 3.2),
        suggestedRoute,
        majorStops,
        placesToVisitOnRoute,
        fuelEstimate,
        tollEstimate,
        parkingTips: isSelfVehicle
          ? 'Designated monument parking lots are available. Carry digital FASTag and keep cash handy for municipal spots.'
          : 'Local taxi and auto stands are conveniently positioned outside every major attraction.',
        transitAdvice,
      },
      recommendedHotels,
      recommendedRestaurants,
      recommendedHiddenGems,
      availableTaxis: taxis.slice(0, 4),
    };
  }
}
