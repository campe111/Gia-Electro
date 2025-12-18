import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { supabase } from '../config/supabase'
import { createClient } from '@supabase/supabase-js'
import { sendCustomerConfirmationEmail } from '../services/emailService'
import { getPlaceholderImage } from '../utils/imageHelper'

// Cliente de Supabase con service_role para el admin (bypass RLS)
const supabaseAdmin = (() => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://worpraelmlhsdkvuapbb.supabase.co'
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  
  // Si hay service_role key, usarla (bypass RLS)
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  
  // Si no, usar el cliente normal (requiere políticas RLS actualizadas)
  return supabase
})()
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PrinterIcon,
  EnvelopeIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

const ORDER_STATUSES = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: TruckIcon },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircleIcon },
}

function AdminDashboard() {
  const navigate = useNavigate()
  const { logout, adminUser } = useAdmin()
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState({ type: '', message: '' })
  const [showAddOrderModal, setShowAddOrderModal] = useState(false)
  const [activeTab, setActiveTab] = useState('pedidos') // 'pedidos' o 'productos'

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, orders])

  const filterOrders = () => {
    let filtered = orders

    // Filtrar por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(search) ||
          order.customer.email.toLowerCase().includes(search) ||
          `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(search)
      )
    }

    // Filtrar por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const loadOrders = async () => {
    try {
      // Usar supabaseAdmin que puede tener service_role key o el cliente normal
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error detallado cargando órdenes:', error)
        
        // Si es un error de permisos RLS, mostrar mensaje específico
        if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
          alert(
            'Error de permisos: Las políticas RLS de Supabase están bloqueando el acceso.\n\n' +
            'Por favor, ejecuta el script SQL en Supabase:\n' +
            '1. Ve a tu proyecto en Supabase\n' +
            '2. Abre el SQL Editor\n' +
            '3. Ejecuta el archivo: server/update-rls-policies.sql\n\n' +
            'O contacta al desarrollador para configurar las políticas correctamente.'
          )
          throw error
        }
        
        throw error
      }

      // Mapear datos de Supabase al formato del componente
      const formattedOrders = (data || []).map(order => ({
        id: order.id,
        date: order.created_at,
        customer: order.customer_data,
        shipping: order.shipping_data,
        items: order.items,
        total: order.total,
        status: order.status,
        paymentStatus: order.payment_status,
        shippingStatus: order.shipping_status,
        trackingNumber: order.tracking_number,
        payment: order.payment_data
      }))

      setOrders(formattedOrders)
      console.log(`✅ Cargadas ${formattedOrders.length} órdenes`)
    } catch (error) {
      console.error('Error cargando órdenes:', error)
      alert('Error cargando órdenes: ' + error.message)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updates = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      // Auto-actualizar estados relacionados
      if (newStatus === 'paid') {
        updates.payment_status = 'paid'
      }
      if (newStatus === 'shipped') {
        updates.shipping_status = 'shipped'
        // Solo generar tracking si no existe
        const currentOrder = orders.find(o => o.id === orderId)
        if (!currentOrder?.trackingNumber) {
          updates.tracking_number = `TRK-${Date.now().toString(36).toUpperCase()}`
        }
      }

      const { error } = await supabaseAdmin
        .from('orders')
        .update(updates)
        .eq('id', orderId)

      if (error) throw error

      // Actualizar estado local
      const updatedOrders = orders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: newStatus,
            paymentStatus: updates.payment_status || order.paymentStatus,
            shippingStatus: updates.shipping_status || order.shippingStatus,
            trackingNumber: updates.tracking_number || order.trackingNumber
          }
        }
        return order
      })
      setOrders(updatedOrders)

      // Enviar email de notificación al cliente
      const updatedOrder = updatedOrders.find(o => o.id === orderId)
      if (updatedOrder) {
        await sendNotificationEmail(updatedOrder, newStatus)
      }
    } catch (error) {
      console.error('Error actualizando orden:', error)
      alert('Error actualizando orden: ' + error.message)
    }
  }

  const sendNotificationEmail = async (order, status) => {
    if (!order) return

    try {
      const result = await sendCustomerConfirmationEmail(order, status)
      
      if (result.success) {
        console.log(`✅ Email de confirmación enviado a ${order.customer.email}`)
        
        // Guardar notificación
        const savedNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]')
        savedNotifications.push({
          id: Date.now(),
          orderId: order.id,
          email: order.customer.email,
          status,
          date: new Date().toISOString(),
        })
        localStorage.setItem('adminNotifications', JSON.stringify(savedNotifications))
      } else {
        console.warn('Email no enviado, pero guardado para procesamiento posterior')
      }
    } catch (error) {
      console.error('Error enviando email de notificación:', error)
    }
  }

  const handleSendConfirmationEmail = async (order) => {
    setIsSendingEmail(true)
    setEmailStatus({ type: '', message: '' })

    try {
      const result = await sendCustomerConfirmationEmail(order, order.status)
      
      if (result.success) {
        setEmailStatus({
          type: 'success',
          message: `Email de confirmación enviado exitosamente a ${order.customer.email}`
        })
        
        // Guardar notificación
        const savedNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]')
        savedNotifications.push({
          id: Date.now(),
          orderId: order.id,
          email: order.customer.email,
          status: order.status,
          date: new Date().toISOString(),
        })
        localStorage.setItem('adminNotifications', JSON.stringify(savedNotifications))
      } else {
        setEmailStatus({
          type: 'warning',
          message: result.message || 'Email guardado para envío posterior'
        })
      }
    } catch (error) {
      setEmailStatus({
        type: 'error',
        message: `Error enviando email: ${error.message}`
      })
    } finally {
      setIsSendingEmail(false)
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        setEmailStatus({ type: '', message: '' })
      }, 5000)
    }
  }

  const getStatistics = () => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const pendingOrders = orders.filter((o) => o.status === 'pending').length
    const processingOrders = orders.filter((o) => o.status === 'processing').length

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
    }
  }

  const stats = getStatistics()

  const handleLogout = () => {
    logout()
    // Redirigir al home para que el Layout muestre el contenido normal
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-black">
                Panel de Administración
              </h1>
              <p className="text-sm text-gray-600">
                Bienvenido, {adminUser?.name || 'Admin'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs de Navegación */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'pedidos'
                  ? 'text-primary-red border-b-2 border-primary-red bg-red-50'
                  : 'text-gray-600 hover:text-primary-red'
              }`}
            >
              <ShoppingBagIcon className="h-5 w-5 inline-block mr-2" />
              Pedidos
            </button>
            <button
              onClick={() => setActiveTab('productos')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'productos'
                  ? 'text-primary-red border-b-2 border-primary-red bg-red-50'
                  : 'text-gray-600 hover:text-primary-red'
              }`}
            >
              <PlusIcon className="h-5 w-5 inline-block mr-2" />
              Productos
            </button>
          </div>
        </div>

        {/* Contenido según el tab activo */}
        {activeTab === 'pedidos' ? (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Órdenes</p>
                <p className="text-3xl font-bold text-primary-black">
                  {stats.totalOrders}
                </p>
              </div>
              <ShoppingBagIcon className="h-12 w-12 text-primary-yellow" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ingresos Totales</p>
                <p className="text-3xl font-bold text-primary-red">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <CurrencyDollarIcon className="h-12 w-12 text-primary-red" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pendingOrders}
                </p>
              </div>
              <ClockIcon className="h-12 w-12 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Procesando</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.processingOrders}
                </p>
              </div>
              <ClockIcon className="h-12 w-12 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por ID de orden, email, nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
              />
            </div>
            <div className="relative">
              <FunnelIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-12 pr-8 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow appearance-none bg-white"
              >
                <option value="todos">Todos los estados</option>
                {Object.entries(ORDER_STATUSES).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Órdenes */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No se encontraron órdenes
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const StatusIcon = ORDER_STATUSES[order.status]?.icon || ClockIcon
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-primary-black">
                            {order.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.customer.firstName} {order.customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-red">
                          ${order.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${ORDER_STATUSES[order.status]?.color ||
                              'bg-gray-100 text-gray-800'
                              }`}
                          >
                            <StatusIcon className="h-4 w-4" />
                            {ORDER_STATUSES[order.status]?.label || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-primary-yellow hover:text-yellow-600 font-semibold"
                            >
                              Ver
                            </button>
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order.id, e.target.value)
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                            >
                              {Object.entries(ORDER_STATUSES).map(([key, { label }]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        ) : (
          <ProductManagementSection />
        )}
      </div>

      {/* Modal de Detalles */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-black">
                  Detalles de Orden #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-bold text-primary-black mb-3">Cliente</h3>
                  <div className="text-gray-600 space-y-1">
                    <p>
                      {selectedOrder.customer.firstName}{' '}
                      {selectedOrder.customer.lastName}
                    </p>
                    <p>{selectedOrder.customer.email}</p>
                    <p>{selectedOrder.customer.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-primary-black mb-3">Envío</h3>
                  <div className="text-gray-600 space-y-1">
                    <p>{selectedOrder.shipping.address}</p>
                    <p>
                      {selectedOrder.shipping.city}, {selectedOrder.shipping.state}
                    </p>
                    <p>
                      {selectedOrder.shipping.zipCode}, {selectedOrder.shipping.country}
                    </p>
                    {selectedOrder.trackingNumber && (
                      <p className="mt-2">
                        <strong>Tracking:</strong> {selectedOrder.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-primary-black mb-3">Productos</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Cantidad: {item.quantity} × ${item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold text-primary-red">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary-red">
                    ${selectedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {emailStatus.message && (
                <div className={`mb-4 p-4 rounded-lg ${
                  emailStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                  emailStatus.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                  'bg-yellow-50 border border-yellow-200 text-yellow-800'
                }`}>
                  <p className="text-sm">{emailStatus.message}</p>
                </div>
              )}

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => handleSendConfirmationEmail(selectedOrder)}
                  disabled={isSendingEmail}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingEmail ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="h-5 w-5" />
                      Enviar Confirmación al Cliente
                    </>
                  )}
                </button>
                <a
                  href={(() => {
                    // Obtener el número de teléfono del cliente
                    const phone = selectedOrder.customer.phone || ''
                    
                    // Limpiar el número: remover espacios, guiones, paréntesis, etc.
                    let cleanPhone = phone.replace(/[^0-9+]/g, '')
                    
                    // Si el número empieza con +54, mantenerlo (formato internacional de Argentina)
                    // Si empieza con 54, agregar el +
                    if (cleanPhone.startsWith('54') && !cleanPhone.startsWith('+54')) {
                      cleanPhone = '+' + cleanPhone
                    } else if (!cleanPhone.startsWith('+') && cleanPhone.length > 0) {
                      // Si no tiene código de país y es un número argentino, agregar +54
                      // Números argentinos suelen tener 10-11 dígitos (sin código de país)
                      if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
                        // Si empieza con 9, es un número con código de área
                        if (cleanPhone.startsWith('9')) {
                          cleanPhone = '+54' + cleanPhone
                        } else if (cleanPhone.startsWith('0')) {
                          // Si empieza con 0, removerlo y agregar +54
                          cleanPhone = '+54' + cleanPhone.substring(1)
                        } else {
                          // Agregar +54 al inicio
                          cleanPhone = '+54' + cleanPhone
                        }
                      } else if (cleanPhone.length < 10) {
                        // Número muy corto, intentar agregar código de país
                        cleanPhone = '+54' + cleanPhone
                      }
                    }
                    
                    // Si después de todo no tiene +, agregarlo
                    if (cleanPhone && !cleanPhone.startsWith('+')) {
                      cleanPhone = '+54' + cleanPhone
                    }
                    
                    // Crear el mensaje prellenado
                    const message = `Hola ${selectedOrder.customer.firstName}, te contactamos desde Gia Electro sobre tu pedido #${selectedOrder.id}`
                    
                    // Construir la URL de WhatsApp
                    return `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(message)}`
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  onClick={(e) => {
                    // Verificar que hay un número de teléfono
                    if (!selectedOrder.customer.phone || selectedOrder.customer.phone.trim() === '') {
                      e.preventDefault()
                      alert('El cliente no tiene un número de teléfono registrado')
                    }
                  }}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Contactar por WhatsApp
                </a>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  <PrinterIcon className="h-5 w-5" />
                  Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Agregar Pedido Manualmente desde Gmail */}
      {showAddOrderModal && (
        <AddOrderFromEmailModal
          isOpen={showAddOrderModal}
          onClose={() => setShowAddOrderModal(false)}
          onOrderAdded={() => {
            setShowAddOrderModal(false)
            loadOrders() // Recargar la lista de pedidos
          }}
        />
      )}
    </div>
  )
}

// Componente Modal para agregar pedido desde email
function AddOrderFromEmailModal({ isOpen, onClose, onOrderAdded }) {
  const [emailContent, setEmailContent] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [manualForm, setManualForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Argentina',
    items: [{ name: '', quantity: 1, price: 0 }],
    total: 0,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const parseEmailContent = () => {
    try {
      // Intentar extraer información del email
      const lines = emailContent.split('\n').map(l => l.trim()).filter(l => l)
      
      // Buscar ID de pedido
      const orderIdMatch = emailContent.match(/ID de Pedido:\s*([A-Z0-9-]+)/i) || 
                          emailContent.match(/Pedido[#\s]*([A-Z0-9-]+)/i)
      const orderId = orderIdMatch ? orderIdMatch[1] : `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Buscar nombre del cliente
      const nameMatch = emailContent.match(/Nombre:\s*([^\n]+)/i)
      const customerName = nameMatch ? nameMatch[1].trim() : ''

      // Buscar email
      const emailMatch = emailContent.match(/Email:\s*([^\s@]+@[^\s@]+\.[^\s@]+)/i)
      const customerEmail = emailMatch ? emailMatch[1].trim() : ''

      // Buscar teléfono
      const phoneMatch = emailContent.match(/Teléfono:\s*([^\n]+)/i)
      const customerPhone = phoneMatch ? phoneMatch[1].trim() : ''

      // Buscar dirección
      const addressMatch = emailContent.match(/Dirección:\s*([^\n]+)/i)
      const address = addressMatch ? addressMatch[1].trim() : ''

      // Buscar ciudad
      const cityMatch = emailContent.match(/Ciudad:\s*([^\n]+)/i)
      const city = cityMatch ? cityMatch[1].trim() : ''

      // Buscar estado
      const stateMatch = emailContent.match(/Estado[\/\s]*Provincia:\s*([^\n]+)/i)
      const state = stateMatch ? stateMatch[1].trim() : ''

      // Buscar código postal
      const zipMatch = emailContent.match(/Código Postal:\s*([^\n]+)/i)
      const zipCode = zipMatch ? zipMatch[1].trim() : ''

      // Buscar total
      const totalMatch = emailContent.match(/Total:\s*\$?([\d.,]+)/i)
      const total = totalMatch ? parseFloat(totalMatch[1].replace(/[.,]/g, '')) : 0

      // Buscar productos (formato: número. nombre - Cantidad: X - Precio: $Y)
      const items = []
      const itemMatches = emailContent.matchAll(/\d+\.\s*([^-]+?)\s*-\s*Cantidad:\s*(\d+)\s*-\s*Precio[^\$]*\$?([\d.,]+)/gi)
      for (const match of itemMatches) {
        items.push({
          name: match[1].trim(),
          quantity: parseInt(match[2]) || 1,
          price: parseFloat(match[3].replace(/[.,]/g, '')) || 0,
        })
      }

      // Si no se encontraron items con el patrón, intentar otro formato
      if (items.length === 0) {
        // Buscar líneas que parezcan productos
        const productLines = lines.filter(l => 
          l.match(/^\d+\./) || 
          (l.includes('Cantidad') && l.includes('Precio'))
        )
        // Intentar parsear manualmente
      }

      const [firstName, ...lastNameParts] = customerName.split(' ')
      const lastName = lastNameParts.join(' ') || ''

      setParsedData({
        orderId,
        customer: {
          firstName: firstName || '',
          lastName: lastName || '',
          email: customerEmail,
          phone: customerPhone,
        },
        shipping: {
          address,
          city,
          state,
          zipCode,
          country: 'Argentina',
        },
        items: items.length > 0 ? items : [{ name: 'Producto', quantity: 1, price: total }],
        total,
      })

      // Actualizar formulario manual
      setManualForm({
        customerName,
        customerEmail,
        customerPhone,
        address,
        city,
        state,
        zipCode,
        country: 'Argentina',
        items: items.length > 0 ? items : [{ name: 'Producto', quantity: 1, price: total }],
        total,
      })
    } catch (err) {
      console.error('Error parseando email:', err)
      setError('Error al parsear el email. Por favor, completa el formulario manualmente.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    setError('')

    try {
      const orderId = parsedData?.orderId || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      const [firstName, ...lastNameParts] = manualForm.customerName.split(' ')
      const lastName = lastNameParts.join(' ') || ''

      const orderData = {
        id: orderId,
        customer_data: {
          firstName: firstName || manualForm.customerName,
          lastName: lastName,
          email: manualForm.customerEmail,
          phone: manualForm.customerPhone,
        },
        shipping_data: {
          address: manualForm.address,
          city: manualForm.city,
          state: manualForm.state,
          zipCode: manualForm.zipCode,
          country: manualForm.country,
        },
        items: manualForm.items.filter(item => item.name && item.quantity > 0),
        total: manualForm.total || manualForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        payment_status: 'pending',
        payment_data: {
          payment_method: 'email',
        },
        user_id: null,
      }

      const { error: supabaseError } = await supabaseAdmin
        .from('orders')
        .insert([orderData])

      if (supabaseError) throw supabaseError

      onOrderAdded()
    } catch (err) {
      console.error('Error guardando pedido:', err)
      setError('Error al guardar el pedido: ' + err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary-black">
            Agregar Pedido desde Gmail
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Paso 1: Pegar contenido del email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paso 1: Pega el contenido del email de Gmail aquí
            </label>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              onBlur={parseEmailContent}
              className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow min-h-[200px] font-mono text-sm"
              placeholder="Pega aquí el contenido completo del email que recibiste en Gmail..."
            />
            <button
              type="button"
              onClick={parseEmailContent}
              className="mt-2 px-4 py-2 bg-primary-yellow text-primary-black rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
            >
              Extraer Información
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Paso 2: Formulario manual */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-primary-black mb-4">
              Paso 2: Verifica y completa la información
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={manualForm.customerName}
                  onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={manualForm.customerEmail}
                  onChange={(e) => setManualForm({ ...manualForm, customerEmail: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={manualForm.customerPhone}
                  onChange={(e) => setManualForm({ ...manualForm, customerPhone: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={manualForm.address}
                  onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={manualForm.city}
                  onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado/Provincia *
                </label>
                <input
                  type="text"
                  value={manualForm.state}
                  onChange={(e) => setManualForm({ ...manualForm, state: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal *
                </label>
                <input
                  type="text"
                  value={manualForm.zipCode}
                  onChange={(e) => setManualForm({ ...manualForm, zipCode: e.target.value })}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={manualForm.total}
                  onChange={(e) => setManualForm({ ...manualForm, total: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  required
                />
              </div>
            </div>

            {/* Productos */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Productos *
              </label>
              {manualForm.items.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={item.name}
                    onChange={(e) => {
                      const newItems = [...manualForm.items]
                      newItems[index].name = e.target.value
                      setManualForm({ ...manualForm, items: newItems })
                    }}
                    className="flex-1 px-4 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...manualForm.items]
                      newItems[index].quantity = parseInt(e.target.value) || 1
                      setManualForm({ ...manualForm, items: newItems })
                    }}
                    className="w-24 px-4 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                    min="1"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Precio"
                    value={item.price}
                    onChange={(e) => {
                      const newItems = [...manualForm.items]
                      newItems[index].price = parseFloat(e.target.value) || 0
                      setManualForm({ ...manualForm, items: newItems })
                    }}
                    className="w-32 px-4 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                    required
                  />
                  {manualForm.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = manualForm.items.filter((_, i) => i !== index)
                        setManualForm({ ...manualForm, items: newItems })
                      }}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setManualForm({
                    ...manualForm,
                    items: [...manualForm.items, { name: '', quantity: 1, price: 0 }]
                  })
                }}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                + Agregar Producto
              </button>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Guardando...' : 'Guardar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminDashboard

