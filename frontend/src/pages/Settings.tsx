import { useEffect, useState } from 'react'
import { Settings as SettingsIcon, Save, Cloud, RefreshCw, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { settingsApi, backupApi } from '@/lib/api'

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
  const [backupStatus, setBackupStatus] = useState<any>(null)
  const [backing, setBacking] = useState(false)

  useEffect(() => {
    settingsApi.getAll().then(list => {
      const m: Record<string, string> = {}
      list.forEach(s => { m[s.key] = s.value })
      setVals(m)
    }).finally(() => setLoading(false))

    backupApi.status().then(setBackupStatus).catch(() => { })
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await settingsApi.bulkUpdate(vals)
      toast.success('Settings saved!')
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  async function triggerBackup() {
    setBacking(true)
    try {
      const result = await backupApi.trigger()
      setBackupStatus(result)
      if (result.status === 'success') toast.success('Backup completed!')
      else if (result.status === 'skipped') toast('Backup skipped — Supabase not configured', { icon: 'ℹ️' })
      else toast.error(result.reason || 'Backup failed')
    } catch { toast.error('Backup request failed') }
    finally { setBacking(false) }
  }

  if (loading) return (
    <div className="animate-pulse space-y-4">
      {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-bg-elevated rounded-2xl" />)}
    </div>
  )

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <SettingsIcon size={26} className="text-brand-400" />Settings
        </h1>
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

      {/* Backup Status */}
      <div className="glass-card p-6 mb-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-outfit font-700 text-lg flex items-center gap-2">
              <Cloud size={20} className="text-brand-400" />Cloud Backup
            </h2>
            <p className="text-text-muted text-sm mt-1">Daily auto-backup to Supabase at 2:00 AM</p>
          </div>
          <button onClick={triggerBackup} disabled={backing} className="btn-secondary text-sm py-2 px-4">
            <RefreshCw size={15} className={backing ? 'animate-spin' : ''} />
            {backing ? 'Backing up…' : 'Backup Now'}
          </button>
        </div>

        {backupStatus && (
          <div className={`rounded-xl p-4 text-sm ${backupStatus.status === 'success' ? 'bg-success/10 border border-success/30' :
            backupStatus.status === 'failed' ? 'bg-danger/10 border border-danger/30' :
              'bg-bg-elevated border border-bg-border'
            }`}>
            <div className="flex items-center gap-2 font-medium mb-2">
              {backupStatus.status === 'success' && <CheckCircle2 size={16} className="text-success" />}
              Last backup: <span className="capitalize">{backupStatus.status}</span>
            </div>
            {backupStatus.synced && (
              <div className="text-text-muted space-y-1">
                {Object.entries(backupStatus.synced).map(([k, v]) => (
                  <div key={k}>✓ {v as number} {k} synced</div>
                ))}
              </div>
            )}
            {backupStatus.reason && <p className="text-text-muted">{backupStatus.reason}</p>}
            {backupStatus.completed_at && (
              <p className="text-text-muted mt-2 text-xs">
                {new Date(backupStatus.completed_at).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 p-4 bg-bg-elevated rounded-xl text-sm text-text-muted">
          <p className="font-medium text-text-primary mb-1">To enable Supabase backup:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Create a Supabase project at supabase.com</li>
            <li>Run <code className="bg-bg-border px-1 rounded text-brand-400">Setup/03_supabase_schema.sql</code> in SQL Editor</li>
            <li>Add <code className="bg-bg-border px-1 rounded text-brand-400">SUPABASE_URL</code> and <code className="bg-bg-border px-1 rounded text-brand-400">SUPABASE_SERVICE_KEY</code> to <code className="bg-bg-border px-1 rounded text-brand-400">backend/.env</code></li>
            <li>Restart the backend</li>
          </ol>
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
