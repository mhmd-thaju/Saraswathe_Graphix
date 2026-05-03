import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, ShoppingBag, Kanban, Settings } from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/crm',       icon: Users,           label: 'Customers' },
  { to: '/orders',    icon: ShoppingBag,     label: 'Orders' },
  { to: '/kanban',    icon: Kanban,          label: 'Board' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
]

export default function MobileNav() {
  return (
    <div className="flex items-center justify-around px-2 py-2">
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-medium transition-all
             ${isActive
               ? 'text-brand-400 bg-bg-elevated'
               : 'text-text-muted hover:text-text-primary'
             }`
          }
        >
          <Icon size={22} />
          {label}
        </NavLink>
      ))}
    </div>
  )
}
