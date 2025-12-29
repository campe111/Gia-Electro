import { useState, useEffect, useMemo } from 'react'
import { products as defaultProducts } from '../data/products'
import { loadProductsFromSupabase } from '../utils/productStorage'
import { supabase } from '../config/supabase'

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
    // Cargar productos desde Supabase primero, luego localStorage como respaldo
    const loadProducts = async () => {
      try {
        // Intentar cargar desde Supabase
        const supabaseProducts = await loadProductsFromSupabase()
        
        if (supabaseProducts && supabaseProducts.length > 0) {
          // Si hay productos en Supabase, usarlos
          productsCache = supabaseProducts
          cacheTimestamp = Date.now()
          setProducts(supabaseProducts)
          // Sincronizar localStorage
          localStorage.setItem('giaElectroProducts', JSON.stringify(supabaseProducts))
          return
        }
      } catch (error) {
        console.error('Error cargando productos desde Supabase:', error)
      }
      
      // Si no hay en Supabase, intentar desde localStorage
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
        // Si no hay productos en el evento, recargar desde Supabase
        loadProducts()
      }
    }
    
    // Escuchar cambios en Supabase usando Realtime
    let productsChannel = null
    try {
      productsChannel = supabase
        .channel('products-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            console.log('🔄 Cambio detectado en Supabase products:', payload.eventType)
            // Recargar productos cuando hay cambios
            loadProducts()
          }
        )
        .subscribe()
    } catch (error) {
      console.warn('Error suscribiéndose a cambios de Supabase:', error)
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
      // Desuscribirse del canal de Supabase
      if (productsChannel) {
        supabase.removeChannel(productsChannel)
      }
    }
  }, [])

  // Memoizar productos para evitar re-renders innecesarios
  return useMemo(() => products, [products])
}

