import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bars3Icon, XMarkIcon, UserIcon, ArrowRightOnRectangleIcon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import CartIcon from './CartIcon'
import AuthModal from './AuthModal'
import { useUser } from '../context/UserContext'
import logoGia from '../../logo-gia.png'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useUser()
  const userMenuRef = useRef(null)
  const categoriesMenuRef = useRef(null)

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false)
      const result = await logout()
      
      if (result?.success !== false) {
        // Esperar a que Supabase actualice el estado
        await new Promise(resolve => setTimeout(resolve, 200))
        // Forzar recarga completa para asegurar que el estado se actualice
        window.location.href = '/'
      } else {
        console.error('Error al cerrar sesión:', result?.error)
        // Aún así forzar recarga
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // Forzar recarga incluso si hay error
      window.location.href = '/'
    }
  }

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
      if (categoriesMenuRef.current && !categoriesMenuRef.current.contains(event.target)) {
        setIsCategoriesMenuOpen(false)
      }
    }

    if (isUserMenuOpen || isCategoriesMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen, isCategoriesMenuOpen])

  const categories = [
    { id: 'todos', label: 'Todos', path: '/catalogo' },
    { id: 'heladeras', label: 'Heladeras', path: '/catalogo?categoria=heladeras' },
    { id: 'cocinas', label: 'Cocinas', path: '/catalogo?categoria=cocinas' },
    { id: 'microondas', label: 'Microondas', path: '/catalogo?categoria=microondas' },
    { id: 'freezer', label: 'Freezer', path: '/catalogo?categoria=freezer' },
    { id: 'lavarropas', label: 'Lavarropas', path: '/catalogo?categoria=lavarropas' },
  ]

  const handleCategoryClick = (path) => {
    navigate(path)
    setIsCategoriesMenuOpen(false)
  }

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/catalogo', label: 'Catálogo' },
    { path: '/categorias', label: 'Categorías' },
    { path: '/favoritos', label: 'Favoritos' },
    { path: '/contacto', label: 'Contacto' },
  ]

  return (
    <header className="bg-white text-gray-900 shadow-md sticky top-0 z-50 border-t-4 border-primary-red">
      <div className="w-full max-w-7xl mx-auto px-4 relative z-10">
        {/* Fila superior desktop: logo izquierda, búsqueda centro, acciones derecha */}
        <div className="hidden md:grid grid-cols-[auto,1fr,auto] items-center gap-6 py-2">
          {/* Logo izquierda */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center justify-start">
              <img
                src={logoGia}
                alt="Gia Electro"
                className="h-14 lg:h-18 w-auto"
                style={{ transform: 'scale(1.98)', transformOrigin: 'left center' }}
                loading="lazy"
                decoding="async"
              />
            </Link>
          </div>

          {/* Barra de búsqueda centro */}
          <div className="flex-1">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full rounded-full border border-gray-300 pl-5 pr-11 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red shadow-sm"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Acciones derecha: sesión (sin carrito) */}
          <div className="flex items-center justify-end gap-4">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-800 hover:text-primary-red hover:bg-gray-100 border border-gray-200 bg-white shadow-sm"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="hidden lg:inline">
                    {user?.name || user?.email?.split('@')[0] || 'Mi cuenta'}
                  </span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-2xl z-[9999] border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.name || user?.email?.split('@')[0] || 'Mi cuenta'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 font-medium">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm font-medium text-gray-800 hover:text-primary-red"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-primary-red text-white hover:bg-red-600 shadow-sm"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Fila superior mobile: logo izquierda, acciones derecha */}
        <div className="flex md:hidden items-center justify-between py-2">
          <Link to="/" className="flex items-center">
            <img
              src={logoGia}
              alt="Gia Electro"
              className="h-10 w-auto"
              loading="lazy"
              decoding="async"
            />
          </Link>
          <div className="flex items-center gap-3">
            <CartIcon />
            <button
              className="p-2 rounded-md text-gray-700 hover:text-primary-red hover:bg-gray-100 border border-gray-200 shadow-sm"
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

        {/* Barra de búsqueda mobile */}
        <div className="md:hidden pb-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full rounded-full border border-gray-300 pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-primary-red shadow-sm"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Navegación principal desktop (segunda fila) */}
        <div className="hidden md:flex items-center justify-center py-2 border-t border-gray-200 text-sm">
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => {
              if (link.path === '/categorias') {
                return (
                  <div key={link.path} className="relative" ref={categoriesMenuRef}>
                    <button
                      onClick={() => setIsCategoriesMenuOpen(!isCategoriesMenuOpen)}
                      className={`pb-1 border-b-2 transition-colors inline-flex items-center gap-1 pl-2 first:pl-0 ${
                        isActive(link.path) || isCategoriesMenuOpen
                          ? 'border-primary-red text-primary-red font-semibold'
                          : 'border-transparent text-gray-800 hover:text-primary-red hover:border-primary-red'
                      }`}
                    >
                      {link.label}
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${isCategoriesMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isCategoriesMenuOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-2xl z-[9999] border border-gray-200 overflow-hidden">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.path)}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-primary-red hover:text-white transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`pb-1 border-b-2 transition-colors inline-flex items-center gap-1 pl-2 first:pl-0 ${
                    isActive(link.path)
                      ? 'border-primary-red text-primary-red font-semibold'
                      : 'border-transparent text-gray-800 hover:text-primary-red hover:border-primary-red'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <div className="ml-4">
            <CartIcon />
          </div>
        </div>

        {/* Navegación mobile desplegable */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-200 mt-2">
            <div className="flex flex-col space-y-2 pt-2">
              {navLinks.map((link) => {
                if (link.path === '/categorias') {
                  return (
                    <div key={link.path}>
                      <button
                        onClick={() => setIsCategoriesMenuOpen(!isCategoriesMenuOpen)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center justify-between ${
                          isActive(link.path) || isCategoriesMenuOpen
                            ? 'bg-primary-red text-white'
                            : 'text-gray-800 hover:text-primary-red bg-white hover:bg-red-50 border border-gray-200'
                        }`}
                      >
                        <span>{link.label}</span>
                        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isCategoriesMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isCategoriesMenuOpen && (
                        <div className="mt-1 ml-4 space-y-1">
                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              to={category.path}
                              onClick={() => {
                                setIsMenuOpen(false)
                                setIsCategoriesMenuOpen(false)
                              }}
                              className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-primary-red hover:text-white transition-colors bg-gray-50"
                            >
                              {category.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-sm ${
                      isActive(link.path)
                        ? 'bg-primary-red text-white'
                        : 'text-gray-800 hover:text-primary-red bg-white hover:bg-red-50 border border-gray-200'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <Link
                to="/carrito"
                onClick={() => setIsMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-sm ${
                  isActive('/carrito')
                    ? 'bg-primary-red text-white'
                    : 'text-gray-800 hover:text-primary-red bg-white hover:bg-red-50 border border-gray-200'
                }`}
              >
                Carrito
              </Link>
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-800 border-t border-gray-200 mt-1">
                    <p className="font-semibold">
                      {user?.name || user?.email?.split('@')[0] || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={async () => {
                      setIsMenuOpen(false)
                      await handleLogout()
                    }}
                    className="mt-1 px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-sm text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-2"
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
                    className="mt-1 px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-sm text-gray-800 hover:text-primary-red bg-white hover:bg-red-50 border border-gray-200 w-full text-left"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-sm bg-primary-red text-white hover:bg-red-600 w-full text-left mt-1"
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

