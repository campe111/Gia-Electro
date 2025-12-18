import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { XMarkIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline'
import { useUser } from '../context/UserContext'
import { useAdmin } from '../context/AdminContext'
import { supabase } from '../config/supabase'

function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { login, register } = useUser()
  const { login: adminLogin } = useAdmin()
  const [authMethod, setAuthMethod] = useState('email') // 'email', 'code', 'google', 'facebook'
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (isRegister) {
      // Validaciones de registro
      if (!formData.name.trim()) {
        setError('El nombre es requerido')
        setIsLoading(false)
        return
      }

      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        setIsLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden')
        setIsLoading(false)
        return
      }

      const result = await register(formData.name, formData.email, formData.password)

      if (result.success) {
        resetForm()
        onClose()
      } else {
        setError(result.error || 'Error al registrar usuario')
      }
    } else {
      // Verificar si son credenciales de admin primero
      const ADMIN_EMAIL = 'giaelectro32@gmail.com'
      const ADMIN_PASSWORD = 'Electrogiacolonia'
      
      if (formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
        // Login como admin
        const adminResult = adminLogin(formData.email, formData.password)
        
        if (adminResult.success) {
          resetForm()
          onClose()
          // El Layout detectará que el admin está autenticado y mostrará el dashboard
          // No necesitamos redirigir, solo recargar la página actual
          window.location.reload()
          return
        } else {
          setError(adminResult.error || 'Error al iniciar sesión como administrador')
          setIsLoading(false)
          return
        }
      }
      
      // Login normal de usuario
      const result = await login(formData.email, formData.password)

      if (result.success) {
        resetForm()
        onClose()
      } else {
        setError(result.error || 'Error al iniciar sesión')
      }
    }

    setIsLoading(false)
  }

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simular validación de código
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Aquí iría la lógica real de validación de código
    if (formData.code.length === 6) {
      // Simular login exitoso con código
      setError('Funcionalidad de código de acceso en desarrollo')
    } else {
      setError('El código debe tener 6 dígitos')
    }

    setIsLoading(false)
  }

  const handleSocialLogin = async (provider) => {
    try {
      setIsLoading(true)
      setError('')

      // Obtener la URL de redirección (callback URL)
      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log('Iniciando OAuth con:', provider)
      console.log('URL de redirección:', redirectUrl)

      // Usar Supabase Auth para OAuth
      if (provider === 'Google') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        })

        if (error) {
          console.error('Error en Google OAuth:', error)
          setError(`Error al iniciar sesión con Google: ${error.message}`)
          setIsLoading(false)
          return
        }

        // Si hay data y una URL, redirigir manualmente
        if (data?.url) {
          console.log('Redirigiendo a Google OAuth:', data.url)
          window.location.href = data.url
          // No reseteamos isLoading porque la página se redirigirá
        } else {
          console.warn('No se recibió URL de redirección de Google OAuth')
          setError('No se pudo iniciar el proceso de autenticación con Google. Por favor, verifica la configuración.')
          setIsLoading(false)
        }
      } else if (provider === 'Facebook') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'facebook',
          options: {
            redirectTo: redirectUrl,
          },
        })

        if (error) {
          console.error('Error en Facebook OAuth:', error)
          setError(`Error al iniciar sesión con Facebook: ${error.message}`)
          setIsLoading(false)
          return
        }

        if (data?.url) {
          console.log('Redirigiendo a Facebook OAuth:', data.url)
          window.location.href = data.url
        } else {
          console.warn('No se recibió URL de redirección de Facebook OAuth')
          setError('No se pudo iniciar el proceso de autenticación con Facebook. Por favor, verifica la configuración.')
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error(`Error al iniciar sesión con ${provider}:`, error)
      setError(`Error al iniciar sesión con ${provider}: ${error.message || 'Error desconocido'}`)
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '', code: '' })
    setError('')
    setIsRegister(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Cerrar modal con ESC
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        resetForm()
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 md:p-8 z-[10000]">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-black mb-2">
              {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h2>
            <p className="text-gray-600 text-sm">
              Elige tu método de autenticación
            </p>
          </div>

          {/* Auth Method Selector */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => {
                setAuthMethod('email')
                resetForm()
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${authMethod === 'email'
                ? 'text-primary-red border-b-2 border-primary-red'
                : 'text-gray-600 hover:text-primary-red'
                }`}
            >
              <EnvelopeIcon className="h-5 w-5 inline-block mr-2" />
              Email
            </button>
            <button
              onClick={() => {
                setAuthMethod('code')
                resetForm()
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${authMethod === 'code'
                ? 'text-primary-red border-b-2 border-primary-red'
                : 'text-gray-600 hover:text-primary-red'
                }`}
            >
              <KeyIcon className="h-5 w-5 inline-block mr-2" />
              Código
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Email/Password Form */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                    placeholder="Juan Pérez"
                    required={isRegister}
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                {isRegister && (
                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo 6 caracteres
                  </p>
                )}
              </div>

              {isRegister && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                    placeholder="••••••••"
                    required={isRegister}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? isRegister
                    ? 'Registrando...'
                    : 'Iniciando sesión...'
                  : isRegister
                    ? 'Registrarse'
                    : 'Iniciar Sesión'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister)
                    setError('')
                  }}
                  className="text-sm text-primary-red hover:text-red-700 font-semibold"
                >
                  {isRegister
                    ? '¿Ya tienes cuenta? Inicia sesión'
                    : '¿No tienes cuenta? Regístrate'}
                </button>
              </div>
            </form>
          )}

          {/* Code Form */}
          {authMethod === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Código de Acceso
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={(e) => {
                    // Solo permitir números
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setFormData({ ...formData, code: value })
                    setError('')
                  }}
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  required
                />
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Ingresa el código de 6 dígitos que recibiste
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verificando...' : 'Verificar Código'}
              </button>
            </form>
          )}

          {/* Social Login Buttons */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSocialLogin('Google')
                }}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Iniciar sesión con Google"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSocialLogin('Facebook')
                }}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Iniciar sesión con Facebook"
              >
                <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Renderizar el modal usando portal directamente en el body
  return createPortal(modalContent, document.body)
}

export default AuthModal

