import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Car, MapPin, User, Calendar, Clock, CheckCircle, RefreshCw } from 'lucide-react';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminBookings();
      if (res.success && res.data) setBookings(res.data);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const statusColor: Record<string, string> = {
    REQUESTED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    CONFIRMED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    COMPLETED: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    CANCELLED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">All Taxi Bookings</h1>
          <p className="text-xs text-slate-400 mt-1">Platform-wide ride request monitoring and fulfilment log</p>
        </div>
        <button onClick={loadData} disabled={loading} className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {bookings.length === 0 && !loading ? (
        <div className="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No booking records found</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Taxi Service</th>
                  <th className="py-3.5 px-4">Route</th>
                  <th className="py-3.5 px-4">Fare</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-white">{b.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{b.customer_name || 'Tourist'}</div>
                      <div className="text-[11px] text-slate-500">{b.customer_email || ''}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">{b.service_name || `Taxi #${b.taxi_service_id}`}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 text-emerald-400"><MapPin className="w-3 h-3" /><span>{b.pickup_location}</span></div>
                      <div className="flex items-center space-x-1 text-rose-400 mt-0.5"><MapPin className="w-3 h-3" /><span>{b.drop_location || 'Local'}</span></div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">₹{b.fare_estimate || 250}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor[b.booking_status] || 'bg-slate-800 text-slate-400'}`}>
                        {b.booking_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
