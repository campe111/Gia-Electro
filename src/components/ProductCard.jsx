import { Link } from 'react-router-dom'
import { ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline'
import { useCart } from '../context/CartContext'

function ProductCard({ product, enableContainer = false }) {
  const { id, name, price, image, category, description } = product
  const previousPrice =
    (product.previousPrice ?? product.originalPrice) &&
    (product.previousPrice ?? product.originalPrice) > price
      ? (product.previousPrice ?? product.originalPrice)
      : null
  const { addToCart, isInCart } = useCart()
  const inCart = isInCart(id)

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

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden transition-transform duration-200 hover:scale-105 border border-gray-700/50 ${enableContainer ? '[container-type:inline-size]' : ''}`}>
      <div className="relative bg-gray-900 overflow-hidden aspect-[4/3] sm:aspect-[16/10]">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.src =
              'https://via.placeholder.com/300x200?text=Imagen+No+Disponible'
          }}
        />
        {category && (
          <span className="absolute top-2 right-2 bg-primary-red text-white text-xs font-semibold px-2 py-1 rounded">
            {category}
          </span>
        )}
        {previousPrice && (
          <span className="absolute top-2 left-2 bg-primary-yellow text-primary-black text-xs font-extrabold px-2 py-1 rounded">
            Oferta
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg @[min-width:18rem]:text-xl font-bold text-white mb-2">{name}</h3>
        {description && (
          <p className="text-sm @[min-width:18rem]:text-base text-gray-300 mb-4 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col">
            {previousPrice && (
              <span className="text-sm text-gray-400 line-through">
                Antes ${previousPrice.toLocaleString()}
              </span>
            )}
            <span className="text-2xl @[min-width:18rem]:text-3xl font-bold text-primary-yellow">
              ${price.toLocaleString()}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className={`flex items-center justify-center space-x-1 font-semibold py-2 px-4 rounded-lg transition-all duration-200 ${
                inCart
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-primary-yellow hover:bg-yellow-500 text-primary-black'
              }`}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span className="hidden sm:inline">
                {inCart ? 'En carrito' : 'Agregar'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard

