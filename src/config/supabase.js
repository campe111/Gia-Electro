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
  
  throw new Error(
    `❌ Faltan variables de entorno requeridas: ${missingVars.join(', ')}\n` +
    `Por favor, configura estas variables en tu archivo .env`
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
    const { data, error } = await supabase.from('profiles').select('id').limit(1)
    if (error && error.code !== 'PGRST116') {
      logger.error('❌ Error conectando a Supabase:', error.message)
      return false
    }
    logger.log('✅ Supabase conectado exitosamente')
    return true
  } catch (error) {
    logger.error('❌ Error conectando a Supabase:', error.message)
    return false
  }
}

export default supabase
