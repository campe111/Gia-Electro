// Configuración de Mercado Pago
// IMPORTANTE: En producción, estas credenciales deben estar en variables de entorno
// y nunca deben exponerse en el código del frontend para el Access Token

// Para desarrollo frontend, usamos el Public Key
// El Access Token debe usarse SOLO en el backend
export const MERCADOPAGO_CONFIG = {
  // Public Key - Seguro para usar en frontend
  publicKey: import.meta.env.VITE_MP_PUBLIC_KEY || 'TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  
  // URLs de la API (backend)
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Configuración de ambiente
  locale: 'es-AR', // o el país que corresponda
}

// Función para validar la configuración
export const validateMercadoPagoConfig = () => {
  if (!MERCADOPAGO_CONFIG.publicKey || MERCADOPAGO_CONFIG.publicKey.includes('xxxx')) {
    console.warn('⚠️ Mercado Pago Public Key no configurada. Usando modo de prueba.')
    return false
  }
  return true
}

