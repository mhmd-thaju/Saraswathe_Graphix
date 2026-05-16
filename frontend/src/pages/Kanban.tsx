import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Kanban as KanbanIcon, Plus, MessageSquare, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, rectIntersection, useDroppable
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ordersApi, notificationsApi, settingsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/gst'
import { buildWhatsAppLink, readyMessage } from '@/lib/notify'
import type { KanbanCard, OrderStatus } from '@/types'

const COLUMNS: { id: OrderStatus; label: string; color: string; bg: string }[] = [
  { id:'new',       label:'📋 New Orders',      color:'border-info',      bg:'bg-info/5' },
  { id:'designing', label:'🎨 Designing',        color:'border-brand-500', bg:'bg-brand-600/5' },
  { id:'printing',  label:'🖨️ Printing',         color:'border-warning',   bg:'bg-warning/5' },
  { id:'ready',     label:'📦 Ready for Pickup', color:'border-success',   bg:'bg-success/5' },
]
const PRIORITY_DOT: Record<string,string> = {
  urgent:'bg-danger', high:'bg-warm-500', normal:'bg-text-faint', low:'bg-bg-border',
}

export default function Kanban() {
  const [cards, setCards]       = useState<KanbanCard[]>([])
  const [loading, setLoading]   = useState(true)
  const [active, setActive]     = useState<KanbanCard | null>(null)
  const [shopName, setShopName] = useState('Saraswathe Graphix')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([ordersApi.kanban(), settingsApi.getAll()]).then(([c, settings]) => {
      setCards(Array.isArray(c) ? c : [])
      if (Array.isArray(settings)) {
        const s = settings.find(x => x.key === 'shop_name')
        if (s) setShopName(s.value)
      }
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const colCards = (col: OrderStatus) => (Array.isArray(cards) ? cards : []).filter(c => c.status === col)

  function onDragStart(e: DragStartEvent) {
    setActive(cards.find(c => c.id === e.active.id) ?? null)
  }

  async function onDragEnd(e: DragEndEvent) {
    setActive(null)
    const { active: a, over } = e
    if (!over) return

    const cardId = a.id as string
    const card = cards.find(c => c.id === cardId)
    if (!card) return

    // Identify target status
    let newStatus: OrderStatus | null = null
    
    // If dropped over a column directly
    if (COLUMNS.some(col => col.id === over.id)) {
      newStatus = over.id as OrderStatus
    } else {
      // If dropped over another card, find that card's column
      const overCard = cards.find(c => c.id === over.id)
      if (overCard) newStatus = overCard.status
    }

    if (!newStatus || card.status === newStatus) return

    setCards(prev => prev.map(c => c.id === card.id ? {...c, status: newStatus!} : c))
    try {
      await ordersApi.updateStatus(card.id as string, newStatus)
      toast.success(`#${card.order_number} → ${newStatus}`)
    } catch { 
      toast.error('Update failed')
      load() 
    }
  }

  async function sendWhatsApp(card: KanbanCard) {
    const msg  = readyMessage(card.customer_name, card.order_number, card.job_title, shopName)
    window.open(buildWhatsAppLink(card.customer_mobile, msg), '_blank')
    await notificationsApi.log({ order_id: card.id as string, channel:'whatsapp', message:msg })
    toast.success('WhatsApp opened')
  }

  if (loading) return (
    <div className="flex gap-4 overflow-x-auto pb-4 animate-pulse">
      {COLUMNS.map(c => <div key={c.id} className="flex-shrink-0 w-72 h-96 bg-bg-elevated rounded-2xl"/>)}
    </div>
  )

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><KanbanIcon size={26} className="text-brand-400"/>Job Board</h1>
          <p className="text-text-muted mt-1">{cards.length} total jobs</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary text-sm py-2 px-3">Refresh</button>
          <Link to="/orders/new" className="btn-primary"><Plus size={18}/>New Order</Link>
        </div>
      </div>

      <DndContext 
        sensors={sensors} 
        collisionDetection={rectIntersection}
        onDragStart={onDragStart} 
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <KanbanColumn key={col.id} col={col} cards={colCards(col.id)} onNotify={sendWhatsApp} />
          ))}
        </div>
        <DragOverlay>
          {active && <KanbanCardItem card={active} onNotify={() => {}} isDragging/>}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function KanbanColumn({ col, cards, onNotify }: { col: any; cards: KanbanCard[]; onNotify: (c: KanbanCard) => void }) {
  const { setNodeRef } = useDroppable({ id: col.id })
  
  return (
    <div 
      ref={setNodeRef}
      className={`kanban-col border-2 ${col.color} ${col.bg} flex-shrink-0 w-72 min-h-[500px]`}
    >
      <div className="flex items-center justify-between px-1 mb-3">
        <h3 className="font-outfit font-700 text-sm uppercase tracking-wider opacity-70">{col.label}</h3>
        <span className="w-6 h-6 rounded-full bg-bg-border text-text-muted text-xs flex items-center justify-center font-bold">
          {cards.length}
        </span>
      </div>
      <SortableContext items={(Array.isArray(cards) ? cards : []).map(c => c.id as string)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {cards.length === 0 && (
            <div className="text-center py-12 text-text-faint text-sm border-2 border-dashed border-bg-border/50 rounded-2xl">
              Drop here
            </div>
          )}
          {cards.map(card => (
            <KanbanCardItem key={card.id} card={card} onNotify={() => onNotify(card)}/>
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

function KanbanCardItem({ card, onNotify, isDragging=false }:{card:KanbanCard;onNotify:()=>void;isDragging?:boolean}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const overdue = card.due_date && new Date(card.due_date) < new Date() && card.status !== 'ready'
  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-card ${isDragging ? 'opacity-70 scale-105 shadow-glow' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[card.priority]}`}/>
          <span className="font-outfit font-700 text-brand-400 text-sm">#{card.order_number}</span>
        </div>
        <Link to={`/orders/${card.id}`} className="text-text-muted hover:text-brand-400 transition-colors"
          onMouseDown={e => e.stopPropagation()}>
          <ExternalLink size={14}/>
        </Link>
      </div>
      <p className="font-medium text-text-primary text-sm mb-1 truncate">{card.customer_name}</p>
      <p className="text-text-muted text-xs truncate-2 mb-3">{card.job_title}</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-outfit font-700 text-text-primary text-sm">{formatCurrency(card.total_amount)}</p>
          {card.due_date && (
            <p className={`text-xs mt-0.5 ${overdue ? 'text-danger font-medium' : 'text-text-muted'}`}>
              {overdue ? '⚠ ' : ''}Due {new Date(card.due_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
            </p>
          )}
        </div>
        <button onClick={e => { e.stopPropagation(); onNotify() }}
          onMouseDown={e => e.stopPropagation()}
          title="Send WhatsApp"
          className="w-8 h-8 rounded-lg bg-[#25D366]/15 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/30 transition-colors">
          <MessageSquare size={15}/>
        </button>
      </div>
    </div>
  )
}
