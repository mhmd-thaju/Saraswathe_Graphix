import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Users, Plus, Search, Phone, Mail, MapPin, X, Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { customersApi } from '@/lib/api'
import type { Customer, CustomerWithOrders } from '@/types'

const EMPTY = { name:'', mobile:'', email:'', gstin:'', address:'', city:'', state:'Tamil Nadu' }
const STATUS_COLOR: Record<string,string> = {
  new:'bg-info/15 text-info', designing:'bg-brand-600/15 text-brand-400',
  printing:'bg-warning/15 text-warning', ready:'bg-success/15 text-success',
}

export default function CRM() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detail, setDetail]       = useState<CustomerWithOrders | null>(null)
  const [form, setForm]           = useState({...EMPTY})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    customersApi.list().then(setCustomers).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!search.trim()) { load(); return }
    const t = setTimeout(() => {
      const isMobile = /^\d+$/.test(search.trim())
      customersApi.search(isMobile ? search : undefined, isMobile ? undefined : search).then(setCustomers)
    }, 350)
    return () => clearTimeout(t)
  }, [search, load])

  function openAdd() { setForm({...EMPTY}); setEditingId(null); setDrawerOpen(true) }
  function openEdit(c: Customer) {
    setForm({ name:c.name, mobile:c.mobile, email:c.email||'', gstin:c.gstin||'',
              address:c.address||'', city:c.city||'', state:c.state })
    setEditingId(c.id); setDrawerOpen(true)
  }

  async function openDetail(id: string) {
    const data = await customersApi.get(id); setDetail(data)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.mobile.trim()) { toast.error('Name & mobile required'); return }
    setSaving(true)
    try {
      editingId ? await customersApi.update(editingId, form) : await customersApi.create(form)
      toast.success(editingId ? 'Customer updated' : 'Customer added')
      setDrawerOpen(false); load()
    } catch (e: any) { toast.error(e.response?.data?.detail || 'Save failed') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try { await customersApi.delete(id); toast.success('Deleted'); setDetail(null); load() }
    catch (e: any) { toast.error(e.response?.data?.detail || 'Delete failed') }
  }

  const F = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(f => ({...f, [k]: e.target.value}))

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Users size={26} className="text-brand-400"/>Customers</h1>
          <p className="text-text-muted mt-1">{customers.length} total customers</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={18}/>Add Customer</button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"/>
        <input className="form-input pl-11" placeholder="Search by name or mobile number…"
          value={search} onChange={e => setSearch(e.target.value)}/>
        {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"><X size={16}/></button>}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_,i) => <div key={i} className="h-36 bg-bg-elevated rounded-2xl"/>)}
        </div>
      ) : customers.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users size={48} className="text-text-faint mx-auto mb-3"/>
          <p className="text-text-muted text-lg">No customers found</p>
          <button onClick={openAdd} className="btn-primary mt-4"><Plus size={16}/>Add Customer</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(customers) && customers.map(c => (
            <div key={c.id} className="glass-card p-4 cursor-pointer" onClick={() => openDetail(c.id)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-brand-600/15 flex items-center justify-center font-outfit font-800 text-brand-400 text-lg">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <button onClick={e => {e.stopPropagation(); openEdit(c)}}
                  className="text-xs text-text-muted hover:text-brand-400 border border-bg-border rounded-lg px-2 py-1">Edit</button>
              </div>
              <p className="font-outfit font-700 text-text-primary text-[17px] truncate">{c.name}</p>
              <div className="flex items-center gap-2 mt-1 text-text-muted text-sm"><Phone size={13}/>{c.mobile}</div>
              {c.email && <div className="flex items-center gap-2 mt-1 text-text-muted text-sm"><Mail size={13}/><span className="truncate">{c.email}</span></div>}
              {(c.city||c.state) && <div className="flex items-center gap-2 mt-1 text-text-muted text-sm"><MapPin size={13}/>{[c.city,c.state].filter(Boolean).join(', ')}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-bg-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-600/15 flex items-center justify-center font-outfit font-800 text-brand-400 text-xl">{detail.name.charAt(0)}</div>
                <div><h2 className="text-xl font-outfit font-700">{detail.name}</h2><p className="text-text-muted text-sm">{detail.mobile}</p></div>
              </div>
              <button onClick={() => setDetail(null)}><X size={20} className="text-text-muted"/></button>
            </div>
            <div className="p-5 space-y-3">
              {detail.gstin && <Row label="GSTIN" value={detail.gstin}/>}
              {detail.email && <Row label="Email" value={detail.email}/>}
              {detail.address && <Row label="Address" value={detail.address}/>}
              {detail.city && <Row label="City/State" value={`${detail.city}, ${detail.state}`}/>}
              <div className="divider"/>
              <div className="flex items-center justify-between">
                <h3 className="font-outfit font-700">Orders ({detail.orders.length})</h3>
                <Link to={`/orders/new?customer=${detail.id}`} className="btn-primary text-sm py-2 px-3"><Plus size={14}/>New Order</Link>
              </div>
              {Array.isArray(detail.orders) && detail.orders.length === 0
                ? <p className="text-text-muted text-sm text-center py-3">No orders yet</p>
                : Array.isArray(detail.orders) && detail.orders.map(o => (
                  <Link key={o.id} to={`/orders/${o.id}`}
                    className="flex items-center justify-between p-3 bg-bg-elevated rounded-xl hover:bg-bg-border transition-all">
                    <span className="text-sm font-medium">#{o.order_number}</span>
                    <span className={`badge ${STATUS_COLOR[o.status]}`}>{o.status}</span>
                    <span className="text-text-muted text-xs">{new Date(o.created_at).toLocaleDateString('en-IN')}</span>
                  </Link>
                ))
              }
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setDetail(null); openEdit(detail) }} className="btn-secondary flex-1">Edit</button>
                <button onClick={() => handleDelete(detail.id, detail.name)} className="btn-danger flex-1"><Trash2 size={16}/>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {drawerOpen && (
        <div className="modal-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-bg-border flex items-center justify-between">
              <h2 className="text-xl font-outfit font-700">{editingId ? 'Edit Customer' : 'Add Customer'}</h2>
              <button onClick={() => setDrawerOpen(false)}><X size={20} className="text-text-muted"/></button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Full Name *"><input className="form-input" placeholder="e.g. Ravi Kumar" value={form.name} onChange={F('name')}/></Field>
              <Field label="Mobile Number *"><input className="form-input" placeholder="10-digit mobile" value={form.mobile} onChange={F('mobile')} maxLength={10}/></Field>
              <Field label="Email"><input className="form-input" placeholder="email@example.com" value={form.email} onChange={F('email')}/></Field>
              <Field label="GSTIN"><input className="form-input" placeholder="15-digit GSTIN" value={form.gstin} onChange={e => setForm(f=>({...f,gstin:e.target.value.toUpperCase()}))} maxLength={15}/></Field>
              <Field label="Address"><textarea className="form-input resize-none" rows={2} value={form.address} onChange={F('address')}/></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City"><input className="form-input" placeholder="Chennai" value={form.city} onChange={F('city')}/></Field>
                <Field label="State"><input className="form-input" placeholder="Tamil Nadu" value={form.state} onChange={F('state')}/></Field>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setDrawerOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                  <Save size={16}/>{saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: {label:string; value:string}) {
  return <div className="flex gap-2"><span className="text-text-muted text-sm w-24 flex-shrink-0">{label}</span><span className="text-text-primary text-sm">{value}</span></div>
}
function Field({ label, children }: {label:string; children:React.ReactNode}) {
  return <div><label className="form-label">{label}</label>{children}</div>
}
