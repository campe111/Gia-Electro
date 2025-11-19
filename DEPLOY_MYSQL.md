# 🚀 Desplegar con MySQL - Render + Vercel

Guía completa para desplegar el proyecto usando **MySQL**, **Render** (backend) y **Vercel** (frontend).

## 📊 Stack Completo

- **Backend**: Render (gratis)
- **Base de Datos**: MySQL (PlanetScale, Railway, o Aiven - todos gratis)
- **Frontend**: Vercel (gratis)

## 🗄️ Opciones Gratuitas de MySQL

### Opción 1: PlanetScale (Recomendado) ⭐
- ✅ **Gratis para siempre**
- ✅ **512 MB de almacenamiento**
- ✅ **1 billón de filas de lectura/mes**
- ✅ **Serverless** - escala automáticamente
- ✅ **Branching** - como Git para bases de datos
- ✅ **Sin límite de conexiones**
- ✅ **Muy rápido y confiable**

### Opción 2: Railway
- ✅ **$5 crédito/mes** (suficiente para desarrollo)
- ✅ **MySQL incluido**
- ✅ **Fácil de configurar**
- ✅ **Todo en un solo lugar**

### Opción 3: Aiven
- ✅ **Plan gratuito disponible**
- ✅ **MySQL gestionado**
- ✅ **Buena documentación**

### Opción 4: Free MySQL Hosting
- **FreeSQLDatabase.com**
- **db4free.net**
- **freesqldatabase.com**

**Recomendación**: Usar **PlanetScale** - es la mejor opción gratuita.

---

## 🚀 Opción 1: PlanetScale + Render + Vercel

### Paso 1: Configurar PlanetScale (MySQL)

