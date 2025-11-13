import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

function Catalogo() {
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')

  // Obtener categorías únicas
  const categories = ['todos', ...new Set(products.map((p) => p.category))]

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'todos' || product.category === selectedCategory
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
        <div className="mb-8 space-y-4">
          {/* Búsqueda */}
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
            />
          </div>

          {/* Categorías */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-yellow text-primary-black'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
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

