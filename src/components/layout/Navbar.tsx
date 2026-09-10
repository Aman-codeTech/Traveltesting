import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TravelSaathiLogo } from '../common/TravelSaathiLogo';
import { LanguageSelector } from '../common/LanguageSelector';
import { useLanguage } from '../../context/LanguageContext';
import {
  Compass,
  Sparkles,
  Hotel,
  Utensils,
  Car,
  Eye,
  Briefcase,
  User as UserIcon,
  Shield,
  LogOut,
  Menu,
  X,
  Bell,
  BookmarkCheck,
  ChevronDown,
  Settings as SettingsIcon,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isSuperAdmin, isBusinessOwner } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then((res) => {
          if (res.success && res.data) {
            const unread = res.data.filter((n) => !n.is_read).length;
            setUnreadNotifications(unread);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('exploreIndia'), path: '/explore', icon: Compass },
    { name: t('planMyTrip'), path: '/plan-trip', icon: Sparkles, highlight: true },
    { name: t('hotels'), path: '/hotels', icon: Hotel },
    { name: t('restaurants'), path: '/restaurants', icon: Utensils },
    { name: t('taxis'), path: '/taxis', icon: Car },
    { name: t('hiddenGems'), path: '/hidden-gems', icon: Eye },
    { name: t('advertise'), path: '/business/register', icon: Briefcase },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#1B5E20]/15 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tagline */}
          <Link to="/" className="group">
            <TravelSaathiLogo />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    link.highlight
                      ? 'bg-[#1B5E20] hover:bg-[#144818] text-white shadow-md shadow-[#1B5E20]/25 hover:scale-[1.02]'
                      : isActive
                      ? 'text-[#1B5E20] bg-emerald-100/70 font-bold border border-emerald-300/60'
                      : 'text-slate-600 hover:text-[#1B5E20] hover:bg-emerald-50/50'
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${link.highlight ? 'text-[#F9C74F]' : ''}`} />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Actions & Auth Profile */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
            {/* Global Multilingual Language Selector */}
            <LanguageSelector />

            {/* Quick Settings Shortcut */}
            <Link
              to="/settings"
              title="Settings & Regional Preferences"
              className="p-2 text-slate-500 hover:text-[#1B5E20] hover:bg-emerald-50 rounded-xl transition"
            >
              <SettingsIcon className="w-5 h-5" />
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                {/* Saved Collection shortcut */}
                <Link
                  to="/saved"
                  title="Saved Places & Trips"
                  className="p-2 text-slate-500 hover:text-[#1B5E20] hover:bg-emerald-50 rounded-xl transition"
                >
                  <BookmarkCheck className="w-5 h-5" />
                </Link>

                {/* Notifications */}
                <Link
                  to="/dashboard"
                  title="Notifications"
                  className="p-2 text-slate-500 hover:text-[#1B5E20] hover:bg-emerald-50 rounded-xl relative transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#F3722C] rounded-full ring-2 ring-white"></span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-[#1B5E20]/40 bg-white hover:bg-emerald-50/40 transition shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#1B5E20] font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-slate-800 max-w-[110px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>

                      {isSuperAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-50 transition"
                        >
                          <Shield className="w-4 h-4 text-purple-600" />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}

                      {isBusinessOwner && (
                        <Link
                          to="/business/dashboard"
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          <Briefcase className="w-4 h-4 text-emerald-600" />
                          <span>Business Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#1B5E20] transition"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Tourist Dashboard</span>
                      </Link>

                      <Link
                        to="/saved"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#1B5E20] transition"
                      >
                        <BookmarkCheck className="w-4 h-4" />
                        <span>Saved Trips & Places</span>
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#1B5E20] transition"
                      >
                        <SettingsIcon className="w-4 h-4 text-slate-500" />
                        <span>{t('settings')} & Preferences</span>
                      </Link>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={logout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#1B5E20] hover:bg-emerald-50 border border-emerald-200/70 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#1B5E20] hover:bg-[#144818] rounded-xl shadow-xs transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            {user && (
              <Link to="/dashboard" className="p-2 text-slate-600">
                <Bell className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 rounded-xl hover:bg-emerald-50 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-100 bg-[#FAF9F6] px-4 pt-3 pb-6 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-base font-semibold ${
                  link.highlight
                    ? 'bg-[#1B5E20] text-white font-bold'
                    : location.pathname === link.path
                    ? 'bg-emerald-100/70 text-[#1B5E20] font-bold'
                    : 'text-slate-700 hover:bg-emerald-50/50'
                }`}
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="border-t border-slate-100 pt-3 mt-2">
            {user ? (
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                </div>
                {isSuperAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-bold text-purple-700 bg-purple-50 rounded-xl"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Super Admin Panel</span>
                  </Link>
                )}
                {isBusinessOwner && (
                  <Link
                    to="/business/dashboard"
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Business Dashboard</span>
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>My Dashboard</span>
                </Link>
                <Link
                  to="/saved"
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Saved Items</span>
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#1B5E20] hover:bg-[#154a19] rounded-xl transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
