# 🚀 Desplegar Backend en Render - Guía Paso a Paso

## Prerrequisitos

1. Cuenta en [Render](https://render.com) (gratis)
2. Repositorio en GitHub con tu código
3. MongoDB Atlas configurado (ver guía anterior)

## Paso 1: Preparar el Repositorio

Asegúrate de que tu `server/package.json` tenga el script `start`:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

## Paso 2: Crear Servicio en Render

1. **Ir a Render Dashboard**
   - Visita [dashboard.render.com](https://dashboard.render.com)
   - Inicia sesión con GitHub

2. **Crear Nuevo Web Service**
   - Click en "New +" (esquina superior derecha)
   - Seleccionar "Web Service"

3. **Conectar Repositorio**
   - Click en "Connect account" si es la primera vez
   - Autorizar acceso a GitHub
   - Seleccionar tu repositorio
   - Click en "Connect"

4. **Configurar el Servicio**
   - **Name**: `gia-electro-backend` (o el nombre que prefieras)
   - **Environment**: `Node`
   - **Region**: Selecciona la más cercana (ej: `Oregon (US West)`)
   - **Branch**: `main` (o la rama que uses)
   - **Root Directory**: `server` (si tu backend está en la carpeta server)
   - **Runtime**: `Node` (seleccionar versión 18 o superior)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

## Paso 3: Configurar Variables de Entorno

En la sección "Environment Variables", agregar:

### Variables Requeridas

```env
NODE_ENV=production
PORT=10000
```

### MongoDB

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/gia-electro?retryWrites=true&w=majority
```

**Obtener de MongoDB Atlas:**
1. Ir a tu cluster en MongoDB Atlas
2. Click en "Connect"
3. Seleccionar "Connect your application"
4. Copiar la connection string
5. Reemplazar `<password>` con tu contraseña

### JWT y Sesiones

```env
JWT_SECRET=generar_secreto_seguro_de_32_caracteres_minimo
JWT_EXPIRE=7d
SESSION_SECRET=generar_otro_secreto_seguro_de_32_caracteres_minimo
```

**Generar secretos seguros:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ejecutar dos veces para obtener dos secretos diferentes.

### Frontend URL

```env
FRONTEND_URL=https://tu-frontend.vercel.app
```

Reemplazar con la URL real de tu frontend desplegado.

### OAuth Google (si lo usas)

```env
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=https://tu-backend.onrender.com/api/auth/google/callback
```

**Importante**: Reemplazar `tu-backend.onrender.com` con tu URL real de Render.

### OAuth Facebook (si lo usas)

```env
FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret
FACEBOOK_CALLBACK_URL=https://tu-backend.onrender.com/api/auth/facebook/callback
```

## Paso 4: Desplegar

1. Click en "Create Web Service"
2. Render comenzará a construir y desplegar tu aplicación
3. Esto puede tardar 5-10 minutos la primera vez
4. Verás los logs en tiempo real

## Paso 5: Obtener URL

Una vez desplegado, Render te dará una URL como:
```
https://gia-electro-backend.onrender.com
```

**Importante**: Guarda esta URL, la necesitarás para:
- Configurar el frontend
- Actualizar URLs de OAuth

## Paso 6: Verificar Despliegue

1. Visitar: `https://tu-backend.onrender.com/api/health`
2. Deberías ver:
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente"
}
```

## Paso 7: Actualizar URLs de OAuth

### Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Seleccionar tu proyecto
3. Ir a **APIs & Services** > **Credentials**
4. Click en tu OAuth 2.0 Client ID
5. Actualizar:
   - **Authorized JavaScript origins**:
     - `https://tu-backend.onrender.com`
     - `https://tu-frontend.vercel.app`
   - **Authorized redirect URIs**:
     - `https://tu-backend.onrender.com/api/auth/google/callback`

### Facebook Developers

1. Ir a [Facebook Developers](https://developers.facebook.com)
2. Seleccionar tu app
3. Ir a **Settings** > **Basic**
4. Actualizar:
   - **App Domains**: `tu-frontend.vercel.app`
5. Ir a **Settings** > **Advanced**
6. Actualizar:
   - **Valid OAuth Redirect URIs**:
     - `https://tu-backend.onrender.com/api/auth/facebook/callback`

## ⚠️ Nota Importante: Render Free Tier

Render tiene un plan gratuito con estas características:

### ✅ Ventajas
- Gratis para siempre
- SSL automático
- Auto-deploy desde GitHub
- Logs en tiempo real

### ⚠️ Limitaciones
- **Sleep después de 15 minutos de inactividad**
- La primera petición después de dormir puede tardar ~30 segundos
- 750 horas gratis/mes (suficiente para desarrollo)

### Soluciones para el "Sleep"

1. **Usar un servicio de ping** (gratis):
   - [UptimeRobot](https://uptimerobot.com) - Ping cada 5 minutos
   - [Cron-job.org](https://cron-job.org) - Ping cada 14 minutos

2. **Upgrade a plan pago** ($7/mes):
   - Sin sleep
   - Mejor rendimiento

3. **Usar Railway** ($5 crédito/mes):
   - No duerme
   - Mejor para producción

## 🔄 Auto-Deploy

Render se conecta automáticamente a GitHub y despliega cuando:
- Haces push a la rama principal
- Haces merge de un pull request

Puedes desactivar esto en Settings > Auto-Deploy.

## 📊 Monitoreo

Render proporciona:
- Logs en tiempo real
- Métricas básicas
- Alertas por email (en plan pago)

## 🔧 Troubleshooting

### Error: "Build failed"
- Verificar que `package.json` tiene el script `start`
- Verificar que todas las dependencias están en `dependencies` (no `devDependencies`)
- Revisar logs de build

### Error: "Application failed to start"
- Verificar variables de entorno
- Verificar que MongoDB está accesible
- Revisar logs de runtime

### Error: "Timeout"
- Render tiene timeout de 30 segundos para iniciar
- Si tu app tarda más, considerar optimizar el startup

### El servicio se duerme mucho
- Usar servicio de ping (UptimeRobot)
- O considerar upgrade a plan pago

## ✅ Checklist Final

- [ ] Servicio creado en Render
- [ ] Variables de entorno configuradas
- [ ] Despliegue exitoso
- [ ] Health check funciona
- [ ] URLs de OAuth actualizadas
- [ ] Frontend configurado con URL del backend
- [ ] Probar registro/login
- [ ] Probar OAuth (si está configurado)

## 🎉 ¡Listo!

Tu backend está desplegado y funcionando. Ahora puedes:
1. Desplegar el frontend en Vercel
2. Configurar las URLs
3. Probar la aplicación completa

