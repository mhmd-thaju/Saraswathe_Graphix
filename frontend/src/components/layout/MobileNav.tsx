import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, Kanban, Users, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/ThemeContext'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/orders',    icon: ShoppingBag,     label: 'Orders' },
  { to: '/kanban',    icon: Kanban,          label: 'Board' },
  { to: '/crm',       icon: Users,           label: 'CRM' },
]

export default function MobileNav() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex items-center justify-around h-16 px-2">
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors
             ${isActive ? 'text-brand-400' : 'text-text-muted'}`
          }
        >
          <Icon size={20} />
          <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
        </NavLink>
      ))}
      <button
        onClick={toggleTheme}
        className="flex flex-col items-center gap-1 px-3 py-1 text-text-muted hover:text-text-primary transition-colors"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        <span className="text-[10px] font-medium uppercase tracking-wider">
          {theme === 'dark' ? 'Light' : 'Dark'}
        </span>
      </button>
    </div>
  )
}
