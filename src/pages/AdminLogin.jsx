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
    setError('')
    setIsLoading(true)

    // Simular delay de autenticación
    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = login(email, password)

    if (result.success) {
      navigate('/admin/dashboard')
    } else {
      setError(result.error || 'Error al iniciar sesión')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-primary-black via-gray-900 to-primary-black flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-red rounded-full mb-4">
              <LockClosedIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-primary-black mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-600">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                placeholder="admin@giaelectro.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Credenciales por defecto: admin@giaelectro.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin

