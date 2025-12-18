/**
 * Rate Limiter utility para prevenir ataques de fuerza bruta
 */

import { safeJsonParse } from './securityUtils'

// Importación condicional para evitar dependencia circular
let logSecurityEvent = null
let SecurityEventType = null

// Cargar módulo de seguridad de forma lazy
const loadSecurityMonitor = async () => {
  if (!logSecurityEvent) {
    try {
      const module = await import('./securityMonitor')
      logSecurityEvent = module.logSecurityEvent
      SecurityEventType = module.SecurityEventType
    } catch (error) {
      // Silenciar error si el módulo no está disponible
    }
  }
}

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutos en milisegundos
const STORAGE_KEY = 'loginAttempts'

/**
 * Verifica si un email está bloqueado por demasiados intentos fallidos
 * @param {string} email - Email del usuario
 * @returns {{ isLocked: boolean, minutesLeft?: number, error?: string }}
 */
export const checkRateLimit = (email) => {
  try {
    const attempts = safeJsonParse(localStorage.getItem(STORAGE_KEY), {})
    const now = Date.now()
    
    if (!attempts[email]) {
      return { isLocked: false }
    }
    
    const userAttempts = attempts[email]
    
    // Si el usuario ha excedido el límite de intentos
    if (userAttempts.count >= MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = userAttempts.lockoutUntil || 0
      
      // Si aún está en período de bloqueo
      if (now < lockoutUntil) {
        const minutesLeft = Math.ceil((lockoutUntil - now) / 60000)
        
        // Registrar evento de seguridad (carga lazy para evitar dependencia circular)
        loadSecurityMonitor().then(() => {
          if (logSecurityEvent && SecurityEventType) {
            logSecurityEvent(SecurityEventType.RATE_LIMIT_TRIGGERED, {
              email,
              minutesLeft,
            })
          }
        })
        
        return {
          isLocked: true,
          minutesLeft,
          error: `Demasiados intentos fallidos. Intenta de nuevo en ${minutesLeft} ${minutesLeft === 1 ? 'minuto' : 'minutos'}.`
        }
      } else {
        // El período de bloqueo ha expirado, resetear intentos
        delete attempts[email]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts))
        return { isLocked: false }
      }
    }
    
    return { isLocked: false }
  } catch (error) {
    // Si hay error leyendo localStorage, permitir el intento
    console.warn('Error verificando rate limit:', error)
    return { isLocked: false }
  }
}

/**
 * Registra un intento de login fallido
 * @param {string} email - Email del usuario
 */
export const recordFailedAttempt = (email) => {
  try {
    const attempts = safeJsonParse(localStorage.getItem(STORAGE_KEY), {})
    const now = Date.now()
    
    if (!attempts[email]) {
      attempts[email] = {
        count: 0,
        lastAttempt: now,
        lockoutUntil: null
      }
    }
    
    attempts[email].count += 1
    attempts[email].lastAttempt = now
    
    // Si alcanza el límite, establecer tiempo de bloqueo
    if (attempts[email].count >= MAX_LOGIN_ATTEMPTS) {
      attempts[email].lockoutUntil = now + LOCKOUT_TIME
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts))
  } catch (error) {
    console.warn('Error registrando intento fallido:', error)
  }
}

/**
 * Resetea los intentos fallidos para un email (cuando el login es exitoso)
 * @param {string} email - Email del usuario
 */
export const resetFailedAttempts = (email) => {
  try {
    const attempts = safeJsonParse(localStorage.getItem(STORAGE_KEY), {})
    if (attempts[email]) {
      delete attempts[email]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts))
    }
  } catch (error) {
    console.warn('Error reseteando intentos:', error)
  }
}

/**
 * Obtiene el número de intentos restantes antes del bloqueo
 * @param {string} email - Email del usuario
 * @returns {number} Intentos restantes
 */
export const getRemainingAttempts = (email) => {
  try {
    const attempts = safeJsonParse(localStorage.getItem(STORAGE_KEY), {})
    if (!attempts[email]) {
      return MAX_LOGIN_ATTEMPTS
    }
    return Math.max(0, MAX_LOGIN_ATTEMPTS - attempts[email].count)
  } catch (error) {
    return MAX_LOGIN_ATTEMPTS
  }
}

