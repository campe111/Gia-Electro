import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await api.getCurrentUser()
        if (response.success) {
          setIsAuthenticated(true)
          setUser(response.user)
        } else {
          localStorage.removeItem('token')
        }
      }
    } catch (error) {
      localStorage.removeItem('token')
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await api.register(name, email, password)
      if (response.success) {
        localStorage.setItem('token', response.token)
        setIsAuthenticated(true)
        setUser(response.user)
        return { success: true }
      } else {
        return { success: false, error: response.error || 'Error al registrar' }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al registrar usuario',
      }
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password)
      if (response.success) {
        localStorage.setItem('token', response.token)
        setIsAuthenticated(true)
        setUser(response.user)
        return { success: true }
      } else {
        return { success: false, error: response.error || 'Error al iniciar sesión' }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Email o contraseña incorrectos',
      }
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setIsAuthenticated(false)
      setUser(null)
      localStorage.removeItem('token')
    }
  }

  const value = {
    isAuthenticated,
    user,
    isLoading,
    register,
    login,
    logout,
  }

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  )
}

