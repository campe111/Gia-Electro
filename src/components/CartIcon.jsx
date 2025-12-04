
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function CartIcon() {
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()

  return (
    <Link
      to="/carrito"
      className="relative text-sm font-medium text-gray-800 hover:text-primary-red pb-1 border-b-2 border-transparent hover:border-primary-red inline-flex items-center gap-1"
      aria-label="Carrito de compras"
    >
      <span>Carrito</span>
      {totalItems > 0 && (
        <span className="bg-primary-red text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] leading-none">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}

export default CartIcon
