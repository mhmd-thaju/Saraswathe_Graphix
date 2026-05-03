import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Plus, Filter, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ordersApi } from '@/lib/api'
import { formatCurrency } from '@/lib/gst'
import type { OrderSummary, OrderStatus } from '@/types'

const STATUSES: { value: string; label: string }[] = [
  { value: '',          label: 'All Orders' },
  { value: 'new',       label: 'New' },
  { value: 'designing', label: 'Designing' },
  { value: 'printing',  label: 'Printing' },
  { value: 'ready',     label: 'Ready' },
]

const STATUS_COLOR: Record<string, string> = {
  new:       'bg-info/15 text-info',
  designing: 'bg-brand-600/15 text-brand-400',
  printing:  'bg-warning/15 text-warning',
  ready:     'bg-success/15 text-success',
}
const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'bg-danger/15 text-danger',
  high:   'bg-warm-500/15 text-warm-400',
  normal: 'bg-bg-border text-text-muted',
  low:    'bg-bg-border text-text-faint',
}

export default function Orders() {
  const navigate                = useNavigate()
  const [orders, setOrders]     = useState<OrderSummary[]>([])
  const [filter, setFilter]     = useState('')
  const [loading, setLoading]   = useState(true)

  const load = useCallback((status = filter) => {
    setLoading(true)
    ordersApi.list(status || undefined).then(setOrders).finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string, num: number) {
    if (!confirm(`Delete Order #${num}?`)) return
    try {
      await ordersApi.delete(id)
      toast.success('Deleted')
      load()
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><ShoppingBag size={26} className="text-brand-400"/>Orders</h1>
          <p className="text-text-muted mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/orders/new" className="btn-primary"><Plus size={18}/>New Order</Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <Filter size={16} className="text-text-muted flex-shrink-0 mt-3"/>
        {STATUSES.map(s => (
          <button key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
              ${filter === s.value
                ? 'bg-brand-600 text-white'
                : 'bg-bg-elevated text-text-muted hover:text-text-primary border border-bg-border'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[...Array(5)].map((_,i) => <div key={i} className="h-14 bg-bg-elevated rounded-xl"/>)}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag size={48} className="text-text-faint mx-auto mb-3"/>
            <p className="text-text-muted text-lg">No orders found</p>
            <Link to="/orders/new" className="btn-primary mt-4 inline-flex"><Plus size={16}/>Create First Order</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th className="hidden md:table-cell">Status</th>
                  <th className="hidden sm:table-cell">Priority</th>
                  <th>Amount</th>
                  <th className="hidden lg:table-cell">Due Date</th>
                  <th className="hidden md:table-cell">Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)}
                    className="cursor-pointer hover:bg-bg-elevated/50 transition-colors">
                    <td className="font-outfit font-700 text-brand-400">#{o.order_number}</td>
                    <td>
                      <div className="md:hidden">
                        <span className={`badge ${STATUS_COLOR[o.status]} mr-2`}>{o.status}</span>
                      </div>
                      <span className="text-text-primary font-medium">{o.customer_name}</span>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className={`badge ${STATUS_COLOR[o.status]}`}>{o.status}</span>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className={`badge ${PRIORITY_COLOR[o.priority]}`}>{o.priority}</span>
                    </td>
                    <td className="font-outfit font-700 text-text-primary">{formatCurrency(o.total_amount)}</td>
                    <td className="hidden lg:table-cell text-text-muted text-sm">
                      {o.due_date
                        ? <span className={new Date(o.due_date) < new Date() && o.status !== 'ready' ? 'text-danger font-medium' : ''}>
                            {new Date(o.due_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
                          </span>
                        : '—'}
                    </td>
                    <td className="hidden md:table-cell text-text-muted text-sm">
                      {new Date(o.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="text-right">
                      <span className="text-brand-400 font-medium text-sm">View →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
