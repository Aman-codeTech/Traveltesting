import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { City } from '../../types';
import { Briefcase, Hotel, Utensils, Car, CheckCircle2, AlertCircle } from 'lucide-react';

export const BusinessRegisterPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cities, setCities] = useState<City[]>([]);
  const [businessType, setBusinessType] = useState<'HOTEL' | 'RESTAURANT' | 'TAXI'>('HOTEL');
  const [name, setName] = useState('');
  const [cityId, setCityId] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [price, setPrice] = useState('2500');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [cuisine, setCuisine] = useState('North Indian & Mughlai');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.getCities().then((res) => {
      if (res.success && res.data) setCities(res.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in or sign up first to register your business.');
      navigate('/login');
      return;
    }
    if (!name || !cityId) {
      setError('Please provide business name and operating city.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.registerBusiness({
        business_type: businessType,
        name,
        city_id: cityId,
        description,
        address,
        phone,
        email,
        price,
        vehicle_type: vehicleType,
        cuisine,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/business/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-8 text-white">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Tourism Partner Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading">Register Your Tourism Business</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            List your Hotel, Restaurant, or Taxi Service. Join the TravelSaathi AI verified network.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {success ? (
            <div className="text-center py-10 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
              <h3 className="text-2xl font-bold text-slate-900 font-heading">Registration Submitted!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your business profile is now <strong>PENDING</strong> verification by our Super Admin team. Once approved, it will be visible to tourists and AI itineraries.
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold block">Redirecting to Business Dashboard...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Select Business Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Your Business Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'HOTEL', label: 'Hotel / Resort', icon: Hotel },
                    { type: 'RESTAURANT', label: 'Restaurant / Cafe', icon: Utensils },
                    { type: 'TAXI', label: 'Taxi Service', icon: Car },
                  ].map((b) => {
                    const Icon = b.icon;
                    const isSelected = businessType === b.type;
                    return (
                      <button
                        key={b.type}
                        type="button"
                        onClick={() => setBusinessType(b.type as any)}
                        className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold">{b.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Business Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Heritage Resort"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Operating City</label>
                  <select
                    required
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                  >
                    <option value="">Select City</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.state_name})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic specific fields */}
              {businessType === 'HOTEL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Starting Price per Night (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                  />
                </div>
              )}

              {businessType === 'RESTAURANT' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cuisine Speciality</label>
                    <input
                      type="text"
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Average Cost for Two (₹)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {businessType === 'TAXI' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Vehicle Type</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                    >
                      <option value="Sedan">Sedan (Dzire, Etios)</option>
                      <option value="SUV">SUV (Innova, Ertiga)</option>
                      <option value="Auto">Auto Rickshaw</option>
                      <option value="Bike Taxi">Bike Taxi</option>
                      <option value="Van">Tempo Traveller / Van</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Base Starting Fare (₹)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Address & Contact */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Physical Address</label>
                <input
                  type="text"
                  placeholder="Street address, landmark, pin code"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Description & Highlights</label>
                <textarea
                  rows={3}
                  placeholder="Tell tourists about your business, specialties, amenities, and fleet..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-700/20 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Submitting Application...' : 'Submit Profile for Approval'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
