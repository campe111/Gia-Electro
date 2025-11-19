import express from 'express'
import passport from 'passport'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Validaciones
const registerValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
]

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
]

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { name, email, password } = req.body

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Este email ya está registrado',
      })
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      provider: 'local',
    })

      const token = generateToken(user.id)

    // Cookie options
    const cookieOptions = {
      expires: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 días
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    }

    res.cookie('token', token, cookieOptions)

    res.status(201).json({
      success: true,
      token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
    })
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({
      success: false,
      error: 'Error al registrar usuario',
    })
  }
})

// @route   POST /api/auth/login
// @desc    Iniciar sesión
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { email, password } = req.body

    // Buscar usuario con password
    const user = await User.findOne({ where: { email } })

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
      })
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
      })
    }

    // Actualizar último login
    user.lastLogin = new Date()
    await user.save()

      const token = generateToken(user.id)

    // Cookie options
    const cookieOptions = {
      expires: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 días
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    }

    res.cookie('token', token, cookieOptions)

    res.json({
      success: true,
      token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({
      success: false,
      error: 'Error al iniciar sesión',
    })
  }
})

// @route   GET /api/auth/google
// @desc    Iniciar autenticación con Google
// @access  Public
if (process.env.GOOGLE_CLIENT_ID) {
  router.get(
    '/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
    })
  )
} else {
  router.get('/google', (req, res) => {
    res.status(503).json({
      success: false,
      error: 'Google OAuth no está configurado',
    })
  })
}

// @route   GET /api/auth/google/callback
// @desc    Callback de Google OAuth
// @access  Public
if (process.env.GOOGLE_CLIENT_ID) {
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
      const token = generateToken(req.user.id)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
    }
  )
} else {
  router.get('/google/callback', (req, res) => {
    res.status(503).json({
      success: false,
      error: 'Google OAuth no está configurado',
    })
  })
}

// @route   GET /api/auth/facebook
// @desc    Iniciar autenticación con Facebook
// @access  Public
if (process.env.FACEBOOK_APP_ID) {
  router.get(
    '/facebook',
    passport.authenticate('facebook', {
      scope: ['email'],
    })
  )
} else {
  router.get('/facebook', (req, res) => {
    res.status(503).json({
      success: false,
      error: 'Facebook OAuth no está configurado',
    })
  })
}

// @route   GET /api/auth/facebook/callback
// @desc    Callback de Facebook OAuth
// @access  Public
if (process.env.FACEBOOK_APP_ID) {
  router.get(
    '/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    (req, res) => {
      const token = generateToken(req.user.id)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
    }
  )
} else {
  router.get('/facebook/callback', (req, res) => {
    res.status(503).json({
      success: false,
      error: 'Facebook OAuth no está configurado',
    })
  })
}

// @route   GET /api/auth/me
// @desc    Obtener usuario actual
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        role: req.user.role,
        provider: req.user.provider,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario',
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Cerrar sesión
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
  })
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente',
  })
})

export default router

