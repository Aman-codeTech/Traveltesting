import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { GeneratedTrip, GeneratedStop } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { TaxiBookingModal } from '../../components/booking/TaxiBookingModal';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import {
  Sparkles,
  BookmarkCheck,
  RotateCcw,
  SlidersHorizontal,
  Wallet,
  Compass,
  MapPin,
  Clock,
  Ticket,
  Car,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Printer,
  Calendar,
  Users,
  ChevronDown,
  Info,
  Hotel,
  Utensils,
  ArrowRight,
  Star,
  Phone,
  Fuel,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Navigation,
} from 'lucide-react';

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState<GeneratedTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [savedTripId, setSavedTripId] = useState<number | null>(null);

  // Booking modal & selected taxi
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [defaultDrop, setDefaultDrop] = useState('');
  const [selectedTaxi, setSelectedTaxi] = useState<any>(null);
  const [appliedOptimizations, setAppliedOptimizations] = useState<string[]>([]);

  useEffect(() => {
    if (id && id !== 'preview') {
      // Load saved trip from API
      api.getTripById(id)
        .then((res) => {
          if (res.success && res.trip) {
            setTrip(res.trip);
            setIsSaved(true);
            setSavedTripId(Number(id));
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      // Load from session storage for preview
      const stored = sessionStorage.getItem('lastGeneratedTrip');
      if (stored) {
        setTrip(JSON.parse(stored));
      }
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (trip) {
      if (trip.availableTaxis && trip.availableTaxis.length > 0) {
        setSelectedTaxi(trip.availableTaxis[0]);
      } else if (trip.city?.id) {
        api.getTaxis({ city_id: trip.city.id }).then((res) => {
          if (res.success && res.data && res.data.length > 0) {
            setSelectedTaxi(res.data[0]);
          }
        });
      }
    }
  }, [trip]);

  const activeTaxi = selectedTaxi || (trip ? {
    id: 999,
    service_name: `${trip.city.name} Verified City Cabs`,
    driver_name: 'Harpreet Singh',
    phone: '+91 98110 22334',
    vehicle_type: 'Sedan',
    vehicle_photos: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'],
    base_fare: 150,
    per_km_fare: 14,
    rating: 4.8,
  } : null);

  const handleOpenTaxiBooking = () => {
    setDefaultDrop(trip?.city?.name ? `${trip.city.name} Sightseeing Circuit` : 'City Center');
    setBookingModalOpen(true);
  };

  const handleApplyOptimization = (optKey: string, savings: number) => {
    if (!trip || appliedOptimizations.includes(optKey)) return;
    setAppliedOptimizations((prev) => [...prev, optKey]);

    const updatedBudget = { ...trip.budget };
    if (optKey === 'hotel') updatedBudget.hotelCost = Math.max(800, (updatedBudget.hotelCost || 0) - savings);
    if (optKey === 'food') updatedBudget.foodCost = Math.max(600, (updatedBudget.foodCost || 0) - savings);
    if (optKey === 'transport') updatedBudget.transportCost = Math.max(200, (updatedBudget.transportCost || 0) - savings);
    if (optKey === 'activity') updatedBudget.activitiesCost = Math.max(0, (updatedBudget.activitiesCost || 0) - savings);
    if (optKey === 'taxi') updatedBudget.taxiCost = Math.max(0, (updatedBudget.taxiCost || 0) - savings);

    const newTotal =
      (updatedBudget.hotelCost || 0) +
      (updatedBudget.foodCost || 0) +
      (updatedBudget.transportCost || 0) +
      (updatedBudget.activitiesCost || 0) +
      (updatedBudget.entryFeesCost || 0) +
      (updatedBudget.taxiCost || 0) +
      (updatedBudget.miscCost || 0);

    updatedBudget.estimatedTotalCost = newTotal;
    updatedBudget.remainingBudget = Math.max(0, updatedBudget.budgetTarget - newTotal);
    updatedBudget.budgetPercentageUsed = Math.min(100, Math.round((newTotal / updatedBudget.budgetTarget) * 100));
    updatedBudget.isExceeded = newTotal > updatedBudget.budgetTarget;
    updatedBudget.excessAmount = updatedBudget.isExceeded ? newTotal - updatedBudget.budgetTarget : 0;

    const updatedTrip = { ...trip, budget: updatedBudget };
    setTrip(updatedTrip);
    sessionStorage.setItem('lastGeneratedTrip', JSON.stringify(updatedTrip));
  };

  const handleSaveTrip = async () => {
    if (!user) {
      alert('Please log in first to save this trip to your dashboard.');
      navigate('/login');
      return;
    }
    if (!trip) return;

    try {
      const res = await api.saveTrip(trip);
      if (res.success) {
        setIsSaved(true);
        setSavedTripId(res.tripId);
        alert('Trip saved to your dashboard portfolio!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save trip');
    }
  };

  const handleOptimizeBudget = async () => {
    if (!trip) return;
    setIsOptimizing(true);
    try {
      const res = await api.optimizeTrip({
        cityId: trip.city.id,
        budgetTarget: trip.budget.budgetTarget,
        daysCount: trip.daysCount,
        travellersCount: trip.travellersCount,
        adultsCount: trip.travellersCount,
        childrenCount: 0,
        transportMode: trip.transportMode,
        interests: trip.interests,
        travellerType: trip.travellerType,
      });

      if (res.success && res.trip) {
        setTrip(res.trip);
        sessionStorage.setItem('lastGeneratedTrip', JSON.stringify(res.trip));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to optimize budget');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && trip) {
      try {
        await navigator.share({
          title: trip.title,
          text: `Check out my ${trip.daysCount}-day itinerary for ${trip.city.name} on TravelSaathi AI!`,
          url: window.location.href,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Itinerary link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-sm">Retrieving personalized itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Compass className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 font-heading">No Itinerary Found</h2>
        <p className="text-xs text-slate-500">Plan a new trip using our AI engine.</p>
        <Link to="/plan-trip" className="inline-block px-6 py-3 bg-[#1B5E20] hover:bg-[#154a19] text-white rounded-xl text-sm font-bold">
          Plan My Trip
        </Link>
      </div>
    );
  }

  const { budget } = trip;
  const budgetRatio = Math.min(100, Math.round((budget.estimatedTotalCost / budget.budgetTarget) * 100));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="relative h-64 sm:h-80 w-full">
          <img
            src={trip.city.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#1B5E20] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-[#F9C74F]" />
                <span>AI Generated Itinerary</span>
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                {trip.city.name}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                {trip.daysCount} Days • {trip.travellersCount} Travellers
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-heading">{trip.title}</h1>

            <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center space-x-1">
                <Car className="w-3.5 h-3.5 text-[#F9C74F]" />
                <span>Transport: {trip.transportMode}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-[#F9C74F]" />
                <span>With: {trip.travellerType}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-[#F9C74F]" />
                <span>Interests: {trip.interests.join(', ')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Header Bar */}
        <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveTrip}
              disabled={isSaved}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[#1B5E20] hover:bg-[#154a19] text-white shadow-xs'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{isSaved ? 'Trip Saved' : 'Save Trip to Dashboard'}</span>
            </button>

            {isSaved && (
              <Link
                to="/my-trips"
                className="px-4 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-xs"
              >
                <span>View in My Trips</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            <Link
              to={`/plan-trip?city=${trip.city.id}`}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold transition flex items-center space-x-1"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Modify Trip</span>
            </Link>

            <button
              onClick={() => {
                sessionStorage.removeItem('lastGeneratedTrip');
                navigate('/plan-trip');
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold transition flex items-center space-x-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Regenerate</span>
            </button>

            <button
              onClick={handlePrint}
              title="Print or Save as PDF"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold transition flex items-center space-x-1"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={handleShare}
              title="Share Itinerary"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-semibold transition flex items-center space-x-1"
            >
              <Share2 className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          <button
            onClick={handleOpenTaxiBooking}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <Car className="w-4 h-4 text-[#F9C74F]" />
            <span>Book Taxi for this Itinerary</span>
          </button>
        </div>
      </div>

      {/* SMART BUDGET PLANNER (SIH Section 4) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1B5E20]">Smart Budget Engine</span>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">Trip Budget Planner</h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated cost distribution, buffer allowance &amp; savings optimizations</p>
          </div>

          {budget.isExceeded && (
            <button
              onClick={handleOptimizeBudget}
              disabled={isOptimizing}
              className="px-5 py-2.5 bg-[#F9C74F] hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isOptimizing ? 'Optimizing...' : 'Auto-Optimize Trip to Fit Budget'}</span>
            </button>
          )}
        </div>

        {/* Exceeded Warning Banner */}
        {budget.isExceeded ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-900 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-sm">Your estimated trip cost exceeds your budget.</h4>
              <p className="text-rose-700">
                Your estimated trip cost of <strong>₹{budget.estimatedTotalCost.toLocaleString('en-IN')}</strong> exceeds your target budget of <strong>₹{budget.budgetTarget.toLocaleString('en-IN')}</strong> by ₹{budget.excessAmount.toLocaleString('en-IN')}.
              </p>
              <p className="text-rose-800 font-medium">Use the optimization options below to fit your trip within budget:</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-900 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Great planning! Your trip stays comfortably within budget with{' '}
              <strong className="text-emerald-700">₹{(budget.remainingBudget ?? Math.max(0, budget.budgetTarget - budget.estimatedTotalCost)).toLocaleString('en-IN')}</strong> remaining buffer ({budget.budgetPercentageUsed ?? budgetRatio}% used).
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-600">
              Estimated Total: <span className="text-slate-900">₹{budget.estimatedTotalCost.toLocaleString('en-IN')}</span>
            </span>
            <span className="text-slate-600">
              Remaining: <span className="text-emerald-700">₹{(budget.remainingBudget ?? Math.max(0, budget.budgetTarget - budget.estimatedTotalCost)).toLocaleString('en-IN')}</span>
            </span>
            <span className="text-slate-600">
              Target Budget: <span className="text-[#1B5E20]">₹{budget.budgetTarget.toLocaleString('en-IN')}</span>
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budget.isExceeded ? 'bg-rose-500' : 'bg-[#1B5E20]'
              }`}
              style={{ width: `${Math.min(100, budgetRatio)}%` }}
            />
          </div>
        </div>

        {/* 7 Category Breakdown Tiles (SIH Section 4) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Accommodation</span>
            <span className="text-base font-bold text-slate-900 font-heading">₹{budget.hotelCost?.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Food</span>
            <span className="text-base font-bold text-slate-900 font-heading">₹{budget.foodCost?.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Transportation</span>
            <span className="text-base font-bold text-slate-900 font-heading">₹{(budget.transportCost || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Activities</span>
            <span className="text-base font-bold text-slate-900 font-heading">₹{(budget.activitiesCost || 1200).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Entry Fees</span>
            <span className="text-base font-bold text-slate-900 font-heading">₹{budget.entryFeesCost?.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Taxi</span>
            <span className="text-base font-bold text-slate-900 font-heading">₹{(budget.taxiCost || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Miscellaneous</span>
            <span className="text-base font-bold text-slate-900 font-heading">₹{budget.miscCost?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* 5 Interactive Optimization Options (SIH Section 4) */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Budget Optimization Options:</span>
            <span className="text-[11px] text-slate-500">Click any option to apply instant savings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {[
              { key: 'hotel', label: 'Cheaper hotel', savings: Math.round(budget.hotelCost * 0.35), icon: '🏨', desc: 'Swap with verified heritage homestays' },
              { key: 'food', label: 'Local restaurant', savings: Math.round(budget.foodCost * 0.28), icon: '🍲', desc: 'Iconic local thalis & authentic street eats' },
              { key: 'transport', label: 'Public transport', savings: Math.round(((budget.transportCost || 0) + (budget.taxiCost || 0)) * 0.55), icon: '🚇', desc: 'Metro & state AC buses' },
              { key: 'activity', label: 'Remove expensive activity', savings: Math.round((budget.activitiesCost || 1200) * 0.5), icon: '🎟️', desc: 'Explore free heritage courtyards' },
              { key: 'taxi', label: 'Reduce taxi usage', savings: Math.round((budget.taxiCost || 800) * 0.45), icon: '🚕', desc: 'Combine walking with e-rickshaws' },
            ].map((opt) => {
              const isApplied = appliedOptimizations.includes(opt.key);
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleApplyOptimization(opt.key, opt.savings)}
                  disabled={isApplied}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    isApplied
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-90'
                      : 'bg-white border-slate-200 hover:border-[#1B5E20] hover:bg-emerald-50/40 text-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base">{opt.icon}</span>
                      {isApplied && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <h5 className="text-xs font-bold font-heading">{opt.label}</h5>
                    <p className="text-[10px] text-slate-500 leading-tight">{opt.desc}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-emerald-700">-{isApplied ? 'Applied' : `Save ₹${opt.savings}`}</span>
                    <span className="text-[#1B5E20] text-[10px]">{isApplied ? '✓' : 'Apply →'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Savings Suggestions */}
        {budget.savingsTips?.length > 0 && (
          <div className="pt-2 text-xs text-slate-600 space-y-1 border-t border-slate-100">
            <span className="font-bold text-slate-700">Additional Recommendations:</span>
            {budget.savingsTips.map((tip, idx) => (
              <p key={idx} className="flex items-center space-x-1.5 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1B5E20]"></span>
                <span>{tip}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* SMART ROUTE SUMMARY & SELF-VEHICLE LOGISTICS */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F9C74F]/20 text-[#F9C74F] flex items-center justify-center border border-[#F9C74F]/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F9C74F]">Smart Transport Engine</span>
              <h3 className="text-xl font-bold font-heading text-white">Route Logistics &amp; Travel Plan</h3>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-bold">
              Mode: {trip.transportMode}
            </span>
            <span className="text-xs bg-white/10 text-slate-300 px-3 py-1 rounded-full">
              Paced for 0 Backtracking
            </span>
          </div>
        </div>

        {/* Suggested Route Corridor */}
        {trip.routeSummary?.suggestedRoute && (
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center space-x-2 text-xs text-[#F9C74F] font-bold">
              <Navigation className="w-4 h-4" />
              <span>Recommended Highway &amp; Sightseeing Corridor:</span>
            </div>
            <p className="text-sm text-slate-100 font-medium pl-6">{trip.routeSummary.suggestedRoute}</p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400">Total Circuit Distance</span>
            <p className="text-xl font-bold font-heading text-white">{trip.routeSummary?.totalDistanceKm || 35} km</p>
            <span className="text-[10px] text-emerald-400">Optimized cluster sequence</span>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400">Est. Transit Time</span>
            <p className="text-xl font-bold font-heading text-white">
              {Math.floor((trip.routeSummary?.totalTravelTimeMins || 90) / 60)}h {(trip.routeSummary?.totalTravelTimeMins || 90) % 60}m
            </p>
            <span className="text-[10px] text-slate-400">{trip.routeSummary?.totalTravelTimeMins || 90} mins total road travel</span>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400">Estimated Fuel</span>
            <p className="text-xl font-bold font-heading text-[#F9C74F]">
              ₹{trip.routeSummary?.fuelEstimate || 1200}
            </p>
            <span className="text-[10px] text-slate-400">Based on standard fuel economy</span>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400">Tolls &amp; FASTag</span>
            <p className="text-xl font-bold font-heading text-emerald-300">
              ₹{trip.routeSummary?.tollEstimate || 350}
            </p>
            <span className="text-[10px] text-slate-400">NHAI digital FASTag booths</span>
          </div>
        </div>

        {/* Waypoints & Transit Advice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {trip.routeSummary?.majorStops && trip.routeSummary.majorStops.length > 0 && (
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-slate-300 font-bold block">Key Highway Waypoints &amp; Checkpoints:</span>
              <div className="space-y-1.5">
                {trip.routeSummary.majorStops.map((stop, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{stop}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
            <span className="text-slate-300 font-bold block">Road &amp; Transit Advisory:</span>
            <p className="text-slate-300 text-xs leading-relaxed">
              {(trip.routeSummary as any)?.transitAdvice ||
                'Expressways and key arterial roads have dedicated service lanes, fuel stations, and EV charging corridors every 15-20 km.'}
            </p>
            <p className="text-slate-400 text-[11px] pt-1 border-t border-white/10">
              🅿️ {trip.routeSummary?.parkingTips || 'Monument parking is available; digital FASTag accepted at selected plazas.'}
            </p>
          </div>
        </div>
      </div>

      {/* DEDICATED SUITABLE HOTELS SECTION */}
      {(() => {
        const hotelsList =
          trip.recommendedHotels && trip.recommendedHotels.length > 0
            ? trip.recommendedHotels
            : trip.days
                .flatMap((d) => d.stops)
                .filter((s, idx, arr) => s.stopType === 'HOTEL' && arr.findIndex((x) => x.title === s.title) === idx)
                .map((s) => ({
                  id: s.entityId,
                  name: s.title,
                  city_name: trip.city.name,
                  rating: 4.6,
                  price_per_night: s.estimatedCost || 2800,
                  room_type: 'Deluxe Heritage Room / AC Suite',
                  photos: [s.imageUrl],
                  facilities: ['Free High-Speed WiFi', 'Air Conditioning', 'Free Breakfast', 'Valet Parking', 'Room Service'],
                  phone: '+91 98110 22334',
                  description: s.description,
                }));

        if (hotelsList.length === 0) return null;

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Curated Accommodation</span>
                <h2 className="text-2xl font-bold text-slate-900 font-heading">Suitable &amp; Verified Hotels</h2>
                <p className="text-xs text-slate-500">Handpicked comfortable stays tailored to your budget and traveller profile</p>
              </div>
              <Link
                to={`/hotels?city=${trip.city.id}`}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1"
              >
                <span>View all hotels in {trip.city.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hotelsList.slice(0, 3).map((hotel: any, idx: number) => {
                const photo =
                  Array.isArray(hotel.photos) && hotel.photos.length > 0
                    ? hotel.photos[0]
                    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80';

                const facilities = Array.isArray(hotel.facilities) && hotel.facilities.length > 0
                  ? hotel.facilities.slice(0, 4)
                  : ['Free WiFi', 'AC', 'Breakfast', 'Parking'];

                return (
                  <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="relative h-48 w-full">
                        <img src={photo} alt={hotel.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-purple-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1">
                          <Hotel className="w-3 h-3" />
                          <span>Recommended Stay</span>
                        </div>
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{hotel.rating || 4.5}</span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                          ₹{hotel.price_per_night || 2800} / night
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="font-bold text-base text-slate-900 font-heading">{hotel.name}</h3>
                          <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{hotel.city_name || trip.city.name}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-purple-700 font-medium">{hotel.room_type || 'Deluxe Room'}</span>
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {hotel.description || 'Verified boutique property with modern comforts, authentic hospitality, and convenient landmark access.'}
                        </p>

                        {/* Facilities tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {facilities.map((fac: string, fIdx: number) => (
                            <span key={fIdx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                              {fac}
                            </span>
                          ))}
                        </div>

                        {hotel.phone && (
                          <div className="text-[11px] text-slate-500 flex items-center space-x-1 pt-1">
                            <Phone className="w-3 h-3 text-purple-600" />
                            <span>Front Desk: {hotel.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                      <Link
                        to={hotel.id ? `/hotels/${hotel.id}` : '/hotels'}
                        className="py-2.5 bg-purple-50 text-purple-800 hover:bg-purple-700 hover:text-white font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1 transition border border-purple-200"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <a
                        href={hotel.phone ? `tel:${hotel.phone}` : '/hotels'}
                        className="py-2.5 bg-slate-900 hover:bg-purple-900 text-white font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1 transition"
                      >
                        <span>Book / Visit</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* DEDICATED SUITABLE RESTAURANTS SECTION */}
      {(() => {
        const diningList =
          trip.recommendedRestaurants && trip.recommendedRestaurants.length > 0
            ? trip.recommendedRestaurants
            : trip.days
                .flatMap((d) => d.stops)
                .filter((s, idx, arr) => (s.stopType === 'BREAKFAST' || s.stopType === 'LUNCH' || s.stopType === 'DINNER') && arr.findIndex((x) => x.title === s.title) === idx)
                .map((s) => ({
                  id: s.entityId,
                  name: s.title,
                  city_name: trip.city.name,
                  cuisine: s.category || 'Traditional Regional & Thali',
                  rating: 4.7,
                  avg_cost_for_two: s.estimatedCost || 600,
                  opening_hours: '11:00 AM - 11:00 PM',
                  photos: [s.imageUrl],
                  popular_dishes: ['Regional Thali', 'Special Gravy Dishes', 'Sweet Delicacy', 'Masala Chai'],
                  description: s.description,
                  phone: '+91 98110 22334',
                }));

        if (diningList.length === 0) return null;

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Culinary Highlights</span>
                <h2 className="text-2xl font-bold text-slate-900 font-heading">Suitable &amp; Verified Restaurants</h2>
                <p className="text-xs text-slate-500">Taste authentic regional cuisines and must-try delicacies recommended for your trip</p>
              </div>
              <Link
                to={`/restaurants?city=${trip.city.id}`}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center space-x-1"
              >
                <span>Explore all dining in {trip.city.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {diningList.slice(0, 3).map((dining: any, idx: number) => {
                const photo =
                  Array.isArray(dining.photos) && dining.photos.length > 0
                    ? dining.photos[0]
                    : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80';

                const dishes = Array.isArray(dining.popular_dishes) && dining.popular_dishes.length > 0
                  ? dining.popular_dishes.slice(0, 3).join(', ')
                  : 'Traditional Thali, Seasonal Sweets';

                return (
                  <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="relative h-48 w-full">
                        <img src={photo} alt={dining.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1">
                          <Utensils className="w-3 h-3" />
                          <span>{dining.cuisine || 'Regional Special'}</span>
                        </div>
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{dining.rating || 4.6}</span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                          ₹{dining.avg_cost_for_two || 600} for two
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="font-bold text-base text-slate-900 font-heading">{dining.name}</h3>
                          <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{dining.opening_hours || '11:00 AM - 11:00 PM'}</span>
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {dining.description || 'Acclaimed dining establishment serving fresh regional specialties, authentic spices, and hygienic food.'}
                        </p>

                        <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-100 text-[11px] text-amber-900">
                          <span className="font-bold">Must Try: </span>
                          <span>{dishes}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                      <Link
                        to={dining.id ? `/restaurants/${dining.id}` : '/restaurants'}
                        className="py-2.5 bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1 transition border border-amber-200"
                      >
                        <span>View Menu</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Link
                        to={dining.id ? `/restaurants/${dining.id}` : '/restaurants'}
                        className="py-2.5 bg-slate-900 hover:bg-amber-800 text-white font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1 transition"
                      >
                        <span>Visit Spot</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* DEDICATED HIDDEN GEMS SHOWCASE */}
      {(() => {
        const gemsList =
          trip.recommendedHiddenGems && trip.recommendedHiddenGems.length > 0
            ? trip.recommendedHiddenGems
            : trip.days
                .flatMap((d) => d.stops)
                .filter((s, idx, arr) => s.stopType === 'HIDDEN_GEM' && arr.findIndex((x) => x.title === s.title) === idx)
                .map((s) => ({
                  id: s.entityId,
                  name: s.title,
                  city_name: trip.city.name,
                  description: s.description,
                  photos: [s.imageUrl],
                  best_time_to_visit: s.bestVisitingTime || 'Early Morning / Golden Sunset',
                  distance_km: s.distanceKm || 12,
                  estimated_cost: s.entryFee || 0,
                  how_to_reach: s.transportNotes || 'Accessible via self-drive bypass or local taxi',
                }));

        if (gemsList.length === 0) return null;

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Offbeat Wonders</span>
                <h2 className="text-2xl font-bold text-slate-900 font-heading">Recommended Hidden Gems</h2>
                <p className="text-xs text-slate-500">Secret viewpoints, ancient stepwells, and peaceful cultural spots away from crowds</p>
              </div>
              <Link
                to="/hidden-gems"
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
              >
                <span>Browse all Hidden Gems</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gemsList.slice(0, 3).map((gem: any, idx: number) => {
                const photo =
                  Array.isArray(gem.photos) && gem.photos.length > 0
                    ? gem.photos[0]
                    : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80';

                return (
                  <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="relative h-48 w-full">
                        <img src={photo} alt={gem.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-teal-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-[#F9C74F]" />
                          <span>Hidden Gem</span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                          {gem.estimated_cost ? `₹${gem.estimated_cost}` : 'Free Entry'}
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="font-bold text-base text-slate-900 font-heading">{gem.name}</h3>
                          <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Best Time: {gem.best_time_to_visit || 'Morning / Evening'}</span>
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {gem.description}
                        </p>

                        <div className="pt-2 border-t border-slate-100 text-[11px] text-teal-800 font-medium flex items-start space-x-1">
                          <span>🧭</span>
                          <span>{gem.how_to_reach || `Approx. ${gem.distance_km || 12} km from central hub.`}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <Link
                        to="/hidden-gems"
                        className="w-full py-2.5 bg-teal-50 text-teal-800 hover:bg-teal-700 hover:text-white font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1.5 transition border border-teal-200"
                      >
                        <span>Explore Hidden Gem Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* DAY-BY-DAY ITINERARY STOPS GROUPED BY TIME SLOTS */}
      <div className="space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1B5E20]">Master Day Schedule</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-1 font-heading">Day-by-Day Journey Schedule</h2>
          <p className="text-xs text-slate-500">Chronological slots paced for leisurely sightseeing, scenic breaks, and zero backtracking</p>
        </div>

        {trip.days.map((day) => {
          // Group stops into Morning, Afternoon, Evening, Night
          const timeSlotDefinitions = [
            {
              key: 'Morning',
              label: 'Morning Exploration & Heritage',
              timeRange: '08:00 AM – 12:30 PM',
              icon: <Sunrise className="w-4 h-4 text-amber-600" />,
              headerBg: 'bg-amber-50/80 border-amber-200 text-amber-900',
              matcher: (stop: GeneratedStop) =>
                stop.timeSlot === 'Morning' ||
                stop.stopType === 'BREAKFAST' ||
                stop.stopOrder <= 2,
            },
            {
              key: 'Afternoon',
              label: 'Afternoon Culture & Regional Feast',
              timeRange: '12:30 PM – 05:00 PM',
              icon: <Sun className="w-4 h-4 text-orange-600" />,
              headerBg: 'bg-orange-50/80 border-orange-200 text-orange-900',
              matcher: (stop: GeneratedStop) =>
                stop.timeSlot === 'Afternoon' ||
                stop.stopType === 'LUNCH' ||
                (stop.stopOrder > 2 && stop.stopOrder <= 4),
            },
            {
              key: 'Evening',
              label: 'Evening Sunset & Bazaars',
              timeRange: '05:00 PM – 08:30 PM',
              icon: <Sunset className="w-4 h-4 text-rose-600" />,
              headerBg: 'bg-rose-50/80 border-rose-200 text-rose-900',
              matcher: (stop: GeneratedStop) =>
                stop.timeSlot === 'Evening' ||
                stop.stopType === 'HIDDEN_GEM' ||
                stop.stopOrder === 5,
            },
            {
              key: 'Night',
              label: 'Night Dining & Comfortable Rest',
              timeRange: '08:30 PM Onwards',
              icon: <Moon className="w-4 h-4 text-indigo-600" />,
              headerBg: 'bg-indigo-50/80 border-indigo-200 text-indigo-900',
              matcher: (stop: GeneratedStop) =>
                stop.timeSlot === 'Night' ||
                stop.stopType === 'DINNER' ||
                stop.stopType === 'HOTEL' ||
                stop.stopOrder > 5,
            },
          ];

          // Partition stops into slots without duplicates
          const assignedStopIndices = new Set<number>();
          const slottedGroups = timeSlotDefinitions.map((def) => {
            const stopsInSlot = day.stops.filter((stop, idx) => {
              if (assignedStopIndices.has(idx)) return false;
              const matches = def.matcher(stop);
              if (matches) {
                assignedStopIndices.add(idx);
                return true;
              }
              return false;
            });
            return { ...def, stops: stopsInSlot };
          });

          // Any remaining unassigned stops go to the last slot with items
          day.stops.forEach((stop, idx) => {
            if (!assignedStopIndices.has(idx)) {
              slottedGroups[slottedGroups.length - 1].stops.push(stop);
            }
          });

          return (
            <div key={day.dayNumber} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-6 pb-6">
              {/* Day Header */}
              <div className="bg-slate-50 px-6 py-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#1B5E20] bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Day {day.dayNumber}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 font-heading">{day.dayTitle}</h3>
                  </div>
                  {day.notes && <p className="text-xs text-slate-500 mt-1">{day.notes}</p>}
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                  <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                    {day.stops.length} Planned Stops
                  </span>
                </div>
              </div>

              {/* Time Slots Content */}
              <div className="px-6 sm:px-8 space-y-6">
                {slottedGroups.map((group) => {
                  if (group.stops.length === 0) return null;

                  return (
                    <div key={group.key} className="space-y-4">
                      {/* Time Slot Header Banner */}
                      <div className={`px-4 py-2.5 rounded-2xl border flex items-center justify-between ${group.headerBg}`}>
                        <div className="flex items-center space-x-2">
                          {group.icon}
                          <span className="text-xs font-bold font-heading">{group.label}</span>
                        </div>
                        <span className="text-[11px] font-semibold opacity-80">{group.timeRange}</span>
                      </div>

                      {/* Stops in this Time Slot */}
                      <div className="space-y-4 pl-1 sm:pl-2">
                        {group.stops.map((stop, sIdx) => {
                          const isFood = stop.stopType === 'BREAKFAST' || stop.stopType === 'LUNCH' || stop.stopType === 'DINNER';
                          const isGem = stop.stopType === 'HIDDEN_GEM';
                          const isHotel = stop.stopType === 'HOTEL';

                          return (
                            <div key={sIdx} className="bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-start transition shadow-2xs">
                              {/* Thumbnail */}
                              {stop.imageUrl && (
                                <div className="relative w-full md:w-44 h-32 rounded-xl overflow-hidden shrink-0">
                                  <img
                                    src={stop.imageUrl}
                                    alt={stop.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-slate-900/80 text-white font-bold text-xs flex items-center justify-center backdrop-blur-xs">
                                    {stop.stopOrder}
                                  </div>
                                </div>
                              )}

                              {/* Details */}
                              <div className="flex-1 space-y-2 w-full">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                                        isFood
                                          ? 'bg-amber-100 text-amber-800'
                                          : isGem
                                          ? 'bg-teal-100 text-teal-800'
                                          : isHotel
                                          ? 'bg-purple-100 text-purple-800'
                                          : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                    >
                                      {stop.stopType.replace('_', ' ')}
                                    </span>
                                    {stop.category && (
                                      <span className="text-xs text-slate-500 font-medium">• {stop.category}</span>
                                    )}
                                  </div>

                                  <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{stop.startTime}</span>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-slate-500 font-normal">{stop.durationHours} hrs</span>
                                  </div>
                                </div>

                                <h4 className="text-base font-bold text-slate-900 font-heading">{stop.title}</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">{stop.description}</p>

                                {/* Logistics Meta Pills */}
                                <div className="pt-2 flex flex-wrap gap-4 text-[11px] text-slate-600">
                                  {stop.bestVisitingTime && (
                                    <span className="flex items-center space-x-1 text-slate-700 font-medium">
                                      <span>☀️ Best Time:</span>
                                      <span className="font-bold">{stop.bestVisitingTime}</span>
                                    </span>
                                  )}
                                  {stop.entryFee !== undefined && (
                                    <span className="flex items-center space-x-1 font-semibold text-slate-700">
                                      <Ticket className="w-3.5 h-3.5 text-[#1B5E20]" />
                                      <span>Entry: {stop.entryFee === 0 ? 'Free Entry' : `₹${stop.entryFee} / person`}</span>
                                    </span>
                                  )}
                                  {stop.distanceKm > 0 && (
                                    <span className="flex items-center space-x-1">
                                      <Car className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{stop.distanceKm} km ({stop.travelTimeMins} mins travel)</span>
                                    </span>
                                  )}
                                </div>

                                {/* Transport Notes */}
                                {stop.transportNotes && (
                                  <div className="text-[11px] text-[#1B5E20] font-medium bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                                    👉 {stop.transportNotes}
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-2 flex flex-wrap items-center gap-2">
                                  {stop.entityId && stop.entityType === 'PLACE' && (
                                    <Link
                                      to={`/places/${stop.entityId}`}
                                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-[#1B5E20] text-[#1B5E20] hover:text-white text-xs font-bold transition border border-emerald-200"
                                    >
                                      <span>View Place Details &amp; Gallery</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  )}
                                  {stop.entityId && stop.entityType === 'HOTEL' && (
                                    <Link
                                      to={`/hotels/${stop.entityId}`}
                                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-700 text-purple-900 hover:text-white text-xs font-bold transition border border-purple-200"
                                    >
                                      <span>View Hotel Rooms &amp; Amenities</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  )}
                                  {stop.entityId && stop.entityType === 'RESTAURANT' && (
                                    <Link
                                      to={`/restaurants/${stop.entityId}`}
                                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-900 hover:text-white text-xs font-bold transition border border-amber-200"
                                    >
                                      <span>View Restaurant Menu &amp; Dishes</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  )}
                                  {stop.stopType === 'HIDDEN_GEM' && (
                                    <Link
                                      to="/hidden-gems"
                                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-700 text-teal-900 hover:text-white text-xs font-bold transition border border-teal-200"
                                    >
                                      <span>Explore All Hidden Gems</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDefaultDrop(stop.title);
                                      setBookingModalOpen(true);
                                    }}
                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-white text-xs font-semibold transition border border-slate-200"
                                  >
                                    <Car className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Book Taxi to Stop</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skyline footer accent */}
      <div className="pt-6">
        <IndianMonumentsSkyline className="w-full text-emerald-800/15" tagline="Bharat Ki Khoj Ab Aur Aasaan • Built in Haryana, Designed for India" />
      </div>

      {/* Taxi Booking Modal */}
      <TaxiBookingModal
        taxi={activeTaxi}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        defaultDrop={defaultDrop}
      />
    </div>
  );
};