1. **Crear cuenta en PlanetScale**
   - Ir a [planetscale.com](https://planetscale.com)
   - Crear cuenta (con GitHub es más fácil)
   - Verificar email

2. **Crear Base de Datos**
   - Click en "Create database"
   - **Name**: `gia-electro`
   - **Region**: Seleccionar la más cercana
   - **Plan**: Free
   - Click en "Create database"

3. **Obtener Connection String**
   - Una vez creada, ir a "Connect"
   - Seleccionar "Connect with" > "Node.js"
   - Copiar la connection string:
     ```
     mysql://xxxxx:xxxxx@xxxxx.psdb.cloud/gia-electro?sslaccept=strict
     ```
   - **Importante**: Guardar esta URL, solo se muestra una vez
   - Si la pierdes, puedes crear un nuevo password en "Settings" > "Passwords"

4. **Crear Branch de Producción**
   - PlanetScale usa branches (como Git)
   - El branch principal es `main`
   - Ya está listo para usar

### Paso 2: Configurar Base de Datos Localmente (Opcional)

Para probar localmente antes de desplegar:

1. **Instalar MySQL localmente** (opcional)
   - O usar PlanetScale directamente

2. **Crear archivo `.env` en `server/`**:
   ```env
   # Para desarrollo local con MySQL local
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=tu_password
   MYSQL_DATABASE=gia_electro

   # O usar directamente PlanetScale
   MYSQL_URI=mysql://xxxxx:xxxxx@xxxxx.psdb.cloud/gia-electro?sslaccept=strict
   ```

3. **Crear base de datos local** (si usas MySQL local):
   ```sql
   CREATE DATABASE gia_electro;
   ```

4. **Probar conexión**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

### Paso 3: Desplegar Backend en Render

1. **Ir a Render Dashboard**
   - [dashboard.render.com](https://dashboard.render.com)
   - Iniciar sesión con GitHub

2. **Crear Web Service**
   - Click en "New +" > "Web Service"
   - Conectar repositorio de GitHub
   - Seleccionar tu repositorio

3. **Configuración del Servicio**
   - **Name**: `gia-electro-backend`
   - **Environment**: `Node`
   - **Region**: Seleccionar la más cercana
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Variables de Entorno en Render**

   Agregar todas estas variables:

   ```env
   NODE_ENV=production
   PORT=10000
   ```

   **MySQL (PlanetScale)**:
   ```env
   MYSQL_URI=mysql://xxxxx:xxxxx@xxxxx.psdb.cloud/gia-electro?sslaccept=strict
   ```

   **O si prefieres variables individuales**:
   ```env
   MYSQL_HOST=xxxxx.psdb.cloud
   MYSQL_PORT=3306
   MYSQL_USER=xxxxx
   MYSQL_PASSWORD=xxxxx
   MYSQL_DATABASE=gia-electro
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

5. **Desplegar**
   - Click en "Create Web Service"
   - Esperar a que se despliegue (5-10 minutos)

6. **Obtener URL**
   - Render te dará una URL como: `https://gia-electro-backend.onrender.com`
   - Guardar esta URL

### Paso 4: Verificar Backend

1. Visitar: `https://tu-backend.onrender.com/api/health`
2. Deberías ver:
   ```json
   {
     "success": true,
     "message": "Servidor funcionando correctamente"
   }
   ```

### Paso 5: Desplegar Frontend en Vercel

1. **Ir a Vercel**
   - [vercel.com](https://vercel.com)
   - Iniciar sesión con GitHub

2. **Importar Proyecto**
   - Click en "Add New Project"
   - Seleccionar repositorio
   - Click en "Import"

3. **Configuración**
   - **Framework Preset**: Vite (auto-detectado)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Variables de Entorno**
   ```env
   VITE_API_URL=https://tu-backend.onrender.com/api
   ```

5. **Desplegar**
   - Click en "Deploy"
   - Esperar 1-2 minutos

6. **Obtener URL**
   - Vercel te dará: `https://tu-frontend.vercel.app`

### Paso 6: Actualizar URLs

1. **Actualizar Backend**:
   - En Render, actualizar variable:
     ```env
     FRONTEND_URL=https://tu-frontend.vercel.app
     ```

2. **Actualizar OAuth** (si lo usas):
   - Ver guía en `DEPLOY_RENDER.md`

---

## 🚀 Opción 2: Railway (Todo en uno)

### Paso 1: Desplegar en Railway

1. **Ir a Railway**
   - [railway.app](https://railway.app)
   - Iniciar sesión con GitHub

2. **Crear Proyecto**
   - Click en "New Project"
   - "Deploy from GitHub repo"
   - Seleccionar repositorio

3. **Agregar MySQL**
   - Click en "+ New" > "Database" > "Add MySQL"
   - Railway creará automáticamente MySQL
   - Copiar la variable `MYSQL_URL` generada

4. **Configurar Variables**
   ```env
   NODE_ENV=production
   MYSQL_URI=${{MySQL.MYSQL_URL}}
   JWT_SECRET=tu_secreto
   JWT_EXPIRE=7d
   SESSION_SECRET=tu_secreto
   FRONTEND_URL=https://tu-frontend.vercel.app
   ```

5. **Configurar Build**
   - En "Settings" > "Build"
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: (dejar vacío o `server`)

6. **Obtener URL**
   - Railway generará: `https://tu-proyecto.railway.app`

---

## 🔧 Configuración de MySQL

### Estructura de Tablas

El modelo de Sequelize creará automáticamente las tablas necesarias:

- **users**: Usuarios del sistema
- **Sessions**: Sesiones de OAuth (creada automáticamente por connect-session-sequelize)

### Verificar Tablas en PlanetScale

1. Ir a tu base de datos en PlanetScale
2. Click en "Console"
3. Ejecutar:
   ```sql
   SHOW TABLES;
   ```
4. Deberías ver `users` y `Sessions`

### Verificar Datos

```sql
SELECT * FROM users;
```

---

## ⚠️ Notas Importantes

### PlanetScale

1. **SSL Requerido**: PlanetScale requiere SSL, ya está configurado en el código
2. **Connection Limits**: El plan gratuito tiene límites generosos
3. **Branching**: Puedes crear branches para desarrollo y producción
4. **Backups**: PlanetScale hace backups automáticos

### Render

1. **Sleep Mode**: Render duerme después de 15 min de inactividad
2. **Solución**: Usar [UptimeRobot](https://uptimerobot.com) para ping cada 5 min
3. **Primera Petición**: Puede tardar ~30 segundos después de dormir

### Variables de Entorno

- **NUNCA** commitear archivos `.env`
- Usar variables de entorno en Render/Vercel
- Generar secretos seguros

---

## 🔍 Troubleshooting

### Error: "Access denied for user"
- Verificar credenciales en PlanetScale
- Verificar que el password es correcto
- Crear nuevo password si es necesario

### Error: "SSL connection required"
- PlanetScale requiere SSL
- Verificar que la URL incluye `?sslaccept=strict`
- O configurar SSL en Sequelize

### Error: "Table doesn't exist"
- Las tablas se crean automáticamente en desarrollo
- En producción, verificar que `sequelize.sync()` no esté activo
- Crear tablas manualmente si es necesario

### Error: "Too many connections"
- PlanetScale free tiene límites
- Verificar pool de conexiones en `database.js`
- Considerar upgrade si es necesario

---

## ✅ Checklist Final

- [ ] PlanetScale configurado
- [ ] Base de datos creada
- [ ] Connection string guardado
- [ ] Backend desplegado en Render
- [ ] Variables de entorno configuradas
- [ ] Health check funciona
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno del frontend configuradas
- [ ] Probar registro de usuario
- [ ] Probar login de usuario
- [ ] Verificar que las tablas se crearon en MySQL

---

## 🎉 ¡Listo!

Tu aplicación está desplegada con MySQL:
- ✅ Backend: Render
- ✅ Base de Datos: PlanetScale (MySQL)
- ✅ Frontend: Vercel

Todo gratis y funcionando perfectamente.

