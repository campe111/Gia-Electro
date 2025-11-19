# 🚀 Desplegar con Supabase - Render + Vercel

Guía completa para desplegar el proyecto usando **Supabase** (PostgreSQL), **Render** (backend) y **Vercel** (frontend).

## 📊 Stack Completo

- **Backend**: Render (gratis)
- **Base de Datos**: Supabase PostgreSQL (500MB gratis, ilimitado en desarrollo)
- **Frontend**: Vercel (gratis)

## 🎯 ¿Qué es Supabase?

Supabase es una alternativa open-source a Firebase que ofrece:
- ✅ **PostgreSQL** como base de datos
- ✅ **500MB gratis** (suficiente para desarrollo y proyectos pequeños)
- ✅ **API REST automática**
- ✅ **Autenticación** (opcional, podemos seguir usando nuestro sistema)
- ✅ **Storage** para archivos
- ✅ **Realtime** para actualizaciones en tiempo real
- ✅ **SSL incluido**
- ✅ **Backups automáticos**

---

## 🚀 Paso 1: Configurar Supabase

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

### 4. Obtener Variables Individuales (Opcional)

Si prefieres usar variables individuales:

1. En **Settings** > **Database**
2. Verás:
   - **Host**: `db.xxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (la que guardaste)

---

## 🚀 Paso 2: Configurar Base de Datos Localmente (Opcional)

### 1. Crear archivo `.env` en `server/`

```env
# Usar DATABASE_URL completa
DATABASE_URL=postgresql://postgres:tu_password@db.xxxxx.supabase.co:5432/postgres

# O usar variables individuales
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=postgres
DB_SSL=true

# JWT
JWT_SECRET=generar_secreto_seguro
JWT_EXPIRE=7d
SESSION_SECRET=generar_otro_secreto

# Frontend
FRONTEND_URL=http://localhost:5173
```

**Generar secretos:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Instalar Dependencias

```bash
cd server
npm install
```

### 3. Probar Conexión

```bash
npm run dev
```

Deberías ver:
```
✅ Supabase (PostgreSQL) conectado exitosamente
✅ Modelos sincronizados
🚀 Servidor corriendo en puerto 5000
```

### 4. Verificar Tablas en Supabase

1. Ir a tu proyecto en Supabase
2. Click en **Table Editor** (en el menú lateral)
3. Deberías ver la tabla `users` creada automáticamente

---

## 🚀 Paso 3: Desplegar Backend en Render

### 1. Ir a Render Dashboard

1. Visitar [dashboard.render.com](https://dashboard.render.com)
2. Iniciar sesión con GitHub

### 2. Crear Web Service

1. Click en "New +" > "Web Service"
2. Conectar repositorio de GitHub
3. Seleccionar tu repositorio

### 3. Configuración del Servicio

- **Name**: `gia-electro-backend`
- **Environment**: `Node`
- **Region**: Seleccionar la más cercana
- **Branch**: `main`
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. Variables de Entorno en Render

Agregar todas estas variables:

**Supabase**:
```env
DATABASE_URL=postgresql://postgres:tu_password@db.xxxxx.supabase.co:5432/postgres
```

**O si prefieres variables individuales**:
```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=postgres
DB_SSL=true
```

**Configuración**:
```env
NODE_ENV=production
PORT=10000
```

**JWT y Sesiones**:
```env
JWT_SECRET=generar_secreto_seguro_de_32_caracteres_minimo
JWT_EXPIRE=7d
SESSION_SECRET=generar_otro_secreto_seguro_de_32_caracteres_minimo
```

**Frontend**:
```env
FRONTEND_URL=https://tu-frontend.vercel.app
```

**OAuth Google** (si lo usas):
```env
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=https://tu-backend.onrender.com/api/auth/google/callback
```

**OAuth Facebook** (si lo usas):
```env
FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret
FACEBOOK_CALLBACK_URL=https://tu-backend.onrender.com/api/auth/facebook/callback
```

### 5. Desplegar

1. Click en "Create Web Service"
2. Esperar a que se despliegue (5-10 minutos)
3. Render te dará una URL como: `https://gia-electro-backend.onrender.com`

### 6. Verificar Despliegue

1. Visitar: `https://tu-backend.onrender.com/api/health`
2. Deberías ver:
   ```json
   {
     "success": true,
     "message": "Servidor funcionando correctamente"
   }
   ```

---

## 🚀 Paso 4: Desplegar Frontend en Vercel

### 1. Ir a Vercel

