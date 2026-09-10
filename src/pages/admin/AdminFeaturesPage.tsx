import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';

export const AdminFeaturesPage: React.FC = () => {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminFeatures();
      if (res.success && res.data) setFeatures(res.data);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleToggle = async (key: string, current: boolean) => {
    try {
      await api.toggleAdminFeature(key, !current);
      setFeatures((prev) => prev.map((f) => f.key === key ? { ...f, is_enabled: !current ? 1 : 0 } : f));
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Feature Toggles</h1>
          <p className="text-xs text-slate-400 mt-1">Enable or disable platform features dynamically without code changes</p>
        </div>
        <button onClick={loadData} disabled={loading} className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {features.length === 0 && !loading ? (
        <div className="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800">
          <ToggleLeft className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No feature flags configured</p>
        </div>
      ) : (
        <div className="space-y-3">
          {features.map((f) => (
            <div key={f.key} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">{f.key}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{f.description || 'Platform feature toggle'}</p>
              </div>
              <button onClick={() => handleToggle(f.key, Boolean(f.is_enabled))} className="transition transform active:scale-90">
                {f.is_enabled ? (
                  <ToggleRight className="w-10 h-10 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-600" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
