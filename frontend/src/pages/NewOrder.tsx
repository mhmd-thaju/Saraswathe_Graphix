import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Trash2, Save, Search, X, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { customersApi, ordersApi } from '@/lib/api'
import { calcLineAmount, calcGST, formatCurrency } from '@/lib/gst'
import type { Customer, LineItem } from '@/types'

type DraftItem = Omit<LineItem, 'id'|'order_id'|'created_at'>

const emptyItem = (): DraftItem => ({
  description:'', hsn_code:'4911', quantity:1, unit:'pcs', unit_price:0, gst_rate:18, amount:0
})

const EMPTY_CUST = { name:'', mobile:'', email:'', gstin:'', address:'', city:'', state:'Tamil Nadu' }

export default function NewOrder() {
  const navigate      = useNavigate()
  const [params]      = useSearchParams()
  const [customers, setCustomers]     = useState<Customer[]>([])
  const [custSearch, setCustSearch]   = useState('')
  const [customer, setCustomer]       = useState<Customer | null>(null)
  const [showCustDrop, setShowCustDrop] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCust, setNewCust]         = useState({...EMPTY_CUST})
  const [gstType, setGstType]         = useState<'intra'|'inter'>('intra')
  const [items, setItems]             = useState<DraftItem[]>([emptyItem()])
  const [notes, setNotes]             = useState('')
  const [dueDate, setDueDate]         = useState('')
  const [priority, setPriority]       = useState('normal')
  const [saving, setSaving]           = useState(false)

  // Pre-fill from URL params (Customer or Edit mode)
  useEffect(() => {
    const cid = params.get('customer')
    const editId = params.get('edit')
    
    if (cid) {
      customersApi.get(cid).then(c => setCustomer(c))
    } else if (editId) {
      ordersApi.get(editId).then(o => {
        setCustomer(o.customer)
        setGstType(o.gst_type as any)
        setNotes(o.notes || '')
        setDueDate(o.due_date || '')
        setPriority(o.priority)
        setItems(o.line_items.map(li => ({
          description: li.description,
          hsn_code: li.hsn_code,
          quantity: li.quantity,
          unit: li.unit,
          unit_price: li.unit_price,
          gst_rate: li.gst_rate,
          amount: li.amount
        })))
      })
    }
  }, [params])

  // Customer search
  useEffect(() => {
    if (!custSearch.trim()) { setCustomers([]); return }
    const t = setTimeout(() => {
      const isMobile = /^\d+$/.test(custSearch)
      customersApi.search(isMobile ? custSearch : undefined, isMobile ? undefined : custSearch)
        .then(setCustomers)
    }, 300)
    return () => clearTimeout(t)
  }, [custSearch])

  // Recalc amounts
  const itemsWithAmt = items.map(it => ({...it, amount: calcLineAmount(it.quantity, it.unit_price)}))
  const gst = calcGST(itemsWithAmt, gstType)

  function updateItem(i: number, k: keyof DraftItem, val: string | number) {
    setItems(prev => prev.map((it, idx) => idx === i ? {...it, [k]: val} : it))
  }

  function addItem()    { setItems(p => [...p, emptyItem()]) }
  function removeItem(i: number) { setItems(p => p.filter((_,idx) => idx !== i)) }

  async function handleWalkIn() {
    try {
      const walkin = await customersApi.search(undefined, 'Walk-in')
      if (walkin.length > 0) {
        setCustomer(walkin[0])
      } else {
        const created = await customersApi.create({ ...EMPTY_CUST, name: 'Walk-in Customer', mobile: '0000000000' })
        setCustomer(created)
      }
      setShowCustDrop(false)
      setCustSearch('')
    } catch (e) {
      toast.error('Failed to set walk-in customer')
    }
  }

  async function handleCreateCustomer() {
    if (!newCust.name.trim() || !newCust.mobile.trim()) {
      toast.error('Name and mobile are required'); return
    }
    try {
      const created = await customersApi.create(newCust)
      setCustomer(created)
      setShowAddModal(false)
      setNewCust({...EMPTY_CUST})
      toast.success('Customer created')
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to create customer')
    }
  }

  async function handleSubmit() {
    if (!customer) { toast.error('Please select a customer'); return }
    if (items.some(it => !it.description.trim())) { toast.error('All line items need a description'); return }
    if (items.some(it => it.unit_price <= 0)) { toast.error('All prices must be greater than 0'); return }
    setSaving(true)
    try {
      const editId = params.get('edit')
      const payload = {
        customer_id: customer.id,
        gst_type: gstType,
        notes, due_date: dueDate || undefined, priority,
        line_items: itemsWithAmt,
      }

      if (editId) {
        await ordersApi.update(editId, payload)
        toast.success(`Order updated!`)
        navigate(`/orders/${editId}`)
      } else {
        const order = await ordersApi.create(payload)
        toast.success(`Order #${order.order_number} created!`)
        navigate(`/orders/${order.id}`)
      }
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to save order')
    } finally { setSaving(false) }
  }

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">{params.get('edit') ? 'Edit Order' : 'New Order'}</h1>
        <button onClick={() => navigate('/orders')} className="btn-secondary"><X size={16}/>Cancel</button>
      </div>

      <div className="space-y-5">
        {/* Customer Selection */}
        <div className="glass-card p-5 relative z-30">
          <h2 className="font-outfit font-700 text-lg mb-4">Customer</h2>
          {customer ? (
            <div className="flex items-center justify-between p-3 bg-brand-600/10 border border-brand-600/30 rounded-xl">
              <div>
                <p className="font-medium text-text-primary">{customer.name}</p>
                <p className="text-text-muted text-sm">{customer.mobile}</p>
              </div>
              <button onClick={() => setCustomer(null)} className="text-text-muted hover:text-danger"><X size={18}/></button>
            </div>
          ) : (
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"/>
              <input className="form-input pl-10"
                placeholder="Search customer by name or mobile…"
                value={custSearch}
                onChange={e => { setCustSearch(e.target.value); setShowCustDrop(true) }}
                onFocus={() => setShowCustDrop(true)}/>
              
              {showCustDrop && (custSearch.trim() || customers.length > 0) && (
                <div className="absolute z-50 w-full mt-1 bg-bg-elevated border border-bg-border rounded-xl overflow-hidden shadow-card">
                  {customers.map(c => (
                    <button key={c.id} className="w-full text-left px-4 py-3 hover:bg-bg-border border-b border-bg-border/50 transition-colors"
                      onClick={() => { setCustomer(c); setCustSearch(''); setShowCustDrop(false) }}>
                      <p className="text-text-primary font-medium">{c.name}</p>
                      <p className="text-text-muted text-sm flex items-center gap-1">
                        <Search size={12}/> {c.mobile}
                      </p>
                    </button>
                  ))}
                  
                  {/* Action Options */}
                  <div className="bg-bg-base p-2 grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-brand-600/20 text-brand-400 hover:bg-brand-600/30 transition-all text-sm font-medium"
                    >
                      <Plus size={14}/> New Customer
                    </button>
                    <button 
                      onClick={handleWalkIn}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-bg-border text-text-muted hover:text-text-primary transition-all text-sm font-medium"
                    >
                      <Users size={14}/> Walk-in
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Job Details */}
        <div className="glass-card p-5 relative z-20">
          <h2 className="font-outfit font-700 text-lg mb-4">Job Details</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">GST Type</label>
              <select className="form-input" value={gstType} onChange={e => setGstType(e.target.value as any)}>
                <option value="intra">Intra-State (CGST+SGST)</option>
                <option value="inter">Inter-State (IGST)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)}/>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select className="form-input" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="form-label">Notes</label>
            <textarea className="form-input resize-none" rows={2} placeholder="Any special instructions…"
              value={notes} onChange={e => setNotes(e.target.value)}/>
          </div>
        </div>

        {/* Line Items */}
        <div className="glass-card p-5 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-outfit font-700 text-lg">Line Items</h2>
            <button onClick={addItem} className="btn-secondary text-sm py-2 px-3"><Plus size={15}/>Add Item</button>
          </div>

          <div className="space-y-3">
            {itemsWithAmt.map((it, i) => (
              <div key={i} className="bg-bg-elevated rounded-xl p-4 border border-bg-border">
                <div className="flex gap-2 mb-3">
                  <div className="flex-1">
                    <label className="form-label">Description *</label>
                    <input className="form-input" placeholder="e.g. Flex Banner 10x4 ft"
                      value={it.description} onChange={e => updateItem(i,'description',e.target.value)}/>
                  </div>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="btn-danger px-3 mt-6 self-start">
                      <Trash2 size={15}/>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="form-label">HSN Code</label>
                    <input className="form-input" value={it.hsn_code} onChange={e => updateItem(i,'hsn_code',e.target.value)}/>
                  </div>
                  <div>
                    <label className="form-label">Qty</label>
                    <input type="number" className="form-input" min={0.01} step={0.01}
                      value={it.quantity} onChange={e => updateItem(i,'quantity',+e.target.value)}/>
                  </div>
                  <div>
                    <label className="form-label">Unit</label>
                    <select className="form-input" value={it.unit} onChange={e => updateItem(i,'unit',e.target.value)}>
                      {['pcs','sqft','sqm','job','set','kg','mtr'].map(u=><option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Unit Price (₹)</label>
                    <input type="number" className="form-input" min={0} step={0.01}
                      value={it.unit_price} onChange={e => updateItem(i,'unit_price',+e.target.value)}/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="form-label">GST Rate (%)</label>
                    <select className="form-input" value={it.gst_rate} onChange={e => updateItem(i,'gst_rate',+e.target.value)}>
                      {[0,5,12,18,28].map(r=><option key={r} value={r}>{r}%</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Amount</label>
                    <div className="form-input bg-bg-base text-text-primary font-outfit font-700">
                      {formatCurrency(it.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* GST Summary */}
          <div className="mt-5 pt-4 border-t border-bg-border">
            <div className="flex flex-col gap-2 items-end text-sm">
              <div className="flex justify-between w-64"><span className="text-text-muted">Subtotal</span><span className="font-medium">{formatCurrency(gst.subtotal)}</span></div>
              {gstType==='intra' ? <>
                <div className="flex justify-between w-64"><span className="text-text-muted">CGST</span><span>{formatCurrency(gst.cgst_amount)}</span></div>
                <div className="flex justify-between w-64"><span className="text-text-muted">SGST</span><span>{formatCurrency(gst.sgst_amount)}</span></div>
              </> : (
                <div className="flex justify-between w-64"><span className="text-text-muted">IGST</span><span>{formatCurrency(gst.igst_amount)}</span></div>
              )}
              <div className="flex justify-between w-64 pt-2 border-t border-bg-border">
                <span className="font-outfit font-700 text-text-primary text-base">Total</span>
                <span className="font-outfit font-800 text-brand-400 text-lg">{formatCurrency(gst.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button onClick={() => navigate('/orders')} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">
            <Save size={18}/>{saving ? 'Saving…' : (params.get('edit') ? 'Update Order' : 'Create Order')}
          </button>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-bg-border flex items-center justify-between">
              <h2 className="text-xl font-outfit font-700">Quick Add Customer</h2>
              <button onClick={() => setShowAddModal(false)}><X size={20} className="text-text-muted"/></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="Name" value={newCust.name} 
                  onChange={e => setNewCust(n => ({...n, name: e.target.value}))}/>
              </div>
              <div>
                <label className="form-label">Mobile Number *</label>
                <input className="form-input" placeholder="10-digit mobile" value={newCust.mobile} 
                  onChange={e => setNewCust(n => ({...n, mobile: e.target.value}))} maxLength={10}/>
              </div>
              <div>
                <label className="form-label">GSTIN</label>
                <input className="form-input" placeholder="Optional" value={newCust.gstin} 
                  onChange={e => setNewCust(n => ({...n, gstin: e.target.value.toUpperCase()}))}/>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleCreateCustomer} className="btn-primary flex-1">Create & Select</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
