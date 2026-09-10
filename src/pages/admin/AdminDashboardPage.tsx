import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Users,
  MapPin,
  Compass,
  Sparkles,
  Hotel,
  Utensils,
  Car,
  Route,
  CheckSquare,
  MessageSquare,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<{
    stats: any;
    popularCities: any[];
    recentActivity: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdminStats();
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const popularCities = data?.popularCities || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
            Tourism Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics and CMS configuration for the India Tourism Knowledge Base
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadStats}
            disabled={loading}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/admin/places"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Monument
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cities</span>
            <MapPin className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-white font-heading">{stats.cities || 0}</div>
          <span className="text-[10px] text-slate-500">Curated Destinations</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Attractions</span>
            <Compass className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-white font-heading">{stats.places || 0}</div>
          <span className="text-[10px] text-slate-500">Monuments & Spots</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Hidden Gems</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-heading">{stats.gems || 0}</div>
          <span className="text-[10px] text-slate-500">Offbeat Locations</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Stays & Hotels</span>
            <Hotel className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-heading">{stats.hotels || 0}</div>
          <span className="text-[10px] text-slate-500">Verified Accommodations</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Taxi Fleet</span>
            <Car className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-heading">{stats.taxis || 0}</div>
          <span className="text-[10px] text-slate-500">Active Drivers / Cabs</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>AI Trips</span>
            <Route className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-heading">{stats.trips || 0}</div>
          <span className="text-[10px] text-slate-500">Itineraries Generated</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cab Bookings</span>
            <Car className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-heading">{stats.bookings || 0}</div>
          <span className="text-[10px] text-slate-500">Tourist Orders</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>User Accounts</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-white font-heading">{stats.users || 0}</div>
          <span className="text-[10px] text-slate-500">Tourists & Partners</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Reviews</span>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-heading">{stats.reviews || 0}</div>
          <span className="text-[10px] text-slate-500">Ratings & Feedback</span>
        </div>

        <div className={`border rounded-2xl p-4 transition ${
          stats.pendingBusinesses > 0
            ? 'bg-amber-950/40 border-amber-500/50'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={stats.pendingBusinesses > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
              Approvals Due
            </span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-white font-heading">
            {stats.pendingBusinesses || 0}
          </div>
          <Link
            to="/admin/approvals"
            className="text-[10px] text-amber-400 font-semibold hover:underline inline-flex items-center mt-1"
          >
            Review Applications &rarr;
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Top Destinations & Recent Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Destinations */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white font-heading">
              Top Destination Coverage
            </h2>
            <Link to="/admin/cities" className="text-xs text-amber-400 hover:underline">
              Manage All &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {popularCities.map((city, idx) => (
              <div
                key={city.name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-800"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 text-xs font-mono font-bold text-amber-500">#{idx + 1}</span>
                  <span className="font-semibold text-xs text-white">{city.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">{city.place_count} monuments cataloged</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                    Indexed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Admin Audit Trail */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white font-heading">
              Audit Activity Log
            </h2>
            <Link to="/admin/logs" className="text-xs text-amber-400 hover:underline">
              Full Audit &rarr;
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No recent changes recorded
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 flex items-start space-x-3 text-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{log.action}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>
                    <span className="text-[9px] text-slate-500 block mt-1">
                      By {log.admin_name} • {log.entity_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
