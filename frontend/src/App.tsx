import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard  from '@/pages/Dashboard'
import CRM        from '@/pages/CRM'
import Orders     from '@/pages/Orders'
import NewOrder   from '@/pages/NewOrder'
import OrderDetail from '@/pages/OrderDetail'
import Kanban     from '@/pages/Kanban'
import Settings   from '@/pages/Settings'

export default function App() {
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
