import { Link } from 'react-router-dom'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useCart } from '../context/CartContext'

function CartIcon() {
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()

  return (
    <Link
      to="/carrito"
      className="relative p-2 rounded-md text-gray-300 hover:text-primary-yellow hover:bg-gray-800 transition-colors"
      aria-label="Carrito de compras"
    >
      <ShoppingCartIcon className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}

export default CartIcon

