import { useState } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

function Catalogo() {
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [selectedBrand, setSelectedBrand] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')

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
  }

  const hasActiveFilters = selectedCategory !== 'todos' || selectedBrand !== 'todos' || searchTerm !== ''

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-black mb-4">
            Nuestro <span className="text-primary-red">Catálogo</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explora nuestra amplia gama de electrodomésticos
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-8 space-y-6">
          {/* Búsqueda */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, marca, categoría o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
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

          {/* Filtros de Categoría y Marca */}
          <div className="space-y-4">
            {/* Categorías */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                Categorías
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
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
              <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                Marcas
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
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
              <div className="text-center">
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-red hover:text-red-700 font-semibold transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <p className="text-gray-600 text-center">
            {filteredProducts.length} producto(s) encontrado(s)
          </p>
        </div>

        {/* Grid de productos */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
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
  )
}

export default Catalogo

