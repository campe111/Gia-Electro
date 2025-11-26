import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { supabase } from '../config/supabase'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider')
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
        console.warn('Error fetching profile:', error.message)
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
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

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
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

