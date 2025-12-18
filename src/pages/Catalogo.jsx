import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import ProductCard from '../components/ProductCard'
import RevealOnScroll from '../components/RevealOnScroll'
import CategorySlider from '../components/CategorySlider'
import { useProducts } from '../hooks/useProducts'

function Catalogo() {
  const products = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlCategory = searchParams.get('categoria')
  
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'todos')
  const [selectedBrand, setSelectedBrand] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')

  // Sincronizar categoría con URL
  useEffect(() => {
    if (urlCategory && urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory)
    }
  }, [urlCategory])

  // Actualizar URL cuando cambia la categoría
  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    if (category === 'todos') {
      searchParams.delete('categoria')
    } else {
      searchParams.set('categoria', category)
    }
    setSearchParams(searchParams, { replace: true })
  }

  const handleCategorySliderClick = (categoryId) => {
    handleCategoryChange(categoryId)
  }

  // Obtener categorías únicas
  const categories = ['todos', ...new Set(products.map((p) => p.category))]

  // Obtener marcas únicas (más conocidas primero)
  const popularBrands = ['Samsung', 'LG', 'Bosch', 'Panasonic', 'Whirlpool', 'Miele', 'Siemens', 'iRobot']
  const allBrands = [...new Set(products.map((p) => p.brand).filter(Boolean))]
  // Ordenar marcas: populares primero, luego las demás
  const brands = [
    'todos',
    ...popularBrands.filter((b) => allBrands.includes(b)),
    ...allBrands.filter((b) => !popularBrands.includes(b)).sort()
  ]

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'todos' || product.category === selectedCategory
    const matchesBrand =
      selectedBrand === 'todos' || product.brand === selectedBrand
    const matchesSearch =
      searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesBrand && matchesSearch
  })

  const clearFilters = () => {
    setSelectedCategory('todos')
    setSelectedBrand('todos')
    setSearchTerm('')
    searchParams.delete('categoria')
    setSearchParams(searchParams, { replace: true })
  }

  const hasActiveFilters = selectedCategory !== 'todos' || selectedBrand !== 'todos' || searchTerm !== ''

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-black mb-3 sm:mb-4">
            Nuestro <span className="text-primary-red">Catálogo</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Explora nuestra amplia gama de electrodomésticos
          </p>
          
          {/* Category Slider */}
          <div className="mb-8 sm:mb-12">
            <CategorySlider 
              currentCategory={selectedCategory} 
              onCategoryClick={handleCategorySliderClick}
            />
          </div>
        </div>

        {/* Layout con sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-20 h-max space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* Búsqueda */}
            <div className="">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Limpiar búsqueda"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Categorías */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Categorías
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                      selectedCategory === category
                        ? 'bg-primary-yellow text-primary-black shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {category === 'todos'
                      ? 'Todas'
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Marcas */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Marcas
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                      selectedBrand === brand
                        ? 'bg-primary-red text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {brand === 'todos' ? 'Todas' : brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón limpiar filtros */}
            {hasActiveFilters && (
              <div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-red hover:text-red-700 font-semibold transition-colors flex items-center gap-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Recomendados (usa container queries en ProductCard) */}
            {filteredProducts.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Recomendados
                </h3>
                <div className="bg-stone-200 rounded-lg p-4 space-y-4">
                  {filteredProducts.slice(0, 3).map((product, idx) => (
                    <RevealOnScroll key={`rec-${product.id}`} delayMs={idx * 120}>
                      <ProductCard product={product} enableContainer />
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Contenido principal */}
          <div className="order-1 lg:order-2">
            {/* Resultados */}
            <div className="mb-4">
              <p className="text-sm sm:text-base text-gray-600">
                {filteredProducts.length} producto(s) encontrado(s)
              </p>
            </div>

            {/* Grid de productos */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 items-stretch">
                {filteredProducts.map((product, idx) => (
                  <RevealOnScroll key={product.id} delayMs={(idx % 4) * 100}>
                    <ProductCard product={product} />
                  </RevealOnScroll>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-xl">
                  No se encontraron productos con los filtros seleccionados
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Catalogo

