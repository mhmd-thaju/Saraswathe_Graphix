# PrintFlow ERP — UI Contract
# Design Tokens & Component Guidelines v1.0

---

## Typography

| Token | Value | Usage |
|-------|-------|-------|
| `font-outfit` | `'Outfit', sans-serif` | All headings, order numbers, labels, buttons |
| `font-inter` | `'Inter', sans-serif` | Body text, table data, paragraphs |
| Base size | `16px` | Minimum body font size (senior-friendly) |
| Heading scale | `text-2xl → text-3xl` | Page titles |
| Label size | `text-sm` (14px) | Form labels |
| Min button height | `48px` | All interactive elements |

---

## Color Palette

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-base` | `#0F1117` | Page background |
| `bg-surface` | `#1A1D27` | Cards, sidebar |
| `bg-elevated` | `#1E2330` | Inputs, hover rows, inner cards |
| `bg-border` | `#2A2D3E` | Borders, dividers |

### Brand (Primary)
| Token | Hex | Usage |
|-------|-----|-------|
| `brand-400` | `#A78BFA` | Active text, icons, links |
| `brand-500` | `#8B5CF6` | Hover states |
| `brand-600` | `#7C3AED` | Primary buttons, active nav, accents |
| `brand-700` | `#6D28D9` | Button press state |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `warm-500` | `#F97316` | CTA buttons, WhatsApp area |
| `success` | `#22C55E` | Ready status, success toasts |
| `warning` | `#EAB308` | Printing status, due-soon |
| `danger` | `#EF4444` | Delete, overdue, urgent |
| `info` | `#3B82F6` | New order status |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#F0F0F5` | Main readable text |
| `text-muted` | `#8892A4` | Secondary labels, metadata |
| `text-faint` | `#4B5563` | Placeholder, disabled |

---

## Kanban Status Colors

| Status | Border | Background | Text |
|--------|--------|------------|------|
| New | `border-info` | `bg-info/5` | `text-info` |
| Designing | `border-brand-500` | `bg-brand-600/5` | `text-brand-400` |
| Printing | `border-warning` | `bg-warning/5` | `text-warning` |
| Ready | `border-success` | `bg-success/5` | `text-success` |

## Priority Colors

| Priority | Badge |
|----------|-------|
| Urgent | `bg-danger/15 text-danger` |
| High | `bg-warm-500/15 text-warm-400` |
| Normal | `bg-bg-border text-text-muted` |
| Low | `bg-bg-border text-text-faint` |

---

## Component Classes

### Buttons

```css
.btn-primary    /* Violet — main actions */
.btn-secondary  /* Dark border — secondary actions */
.btn-danger     /* Red — delete / destructive */
.btn-success    /* Green — confirm */
.btn-whatsapp   /* #25D366 — WhatsApp notify */
```

All buttons: `min-height: 48px`, `active:scale-95` micro-animation.

### Cards

```css
.glass-card     /* bg-surface + border + backdrop-blur + hover glow */
.stat-card      /* glass-card + flex-col layout for dashboard stats */
.kanban-card    /* bg-elevated + border + cursor-grab + hover glow */
```

### Form

```css
.form-input     /* Styled input/select/textarea — min-height 48px */
.form-label     /* text-sm font-medium text-muted */
```

### Layout

```css
.app-layout     /* CSS grid: 240px sidebar | 1fr content (collapses on mobile) */
.page-content   /* Padded content area with max-width 1400px */
.page-header    /* flex row with title + action button */
.page-title     /* text-2xl md:text-3xl font-outfit font-700 */
```

### Data Display

```css
.data-table     /* Full-width table with themed th/td */
.badge          /* Pill badge — combine with status/priority color classes */
.nav-item       /* Sidebar link with active state (left border + bg) */
```

---

## Animations

| Class | Effect | Duration |
|-------|--------|----------|
| `animate-fade-in` | Opacity 0→1 | 0.2s |
| `animate-slide-up` | Y+12px→0 + fade | 0.25s |
| `animate-slide-right` | X-12px→0 + fade | 0.25s |
| `animate-pulse-soft` | Opacity pulse | 2s loop |
| `active:scale-95` | Button press feedback | 0.15s |

---

## Accessibility (Senior-Friendly Rules)

1. **Font size**: Minimum `16px` body, `14px` labels — never smaller
2. **Button size**: All buttons `min-height: 48px`, `min-width: 48px` for touch
3. **Contrast**: All text-on-background meets WCAG AA (4.5:1 ratio minimum)
4. **Labels**: Every button has a visible text label — no icon-only buttons
5. **Confirmation**: All destructive actions (delete) require `window.confirm()`
6. **Focus ring**: All interactive elements have visible `focus:ring` style
7. **Loading states**: Every async action shows a loading indicator
8. **Error feedback**: All errors shown via toast notifications

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Change |
|------------|-------|---------------|
| Mobile | < 768px | Sidebar hidden → Bottom nav visible |
| Tablet | 768px–1023px | Sidebar visible, some table columns hidden |
| Desktop | 1024px+ | Full layout, all columns visible |

---

## Invoice PDF Spec

- **Format**: A4 portrait
- **Header bar**: Violet `#7C3AED` 12mm strip at top
- **Required fields**: Invoice No, Date, Seller GSTIN, Buyer GSTIN, HSN Code, Qty, Rate, CGST/SGST or IGST columns, Grand Total
- **Footer**: "Computer-generated invoice — No signature required"
- **Filename**: `Invoice-{PREFIX}-{ORDER_NUMBER}.pdf`
