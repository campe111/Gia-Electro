import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase desde variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://worpraelmlhsdkvuapbb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcnByYWVsbWxoc2RrdnVhcGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MTM2MjIsImV4cCI6MjA3OTA4OTYyMn0.IeytMhyQfkx18CJcSAeMHqHfgGVkUUxI5NPgE-8S3EU'

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
      console.error('❌ Error conectando a Supabase:', error.message)
      return false
    }
    console.log('✅ Supabase conectado exitosamente')
    return true
  } catch (error) {
    console.error('❌ Error conectando a Supabase:', error.message)
    return false
  }
}

export default supabase
