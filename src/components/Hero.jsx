import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { products } from '../data/products'

function Hero() {
  const [currentIndex, setCurrentIndex] = useState(1) // Empezar en 1 para saltar la copia del último
  const [isTransitioning, setIsTransitioning] = useState(true)
  // Obtener productos destacados (primeros 6 o los que se pasen como prop)
  const featuredProducts = products.slice(0, 6)
  // Crear array con slides duplicados: [último, ...originales, primero]
  const slidesArray = [...featuredProducts.slice(-1), ...featuredProducts, ...featuredProducts.slice(0, 1)]

  // Auto-play del carrusel con loop infinito
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1
        // Si llegamos al último slide real (antes de la copia del primero), saltar al inicio
        if (nextIndex >= featuredProducts.length + 1) {
          setTimeout(() => {
            setIsTransitioning(false)
            setCurrentIndex(1) // Volver al primer slide real
            setTimeout(() => setIsTransitioning(true), 50)
          }, 5000) // Esperar a que termine la transición de 5 segundos
          return nextIndex
        }
        return nextIndex
      })
    }, 10000) // Cambia cada 10 segundos (5s transición + 5s espera)

    return () => clearInterval(interval)
  }, [featuredProducts.length])

  const goToPrevious = () => {
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 1) {
        // Ir a la copia del último (índice 0) primero
        setTimeout(() => {
          setIsTransitioning(false)
          setCurrentIndex(featuredProducts.length) // Ir a la copia del último sin animación
          setTimeout(() => setIsTransitioning(true), 50)
        }, 5000)
        return 0
      }
      return prevIndex - 1
    })
  }

  const goToNext = () => {
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1
      if (nextIndex >= featuredProducts.length + 1) {
        // Saltar al inicio sin animación
        setTimeout(() => {
          setIsTransitioning(false)
          setCurrentIndex(1) // Volver al primer slide real
          setTimeout(() => setIsTransitioning(true), 50)
        }, 5000)
        return nextIndex
      }
      return nextIndex
    })
  }

  const goToSlide = (index) => {
    setIsTransitioning(true)
    setCurrentIndex(index + 1) // +1 porque el primer slide real está en índice 1
  }

  return (
    <section className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-primary-black via-gray-900 to-primary-black text-white py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Electrodomésticos de{' '}
              <span className="text-primary-yellow">Calidad</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Encuentra los mejores electrodomésticos para tu hogar. 
              Calidad, precio y garantía en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/catalogo"
                className="btn-primary inline-flex items-center justify-center space-x-2"
              >
                <span>Ver Catálogo</span>
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                to="/contacto"
                className="btn-secondary inline-flex items-center justify-center"
              >
                Contáctanos
              </Link>
            </div>
          </div>

          {/* Carrusel de productos */}
          {featuredProducts.length > 0 && (
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                Productos <span className="text-primary-yellow">Destacados</span>
              </h2>
              
              <div className="relative overflow-hidden rounded-lg w-full">
                <div
                  className="flex transition-transform ease-in-out"
                  style={{
                    transform: `translateX(-${currentIndex * (100 / slidesArray.length)}%)`,
                    width: `${slidesArray.length * 100}%`,
                    transitionDuration: isTransitioning ? '5000ms' : '0ms', // Sin transición cuando resetea
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', // Curva suave
                  }}
                >
                  {slidesArray.map((product, index) => (
                    <div
                      key={`${product.id}-${index}`}
                      className="flex-shrink-0"
                      style={{ 
                        width: `${100 / slidesArray.length}%`,
                        minWidth: `${100 / slidesArray.length}%`,
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        {/* Imagen del producto */}
                        <div className="flex-shrink-0 w-full md:w-1/2">
                          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden bg-gray-800">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  'https://via.placeholder.com/500x400?text=Imagen+No+Disponible'
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Información del producto */}
                        <div className="flex-1 text-center md:text-left">
                          <span className="inline-block bg-primary-red text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                            {product.category}
                          </span>
                          <h3 className="text-2xl md:text-3xl font-bold mb-3">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-gray-300 mb-4 text-lg">
                              {product.description}
                            </p>
                          )}
                          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                            <span className="text-3xl md:text-4xl font-bold text-primary-yellow">
                              ${product.price.toLocaleString()}
                            </span>
                            <Link
                              to="/catalogo"
                              className="btn-primary inline-flex items-center justify-center space-x-2"
                            >
                              <span>Ver más</span>
                              <ArrowRightIcon className="h-5 w-5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botones de navegación */}
                {featuredProducts.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-3 transition-all duration-200 z-10"
                      aria-label="Producto anterior"
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-3 transition-all duration-200 z-10"
                      aria-label="Siguiente producto"
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Indicadores de puntos */}
                {featuredProducts.length > 1 && (
                  <div className="flex justify-center mt-6 gap-2">
                    {featuredProducts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-3 rounded-full transition-all duration-300 ${
                          index === (currentIndex - 1) % featuredProducts.length
                            ? 'bg-primary-yellow w-8'
                            : 'bg-white/30 w-3 hover:bg-white/50'
                        }`}
                        aria-label={`Ir al slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-red opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-yellow opacity-10 rounded-full blur-3xl"></div>
    </section>
  )
}

export default Hero