1. Visitar [vercel.com](https://vercel.com)
2. Iniciar sesión con GitHub

### 2. Importar Proyecto

1. Click en "Add New Project"
2. Seleccionar repositorio
3. Click en "Import"

### 3. Configuración

- **Framework Preset**: Vite (auto-detectado)
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4. Variables de Entorno

```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

### 5. Desplegar

1. Click en "Deploy"
2. Esperar 1-2 minutos
3. Vercel te dará: `https://tu-frontend.vercel.app`

### 6. Actualizar Backend

En Render, actualizar variable:
```env
FRONTEND_URL=https://tu-frontend.vercel.app
```

---

## 🔒 Configurar Seguridad en Supabase

### 1. Row Level Security (RLS)

Supabase tiene RLS habilitado por defecto. Para nuestro caso, podemos:

1. Ir a **Authentication** > **Policies**
2. O deshabilitar RLS para la tabla `users` (solo si usamos nuestro sistema de auth)

**Recomendación**: Mantener RLS habilitado y crear políticas según necesidad.

### 2. API Keys

Supabase genera API keys automáticamente, pero como usamos nuestro propio sistema de autenticación, no las necesitamos.

### 3. Network Restrictions (Opcional)

En **Settings** > **Database** > **Connection pooling**:
- Puedes configurar IP whitelist si es necesario
- Para Render, generalmente no es necesario

---

## 📊 Verificar Base de Datos

### En Supabase Dashboard

1. Ir a **Table Editor**
2. Ver tabla `users`
3. Ver datos (si hay usuarios registrados)

### En SQL Editor

1. Ir a **SQL Editor**
2. Ejecutar:
   ```sql
   SELECT * FROM users;
   ```

### Ver Estructura de Tabla

```sql
\d users
```

O en Table Editor, click en la tabla para ver la estructura.

---

## ⚠️ Notas Importantes

### Supabase Free Tier

- ✅ **500MB de almacenamiento**
- ✅ **2GB de bandwidth/mes**
- ✅ **500MB de database size**
- ✅ **50,000 monthly active users**
- ✅ **Ilimitado en desarrollo local**

### Render Free Tier

- ⚠️ **Se duerme después de 15 min de inactividad**
- ✅ **750 horas gratis/mes**
- ✅ **SSL automático**

**Solución para el sleep**: Usar [UptimeRobot](https://uptimerobot.com) para ping cada 5 minutos.

### Variables de Entorno

- **NUNCA** commitear archivos `.env`
- Usar variables de entorno en Render/Vercel
- Generar secretos seguros

---

## 🔧 Troubleshooting

### Error: "password authentication failed"
- Verificar que la contraseña es correcta
- Verificar que reemplazaste `[YOUR-PASSWORD]` en DATABASE_URL
- Resetear password en Supabase si es necesario

### Error: "SSL connection required"
- Verificar que `DB_SSL=true` o que DATABASE_URL incluye SSL
- Supabase requiere SSL en producción

### Error: "relation does not exist"
- Las tablas se crean automáticamente en desarrollo
- En producción, verificar que `sequelize.sync()` no esté activo
- Crear tablas manualmente si es necesario

### Error: "too many connections"
- Supabase free tiene límites de conexiones
- Verificar pool de conexiones en `database.js`
- Considerar usar Connection Pooling de Supabase

### Render se duerme
- Es normal, primera petición puede tardar ~30 segundos
- Usar UptimeRobot para mantener activo
- O considerar upgrade a plan pago

---

## 🎯 Connection Pooling (Opcional - Recomendado)

Supabase ofrece Connection Pooling que es mejor para producción:

1. Ir a **Settings** > **Database**
2. Ver **Connection string** > **Connection pooling**
3. Usar el puerto `6543` en lugar de `5432`
4. URL será diferente:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

**Ventajas**:
- Mejor para múltiples conexiones
- Más eficiente
- Recomendado para producción

---

## ✅ Checklist Final

- [ ] Supabase configurado
- [ ] Proyecto creado
- [ ] Connection string guardado
- [ ] Backend desplegado en Render
- [ ] Variables de entorno configuradas
- [ ] Health check funciona
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno del frontend configuradas
- [ ] Probar registro de usuario
- [ ] Probar login de usuario
- [ ] Verificar que las tablas se crearon en Supabase
- [ ] OAuth URLs actualizadas (si aplica)

---

## 🎉 ¡Listo!

Tu aplicación está desplegada con Supabase:
- ✅ Backend: Render
- ✅ Base de Datos: Supabase (PostgreSQL)
- ✅ Frontend: Vercel

Todo gratis y funcionando perfectamente.

## 📚 Recursos Adicionales

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

