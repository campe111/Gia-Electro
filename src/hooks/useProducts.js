import { useState, useEffect, useMemo } from 'react'
import { products as defaultProducts } from '../data/products'

// Cache en memoria para evitar re-parsear constantemente
let productsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export const useProducts = () => {
  const [products, setProducts] = useState(() => {
    // Usar cache si está disponible y no ha expirado
    if (productsCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return productsCache
    }
    // No usar productos por defecto, empezar vacío
    return []
  })

  useEffect(() => {
    // Cargar productos desde localStorage si existen (actualizados desde admin)
    const loadProducts = () => {
      try {
        const savedProducts = localStorage.getItem('giaElectroProducts')
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts)
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Actualizar cache
            productsCache = parsed
            cacheTimestamp = Date.now()
            setProducts(parsed)
            return
          }
        }
      } catch (error) {
        console.error('Error cargando productos desde localStorage:', error)
      }
      // Si no hay productos guardados, usar array vacío
      if (!productsCache) {
        productsCache = []
        cacheTimestamp = Date.now()
      }
      setProducts(productsCache)
    }

    loadProducts()

    // Escuchar cambios en localStorage (cuando el admin actualiza productos en otra ventana/pestaña)
    const handleStorageChange = (e) => {
      if (e.key === 'giaElectroProducts') {
        loadProducts()
      }
    }

    // Escuchar evento personalizado para actualizaciones en tiempo real en la misma ventana
    const handleProductsUpdate = (e) => {
      if (e.detail?.products) {
        // Actualizar inmediatamente con los productos del evento
        productsCache = e.detail.products
        cacheTimestamp = Date.now()
        setProducts(e.detail.products)
      } else {
        // Si no hay productos en el evento, recargar desde localStorage
        loadProducts()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('productsUpdated', handleProductsUpdate)
    
    // También escuchar cambios en la misma ventana como respaldo (para cuando el admin actualiza en la misma sesión)
    // Reducido a 5 segundos ya que ahora tenemos actualización en tiempo real
    const interval = setInterval(() => {
      const savedProducts = localStorage.getItem('giaElectroProducts')
      if (savedProducts) {
        try {
          const parsed = JSON.parse(savedProducts)
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Solo actualizar si cambió
            if (JSON.stringify(parsed) !== JSON.stringify(productsCache)) {
              productsCache = parsed
              cacheTimestamp = Date.now()
              setProducts(parsed)
            }
          }
        } catch (error) {
          // Ignorar errores de parsing
        }
      }
    }, 5000) // Verificar cada 5 segundos como respaldo

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('productsUpdated', handleProductsUpdate)
      clearInterval(interval)
    }
  }, [])

  // Memoizar productos para evitar re-renders innecesarios
  return useMemo(() => products, [products])
}

