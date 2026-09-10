import React from 'react';

interface IndianMonumentsSkylineProps {
  className?: string;
  fillColor?: string;
  showTagline?: boolean;
  tagline?: string;
}

export const IndianMonumentsSkyline: React.FC<IndianMonumentsSkylineProps> = ({
  className = '',
  fillColor = '#1B5E20',
  showTagline = true,
  tagline,
}) => {
  return (
    <div className={`w-full flex flex-col items-center justify-center text-center ${className}`}>
      {/* Stylized Monuments Silhouette (Taj Mahal, India Gate, Qutub Minar, Fort arches) */}
      <div className="w-full max-w-xl h-16 opacity-85 flex items-end justify-center overflow-hidden">
        <svg viewBox="0 0 800 120" className="w-full h-full" preserveAspectRatio="xMidYMax meet">
          <g fill={fillColor}>
            {/* Ground line */}
            <rect x="0" y="112" width="800" height="8" rx="2" />

            {/* Left Temple & Fort Towers */}
            <rect x="20" y="70" width="20" height="42" />
            <polygon points="15,70 30,35 45,70" />
            <circle cx="30" cy="32" r="4" />
            <rect x="50" y="60" width="30" height="52" />
            <polygon points="50,60 65,45 80,60" />

            {/* Qutub Minar / Tower */}
            <polygon points="105,112 110,20 120,20 125,112" />
            <rect x="108" y="45" width="14" height="4" />
            <rect x="109" y="75" width="12" height="4" />
            <circle cx="115" cy="16" r="4" />

            {/* Arched Pavilions (Rajasthan / Haryana Haveli) */}
            <path d="M140,112 L140,75 C140,65 170,65 170,75 L170,112 Z" />
            <path d="M180,112 L180,60 C180,45 220,45 220,60 L220,112 Z" />
            <circle cx="200" cy="40" r="5" />

            {/* India Gate (Center-Left) */}
            <rect x="240" y="50" width="16" height="62" />
            <rect x="284" y="50" width="16" height="62" />
            <rect x="235" y="42" width="70" height="12" />
            <rect x="242" y="32" width="56" height="10" />
            <path d="M256,112 L256,80 C256,65 284,65 284,80 L284,112 Z" fill="#FAF9F6" />

            {/* Taj Mahal (Center) */}
            <rect x="340" y="75" width="120" height="37" />
            {/* Main Dome */}
            <path d="M380,75 C380,35 420,35 420,75 Z" />
            <polygon points="398,35 400,20 402,35" />
            {/* Side Domes */}
            <path d="M352,75 C352,55 372,55 372,75 Z" />
            <path d="M428,75 C428,55 448,55 448,75 Z" />
            {/* Main Arch */}
            <path d="M385,112 L385,85 C385,78 415,78 415,85 L415,112 Z" fill="#FAF9F6" />
            {/* Left Minaret */}
            <polygon points="322,112 324,30 330,30 332,112" />
            <circle cx="327" cy="27" r="3" />
            {/* Right Minaret */}
            <polygon points="468,112 470,30 476,30 478,112" />
            <circle cx="473" cy="27" r="3" />

            {/* Red Fort / Palace (Right Center) */}
            <rect x="500" y="65" width="70" height="47" />
            <rect x="505" y="55" width="12" height="10" />
            <rect x="525" y="55" width="12" height="10" />
            <rect x="545" y="55" width="12" height="10" />
            <path d="M520,112 L520,85 C520,75 550,75 550,85 L550,112 Z" fill="#FAF9F6" />

            {/* South Indian Gopuram (Right) */}
            <polygon points="590,112 605,25 635,25 650,112" />
            <rect x="600" y="50" width="40" height="6" />
            <rect x="605" y="75" width="30" height="6" />
            <circle cx="620" cy="20" r="5" />

            {/* Far Right Stupa / Fort */}
            <path d="M670,112 C670,75 730,75 730,112 Z" />
            <polygon points="698,75 700,50 702,75" />
            <rect x="745" y="60" width="35" height="52" />
            <polygon points="740,60 762,40 785,60" />
          </g>
        </svg>
      </div>

      {showTagline && (
        <div className="mt-3">
          <p className="text-xs font-bold text-[#1B5E20] tracking-wide">
            {tagline || 'One AI Travel Companion for Every Indian Destination'}
          </p>
          <div className="flex items-center justify-center space-x-1.5 mt-1 text-[11px] font-semibold text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-[#F9C74F]"></span>
            <span>Built in Haryana, Designed for India</span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#1B5E20]"></span>
          </div>
        </div>
      )}
    </div>
  );
};
