// ============================================================
// PrintFlow ERP — Client-side GST Helpers
// ============================================================
import type { LineItem, GSTSummary } from '@/types'

export function calcLineAmount(qty: number, unitPrice: number): number {
  return Math.round(qty * unitPrice * 100) / 100
}

export function calcGST(items: LineItem[], gstType: 'intra' | 'inter'): GSTSummary {
  let subtotal = 0
  let cgst = 0
  let sgst = 0
  let igst = 0

  for (const item of items) {
    const amount = item.amount || calcLineAmount(item.quantity, item.unit_price)
    subtotal += amount

    if (gstType === 'intra') {
      const half = (amount * item.gst_rate) / 200
      cgst += half
      sgst += half
    } else {
      igst += (amount * item.gst_rate) / 100
    }
  }

  const round = (n: number) => Math.round(n * 100) / 100

  return {
    subtotal:    round(subtotal),
    cgst_amount: round(cgst),
    sgst_amount: round(sgst),
    igst_amount: round(igst),
    total:       round(subtotal + cgst + sgst + igst),
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n)
}
