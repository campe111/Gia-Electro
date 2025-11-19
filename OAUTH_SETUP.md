# Guía de Configuración OAuth y Backend

## 📋 Requisitos Previos

1. **MongoDB**: Instalar MongoDB localmente o usar MongoDB Atlas (gratis)
2. **Node.js**: Versión 18 o superior
3. **Cuentas de desarrollador**:
   - Google Cloud Console (para Google OAuth)
   - Facebook Developers (para Facebook OAuth)

## 🚀 Instalación del Backend

### 1. Instalar dependencias del servidor

```bash
cd server
npm install
```

### 2. Configurar MongoDB

**Opción A: MongoDB Local**
- Instalar MongoDB desde [mongodb.com](https://www.mongodb.com/try/download/community)
- MongoDB se ejecutará en `mongodb://localhost:27017`

**Opción B: MongoDB Atlas (Recomendado para producción)**
- Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Crear un cluster gratuito
- Obtener la URI de conexión

### 3. Configurar Variables de Entorno

Crear archivo `server/.env` basado en `server/.env.example`:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/gia-electro
# O para Atlas:
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/gia-electro

# JWT Secret (generar uno seguro)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_cambiar_en_produccion
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Session Secret
SESSION_SECRET=tu_session_secret_super_seguro_aqui_cambiar_en_produccion
```

**Generar secretos seguros:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🔐 Configuración OAuth Google

### 1. Crear Proyecto en Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto o seleccionar uno existente
3. Habilitar **Google+ API**

### 2. Configurar OAuth Consent Screen

1. Ir a **APIs & Services** > **OAuth consent screen**
2. Seleccionar **External** (para desarrollo)
3. Completar información:
   - App name: Gia Electro
   - User support email: tu email
   - Developer contact: tu email
4. Agregar scopes: `email`, `profile`
5. Agregar test users (tu email)

### 3. Crear Credenciales OAuth

1. Ir a **APIs & Services** > **Credentials**
2. Click en **Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Name: Gia Electro Web Client
5. Authorized JavaScript origins:
   - `http://localhost:5000`
   - `http://localhost:5173`
6. Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
7. Copiar **Client ID** y **Client Secret**

### 4. Agregar al .env

```env
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

## 📘 Configuración OAuth Facebook

### 1. Crear App en Facebook Developers

1. Ir a [Facebook Developers](https://developers.facebook.com/)
2. Click en **My Apps** > **Create App**
3. Seleccionar tipo: **Consumer**
4. Completar información de la app

### 2. Configurar Facebook Login

1. En el dashboard de la app, agregar producto **Facebook Login**
2. Ir a **Settings** > **Basic**
3. Agregar **App Domains**: `localhost`
4. En **Website**, agregar:
   - Site URL: `http://localhost:5173`
5. Ir a **Settings** > **Advanced**
   - Habilitar **Client OAuth Login**
   - Habilitar **Web OAuth Login**
   - Valid OAuth Redirect URIs:
     - `http://localhost:5000/api/auth/facebook/callback`

### 3. Obtener Credenciales

1. En **Settings** > **Basic**, copiar:
   - **App ID**
   - **App Secret** (click en Show)

### 4. Agregar al .env

```env
FACEBOOK_APP_ID=tu_facebook_app_id_aqui
FACEBOOK_APP_SECRET=tu_facebook_app_secret_aqui
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
```

## 🎯 Configurar Frontend

### 1. Crear archivo `.env` en la raíz del proyecto

```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Actualizar package.json principal (opcional)

Agregar script para ejecutar backend y frontend juntos:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:server": "cd server && npm run dev",
    "dev:all": "concurrently \"npm run dev:server\" \"npm run dev\""
  }
}
```

## 🏃 Ejecutar la Aplicación

### Terminal 1 - Backend
```bash
cd server
npm run dev
```

### Terminal 2 - Frontend
```bash
npm run dev
```

## 🔒 Seguridad en Producción

### 1. Variables de Entorno

- **NUNCA** commitear archivos `.env`
- Usar servicios como Vercel, Heroku, o AWS para variables de entorno
- Generar secretos únicos y seguros

### 2. HTTPS

- En producción, usar HTTPS
- Actualizar URLs de callback a HTTPS
- Configurar certificados SSL

### 3. CORS

- Actualizar `FRONTEND_URL` en producción
- Configurar CORS correctamente en el servidor

### 4. Rate Limiting

- Ya está configurado en el servidor
- Ajustar límites según necesidad

### 5. MongoDB

- Usar MongoDB Atlas en producción
- Configurar IP whitelist
- Usar conexiones seguras

## 📝 Endpoints de la API

### Autenticación

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual (requiere token)
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/google` - Iniciar OAuth Google
- `GET /api/auth/facebook` - Iniciar OAuth Facebook

### Ejemplo de uso:

```javascript
// Registro
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    password: 'password123'
  })
})
```

## 🐛 Solución de Problemas

### Error: "MongoDB connection failed"
- Verificar que MongoDB esté corriendo
- Verificar URI de conexión en `.env`

### Error: "OAuth callback mismatch"
- Verificar URLs en Google/Facebook console
- Verificar que coincidan exactamente (incluyendo http/https)

### Error: "CORS error"
- Verificar `FRONTEND_URL` en `.env`
- Verificar configuración de CORS en `server.js`

## 📚 Recursos Adicionales

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT.io](https://jwt.io/) - Para debuggear tokens JWT

