// ============================================================
// PrintFlow ERP — TypeScript Types
// ============================================================

export type GSTType = 'intra' | 'inter'
export type OrderStatus = 'new' | 'designing' | 'printing' | 'ready'
export type Priority = 'low' | 'normal' | 'high' | 'urgent'
export type NotifChannel = 'whatsapp' | 'email' | 'sms'

export interface Customer {
  id: string
  name: string
  mobile: string
  email?: string
  gstin?: string
  address?: string
  city?: string
  state: string
  created_at: string
  updated_at: string
}

export interface CustomerWithOrders extends Customer {
  orders: OrderSummary[]
}

export interface LineItem {
  id?: string
  order_id?: string
  description: string
  hsn_code: string
  quantity: number
  unit: string
  unit_price: number
  gst_rate: number
  amount: number
  created_at?: string
}

export interface Order {
  id: string
  order_number: number
  customer_id: string
  customer: Customer
  status: OrderStatus
  gst_type: GSTType
  subtotal: number
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
  total_amount: number
  notes?: string
  due_date?: string
  priority: Priority
  line_items: LineItem[]
  created_at: string
  updated_at: string
}

export interface OrderSummary {
  id: string
  order_number: number
  customer_name: string
  status: OrderStatus
  priority: Priority
  total_amount: number
  due_date?: string
  created_at: string
}

export interface KanbanCard {
  id: string
  order_number: number
  customer_name: string
  customer_mobile: string
  status: OrderStatus
  priority: Priority
  job_title: string
  total_amount: number
  due_date?: string
  created_at: string
}

export interface NotificationLog {
  id: string
  order_id: string
  channel: NotifChannel
  message: string
  sent_by: string
  sent_at: string
}

export interface Setting {
  key: string
  value: string
  updated_at?: string
}

export interface GSTSummary {
  subtotal: number
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
  total: number
}

export interface ShopSettings {
  shop_name: string
  shop_gstin: string
  shop_address: string
  shop_city: string
  shop_state: string
  shop_state_code: string
  shop_mobile: string
  shop_email: string
  default_gst_rate: string
  default_gst_type: string
  invoice_prefix: string
}
