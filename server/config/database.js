import { Sequelize } from 'sequelize'

let sequelize

// Configuración de conexión para Supabase (PostgreSQL)
// Supabase usa PostgreSQL y proporciona una connection string
if (process.env.DATABASE_URL) {
  // Supabase siempre requiere SSL
  const isSupabase = process.env.DATABASE_URL.includes('supabase.co')
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: isSupabase ? {
        require: true,
        rejectUnauthorized: false,
      } : (process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false,
      } : false),
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  })
} else {
  // Desarrollo - usar variables individuales de Supabase
  sequelize = new Sequelize(
    process.env.DB_NAME || 'postgres',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false,
        } : false,
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  )
}

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Supabase (PostgreSQL) conectado exitosamente')

    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false }) // alter: false para no modificar estructura
      console.log('✅ Modelos sincronizados')
    }
  } catch (error) {
    console.error('❌ Error conectando a Supabase:', error.message)
    process.exit(1)
  }
}

export { sequelize, connectDB }
export default sequelize
