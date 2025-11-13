import { Link } from 'react-router-dom'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'

function ProductCard({ product }) {
  const { id, name, price, image, category, description } = product

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
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-red">
            ${price.toLocaleString()}
          </span>
          <Link
            to={`/catalogo/${id}`}
            className="flex items-center space-x-1 bg-primary-yellow hover:bg-yellow-500 text-primary-black font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span>Ver más</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductCard

