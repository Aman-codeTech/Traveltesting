import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CheckSquare, CheckCircle, XCircle, Clock, Hotel, Utensils, Car, RefreshCw } from 'lucide-react';

export const AdminApprovalsPage: React.FC = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminApprovals();
      if (res.success && res.data) setApprovals(res.data);
    } catch (err: any) {
      alert(err.message || 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (type: string, id: number, status: string) => {
    const key = `${type}-${id}`;
    setActionLoading(key);
    try {
      await api.updateAdminBusinessStatus(type, id, status);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'hotel') return <Hotel className="w-4 h-4 text-amber-500" />;
    if (type === 'restaurant') return <Utensils className="w-4 h-4 text-rose-500" />;
    return <Car className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Business Approvals Queue</h1>
          <p className="text-xs text-slate-400 mt-1">Review and approve/reject pending hotel, restaurant, and taxi registrations</p>
        </div>
        <button onClick={loadData} disabled={loading} className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {approvals.length === 0 && !loading ? (
        <div className="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No pending applications. All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((item) => (
            <div key={`${item.type}-${item.id}`} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1">{getTypeIcon(item.type)}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white text-sm">{item.name}</h3>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">{item.type}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Clock className="w-3 h-3 mr-1" /> {item.approval_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Owner: {item.owner_name || 'N/A'} • City ID: {item.city_id} • Phone: {item.phone || 'N/A'}</p>
                  {item.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.description}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => handleAction(item.type, item.id, 'APPROVED')}
                  disabled={actionLoading === `${item.type}-${item.id}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition inline-flex items-center space-x-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> <span>Approve & Publish</span>
                </button>
                <button
                  onClick={() => handleAction(item.type, item.id, 'REJECTED')}
                  disabled={actionLoading === `${item.type}-${item.id}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-300 text-xs font-semibold transition inline-flex items-center space-x-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
