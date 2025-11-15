import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import {
  CheckCircleIcon,
  PrinterIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

function Confirmacion() {
  const { orderId } = useParams()
  const location = useLocation()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    // Obtener orden del state o del localStorage
    if (location.state?.order) {
      setOrder(location.state.order)
    } else {
      // Intentar obtener del localStorage
      const orders = JSON.parse(localStorage.getItem('giaElectroOrders') || '[]')
      const foundOrder = orders.find((o) => o.id === orderId)
      if (foundOrder) {
        setOrder(foundOrder)
      }
    }
  }, [orderId, location.state])

  const handlePrint = () => {
    window.print()
  }

  if (!order) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <p className="text-gray-600 text-xl">
              No se encontró la orden solicitada
            </p>
            <Link to="/catalogo" className="btn-primary mt-6 inline-block">
              Ir al Catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(order.date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header de Confirmación */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-4">
              ¡Pedido Confirmado!
            </h1>
            <p className="text-gray-600 text-lg">
              Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
            </p>
          </div>

          {/* Detalles del Pedido */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-primary-black mb-2">
                  Orden #{order.id}
                </h2>
                <p className="text-gray-600">Fecha: {formattedDate}</p>
              </div>
              <button
                onClick={handlePrint}
                className="mt-4 md:mt-0 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <PrinterIcon className="h-5 w-5" />
                <span>Imprimir</span>
              </button>
            </div>

            {/* Información del Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold text-primary-black mb-3">
                  Información del Cliente
                </h3>
                <div className="text-gray-600 space-y-1">
                  <p>
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p>{order.customer.email}</p>
                  <p>{order.customer.phone}</p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-primary-black mb-3">
                  Dirección de Envío
                </h3>
                <div className="text-gray-600 space-y-1">
                  <p>{order.shipping.address}</p>
                  <p>
                    {order.shipping.city}, {order.shipping.state}{' '}
                    {order.shipping.zipCode}
                  </p>
                  <p>{order.shipping.country}</p>
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="mb-6">
              <h3 className="font-bold text-primary-black mb-4">
                Productos Pedidos
              </h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      {item.brand && (
                        <p className="text-sm text-gray-600">Marca: {item.brand}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-red">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${item.price.toLocaleString()} c/u
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen Total */}
            <div className="border-t border-gray-300 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-primary-black">Total</span>
                <span className="text-3xl font-bold text-primary-red">
                  ${order.total.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Método de pago: {order.paymentMethod === 'credit' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}
              </p>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-primary-black mb-2">
              Próximos Pasos
            </h3>
            <ul className="text-gray-700 space-y-2 list-disc list-inside">
              <li>
                Recibirás un email de confirmación en{' '}
                <strong>{order.customer.email}</strong>
              </li>
              <li>
                Te contactaremos cuando tu pedido esté siendo preparado
              </li>
              <li>
                El tiempo estimado de entrega es de 3-5 días hábiles
              </li>
              <li>
                Puedes rastrear tu pedido usando el número de orden: {order.id}
              </li>
            </ul>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalogo" className="btn-secondary flex items-center justify-center gap-2">
              Seguir Comprando
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link to="/" className="btn-primary flex items-center justify-center gap-2">
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Confirmacion

