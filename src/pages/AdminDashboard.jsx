import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
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

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, orders])

  const loadOrders = () => {
    const savedOrders = JSON.parse(localStorage.getItem('giaElectroOrders') || '[]')
    // Agregar estado si no existe
    const ordersWithStatus = savedOrders.map((order) => ({
      ...order,
      status: order.status || 'pending',
      paymentStatus: order.paymentStatus || 'pending',
      shippingStatus: order.shippingStatus || 'pending',
      trackingNumber: order.trackingNumber || null,
    }))
    setOrders(ordersWithStatus)
  }

  const filterOrders = () => {
    let filtered = orders

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Ordenar por fecha más reciente primero
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        const updated = { ...order, status: newStatus }
        
        // Auto-actualizar estados relacionados
        if (newStatus === 'paid') {
          updated.paymentStatus = 'paid'
        }
        if (newStatus === 'shipped') {
          updated.shippingStatus = 'shipped'
          if (!updated.trackingNumber) {
            updated.trackingNumber = `TRK-${Date.now().toString(36).toUpperCase()}`
          }
        }
        
        // Guardar cambios
        const allOrders = JSON.parse(localStorage.getItem('giaElectroOrders') || '[]')
        const orderIndex = allOrders.findIndex((o) => o.id === orderId)
        if (orderIndex !== -1) {
          allOrders[orderIndex] = updated
          localStorage.setItem('giaElectroOrders', JSON.stringify(allOrders))
        }
        
        return updated
      }
      return order
    })
    setOrders(updatedOrders)
    
    // Simular envío de email de notificación
    sendNotificationEmail(orderId, newStatus)
  }

  const sendNotificationEmail = (orderId, status) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    const statusMessages = {
      processing: 'Tu pedido está siendo procesado',
      paid: 'Tu pago ha sido confirmado',
      shipped: 'Tu pedido ha sido enviado',
      delivered: 'Tu pedido ha sido entregado',
      cancelled: 'Tu pedido ha sido cancelado',
    }

    // En producción, esto sería una llamada a un servicio de email
    console.log(`📧 Email enviado a ${order.customer.email}:`, {
      subject: `Actualización de Pedido #${orderId}`,
      message: statusMessages[status] || 'Estado de tu pedido actualizado',
      orderId,
      status,
    })

    // Simular guardar notificaciones
    const savedNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]')
    savedNotifications.push({
      id: Date.now(),
      orderId,
      email: order.customer.email,
      status,
      message: statusMessages[status],
      date: new Date().toISOString(),
    })
    localStorage.setItem('adminNotifications', JSON.stringify(savedNotifications))
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
    navigate('/admin/login')
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
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              ORDER_STATUSES[order.status]?.color ||
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

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    sendNotificationEmail(
                      selectedOrder.id,
                      selectedOrder.status
                    )
                    alert('Email de notificación enviado')
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <EnvelopeIcon className="h-5 w-5" />
                  Enviar Email
                </button>
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
    </div>
  )
}

export default AdminDashboard

