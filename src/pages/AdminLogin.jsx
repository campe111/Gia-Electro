import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { LockClosedIcon } from '@heroicons/react/24/outline'

function AdminLogin() {
  const navigate = useNavigate()
  const { login } = useAdmin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation() // Prevenir propagación del evento en móviles
    setError('')
    setIsLoading(true)

    try {
      // Esperar correctamente la función async
      const result = await login(email, password)

      if (result.success) {
        // Pequeño delay para asegurar que el estado se actualice
        await new Promise((resolve) => setTimeout(resolve, 100))
        navigate('/admin/dashboard')
      } else {
        setError(result.error || 'Error al iniciar sesión')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error en login:', error)
      setError('Error al iniciar sesión. Por favor, intenta de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-primary-black via-gray-900 to-primary-black flex items-center justify-center py-4 sm:py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary-red rounded-full mb-3 sm:mb-4">
              <LockClosedIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-black mb-2">
              Panel de Administración
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm sm:text-base">
                {error}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent text-base"
                placeholder="giaelectro32@gmail.com"
                autoComplete="email"
                inputMode="email"
                required
                disabled={isLoading}
                style={{ fontSize: '16px' }}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent text-base"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                disabled={isLoading}
                style={{ fontSize: '16px' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed py-3 text-base font-semibold min-h-[48px] touch-manipulation active:scale-95 transition-transform"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs text-gray-500">
              Panel de Super Administración
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Email: giaelectro32@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin

