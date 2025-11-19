# 🚀 Guía de Despliegue en la Nube - Gia Electro

## 📊 Stack Actual del Proyecto

- **Frontend**: ✅ **Vercel** (ya desplegado)
- **Backend**: Render (necesita despliegue)
- **Base de Datos**: Supabase PostgreSQL (necesita configuración)

---

## 🎯 Opción Recomendada: Render + Supabase + Vercel

### Stack Completo Gratuito

- **Frontend**: Vercel (ya desplegado) ✅
- **Backend**: Render (gratis, se duerme después de inactividad)
- **Base de Datos**: Supabase PostgreSQL (500MB gratis)

**Costo Total**: $0/mes

---

## 🚀 Paso 1: Configurar Supabase (Base de Datos)

### 1. Crear Cuenta en Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Click en "Start your project"
3. Iniciar sesión con GitHub (más fácil)
4. Verificar email

### 2. Crear Nuevo Proyecto

1. Click en "New Project"
2. **Organization**: Crear nueva o usar existente
3. **Name**: `gia-electro` (o el nombre que prefieras)
4. **Database Password**: Generar una contraseña segura (¡GUARDARLA!)
5. **Region**: Seleccionar la más cercana
6. **Pricing Plan**: Free
7. Click en "Create new project"

**Nota**: La creación del proyecto puede tardar 1-2 minutos.

### 3. Obtener Connection String

Una vez creado el proyecto:

1. Ir a **Settings** > **Database**
2. Scroll hasta **Connection string**
3. Seleccionar **URI** (no Connection pooling)
4. Tu connection string es:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.worpraelmlhsdkvuapbb.supabase.co:5432/postgres
   ```
5. Reemplazar `[YOUR-PASSWORD]` con la contraseña que configuraste al crear el proyecto

**Ejemplo completo** (reemplaza `tu_password_aqui` con tu contraseña real):
```
postgresql://postgres:tu_password_aqui@db.worpraelmlhsdkvuapbb.supabase.co:5432/postgres
```

### 4. Verificar en Supabase Dashboard

1. Ir a **Table Editor** (en el menú lateral)
2. Después de desplegar el backend, deberías ver la tabla `users` creada automáticamente

---

## 🚀 Paso 2: Desplegar Backend en Render

### 1. Ir a Render Dashboard

1. Visitar [dashboard.render.com](https://dashboard.render.com)
2. Iniciar sesión con GitHub

### 2. Crear Web Service

1. Click en "New +" (esquina superior derecha)
2. Seleccionar "Web Service"

### 3. Conectar Repositorio

1. Click en "Connect account" si es la primera vez
2. Autorizar acceso a GitHub
3. Seleccionar tu repositorio `Gia-Electro`
4. Click en "Connect"

### 4. Configurar el Servicio

- **Name**: `gia-electro-backend` (o el nombre que prefieras)
- **Environment**: `Node`
- **Region**: Seleccionar la más cercana (ej: `Oregon (US West)`)
- **Branch**: `main` (o la rama que uses)
- **Root Directory**: `server` (importante: especificar la carpeta del backend)
- **Runtime**: `Node` (seleccionar versión 18 o superior)
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 5. Configurar Variables de Entorno

En la sección "Environment Variables", agregar:

#### Variables Requeridas

```env
NODE_ENV=production
PORT=10000
```

#### Supabase (Base de Datos)

```env
DATABASE_URL=postgresql://postgres:xwFyR2MzDbw0o5N1@db.worpraelmlhsdkvuapbb.supabase.co:5432/postgres
```

**✅ Configurado**: La contraseña ya está incluida en la connection string.

#### JWT y Sesiones

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

#### Frontend URL (Vercel)

```env
FRONTEND_URL=https://tu-proyecto.vercel.app
```

**Importante**: Reemplazar con la URL real de tu frontend en Vercel.

#### OAuth Google (Opcional - si lo usas)

```env
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=https://tu-backend.onrender.com/api/auth/google/callback
```

**Importante**: Reemplazar `tu-backend.onrender.com` con tu URL real de Render (la obtendrás después del despliegue).

#### OAuth Facebook (Opcional - si lo usas)

```env
FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret
FACEBOOK_CALLBACK_URL=https://tu-backend.onrender.com/api/auth/facebook/callback
```

### 6. Desplegar

1. Click en "Create Web Service"
2. Render comenzará a construir y desplegar tu aplicación
3. Esto puede tardar 5-10 minutos la primera vez
4. Verás los logs en tiempo real

### 7. Obtener URL del Backend

Una vez desplegado, Render te dará una URL como:
```
https://gia-electro-backend.onrender.com
```

**Importante**: Guarda esta URL, la necesitarás para:
- Configurar el frontend en Vercel
- Actualizar URLs de OAuth

### 8. Verificar Despliegue

1. Visitar: `https://tu-backend.onrender.com/api/health`
2. Deberías ver:
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente"
}
```

---

## 🚀 Paso 3: Configurar Frontend en Vercel

### 1. Ir a Vercel Dashboard

1. Visitar [vercel.com](https://vercel.com)
2. Iniciar sesión con GitHub
3. Buscar tu proyecto `Gia-Electro` (ya debería estar desplegado)

### 2. Agregar Variable de Entorno

1. Ir a **Settings** > **Environment Variables**
2. Agregar nueva variable:

```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

