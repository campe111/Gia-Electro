import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { checkRateLimit, recordFailedAttempt, resetFailedAttempts, getRemainingAttempts } from '../utils/rateLimiter'
import { logSecurityEvent, SecurityEventType } from '../utils/securityMonitor'

const MAX_LOGIN_ATTEMPTS = 5

// Obtener la URL de Supabase para limpiar localStorage
const getSupabaseStorageKey = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || 'https://worpraelmlhsdkvuapbb.supabase.co'
  const projectRef = url.split('//')[1]?.split('.')[0] || 'worpraelmlhsdkvuapbb'
  return `sb-${projectRef}-auth-token`
}

const AdminContext = createContext()

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin debe ser usado dentro de un AdminProvider')
  }
  return context
}

// Email del administrador (debe coincidir con el de la función SQL is_admin())
const ADMIN_EMAIL = 'giaelectro32@gmail.com'

// Función helper para verificar si un usuario es admin
export const isAdminUser = (user) => {
  if (!user) return false
  return user.email === ADMIN_EMAIL
}

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAdminAuth()

    // Escuchar cambios en la autenticación de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkAdminAuth()
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setAdminUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user && isAdminUser(session.user)) {
        setIsAuthenticated(true)
        setAdminUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || 'Administrador Gia Electro',
          role: 'admin',
        })
      } else {
        setIsAuthenticated(false)
        setAdminUser(null)
      }
    } catch (error) {
      logger.error('Error verificando autenticación de admin:', error)
      setIsAuthenticated(false)
      setAdminUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      // Verificar rate limiting antes de intentar login
      const rateLimitCheck = checkRateLimit(email)
      if (rateLimitCheck.isLocked) {
        return { 
          success: false, 
          error: rateLimitCheck.error || 'Demasiados intentos fallidos. Intenta más tarde.' 
        }
      }

      // Intentar login con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Registrar intento fallido
        recordFailedAttempt(email)
        const remainingAttempts = getRemainingAttempts(email)
        
        // Registrar evento de seguridad
        logSecurityEvent(SecurityEventType.LOGIN_FAILED, {
          email,
          reason: error.message,
          remainingAttempts,
        })
        
        let errorMessage = error.message || 'Credenciales inválidas'
        if (remainingAttempts > 0 && remainingAttempts < MAX_LOGIN_ATTEMPTS) {
          errorMessage += ` (${remainingAttempts} ${remainingAttempts === 1 ? 'intento' : 'intentos'} restantes)`
        }
        
        return { success: false, error: errorMessage }
      }

      // Verificar que el usuario es admin
      if (data.user && isAdminUser(data.user)) {
        // Login exitoso, resetear intentos fallidos
        resetFailedAttempts(email)
        
        // Registrar evento de seguridad
        logSecurityEvent(SecurityEventType.LOGIN_SUCCESS, {
          email,
          userType: 'admin',
        })
        
        await checkAdminAuth()
        return { success: true }
      } else {
        // Si no es admin, cerrar sesión y registrar intento fallido
        await supabase.auth.signOut()
        recordFailedAttempt(email)
        return { success: false, error: 'No tienes permisos de administrador' }
      }
    } catch (error) {
      logger.error('Error en login de admin:', error)
      recordFailedAttempt(email)
      return { success: false, error: 'Error al iniciar sesión' }
    }
  }

  const logout = async () => {
    try {
      // Limpiar estado local primero
      setIsAuthenticated(false)
      setAdminUser(null)
      
      // Cerrar sesión en Supabase (esto limpia localStorage automáticamente)
      const { error } = await supabase.auth.signOut()
      if (error) {
        logger.error('Error al cerrar sesión en Supabase:', error)
      }
      
      // Limpiar TODAS las posibles claves de Supabase en localStorage
      try {
        // Obtener todas las claves de localStorage
        const keys = Object.keys(localStorage)
        
        // Limpiar todas las claves relacionadas con Supabase
        keys.forEach(key => {
          if (
            key.includes('supabase') || 
            key.includes('sb-') || 
            key === 'token' || 
            key === 'supabase_token' ||
            key.startsWith('sb-worpraelmlhsdkvuapbb')
          ) {
            localStorage.removeItem(key)
          }
        })
        
        // También limpiar claves específicas conocidas
        localStorage.removeItem('supabase.auth.token')
        localStorage.removeItem('token')
        localStorage.removeItem('supabase_token')
        
        // Limpiar la clave específica de Supabase
        const storageKey = getSupabaseStorageKey()
        localStorage.removeItem(storageKey)
      } catch (storageError) {
        logger.warn('Error limpiando localStorage:', storageError)
      }
      
      return { success: true }
    } catch (error) {
      logger.error('Error al cerrar sesión:', error)
      // Aún así limpiar el estado local
      setIsAuthenticated(false)
      setAdminUser(null)
      return { success: false, error: error.message }
    }
  }

  const value = {
    isAuthenticated,
    adminUser,
    isLoading,
    login,
    logout,
  }

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  )
}

