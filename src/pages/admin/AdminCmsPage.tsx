import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Settings, Save, RefreshCw } from 'lucide-react';

export const AdminCmsPage: React.FC = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminSettings();
      if (res.success && res.list) {
        setSettings(res.list);
        const vals: Record<string, string> = {};
        res.list.forEach((s: any) => { vals[s.key] = s.value; });
        setEditValues(vals);
      }
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      await api.updateAdminSetting(key, editValues[key]);
    } catch (err: any) { alert(err.message); }
    finally { setSaving(null); }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">CMS & Platform Settings</h1>
          <p className="text-xs text-slate-400 mt-1">Key-value settings that control homepage content, pricing defaults, and platform behavior</p>
        </div>
        <button onClick={loadData} disabled={loading} className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {settings.length === 0 && !loading ? (
        <div className="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800">
          <Settings className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No settings configured yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {settings.map((s) => (
            <div key={s.key} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">{s.key}</label>
                <input
                  type="text"
                  value={editValues[s.key] || ''}
                  onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                onClick={() => handleSave(s.key)}
                disabled={saving === s.key}
                className="inline-flex items-center px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-sm"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                {saving === s.key ? 'Saving...' : 'Save'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
