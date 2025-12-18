import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'

function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Manejar callback de Supabase OAuth
        // Supabase maneja automáticamente los tokens y los guarda de forma segura
        const { data, error: authError } = await supabase.auth.getSession()

        if (authError) {
          logger.error('Error al obtener sesión:', authError)
          setError('Error al autenticar. Por favor, intenta de nuevo.')
          setTimeout(() => navigate('/'), 3000)
          return
        }

        if (data?.session) {
          // Supabase ya maneja los tokens automáticamente
          // No necesitamos guardarlos manualmente en localStorage
          logger.log('✅ Autenticación exitosa')
          
          // Redirigir al home
          window.location.href = '/'
        } else {
          // Verificar si hay un código de autorización en la URL (OAuth)
          const code = searchParams.get('code')
          if (code) {
            // Supabase manejará el intercambio del código automáticamente
            // Solo esperamos un momento para que procese
            logger.log('Procesando código de autorización...')
            setTimeout(() => {
              window.location.href = '/'
            }, 1000)
            return
          }
          
          // No hay sesión ni código, redirigir al home
          setError('No se pudo autenticar. Por favor, intenta de nuevo.')
          setTimeout(() => navigate('/'), 3000)
        }
      } catch (error) {
        logger.error('Error en callback de autenticación:', error)
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

