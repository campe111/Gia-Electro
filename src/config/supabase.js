import { createClient } from '@supabase/supabase-js'
import { logger } from '../utils/logger'

// Configuración de Supabase desde variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = []
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY')
  
  const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
  const envMessage = isVercel 
    ? 'Configura estas variables en Vercel Dashboard → Settings → Environment Variables'
    : 'Configura estas variables en tu archivo .env'
  
  throw new Error(
    `❌ Faltan variables de entorno requeridas: ${missingVars.join(', ')}\n` +
    `${envMessage}\n` +
    `Después de configurarlas, haz un redeploy en Vercel.`
  )
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Verificar conexión
export const testSupabaseConnection = async () => {
  try {
    // Intentar verificar conexión con auth en lugar de profiles (más confiable)
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error && error.code !== 'PGRST116') {
      logger.error('❌ Error conectando a Supabase:', error.message)
      return false
    }
    logger.log('✅ Supabase conectado exitosamente')
    return true
  } catch (error) {
    // Si la tabla profiles no existe, no es un error crítico
    if (error.message?.includes('Could not find the table')) {
      logger.log('✅ Supabase conectado (tabla profiles no configurada)')
      return true
    }
    logger.error('❌ Error conectando a Supabase:', error.message)
    return false
  }
}

export default supabase
