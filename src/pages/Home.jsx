import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import RevealOnScroll from '../components/RevealOnScroll'
import CategorySlider from '../components/CategorySlider'
import { Link } from 'react-router-dom'
import { products } from '../data/products'

function Home() {
  // Mostrar solo los primeros 6 productos destacados
  const featuredProducts = products.slice(0, 6)

  return (
    <div>
      <Hero />

      {/* Category Slider */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-black mb-2">
              Explora por <span className="text-primary-red">Categoría</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Encuentra el electrodoméstico perfecto para tu hogar
            </p>
          </div>
          <CategorySlider />
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-12 sm:py-16 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-black mb-3 sm:mb-4">
              Productos <span className="text-primary-red">Destacados</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Descubre nuestra selección de los mejores electrodomésticos
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 items-stretch">
            {featuredProducts.map((product, idx) => (
              <RevealOnScroll key={product.id} delayMs={idx * 100}>
                <ProductCard product={product} />
              </RevealOnScroll>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/catalogo"
              className="bg-primary-yellow hover:bg-yellow-500 text-primary-black font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <span>Ver Todo el Catálogo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-yellow rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-black mb-2">
                Garantía de Calidad
              </h3>
              <p className="text-gray-600">
                Todos nuestros productos cuentan con garantía oficial del
                fabricante
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-red rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-black mb-2">
                Mejores Precios
              </h3>
              <p className="text-gray-600">
                Ofrecemos los mejores precios del mercado con financiación
                disponible
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-black rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary-yellow"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-black mb-2">
                Entrega Rápida
              </h3>
              <p className="text-gray-600">
                Envío rápido y seguro a todo el país con seguimiento en tiempo
                real
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

