// ============================================================
// PrintFlow ERP — Axios API Client
// ============================================================
import axios from 'axios'
import type {
  Customer, CustomerWithOrders, Order, OrderSummary,
  KanbanCard, NotificationLog, Setting, LineItem
} from '@/types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// ── Customers ─────────────────────────────────────────────
export const customersApi = {
  list: () =>
    api.get<Customer[]>('/customers').then(r => r.data),

  search: (mobile?: string, name?: string) =>
    api.get<Customer[]>('/customers/search', { params: { mobile, name } }).then(r => r.data),

  get: (id: string) =>
    api.get<CustomerWithOrders>(`/customers/${id}`).then(r => r.data),

  create: (payload: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Customer>('/customers', payload).then(r => r.data),

  update: (id: string, payload: Partial<Customer>) =>
    api.put<Customer>(`/customers/${id}`, payload).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/customers/${id}`),
}

// ── Orders ────────────────────────────────────────────────
export const ordersApi = {
  list: (status?: string) =>
    api.get<OrderSummary[]>('/orders', { params: status ? { status } : {} }).then(r => r.data),

  kanban: () =>
    api.get<KanbanCard[]>('/orders/kanban').then(r => r.data),

  get: (id: string) =>
    api.get<Order>(`/orders/${id}`).then(r => r.data),

  create: (payload: {
    customer_id: string
    gst_type: string
    notes?: string
    due_date?: string
    priority: string
    line_items: Omit<LineItem, 'id' | 'order_id' | 'amount' | 'created_at'>[]
  }) =>
    api.post<Order>('/orders', payload).then(r => r.data),

  updateStatus: (id: string, status: string) =>
    api.patch<Order>(`/orders/${id}/status`, { status }).then(r => r.data),

  update: (id: string, payload: {
    customer_id: string
    gst_type: string
    notes?: string
    due_date?: string
    priority: string
    line_items: Omit<LineItem, 'id' | 'order_id' | 'amount' | 'created_at'>[]
  }) =>
    api.put<Order>(`/orders/${id}`, payload).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/orders/${id}`),
}

// ── Notifications ─────────────────────────────────────────
export const notificationsApi = {
  log: (payload: { order_id: string; channel: string; message: string }) =>
    api.post<NotificationLog>('/notifications', payload).then(r => r.data),

  getByOrder: (orderId: string) =>
    api.get<NotificationLog[]>(`/notifications/order/${orderId}`).then(r => r.data),

  whatsappLink: (orderId: string, msgType: 'ready' | 'status' = 'ready') =>
    api.get<{ link: string; message: string; mobile: string }>(
      `/notifications/whatsapp-link/${orderId}`,
      { params: { msg_type: msgType } }
    ).then(r => r.data),
}

// ── Settings ──────────────────────────────────────────────
export const settingsApi = {
  getAll: () =>
    api.get<Setting[]>('/settings').then(r => r.data),

  update: (key: string, value: string) =>
    api.put<Setting>(`/settings/${key}`, { value }).then(r => r.data),

  bulkUpdate: (payload: Record<string, string>) =>
    api.put<Setting[]>('/settings', payload).then(r => r.data),
}

// ── Backup ────────────────────────────────────────────────
export const backupApi = {
  trigger: () =>
    api.post('/backup/trigger').then(r => r.data),

  status: () =>
    api.get('/backup/status').then(r => r.data),
}

export default api
