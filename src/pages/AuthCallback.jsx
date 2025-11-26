import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { supabase } from '../config/supabase'

function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useUser()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Verificar si hay un token en los query params (backend OAuth)
        const token = searchParams.get('token')
        if (token) {
          localStorage.setItem('token', token)
          window.location.href = '/'
          return
        }

        // Manejar callback de Supabase OAuth
        const { data, error: authError } = await supabase.auth.getSession()

        if (authError) {
          console.error('Error al obtener sesión:', authError)
          setError('Error al autenticar. Por favor, intenta de nuevo.')
          setTimeout(() => navigate('/'), 3000)
          return
        }

        if (data?.session) {
          const { access_token } = data.session

          // Guardar el token de Supabase
          localStorage.setItem('token', access_token)
          localStorage.setItem('supabase_token', access_token)

          // Redirigir al home
          window.location.href = '/'
        } else {
          // No hay sesión, redirigir al home
          setError('No se pudo autenticar. Por favor, intenta de nuevo.')
          setTimeout(() => navigate('/'), 3000)
        }
      } catch (error) {
        console.error('Error en callback de autenticación:', error)
        setError('Error al autenticar. Por favor, intenta de nuevo.')
        setTimeout(() => navigate('/'), 3000)
      }
    }

    handleAuthCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-700">{error}</p>
            </div>
            <p className="text-sm text-gray-500">Redirigiendo...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto mb-4"></div>
            <p className="text-gray-600">Autenticando...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthCallback

