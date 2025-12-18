import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import ProductCard from '../components/ProductCard'
import { useUser } from '../context/UserContext'
import { useProducts } from '../hooks/useProducts'
import RevealOnScroll from '../components/RevealOnScroll'
import toast from 'react-hot-toast'

function Favoritos() {
  const { isAuthenticated } = useUser()
  const products = useProducts()
  const [favoriteIds, setFavoriteIds] = useState([])
  const [favoriteProducts, setFavoriteProducts] = useState([])

  // Cargar favoritos desde localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const favorites = JSON.parse(localStorage.getItem('giaElectroFavorites') || '[]')
      setFavoriteIds(favorites)
      
      // Filtrar productos que están en favoritos
      const favoritesList = products.filter((product) => favorites.includes(product.id))
      setFavoriteProducts(favoritesList)
    } else {
      setFavoriteIds([])
      setFavoriteProducts([])
    }
  }, [isAuthenticated, products])

  // Escuchar cambios en localStorage (cuando se agregan/quitan favoritos)
  useEffect(() => {
    const handleStorageChange = () => {
      if (isAuthenticated) {
        const favorites = JSON.parse(localStorage.getItem('giaElectroFavorites') || '[]')
        setFavoriteIds(favorites)
        const favoritesList = products.filter((product) => favorites.includes(product.id))
        setFavoriteProducts(favoritesList)
      }
    }

    // Escuchar cambios en otras pestañas
    window.addEventListener('storage', handleStorageChange)
    
    // También escuchar cambios en la misma ventana
    const interval = setInterval(() => {
      if (isAuthenticated) {
        const favorites = JSON.parse(localStorage.getItem('giaElectroFavorites') || '[]')
        if (JSON.stringify(favorites) !== JSON.stringify(favoriteIds)) {
          setFavoriteIds(favorites)
          const favoritesList = products.filter((product) => favorites.includes(product.id))
          setFavoriteProducts(favoritesList)
        }
      }
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [isAuthenticated, products, favoriteIds])

  const handleRemoveAllFavorites = () => {
    if (!isAuthenticated) return
    
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los favoritos?')) {
      localStorage.setItem('giaElectroFavorites', JSON.stringify([]))
      setFavoriteIds([])
      setFavoriteProducts([])
      toast.success('Todos los favoritos han sido eliminados', {
        duration: 2000,
        icon: '❤️',
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <HeartIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-black mb-4">
              Inicia sesión para ver tus favoritos
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Guarda tus productos favoritos y accede a ellos fácilmente desde aquí
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-primary-red text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HeartIconSolid className="h-8 w-8 sm:h-10 sm:w-10 text-primary-red" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-black">
              Mis <span className="text-primary-red">Favoritos</span>
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            {favoriteProducts.length > 0
              ? `Tienes ${favoriteProducts.length} producto${favoriteProducts.length !== 1 ? 's' : ''} en tus favoritos`
              : 'Aún no tienes productos favoritos'}
          </p>
        </div>

        {/* Acciones */}
        {favoriteProducts.length > 0 && (
          <div className="flex justify-end mb-6">
            <button
              onClick={handleRemoveAllFavorites}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-semibold transition-colors border border-red-300 rounded-lg hover:bg-red-50"
            >
              Eliminar todos
            </button>
          </div>
        )}

        {/* Grid de productos favoritos */}
        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 items-stretch">
            {favoriteProducts.map((product, idx) => (
              <RevealOnScroll key={product.id} delayMs={(idx % 4) * 100}>
                <ProductCard product={product} />
              </RevealOnScroll>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <HeartIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              No tienes favoritos aún
            </h2>
            <p className="text-gray-600 mb-8">
              Explora nuestro catálogo y marca los productos que te gusten con el corazón
            </p>
            <Link
              to="/catalogo"
              className="inline-block px-6 py-3 bg-primary-red text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              Ver Catálogo
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Favoritos

