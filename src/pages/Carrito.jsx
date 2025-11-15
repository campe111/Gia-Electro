import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

function Carrito() {
  const navigate = useNavigate()
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCart()

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (cartItems.length === 0) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <ShoppingBagIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-8">
              Explora nuestro catálogo y agrega productos a tu carrito
            </p>
            <Link
              to="/catalogo"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>Ver Catálogo</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-2">
                Carrito de <span className="text-primary-red">Compras</span>
              </h1>
              <p className="text-gray-600">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu
                carrito
              </p>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="mt-4 md:mt-0 text-sm text-primary-red hover:text-red-700 font-semibold transition-colors"
              >
                Vaciar carrito
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md p-4 md:p-6 flex flex-col md:flex-row gap-4"
                >
                  {/* Imagen del producto */}
                  <div className="flex-shrink-0 w-full md:w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/300x200?text=Imagen+No+Disponible'
                      }}
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-primary-black mb-1">
                        {item.name}
                      </h3>
                      {item.category && (
                        <span className="inline-block bg-primary-red text-white text-xs font-semibold px-2 py-1 rounded mb-2">
                          {item.category}
                        </span>
                      )}
                      <p className="text-2xl font-bold text-primary-red">
                        ${item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-2 hover:bg-gray-100 transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <MinusIcon className="h-5 w-5 text-gray-600" />
                        </button>
                        <span className="px-4 py-2 font-semibold text-primary-black min-w-[60px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-100 transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <PlusIcon className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="text-xl font-bold text-primary-black">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-primary-black mb-6">
                  Resumen del Pedido
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                    <span className="font-semibold">
                      ${totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span className="font-semibold">Gratis</span>
                  </div>
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary-black">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-primary-red">
                        ${totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn-primary w-full mb-4 flex items-center justify-center space-x-2"
                >
                  <span>Proceder al Pago</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </button>

                <Link
                  to="/catalogo"
                  className="block text-center text-primary-red hover:text-red-700 font-semibold transition-colors"
                >
                  ← Continuar comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Carrito

