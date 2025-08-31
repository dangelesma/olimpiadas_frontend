import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import AdminRoute from '../components/AdminRoute'

// Páginas del Dashboard
import DashboardHome from '../pages/dashboard/DashboardHome'
import Administradores from '../pages/dashboard/Administradores'
import Arbitros from '../pages/dashboard/Arbitros'
import Veedores from '../pages/dashboard/Veedores'
import Torneos from '../pages/dashboard/Torneos'
import Canchas from '../pages/dashboard/Canchas'
import Equipos from '../pages/dashboard/Equipos'
import Partidos from '../pages/dashboard/Partidos'
import Posiciones from '../pages/dashboard/Posiciones'
import MisPartidos from '../pages/dashboard/MisPartidos'

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden md:ml-64">
        {/* Header */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Área de contenido principal */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Routes>
                {/* Ruta por defecto del dashboard */}
                <Route path="/" element={<DashboardHome />} />
                
                {/* Rutas solo para administradores */}
                <Route 
                  path="/administradores" 
                  element={
                    <AdminRoute>
                      <Administradores />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/arbitros" 
                  element={
                    <AdminRoute>
                      <Arbitros />
                    </AdminRoute>
                  } 
                />
                <Route
                  path="/veedores"
                  element={
                    <AdminRoute>
                      <Veedores />
                    </AdminRoute>
                  }
                />
                <Route 
                  path="/torneos" 
                  element={
                    <AdminRoute>
                      <Torneos />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/canchas" 
                  element={
                    <AdminRoute>
                      <Canchas />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/equipos" 
                  element={
                    <AdminRoute>
                      <Equipos />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/partidos" 
                  element={
                    <AdminRoute>
                      <Partidos />
                    </AdminRoute>
                  }
                />
                <Route path="/posiciones" element={<Posiciones />} />

                {/* Rutas para registradores */}
                {user?.role === 'registrador' && (
                  <Route path="/mis-partidos" element={<MisPartidos />} />
                )}

                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard