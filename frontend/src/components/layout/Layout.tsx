import { Outlet } from 'react-router-dom'
import Sidebar   from './Sidebar'
import MobileNav from './MobileNav'

export default function Layout() {
  return (
    <div className="app-layout">
      {/* Desktop sidebar – hidden on mobile */}
      <aside className="hidden md:flex flex-col h-screen sticky top-0 bg-bg-surface border-r border-bg-border">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex flex-col min-h-screen overflow-hidden">
        <div className="flex-1 overflow-auto page-content pb-24 md:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-bg-border">
        <MobileNav />
      </nav>
    </div>
  )
}
