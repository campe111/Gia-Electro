/**
 * Utilidades de seguridad para validación y generación segura
 */

import { logger } from './logger'

/**
 * Genera un ID de orden único y seguro
 * @returns {string} ID de orden en formato ORD-{timestamp}-{random}
 */
export const generateSecureOrderId = () => {
  try {
    // Intentar usar crypto.randomUUID si está disponible (más seguro)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `ORD-${Date.now()}-${crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()}`
    }
    
    // Fallback: usar crypto.getRandomValues si está disponible
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const randomBytes = crypto.getRandomValues(new Uint8Array(8))
      const randomStr = Array.from(randomBytes, b => b.toString(36)).join('').substring(0, 9).toUpperCase()
      return `ORD-${Date.now()}-${randomStr}`
    }
    
    // Fallback final: método mejorado con Math.random
    const timestamp = Date.now()
    const randomPart = Math.random().toString(36).slice(2, 11).toUpperCase()
    return `ORD-${timestamp}-${randomPart}`
  } catch (error) {
    logger.error('Error generando ID de orden:', error)
    // Fallback de emergencia
    return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`
  }
}

/**
 * Parsea JSON de forma segura con manejo de errores
 * @param {string} str - String JSON a parsear
 * @param {any} defaultValue - Valor por defecto si falla el parseo
 * @returns {any} Objeto parseado o valor por defecto
 */
export const safeJsonParse = (str, defaultValue = {}) => {
  if (!str || typeof str !== 'string') {
    return defaultValue
  }
  
  try {
    const parsed = JSON.parse(str)
    return parsed !== null && parsed !== undefined ? parsed : defaultValue
  } catch (error) {
    logger.warn('Error parseando JSON:', error)
    return defaultValue
  }
}

/**
 * Valida y recalcula el total de una orden basado en los items
 * Previene manipulación de precios desde el cliente
 * @param {Array} items - Array de items de la orden
 * @param {number} providedTotal - Total proporcionado por el cliente
 * @returns {object} { isValid: boolean, calculatedTotal: number, difference: number }
 */
export const validateAndRecalculateTotal = (items, providedTotal) => {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      isValid: false,
      calculatedTotal: 0,
      difference: providedTotal || 0,
      error: 'La orden debe tener al menos un item'
    }
  }

  // Recalcular total basado en items
  const calculatedTotal = items.reduce((sum, item) => {
    const price = typeof item.price === 'number' && item.price > 0 ? item.price : 0
    const quantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 0
    return sum + (price * quantity)
  }, 0)

  // Calcular diferencia (tolerancia de 0.01 para errores de redondeo)
  const difference = Math.abs(calculatedTotal - (providedTotal || 0))
  const isValid = difference <= 0.01

  return {
    isValid,
    calculatedTotal: Math.round(calculatedTotal * 100) / 100, // Redondear a 2 decimales
    difference: Math.round(difference * 100) / 100,
    error: isValid ? null : `El total proporcionado (${providedTotal}) no coincide con el calculado (${calculatedTotal}). Diferencia: ${difference}`
  }
}

/**
 * Valida el tamaño de un archivo
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeBytes - Tamaño máximo en bytes
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validateFileSize = (file, maxSizeBytes) => {
  if (!file || !(file instanceof File)) {
    return { isValid: false, error: 'Archivo inválido' }
  }

  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(2)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    return {
      isValid: false,
      error: `El archivo es demasiado grande (${fileSizeMB}MB). Tamaño máximo permitido: ${maxSizeMB}MB`
    }
  }

  return { isValid: true, error: null }
}

/**
 * Valida el tipo MIME y extensión de un archivo
 * @param {File} file - Archivo a validar
 * @param {Array<string>} allowedMimeTypes - Tipos MIME permitidos
 * @param {Array<string>} allowedExtensions - Extensiones permitidas (con punto, ej: ['.jpg', '.png'])
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validateFileType = (file, allowedMimeTypes = [], allowedExtensions = []) => {
  if (!file || !(file instanceof File)) {
    return { isValid: false, error: 'Archivo inválido' }
  }

  // Validar tipo MIME
  if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de archivo no permitido. Tipo recibido: ${file.type}. Tipos permitidos: ${allowedMimeTypes.join(', ')}`
    }
  }

  // Validar extensión
  if (allowedExtensions.length > 0) {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: `Extensión de archivo no permitida. Extensión recibida: ${fileExtension}. Extensiones permitidas: ${allowedExtensions.join(', ')}`
      }
    }
  }

  return { isValid: true, error: null }
}

/**
 * Constantes para validación de archivos
 */
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  EXCEL: 10 * 1024 * 1024, // 10MB
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

export const ALLOWED_EXCEL_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
]
export const ALLOWED_EXCEL_EXTENSIONS = ['.xlsx', '.xls']

export const MAX_EXCEL_ROWS = 10000

