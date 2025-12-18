import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { checkRateLimit, recordFailedAttempt, resetFailedAttempts, getRemainingAttempts } from '../utils/rateLimiter'
import { logSecurityEvent, SecurityEventType } from '../utils/securityMonitor'

const MAX_LOGIN_ATTEMPTS = 5

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    // Retornar valores por defecto en lugar de lanzar error
    // Esto previene crashes durante hot reload o cuando el provider no está disponible
    logger.warn('useUser se está usando fuera de UserProvider, retornando valores por defecto')
    return {
      isAuthenticated: false,
      user: null,
      isLoading: false,
      register: async () => ({ success: false, error: 'UserProvider no disponible' }),
      login: async () => ({ success: false, error: 'UserProvider no disponible' }),
      logout: async () => ({ success: false, error: 'UserProvider no disponible' }),
    }
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        logger.warn('Error fetching profile:', error.message)
      }

      setProfile(data)
    } catch (error) {
      logger.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
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

      // Login exitoso, resetear intentos fallidos
      resetFailedAttempts(email)
      
      // Registrar evento de seguridad
      logSecurityEvent(SecurityEventType.LOGIN_SUCCESS, {
        email,
        userType: 'user',
      })
      
      return { success: true, data }
    } catch (error) {
      recordFailedAttempt(email)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  const logout = async () => {
    try {
      // Limpiar estado local primero para feedback inmediato
      setUser(null)
      setProfile(null)
      
      // Luego cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        logger.error('Error al cerrar sesión en Supabase:', error)
        // Aún así retornar éxito para que la UI se actualice
        return { success: true, error: error.message }
      }
      return { success: true }
    } catch (error) {
      logger.error('Error al cerrar sesión:', error)
      // Aún así limpiar el estado local
      setUser(null)
      setProfile(null)
      return { success: true, error: error.message }
    }
  }

  // Función helper para extraer el nombre del usuario desde diferentes fuentes
  // Se recalcula automáticamente cuando cambian user o profile
  const userDisplayName = useMemo(() => {
    if (!user) return null

    // 1. Intentar obtener desde el perfil
    if (profile?.full_name) return profile.full_name
    if (profile?.name) return profile.name

    // 2. Intentar obtener desde user_metadata (OAuth como Google)
    // Google puede proporcionar el nombre en diferentes campos
    if (user.user_metadata?.full_name) return user.user_metadata.full_name
    if (user.user_metadata?.name) return user.user_metadata.name
    // Google también puede proporcionar first_name y last_name
    if (user.user_metadata?.first_name && user.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    }
    if (user.user_metadata?.first_name) return user.user_metadata.first_name

    // 3. Extraer nombre del email como fallback
    if (user.email) {
      const emailName = user.email.split('@')[0]
      // Capitalizar primera letra
      return emailName.charAt(0).toUpperCase() + emailName.slice(1)
    }

    return null
  }, [user, profile])

  const userData = useMemo(() => {
    if (!user) return null
    return {
      ...user,
      ...profile,
      name: userDisplayName, // Asegurar que siempre haya un campo 'name'
      email: user?.email || profile?.email,
    }
  }, [user, profile, userDisplayName])

  const value = {
    isAuthenticated: !!user,
    user: userData,
    isLoading,
    register,
    login,
    logout,
  }

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  )
}

