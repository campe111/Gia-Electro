import { supabase } from '../config/supabase'
import { logger } from './logger'

// Nombre del bucket en Supabase Storage
const PRODUCT_IMAGES_BUCKET = 'product-images'

/**
 * Sube una imagen a Supabase Storage
 * @param {File} file - Archivo de imagen
 * @param {string} productId - ID del producto
 * @returns {Promise<string>} URL pública de la imagen
 */
export const uploadProductImage = async (file, productId) => {
  try {
    // Generar nombre único para la imagen
    const fileExt = file.name.split('.').pop()
    const fileName = `${productId}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // No sobrescribir si existe
      })

    if (error) {
      // Si el archivo ya existe, intentar con timestamp único
      if (error.message.includes('already exists')) {
        const uniqueFileName = `${productId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
        const { data: retryData, error: retryError } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(uniqueFileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (retryError) {
          logger.error('Error subiendo imagen (reintento):', retryError)
          throw new Error(`Error al subir la imagen: ${retryError.message}`)
        }

        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .getPublicUrl(uniqueFileName)

        return urlData.publicUrl
      }

      logger.error('Error subiendo imagen:', error)
      throw new Error(`Error al subir la imagen: ${error.message}`)
    }

    // Obtener URL pública de la imagen
    const { data: urlData } = supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error) {
    logger.error('Error en uploadProductImage:', error)
    throw error
  }
}

/**
 * Elimina una imagen de Supabase Storage
 * @param {string} imageUrl - URL de la imagen a eliminar
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
export const deleteProductImage = async (imageUrl) => {
  try {
    // Extraer el nombre del archivo de la URL
    const urlParts = imageUrl.split('/')
    const fileName = urlParts[urlParts.length - 1].split('?')[0] // Remover query params

    if (!fileName || fileName === 'undefined') {
      logger.warn('No se pudo extraer el nombre del archivo de la URL:', imageUrl)
      return false
    }

    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([fileName])

    if (error) {
      logger.error('Error eliminando imagen:', error)
      return false
    }

    return true
  } catch (error) {
    logger.error('Error en deleteProductImage:', error)
    return false
  }
}

/**
 * Verifica si una URL es de Supabase Storage
 * @param {string} url - URL a verificar
 * @returns {boolean}
 */
export const isSupabaseImageUrl = (url) => {
  if (!url) return false
  // Verificar si es una URL de Supabase Storage o una URL base64
  return url.startsWith('http') && url.includes('supabase.co/storage')
}

/**
 * Obtiene la URL de la imagen, manejando tanto URLs de Supabase como base64
 * @param {string} imageUrl - URL de la imagen o base64
 * @returns {string} URL válida de la imagen
 */
export const getProductImageUrl = (imageUrl) => {
  if (!imageUrl) return null
  
  // Si es base64, devolverlo directamente
  if (imageUrl.startsWith('data:image')) {
    return imageUrl
  }
  
  // Si es una URL de Supabase, devolverla
  if (isSupabaseImageUrl(imageUrl)) {
    return imageUrl
  }
  
  // Si es una ruta local, devolverla
  if (imageUrl.startsWith('/')) {
    return imageUrl
  }
  
  // Por defecto, devolver la URL tal cual
  return imageUrl
}

