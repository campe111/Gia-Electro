import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LockClosedIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { createPaymentPreference } from '../services/mercadoPagoService'
import { MERCADOPAGO_CONFIG, validateMercadoPagoConfig } from '../config/mercadoPago'

function MercadoPagoCheckout({ orderData, onPaymentSuccess, onPaymentError }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isConfigValid, setIsConfigValid] = useState(false)

  useEffect(() => {
    // Validar configuración al montar
    const isValid = validateMercadoPagoConfig()
    setIsConfigValid(isValid)
  }, [])

  const handlePayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Validar datos antes de proceder
      if (!orderData || !orderData.items || orderData.items.length === 0) {
        throw new Error('No hay productos en la orden')
      }

      if (!orderData.customer.email) {
        throw new Error('Email del cliente es requerido')
      }

      // Crear preferencia de pago
      const result = await createPaymentPreference(orderData)

      if (!result.success) {
        throw new Error(result.error || 'Error al crear preferencia de pago')
      }

      // En producción, redirigir al checkout de Mercado Pago
      if (result.data.init_point || result.data.sandbox_init_point) {
        const checkoutUrl = result.data.sandbox_init_point || result.data.init_point
        
        // Guardar información temporal de la orden
        sessionStorage.setItem('pendingOrder', JSON.stringify({
          orderId: orderData.id,
          preferenceId: result.data.id,
          timestamp: Date.now(),
        }))

        // Redirigir a Mercado Pago
        window.location.href = checkoutUrl
      } else {
        // Modo de prueba: simular pago exitoso
        if (!isConfigValid) {
          console.warn('⚠️ Modo de prueba activado - Simulando pago exitoso')
          // Simular pago exitoso después de 2 segundos
          setTimeout(() => {
            onPaymentSuccess({
              payment_id: `payment-${Date.now()}`,
              status: 'approved',
              preference_id: result.data.id,
            })
          }, 2000)
        }
      }
    } catch (err) {
      console.error('Error en el pago:', err)
      setError(err.message || 'Error al procesar el pago')
      onPaymentError && onPaymentError(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConfigValid) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <LockClosedIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-yellow-900 mb-2">
              Modo de Prueba Activado
            </h3>
            <p className="text-sm text-yellow-800 mb-4">
              Las credenciales de Mercado Pago no están configuradas. 
              El pago se simulará localmente para pruebas.
            </p>
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <LockClosedIcon className="h-5 w-5" />
                  Simular Pago de Prueba
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800">
          <LockClosedIcon className="h-5 w-5" />
          <span className="text-sm font-semibold">
            Pago seguro procesado por Mercado Pago
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <XCircleIcon className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Redirigiendo a Mercado Pago...
          </>
        ) : (
          <>
            <LockClosedIcon className="h-5 w-5" />
            Pagar con Mercado Pago
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Al hacer clic, serás redirigido al checkout seguro de Mercado Pago
      </p>
    </div>
  )
}

export default MercadoPagoCheckout

