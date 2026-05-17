// ============================================================
// PrintFlow ERP — Local Storage Offline API
// ============================================================
import { v4 as uuidv4 } from 'uuid'
import type {
  Customer, CustomerWithOrders, Order, OrderSummary,
  KanbanCard, NotificationLog, Setting, LineItem, GSTType
} from '@/types'
import { calcGST, calcLineAmount } from './gst'

// Dummy axios instance for compatibility if imported elsewhere
export const api = {
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
}
export default api

// --- Storage Helpers ---
const getStore = <T>(key: string, defaultVal: T): T => {
  const val = localStorage.getItem(key)
  return val ? JSON.parse(val) : defaultVal
}

const setStore = <T>(key: string, val: T) => {
  localStorage.setItem(key, JSON.stringify(val))
}

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

// --- Data Models ---
const storeKeys = {
  customers: 'printflow_customers',
  orders: 'printflow_orders',
  settings: 'printflow_settings',
  notifications: 'printflow_notifications'
}

// ── Customers ─────────────────────────────────────────────
export const customersApi = {
  list: async (): Promise<Customer[]> => {
    await delay()
    return getStore<Customer[]>(storeKeys.customers, [])
  },

  search: async (mobile?: string, name?: string): Promise<Customer[]> => {
    await delay()
    let customers = getStore<Customer[]>(storeKeys.customers, [])
    if (mobile) customers = customers.filter(c => c.mobile.includes(mobile))
    if (name) customers = customers.filter(c => c.name.toLowerCase().includes(name.toLowerCase()))
    return customers
  },

  get: async (id: string): Promise<CustomerWithOrders> => {
    await delay()
    const customers = getStore<Customer[]>(storeKeys.customers, [])
    const orders = getStore<Order[]>(storeKeys.orders, [])
    const customer = customers.find(c => c.id === id)
    if (!customer) throw new Error('Customer not found')
    
    const customerOrders = orders.filter(o => o.customer_id === id).map(o => ({
      id: o.id,
      order_number: o.order_number,
      customer_name: customer.name,
      status: o.status,
      priority: o.priority,
      total_amount: o.total_amount,
      due_date: o.due_date,
      created_at: o.created_at
    }))
    
    return { ...customer, orders: customerOrders }
  },

  create: async (payload: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
    await delay()
    const customers = getStore<Customer[]>(storeKeys.customers, [])
    const newCustomer: Customer = {
      ...payload,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    customers.push(newCustomer)
    setStore(storeKeys.customers, customers)
    return newCustomer
  },

  update: async (id: string, payload: Partial<Customer>): Promise<Customer> => {
    await delay()
    const customers = getStore<Customer[]>(storeKeys.customers, [])
    const index = customers.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Customer not found')
    
    customers[index] = { ...customers[index], ...payload, updated_at: new Date().toISOString() }
    setStore(storeKeys.customers, customers)
    return customers[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const customers = getStore<Customer[]>(storeKeys.customers, [])
    setStore(storeKeys.customers, customers.filter(c => c.id !== id))
  },
}

// ── Orders ────────────────────────────────────────────────
export const ordersApi = {
  list: async (status?: string): Promise<OrderSummary[]> => {
    await delay()
    let orders = getStore<Order[]>(storeKeys.orders, [])
    const customers = getStore<Customer[]>(storeKeys.customers, [])
    
    if (status) orders = orders.filter(o => o.status === status)
    
    return orders.map(o => {
      const customer = customers.find(c => c.id === o.customer_id)
      return {
        id: o.id,
        order_number: o.order_number,
        customer_name: customer ? customer.name : 'Unknown',
        status: o.status,
        priority: o.priority,
        total_amount: o.total_amount,
        due_date: o.due_date,
        created_at: o.created_at
      }
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  kanban: async (): Promise<KanbanCard[]> => {
    await delay()
    const orders = getStore<Order[]>(storeKeys.orders, [])
    const customers = getStore<Customer[]>(storeKeys.customers, [])
    
    return orders.filter(o => o.status !== 'ready').map(o => {
      const customer = customers.find(c => c.id === o.customer_id)
      return {
        id: o.id,
        order_number: o.order_number,
        customer_name: customer ? customer.name : 'Unknown',
        customer_mobile: customer ? customer.mobile : '',
        status: o.status,
        priority: o.priority,
        job_title: o.line_items[0]?.description || 'Unnamed Job',
        total_amount: o.total_amount,
        due_date: o.due_date,
        created_at: o.created_at
      }
    })
  },

  get: async (id: string): Promise<Order> => {
    await delay()
    const orders = getStore<Order[]>(storeKeys.orders, [])
    const customers = getStore<Customer[]>(storeKeys.customers, [])
    const order = orders.find(o => o.id === id)
    if (!order) throw new Error('Order not found')
    
    const customer = customers.find(c => c.id === order.customer_id)
    return { ...order, customer: customer as Customer }
  },

  create: async (payload: any): Promise<Order> => {
    await delay()
    const orders = getStore<Order[]>(storeKeys.orders, [])
    const customers = getStore<Customer[]>(storeKeys.customers, [])
    const customer = customers.find(c => c.id === payload.customer_id)
    
    const items = payload.line_items.map((i: any) => ({
      ...i,
      id: uuidv4(),
      amount: calcLineAmount(i.quantity, i.unit_price)
    }))
    
    const gstInfo = calcGST(items, payload.gst_type as GSTType)
    
    const maxOrderNum = orders.reduce((max, o) => Math.max(max, o.order_number), 1000)
    
    const newOrder: Order = {
      id: uuidv4(),
      order_number: maxOrderNum + 1,
      customer_id: payload.customer_id,
      customer: customer as Customer,
      status: 'new',
      gst_type: payload.gst_type,
      subtotal: gstInfo.subtotal,
      cgst_amount: gstInfo.cgst_amount,
      sgst_amount: gstInfo.sgst_amount,
      igst_amount: gstInfo.igst_amount,
      total_amount: gstInfo.total,
      notes: payload.notes,
      due_date: payload.due_date,
      priority: payload.priority,
      line_items: items,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    orders.push(newOrder)
    setStore(storeKeys.orders, orders)
    return newOrder
  },

  updateStatus: async (id: string, status: string): Promise<Order> => {
    await delay()
    const orders = getStore<Order[]>(storeKeys.orders, [])
    const index = orders.findIndex(o => o.id === id)
    if (index === -1) throw new Error('Order not found')
    
    orders[index].status = status as any
    orders[index].updated_at = new Date().toISOString()
    setStore(storeKeys.orders, orders)
    return orders[index]
  },

  update: async (id: string, payload: any): Promise<Order> => {
    await delay()
    const orders = getStore<Order[]>(storeKeys.orders, [])
    const index = orders.findIndex(o => o.id === id)
    if (index === -1) throw new Error('Order not found')
    
    const items = payload.line_items.map((i: any) => ({
      ...i,
      id: i.id || uuidv4(),
      amount: calcLineAmount(i.quantity, i.unit_price)
    }))
    
    const gstInfo = calcGST(items, payload.gst_type as GSTType)
    
    orders[index] = {
      ...orders[index],
      ...payload,
      line_items: items,
      subtotal: gstInfo.subtotal,
      cgst_amount: gstInfo.cgst_amount,
      sgst_amount: gstInfo.sgst_amount,
      igst_amount: gstInfo.igst_amount,
      total_amount: gstInfo.total,
      updated_at: new Date().toISOString()
    }
    setStore(storeKeys.orders, orders)
    return orders[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const orders = getStore<Order[]>(storeKeys.orders, [])
    setStore(storeKeys.orders, orders.filter(o => o.id !== id))
  },
}

// ── Notifications ─────────────────────────────────────────
export const notificationsApi = {
  log: async (payload: { order_id: string; channel: string; message: string }): Promise<NotificationLog> => {
    await delay()
    const notifs = getStore<NotificationLog[]>(storeKeys.notifications, [])
    const log: NotificationLog = {
      id: uuidv4(),
      order_id: payload.order_id,
      channel: payload.channel as any,
      message: payload.message,
      sent_by: 'system',
      sent_at: new Date().toISOString()
    }
    notifs.push(log)
    setStore(storeKeys.notifications, notifs)
    return log
  },

  getByOrder: async (orderId: string): Promise<NotificationLog[]> => {
    await delay()
    const notifs = getStore<NotificationLog[]>(storeKeys.notifications, [])
    return notifs.filter(n => n.order_id === orderId)
  },

  whatsappLink: async (orderId: string, msgType: 'ready' | 'status' = 'ready'): Promise<{ link: string; message: string; mobile: string }> => {
    await delay()
    const orders = getStore<Order[]>(storeKeys.orders, [])
    const customers = getStore<Customer[]>(storeKeys.customers, [])
    
    const order = orders.find(o => o.id === orderId)
    if (!order) throw new Error('Order not found')
    const customer = customers.find(c => c.id === order.customer_id)
    if (!customer) throw new Error('Customer not found')

    const message = `Hello ${customer.name}, your order #${order.order_number} is ${msgType === 'ready' ? 'ready for pickup' : 'currently: ' + order.status}.`
    const link = `https://wa.me/91${customer.mobile}?text=${encodeURIComponent(message)}`
    
    return { link, message, mobile: customer.mobile }
  },
}

// ── Settings ──────────────────────────────────────────────
const defaultSettings: Setting[] = [
  { key: 'shop_name', value: 'Saraswathe Graphix' },
  { key: 'shop_state_code', value: '33' },
  { key: 'shop_state', value: 'Tamil Nadu' },
  { key: 'invoice_prefix', value: 'SGX' },
  { key: 'default_gst_rate', value: '18' },
  { key: 'default_gst_type', value: 'intra' },
]

export const settingsApi = {
  getAll: async (): Promise<Setting[]> => {
    await delay()
    const stored = getStore<Setting[]>(storeKeys.settings, [])
    // Merge defaults
    const merged = [...defaultSettings]
    for (const s of stored) {
      const idx = merged.findIndex(m => m.key === s.key)
      if (idx !== -1) merged[idx] = s
      else merged.push(s)
    }
    return merged
  },

  update: async (key: string, value: string): Promise<Setting> => {
    await delay()
    const stored = getStore<Setting[]>(storeKeys.settings, [])
    const idx = stored.findIndex(s => s.key === key)
    const newSetting = { key, value, updated_at: new Date().toISOString() }
    
    if (idx !== -1) stored[idx] = newSetting
    else stored.push(newSetting)
    
    setStore(storeKeys.settings, stored)
    return newSetting
  },

  bulkUpdate: async (payload: Record<string, string>): Promise<Setting[]> => {
    await delay()
    const stored = getStore<Setting[]>(storeKeys.settings, [])
    const updated: Setting[] = []
    
    for (const [key, value] of Object.entries(payload)) {
      const idx = stored.findIndex(s => s.key === key)
      const newSetting = { key, value, updated_at: new Date().toISOString() }
      if (idx !== -1) stored[idx] = newSetting
      else stored.push(newSetting)
      updated.push(newSetting)
    }
    
    setStore(storeKeys.settings, stored)
    return updated
  },
}

// ── Backup ────────────────────────────────────────────────
export const backupApi = {
  trigger: async () => {
    await delay(1000)
    return { success: true, message: 'Local backup is not supported in browser-only mode.' }
  },

  status: async () => {
    return { last_backup: null, status: 'disabled' }
  },
}
