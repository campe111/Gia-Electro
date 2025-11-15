import { createContext, useContext, useState, useEffect } from 'react'

const AdminContext = createContext()

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin debe ser usado dentro de un AdminProvider')
  }
  return context
}

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState(null)

  // Verificar autenticación al cargar
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth')
    const adminData = localStorage.getItem('adminUser')
    if (authStatus === 'true' && adminData) {
      setIsAuthenticated(true)
      setAdminUser(JSON.parse(adminData))
    }
  }, [])

  const login = (email, password) => {
    // Credenciales por defecto (en producción usar backend seguro)
    const ADMIN_EMAIL = 'admin@giaelectro.com'
    const ADMIN_PASSWORD = 'admin123'

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const admin = {
        email: ADMIN_EMAIL,
        name: 'Administrador',
        role: 'admin',
      }
      setIsAuthenticated(true)
      setAdminUser(admin)
      localStorage.setItem('adminAuth', 'true')
      localStorage.setItem('adminUser', JSON.stringify(admin))
      return { success: true }
    } else {
      return { success: false, error: 'Credenciales inválidas' }
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setAdminUser(null)
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminUser')
  }

  const value = {
    isAuthenticated,
    adminUser,
    login,
    logout,
  }

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  )
}

