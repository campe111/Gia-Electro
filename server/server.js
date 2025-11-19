import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import SequelizeStore from 'connect-session-sequelize'
import passport from 'passport'

import { connectDB, sequelize } from './config/database.js'
import './config/passport.js'
import authRoutes from './routes/auth.js'
import { errorHandler } from './middleware/errorHandler.js'

// Cargar variables de entorno
dotenv.config()

// Conectar a la base de datos
connectDB().catch((error) => {
  console.error('❌ Error crítico conectando a la base de datos:', error.message)
  console.error('💡 Verifica tu connection string y que el proyecto de Supabase esté activo')
  // No salir del proceso para que el servidor pueda iniciar (útil para desarrollo)
  // En producción, podrías querer hacer process.exit(1)
})

const app = express()

// Middleware de seguridad
app.use(helmet())

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
)

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Cookie parser
app.use(cookieParser())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
})
app.use('/api/', limiter)

// Rate limiting más estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // máximo 5 intentos de login por ventana
  message: 'Demasiados intentos de autenticación, intenta de nuevo más tarde.',
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// Session Store con Sequelize
const sessionStore = SequelizeStore(session.Store)
const store = new sessionStore({
  db: sequelize,
})

// Session (para OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: 'strict',
    },
  })
)

// Sincronizar tabla de sesiones
store.sync()

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use('/api/auth', authRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
  })
})

// Error handler
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`)
})

