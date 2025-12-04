import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useState, useRef, useEffect } from 'react'

const categories = [
  {
    id: 'televisores',
    name: 'Televisores',
    image: '/images/products/Gia Electro/Smart TV 43 FHD Samsung UN43T5300SGCZB_3.jpg',
  },
  {
    id: 'refrigeradores',
    name: 'Heladeras',
    image: '/images/products/Gia Electro/Heladera Drean HDR280F50B_1.webp',
  },
  {
    id: 'lavadoras',
    name: 'Lavarropas',
    image: '/images/products/Gia Electro/Lavarropas Samsung  WW70M0NHWU – 7 Kg_1.webp',
  },
  {
    id: 'aires-acondicionados',
    name: 'Aires Acondicionados',
    image: '/images/products/Gia Electro/Aire Acondicionado BGH Split Frio_Calor 5200W BSH5_2.jpg',
  },
  {
    id: 'cocinas',
    name: 'Cocinas',
    image: '/images/products/Gia Electro/Horno eléctrico KF-H46CL 46 Lt. Negro_1.jpg', // Imagen temporal hasta que se suba la imagen de cocina
  },
  {
    id: 'hornos',
    name: 'Hornos',
    image: '/images/products/Gia Electro/Horno eléctrico KF-H46CL 46 Lt. Negro_1.jpg',
  },
  {
    id: 'aspiradoras',
    name: 'Aspiradoras',
    image: '/images/products/Gia Electro/Aspiradora Robot CONGA 2499 -_1.jpg',
  },
  {
    id: 'cafeteras',
    name: 'Cafeteras',
    image: '/images/products/Gia Electro/Cafetera Espresso 2 en 1 con 20 Bar SL-EC8501_1.jpg',
  },
  {
    id: 'calefactores',
    name: 'Calefactores',
    image: '/images/products/Gia Electro/Calefactor Coppens 4000 Tb S Izquierda Peltre Acer_3.jpg',
  },
  {
    id: 'ventiladores',
    name: 'Ventiladores',
    image: '/images/products/Gia Electro/Ventilador de pie 20 90 W SHVP20M_1.jpg',
  },
  {
    id: 'batidoras',
    name: 'Batidoras',
    image: '/images/products/Gia Electro/Batidora Planetaria Daewoo KA2216G Roja 650W_3.jpg',
  },
]

function CategorySlider({ currentCategory = null, onCategoryClick }) {
  const navigate = useNavigate()
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(true)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const isScrolling = useRef(false)

  // Duplicar categorías para loop infinito
  const duplicatedCategories = [...categories, ...categories, ...categories]

  const handleCategoryClick = (categoryId) => {
    if (onCategoryClick) {
      onCategoryClick(categoryId)
    } else {
      // Si no hay callback, navegar a catálogo con filtro
      navigate(`/catalogo?categoria=${categoryId}`)
    }
  }

  const scroll = (direction) => {
    const container = scrollContainerRef.current
    if (container && !isScrolling.current) {
      const scrollAmount = getCardWidth() // Use dynamic width
      const newScrollLeft =
        container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      })
    }
  }

  const getCardWidth = () => {
    const container = scrollContainerRef.current
    if (!container) return 280 + 16 // Fallback for desktop card width + gap

    // Get the actual width of a card based on current viewport
    const firstChild = container.querySelector('button')
    if (firstChild) {
      const rect = firstChild.getBoundingClientRect()
      const gap = 12 // gap-3 = 12px, gap-4 = 16px. Using 12px for consistency with gap-3
      return rect.width + gap
    }
    return 280 + 16 // Fallback
  }

  const checkScrollPosition = () => {
    // En loop infinito, siempre podemos hacer scroll en ambas direcciones
    setCanScrollLeft(true)
    setCanScrollRight(true)
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      // Initial positioning to the middle set of categories for infinite loop effect
      setTimeout(() => {
        const cardWidth = getCardWidth()
        const totalCards = categories.length
        const setWidth = cardWidth * totalCards
        container.scrollLeft = setWidth
      }, 100) // Small delay to ensure cards are rendered

      container.addEventListener('scroll', checkScrollPosition)
      window.addEventListener('resize', checkScrollPosition)

      return () => {
        container.removeEventListener('scroll', checkScrollPosition)
        window.removeEventListener('resize', checkScrollPosition)
      }
    }
  }, [])

  return (
    <div className="relative w-full bg-black">
      {/* Botones de navegación */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hidden md:block"
          aria-label="Deslizar hacia la izquierda"
        >
          <ChevronLeftIcon className="h-6 w-6 text-primary-black" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hidden md:block"
          aria-label="Deslizar hacia la derecha"
        >
          <ChevronRightIcon className="h-6 w-6 text-primary-black" />
        </button>
      )}

      {/* Contenedor del slider */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth py-6 px-4 sm:px-6 md:px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {duplicatedCategories.map((category, index) => {
          const isActive = currentCategory === category.id
          return (
            <button
              key={`${category.id}-${index}`}
              onClick={() => handleCategoryClick(category.id)}
              className={`flex-shrink-0 w-[240px] sm:w-[260px] md:w-[280px] h-[160px] sm:h-[180px] md:h-[200px] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative group ${
                isActive ? 'ring-2 md:ring-4 ring-primary-yellow' : ''
              }`}
            >
              <div className="relative w-full h-full bg-white flex items-center justify-center">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-contain p-4 sm:p-5 group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(category.name)
                  }}
                />
                <div
                  className={`absolute bottom-0 left-0 right-0 p-2 sm:p-2.5 ${
                    isActive ? 'bg-primary-yellow/95' : 'bg-black/60'
                  }`}
                >
                  <h3
                    className={`text-xs sm:text-sm md:text-base font-bold ${
                      isActive ? 'text-primary-black' : 'text-white drop-shadow-lg'
                    }`}
                  >
                    {category.name}
                  </h3>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CategorySlider

