import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Phone, ArrowRight, Briefcase, Compass } from 'lucide-react';
import { TravelSaathiLogo } from '../../components/common/TravelSaathiLogo';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'TOURIST' | 'BUSINESS_OWNER'>('TOURIST');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Name, email, and password are required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const user = await signup({
        name,
        email,
        phone,
        password,
        role,
      });

      if (user.role === 'BUSINESS_OWNER') {
        navigate('/business/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center flex flex-col items-center">
          <div className="mb-3">
            <TravelSaathiLogo size="lg" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Create Your Account
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Join thousands exploring India or grow your local hospitality service
          </p>
        </div>

        <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl border border-slate-200/80 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('TOURIST')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-semibold transition ${
                    role === 'TOURIST'
                      ? 'border-[#1B5E20] bg-emerald-50 text-[#1B5E20]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Compass className="w-4 h-4 text-[#1B5E20]" />
                  <span>Tourist / Explorer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('BUSINESS_OWNER')}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-semibold transition ${
                    role === 'BUSINESS_OWNER'
                      ? 'border-[#F3722C] bg-orange-50 text-[#F3722C]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-[#F3722C]" />
                  <span>Business Partner</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] hover:brightness-110 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1B5E20] hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </div>

        {/* Indian Monuments Skyline Accent */}
        <div className="pt-2">
          <IndianMonumentsSkyline className="w-full text-emerald-800/15" tagline="Bharat Ki Khoj Ab Aur Aasaan • India" />
        </div>
      </div>
    </div>
  );
};
