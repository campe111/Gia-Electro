import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import MercadoPagoCheckout from '../components/MercadoPagoCheckout'
import {
  CreditCardIcon,
  TruckIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

function Checkout() {
  const navigate = useNavigate()
  const { cartItems, getTotalPrice, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Información personal
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Información de envío
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    // Método de pago
    paymentMethod: 'credit',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVC: '',
    // Términos
    acceptTerms: false,
  })
  const [errors, setErrors] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)

  // Validación y sanitización
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const validateCardNumber = (number) => {
    // Luhn algorithm básico
    const cleaned = number.replace(/\s/g, '')
    if (cleaned.length < 13 || cleaned.length > 19) return false
    
    let sum = 0
    let isEven = false
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i])
      
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      
      sum += digit
      isEven = !isEven
    }
    
    return sum % 10 === 0
  }

  const sanitizeInput = (input) => {
    // Sanitización básica para prevenir XSS
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
  }

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '')
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(' ') : cleaned
  }

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const sanitizedValue = type === 'checkbox' ? checked : sanitizeInput(value)
    
    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }))

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }

    // Formateo especial para tarjeta
    if (name === 'cardNumber') {
      setFormData((prev) => ({
        ...prev,
        cardNumber: formatCardNumber(value.replace(/\D/g, '')),
      }))
    } else if (name === 'cardExpiry') {
      setFormData((prev) => ({
        ...prev,
        cardExpiry: formatExpiry(value),
      }))
    } else if (name === 'cardCVC') {
      setFormData((prev) => ({
        ...prev,
        cardCVC: value.replace(/\D/g, '').slice(0, 4),
      }))
    } else if (name === 'zipCode') {
      setFormData((prev) => ({
        ...prev,
        zipCode: value.replace(/\D/g, '').slice(0, 10),
      }))
    }
  }

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Teléfono inválido'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    
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
    } else if (formData.zipCode.length < 4) {
      newErrors.zipCode = 'Código postal inválido'
    }
    if (!formData.country.trim()) {
      newErrors.country = 'El país es requerido'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors = {}
    
    if (formData.paymentMethod === 'credit') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'El número de tarjeta es requerido'
      } else if (!validateCardNumber(formData.cardNumber)) {
        newErrors.cardNumber = 'Número de tarjeta inválido'
      }
      if (!formData.cardName.trim()) {
        newErrors.cardName = 'El nombre en la tarjeta es requerido'
      }
      if (!formData.cardExpiry.trim()) {
        newErrors.cardExpiry = 'La fecha de expiración es requerida'
      } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
        newErrors.cardExpiry = 'Formato inválido (MM/AA)'
      }
      if (!formData.cardCVC.trim()) {
        newErrors.cardCVC = 'El CVC es requerido'
      } else if (formData.cardCVC.length < 3) {
        newErrors.cardCVC = 'CVC inválido'
      }
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePaymentSuccess = async (paymentData) => {
    if (!formData.acceptTerms) {
      setErrors({ acceptTerms: 'Debes aceptar los términos y condiciones' })
      return
    }

    setIsProcessing(true)

    try {
      // Generar ID de orden único
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Guardar orden con información de pago de Mercado Pago
      const order = {
        id: orderId,
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        shipping: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        items: cartItems,
        total: getTotalPrice(),
        paymentMethod: 'mercadopago',
        payment: {
          payment_id: paymentData.payment_id,
          status: paymentData.status,
          preference_id: paymentData.preference_id,
          processor: 'Mercado Pago',
        },
        date: new Date().toISOString(),
        status: paymentData.status === 'approved' ? 'paid' : 'pending',
      }

      // Guardar en localStorage (en producción usar API/Base de datos)
      const orders = JSON.parse(localStorage.getItem('giaElectroOrders') || '[]')
      orders.push(order)
      localStorage.setItem('giaElectroOrders', JSON.stringify(orders))

      // Limpiar carrito
      clearCart()

      // Redirigir a confirmación
      navigate(`/confirmacion/${orderId}`, { state: { order } })
    } catch (error) {
      console.error('Error guardando la orden:', error)
      setErrors({ submit: 'Error guardando la orden. Por favor contacta con soporte.' })
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // La validación y el pago se manejan en el componente MercadoPagoCheckout
    if (!formData.acceptTerms) {
      setErrors({ acceptTerms: 'Debes aceptar los términos y condiciones' })
      return
    }
  }

  const totalPrice = getTotalPrice()

  if (cartItems.length === 0) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <p className="text-gray-600 text-xl mb-8">
              Tu carrito está vacío
            </p>
            <button
              onClick={() => navigate('/catalogo')}
              className="btn-primary"
            >
              Ir al Catálogo
            </button>
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
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-2">
              Finalizar <span className="text-primary-red">Compra</span>
            </h1>
            <p className="text-gray-600">
              Completa la información para procesar tu pedido
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[
                { step: 1, label: 'Información', icon: TruckIcon },
                { step: 2, label: 'Envío', icon: TruckIcon },
                { step: 3, label: 'Pago', icon: CreditCardIcon },
              ].map(({ step, label, icon: Icon }) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        currentStep >= step
                          ? 'bg-primary-red text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {currentStep > step ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <span className="text-xs mt-2 text-gray-600 hidden sm:block">
                      {label}
                    </span>
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step ? 'bg-primary-red' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulario Principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Paso 1: Información Personal */}
                {currentStep === 1 && (
                  <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-primary-black">
                      Información Personal
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Nombre *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.firstName
                              ? 'border-red-500'
                              : 'border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                          required
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Apellido *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.lastName
                              ? 'border-red-500'
                              : 'border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                          required
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                          required
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                          required
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Paso 2: Información de Envío */}
                {currentStep === 2 && (
                  <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-primary-black">
                      Dirección de Envío
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="address"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Dirección *
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.address
                              ? 'border-red-500'
                              : 'border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                          required
                        />
                        {errors.address && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.address}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="city"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Ciudad *
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border ${
                              errors.city
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                            required
                          />
                          {errors.city && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.city}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="state"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Estado/Provincia *
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border ${
                              errors.state
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                            required
                          />
                          {errors.state && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.state}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="zipCode"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Código Postal *
                          </label>
                          <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border ${
                              errors.zipCode
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                            required
                          />
                          {errors.zipCode && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.zipCode}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="country"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            País *
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border ${
                              errors.country
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-primary-yellow`}
                            required
                          />
                          {errors.country && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.country}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paso 3: Información de Pago */}
                {currentStep === 3 && (
                  <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-primary-black flex items-center gap-2">
                      <LockClosedIcon className="h-6 w-6" />
                      Información de Pago
                    </h2>
                    
                    {/* Información de Seguridad */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <LockClosedIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-green-900 mb-1">
                            Pago 100% Seguro
                          </p>
                          <p className="text-xs text-green-800">
                            Tus datos están protegidos. No almacenamos información de tarjetas. 
                            El pago se procesa de forma segura a través de Mercado Pago.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Componente de Mercado Pago */}
                    <MercadoPagoCheckout
                      orderData={{
                        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                        customer: {
                          firstName: formData.firstName,
                          lastName: formData.lastName,
                          email: formData.email,
                          phone: formData.phone,
                        },
                        shipping: {
                          address: formData.address,
                          city: formData.city,
                          state: formData.state,
                          zipCode: formData.zipCode,
                          country: formData.country,
                        },
                        items: cartItems,
                        total: totalPrice,
                      }}
                      onPaymentSuccess={(paymentData) => {
                        handlePaymentSuccess(paymentData)
                      }}
                      onPaymentError={(error) => {
                        setErrors({ submit: error.message || 'Error al procesar el pago' })
                        setIsProcessing(false)
                      }}
                    />

                    <div>
                      <label className="flex items-start space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={handleInputChange}
                          className="mt-1 text-primary-red focus:ring-primary-red"
                          required
                        />
                        <span className="text-sm text-gray-600">
                          Acepto los{' '}
                          <a
                            href="#"
                            className="text-primary-red hover:underline"
                            onClick={(e) => e.preventDefault()}
                          >
                            términos y condiciones
                          </a>{' '}
                          y la{' '}
                          <a
                            href="#"
                            className="text-primary-red hover:underline"
                            onClick={(e) => e.preventDefault()}
                          >
                            política de privacidad
                          </a>
                        </span>
                      </label>
                      {errors.acceptTerms && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.acceptTerms}
                        </p>
                      )}
                    </div>
                    {errors.submit && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {errors.submit}
                      </div>
                    )}
                  </div>
                )}

                {/* Botones de Navegación */}
                <div className="flex justify-between">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Anterior
                    </button>
                  )}
                  <div className="ml-auto">
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="btn-primary px-6 py-3"
                      >
                        Siguiente
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Procesando...
                          </>
                        ) : (
                          <>
                            <LockClosedIcon className="h-5 w-5" />
                            Confirmar Pago
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Resumen del Pedido */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                  <h2 className="text-2xl font-bold text-primary-black mb-6">
                    Resumen del Pedido
                  </h2>
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.quantity}
                          </p>
                          <p className="text-sm font-bold text-primary-red">
                            ${(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-300 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Envío</span>
                      <span>Gratis</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                      <span className="text-xl font-bold text-primary-black">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-primary-red">
                        ${totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Checkout

