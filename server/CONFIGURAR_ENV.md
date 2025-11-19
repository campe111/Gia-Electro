# 🔧 Configurar archivo .env

## ⚠️ IMPORTANTE: Seguridad

El archivo `.env` contiene información sensible y **NUNCA** debe ser commiteado a Git. Ya está en `.gitignore`.

## 📝 Crear archivo `.env`

Crea un archivo `.env` en la carpeta `server/` con el siguiente contenido:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
DATABASE_URL=postgresql://postgres:xwFyR2MzDbw0o5N1@db.worpraelmlhsdkvuapbb.supabase.co:5432/postgres

# JWT Secret (ya generado)
JWT_SECRET=af107caf11a65b6efed13c9ff820b4551f0706a8a58eaf6746893340d4721935
JWT_EXPIRE=7d

# OAuth Google (opcional - si lo usas)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# OAuth Facebook (opcional - si lo usas)
FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173

# Session Secret (generar con el comando de abajo)
SESSION_SECRET=GENERAR_OTRO_SECRETO_AQUI
```

## 🔑 Generar SESSION_SECRET

Ejecuta este comando para generar el SESSION_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**O usa este secreto ya generado**:
```
SESSION_SECRET=8f269e00bd25ae5cc3c2ae46141551ca29b05fb718d44dcb4df68b8434472aa4
```

Copia el resultado y reemplaza `GENERAR_OTRO_SECRETO_AQUI` en el archivo `.env`.

## ✅ Verificar

Después de crear el archivo `.env`, prueba la conexión:

```bash
cd server
npm install
npm run dev
```

Deberías ver:
```
✅ Supabase (PostgreSQL) conectado exitosamente
✅ Modelos sincronizados
🚀 Servidor corriendo en puerto 5000
```

## 🚀 Para Producción (Render)

Cuando despliegues en Render, usa las mismas variables pero con:
- `NODE_ENV=production`
- `PORT=10000` (Render usa este puerto)
- `FRONTEND_URL=https://tu-frontend.vercel.app` (tu URL real de Vercel)

