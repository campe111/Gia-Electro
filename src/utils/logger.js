/**
 * Logger utility que solo muestra logs en desarrollo
 * En producción, los logs se desactivan automáticamente
 */

const isDevelopment = import.meta.env.DEV

export const logger = {
  /**
   * Log de información general
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  /**
   * Log de errores (siempre se muestran, incluso en producción)
   */
  error: (...args) => {
    console.error(...args)
  },

  /**
   * Log de advertencias
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  /**
   * Log de información
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  /**
   * Log de depuración
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },
}

export default logger

