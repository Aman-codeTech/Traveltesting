import React from 'react';
import { Link } from 'react-router-dom';
import { TravelSaathiLogo } from '../common/TravelSaathiLogo';
import { IndianMonumentsSkyline } from '../common/IndianMonumentsSkyline';
import { Heart, ShieldCheck, Sparkles, MapPin, Phone, Mail, Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F3814] text-emerald-100 pt-16 pb-10 border-t border-[#1B5E20]/50 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2E7D32]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1B5E20]/60">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <TravelSaathiLogo variant="white" />
            <p className="text-emerald-200/80 text-sm leading-relaxed max-w-sm">
              <strong className="text-white">Discover India. Plan Smarter. Travel Better.</strong>
              <br />
              India’s smart AI tourism companion connecting travelers with rich heritage, authentic rural life, iconic dhabas, local homestays, and personalized itineraries.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F9C74F]/15 border border-[#F9C74F]/40 text-xs font-semibold text-[#F9C74F]">
                <Sparkles className="w-3.5 h-3.5 text-[#F9C74F]" />
                <span>Bharat Ki Khoj Ab Aur Aasaan</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Built in Haryana, Designed for India</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Explore Platform</h4>
            <ul className="space-y-2 text-sm text-emerald-200/80">
              <li><Link to="/explore" className="hover:text-[#F9C74F] transition">Explore All Cities</Link></li>
              <li><Link to="/plan-trip" className="hover:text-[#F9C74F] transition font-semibold text-white flex items-center space-x-1"><span>Plan My Trip</span><span className="text-[#F9C74F]">✨</span></Link></li>
              <li><Link to="/hidden-gems" className="hover:text-[#F9C74F] transition">India’s Hidden Gems</Link></li>
              <li><Link to="/hotels" className="hover:text-[#F9C74F] transition">Heritage & Luxury Hotels</Link></li>
              <li><Link to="/restaurants" className="hover:text-[#F9C74F] transition">Traditional Dhabas & Dining</Link></li>
              <li><Link to="/taxis" className="hover:text-[#F9C74F] transition">Local Taxis & Autos</Link></li>
              <li><Link to="/taxis/near-me" className="hover:text-[#F9C74F] transition">Taxi Near Me (GPS)</Link></li>
            </ul>
          </div>

          {/* Business & Partners */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">For Businesses</h4>
            <ul className="space-y-2 text-sm text-emerald-200/80">
              <li><Link to="/business/register" className="hover:text-[#F9C74F] transition">Partner With Us</Link></li>
              <li><Link to="/business/register" className="hover:text-[#F9C74F] transition">List Your Hotel</Link></li>
              <li><Link to="/business/register" className="hover:text-[#F9C74F] transition">List Your Dhaba / Cafe</Link></li>
              <li><Link to="/business/register" className="hover:text-[#F9C74F] transition">Register Taxi Fleet</Link></li>
              <li><Link to="/business/dashboard" className="hover:text-[#F9C74F] transition">Business Owner Portal</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Contact & Support</h4>
            <ul className="space-y-2 text-sm text-emerald-200/80">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#F9C74F] shrink-0" />
                <span>Haryana & New Delhi, India</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#F9C74F] shrink-0" />
                <span>namaste@travelsaathi.ai</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#F9C74F] shrink-0" />
                <span>+91 11 2345 6789</span>
              </li>
              <li className="pt-2">
                <Link to="/login" className="text-xs text-[#F9C74F] hover:underline flex items-center space-x-1">
                  <span>Super Admin Portal</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Indian Monuments Skyline Silhouette */}
        <div className="py-8 border-b border-[#1B5E20]/60">
          <IndianMonumentsSkyline fillColor="#246B2A" showTagline={true} />
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/70 gap-3">
          <p>© {new Date().getFullYear()} TravelSaathi AI. Built in Haryana, Designed for India.</p>
          <div className="flex items-center space-x-1">
            <span>Explore • Experience • Empower</span>
            <span className="mx-1">•</span>
            <Heart className="w-3.5 h-3.5 text-[#F3722C] fill-[#F3722C]" />
          </div>
        </div>
      </div>
    </footer>
  );
};
