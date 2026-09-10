import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Sparkles, Mail, Lock, ArrowRight, CheckCircle2, User } from 'lucide-react';
import { TravelSaathiLogo } from '../../components/common/TravelSaathiLogo';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const user = await login({ email, password });
      if (user.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else if (user.role === 'BUSINESS_OWNER') {
        navigate('/business/dashboard');
      } else {
        navigate(redirectPath);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setLoading(true);
    setError('');
    try {
      const user = await login({ email: roleEmail, password: rolePass });
      if (user.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else if (user.role === 'BUSINESS_OWNER') {
        navigate('/business/dashboard');
      } else {
        navigate(redirectPath);
      }
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Top Branding Card */}
        <div className="text-center flex flex-col items-center">
          <div className="mb-3">
            <TravelSaathiLogo size="lg" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Welcome to TravelSaathi AI
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Sign in to access your AI itineraries, taxi rides, or CMS console
          </p>
        </div>

        {/* Quick Demo Login Cards */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#1B5E20] uppercase tracking-wider mb-2.5">
            <Sparkles className="w-4 h-4 text-[#1B5E20]" />
            <span>1-Click Test Demo Logins</span>
          </div>
          <p className="text-[11px] text-slate-600 mb-3">
            Click any profile below to instantly log in and explore different portal permissions:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@travelsaathi.ai', 'Admin@123')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-emerald-200 hover:border-[#1B5E20] hover:shadow-sm transition text-center group"
            >
              <Shield className="w-4 h-4 text-[#1B5E20] mb-1 group-hover:scale-110 transition" />
              <span className="text-[11px] font-bold text-slate-800">Super Admin</span>
              <span className="text-[9px] text-slate-400">Full CMS Control</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('business@travelsaathi.ai', 'Business@123')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-emerald-200 hover:border-[#1B5E20] hover:shadow-sm transition text-center group"
            >
              <User className="w-4 h-4 text-[#F3722C] mb-1 group-hover:scale-110 transition" />
              <span className="text-[11px] font-bold text-slate-800">Partner Owner</span>
              <span className="text-[9px] text-slate-400">Hotel / Taxi</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('tourist@travelsaathi.ai', 'Tourist@123')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-emerald-200 hover:border-[#1B5E20] hover:shadow-sm transition text-center group"
            >
              <CheckCircle2 className="w-4 h-4 text-[#1B5E20] mb-1 group-hover:scale-110 transition" />
              <span className="text-[11px] font-bold text-slate-800">Tourist</span>
              <span className="text-[9px] text-slate-400">Trips & Cabs</span>
            </button>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl border border-slate-200/80 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
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
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] hover:brightness-110 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#1B5E20] hover:underline font-bold">
              Sign up now
            </Link>
          </div>
        </div>

        {/* Indian Monuments Skyline Accent */}
        <div className="pt-2">
          <IndianMonumentsSkyline className="w-full text-emerald-800/15" tagline="Bharat Ki Khoj Ab Aur Aasaan • Haryana" />
        </div>
      </div>
    </div>
  );
};
