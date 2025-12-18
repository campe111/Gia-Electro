/**
 * Sistema de monitoreo de seguridad básico
 * Registra eventos de seguridad y detecta patrones sospechosos
 */

import { logger } from './logger'
import { safeJsonParse } from './securityUtils'

const SECURITY_EVENTS_KEY = 'securityEvents'
const MAX_EVENTS = 100 // Mantener solo los últimos 100 eventos
const SUSPICIOUS_THRESHOLD = 5 // Número de eventos sospechosos antes de alertar

/**
 * Tipos de eventos de seguridad
 */
export const SecurityEventType = {
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  RATE_LIMIT_TRIGGERED: 'RATE_LIMIT_TRIGGERED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_INPUT: 'SUSPICIOUS_INPUT',
  MULTIPLE_FAILED_ATTEMPTS: 'MULTIPLE_FAILED_ATTEMPTS',
  ADMIN_ACTION: 'ADMIN_ACTION',
}

/**
 * Registra un evento de seguridad
 * @param {string} type - Tipo de evento (SecurityEventType)
 * @param {object} details - Detalles del evento
 */

export const logSecurityEvent = (type, details = {}) => {
  try {
    const events = safeJsonParse(localStorage.getItem(SECURITY_EVENTS_KEY), [])
    
    const event = {
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...details,
    }
    
    events.push(event)
    
    // Mantener solo los últimos MAX_EVENTS eventos
    if (events.length > MAX_EVENTS) {
      events.shift()
    }
    
    localStorage.setItem(SECURITY_EVENTS_KEY, JSON.stringify(events))
    
    // Log en consola solo en desarrollo
    logger.log(`[Security Event] ${type}:`, event)
    
    // Verificar patrones sospechosos
    checkSuspiciousPatterns(events)
  } catch (error) {
    logger.error('Error registrando evento de seguridad:', error)
  }
}

/**
 * Obtiene todos los eventos de seguridad
 * @returns {Array}
 */
export const getSecurityEvents = () => {
  try {
    return safeJsonParse(localStorage.getItem(SECURITY_EVENTS_KEY), [])
  } catch (error) {
    logger.error('Error obteniendo eventos de seguridad:', error)
    return []
  }
}

/**
 * Limpia los eventos de seguridad antiguos (más de 7 días)
 */
export const cleanOldSecurityEvents = () => {
  try {
    const events = getSecurityEvents()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentEvents = events.filter(event => {
      const eventDate = new Date(event.timestamp)
      return eventDate > sevenDaysAgo
    })
    
    localStorage.setItem(SECURITY_EVENTS_KEY, JSON.stringify(recentEvents))
  } catch (error) {
    logger.error('Error limpiando eventos antiguos:', error)
  }
}

/**
 * Verifica patrones sospechosos en los eventos
 * @param {Array} events - Array de eventos
 */
const checkSuspiciousPatterns = (events) => {
  const recentEvents = events.filter(event => {
    const eventDate = new Date(event.timestamp)
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)
    return eventDate > oneHourAgo
  })
  
  // Contar eventos sospechosos en la última hora
  const suspiciousEvents = recentEvents.filter(event => 
    event.type === SecurityEventType.LOGIN_FAILED ||
    event.type === SecurityEventType.RATE_LIMIT_TRIGGERED ||
    event.type === SecurityEventType.UNAUTHORIZED_ACCESS ||
    event.type === SecurityEventType.SUSPICIOUS_INPUT
  )
  
  if (suspiciousEvents.length >= SUSPICIOUS_THRESHOLD) {
    logger.warn(`⚠️ Actividad sospechosa detectada: ${suspiciousEvents.length} eventos en la última hora`)
    // Aquí podrías enviar una alerta al admin o a un servicio de monitoreo
  }
}

/**
 * Detecta inputs sospechosos (posible XSS o inyección)
 * @param {string} input - Input a verificar
 * @returns {boolean}
 */
export const detectSuspiciousInput = (input) => {
  if (typeof input !== 'string') return false
  
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /expression\(/i,
    /vbscript:/i,
    /data:text\/html/i,
    /&#x/i, // Entidades HTML codificadas
  ]
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(input))
  
  if (isSuspicious) {
    logSecurityEvent(SecurityEventType.SUSPICIOUS_INPUT, {
      input: input.substring(0, 100), // Solo primeros 100 caracteres
      length: input.length,
    })
  }
  
  return isSuspicious
}

/**
 * Exporta los eventos de seguridad para análisis
 * @returns {string} CSV string
 */
export const exportSecurityEvents = () => {
  const events = getSecurityEvents()
  
  if (events.length === 0) {
    return 'No hay eventos de seguridad registrados'
  }
  
  const headers = ['Tipo', 'Timestamp', 'URL', 'User Agent', 'Detalles']
  const rows = events.map(event => [
    event.type,
    event.timestamp,
    event.url || '',
    event.userAgent || '',
    JSON.stringify(event).replace(/,/g, ';'), // Reemplazar comas para CSV
  ])
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')
  
  return csv
}

// Limpiar eventos antiguos al cargar el módulo
if (typeof window !== 'undefined') {
  cleanOldSecurityEvents()
}

