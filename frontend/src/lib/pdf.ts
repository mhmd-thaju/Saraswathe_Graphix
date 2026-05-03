// ============================================================
// PrintFlow ERP — PDF Invoice Generator (pdfmake)
// ============================================================
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { formatCurrency } from './gst';
import type { Order } from '@/types';

// Initialize fonts
if (pdfFonts && (pdfFonts as any).pdfMake) {
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
} else {
  (pdfMake as any).vfs = pdfFonts;
}

interface ShopInfo {
  shop_name: string;
  shop_gstin: string;
  shop_address: string;
  shop_city: string;
  shop_state: string;
  shop_mobile: string;
  shop_email: string;
  invoice_prefix: string;
}

export function generateInvoicePDF(order: Order, shop: ShopInfo) {
  const isIntra = order.gst_type === 'intra';
  const invoiceNo = `${shop.invoice_prefix || 'SGX'}-${order.order_number}`;
  const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      // Header
      {
        columns: [
          {
            text: 'TAX INVOICE',
            style: 'headerTitle'
          },
          {
            stack: [
              { text: `Invoice No: ${invoiceNo}`, alignment: 'right', bold: true },
              { text: `Date: ${dateStr}`, alignment: 'right' },
              order.due_date ? { text: `Due Date: ${new Date(order.due_date).toLocaleDateString('en-IN')}`, alignment: 'right', color: '#666' } : ''
            ],
            style: 'headerMeta'
          }
        ]
      },

      // Shop Info
      {
        stack: [
          { text: shop.shop_name, style: 'shopName' },
          { text: shop.shop_address, style: 'shopSub' },
          { text: `${shop.shop_city}, ${shop.shop_state}`, style: 'shopSub' },
          shop.shop_gstin ? { text: `GSTIN: ${shop.shop_gstin}`, style: 'shopSub', bold: true } : '',
          { text: `Mobile: ${shop.shop_mobile} | Email: ${shop.shop_email}`, style: 'shopSub' }
        ],
        margin: [0, 20, 0, 10]
      },

      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: '#eee' }] },

      // Customer Info
      {
        columns: [
          {
            stack: [
              { text: 'BILL TO', color: '#7c3aed', fontSize: 8, bold: true, margin: [0, 10, 0, 2] },
              { text: order.customer.name, fontSize: 12, bold: true },
              { text: order.customer.mobile, fontSize: 10, color: '#444' },
              order.customer.gstin ? { text: `GSTIN: ${order.customer.gstin}`, fontSize: 9, margin: [0, 2] } : '',
              { text: order.customer.address || '', fontSize: 9, color: '#666' }
            ]
          }
        ],
        margin: [0, 10, 0, 20]
      },

      // Table
      {
        table: {
          headerRows: 1,
          widths: isIntra ? [20, '*', 35, 30, 30, 50, 40, 40, 55] : [20, '*', 35, 30, 30, 50, 50, 60],
          body: [
            // Table Header
            isIntra 
              ? [
                  { text: '#', style: 'tableHeader' },
                  { text: 'Description', style: 'tableHeader' },
                  { text: 'HSN', style: 'tableHeader' },
                  { text: 'Qty', style: 'tableHeader' },
                  { text: 'Unit', style: 'tableHeader' },
                  { text: 'Rate', style: 'tableHeader' },
                  { text: 'CGST', style: 'tableHeader' },
                  { text: 'SGST', style: 'tableHeader' },
                  { text: 'Total', style: 'tableHeader' }
                ]
              : [
                  { text: '#', style: 'tableHeader' },
                  { text: 'Description', style: 'tableHeader' },
                  { text: 'HSN', style: 'tableHeader' },
                  { text: 'Qty', style: 'tableHeader' },
                  { text: 'Unit', style: 'tableHeader' },
                  { text: 'Rate', style: 'tableHeader' },
                  { text: 'IGST', style: 'tableHeader' },
                  { text: 'Total', style: 'tableHeader' }
                ],
            // Table Body
            ...order.line_items.map((li, i) => {
              const amt = li.amount;
              const gstAmt = (amt * li.gst_rate) / 100;
              const total = amt + gstAmt;
              const rateText = li.unit_price.toFixed(2);
              
              if (isIntra) {
                const half = gstAmt / 2;
                const halfRate = li.gst_rate / 2;
                return [
                  i + 1,
                  li.description,
                  li.hsn_code,
                  li.quantity,
                  li.unit,
                  rateText,
                  `${half.toFixed(2)}\n(${halfRate}%)`,
                  `${half.toFixed(2)}\n(${halfRate}%)`,
                  { text: total.toFixed(2), bold: true }
                ];
              } else {
                return [
                  i + 1,
                  li.description,
                  li.hsn_code,
                  li.quantity,
                  li.unit,
                  rateText,
                  `${gstAmt.toFixed(2)}\n(${li.gst_rate}%)`,
                  { text: total.toFixed(2), bold: true }
                ];
              }
            })
          ]
        },
        layout: {
          hLineWidth: (i: any, node: any) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
          vLineWidth: () => 0,
          hLineColor: (i: any) => (i === 0) ? '#7c3aed' : '#eee',
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 8,
          paddingBottom: () => 8,
        }
      },

      // Totals
      {
        columns: [
          { text: '', width: '*' },
          {
            width: 180,
            margin: [0, 20, 0, 0],
            table: {
              widths: ['*', 'auto'],
              body: [
                [{ text: 'Subtotal', color: '#666' }, { text: formatCurrency(order.subtotal), alignment: 'right' }],
                ...(isIntra 
                  ? [
                      [{ text: 'CGST', color: '#666' }, { text: formatCurrency(order.cgst_amount), alignment: 'right' }],
                      [{ text: 'SGST', color: '#666' }, { text: formatCurrency(order.sgst_amount), alignment: 'right' }]
                    ]
                  : [
                      [{ text: 'IGST', color: '#666' }, { text: formatCurrency(order.igst_amount), alignment: 'right' }]
                    ]
                ),
                [
                  { text: 'GRAND TOTAL', bold: true, fontSize: 12, margin: [0, 5] },
                  { text: formatCurrency(order.total_amount), bold: true, fontSize: 14, color: '#7c3aed', alignment: 'right', margin: [0, 5] }
                ]
              ]
            },
            layout: 'noBorders'
          }
        ]
      },

      // Footer
      {
        text: 'This is a computer-generated invoice. No signature required.',
        style: 'footer',
        margin: [0, 50, 0, 0]
      }
    ],
    styles: {
      headerTitle: { fontSize: 24, bold: true, color: '#1e1e28' },
      headerMeta: { fontSize: 10, color: '#444' },
      shopName: { fontSize: 16, bold: true, color: '#1e1e28' },
      shopSub: { fontSize: 9, color: '#666' },
      tableHeader: {
        fillColor: '#f8f7ff',
        fontSize: 9,
        bold: true,
        color: '#7c3aed',
        margin: [0, 5]
      },
      footer: { fontSize: 8, italic: true, color: '#aaa', alignment: 'center' }
    }
  };

  const safeName = `${order.customer.name}_${order.order_number}`
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_');

  pdfMake.createPdf(docDefinition).download(`${safeName}.pdf`);
}
