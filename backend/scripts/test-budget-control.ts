import { dbManager } from '../db/database';
import { RecommendationEngine, PlanTripInput } from '../services/recommendationEngine';

async function runBudgetControlTests() {
  console.log('===============================================================');
  console.log('  TRAVELSAATHI AI — BUDGET CONTROL VERIFICATION SUITE         ');
  console.log('===============================================================\n');

  await dbManager.init();

  // Find Jaipur or Delhi
  const city = dbManager.queryOne<{ id: number; name: string }>(
    "SELECT id, name FROM cities WHERE name = 'Jaipur' OR name = 'Delhi' LIMIT 1"
  );
  if (!city) {
    throw new Error('No cities found in database. Please run seed script first.');
  }

  console.log(`Using City: ${city.name} (ID: ${city.id})\n`);

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      testsPassed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (details) console.error(`     Details: ${details}`);
      testsFailed++;
    }
  }

  // -------------------------------------------------------------------------
  // TEST 1: Budget ₹10,000 | 2 Days | 2 Adults | Couple
  // Target: Total Cost <= ₹10,000, Nights = 1, Exact mathematical sum
  // -------------------------------------------------------------------------
  console.log('---------------------------------------------------------------');
  console.log('TEST 1: ₹10,000 Budget | 2 Days | 2 Adults | Couple');
  console.log('---------------------------------------------------------------');
  const input1: PlanTripInput = {
    cityId: city.id,
    budgetTarget: 10000,
    daysCount: 2,
    travellersCount: 2,
    adultsCount: 2,
    childrenCount: 0,
    transportMode: 'Self / Own Vehicle',
    interests: ['Heritage', 'Food'],
    travellerType: 'Couple',
  };

  const trip1 = RecommendationEngine.generateTrip(input1);
  const b1 = trip1.budget;
  const compSum1 = b1.hotelCost + b1.foodCost + b1.transportCost + b1.activitiesCost + b1.entryFeesCost + b1.taxiCost + b1.miscCost;

  console.log(`  Target: ₹${b1.budgetTarget} | Estimated: ₹${b1.estimatedTotalCost} | Remaining: ₹${b1.remainingBudget} (${b1.budgetPercentageUsed}%)`);
  console.log(`  Breakdown: Hotel=₹${b1.hotelCost}, Food=₹${b1.foodCost}, Transport=₹${b1.transportCost}, Entry=₹${b1.entryFeesCost}, Misc=₹${b1.miscCost}`);
  console.log(`  Nights: ${trip1.nightsCount} | Status: ${b1.status}`);

  assert(b1.estimatedTotalCost <= 10000, 'Test 1.1: Total Cost <= ₹10,000 (Hard Limit)', `Cost was ₹${b1.estimatedTotalCost}`);
  assert(b1.estimatedTotalCost === compSum1, 'Test 1.2: Mathematical Exactness (Total == Sum of components)', `Total: ${b1.estimatedTotalCost}, Sum: ${compSum1}`);
  assert(b1.isExceeded === false, 'Test 1.3: isExceeded is false');
  assert(trip1.isBudgetSufficient === true, 'Test 1.4: isBudgetSufficient is true');
  assert(trip1.nightsCount === 1, 'Test 1.5: Correct Nights Calculation (2 Days = 1 Night)', `Nights was ${trip1.nightsCount}`);
  assert(trip1.days[0].stops.some((s) => s.stopType === 'HOTEL'), 'Test 1.6: Day 1 has overnight hotel stay');
  assert(!trip1.days[1].stops.some((s) => s.stopType === 'HOTEL'), 'Test 1.7: Departure Day (Day 2) has NO overnight hotel stay');

  // -------------------------------------------------------------------------
  // TEST 2: Budget ₹25,000 | 3 Days | 2 Adults
  // Target: Total Cost <= ₹25,000, Nights = 2, Exact mathematical sum
  // -------------------------------------------------------------------------
  console.log('\n---------------------------------------------------------------');
  console.log('TEST 2: ₹25,000 Budget | 3 Days | 2 Adults');
  console.log('---------------------------------------------------------------');
  const input2: PlanTripInput = {
    cityId: city.id,
    budgetTarget: 25000,
    daysCount: 3,
    travellersCount: 2,
    adultsCount: 2,
    childrenCount: 0,
    transportMode: 'Taxi',
    interests: ['Heritage', 'Culture', 'Food'],
    travellerType: 'Couple',
  };

  const trip2 = RecommendationEngine.generateTrip(input2);
  const b2 = trip2.budget;
  const compSum2 = b2.hotelCost + b2.foodCost + b2.transportCost + b2.activitiesCost + b2.entryFeesCost + b2.taxiCost + b2.miscCost;

  console.log(`  Target: ₹${b2.budgetTarget} | Estimated: ₹${b2.estimatedTotalCost} | Remaining: ₹${b2.remainingBudget} (${b2.budgetPercentageUsed}%)`);
  console.log(`  Breakdown: Hotel=₹${b2.hotelCost}, Food=₹${b2.foodCost}, Taxi=₹${b2.taxiCost}, Entry=₹${b2.entryFeesCost}, Misc=₹${b2.miscCost}`);
  console.log(`  Nights: ${trip2.nightsCount} | Status: ${b2.status}`);

  assert(b2.estimatedTotalCost <= 25000, 'Test 2.1: Total Cost <= ₹25,000 (Hard Limit)', `Cost was ₹${b2.estimatedTotalCost}`);
  assert(b2.estimatedTotalCost === compSum2, 'Test 2.2: Mathematical Exactness (Total == Sum of components)', `Total: ${b2.estimatedTotalCost}, Sum: ${compSum2}`);
  assert(b2.isExceeded === false, 'Test 2.3: isExceeded is false');
  assert(trip2.isBudgetSufficient === true, 'Test 2.4: isBudgetSufficient is true');
  assert(trip2.nightsCount === 2, 'Test 2.5: Correct Nights Calculation (3 Days = 2 Nights)', `Nights was ${trip2.nightsCount}`);
  assert(!trip2.days[2].stops.some((s) => s.stopType === 'HOTEL'), 'Test 2.6: Day 3 (last day) has NO overnight hotel stay');

  // -------------------------------------------------------------------------
  // TEST 3: Budget ₹50,000 | 5 Days | 4 Adults
  // Target: Total Cost <= ₹50,000, Nights = 4, 2 Rooms, Exact sum
  // -------------------------------------------------------------------------
  console.log('\n---------------------------------------------------------------');
  console.log('TEST 3: ₹50,000 Budget | 5 Days | 4 Adults (Family / Group)');
  console.log('---------------------------------------------------------------');
  const input3: PlanTripInput = {
    cityId: city.id,
    budgetTarget: 50000,
    daysCount: 5,
    travellersCount: 4,
    adultsCount: 4,
    childrenCount: 0,
    transportMode: 'Taxi',
    interests: ['Heritage', 'Nature', 'Food'],
    travellerType: 'Family',
  };

  const trip3 = RecommendationEngine.generateTrip(input3);
  const b3 = trip3.budget;
  const compSum3 = b3.hotelCost + b3.foodCost + b3.transportCost + b3.activitiesCost + b3.entryFeesCost + b3.taxiCost + b3.miscCost;

  console.log(`  Target: ₹${b3.budgetTarget} | Estimated: ₹${b3.estimatedTotalCost} | Remaining: ₹${b3.remainingBudget} (${b3.budgetPercentageUsed}%)`);
  console.log(`  Breakdown: Hotel=₹${b3.hotelCost}, Food=₹${b3.foodCost}, Taxi=₹${b3.taxiCost}, Entry=₹${b3.entryFeesCost}, Misc=₹${b3.miscCost}`);
  console.log(`  Nights: ${trip3.nightsCount} | Status: ${b3.status}`);

  assert(b3.estimatedTotalCost <= 50000, 'Test 3.1: Total Cost <= ₹50,000 (Hard Limit)', `Cost was ₹${b3.estimatedTotalCost}`);
  assert(b3.estimatedTotalCost === compSum3, 'Test 3.2: Mathematical Exactness (Total == Sum of components)', `Total: ${b3.estimatedTotalCost}, Sum: ${compSum3}`);
  assert(b3.isExceeded === false, 'Test 3.3: isExceeded is false');
  assert(trip3.nightsCount === 4, 'Test 3.4: Correct Nights Calculation (5 Days = 4 Nights)', `Nights was ${trip3.nightsCount}`);
  assert(!trip3.days[4].stops.some((s) => s.stopType === 'HOTEL'), 'Test 3.5: Day 5 (last day) has NO overnight hotel stay');

  // -------------------------------------------------------------------------
  // TEST 4: Impossible Budget (₹5,000 for 5 Days, 4 Adults)
  // Target: isBudgetSufficient = false, returns minRequiredBudget, actionable guidance
  // -------------------------------------------------------------------------
  console.log('\n---------------------------------------------------------------');
  console.log('TEST 4: Impossible Budget Detection (₹5,000 for 5 Days, 4 Adults)');
  console.log('---------------------------------------------------------------');
  const input4: PlanTripInput = {
    cityId: city.id,
    budgetTarget: 5000,
    daysCount: 5,
    travellersCount: 4,
    adultsCount: 4,
    childrenCount: 0,
    transportMode: 'Self / Own Vehicle',
    interests: ['Heritage'],
    travellerType: 'Family',
  };

  const trip4 = RecommendationEngine.generateTrip(input4);
  const b4 = trip4.budget;

  console.log(`  Target: ₹${b4.budgetTarget} | Min Required: ₹${trip4.minRequiredBudget} | Shortfall: ₹${trip4.shortfallAmount}`);
  console.log(`  Status: ${b4.status} | isBudgetSufficient: ${trip4.isBudgetSufficient}`);
  console.log(`  Suggested Actions:`, trip4.suggestedActions);

  assert(trip4.isBudgetSufficient === false, 'Test 4.1: Flagged isBudgetSufficient = false');
  assert((trip4.minRequiredBudget || 0) > 5000, 'Test 4.2: Realistically calculated minRequiredBudget > ₹5,000', `minRequired was ${trip4.minRequiredBudget}`);
  assert(b4.status === 'BUDGET_INSUFFICIENT', 'Test 4.3: Status is BUDGET_INSUFFICIENT');
  assert(b4.isExceeded === true, 'Test 4.4: isExceeded is true (honest notification to user)');
  assert((trip4.shortfallAmount || 0) > 0, 'Test 4.5: Shortfall amount calculated', `Shortfall was ${trip4.shortfallAmount}`);
  assert(
    (trip4.suggestedActions?.reduceDaysTo || 0) >= 1 && (trip4.suggestedActions?.reduceDaysTo || 0) < 5,
    'Test 4.6: Actionable recommendation provided to reduce days to fit budget',
    `Reduce days to: ${trip4.suggestedActions?.reduceDaysTo}`
  );

  // -------------------------------------------------------------------------
  // TEST 5: Dynamic Budget Adaptation (₹10,000 vs ₹25,000 for same parameters)
  // Target: Engine dynamically scales hotel/dining recommendations with budget
  // -------------------------------------------------------------------------
  console.log('\n---------------------------------------------------------------');
  console.log('TEST 5: Dynamic Adaptation (₹10,000 vs ₹25,000 for 3 Days, 2 Adults)');
  console.log('---------------------------------------------------------------');
  const baseInput: PlanTripInput = {
    cityId: city.id,
    budgetTarget: 10000,
    daysCount: 3,
    travellersCount: 2,
    adultsCount: 2,
    childrenCount: 0,
    transportMode: 'Self / Own Vehicle',
    interests: ['Heritage', 'Food'],
    travellerType: 'Couple',
  };

  const trip5a = RecommendationEngine.generateTrip({ ...baseInput, budgetTarget: 10000 });
  const trip5b = RecommendationEngine.generateTrip({ ...baseInput, budgetTarget: 25000 });

  console.log(`  ₹10k Trip: Cost = ₹${trip5a.budget.estimatedTotalCost} | Hotel = ₹${trip5a.budget.hotelCost} | Food = ₹${trip5a.budget.foodCost}`);
  console.log(`  ₹25k Trip: Cost = ₹${trip5b.budget.estimatedTotalCost} | Hotel = ₹${trip5b.budget.hotelCost} | Food = ₹${trip5b.budget.foodCost}`);

  assert(trip5a.budget.estimatedTotalCost <= 10000, 'Test 5.1: ₹10k Trip cost <= ₹10,000');
  assert(trip5b.budget.estimatedTotalCost <= 25000, 'Test 5.2: ₹25k Trip cost <= ₹25,000');
  assert(trip5b.budget.foodCost >= trip5a.budget.foodCost, 'Test 5.3: Higher budget dynamically allocates richer dining');
  assert(
    trip5a.budget.estimatedTotalCost === (
      trip5a.budget.hotelCost + trip5a.budget.foodCost + trip5a.budget.transportCost +
      trip5a.budget.activitiesCost + trip5a.budget.entryFeesCost + trip5a.budget.taxiCost + trip5a.budget.miscCost
    ),
    'Test 5.4: ₹10k exact mathematical sum'
  );
  assert(
    trip5b.budget.estimatedTotalCost === (
      trip5b.budget.hotelCost + trip5b.budget.foodCost + trip5b.budget.transportCost +
      trip5b.budget.activitiesCost + trip5b.budget.entryFeesCost + trip5b.budget.taxiCost + trip5b.budget.miscCost
    ),
    'Test 5.5: ₹25k exact mathematical sum'
  );

  console.log('\n===============================================================');
  console.log(`  TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED   `);
  console.log('===============================================================');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runBudgetControlTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
