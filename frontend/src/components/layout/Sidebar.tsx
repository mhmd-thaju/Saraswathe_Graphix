import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, ShoppingBag, Kanban,
  Settings, Printer, ChevronRight
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/crm',       icon: Users,           label: 'Customers' },
  { to: '/orders',    icon: ShoppingBag,     label: 'Orders' },
  { to: '/kanban',    icon: Kanban,          label: 'Job Board' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
]

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full w-[240px] p-4 gap-2">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 py-4 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
          <Printer size={20} className="text-white" />
        </div>
        <div>
          <p className="font-outfit font-700 text-text-primary text-lg leading-tight">PrintFlow</p>
          <p className="text-text-muted text-[11px]">Printing Shop ERP</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-30" />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-bg-border">
        <p className="text-[11px] text-text-faint text-center">
          Saraswathe Graphix © 2026
        </p>
      </div>
    </div>
  )
}
