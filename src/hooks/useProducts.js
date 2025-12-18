import { useState, useEffect } from 'react'
import { products as defaultProducts } from '../data/products'

export const useProducts = () => {
  const [products, setProducts] = useState(defaultProducts)

  useEffect(() => {
    // Cargar productos desde localStorage si existen (actualizados desde admin)
    const loadProducts = () => {
      try {
        const savedProducts = localStorage.getItem('giaElectroProducts')
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed)
            return
          }
        }
      } catch (error) {
        console.error('Error cargando productos desde localStorage:', error)
      }
      // Si no hay productos guardados, usar los por defecto
      setProducts(defaultProducts)
    }

    loadProducts()

    // Escuchar cambios en localStorage (cuando el admin actualiza productos)
    const handleStorageChange = (e) => {
      if (e.key === 'giaElectroProducts') {
        loadProducts()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // También escuchar cambios en la misma ventana (para cuando el admin actualiza en la misma sesión)
    const interval = setInterval(() => {
      const savedProducts = localStorage.getItem('giaElectroProducts')
      if (savedProducts) {
        try {
          const parsed = JSON.parse(savedProducts)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed)
          }
        } catch (error) {
          // Ignorar errores de parsing
        }
      }
    }, 2000) // Verificar cada 2 segundos

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  return products
}

