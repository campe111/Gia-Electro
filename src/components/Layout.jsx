import { useAdmin } from '../context/AdminContext'
import AdminDashboard from '../pages/AdminDashboard'
import Header from './Header'
import Footer from './Footer'

function Layout({ children }) {
  const { isAuthenticated: isAdminAuthenticated } = useAdmin()

  // Si el admin está autenticado, mostrar el panel de administración
  if (isAdminAuthenticated) {
    return <AdminDashboard />
  }

  // Contenido normal para usuarios no admin
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout

