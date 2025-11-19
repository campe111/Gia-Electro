import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { CartProvider } from './context/CartContext'
import { AdminProvider } from './context/AdminContext'
import { UserProvider } from './context/UserContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import Contacto from './pages/Contacto'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import Confirmacion from './pages/Confirmacion'
import ConfirmacionPago from './pages/ConfirmacionPago'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'

function App() {
  return (
    <CartProvider>
      <UserProvider>
        <AdminProvider>
          <Routes>
            {/* Rutas públicas */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/catalogo" element={<Catalogo />} />
                    <Route path="/contacto" element={<Contacto />} />
                    <Route path="/carrito" element={<Carrito />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route
                      path="/confirmacion/:orderId"
                      element={<Confirmacion />}
                    />
                    <Route
                      path="/confirmacion-pago"
                      element={<ConfirmacionPago />}
                    />
                    <Route
                      path="/pago-fallido"
                      element={<ConfirmacionPago />}
                    />
                    <Route
                      path="/pago-pendiente"
                      element={<ConfirmacionPago />}
                    />
                  </Routes>
                  <Analytics />
                </Layout>
              }
            />

            {/* Rutas de autenticación de usuarios */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Rutas de administración */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AdminProvider>
      </UserProvider>
    </CartProvider>
  )
}

export default App

