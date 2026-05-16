import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Download, MessageSquare, Mail, Trash2, ChevronDown, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ordersApi, notificationsApi, settingsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/gst'
import { generateInvoicePDF } from '@/lib/pdf'
import { buildWhatsAppLink, buildEmailLink, readyMessage, statusMessage } from '@/lib/notify'
import type { Order, ShopSettings, OrderStatus, NotificationLog } from '@/types'

const STATUS_STEPS: OrderStatus[] = ['new','designing','printing','ready']
const STATUS_LABEL: Record<string,string> = { new:'New', designing:'Designing', printing:'Printing', ready:'Ready for Pickup' }
const STATUS_COLOR: Record<string,string> = {
  new:'border-info text-info', designing:'border-brand-400 text-brand-400',
  printing:'border-warning text-warning', ready:'border-success text-success',
}
const PRIORITY_COLOR: Record<string,string> = {
  urgent:'bg-danger/15 text-danger', high:'bg-warm-500/15 text-warm-400',
  normal:'bg-bg-border text-text-muted', low:'bg-bg-border text-text-faint',
}

export default function OrderDetail() {
  const { id }      = useParams<{id:string}>()
  const navigate    = useNavigate()
  const [order, setOrder]   = useState<Order | null>(null)
  const [shop, setShop]     = useState<Partial<ShopSettings>>({})
  const [logs, setLogs]     = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      ordersApi.get(id),
      settingsApi.getAll(),
      notificationsApi.getByOrder(id),
    ]).then(([o, settings, notifs]) => {
      setOrder(o)
      setLogs(Array.isArray(notifs) ? notifs : [])
      const m: Record<string,string> = {}
      if (Array.isArray(settings)) {
        settings.forEach(s => { m[s.key] = s.value })
      }
      setShop(m as unknown as ShopSettings)
    }).finally(() => setLoading(false))
  }, [id])

  async function changeStatus(status: string) {
    if (!order || status === order.status) return
    setStatusUpdating(true)
    try {
      const updated = await ordersApi.updateStatus(order.id, status)
      setOrder(updated); toast.success(`Status → ${STATUS_LABEL[status]}`)
    } catch { toast.error('Status update failed') }
    finally { setStatusUpdating(false) }
  }

  async function handleDelete() {
    if (!order) return
    if (!confirm(`Delete Order #${order.order_number}? This cannot be undone.`)) return
    await ordersApi.delete(order.id)
    toast.success('Order deleted'); navigate('/orders')
  }

  function downloadPDF() {
    if (!order) return
    try {
      generateInvoicePDF(order, {
        shop_name:     shop.shop_name     || 'Saraswathe Graphix',
        shop_gstin:    shop.shop_gstin    || '',
        shop_address:  shop.shop_address  || '',
        shop_city:     shop.shop_city     || '',
        shop_state:    shop.shop_state    || '',
        shop_mobile:   shop.shop_mobile   || '',
        shop_email:    shop.shop_email    || '',
        invoice_prefix:shop.invoice_prefix|| 'SGX',
      })
      toast.success('Invoice downloaded')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate PDF')
    }
  }

  async function notifyWhatsApp(type: 'ready' | 'status') {
    if (!order) return
    const jobTitle = order.line_items[0]?.description || order.notes || 'Print Job'
    const shopName = shop.shop_name || 'Saraswathe Graphix'
    const msg = type === 'ready'
      ? readyMessage(order.customer.name, order.order_number, jobTitle, shopName)
      : statusMessage(order.customer.name, order.order_number, order.status, shopName)
    const link = buildWhatsAppLink(order.customer.mobile, msg)
    window.open(link, '_blank')
    await notificationsApi.log({ order_id: order.id, channel: 'whatsapp', message: msg })
    notificationsApi.getByOrder(order.id).then(setLogs)
    toast.success('WhatsApp opened')
  }

  async function notifyEmail() {
    if (!order || !order.customer.email) { toast.error('No email address for this customer'); return }
    const jobTitle = order.line_items[0]?.description || order.notes || 'Print Job'
    const subject  = `Your Print Order #${order.order_number} is Ready!`
    const body     = `Dear ${order.customer.name},\n\nYour order (${jobTitle}) is ready for pickup at ${shop.shop_name || 'Saraswathe Graphix'}.\n\nThank you!`
    window.open(buildEmailLink(order.customer.email, subject, body))
    await notificationsApi.log({ order_id: order.id, channel: 'email', message: body })
    notificationsApi.getByOrder(order.id).then(setLogs)
    toast.success('Email client opened')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full"/></div>
  if (!order)  return <div className="text-center py-12 text-text-muted">Order not found.</div>

  const isIntra = order.gst_type === 'intra'

  return (
    <div className="animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/orders')} className="btn-secondary px-3"><ArrowLeft size={18}/></button>
        <div className="flex-1">
          <h1 className="page-title">Order #{order.order_number}</h1>
          <p className="text-text-muted text-sm">{new Date(order.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</p>
        </div>
        <span className={`badge border ${STATUS_COLOR[order.status]} text-sm`}>{STATUS_LABEL[order.status]}</span>
        <span className={`badge ${PRIORITY_COLOR[order.priority]}`}>{order.priority}</span>
      </div>

      {/* Status Stepper */}
      <div className="glass-card p-5 mb-5">
        <h2 className="font-outfit font-700 mb-4">Update Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STATUS_STEPS.map((s,i) => {
            const active  = order.status === s
            const done    = STATUS_STEPS.indexOf(order.status) > i
            return (
              <button key={s} onClick={() => changeStatus(s)} disabled={statusUpdating}
                className={`py-3 px-2 rounded-xl text-sm font-outfit font-700 transition-all border-2
                  ${active ? 'border-brand-600 bg-brand-600/15 text-brand-400'
                  : done   ? 'border-success/40 bg-success/10 text-success'
                  : 'border-bg-border text-text-muted hover:border-brand-600/40'}`}>
                {i+1}. {STATUS_LABEL[s].split(' ')[0]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Customer Info */}
      <div className="glass-card p-5 mb-5">
        <h2 className="font-outfit font-700 mb-3">Customer</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-primary font-medium text-lg">{order.customer.name}</p>
            <p className="text-text-muted">{order.customer.mobile}</p>
            {order.customer.email && <p className="text-text-muted text-sm">{order.customer.email}</p>}
            {order.customer.gstin && <p className="text-text-muted text-sm">GSTIN: {order.customer.gstin}</p>}
          </div>
          <Link to={`/crm`} className="btn-secondary text-sm py-2 px-3">View Profile</Link>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="glass-card overflow-hidden mb-5">
        <div className="p-5 border-b border-bg-border">
          <h2 className="font-outfit font-700">Line Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>GST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(order.line_items) && order.line_items.map(li => {
                const gstAmt = (li.amount * li.gst_rate) / 100
                return (
                  <tr key={li.id}>
                    <td className="font-medium">{li.description}</td>
                    <td className="text-text-muted">{li.hsn_code}</td>
                    <td>{li.quantity} {li.unit}</td>
                    <td>{formatCurrency(li.unit_price)}</td>
                    <td>{formatCurrency(li.amount)}</td>
                    <td className="text-text-muted">{li.gst_rate}%</td>
                    <td className="font-outfit font-700">{formatCurrency(li.amount + gstAmt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* GST Summary */}
        <div className="p-5 border-t border-bg-border flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            {isIntra ? <>
              <div className="flex justify-between"><span className="text-text-muted">CGST</span><span>{formatCurrency(order.cgst_amount)}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">SGST</span><span>{formatCurrency(order.sgst_amount)}</span></div>
            </> : (
              <div className="flex justify-between"><span className="text-text-muted">IGST</span><span>{formatCurrency(order.igst_amount)}</span></div>
            )}
            <div className="flex justify-between pt-2 border-t border-bg-border">
              <span className="font-outfit font-700 text-text-primary text-base">Grand Total</span>
              <span className="font-outfit font-800 text-brand-400 text-lg">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="glass-card p-5 mb-5">
          <p className="text-text-muted text-sm font-medium mb-1">Notes</p>
          <p className="text-text-primary">{order.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="glass-card p-5 mb-5">
        <h2 className="font-outfit font-700 mb-4">Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3">
          <button onClick={downloadPDF} className="btn-secondary w-full lg:w-auto"><Download size={18}/>Download Invoice</button>
          <button onClick={() => notifyWhatsApp('ready')} className="btn-whatsapp w-full lg:w-auto"><MessageSquare size={18}/>WhatsApp (Ready)</button>
          <button onClick={() => notifyWhatsApp('status')} className="btn-secondary w-full lg:w-auto"><MessageSquare size={18}/>WhatsApp (Status)</button>
          {order.customer.email && (
            <button onClick={notifyEmail} className="btn-secondary w-full lg:w-auto"><Mail size={18}/>Send Email</button>
          )}
          <Link to={`/orders/new?edit=${order.id}`} className="btn-secondary w-full lg:w-auto"><Edit3 size={18}/>Edit Order</Link>
          <button onClick={handleDelete} className="btn-danger w-full lg:w-auto lg:ml-auto"><Trash2 size={18}/>Delete Order</button>
        </div>
      </div>

      {/* Notification Log */}
      {logs.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-outfit font-700 mb-3">Notification Log</h2>
          <div className="space-y-2">
            {Array.isArray(logs) && logs.map(l => (
              <div key={l.id} className="flex items-start gap-3 p-3 bg-bg-elevated rounded-xl">
                <span className={`badge mt-0.5 ${l.channel==='whatsapp' ? 'bg-[#25D366]/15 text-[#25D366]' : 'bg-info/15 text-info'}`}>{l.channel}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm truncate-2">{l.message}</p>
                  <p className="text-text-muted text-xs mt-1">{new Date(l.sent_at).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
