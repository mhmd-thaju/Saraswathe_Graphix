// ============================================================
// PrintFlow ERP — WhatsApp & Email Link Builder
// ============================================================

export function buildWhatsAppLink(mobile: string, message: string): string {
  const cleaned = mobile.replace(/\D/g, '')
  const withCode = cleaned.startsWith('91') ? cleaned : `91${cleaned}`
  return `https://wa.me/${withCode}?text=${encodeURIComponent(message)}`
}

export function buildEmailLink(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function readyMessage(
  customerName: string,
  orderNumber: number,
  jobTitle: string,
  shopName = 'Saraswathe Graphix'
): string {
  return (
    `Hello ${customerName} 👋,\n\n` +
    `Great news! Your print order *#${orderNumber}* (*${jobTitle}*) ` +
    `is ready for pickup at *${shopName}*. 📦\n\n` +
    `Please visit us at your earliest convenience.\n\n` +
    `Thank you for your business! 🙏`
  )
}

export function statusMessage(
  customerName: string,
  orderNumber: number,
  status: string,
  shopName = 'Saraswathe Graphix'
): string {
  const labels: Record<string, string> = {
    new:       'Order Received 📋',
    designing: 'In Designing Stage 🎨',
    printing:  'Currently Printing 🖨️',
    ready:     'Ready for Pickup 📦',
  }
  return (
    `Hello ${customerName} 👋,\n\n` +
    `Your order *#${orderNumber}* status: *${labels[status] ?? status}*\n\n` +
    `We'll notify you when it's ready for pickup.\n\n— ${shopName}`
  )
}
