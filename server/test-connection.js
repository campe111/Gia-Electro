import dotenv from 'dotenv'
import { sequelize } from './config/database.js'

dotenv.config()

console.log('🔍 Probando conexión a Supabase...\n')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado' : 'No configurado')
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL
  const masked = url.replace(/:[^:@]+@/, ':****@')
  console.log('URL (enmascarada):', masked)
}
console.log('')

try {
  await sequelize.authenticate()
  console.log('✅ Conexión a Supabase exitosa!')
  console.log('✅ Base de datos:', sequelize.getDatabaseName())
  console.log('✅ Host:', sequelize.config.host)
  
  // Probar una query simple
  const [results] = await sequelize.query('SELECT version()')
  console.log('✅ PostgreSQL version:', results[0].version)
  
  process.exit(0)
} catch (error) {
  console.error('❌ Error de conexión:')
  console.error('Mensaje:', error.message)
  console.error('Código:', error.code)
  console.error('Detalles:', error)
  process.exit(1)
}

