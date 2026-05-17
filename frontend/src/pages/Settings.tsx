import { useEffect, useState } from 'react'
import { Settings as SettingsIcon, Save, Cloud, RefreshCw, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { settingsApi } from '@/lib/api'

const FIELDS = [
  { key: 'shop_name', label: 'Shop Name', type: 'text', placeholder: 'Saraswathe Graphix' },
  { key: 'shop_gstin', label: 'Shop GSTIN', type: 'text', placeholder: '33XXXXX1234A1Z5' },
  { key: 'shop_address', label: 'Address', type: 'text', placeholder: '12, MG Road, Pondicherry' },
  { key: 'shop_city', label: 'City', type: 'text', placeholder: 'Pondicherry' },
  { key: 'shop_state', label: 'State', type: 'text', placeholder: 'Pondicherry' },
  { key: 'shop_state_code', label: 'State Code', type: 'text', placeholder: '34' },
  { key: 'shop_mobile', label: 'Mobile', type: 'text', placeholder: '9XXXXXXXXX' },
  { key: 'shop_email', label: 'Email', type: 'email', placeholder: 'shop@email.com' },
  { key: 'invoice_prefix', label: 'Invoice Prefix', type: 'text', placeholder: 'SGX' },
]

const GST_RATES = ['5', '12', '18', '28']

export default function Settings() {
  const [vals, setVals] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsApi.getAll().then(list => {
      const m: Record<string, string> = {}
      list.forEach(s => { m[s.key] = s.value })
      setVals(m)
    }).finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await settingsApi.bulkUpdate(vals)
      toast.success('Settings saved!')
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const handleExport = () => {
    try {
      const data: Record<string, any> = {};
      for (const key of ['printflow_customers', 'printflow_orders', 'printflow_settings', 'printflow_notifications']) {
        const val = localStorage.getItem(key);
        if (val) data[key] = JSON.parse(val);
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `printflow_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (e) {
      toast.error('Failed to export data');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        for (const key of ['printflow_customers', 'printflow_orders', 'printflow_settings', 'printflow_notifications']) {
          if (data[key]) {
            localStorage.setItem(key, JSON.stringify(data[key]));
          }
        }
        toast.success('Data imported successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        toast.error('Invalid backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-bg-elevated rounded-2xl" />)}
    </div>
  )

  const handleLogout = () => {
    localStorage.removeItem('pf_auth')
    window.location.reload()
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <SettingsIcon size={26} className="text-brand-400" />Settings
        </h1>
        <button onClick={handleLogout} className="btn-secondary text-danger border-danger/20 hover:bg-danger/10">
          Logout & Lock
        </button>
      </div>

      {/* Shop Info */}
      <div className="glass-card p-6 mb-5">
        <h2 className="font-outfit font-700 text-lg mb-5">Shop Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {FIELDS.map(f => (
            <div key={f.key} className={f.key === 'shop_address' ? 'sm:col-span-2' : ''}>
              <label className="form-label">{f.label}</label>
              <input
                type={f.type}
                className="form-input"
                placeholder={f.placeholder}
                value={vals[f.key] || ''}
                onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* GST Defaults */}
      <div className="glass-card p-6 mb-5">
        <h2 className="font-outfit font-700 text-lg mb-5">GST Defaults</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Default GST Type</label>
            <select className="form-input"
              value={vals['default_gst_type'] || 'intra'}
              onChange={e => setVals(v => ({ ...v, default_gst_type: e.target.value }))}>
              <option value="intra">Intra-State (CGST + SGST)</option>
              <option value="inter">Inter-State (IGST)</option>
            </select>
          </div>
          <div>
            <label className="form-label">Default GST Rate (%)</label>
            <select className="form-input"
              value={vals['default_gst_rate'] || '18'}
              onChange={e => setVals(v => ({ ...v, default_gst_rate: e.target.value }))}>
              {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Local Data Management */}
      <div className="glass-card p-6 mb-5">
        <h2 className="font-outfit font-700 text-lg mb-5 flex items-center gap-2">
          <Save size={20} className="text-brand-400" /> Local Data Management
        </h2>
        <div className="bg-bg-elevated border border-bg-border rounded-xl p-5 mb-4">
          <p className="text-sm text-text-muted mb-4">
            All your PrintFlow data is stored locally in your browser. You can export this data to a JSON file to create a backup, or import a previous backup to restore your data.
          </p>
          <div className="flex gap-4">
            <button onClick={handleExport} className="btn-secondary py-2 px-4 flex-1 justify-center">
              Export Data (Backup)
            </button>
            <label className="btn-secondary py-2 px-4 flex-1 justify-center cursor-pointer text-center">
              Import Data (Restore)
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </div>
          <p className="text-xs text-danger mt-3 opacity-80">
            Warning: Importing data will overwrite your current local data!
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary px-8">
          <Save size={18} />{saving ? 'Saving…' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}
