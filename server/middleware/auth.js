import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Middleware para proteger rutas
export const protect = async (req, res, next) => {
  try {
    let token

    // Verificar token en headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }
    // O verificar token en cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado. Token no proporcionado.',
      })
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Obtener usuario
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      })

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no encontrado.',
        })
      }

      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado.',
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error en autenticación.',
    })
  }
}

// Middleware para verificar rol de admin
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador.',
    })
  }
}

