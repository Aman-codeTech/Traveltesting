import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MessageSquare, Star, Eye, EyeOff, RefreshCw } from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminReviews();
      if (res.success && res.data) setReviews(res.data);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const toggleModeration = async (id: number, current: boolean) => {
    try {
      await api.toggleAdminReviewModeration(id, !current);
      await loadData();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Review Moderation</h1>
          <p className="text-xs text-slate-400 mt-1">Monitor tourist feedback, ratings, and flag inappropriate reviews</p>
        </div>
        <button onClick={loadData} disabled={loading} className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {reviews.length === 0 && !loading ? (
        <div className="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No reviews in the system yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-white text-sm">{r.user_name || 'Anonymous'}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">{r.entity_type}</span>
                  <div className="flex items-center space-x-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-400">{r.comment || 'No comment'}</p>
                <span className="text-[10px] text-slate-600 mt-1 block">
                  Entity #{r.entity_id} • {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                </span>
              </div>
              <button
                onClick={() => toggleModeration(r.id, Boolean(r.is_moderated))}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  r.is_moderated
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
              >
                {r.is_moderated ? <><EyeOff className="w-3.5 h-3.5" /><span>Hidden</span></> : <><Eye className="w-3.5 h-3.5" /><span>Visible</span></>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