**Importante**: Reemplazar `tu-backend.onrender.com` con tu URL real de Render.

### 3. Redesplegar

1. Después de agregar la variable, Vercel debería redespelgar automáticamente
2. O puedes ir a **Deployments** y hacer click en "Redeploy"

### 4. Verificar

1. Visitar tu URL de Vercel
2. La aplicación debería conectarse al backend
3. Probar registro/login para verificar que funciona

---

## 🔄 Paso 4: Actualizar URLs de OAuth (Si usas OAuth)

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

---

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

---

## 📊 Verificar Base de Datos en Supabase

### Ver Tablas

1. Ir a tu proyecto en Supabase
2. Click en **Table Editor**
3. Deberías ver la tabla `users` creada automáticamente

### Ver Datos

1. En **Table Editor**, click en la tabla `users`
2. Ver usuarios registrados (si hay)

### SQL Editor

1. Ir a **SQL Editor**
2. Ejecutar:
   ```sql
   SELECT * FROM users;
   ```

---

## ✅ Checklist de Despliegue

### Antes de Desplegar

- [ ] Proyecto creado en Supabase
- [ ] Connection string de Supabase guardado
- [ ] Secretos JWT y SESSION generados
- [ ] Cuenta en Render creada
- [ ] Repositorio conectado a Render

### Después de Desplegar Backend

- [ ] Backend desplegado en Render
- [ ] Health check funciona (`/api/health`)
- [ ] Variables de entorno configuradas correctamente
- [ ] URL del backend guardada
- [ ] Tabla `users` creada en Supabase

### Después de Configurar Frontend

- [ ] Variable `VITE_API_URL` agregada en Vercel
- [ ] Frontend redesplegado
- [ ] Probar registro de usuario
- [ ] Probar login de usuario
- [ ] Verificar que los datos se guardan en Supabase

### OAuth (Si aplica)

- [ ] URLs de OAuth actualizadas en Google
- [ ] URLs de OAuth actualizadas en Facebook
- [ ] Probar login con Google
- [ ] Probar login con Facebook

---

## 🔧 Solución de Problemas

### Error: "Cannot connect to database"
- Verificar que `DATABASE_URL` es correcta
- Verificar que la contraseña está correcta
- Verificar que reemplazaste `[YOUR-PASSWORD]` en la URL

### Error: "CORS error"
- Verificar `FRONTEND_URL` en Render (debe ser la URL de Vercel)
- Verificar `VITE_API_URL` en Vercel (debe ser la URL de Render)
- Verificar que las URLs coinciden exactamente (https, sin trailing slash)

### Error: "password authentication failed"
- Verificar que la contraseña de Supabase es correcta
- Verificar que reemplazaste `[YOUR-PASSWORD]` en DATABASE_URL
- Resetear password en Supabase si es necesario

### Error: "SSL connection required"
- Supabase requiere SSL en producción
- Verificar que DATABASE_URL incluye SSL
- El código ya está configurado para SSL automático

### Render se duerme
- Es normal, primera petición puede tardar ~30 segundos
- Usar UptimeRobot para mantener activo
- O considerar upgrade a plan pago

### Las tablas no se crean
- Verificar que el servidor se inició correctamente
- Revisar logs en Render
- Verificar conexión a Supabase
- Las tablas se crean automáticamente en desarrollo, en producción puede necesitar crearlas manualmente

---

## 💰 Costos

### Plan Gratuito Completo:
- **Vercel**: Gratis (ilimitado) ✅ Ya desplegado
- **Render**: Gratis (con limitaciones)
- **Supabase**: Gratis (500MB)
- **Total**: $0/mes

### Si necesitas más:
- **Render**: $7/mes (sin sleep)
- **Supabase**: $25/mes (8GB, más features)

---

## 🎯 Resumen Rápido

1. ✅ **Frontend**: Ya está en Vercel
2. 🔄 **Supabase**: Crear proyecto y obtener connection string
3. 🔄 **Render**: Desplegar backend con variables de entorno
4. 🔄 **Vercel**: Agregar `VITE_API_URL` y redesplegar
5. ✅ **Listo**: Tu aplicación completa funcionando

---

## 📚 Recursos Adicionales

- [Supabase Documentation](https://supabase.com/docs)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Guía Detallada de Supabase](./DEPLOY_SUPABASE.md)

---

## 🎉 ¡Listo!

Tu aplicación está desplegada:
- ✅ Frontend: Vercel
- ✅ Backend: Render
- ✅ Base de Datos: Supabase

Todo gratis y funcionando perfectamente.
