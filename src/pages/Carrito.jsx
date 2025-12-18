import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../config/supabase'
import { sendOrderEmail } from '../services/emailService'
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { getPlaceholderImage } from '../utils/imageHelper'
import { generateCaptcha, validateCaptcha } from '../utils/captcha'
import { logSecurityEvent, SecurityEventType, detectSuspiciousInput } from '../utils/securityMonitor'
import { logger } from '../utils/logger'
import { generateSecureOrderId, validateAndRecalculateTotal } from '../utils/securityUtils'

function Carrito() {
  const navigate = useNavigate()
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCart()

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()
  const [showModal, setShowModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Argentina',
  })
  const [errors, setErrors] = useState({})
  const [captcha, setCaptcha] = useState(null)
  const [captchaAnswer, setCaptchaAnswer] = useState('')

  // Generar CAPTCHA al abrir el modal
  useEffect(() => {
    if (showModal) {
      const newCaptcha = generateCaptcha()
      setCaptcha(newCaptcha)
      setCaptchaAnswer('')
    }
  }, [showModal])

  // Sanitización básica para prevenir XSS
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input
    
    // Detectar inputs sospechosos
    if (detectSuspiciousInput(input)) {
      logSecurityEvent(SecurityEventType.SUSPICIOUS_INPUT, {
        source: 'Carrito',
        inputLength: input.length,
      })
    }
    
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const sanitizedValue = sanitizeInput(value)
    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida'
    }
    if (!formData.state.trim()) {
      newErrors.state = 'El estado/provincia es requerido'
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'El código postal es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Validar CAPTCHA
    if (!captcha || !validateCaptcha(captchaAnswer, captcha.answer)) {
      setErrors({ captcha: 'Por favor, resuelve correctamente el desafío matemático' })
      // Generar nuevo CAPTCHA
      const newCaptcha = generateCaptcha()
      setCaptcha(newCaptcha)
      setCaptchaAnswer('')
      logSecurityEvent(SecurityEventType.SUSPICIOUS_INPUT, {
        source: 'Carrito',
        reason: 'CAPTCHA fallido',
      })
      return
    }

    setIsProcessing(true)
    
    // Registrar evento de seguridad
    logSecurityEvent(SecurityEventType.ADMIN_ACTION, {
      action: 'ORDER_CREATED',
      source: 'Carrito',
    })

    try {
      // Validar y recalcular total para prevenir manipulación de precios
      const totalValidation = validateAndRecalculateTotal(cartItems, totalPrice)
      if (!totalValidation.isValid) {
        logger.error('Validación de precio fallida:', totalValidation.error)
        logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          action: 'PRICE_MANIPULATION_ATTEMPT',
          details: totalValidation.error,
        })
        alert('Error de validación: Los precios no coinciden. Por favor, recarga la página e intenta de nuevo.')
        return
      }

      // Usar el total recalculado (más seguro)
      const validatedTotal = totalValidation.calculatedTotal

      // Generar ID de orden único y seguro
      const orderId = generateSecureOrderId()

      // Crear objeto de orden
      const order = {
        id: orderId,
        customer: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },
        shipping: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
          country: formData.country.trim(),
        },
        items: cartItems,
        total: validatedTotal,
        paymentMethod: 'email', // Indicar que el pago se procesará por email
        date: new Date().toISOString(),
        status: 'pending',
      }

      // Guardar orden en Supabase
      const { error: supabaseError } = await supabase
        .from('orders')
        .insert([
          {
            id: orderId,
            customer_data: order.customer,
            shipping_data: order.shipping,
            items: cartItems,
            total: validatedTotal, // Usar total validado
            status: 'pending',
            payment_status: 'pending',
            payment_data: {
              payment_method: 'email',
            },
            user_id: (await supabase.auth.getUser()).data.user?.id || null
          }
        ])

      if (supabaseError) throw supabaseError

      // Enviar email con los detalles del pedido a Gia Electro
      try {
        await sendOrderEmail(order)
        logger.log('Email de pedido enviado exitosamente')
      } catch (emailError) {
        // No bloquear el proceso si el email falla
        logger.error('Error enviando email (no crítico):', emailError)
      }

      // Limpiar carrito
      clearCart()

      // Cerrar modal y redirigir a confirmación
      setShowModal(false)
      navigate(`/confirmacion/${orderId}`, { state: { order } })
    } catch (error) {
      logger.error('Error procesando el pedido:', error)
      setErrors({ submit: 'Error procesando el pedido. Por favor intenta nuevamente.' })
      setIsProcessing(false)
    }
  }

  const handleCheckout = () => {
    setShowModal(true)
  }

  if (cartItems.length === 0) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <ShoppingBagIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-8">
              Explora nuestro catálogo y agrega productos a tu carrito
            </p>
            <Link
              to="/catalogo"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>Ver Catálogo</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-2">
                Carrito de <span className="text-primary-red">Compras</span>
              </h1>
              <p className="text-gray-600">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu
                carrito
              </p>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="mt-4 md:mt-0 text-sm text-primary-red hover:text-red-700 font-semibold transition-colors"
              >
                Vaciar carrito
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md p-4 md:p-6 flex flex-col md:flex-row gap-4"
                >
                  {/* Imagen del producto */}
                  <div className="flex-shrink-0 w-full md:w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = getPlaceholderImage(300, 200, 'Imagen no disponible')
                      }}
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-primary-black mb-1">
                        {item.name}
                      </h3>
                      {item.category && (
                        <span className="inline-block bg-primary-red text-white text-xs font-semibold px-2 py-1 rounded mb-2">
                          {item.category}
                        </span>
                      )}
                      <p className="text-2xl font-bold text-primary-red">
                        ${item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-2 hover:bg-gray-100 transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <MinusIcon className="h-5 w-5 text-gray-600" />
                        </button>
                        <span className="px-4 py-2 font-semibold text-primary-black min-w-[60px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-100 transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <PlusIcon className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="text-xl font-bold text-primary-black">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-primary-black mb-6">
                  Resumen del Pedido
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                    <span className="font-semibold">
                      ${totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span className="font-semibold">Gratis</span>
                  </div>
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary-black">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-primary-red">
                        ${totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn-primary w-full mb-4 flex items-center justify-center space-x-2"
                >
                  <span>Continuar con el Pedido</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </button>

                <Link
                  to="/catalogo"
                  className="block text-center text-primary-red hover:text-red-700 font-semibold transition-colors"
                >
                  ← Continuar comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Formulario de Pedido */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary-black">
                Información de Contacto y Envío
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Cerrar"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-6 space-y-4">
              <p className="text-gray-600 mb-4">
                Completa tus datos y te contactaremos por email para coordinar el pago y envío.
              </p>

              {/* Información Personal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white rounded-lg border ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                    required
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white rounded-lg border ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                    required
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white rounded-lg border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white rounded-lg border ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Dirección de Envío */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white rounded-lg border ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                  required
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white rounded-lg border ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                    required
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    Estado/Provincia *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white rounded-lg border ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                    required
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white rounded-lg border ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                    required
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                />
              </div>

              {/* CAPTCHA */}
              {captcha && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label htmlFor="captcha" className="block text-sm font-medium text-gray-700 mb-2">
                    Verificación de seguridad *
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary-red bg-white px-4 py-2 rounded border border-gray-300">
                      {captcha.question} = ?
                    </span>
                    <input
                      type="number"
                      id="captcha"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      className={`flex-1 px-4 py-2 bg-white rounded-lg border ${
                        errors.captcha ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                      placeholder="Respuesta"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newCaptcha = generateCaptcha()
                        setCaptcha(newCaptcha)
                        setCaptchaAnswer('')
                      }}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Generar nuevo desafío"
                    >
                      🔄
                    </button>
                  </div>
                  {errors.captcha && (
                    <p className="text-red-500 text-sm mt-1">{errors.captcha}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Resuelve el desafío matemático para verificar que eres humano
                  </p>
                </div>
              )}

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Pedido</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Carrito

