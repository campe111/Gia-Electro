import { uploadProductImage } from './imageStorage'
import { logger } from './logger'

/**
 * Migra imágenes en base64 a Supabase Storage
 * @param {Array} products - Array de productos con imágenes en base64
 * @returns {Promise<Array>} Array de productos con URLs de Supabase
 */
export const migrateBase64ImagesToSupabase = async (products) => {
  const migratedProducts = []
  
  for (const product of products) {
    if (product.image && product.image.startsWith('data:image')) {
      try {
        // Convertir base64 a File
        const response = await fetch(product.image)
        const blob = await response.blob()
        const file = new File([blob], `${product.id}.jpg`, { type: blob.type })
        
        // Subir a Supabase Storage
        const imageUrl = await uploadProductImage(file, product.id)
        
        migratedProducts.push({
          ...product,
          image: imageUrl
        })
        
        logger.log(`Imagen migrada para producto ${product.id}`)
      } catch (error) {
        logger.error(`Error migrando imagen para producto ${product.id}:`, error)
        // Mantener la imagen base64 si falla la migración
        migratedProducts.push(product)
      }
    } else {
      // Si no es base64, mantenerla tal cual
      migratedProducts.push(product)
    }
  }
  
  return migratedProducts
}

