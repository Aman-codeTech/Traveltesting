import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage, LANGUAGES, LanguageCode } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import { TravelSaathiLogo } from '../../components/common/TravelSaathiLogo';
import {
  Globe,
  Settings as SettingsIcon,
  Bell,
  Compass,
  Utensils,
  Moon,
  Sun,
  Shield,
  Smartphone,
  Save,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Info,
  DollarSign,
  MapPin,
  Sparkles,
  Zap,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, t, currentLanguageOption } = useLanguage();
  const { user, login } = useAuth();

  // Settings State
  const [currency, setCurrency] = useState<string>(() => localStorage.getItem('travelsaathi_currency') || 'INR');
  const [distanceUnit, setDistanceUnit] = useState<string>(() => localStorage.getItem('travelsaathi_distance') || 'km');
  const [travelPace, setTravelPace] = useState<string>(() => localStorage.getItem('travelsaathi_pace') || 'balanced');
  const [dietary, setDietary] = useState<string>(() => localStorage.getItem('travelsaathi_diet') || 'pure_veg');
  const [offlineCaching, setOfflineCaching] = useState<boolean>(() => localStorage.getItem('travelsaathi_offline') !== 'false');
  const [notifications, setNotifications] = useState<boolean>(() => localStorage.getItem('travelsaathi_notifs') !== 'false');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = () => {
    localStorage.setItem('travelsaathi_currency', currency);
    localStorage.setItem('travelsaathi_distance', distanceUnit);
    localStorage.setItem('travelsaathi_pace', travelPace);
    localStorage.setItem('travelsaathi_diet', dietary);
    localStorage.setItem('travelsaathi_offline', String(offlineCaching));
    localStorage.setItem('travelsaathi_notifs', String(notifications));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all travel preferences and settings to default?')) {
      setLanguage('en');
      setCurrency('INR');
      setDistanceUnit('km');
      setTravelPace('balanced');
      setDietary('pure_veg');
      setOfflineCaching(true);
      setNotifications(true);
      localStorage.clear();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#144818] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#1B5E20]/20 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-8 pointer-events-none">
          <SettingsIcon className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs text-[#F9C74F]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('appName')} • {t('builtInHaryana')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            {t('settings')} & Preferences
          </h1>
          <p className="text-emerald-100 text-sm max-w-xl">
            Customize your multilingual language, regional currency, travel pacing, dietary choices, and AI assistant behavior.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#1B5E20] flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-[#1B5E20]" />
            <span className="text-sm font-bold">Preferences saved successfully!</span>
          </div>
          <span className="text-xs text-emerald-700">Updated across all portals</span>
        </div>
      )}

      {/* SECTION 1: MULTILINGUAL LANGUAGE SELECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#1B5E20]/10 flex items-center justify-center text-[#1B5E20]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              {t('language')} (Multilingual India)
            </h2>
            <p className="text-xs text-slate-500">
              Select your preferred language. All headings, trip generator buttons, and local experiences will adjust instantly.
            </p>
          </div>
        </div>

        {/* 9 Language Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-50/90 border-[#1B5E20] ring-2 ring-[#1B5E20]/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <h4 className={`text-sm font-bold ${isSelected ? 'text-[#1B5E20]' : 'text-slate-800'}`}>
                      {lang.nativeName}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">{lang.name}</p>
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1B5E20]" />}
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-center space-x-2">
          <span className="text-base">🌾</span>
          <span>
            <strong>Regional Spotlight:</strong> हरियाणवी (Haryanvi) and हिन्दी (Hindi) include customized cultural phrases: <em>"Tera budget kitna se?"</em> and <em>"Tanne ke pasand se?"</em>
          </span>
        </div>
      </div>

      {/* SECTION 2: CURRENCY & UNITS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#F9C74F]/20 flex items-center justify-center text-[#B27B08]">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Currency & Distance Units
            </h2>
            <p className="text-xs text-slate-500">
              Configure how estimated costs and travel routes are displayed on day-wise schedules.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Currency Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Display Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#1B5E20]/20"
            >
              <option value="INR">₹ INR — Indian Rupee (Default)</option>
              <option value="USD">$ USD — US Dollar</option>
              <option value="EUR">€ EUR — Euro</option>
              <option value="GBP">£ GBP — British Pound</option>
              <option value="AED">د.إ AED — UAE Dirham</option>
            </select>
          </div>

          {/* Distance Units */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Distance Calculation
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDistanceUnit('km')}
                className={`p-3 rounded-2xl border text-center text-sm font-bold transition ${
                  distanceUnit === 'km'
                    ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Kilometers (km)
              </button>
              <button
                type="button"
                onClick={() => setDistanceUnit('mi')}
                className={`p-3 rounded-2xl border text-center text-sm font-bold transition ${
                  distanceUnit === 'mi'
                    ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Miles (mi)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: TRAVEL & DIETARY PREFERENCES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-[#1B5E20]">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Dietary & Pacing Intelligence
            </h2>
            <p className="text-xs text-slate-500">
              Helps our AI recommendation engine auto-select appropriate lunch, breakfast, and dhaba stops.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Dietary Choice */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Food & Dhaba Preference
            </label>
            <div className="space-y-2">
              {[
                { id: 'pure_veg', name: 'Shuddh Shakahari (Pure Veg)', desc: 'Local vegetarian dhabas, paneer, makhan, and regional thalis' },
                { id: 'jain', name: 'Jain Friendly', desc: 'No onion, no garlic traditional options' },
                { id: 'multi', name: 'Multi-Cuisine & Non-Veg', desc: 'Mughlai, seafood, coastal curries, and multi-cuisine' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDietary(d.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    dietary === d.id
                      ? 'bg-emerald-50 border-[#1B5E20] ring-2 ring-[#1B5E20]/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{d.name}</h4>
                    <p className="text-[11px] text-slate-500">{d.desc}</p>
                  </div>
                  {dietary === d.id && <CheckCircle2 className="w-4 h-4 text-[#1B5E20] shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Travel Pacing */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Itinerary Pacing
            </label>
            <div className="space-y-2">
              {[
                { id: 'relaxed', name: 'Relaxed (Aaramdehi)', desc: '2 stops per day with plenty of tea/lassi breaks' },
                { id: 'balanced', name: 'Balanced (Standard)', desc: '3-4 stops per day with comfortable transit (Default)' },
                { id: 'fast', name: 'Fast Explorer', desc: '5+ stops to maximize sightseeing in limited days' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTravelPace(p.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    travelPace === p.id
                      ? 'bg-emerald-50 border-[#1B5E20] ring-2 ring-[#1B5E20]/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{p.name}</h4>
                    <p className="text-[11px] text-slate-500">{p.desc}</p>
                  </div>
                  {travelPace === p.id && <CheckCircle2 className="w-4 h-4 text-[#1B5E20] shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: OFFLINE & NOTIFICATIONS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Offline Access & Notifications
            </h2>
            <p className="text-xs text-slate-500">
              Manage network efficiency, push notifications, and local device caching.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Offline caching */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Cache Itineraries for Offline Use</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically keep your saved trip schedules accessible even without internet connectivity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOfflineCaching(!offlineCaching)}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                offlineCaching ? 'bg-[#1B5E20]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  offlineCaching ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Travel Alerts & Festival Reminders</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Receive proactive updates on local festivals (e.g. Surajkund Mela), weather, and seasonal deals.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                notifications ? 'bg-[#1B5E20]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 5: ACCOUNT & DEMO PROFILES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Account & Demo Testing
              </h2>
              <p className="text-xs text-slate-500">
                Current session: <span className="font-bold text-slate-800">{user ? user.email : 'Guest Visitor'}</span>
              </p>
            </div>
          </div>
          {user && (
            <span className="text-[10px] uppercase font-bold tracking-widest bg-[#1B5E20]/15 text-[#1B5E20] px-2.5 py-1 rounded-full">
              {user.role}
            </span>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-900 block">Switch Demo Portals (1-Click):</span>
            <span>Test Super Admin CMS, Business Partner Dashboard, or Tourist views anytime.</span>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 bg-[#1B5E20] hover:bg-[#144818] text-white font-bold rounded-xl text-xs shadow-xs transition shrink-0"
          >
            Open Login Portal →
          </Link>
        </div>
      </div>

      {/* ACTION BAR: SAVE OR RESET */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs transition flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Defaults</span>
        </button>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#1B5E20] hover:bg-[#144818] text-white font-bold text-sm shadow-lg shadow-[#1B5E20]/25 transition flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* FOOTER WATERMARK SILHOUETTE */}
      <div className="pt-8 border-t border-slate-200/60">
        <IndianMonumentsSkyline fillColor="#1B5E20" showTagline={true} />
      </div>
    </div>
  );
};
