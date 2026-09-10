/**
 * Currency, date, and display formatting utilities for TravelSaathi AI
 */

/**
 * Formats a number into Indian Rupee currency format (e.g. ₹12,500)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats distance in km (e.g. "4.5 km")
 */
export const formatDistance = (km: number): string => {
  return `${Number(km).toFixed(1)} km`;
};

/**
 * Formats duration in hours and minutes (e.g. "2 hrs 30 mins")
 */
export const formatDuration = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (wholeHours === 0) return `${minutes} mins`;
  if (minutes === 0) return `${wholeHours} hr${wholeHours > 1 ? 's' : ''}`;
  return `${wholeHours} hr${wholeHours > 1 ? 's' : ''} ${minutes} mins`;
};

/**
 * Safe image fallback helper
 */
export const getFallbackImage = (category: string = 'travel'): string => {
  const fallbacks: Record<string, string> = {
    Heritage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    Nature: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    Spiritual: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    Adventure: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=80',
    Food: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    Hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  };
  return fallbacks[category] || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';
};
