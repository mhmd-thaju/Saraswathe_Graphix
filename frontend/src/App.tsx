import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard  from '@/pages/Dashboard'
import CRM        from '@/pages/CRM'
import Orders     from '@/pages/Orders'
import NewOrder   from '@/pages/NewOrder'
import OrderDetail from '@/pages/OrderDetail'
import Kanban     from '@/pages/Kanban'
import Settings   from '@/pages/Settings'
import Login      from '@/pages/Login'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('pf_auth') === 'true'
  )

  const handleLogin = (pass: string) => {
    // In a real app, this would be a backend call.
    // For local shop use, a shared master password is effective.
    if (pass === 'admin123') { 
      setIsAuthenticated(true)
      localStorage.setItem('pf_auth', 'true')
      return true
    }
    return false
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"        element={<Dashboard />} />
        <Route path="crm"              element={<CRM />} />
        <Route path="orders"           element={<Orders />} />
        <Route path="orders/new"       element={<NewOrder />} />
        <Route path="orders/:id"       element={<OrderDetail />} />
        <Route path="kanban"           element={<Kanban />} />
        <Route path="settings"         element={<Settings />} />
      </Route>
    </Routes>
  )
}
