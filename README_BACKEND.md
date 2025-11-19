# Backend API - Gia Electro

Backend seguro con OAuth, MongoDB, JWT y encriptación para la aplicación Gia Electro.

## 🏗️ Arquitectura

```
server/
├── config/
│   ├── database.js      # Conexión MongoDB
│   └── passport.js      # Configuración OAuth
├── middleware/
│   ├── auth.js          # Middleware de autenticación
│   └── errorHandler.js  # Manejo de errores
├── models/
│   └── User.js          # Modelo de usuario
├── routes/
│   └── auth.js          # Rutas de autenticación
├── utils/
│   └── generateToken.js # Generación de JWT
├── server.js            # Servidor principal
└── package.json
```

## 🔐 Características de Seguridad

### 1. Encriptación de Contraseñas
- Usa `bcryptjs` con salt rounds de 12
- Las contraseñas nunca se almacenan en texto plano
- Hash automático antes de guardar

### 2. JWT (JSON Web Tokens)
- Tokens firmados con secreto seguro
- Expiración configurable (default: 7 días)
- Almacenados en localStorage y cookies httpOnly

### 3. OAuth 2.0
- Google OAuth 2.0
- Facebook OAuth 2.0
- Manejo seguro de callbacks
- Vinculación automática de cuentas

### 4. Validación de Datos
- `express-validator` para validación
- Sanitización de inputs
- Validación de email y contraseñas

### 5. Rate Limiting
- Límite general: 100 requests/15min
- Límite de auth: 5 intentos/15min
- Previene ataques de fuerza bruta

### 6. Helmet.js
- Headers de seguridad HTTP
- Protección XSS
- Prevención de clickjacking

### 7. CORS
- Configuración restrictiva
- Solo permite origen del frontend
- Credenciales habilitadas

## 📊 Modelo de Usuario

```javascript
{
  name: String,
  email: String (único, indexado),
  password: String (hasheado, no se incluye en queries),
  googleId: String (único, opcional),
  facebookId: String (único, opcional),
  avatar: String,
  provider: ['local', 'google', 'facebook'],
  role: ['user', 'admin'],
  isVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Flujo de Autenticación

### Registro Local
1. Usuario envía name, email, password
2. Validación de datos
3. Verificación de email único
4. Hash de contraseña
5. Creación de usuario
6. Generación de JWT
7. Retorno de token y datos de usuario

### Login Local
1. Usuario envía email, password
2. Búsqueda de usuario con password
3. Comparación de contraseña hasheada
4. Actualización de lastLogin
5. Generación de JWT
6. Retorno de token y datos

### OAuth (Google/Facebook)
1. Usuario hace clic en botón OAuth
2. Redirección a proveedor
3. Usuario autoriza aplicación
4. Callback con código
5. Intercambio por access token
6. Obtención de datos de perfil
7. Búsqueda/creación de usuario
8. Generación de JWT
9. Redirección a frontend con token

## 🛡️ Middleware de Autenticación

### `protect`
- Verifica token JWT en headers o cookies
- Valida token con secreto
- Obtiene usuario de base de datos
- Agrega `req.user` para rutas protegidas

### `admin`
- Verifica que usuario tenga rol 'admin'
- Solo para rutas administrativas

## 📡 Endpoints

### POST /api/auth/register
Registrar nuevo usuario

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "user"
  }
}
```

### POST /api/auth/login
Iniciar sesión

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response:** Igual que register

### GET /api/auth/me
Obtener usuario actual (requiere token)

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "avatar": "url",
    "role": "user",
    "provider": "local"
  }
}
```

### POST /api/auth/logout
Cerrar sesión (requiere token)

**Response:**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

### GET /api/auth/google
Iniciar OAuth con Google
- Redirige a Google para autenticación

### GET /api/auth/google/callback
Callback de Google OAuth
- Redirige a frontend con token

### GET /api/auth/facebook
Iniciar OAuth con Facebook
- Redirige a Facebook para autenticación

### GET /api/auth/facebook/callback
Callback de Facebook OAuth
- Redirige a frontend con token

## 🚀 Despliegue

### Variables de Entorno Requeridas

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secret_super_seguro
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://tu-dominio.com/api/auth/google/callback
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
FACEBOOK_CALLBACK_URL=https://tu-dominio.com/api/auth/facebook/callback
FRONTEND_URL=https://tu-dominio.com
SESSION_SECRET=secret_super_seguro
```

### Recomendaciones de Producción

1. **HTTPS obligatorio** - Nunca usar HTTP en producción
2. **Secrets seguros** - Generar secretos únicos y largos
3. **MongoDB Atlas** - Usar servicio gestionado
4. **Rate limiting** - Ajustar según tráfico esperado
5. **Logging** - Implementar sistema de logs
6. **Monitoring** - Usar servicios como Sentry
7. **Backup** - Configurar backups de MongoDB

## 🧪 Testing

Para probar los endpoints, puedes usar:

- **Postman**
- **Thunder Client** (VS Code)
- **curl**

Ejemplo con curl:

```bash
# Registro
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Obtener usuario (con token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

