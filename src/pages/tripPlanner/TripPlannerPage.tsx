import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { City } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import {
  Sparkles,
  MapPin,
  Calendar,
  Wallet,
  Users,
  Car,
  Compass,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const BUDGET_PRESETS = [
  { label: '₹5,000', value: 5000, desc: 'Budget backpacker' },
  { label: '₹10,000', value: 10000, desc: 'Comfortable explorer' },
  { label: '₹25,000', value: 25000, desc: 'Standard holiday' },
  { label: '₹50,000', value: 50000, desc: 'Premium experiential' },
  { label: '₹1,00,000+', value: 100000, desc: 'Royal luxury tour' },
];

const DAYS_PRESETS = [1, 2, 3, 4, 5, 7, 10];

const TRANSPORT_MODES = [
  { name: 'Self / Own Vehicle', icon: '🚗', desc: 'Personal car or bike road trip with highway routes, tolls & fuel advice' },
  { name: 'Bus', icon: '🚌', desc: 'Intercity AC Volvo and state tourism bus connectivity' },
  { name: 'Train', icon: '🚆', desc: 'Indian Railways superfast & express connected travel' },
  { name: 'Flight', icon: '✈️', desc: 'Airport transfers and express air travel' },
  { name: 'Taxi', icon: '🚕', desc: 'Pre-calculated local cab fares and private sightseeing' },
];

const INTERESTS_LIST = [
  { name: 'History', icon: '🏰' },
  { name: 'Spiritual', icon: '🛕' },
  { name: 'Nature', icon: '🌿' },
  { name: 'Beach', icon: '🏖️' },
  { name: 'Adventure', icon: '🧗‍♂️' },
  { name: 'Food', icon: '🍛' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Culture', icon: '🎭' },
  { name: 'Nightlife', icon: '🎉' },
  { name: 'Photography', icon: '📷' },
  { name: 'Wildlife', icon: '🐅' },
];

const TRAVEL_WITH_LIST = [
  { type: 'Solo', icon: '🎒', desc: 'Safe, budget-friendly solo exploration' },
  { type: 'Couple', icon: '💑', desc: 'Romantic sunsets, fine dining & havelis' },
  { type: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Kid-friendly, relaxed pacing & safety' },
  { type: 'Friends', icon: '👥', desc: 'Adventure, nightlife, cafes & road trips' },
];

export const TripPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);

  // Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(
    searchParams.get('city') ? Number(searchParams.get('city')) : null
  );
  const [citySearch, setCitySearch] = useState('');
  const [budgetTarget, setBudgetTarget] = useState<number>(25000);
  const [customBudget, setCustomBudget] = useState<string>('');
  const [daysCount, setDaysCount] = useState<number>(3);
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [transportMode, setTransportMode] = useState<string>('Self / Own Vehicle');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['History', 'Food', 'Culture']);
  const [travellerType, setTravellerType] = useState<string>('Couple');
  const [stepError, setStepError] = useState<string>('');

  // Generating State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState('Analyzing verified Indian tourist places...');

  useEffect(() => {
    api.getCities()
      .then((res) => {
        if (res.success) setCities(res.data);
      })
      .finally(() => setLoadingCities(false));
  }, []);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== interest));
      }
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedCityId) {
      alert('Please select a destination city.');
      setCurrentStep(1);
      return;
    }

    setIsGenerating(true);

    const phases = [
      'Querying database for published attractions in selected city...',
      'Evaluating entry fees, opening hours, and ratings...',
      'Calculating distance and optimal routes to avoid backtracking...',
      'Computing hotel and food costs for budget compatibility...',
      'Generating your personalized day-by-day itinerary...',
    ];

    let pIdx = 0;
    const interval = setInterval(() => {
      pIdx++;
      if (pIdx < phases.length) {
        setGenPhase(phases[pIdx]);
      }
    }, 600);

    try {
      const finalBudget = customBudget ? Number(customBudget) : budgetTarget;
      const res = await api.generateTrip({
        cityId: selectedCityId,
        budgetTarget: finalBudget,
        daysCount,
        travellersCount: adultsCount + childrenCount,
        adultsCount,
        childrenCount,
        transportMode,
        interests: selectedInterests,
        travellerType,
      });

      clearInterval(interval);

      if (res.success && res.trip) {
        sessionStorage.setItem('lastGeneratedTrip', JSON.stringify(res.trip));
        navigate('/trip/preview');
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsGenerating(false);
      alert(err.message || 'Failed to generate trip');
    }
  };

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.state_name?.toLowerCase().includes(citySearch.toLowerCase())
  );

  const selectedCityObj = cities.find((c) => c.id === selectedCityId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Planner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        {/* Wizard Header */}
        <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] p-6 sm:p-8 text-white relative">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-2 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F9C74F]" />
            <span>{t('aiAssistant')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading">{t('planTrip')}</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Personalized routes, verified attractions, and real budget optimization.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center space-x-2 mt-6">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === currentStep
                    ? 'w-8 bg-[#F9C74F]'
                    : s < currentStep
                    ? 'w-4 bg-white/70'
                    : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Body Content */}
        <div className="p-6 sm:p-8">
          {isGenerating ? (
            <div className="py-16 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin"></div>
                <Sparkles className="w-8 h-8 text-[#1B5E20] absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-xl font-bold text-slate-900 font-heading">Building Your Indian Odyssey</h3>
                <p className="text-xs font-medium text-[#1B5E20] h-6 transition-all duration-200">{genPhase}</p>
                <p className="text-[11px] text-slate-400">Balancing tourist places, meal stops, hidden gems & transport...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* STEP 1: DESTINATION */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-heading">Where do you want to travel?</h3>
                    <p className="text-xs text-slate-500">Search or choose from India’s top tourist cities.</p>
                  </div>

                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-[#1B5E20]" />
                    <input
                      type="text"
                      placeholder="Search destination city (e.g. Delhi, Jaipur, Goa, Manali, Varanasi)..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                    {filteredCities.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCityId(c.id)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                          selectedCityId === c.id
                            ? 'bg-emerald-50 border-[#1B5E20] ring-2 ring-[#1B5E20]/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-[#1B5E20]/40 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{c.state_name}</span>
                          {selectedCityId === c.id && <Check className="w-3.5 h-3.5 text-[#1B5E20]" />}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 font-heading mt-1">{c.name}</h4>
                        <span className="text-[10px] text-[#1B5E20] mt-1 font-semibold">{c.categories?.slice(0, 2).join(', ')}</span>
                      </button>
                    ))}
                  </div>

                  {selectedCityObj && (
                    <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center space-x-3">
                      <img src={selectedCityObj.cover_image} alt={selectedCityObj.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <span className="text-xs text-[#1B5E20] font-bold">Selected Destination:</span>
                        <h5 className="text-sm font-bold text-slate-900">{selectedCityObj.name}, {selectedCityObj.state_name}</h5>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: BUDGET */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-heading">What is your total trip budget?</h3>
                    <p className="text-xs text-slate-500">Includes stay, meals, local transport/taxi, and entry fees.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUDGET_PRESETS.map((b) => (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => {
                          setBudgetTarget(b.value);
                          setCustomBudget('');
                        }}
                        className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                          budgetTarget === b.value && !customBudget
                            ? 'bg-emerald-50 border-[#1B5E20] ring-2 ring-[#1B5E20]/20'
                            : 'bg-white border-slate-200 hover:border-emerald-200'
                        }`}
                      >
                        <div>
                          <span className="text-lg font-bold text-slate-900 font-heading">{b.label}</span>
                          <p className="text-xs text-slate-500">{b.desc}</p>
                        </div>
                        {budgetTarget === b.value && !customBudget && <CheckCircle2 className="w-5 h-5 text-[#1B5E20]" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Or Enter Custom Budget (₹ INR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 35000"
                      value={customBudget}
                      onChange={(e) => {
                        setCustomBudget(e.target.value);
                        setBudgetTarget(Number(e.target.value) || 25000);
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-hidden focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: DAYS */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-heading">How many days will you travel?</h3>
                    <p className="text-xs text-slate-500">Choose itinerary duration.</p>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                    {DAYS_PRESETS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDaysCount(d)}
                        className={`py-4 rounded-2xl border text-center transition ${
                          daysCount === d
                            ? 'bg-[#1B5E20] text-white font-bold border-[#1B5E20] shadow-md shadow-[#1B5E20]/25'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-300 font-bold'
                        }`}
                      >
                        <span className="text-xl block">{d}</span>
                        <span className="text-[10px] block uppercase">{d === 1 ? 'Day' : 'Days'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: TRAVELLERS */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-heading">Who is travelling?</h3>
                    <p className="text-xs text-slate-500">Help us calculate hotel rooms and passenger transport capacity.</p>
                  </div>

                  <div className="space-y-4 max-w-sm">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Adults (Age 12+)</h4>
                        <span className="text-xs text-slate-400">Regular fare & room occupancy</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                          className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="text-base font-bold text-slate-900 w-4 text-center">{adultsCount}</span>
                        <button
                          type="button"
                          onClick={() => setAdultsCount(adultsCount + 1)}
                          className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Children (Age 0-11)</h4>
                        <span className="text-xs text-slate-400">Discounted / free attraction entry</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                          className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="text-base font-bold text-slate-900 w-4 text-center">{childrenCount}</span>
                        <button
                          type="button"
                          onClick={() => setChildrenCount(childrenCount + 1)}
                          className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 font-semibold pt-1">
                      Total Travellers: <span className="text-[#1B5E20] font-bold">{adultsCount + childrenCount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: TRANSPORT MODE */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-heading">Preferred Mode of Transport</h3>
                    <p className="text-xs text-slate-500">We optimize transit timing, parking advice, and fuel estimates accordingly.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TRANSPORT_MODES.map((t) => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => setTransportMode(t.name)}
                        className={`p-4 rounded-2xl border text-left transition flex items-start space-x-3 ${
                          transportMode === t.name
                            ? 'bg-emerald-50 border-[#1B5E20] ring-2 ring-[#1B5E20]/20'
                            : 'bg-white border-slate-200 hover:border-emerald-200'
                        }`}
                      >
                        <span className="text-2xl">{t.icon}</span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{t.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: INTERESTS */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-heading">What are you interested in experiencing?</h3>
                    <p className="text-xs text-slate-500">Select all that apply to guide AI destination matching.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {INTERESTS_LIST.map((int) => {
                      const isSelected = selectedInterests.includes(int.name);
                      return (
                        <button
                          key={int.name}
                          type="button"
                          onClick={() => toggleInterest(int.name)}
                          className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-50 border-[#1B5E20] ring-2 ring-[#1B5E20]/20 font-bold text-emerald-950'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{int.icon}</span>
                            <span className="text-xs font-semibold">{int.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#1B5E20] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 7: TRAVEL WITH */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-heading">Who are you travelling with?</h3>
                    <p className="text-xs text-slate-500">Determines attraction compatibility scoring and hotel styles.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TRAVEL_WITH_LIST.map((grp) => (
                      <button
                        key={grp.type}
                        type="button"
                        onClick={() => setTravellerType(grp.type)}
                        className={`p-4 rounded-2xl border text-left transition flex items-start space-x-3 ${
                          travellerType === grp.type
                            ? 'bg-emerald-50 border-[#1B5E20] ring-2 ring-[#1B5E20]/20'
                            : 'bg-white border-slate-200 hover:border-emerald-200'
                        }`}
                      >
                        <span className="text-2xl">{grp.icon}</span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 font-heading">{grp.type}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{grp.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Summary Card Before Generating */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 mt-4">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Trip Specifications:</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>Destination: <span className="font-bold text-slate-900">{selectedCityObj?.name}</span></div>
                      <div>Duration: <span className="font-bold text-slate-900">{daysCount} Days</span></div>
                      <div>Budget Target: <span className="font-bold text-[#1B5E20]">₹{budgetTarget}</span></div>
                      <div>Mode: <span className="font-bold text-slate-900">{transportMode}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step Error Banner */}
              {stepError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{stepError}</span>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStepError('');
                      setCurrentStep(currentStep - 1);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 7 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStepError('');
                      if (currentStep === 1 && !selectedCityId) {
                        setStepError('Please select a destination city to continue.');
                        return;
                      }
                      if (currentStep === 2) {
                        const finalBudget = customBudget ? Number(customBudget) : budgetTarget;
                        if (!finalBudget || isNaN(finalBudget) || finalBudget < 1000) {
                          setStepError('Please select or enter a valid trip budget (minimum ₹1,000).');
                          return;
                        }
                      }
                      if (currentStep === 3 && (!daysCount || daysCount < 1)) {
                        setStepError('Please select at least 1 travel day.');
                        return;
                      }
                      if (currentStep === 4 && adultsCount < 1) {
                        setStepError('At least 1 adult traveller is required.');
                        return;
                      }
                      if (currentStep === 5 && !transportMode) {
                        setStepError('Please select your preferred transportation mode.');
                        return;
                      }
                      if (currentStep === 6 && selectedInterests.length === 0) {
                        setStepError('Please select at least 1 travel interest.');
                        return;
                      }
                      setCurrentStep(currentStep + 1);
                    }}
                    className="px-6 py-2.5 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setStepError('');
                      if (!travellerType) {
                        setStepError('Please select who you are travelling with.');
                        return;
                      }
                      handleGenerate();
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/25 transition flex items-center space-x-2 transform hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4 text-[#F9C74F]" />
                    <span>GENERATE MY TRIP</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indian Monuments Skyline Accent */}
      <div className="mt-8 bg-white/60 rounded-2xl p-4 border border-emerald-100/80 shadow-xs">
        <IndianMonumentsSkyline className="w-full text-emerald-800/15" tagline="Bharat Ki Khoj Ab Aur Aasaan • Built in Haryana, Designed for India" />
      </div>
    </div>
  );
};
