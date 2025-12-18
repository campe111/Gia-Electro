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
    return defaultProducts
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
      // Si no hay productos guardados, usar los por defecto
      if (!productsCache) {
        productsCache = defaultProducts
        cacheTimestamp = Date.now()
      }
      setProducts(productsCache)
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
    }, 3000) // Verificar cada 3 segundos (reducido para mejor rendimiento)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Memoizar productos para evitar re-renders innecesarios
  return useMemo(() => products, [products])
}

