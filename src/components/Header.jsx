import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bars3Icon, XMarkIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import CartIcon from './CartIcon'
import AuthModal from './AuthModal'
import { useUser } from '../context/UserContext'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useUser()
  const userMenuRef = useRef(null)

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    navigate('/')
  }

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/catalogo', label: 'Catálogo' },
    { path: '/contacto', label: 'Contacto' },
  ]

  return (
    <header className="bg-gradient-to-b from-primary-black via-primary-red to-primary-yellow text-white shadow-lg sticky top-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-red/20 to-transparent overflow-hidden pointer-events-none"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-14 md:h-16 relative z-10">
          {/* Desktop Navigation - Left */}
          <nav className="hidden md:flex items-center space-x-6 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-md ${
                  isActive(link.path)
                    ? 'bg-primary-yellow text-primary-black font-bold shadow-lg'
                    : 'text-white hover:text-primary-yellow bg-black/40 backdrop-blur-sm hover:bg-black/60 border border-white/20'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Brand Name - Centered */}
          <div className="absolute left-0 right-0 flex justify-center items-center h-full z-20 pointer-events-none">
            <Link 
              to="/" 
              className="pointer-events-auto"
            >
              <h1 
                className="brand-title text-2xl md:text-3xl lg:text-4xl font-bold text-white whitespace-nowrap cursor-pointer" 
                style={{ 
                  fontFamily: "'Goblin One', cursive",
                  letterSpacing: '0.05em',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                Gia Electro
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation - Right */}
          <div className="hidden md:flex items-center justify-end space-x-4 flex-1 relative">
            <CartIcon />
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-md text-white hover:text-primary-yellow bg-black/40 backdrop-blur-sm hover:bg-black/60 border border-white/20 relative z-30"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="hidden lg:inline">
                    {user?.name || user?.email?.split('@')[0] || 'Usuario'}
                  </span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-2xl z-[9999] border-2 border-primary-yellow overflow-hidden">
                    <div className="px-4 py-3 border-b-2 border-primary-red bg-gradient-to-r from-primary-yellow via-primary-yellow/80 to-primary-red">
                      <p className="text-sm font-semibold text-primary-black drop-shadow-sm">
                        {user?.name || user?.email?.split('@')[0] || 'Usuario'}
                      </p>
                      <p className="text-xs text-primary-black/80 mt-1 font-medium">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-white bg-primary-red hover:brightness-125 transition-all font-medium hover:shadow-lg"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-md text-white hover:text-primary-yellow bg-black/40 backdrop-blur-sm hover:bg-black/60 border border-white/20"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-md bg-primary-yellow text-primary-black hover:bg-yellow-500 font-semibold"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-2 w-full justify-end">
            <CartIcon />
            <button
              className="p-2 rounded-md text-white hover:text-primary-yellow bg-black/40 backdrop-blur-sm hover:bg-black/60 border border-white/20 shadow-md"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-md ${
                    isActive(link.path)
                      ? 'bg-primary-yellow text-primary-black font-bold shadow-lg'
                      : 'text-white hover:text-primary-yellow bg-black/40 backdrop-blur-sm hover:bg-black/60 border border-white/20'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/carrito"
                onClick={() => setIsMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-md ${
                  isActive('/carrito')
                    ? 'bg-primary-yellow text-primary-black font-bold shadow-lg'
                    : 'text-white hover:text-primary-yellow bg-black/40 backdrop-blur-sm hover:bg-black/60 border border-white/20'
                }`}
              >
                Carrito
              </Link>
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-white border-b border-white/20">
                    <p className="font-semibold">
                      {user?.name || user?.email?.split('@')[0] || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-300">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-md text-white hover:text-primary-yellow bg-black/40 backdrop-blur-sm hover:bg-black/60 border border-white/20 flex items-center space-x-2"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-md text-white hover:text-primary-yellow bg-black/40 backdrop-blur-sm hover:bg-black/60 border border-white/20 w-full text-left"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-md bg-primary-yellow text-primary-black hover:bg-yellow-500 font-semibold w-full text-left"
                  >
                    Registrarse
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  )
}

export default Header

