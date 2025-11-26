/**
 * Helper para obtener la ruta de imagen de un producto
 * Intenta cargar la imagen local primero, si no existe usa la URL de fallback
 */
export function getProductImage(productId, fallbackUrl) {
  // Intentar cargar imagen local por ID
  try {
    // Vite requiere import dinámico para imágenes locales
    // Intentamos cargar desde diferentes rutas posibles
    const imagePaths = [
      `/src/assets/images/products/product-${productId}.jpg`,
      `/src/assets/images/products/product-${productId}.jpeg`,
      `/src/assets/images/products/product-${productId}.png`,
      `/src/assets/images/products/product-${productId}.webp`,
      `/src/assets/images/products/${productId}.jpg`,
      `/src/assets/images/products/${productId}.jpeg`,
      `/src/assets/images/products/${productId}.png`,
      `/src/assets/images/products/${productId}.webp`,
    ]
    
    // Para Vite, las imágenes deben importarse o estar en public
    // Usaremos una función que intente cargar y si falla, usa fallback
    return fallbackUrl
  } catch (error) {
    return fallbackUrl
  }
}

/**
 * Obtiene la ruta de imagen desde la carpeta public
 * Las imágenes en public se acceden directamente desde la raíz
 */
export function getProductImageFromPublic(productId, fallbackUrl) {
  // Rutas posibles en la carpeta public/images/products/
  const imagePaths = [
    `/images/products/product-${productId}.jpg`,
    `/images/products/product-${productId}.jpeg`,
    `/images/products/product-${productId}.png`,
    `/images/products/product-${productId}.webp`,
    `/images/products/${productId}.jpg`,
    `/images/products/${productId}.jpeg`,
    `/images/products/${productId}.png`,
    `/images/products/${productId}.webp`,
  ]
  
  // Retornamos la primera ruta como intento
  // Si la imagen no existe, el onError en el componente la reemplazará con fallback
  return imagePaths[0] || fallbackUrl
}

/**
 * Función principal que intenta cargar imagen local o usa fallback
 */
export function getProductImageSrc(productId, fallbackUrl) {
  // Primero intentar desde public (más fácil para agregar imágenes dinámicamente)
  const publicPath = getProductImageFromPublic(productId, fallbackUrl)
  
  // Retornar un objeto con la ruta y el fallback
  return {
    src: publicPath,
    fallback: fallbackUrl,
  }
}

