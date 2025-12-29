import { supabase } from '../config/supabase'
import { logger } from './logger'

/**
 * Guarda todos los productos en Supabase
 * Reemplaza todos los productos existentes
 */
export const saveProductsToSupabase = async (products) => {
  try {
    // Si no hay productos, eliminar todos y retornar
    if (!products || products.length === 0) {
      // Obtener todos los IDs existentes y eliminarlos
      const { data: existingProducts } = await supabase
        .from('products')
        .select('id')
      
      if (existingProducts && existingProducts.length > 0) {
        const ids = existingProducts.map(p => p.id)
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .in('id', ids)
        
        if (deleteError) {
          logger.warn('Error eliminando productos:', deleteError)
        }
      }
      return { success: true, count: 0 }
    }

    // Obtener productos existentes para comparar
    const { data: existingProducts } = await supabase
      .from('products')
      .select('id')
    
    const existingIds = new Set((existingProducts || []).map(p => p.id))
    const newIds = new Set(products.map(p => p.id))
    
    // Eliminar productos que ya no están en la lista
    const idsToDelete = [...existingIds].filter(id => !newIds.has(id))
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .in('id', idsToDelete)
      
      if (deleteError) {
        logger.warn('Error eliminando productos obsoletos:', deleteError)
      }
    }
    
    // Usar upsert para insertar o actualizar productos
    const { data, error } = await supabase
      .from('products')
      .upsert(products.map(product => ({
        id: product.id,
        name: product.name,
        brand: product.brand || null,
        price: product.price,
        category: product.category,
        description: product.description || null,
        image: product.image || null,
        previous_price: product.previousPrice || product.previous_price || null,
      })), {
        onConflict: 'id'
      })
      .select()

    if (error) {
      logger.error('Error guardando productos en Supabase:', error)
      throw error
    }

    logger.log(`✅ ${data.length} productos guardados en Supabase`)
    return { success: true, count: data.length, data }
  } catch (error) {
    logger.error('Error en saveProductsToSupabase:', error)
    throw error
  }
}

/**
 * Lee todos los productos desde Supabase
 */
export const loadProductsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      // Si la tabla no existe, retornar array vacío
      if (error.code === 'PGRST116' || error.message?.includes('Could not find the table')) {
        logger.warn('Tabla products no existe en Supabase, retornando array vacío')
        return []
      }
      logger.error('Error cargando productos desde Supabase:', error)
      throw error
    }

    // Convertir los datos de Supabase al formato esperado
    const products = (data || []).map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand || '',
      price: parseFloat(product.price) || 0,
      category: product.category || 'otros',
      description: product.description || '',
      image: product.image || '',
      previousPrice: product.previous_price ? parseFloat(product.previous_price) : null,
    }))

    logger.log(`✅ ${products.length} productos cargados desde Supabase`)
    return products
  } catch (error) {
    logger.error('Error en loadProductsFromSupabase:', error)
    // Retornar array vacío en caso de error
    return []
  }
}

/**
 * Agrega o actualiza un producto en Supabase
 */
export const upsertProductToSupabase = async (product) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .upsert({
        id: product.id,
        name: product.name,
        brand: product.brand || null,
        price: product.price,
        category: product.category,
        description: product.description || null,
        image: product.image || null,
        previous_price: product.previousPrice || product.previous_price || null,
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (error) {
      logger.error('Error guardando producto en Supabase:', error)
      throw error
    }

    return { success: true, data }
  } catch (error) {
    logger.error('Error en upsertProductToSupabase:', error)
    throw error
  }
}

/**
 * Elimina un producto de Supabase
 */
export const deleteProductFromSupabase = async (productId) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      logger.error('Error eliminando producto de Supabase:', error)
      throw error
    }

    return { success: true }
  } catch (error) {
    logger.error('Error en deleteProductFromSupabase:', error)
    throw error
  }
}

