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
    name: 'Refrigeradores',
    image: '/images/products/Gia Electro/Heladera Drean HDR280F50B_1.webp',
  },
  {
    id: 'lavadoras',
    name: 'Lavadoras',
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
    image: '/images/products/Gia Electro/Cocina Longvie a gas de 56cm 12231B_2.webp',
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
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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
    if (container) {
      const scrollAmount = 320 // Ancho aproximado de cada tarjeta + gap
      const newScrollLeft =
        container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      })
    }
  }

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      )
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollButtons)
      window.addEventListener('resize', checkScrollButtons)
      
      return () => {
        container.removeEventListener('scroll', checkScrollButtons)
        window.removeEventListener('resize', checkScrollButtons)
      }
    }
  }, [])

  return (
    <div className="relative w-full">
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
        onScroll={checkScrollButtons}
        className="flex gap-4 overflow-x-auto scroll-smooth py-4 px-2 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {categories.map((category) => {
          const isActive = currentCategory === category.id
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`flex-shrink-0 w-[280px] h-[200px] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative group ${
                isActive ? 'ring-4 ring-primary-yellow' : ''
              }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div
                  className={`absolute bottom-0 left-0 right-0 p-4 ${
                    isActive ? 'bg-primary-yellow/90' : ''
                  }`}
                >
                  <h3
                    className={`text-lg font-bold ${
                      isActive ? 'text-primary-black' : 'text-white'
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

