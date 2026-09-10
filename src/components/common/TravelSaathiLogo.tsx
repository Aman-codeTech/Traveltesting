import React from 'react';
import { Link } from 'react-router-dom';

interface TravelSaathiLogoProps {
  variant?: 'full' | 'compact' | 'white';
  showSubtitle?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | string;
}

export const TravelSaathiLogo: React.FC<TravelSaathiLogoProps> = ({
  variant = 'full',
  showSubtitle = true,
  className = '',
  size,
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Mountain + Sun Circular Emblem */}
      <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-b from-[#1B5E20] to-[#144818] p-0.5 shadow-md shadow-[#1B5E20]/20 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circular border ring */}
          <circle cx="50" cy="50" r="46" stroke="#F9C74F" strokeWidth="3" fill="#1B5E20" />

          {/* Sun / Sky arc */}
          <circle cx="50" cy="40" r="18" fill="#F9C74F" />

          {/* Mountain Silhouette (Green) */}
          <path d="M15 80 L42 38 L62 65 L78 45 L92 80 Z" fill="#2E7D32" />
          <path d="M30 80 L52 46 L70 72 L85 54 L92 80 Z" fill="#144818" opacity="0.6" />

          {/* Valley / Path */}
          <path d="M46 54 L52 46 L58 54 L50 82 Z" fill="#F9C74F" opacity="0.9" />

          {/* Road / Swirl */}
          <path d="M35 84 C45 74, 55 74, 65 84" stroke="#FAF9F6" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Brand Text */}
      <div>
        <div className="flex items-center space-x-1.5">
          <span className={`font-black text-2xl tracking-tight font-heading ${variant === 'white' ? 'text-white' : 'text-[#1B5E20]'}`}>
            TravelSaathi
          </span>
          <span className="font-black text-2xl tracking-tight text-[#F3722C] font-heading">
            AI
          </span>
          <span className="text-[9px] uppercase font-bold tracking-widest bg-[#F9C74F]/20 text-[#1B5E20] border border-[#F9C74F]/60 px-1.5 py-0.5 rounded-md hidden sm:inline-block">
            Haryana • India
          </span>
        </div>
        {showSubtitle && (
          <p className={`text-[11px] font-medium tracking-wide ${variant === 'white' ? 'text-emerald-100' : 'text-slate-500'} hidden sm:block`}>
            Your Smart Travel Companion Across India
          </p>
        )}
      </div>
    </div>
  );
};
