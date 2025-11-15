import { Link } from 'react-router-dom'
import { ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline'
import { useCart } from '../context/CartContext'

function ProductCard({ product }) {
  const { id, name, price, image, category, description } = product
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
    <div className="card">
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
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
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-primary-black mb-2">{name}</h3>
        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-2xl font-bold text-primary-red">
            ${price.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <Link
              to={`/catalogo/${id}`}
              className="flex items-center justify-center space-x-1 bg-gray-200 hover:bg-gray-300 text-primary-black font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              <EyeIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Ver</span>
            </Link>
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

