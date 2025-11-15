import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { verifyPayment } from '../services/mercadoPagoService'

function ConfirmacionPago() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [paymentStatus, setPaymentStatus] = useState('verifying')
  const [paymentData, setPaymentData] = useState(null)

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      // Obtener parámetros de la URL de Mercado Pago
      const paymentId = searchParams.get('payment_id')
      const status = searchParams.get('status')
      const preferenceId = searchParams.get('preference_id')

      // Obtener orden pendiente del sessionStorage
      const pendingOrder = sessionStorage.getItem('pendingOrder')
      if (pendingOrder) {
        const order = JSON.parse(pendingOrder)
        sessionStorage.removeItem('pendingOrder')

        // Verificar pago
        if (paymentId) {
          const result = await verifyPayment(paymentId)
          if (result.success) {
            setPaymentData({
              ...result,
              preferenceId,
              orderId: order.orderId,
            })
            setPaymentStatus(result.status === 'approved' ? 'approved' : result.status)
          } else {
            setPaymentStatus('error')
          }
        } else if (status === 'approved') {
          setPaymentStatus('approved')
          setPaymentData({
            status: 'approved',
            preferenceId,
            orderId: order.orderId,
          })
        } else if (status === 'pending') {
          setPaymentStatus('pending')
        } else {
          setPaymentStatus('rejected')
        }
      } else {
        // No hay orden pendiente
        setPaymentStatus('error')
      }
    }

    verifyPaymentStatus()
  }, [searchParams])

  if (paymentStatus === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verificando pago...</p>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'approved') {
    return (
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-4">
              ¡Pago Aprobado!
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Tu pago ha sido procesado exitosamente.
            </p>
            {paymentData?.orderId && (
              <Link
                to={`/confirmacion/${paymentData.orderId}`}
                className="btn-primary inline-flex items-center gap-2"
              >
                Ver Detalles de la Orden
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'pending') {
    return (
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
              <ClockIcon className="h-12 w-12 text-yellow-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-4">
              Pago Pendiente
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Tu pago está siendo procesado. Recibirás una confirmación por email 
              cuando se complete.
            </p>
            <Link to="/catalogo" className="btn-primary">
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <XCircleIcon className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-4">
            Pago Rechazado
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            No se pudo procesar tu pago. Por favor, intenta nuevamente o usa 
            otro método de pago.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/carrito" className="btn-primary">
              Volver al Carrito
            </Link>
            <Link to="/catalogo" className="btn-secondary">
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmacionPago

