import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, ShoppingBag, Clock, CheckCircle2,
  TrendingUp, Plus, ArrowRight, Printer
} from 'lucide-react'
import { ordersApi, customersApi } from '@/lib/api'
import { formatCurrency } from '@/lib/gst'
import type { KanbanCard, Customer } from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { startOfDay, format, subDays, isSameDay } from 'date-fns'

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

export default function Dashboard() {
  const [orders, setOrders]       = useState<KanbanCard[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([ordersApi.kanban(), customersApi.list()])
      .then(([o, c]) => { setOrders(o); setCustomers(c) })
      .finally(() => setLoading(false))
  }, [])

  const counts = {
    new:       orders.filter(o => o.status === 'new').length,
    designing: orders.filter(o => o.status === 'designing').length,
    printing:  orders.filter(o => o.status === 'printing').length,
    ready:     orders.filter(o => o.status === 'ready').length,
  }

  const totalRevenue   = orders.reduce((s, o) => s + o.total_amount, 0)
  const activeJobs     = orders.filter(o => o.status !== 'ready').length
  const urgentOrders   = orders.filter(o => o.priority === 'urgent' || o.priority === 'high')
  const recentOrders   = [...orders].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5)

  // Chart Data: Last 7 Days Revenue
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dayTotal = orders
      .filter(o => isSameDay(new Date(o.created_at), date))
      .reduce((sum, o) => sum + o.total_amount, 0)
    return {
      name: format(date, 'EEE'),
      total: dayTotal,
      rawDate: date
    }
  })

  const stats = [
    { label: 'Total Customers', value: customers.length, icon: Users,        color: 'text-brand-400', bg: 'bg-brand-600/10' },
    { label: 'Active Jobs',     value: activeJobs,        icon: Clock,        color: 'text-warning',   bg: 'bg-warning/10' },
    { label: 'Ready Pickup',    value: counts.ready,      icon: CheckCircle2, color: 'text-success',   bg: 'bg-success/10' },
    { label: 'Total Revenue',   value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-warm-400', bg: 'bg-warm-500/10', isText: true },
  ]

  if (loading) return <LoadingSkeleton />

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Printer className="text-brand-400" size={28} />
            Dashboard
          </h1>
          <p className="text-text-muted mt-1">Welcome back — here's what's happening today.</p>
        </div>
        <Link to="/orders/new" className="btn-primary">
          <Plus size={18} /> New Order
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="stat-card animate-slide-up">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <p className={`font-outfit font-700 text-2xl ${s.isText ? 'text-lg' : ''} text-text-primary`}>
                {s.value}
              </p>
              <p className="text-text-muted text-sm">{s.label}</p>
            </div>
          </div>
        ))}
      </div>


      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Kanban Status Overview */}
        <div className="glass-card p-5 lg:col-span-1">
          <h2 className="text-lg font-outfit font-700 text-text-primary mb-4">Job Pipeline</h2>
          <div className="grid grid-cols-2 gap-3">
            {([
              { label: 'New',      count: counts.new,       color: 'border-info',    bg: 'bg-info/10',          tc: 'text-info' },
              { label: 'Design',   count: counts.designing, color: 'border-brand-500', bg: 'bg-brand-600/10',   tc: 'text-brand-400' },
              { label: 'Print',    count: counts.printing,  color: 'border-warning', bg: 'bg-warning/10',       tc: 'text-warning' },
              { label: 'Ready',    count: counts.ready,     color: 'border-success', bg: 'bg-success/10',       tc: 'text-success' },
            ] as const).map(col => (
              <div key={col.label} className={`rounded-xl border-2 ${col.color} ${col.bg} p-3 text-center`}>
                <p className={`text-2xl font-outfit font-800 ${col.tc}`}>{col.count}</p>
                <p className="text-text-muted text-xs mt-0.5">{col.label}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Link to="/kanban" className="text-brand-400 text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Open Board <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-outfit font-700 text-text-primary">Revenue Trends</h2>
            <p className="text-xs text-text-muted italic">Last 7 Days (Excl. GST)</p>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ 
                    backgroundColor: '#1e1e2d', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                  itemStyle={{ color: '#7c3aed' }}
                  formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.total > 0 ? '#7c3aed' : '#334155'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-outfit font-700 text-text-primary">Recent Orders</h2>
            <Link to="/orders" className="text-brand-400 text-sm flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentOrders.length === 0 && (
              <p className="text-text-muted text-sm text-center py-4">No orders yet.</p>
            )}
            {recentOrders.map(o => (
              <Link key={o.id} to={`/orders/${o.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated hover:bg-bg-border transition-all group">
                <div className="w-9 h-9 rounded-lg bg-brand-600/15 flex items-center justify-center text-brand-400 font-outfit font-700 text-sm flex-shrink-0">
                  #{o.order_number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">{o.customer_name}</p>
                  <p className="text-text-muted text-xs truncate">{o.job_title}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`badge ${STATUS_COLOR[o.status]}`}>{o.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Urgent / High Priority */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-outfit font-700 text-text-primary">🔥 Priority Jobs</h2>
            <Link to="/kanban" className="text-brand-400 text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Board <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {urgentOrders.length === 0 && (
              <p className="text-text-muted text-sm text-center py-4">No urgent/high priority jobs. 🎉</p>
            )}
            {urgentOrders.slice(0, 5).map(o => (
              <Link key={o.id} to={`/orders/${o.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated hover:bg-bg-border transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-text-primary text-sm font-medium">#{o.order_number}</span>
                    <span className={`badge ${PRIORITY_COLOR[o.priority]}`}>{o.priority}</span>
                  </div>
                  <p className="text-text-muted text-xs truncate">{o.customer_name} — {o.job_title}</p>
                </div>
                <div className="text-right text-xs text-text-muted flex-shrink-0">
                  {o.due_date && (
                    <span className={new Date(o.due_date) < new Date() ? 'text-danger font-medium' : ''}>
                      {new Date(o.due_date).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-bg-elevated rounded-xl w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-bg-elevated rounded-2xl" />)}
      </div>
      <div className="h-40 bg-bg-elevated rounded-2xl" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-64 bg-bg-elevated rounded-2xl" />
        <div className="h-64 bg-bg-elevated rounded-2xl" />
      </div>
    </div>
  )
}
