import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'

// Serializar usuario para la sesión
passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

// Estrategia de Google OAuth (solo si está configurado)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Buscar usuario existente por googleId
          let user = await User.findOne({ where: { googleId: profile.id } })

          if (user) {
            // Actualizar último login
            user.lastLogin = new Date()
            await user.save()
            return done(null, user)
          }

          // Buscar por email
          user = await User.findOne({ where: { email: profile.emails[0].value } })

          if (user) {
            // Vincular cuenta de Google a usuario existente
            user.googleId = profile.id
            user.provider = 'google'
            user.avatar = profile.photos[0]?.value
            user.isVerified = true
            user.lastLogin = new Date()
            await user.save()
            return done(null, user)
          }

          // Crear nuevo usuario
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            provider: 'google',
            avatar: profile.photos[0]?.value,
            isVerified: true,
            lastLogin: new Date(),
          })

          return done(null, user)
        } catch (error) {
          return done(error, null)
        }
      }
    )
  )
}

// Estrategia de Facebook OAuth (solo si está configurado)
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'email', 'picture.type(large)'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Buscar usuario existente por facebookId
          let user = await User.findOne({ where: { facebookId: profile.id } })

          if (user) {
            user.lastLogin = new Date()
            await user.save()
            return done(null, user)
          }

          // Buscar por email
          if (profile.emails && profile.emails[0]) {
            user = await User.findOne({ where: { email: profile.emails[0].value } })

            if (user) {
              // Vincular cuenta de Facebook a usuario existente
              user.facebookId = profile.id
              user.provider = 'facebook'
              user.avatar = profile.photos?.[0]?.value
              user.isVerified = true
              user.lastLogin = new Date()
              await user.save()
              return done(null, user)
            }
          }

          // Crear nuevo usuario
          user = await User.create({
            name: profile.displayName,
            email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
            facebookId: profile.id,
            provider: 'facebook',
            avatar: profile.photos?.[0]?.value,
            isVerified: true,
            lastLogin: new Date(),
          })

          return done(null, user)
        } catch (error) {
          return done(error, null)
        }
      }
    )
  )
}

export default passport
