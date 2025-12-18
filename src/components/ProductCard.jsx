import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { getPlaceholderImage } from '../utils/imageHelper'
import toast from 'react-hot-toast'

function ProductCard({ product, enableContainer = false }) {
  const { id, name, price, image, category, description } = product
  
  // Si la imagen ya es una ruta local (empieza con /images/), usarla directamente
  // Si es una URL externa, usarla como fallback
  const [imageSrc, setImageSrc] = useState(image || getPlaceholderImage(300, 200, 'Imagen no disponible'))
  const [isFavorite, setIsFavorite] = useState(false)
  
  const previousPrice =
    (product.previousPrice ?? product.originalPrice) &&
    (product.previousPrice ?? product.originalPrice) > price
      ? (product.previousPrice ?? product.originalPrice)
      : null
  const { addToCart, isInCart } = useCart()
  const { isAuthenticated } = useUser()
  const inCart = isInCart(id)

  // Cargar favoritos desde localStorage solo si el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
    const favorites = JSON.parse(localStorage.getItem('giaElectroFavorites') || '[]')
    setIsFavorite(favorites.includes(id))
    } else {
      setIsFavorite(false)
    }
  }, [id, isAuthenticated])

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    // Mostrar notificación visual
    const button = e.target.closest('button')
    if (button) {
      button.classList.add('scale-105')
      setTimeout(() => {
        button.classList.remove('scale-105')
      }, 200)
    }
  }

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Solo permitir agregar favoritos si el usuario está autenticado
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar productos a favoritos', {
        duration: 3000,
        icon: '🔒',
      })
      return
    }
    
    const favorites = JSON.parse(localStorage.getItem('giaElectroFavorites') || '[]')
    let newFavorites
    
    if (isFavorite) {
      newFavorites = favorites.filter((favId) => favId !== id)
      toast.success('Producto eliminado de favoritos', {
        duration: 2000,
        icon: '❤️',
      })
    } else {
      newFavorites = [...favorites, id]
      toast.success('Producto agregado a favoritos', {
        duration: 2000,
        icon: '❤️',
      })
    }
    
    localStorage.setItem('giaElectroFavorites', JSON.stringify(newFavorites))
    setIsFavorite(!isFavorite)
  }

  const handleImageError = (e) => {
    // Si la imagen local falla, usar placeholder local
    const placeholder = getPlaceholderImage(300, 200, 'Imagen no disponible')
    setImageSrc(placeholder)
    e.target.src = placeholder
  }

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-xl border border-gray-200 flex flex-col h-full ${enableContainer ? '[container-type:inline-size]' : ''}`}>
      {/* Imagen con botón de favoritos */}
      <div className="relative bg-gray-50 overflow-hidden aspect-[4/3] flex items-center justify-center">
        <img
          src={imageSrc}
          alt={name}
          className="w-full h-full object-contain p-4"
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
        
        {/* Botón de favoritos */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all duration-200 hover:scale-110 z-10"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          {isFavorite ? (
            <HeartIconSolid className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 hover:text-red-500" />
          )}
        </button>

        {/* Badges */}
        {category && (
          <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-primary-red text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
        )}
        {previousPrice && (
          <span className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-primary-yellow text-primary-black text-[10px] sm:text-xs font-extrabold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
            Oferta
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
          {name}
        </h3>
        {description && (
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 flex-grow">
            {description}
          </p>
        )}
        <div className="mt-auto">
          <div className="flex flex-col gap-3">
            {/* Precio */}
            <div className="flex flex-col">
              {previousPrice && (
                <span className="text-sm text-gray-400 line-through">
                  Antes ${previousPrice.toLocaleString()}
                </span>
              )}
              <span className="text-xl sm:text-2xl font-bold text-primary-red">
                ${price.toLocaleString()}
              </span>
            </div>

            {/* Botón agregar al carrito */}
            <button
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-2 font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-all duration-200 w-full text-sm sm:text-base ${
                inCart
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-primary-yellow hover:bg-yellow-500 text-primary-black'
              }`}
            >
              <ShoppingCartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{inCart ? 'En carrito' : 'Agregar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard

