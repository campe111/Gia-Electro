import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useProducts } from '../hooks/useProducts'
import logoGia from '../../logo-gia.png'
import { getPlaceholderImage } from '../utils/imageHelper'
import { getProductImageUrl } from '../utils/imageStorage'

// Constantes de configuración del carrusel
const CAROUSEL_CONFIG = {
  MAX_ANGLE: 35,
  Z_DEPTH: 200,
  // Escalas: [centro, ±1, ±2, ±3] - 1 central + 3 a cada lado
  SCALES: [1, 0.88, 0.75, 0.62],
  MAX_VISIBLE_CARDS: 3, // Máximo de tarjetas visibles a cada lado
  TRANSITION_DURATION: 700,
}

function Hero() {
  const products = useProducts()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  // Mostrar más productos para tener suficiente contenido
  const featuredProducts = products.slice(0, Math.max(7, products.length))

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Calcular offset horizontal responsivo - ajustado para 3 tarjetas a cada lado
  const getHorizontalOffset = () => {
    if (windowWidth < 640) return 130 // sm
    if (windowWidth < 768) return 150 // md
    if (windowWidth < 1024) return 170 // lg
    return 190 // xl
  }

  const navigate = (direction) => {
    setCurrentIndex((prev) => {
      if (direction === 'next') {
        return (prev + 1) % featuredProducts.length
      }
      return (prev - 1 + featuredProducts.length) % featuredProducts.length
    })
  }

  const normalizePosition = (position, totalCards) => {
    if (position > totalCards / 2) return position - totalCards
    if (position < -totalCards / 2) return position + totalCards
    return position
  }

  const getCardStyle = (index) => {
    const totalCards = featuredProducts.length
    const position = normalizePosition(index - currentIndex, totalCards)
    const absPosition = Math.abs(position)
    const horizontalOffset = getHorizontalOffset()
    
    // Ocultar tarjetas más allá de ±3
    if (absPosition > CAROUSEL_CONFIG.MAX_VISIBLE_CARDS) {
      return {
        opacity: 0,
        pointerEvents: 'none',
        transform: 'scale(0)',
        zIndex: -1,
      }
    }
    
    const angle = position * (CAROUSEL_CONFIG.MAX_ANGLE / 2.5)
    const offset = position * horizontalOffset
    const zOffset = -absPosition * CAROUSEL_CONFIG.Z_DEPTH
    const scale = CAROUSEL_CONFIG.SCALES[absPosition] ?? CAROUSEL_CONFIG.SCALES.at(-1)
    
    return {
      transform: `translateX(${offset}px) translateZ(${zOffset}px) rotateY(${angle}deg) scale(${scale})`,
      opacity: 1,
      zIndex: CAROUSEL_CONFIG.MAX_VISIBLE_CARDS + 1 - absPosition,
    }
  }

  const ProductCard = ({ product }) => (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-2xl"
      style={{
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Imagen */}
      <div className="relative w-full h-[140px] sm:h-[160px] md:h-[180px] lg:h-[200px] bg-white flex items-center justify-center">
        <img
          src={getProductImageUrl(product.image) || getPlaceholderImage(400, 300, product.name)}
          alt={product.name}
          className="w-full h-full object-contain p-2 sm:p-3"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.src = getPlaceholderImage(400, 300, product.name)
          }}
        />
        {product.category && (
          <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-primary-red text-white text-xs font-semibold px-2 py-1 rounded-md">
            {product.category.charAt(0).toUpperCase() + product.category.slice(1).replace('-', ' ')}
          </span>
        )}
      </div>
      
      {/* Información */}
      <div className="p-2 sm:p-2.5 md:p-3 bg-white">
        <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 mb-1 line-clamp-2 min-h-[1.5rem] sm:min-h-[1.75rem] md:min-h-[2rem]">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-primary-red">
            ${product.price.toLocaleString()}
          </span>
          <Link
            to="/catalogo"
            className="bg-primary-yellow hover:bg-yellow-500 text-primary-black font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 inline-flex items-center justify-center space-x-1.5 text-xs sm:text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Ver más</span>
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <section className="relative flex items-center justify-center min-h-[60dvh] md:min-h-[70vh] bg-gradient-to-b from-primary-red via-primary-red/70 to-primary-yellow text-white pt-0 pb-8 md:pt-0 md:pb-12 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header sin logo (solo texto) */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Electrodomésticos de{' '}
                <span className="text-primary-yellow">Calidad</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-800 md:text-gray-900 mb-6">
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
          </div>
        </div>
        {/* Decorative elements - Bandera alemana */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-red opacity-20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-yellow opacity-20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-black opacity-10 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Carrusel de productos 3D - Fondo negro a todo ancho */}
      {featuredProducts.length > 0 && (
        <div className="relative w-full bg-black py-4 sm:py-5 md:py-6 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-4 sm:mb-6 md:mb-8 text-white px-4">
              Productos <span className="text-primary-yellow">Destacados</span>
            </h2>
            
            <div className="relative w-full max-w-7xl mx-auto">
                {/* Botones de navegación */}
                <button
                  onClick={() => navigate('prev')}
                  className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 md:p-3 shadow-lg transition-all duration-200"
                  aria-label="Producto anterior"
                >
                  <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary-black" />
                </button>

                <button
                  onClick={() => navigate('next')}
                  className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 md:p-3 shadow-lg transition-all duration-200"
                  aria-label="Siguiente producto"
                >
                  <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary-black" />
                </button>

                {/* Contenedor del carrusel cover flow */}
                <div 
                  className="relative flex items-center justify-center mx-auto h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px]"
                  style={{
                    perspective: '1500px',
                    perspectiveOrigin: 'center center',
                    maxWidth: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <div 
                    className="relative flex items-center justify-center w-full h-full"
                    style={{
                      transformStyle: 'preserve-3d',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    {featuredProducts.map((product, index) => {
                      const cardStyle = getCardStyle(index)
                      const isActive = index === currentIndex
                      const position = normalizePosition(index - currentIndex, featuredProducts.length)
                      const absPosition = Math.abs(position)
                      
                      // Tamaños responsivos basados en el ancho de la ventana
                      const getCardWidth = () => {
                        if (windowWidth < 640) return '200px' // sm
                        if (windowWidth < 768) return '240px' // md
                        if (windowWidth < 1024) return '280px' // lg
                        return '320px' // xl
                      }
                      
                      return (
                        <div
                          key={product.id}
                          className="absolute cursor-pointer"
                          style={{
                            width: getCardWidth(),
                            maxWidth: 'calc(100vw - 80px)',
                            ...cardStyle,
                            transition: `all ${CAROUSEL_CONFIG.TRANSITION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                            willChange: 'transform, opacity',
                          }}
                          onClick={() => setCurrentIndex(index)}
                        >
                          <ProductCard product={product} />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Indicadores */}
                <div className="flex justify-center mt-4 sm:mt-5 gap-2">
                  {featuredProducts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? 'bg-primary-yellow w-5 sm:w-6'
                          : 'bg-white/30 w-2 sm:w-2.5 hover:bg-white/50'
                      }`}
                      aria-label={`Ir al slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  )
}

export default Hero

