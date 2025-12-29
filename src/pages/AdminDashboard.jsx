import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin, isAdminUser } from '../context/AdminContext'
import { supabase } from '../config/supabase'
import { sendCustomerConfirmationEmail } from '../services/emailService'
import { getPlaceholderImage } from '../utils/imageHelper'
import { showToast } from '../utils/toast'
import { logger } from '../utils/logger'
import { uploadProductImage, getProductImageUrl } from '../utils/imageStorage'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import {
  generateSecureOrderId,
  validateAndRecalculateTotal,
  validateFileSize,
  validateFileType,
  FILE_SIZE_LIMITS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_EXCEL_TYPES,
  ALLOWED_EXCEL_EXTENSIONS,
  MAX_EXCEL_ROWS,
} from '../utils/securityUtils'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { exportToGoogleSheets } from '../utils/backupService'

// Usar el cliente normal de Supabase con autenticación
// Las políticas RLS permitirán acceso solo si el usuario es admin
// NUNCA usar service_role key en el frontend por seguridad
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
  const { logout, adminUser, resetSessionTimeout } = useAdmin()
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [dateFilter, setDateFilter] = useState('todos') // 'todos', 'hoy', 'semana', 'mes'
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('todos')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState({ type: '', message: '' })
  const [showAddOrderModal, setShowAddOrderModal] = useState(false)
  const [activeTab, setActiveTab] = useState('pedidos') // 'pedidos' o 'productos'
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [isLoading, setIsLoading] = useState(false)
  const [showStats, setShowStats] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
    setCurrentPage(1) // Resetear a primera página cuando cambian los filtros
  }, [searchTerm, statusFilter, dateFilter, paymentMethodFilter, orders])

  // Resetear timeout de sesión en actividad
  useEffect(() => {
    const handleActivity = () => {
      if (resetSessionTimeout) {
        resetSessionTimeout()
      }
    }
    
    window.addEventListener('mousedown', handleActivity)
    window.addEventListener('keydown', handleActivity)
    
    return () => {
      window.removeEventListener('mousedown', handleActivity)
      window.removeEventListener('keydown', handleActivity)
    }
  }, [resetSessionTimeout])

  const filterOrders = () => {
    let filtered = orders

    // Filtrar por búsqueda (ahora incluye teléfono y dirección)
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(search) ||
          order.customer.email?.toLowerCase().includes(search) ||
          order.customer.phone?.toLowerCase().includes(search) ||
          order.shipping.address?.toLowerCase().includes(search) ||
          `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.toLowerCase().includes(search)
      )
    }

    // Filtrar por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Filtrar por fecha
    if (dateFilter !== 'todos') {
      const now = new Date()
      const today = startOfDay(now)
      const weekAgo = startOfDay(subDays(now, 7))
      const monthAgo = startOfDay(subDays(now, 30))

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.date)
        switch (dateFilter) {
          case 'hoy':
            return orderDate >= today
          case 'semana':
            return orderDate >= weekAgo
          case 'mes':
            return orderDate >= monthAgo
          default:
            return true
        }
      })
    }

    // Filtrar por método de pago
    if (paymentMethodFilter !== 'todos') {
      filtered = filtered.filter((order) => {
        const paymentMethod = order.payment?.payment_method || 'email'
        return paymentMethod === paymentMethodFilter
      })
    }

    setFilteredOrders(filtered)
  }

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      // Verificar que el usuario está autenticado como admin
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !isAdminUser(session.user)) {
        showToast.error('No tienes permisos para ver las órdenes')
        setIsLoading(false)
        return
      }

      // Usar el cliente normal de Supabase (las políticas RLS permitirán acceso solo a admins)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Error detallado cargando órdenes:', error)
        
        // Si es un error de permisos RLS, mostrar mensaje específico
        if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
          showToast.error(
            'Error de permisos: Las políticas RLS de Supabase están bloqueando el acceso. Por favor, ejecuta el script SQL en Supabase.'
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
      showToast.success(`Cargadas ${formattedOrders.length} órdenes`)
    } catch (error) {
      logger.error('Error cargando órdenes:', error)
      showToast.error('Error cargando órdenes. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!orderId || !newStatus) {
      logger.error('Error: orderId o newStatus no válidos', { orderId, newStatus })
      return
    }

    try {
      logger.log('Actualizando estado de orden:', { orderId, newStatus })
      
      const updates = {
        status: newStatus
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

      // Actualizar estado local primero para feedback inmediato
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

      // Verificar autenticación antes de actualizar
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !isAdminUser(session.user)) {
        showToast.error('No tienes permisos para actualizar órdenes')
        return
      }

      // Actualizar en Supabase (las políticas RLS permitirán solo a admins)
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()

      if (error) {
        logger.error('Error de Supabase:', error)
        // Revertir cambio local si falla
        setOrders(orders)
        throw error
      }

      logger.log('✅ Estado actualizado exitosamente:', data)
      showToast.success(`Estado del pedido actualizado a: ${ORDER_STATUSES[newStatus]?.label || newStatus}`)

      // Enviar email de notificación al cliente (sin bloquear si falla)
      const updatedOrder = updatedOrders.find(o => o.id === orderId)
      if (updatedOrder) {
        try {
          await sendNotificationEmail(updatedOrder, newStatus)
        } catch (emailError) {
          logger.error('Error enviando email (no crítico):', emailError)
          // No mostrar error al usuario si el email falla
        }
      }
    } catch (error) {
      logger.error('Error actualizando orden:', error)
      showToast.error('Error actualizando orden. Por favor, intenta de nuevo.')
      // Recargar órdenes para sincronizar
      loadOrders()
    }
  }

  const sendNotificationEmail = async (order, status) => {
    if (!order) return

    try {
      const result = await sendCustomerConfirmationEmail(order, status)
      
      if (result.success) {
        logger.log(`✅ Email de confirmación enviado a ${order.customer.email}`)
        
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
        logger.warn('Email no enviado, pero guardado para procesamiento posterior')
      }
    } catch (error) {
      logger.error('Error enviando email de notificación:', error)
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
    const paidOrders = orders.filter((o) => o.status === 'paid').length
    const shippedOrders = orders.filter((o) => o.status === 'shipped').length
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length

    // Estadísticas por fecha
    const today = startOfDay(new Date())
    const weekAgo = startOfDay(subDays(new Date(), 7))
    const monthAgo = startOfDay(subDays(new Date(), 30))

    const todayOrders = orders.filter(o => new Date(o.date) >= today)
    const weekOrders = orders.filter(o => new Date(o.date) >= weekAgo)
    const monthOrders = orders.filter(o => new Date(o.date) >= monthAgo)

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)
    const weekRevenue = weekOrders.reduce((sum, order) => sum + order.total, 0)
    const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0)

    // Estadísticas por estado para gráfico
    const statusData = [
      { name: 'Pendiente', value: pendingOrders, color: '#fbbf24' },
      { name: 'Procesando', value: processingOrders, color: '#3b82f6' },
      { name: 'Pagado', value: paidOrders, color: '#10b981' },
      { name: 'Enviado', value: shippedOrders, color: '#a855f7' },
      { name: 'Entregado', value: deliveredOrders, color: '#059669' },
      { name: 'Cancelado', value: cancelledOrders, color: '#ef4444' },
    ]

    // Ventas por día (últimos 7 días)
    const salesByDay = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.date)
        return orderDate >= dayStart && orderDate <= dayEnd
      })
      salesByDay.push({
        date: format(date, 'dd/MM'),
        ventas: dayOrders.length,
        ingresos: dayOrders.reduce((sum, o) => sum + o.total, 0),
      })
    }

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      paidOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrders: todayOrders.length,
      todayRevenue,
      weekOrders: weekOrders.length,
      weekRevenue,
      monthOrders: monthOrders.length,
      monthRevenue,
      statusData,
      salesByDay,
    }
  }

  // Función para exportar pedidos a Excel
  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx')
      
      // Preparar datos para exportar
      const dataToExport = filteredOrders.map(order => ({
        'ID Pedido': order.id,
        'Fecha': format(new Date(order.date), 'dd/MM/yyyy HH:mm'),
        'Cliente': `${order.customer.firstName} ${order.customer.lastName}`,
        'Email': order.customer.email,
        'Teléfono': order.customer.phone,
        'Dirección': order.shipping.address,
        'Ciudad': order.shipping.city,
        'Estado/Provincia': order.shipping.state,
        'Código Postal': order.shipping.zipCode,
        'Total': order.total,
        'Estado Pedido': ORDER_STATUSES[order.status]?.label || order.status,
        'Método de Pago': order.payment?.payment_method || 'email',
        'Tracking': order.trackingNumber || '',
        'Productos': order.items.map(item => `${item.name} (x${item.quantity})`).join('; '),
      }))

      // Crear workbook
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(dataToExport)
      
      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 20 }, // ID Pedido
        { wch: 18 }, // Fecha
        { wch: 25 }, // Cliente
        { wch: 30 }, // Email
        { wch: 15 }, // Teléfono
        { wch: 30 }, // Dirección
        { wch: 20 }, // Ciudad
        { wch: 20 }, // Estado
        { wch: 12 }, // Código Postal
        { wch: 12 }, // Total
        { wch: 15 }, // Estado
        { wch: 15 }, // Método de Pago
        { wch: 20 }, // Tracking
        { wch: 50 }, // Productos
      ]
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, 'Pedidos')
      
      // Generar nombre de archivo con fecha
      const fileName = `pedidos_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`
      
      // Descargar
      XLSX.writeFile(wb, fileName)
      showToast.success(`Exportados ${filteredOrders.length} pedidos a Excel`)
    } catch (error) {
      logger.error('Error exportando a Excel:', error)
      showToast.error('Error al exportar a Excel. Por favor, intenta de nuevo.')
    }
  }

  // Paginación
  const indexOfLastOrder = currentPage * itemsPerPage
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const stats = getStatistics()

  const handleLogout = async () => {
    try {
      await logout()
      // Esperar un momento para que el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 100))
      // Redirigir al home para que el Layout muestre el contenido normal
      window.location.href = '/'
    } catch (error) {
      logger.error('Error al cerrar sesión:', error)
      // Forzar recarga de la página
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-primary-black">
                Panel de Administración
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                Bienvenido, {adminUser?.name || 'Admin'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await exportToGoogleSheets(orders)
                    showToast.success('Backup exportado exitosamente')
                  } catch (error) {
                    showToast.error('Error al exportar backup: ' + error.message)
                  }
                }}
                className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm"
                title="Exportar backup"
              >
                📥 Backup
              </button>
              <button
                onClick={handleLogout}
                className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs md:text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
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

        {/* Estadísticas Expandidas con Gráficos */}
        {showStats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary-black">Estadísticas y Reportes</h2>
              <button
                onClick={() => setShowStats(!showStats)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showStats ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            
            {/* KPIs Adicionales */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-600">Hoy</p>
                <p className="text-lg font-bold text-blue-600">{stats.todayOrders}</p>
                <p className="text-xs text-gray-500">${stats.todayRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-600">Esta Semana</p>
                <p className="text-lg font-bold text-green-600">{stats.weekOrders}</p>
                <p className="text-xs text-gray-500">${stats.weekRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-gray-600">Este Mes</p>
                <p className="text-lg font-bold text-purple-600">{stats.monthOrders}</p>
                <p className="text-xs text-gray-500">${stats.monthRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-xs text-gray-600">Pendientes</p>
                <p className="text-lg font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-600">Procesando</p>
                <p className="text-lg font-bold text-blue-600">{stats.processingOrders}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-600">Entregados</p>
                <p className="text-lg font-bold text-green-600">{stats.deliveredOrders}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-xs text-gray-600">Cancelados</p>
                <p className="text-lg font-bold text-red-600">{stats.cancelledOrders}</p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Ventas por Día */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Ventas Últimos 7 Días</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats.salesByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ventas" stroke="#ef4444" name="Pedidos" />
                    <Line type="monotone" dataKey="ingresos" stroke="#10b981" name="Ingresos ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Estados */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Distribución por Estado</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.statusData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Filtros y Búsqueda Avanzada */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por ID, email, nombre, teléfono, dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                />
              </div>
              <button
                onClick={exportToExcel}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
              >
                <PrinterIcon className="h-5 w-5" />
                Exportar Excel
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <FunnelIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-8 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow appearance-none bg-white"
                >
                  <option value="todos">Todos los estados</option>
                  {Object.entries(ORDER_STATUSES).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <FunnelIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-12 pr-8 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow appearance-none bg-white"
                >
                  <option value="todos">Todas las fechas</option>
                  <option value="hoy">Hoy</option>
                  <option value="semana">Última semana</option>
                  <option value="mes">Último mes</option>
                </select>
              </div>
              <div className="relative">
                <FunnelIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="w-full pl-12 pr-8 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow appearance-none bg-white"
                >
                  <option value="todos">Todos los métodos</option>
                  <option value="email">Email</option>
                  <option value="credit">Tarjeta de Crédito</option>
                  <option value="debit">Tarjeta de Débito</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Mostrando {filteredOrders.length} de {orders.length} pedidos
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
                {currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {isLoading ? 'Cargando...' : 'No se encontraron órdenes'}
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => {
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
                              value={order.status || 'pending'}
                              onChange={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                const newStatus = e.target.value
                                if (newStatus && newStatus !== order.status) {
                                  updateOrderStatus(order.id, newStatus)
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-yellow bg-white cursor-pointer"
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
      const orderId = orderIdMatch ? orderIdMatch[1] : generateSecureOrderId()

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
      const orderId = parsedData?.orderId || generateSecureOrderId()
      
      const [firstName, ...lastNameParts] = manualForm.customerName.split(' ')
      const lastName = lastNameParts.join(' ') || ''

      // Filtrar items válidos
      const validItems = manualForm.items.filter(item => item.name && item.quantity > 0)
      
      // Calcular total basado en items
      const calculatedTotal = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const providedTotal = manualForm.total || calculatedTotal

      // Validar y recalcular total para prevenir manipulación
      const totalValidation = validateAndRecalculateTotal(validItems, providedTotal)
      if (!totalValidation.isValid) {
        logger.error('Validación de precio fallida en orden manual:', totalValidation.error)
        setError(`Error de validación: ${totalValidation.error}`)
        setIsProcessing(false)
        return
      }

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
        items: validItems,
        total: totalValidation.calculatedTotal, // Usar total validado
        status: 'pending',
        payment_status: 'pending',
        payment_data: {
          payment_method: 'email',
        },
        user_id: null,
      }

      // Verificar autenticación antes de insertar
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !isAdminUser(session.user)) {
        throw new Error('No tienes permisos para crear órdenes')
      }

      const { error: supabaseError } = await supabase
        .from('orders')
        .insert([orderData])

      if (supabaseError) throw supabaseError

      onOrderAdded()
    } catch (err) {
      logger.error('Error guardando pedido:', err)
      setError('Error al guardar el pedido. Por favor, intenta de nuevo.')
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

// Componente de Gestión de Productos
function ProductManagementSection() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showExcelPreview, setShowExcelPreview] = useState(false)
  const [excelPreviewData, setExcelPreviewData] = useState([])
  const excelFileInputRef = useRef(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    brand: '',
    price: '',
    category: '',
    description: '',
    image: '',
    previousPrice: ''
  })
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [productSearchTerm, setProductSearchTerm] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    // Extraer categorías y marcas únicas de productos
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))]
    const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))]
    setCategories(uniqueCategories.sort())
    setBrands(uniqueBrands.sort())
  }, [products])

  // Función helper para guardar productos y notificar actualización en tiempo real
  const saveProductsAndNotify = (updatedProducts) => {
    setProducts(updatedProducts)
    localStorage.setItem('giaElectroProducts', JSON.stringify(updatedProducts))
    
    // Disparar evento personalizado para actualización en tiempo real en la misma ventana
    window.dispatchEvent(new CustomEvent('productsUpdated', { 
      detail: { products: updatedProducts } 
    }))
    
    // También disparar evento storage para otras ventanas/pestañas
    window.dispatchEvent(new Event('storage'))
  }

  const loadProducts = () => {
    // Cargar productos desde localStorage solamente
    try {
      const savedProducts = localStorage.getItem('giaElectroProducts')
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts))
      } else {
        // No cargar productos iniciales, empezar vacío
        setProducts([])
      }
    } catch (error) {
      logger.error('Error cargando productos:', error)
      setProducts([])
    }
  }

  const handleExcelUpload = async (e) => {
    console.log('🟢 handleExcelUpload llamado')
    console.log('🟢 Event:', e)
    console.log('🟢 Target:', e.target)
    console.log('🟢 Files:', e.target.files)
    
    const file = e.target.files[0]
    
    // Agregar logging directo a consola (no solo logger)
    console.log('📄 Archivo seleccionado:', file?.name)
    console.log('📄 Tipo MIME:', file?.type)
    console.log('📄 Tamaño:', file?.size, 'bytes')
    logger.log('Archivo seleccionado:', file?.name)
    logger.log('Tipo MIME:', file?.type)
    logger.log('Tamaño:', file?.size, 'bytes')
    
    if (!file) {
      console.warn('⚠️ No se seleccionó ningún archivo')
      logger.warn('No se seleccionó ningún archivo')
      return
    }

    // Validar tamaño del archivo
    const sizeValidation = validateFileSize(file, FILE_SIZE_LIMITS.EXCEL)
    if (!sizeValidation.isValid) {
      console.error('❌ Error de tamaño:', sizeValidation.error)
      logger.error('Error de tamaño:', sizeValidation.error)
      showToast.error(sizeValidation.error)
      e.target.value = '' // Limpiar input
      return
    }
    console.log('✅ Validación de tamaño pasada')

    // Validar tipo de archivo - Hacer más flexible
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    const isValidExtension = ALLOWED_EXCEL_EXTENSIONS.includes(fileExtension)
    const isValidMimeType = !file.type || ALLOWED_EXCEL_TYPES.includes(file.type) || file.type === 'application/octet-stream'
    
    console.log('📋 Validación de tipo:')
    console.log('📋 Extensión:', fileExtension, 'Válida:', isValidExtension)
    console.log('📋 MIME:', file.type, 'Válido:', isValidMimeType)
    logger.log('Validación:', { fileExtension, isValidExtension, mimeType: file.type, isValidMimeType })
    
    if (!isValidExtension) {
      const error = `Extensión de archivo no permitida. Extensión recibida: ${fileExtension}. Extensiones permitidas: ${ALLOWED_EXCEL_EXTENSIONS.join(', ')}`
      console.error('❌ Error de extensión:', error)
      logger.error('Error de extensión:', error)
      showToast.error(error)
      e.target.value = ''
      return
    }
    
    // Si el tipo MIME no coincide pero la extensión es válida, continuar (algunos Excel tienen tipos MIME diferentes)
    if (!isValidMimeType && file.type) {
      console.warn('⚠️ Tipo MIME no reconocido pero extensión válida:', file.type, 'Continuando...')
      logger.warn('Tipo MIME no reconocido pero extensión válida:', file.type, 'Continuando...')
    }
    console.log('✅ Validación de tipo pasada')

    console.log('⏳ Iniciando carga del archivo...')
    setIsLoading(true)
    setUploadStatus({ type: '', message: '' })

    try {
      console.log('📚 Cargando librería XLSX...')
      const XLSX = await import('xlsx')
      console.log('📚 Librería XLSX cargada')
      const reader = new FileReader()
      
      console.log('📖 Configurando FileReader...')

      reader.onload = (event) => {
        try {
          console.log('📖 FileReader onload ejecutado')
          console.log('📖 Event result type:', typeof event.target.result)
          console.log('📖 Event result length:', event.target.result?.byteLength || event.target.result?.length)
          logger.log('Leyendo archivo Excel...')
          
          const data = new Uint8Array(event.target.result)
          console.log('📊 Datos convertidos a Uint8Array, longitud:', data.length)
          
          const workbook = XLSX.read(data, { type: 'array' })
          console.log('📊 Workbook leído, hojas:', workbook.SheetNames)
          
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          console.log('📋 Primera hoja seleccionada:', workbook.SheetNames[0])
          
          const jsonData = XLSX.utils.sheet_to_json(firstSheet)
          console.log('📋 JSON convertido, filas:', jsonData.length)
          console.log('📋 Primera fila de ejemplo:', jsonData[0])
          
          logger.log('Datos leídos:', jsonData.length, 'filas')
          logger.log('Primera fila de ejemplo:', jsonData[0])
          
          console.log('🔍 Iniciando validación de datos...')
          console.log('🔍 Datos completos del JSON:', jsonData)

          // Validar límite de filas
          if (jsonData.length > MAX_EXCEL_ROWS) {
            console.error('❌ Error: Demasiadas filas')
            throw new Error(`El archivo tiene demasiadas filas (${jsonData.length}). Máximo permitido: ${MAX_EXCEL_ROWS} filas.`)
          }
          console.log('✅ Validación de límite de filas pasada')

          // Validar datos primero
          console.log('🔍 Validando filas...')
          const validationErrors = []
          jsonData.forEach((row, index) => {
            console.log(`🔍 Validando fila ${index + 2}:`, row)
            console.log(`🔍 Campos disponibles en fila ${index + 2}:`, Object.keys(row))
            
            const hasName = row.Nombre || row.name || row.nombre || row.Producto || row.Nombre_Producto
            console.log(`🔍 ¿Tiene nombre? ${hasName ? 'Sí' : 'No'}`, { Nombre: row.Nombre, name: row.name, nombre: row.nombre, Producto: row.Producto, Nombre_Producto: row.Nombre_Producto })
            
            if (!hasName) {
              validationErrors.push(`Fila ${index + 2}: Falta el nombre del producto`)
            }
            
            const price = parseFloat(row.Precio || row.price || row.precio || row.PRECIO || 0)
            console.log(`🔍 Precio en fila ${index + 2}:`, { Precio: row.Precio, price: row.price, precio: row.precio, PRECIO: row.PRECIO, parsed: price })
            
            if (!price || price <= 0) {
              validationErrors.push(`Fila ${index + 2}: Precio inválido`)
            }
          })

          console.log('🔍 Errores de validación encontrados:', validationErrors.length)
          if (validationErrors.length > 0) {
            console.error('❌ Errores de validación:', validationErrors)
            setUploadStatus({
              type: 'error',
              message: `Errores de validación:\n${validationErrors.slice(0, 5).join('\n')}${validationErrors.length > 5 ? `\n... y ${validationErrors.length - 5} más` : ''}`
            })
            setIsLoading(false)
            return
          }
          console.log('✅ Validación de datos pasada')

          // Función de validación y sanitización de datos del producto
          const validateAndSanitizeProduct = (product, index) => {
            // Validar que name no contenga scripts o código malicioso
            if (product.name && (/<script|javascript:|on\w+=/i.test(product.name))) {
              throw new Error(`Fila ${index + 2}: El nombre del producto contiene caracteres no permitidos`)
            }
            
            // Validar que price sea un número positivo
            if (isNaN(product.price) || product.price <= 0) {
              throw new Error(`Fila ${index + 2}: El precio debe ser un número positivo`)
            }
            
            // Sanitizar name (remover caracteres peligrosos)
            if (product.name) {
              product.name = product.name
                .replace(/[<>]/g, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+=/gi, '')
                .trim()
            }
            
            // Sanitizar description
            if (product.description) {
              product.description = product.description
                .replace(/[<>]/g, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+=/gi, '')
            }
            
            // Validar que category sea válida
            if (product.category && product.category.length > 50) {
              product.category = product.category.substring(0, 50)
            }
            
            return product
          }

          // Procesar datos
          console.log('🔄 Iniciando procesamiento de productos...')
          const processedProducts = jsonData.map((row, index) => {
            // Mapear columnas del Excel a la estructura del producto
            const productId = row.ID || row.id || row.Id || (index + 1)
            const productName = row.Nombre || row.name || row.nombre || row.Producto || row.Nombre_Producto || ''
            const productPrice = parseFloat(row.Precio || row.price || row.precio || row.PRECIO || 0)
            const productCategory = row.Categoria || row.category || row.categoria || row.CATEGORIA || 'otros'
            const productBrand = row.Marca || row.brand || row.marca || row.MARCA || ''
            const productDescription = row.Descripcion || row.description || row.descripcion || row.DESCRIPCION || ''
            const productImage = row.Imagen || row.image || row.imagen || row.IMAGEN || row.Imagen_URL || ''
            const previousPrice = row['Precio Anterior'] || row['precio anterior'] || row.previousPrice || row.PRECIO_ANTERIOR ? parseFloat(row['Precio Anterior'] || row['precio anterior'] || row.previousPrice || row.PRECIO_ANTERIOR) : null

            const product = {
              id: productId,
              name: productName,
              brand: productBrand,
              price: productPrice,
              category: productCategory.toLowerCase().replace(/\s+/g, '-'),
              description: productDescription,
              image: productImage,
              previousPrice: previousPrice,
            }
            
            // Validar y sanitizar
            return validateAndSanitizeProduct(product, index)
          }).filter(p => p.name && p.price > 0)

          console.log('✅ Productos procesados:', processedProducts.length)
          if (processedProducts.length > 0) {
            console.log('📦 Primer producto procesado:', processedProducts[0])
          }

          if (processedProducts.length === 0) {
            console.error('❌ No se encontraron productos válidos')
            throw new Error('No se encontraron productos válidos en el archivo Excel')
          }

          // Mostrar preview antes de confirmar
          console.log('👁️ Mostrando preview...')
          setExcelPreviewData(processedProducts)
          setShowExcelPreview(true)
          setIsLoading(false)
          console.log('✅ Preview configurado, modal debería mostrarse')
          
          // Limpiar input
          e.target.value = ''
        } catch (error) {
          logger.error('Error procesando Excel:', error)
          showToast.error('Error al procesar el archivo Excel. Por favor, verifica el formato del archivo.')
          setIsLoading(false)
        }
      }

      reader.onerror = (error) => {
        console.error('❌ Error en FileReader:', error)
        setUploadStatus({
          type: 'error',
          message: 'Error al leer el archivo'
        })
        setIsLoading(false)
      }
      
      reader.onloadend = () => {
        console.log('📖 FileReader onloadend ejecutado')
      }

      console.log('📖 Iniciando lectura del archivo como ArrayBuffer...')
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('❌ Error en try/catch principal:', error)
      console.error('❌ Stack trace:', error.stack)
      logger.error('Error cargando librería Excel:', error)
      setUploadStatus({
        type: 'error',
        message: 'Error al cargar el archivo Excel. Asegúrate de que el archivo sea válido.'
      })
      setIsLoading(false)
    }
  }

  const confirmExcelUpload = () => {
    // Leer productos existentes desde localStorage
    const savedProducts = localStorage.getItem('giaElectroProducts')
    let existingProducts = []
    
    if (savedProducts) {
      try {
        existingProducts = JSON.parse(savedProducts)
      } catch (error) {
        console.error('Error parseando productos desde localStorage:', error)
      }
    }
    
    // Si no hay productos en localStorage pero hay en el estado, usar el estado
    // Esto es importante porque la página ahora empieza vacía
    if (existingProducts.length === 0 && products.length > 0) {
      existingProducts = [...products]
    }
    
    // Empezar con todos los productos existentes
    const mergedProducts = [...existingProducts]
    
    // Procesar cada producto del Excel
    excelPreviewData.forEach(newProduct => {
      const existingIndex = mergedProducts.findIndex(p => String(p.id) === String(newProduct.id))
      if (existingIndex >= 0) {
        // Actualizar producto existente
        console.log(`🔄 Actualizando producto ID ${newProduct.id}`)
        mergedProducts[existingIndex] = newProduct
      } else {
        // Agregar nuevo producto
        console.log(`➕ Agregando nuevo producto ID ${newProduct.id}`)
        mergedProducts.push(newProduct)
      }
    })
    
    console.log('📦 Total de productos después del merge:', mergedProducts.length)
    
    // Guardar y actualizar estado
    saveProductsAndNotify(mergedProducts)
    
    const addedCount = excelPreviewData.filter(p => 
      !existingProducts.some(existing => String(existing.id) === String(p.id))
    ).length
    const updatedCount = excelPreviewData.length - addedCount
    
    let message = `✅ ${excelPreviewData.length} productos procesados`
    if (addedCount > 0) message += ` (${addedCount} nuevos)`
    if (updatedCount > 0) message += ` (${updatedCount} actualizados)`
    
    showToast.success(message)
    setShowExcelPreview(false)
    setExcelPreviewData([])
  }

  const cancelExcelUpload = () => {
    setShowExcelPreview(false)
    setExcelPreviewData([])
  }

  const updateProduct = (productId, field, value) => {
    const updatedProducts = products.map(p =>
      p.id === productId ? { ...p, [field]: value } : p
    )
    saveProductsAndNotify(updatedProducts)
    showToast.success('Producto actualizado')
  }

  const deleteProduct = (productId) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      const updatedProducts = products.filter(p => p.id !== productId)
      saveProductsAndNotify(updatedProducts)
      showToast.success('Producto eliminado')
    }
  }

  const handleAddProduct = () => {
    // Validar campos requeridos
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      showToast.error('Por favor completa los campos requeridos: Nombre, Precio y Categoría')
      return
    }

    // Validar que el precio sea un número válido
    const price = parseFloat(newProduct.price)
    if (isNaN(price) || price <= 0) {
      showToast.error('El precio debe ser un número mayor a 0')
      return
    }

    // Validar que el ID no esté duplicado
    const existingProduct = products.find(p => String(p.id) === String(newProduct.id))
    if (existingProduct) {
      showToast.error(`Ya existe un producto con el ID ${newProduct.id}`)
      return
    }

    // Crear el producto
    const product = {
      id: newProduct.id,
      name: newProduct.name.trim(),
      brand: newProduct.brand.trim() || '',
      price: price,
      category: newProduct.category.toLowerCase().replace(/\s+/g, '-'),
      description: newProduct.description.trim() || '',
      image: newProduct.image.trim() || '',
      previousPrice: newProduct.previousPrice ? parseFloat(newProduct.previousPrice) : null
    }

    // Agregar el producto
    const updatedProducts = [...products, product]
    saveProductsAndNotify(updatedProducts)

    // Limpiar formulario y cerrar modal
    setNewProduct({
      id: '',
      name: '',
      brand: '',
      price: '',
      category: '',
      description: '',
      image: '',
      previousPrice: ''
    })
    setShowAddProductModal(false)
    showToast.success('Producto agregado exitosamente')
  }

  const handleImageFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) {
      setSelectedImageFile(null)
      setImagePreview(null)
      return
    }

    // Validar tamaño del archivo
    const sizeValidation = validateFileSize(file, FILE_SIZE_LIMITS.IMAGE)
    if (!sizeValidation.isValid) {
      showToast.error(sizeValidation.error)
      e.target.value = ''
      setSelectedImageFile(null)
      setImagePreview(null)
      return
    }

    // Validar tipo de archivo
    const typeValidation = validateFileType(file, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS)
    if (!typeValidation.isValid) {
      showToast.error(typeValidation.error)
      e.target.value = ''
      setSelectedImageFile(null)
      setImagePreview(null)
      return
    }

    // Guardar archivo y crear preview
    setSelectedImageFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const confirmImageUpload = async () => {
    if (!selectedImageFile || !selectedProduct) return

    setIsLoading(true)
    try {
      // Subir imagen a Supabase Storage
      const imageUrl = await uploadProductImage(selectedImageFile, selectedProduct.id)
      
      // Actualizar producto con nueva URL de imagen
      const updatedProducts = products.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, image: imageUrl }
          : p
      )
      
      saveProductsAndNotify(updatedProducts)
      
      showToast.success('Imagen actualizada exitosamente')
      
      // Limpiar estados
      setShowImageUpload(false)
      setSelectedProduct(null)
      setSelectedImageFile(null)
      setImagePreview(null)
      setIsLoading(false)
    } catch (error) {
      logger.error('Error subiendo imagen:', error)
      showToast.error(error.message || 'Error al subir la imagen. Por favor, intenta de nuevo.')
      setIsLoading(false)
    }
  }

  const updateProductPrice = (productId, newPrice) => {
    const updatedProducts = products.map(p =>
      p.id === productId ? { ...p, price: parseFloat(newPrice) || 0 } : p
    )
    saveProductsAndNotify(updatedProducts)
  }

  return (
    <div className="space-y-6">
      {/* Header de Productos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-primary-black mb-2">
              Gestión de Productos
            </h2>
            <p className="text-gray-600">
              {products.length} productos en el catálogo
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => {
                // Generar ID automático si no hay productos o usar el siguiente ID
                const maxId = products.length > 0 ? Math.max(...products.map(p => Number(p.id) || 0)) : 0
                setNewProduct({
                  id: (maxId + 1).toString(),
                  name: '',
                  brand: '',
                  price: '',
                  category: '',
                  description: '',
                  image: '',
                  previousPrice: ''
                })
                setShowAddProductModal(true)
              }}
              className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Agregar Producto</span>
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('🔵 Botón Subir Excel clickeado')
                console.log('🔵 Ref del input:', excelFileInputRef.current)
                logger.log('Botón Subir Excel clickeado')
                if (excelFileInputRef.current) {
                  excelFileInputRef.current.click()
                  console.log('🔵 Click en input ejecutado')
                } else {
                  console.error('❌ El ref del input no está disponible')
                }
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-primary-yellow text-primary-black rounded-lg hover:bg-yellow-500 transition-colors font-semibold cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Cargando...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5" />
                  <span>Subir Excel</span>
                </>
              )}
            </button>
            <input
              ref={excelFileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              className="hidden"
              disabled={isLoading}
            />
            <button
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Categorías y Marcas</span>
            </button>
          </div>
        </div>


        {/* Instrucciones para Excel */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-primary-black mb-2">📋 Formato del archivo Excel:</h3>
          <p className="text-sm text-gray-700 mb-2">
            El archivo Excel debe tener las siguientes columnas (la primera fila debe ser el encabezado):
          </p>
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
            <li><strong>ID</strong> o <strong>id</strong>: ID único del producto (número)</li>
            <li><strong>Nombre</strong> o <strong>name</strong> o <strong>Producto</strong>: Nombre del producto (requerido)</li>
            <li><strong>Precio</strong> o <strong>price</strong>: Precio del producto (requerido, número)</li>
            <li><strong>Categoria</strong> o <strong>category</strong>: Categoría del producto (requerido)</li>
            <li><strong>Marca</strong> o <strong>brand</strong>: Marca (opcional)</li>
            <li><strong>Descripcion</strong> o <strong>description</strong>: Descripción (opcional)</li>
            <li><strong>Imagen</strong> o <strong>image</strong> o <strong>Imagen_URL</strong>: URL o ruta de imagen (opcional, también puedes subir imágenes individualmente)</li>
            <li><strong>Precio Anterior</strong> o <strong>previousPrice</strong>: Precio anterior para mostrar oferta (opcional)</li>
          </ul>
        </div>
      </div>

      {/* Buscador/Filtro de Productos */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos por nombre, marca, categoría o ID..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
            />
          </div>
          {productSearchTerm && (
            <button
              onClick={() => setProductSearchTerm('')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
        {productSearchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Mostrando resultados para: <strong>"{productSearchTerm}"</strong>
          </p>
        )}
      </div>

      {/* Lista de Productos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading && products.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-yellow"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {(() => {
              // Filtrar productos basado en el término de búsqueda
              const filteredProducts = productSearchTerm
                ? products.filter(product => {
                    const searchLower = productSearchTerm.toLowerCase()
                    return (
                      String(product.id).toLowerCase().includes(searchLower) ||
                      (product.name && product.name.toLowerCase().includes(searchLower)) ||
                      (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
                      (product.category && product.category.toLowerCase().includes(searchLower)) ||
                      (product.description && product.description.toLowerCase().includes(searchLower))
                    )
                  })
                : products

              return (
                <>
                  {filteredProducts.length === 0 && products.length > 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No se encontraron productos que coincidan con "{productSearchTerm}"</p>
                      <button
                        onClick={() => setProductSearchTerm('')}
                        className="mt-4 text-primary-red hover:underline"
                      >
                        Limpiar búsqueda
                      </button>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Imagen</th>
                          <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                          <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Categoría</th>
                          <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                          <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                              Aún no hay productos cargados
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm">{product.id}</td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <img
                        src={getProductImageUrl(product.image) || getPlaceholderImage(50, 50, 'Sin imagen')}
                        alt={product.name}
                        className="w-12 h-12 md:w-16 md:h-16 object-cover rounded"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = getPlaceholderImage(50, 50, 'Sin imagen')
                        }}
                      />
                    </td>
                    <td className="px-3 md:px-6 py-4">
                      {editingProduct?.id === product.id ? (
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onBlur={() => {
                            updateProduct(product.id, 'name', editingProduct.name)
                            setEditingProduct(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateProduct(product.id, 'name', editingProduct.name)
                              setEditingProduct(null)
                            }
                            if (e.key === 'Escape') {
                              setEditingProduct(null)
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary-red"
                          onClick={() => setEditingProduct(product)}
                        >
                          {product.name}
                        </div>
                      )}
                      {product.brand && (
                        <div className="text-xs md:text-sm text-gray-500">{product.brand}</div>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                      {editingProduct?.id === product.id ? (
                        <select
                          value={editingProduct.category}
                          onChange={(e) => {
                            const newProduct = { ...editingProduct, category: e.target.value }
                            setEditingProduct(newProduct)
                            updateProduct(product.id, 'category', e.target.value)
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      ) : (
                        <span 
                          className="text-gray-500 cursor-pointer hover:text-primary-red"
                          onClick={() => setEditingProduct(product)}
                        >
                          {product.category}
                        </span>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => updateProductPrice(product.id, e.target.value)}
                        className="w-20 md:w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-yellow text-sm font-semibold"
                      />
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product)
                            setShowImageUpload(true)
                          }}
                          className="text-primary-yellow hover:text-yellow-600 font-semibold text-xs sm:text-sm"
                        >
                          Imagen
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800 font-semibold text-xs sm:text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                          </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </>
              )
            })()}
          </div>
        )}
      </div>

      {/* Modal de Preview de Excel */}
      {showExcelPreview && excelPreviewData.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary-black">
                Vista Previa - {excelPreviewData.length} productos
              </h2>
              <button
                onClick={cancelExcelUpload}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Revisa los productos antes de confirmar. Se reemplazarán todos los productos actuales.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {excelPreviewData.slice(0, 20).map((product, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">{product.id}</td>
                        <td className="px-4 py-2 text-sm">{product.name}</td>
                        <td className="px-4 py-2 text-sm">{product.category}</td>
                        <td className="px-4 py-2 text-sm font-semibold">${product.price.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm">{product.brand || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {excelPreviewData.length > 20 && (
                  <p className="mt-4 text-sm text-gray-500 text-center">
                    ... y {excelPreviewData.length - 20} productos más
                  </p>
                )}
              </div>

              <div className="flex gap-4 mt-6 pt-4 border-t">
                <button
                  onClick={cancelExcelUpload}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmExcelUpload}
                  className="flex-1 px-6 py-3 bg-primary-yellow text-primary-black rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                >
                  Confirmar y Cargar {excelPreviewData.length} Productos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para subir imagen */}
      {showImageUpload && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-primary-black">
                Subir Imagen para: {selectedProduct.name}
              </h3>
              <button
                onClick={() => {
                  setShowImageUpload(false)
                  setSelectedProduct(null)
                  setSelectedImageFile(null)
                  setImagePreview(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Imagen
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos soportados: JPG, PNG, GIF, WebP
                </p>
              </div>

              {/* Vista previa de la nueva imagen seleccionada */}
              {imagePreview && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-contain border border-gray-300 rounded"
                  />
                </div>
              )}

              {/* Imagen actual del producto */}
              {selectedProduct.image && !imagePreview && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Imagen Actual:</p>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-48 object-contain border border-gray-300 rounded"
                    onError={(e) => {
                      e.target.src = getPlaceholderImage(200, 200, 'Sin imagen')
                    }}
                  />
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowImageUpload(false)
                    setSelectedProduct(null)
                    setSelectedImageFile(null)
                    setImagePreview(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmImageUpload}
                  disabled={isLoading || !selectedImageFile}
                  className="flex-1 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Subiendo...' : 'Subir Imagen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar producto manualmente */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-primary-black">
                Agregar Nuevo Producto
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddProduct()
              }}
              className="p-6 space-y-4"
            >
              {/* ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProduct.id}
                  onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  required
                  placeholder="Ej: 23"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  required
                  placeholder="Ej: Smart TV 55 pulgadas"
                />
              </div>

              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  placeholder="Ej: Samsung"
                  list="brands-list"
                />
                <datalist id="brands-list">
                  {brands.map((brand) => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
              </div>

              {/* Precio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                    required
                    placeholder="Ej: 899.99"
                  />
                </div>

                {/* Precio Anterior */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Anterior (Oferta)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.previousPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, previousPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                    placeholder="Ej: 1099.99"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  required
                  placeholder="Ej: televisores"
                  list="categories-list"
                />
                <datalist id="categories-list">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-500 mt-1">
                  Se convertirá automáticamente a formato slug (ej: "aires acondicionados" → "aires-acondicionados")
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  rows="3"
                  placeholder="Descripción detallada del producto..."
                />
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Imagen
                </label>
                <input
                  type="text"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  placeholder="URL de la imagen o base64 (data:image/...)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Puedes ingresar una URL de imagen o un string base64. También puedes subir la imagen después desde la tabla de productos.
                </p>
                {newProduct.image && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</p>
                    <img
                      src={newProduct.image}
                      alt="Preview"
                      className="w-full h-48 object-contain border border-gray-300 rounded"
                      onError={(e) => {
                        e.target.src = getPlaceholderImage(200, 200, 'Imagen no válida')
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-red text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

