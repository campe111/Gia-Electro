# 🚀 Inicio Rápido - Supabase

Guía rápida para configurar el proyecto con Supabase.

## Pasos Rápidos

### 1. Crear Proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear cuenta (con GitHub)
3. Click en "New Project"
4. Completar información:
   - **Name**: `gia-electro`
   - **Database Password**: Generar y **GUARDAR**
   - **Region**: Más cercana
   - **Plan**: Free
5. Esperar 1-2 minutos a que se cree

### 2. Connection String

Tu connection string es:
```
postgresql://postgres:[YOUR-PASSWORD]@db.worpraelmlhsdkvuapbb.supabase.co:5432/postgres
```

**Importante**: Reemplazar `[YOUR-PASSWORD]` con la contraseña que configuraste al crear el proyecto en Supabase.

### 3. Instalar Dependencias del Backend

```bash
cd server
npm install
```

### 4. Crear archivo `.env` en `server/`

```env
# Supabase
DATABASE_URL=postgresql://postgres:xwFyR2MzDbw0o5N1@db.worpraelmlhsdkvuapbb.supabase.co:5432/postgres

# JWT
JWT_SECRET=generar_secreto_seguro
JWT_EXPIRE=7d
SESSION_SECRET=generar_otro_secreto

# Frontend
FRONTEND_URL=http://localhost:5173
```

**Nota**: Ver `server/CONFIGURAR_ENV.md` para instrucciones completas con secretos generados.

**Generar secretos:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Iniciar el Servidor

```bash
cd server
npm run dev
```

Deberías ver:
```
✅ Supabase (PostgreSQL) conectado exitosamente
✅ Modelos sincronizados
🚀 Servidor corriendo en puerto 5000
```

### 6. Verificar en Supabase

1. Ir a tu proyecto en Supabase
2. Click en **Table Editor**
3. Deberías ver la tabla `users` creada

### 7. Probar Registro

1. Abrir frontend: `http://localhost:5173`
2. Click en "Registrarse"
3. Completar formulario
4. Debería funcionar correctamente

## 🗄️ Verificar Base de Datos

### En Supabase Dashboard

1. Ir a **Table Editor**
2. Ver tabla `users`
3. Ver datos

### En SQL Editor

1. Ir a **SQL Editor**
2. Ejecutar:
   ```sql
   SELECT * FROM users;
   ```

## 🚀 Desplegar

Ver guía completa en `DEPLOY_SUPABASE.md`

## 🔧 Troubleshooting

### Error: "password authentication failed"
- Verificar que la contraseña es correcta
- Verificar que reemplazaste `[YOUR-PASSWORD]` en DATABASE_URL

### Error: "SSL connection required"
- Verificar que DATABASE_URL incluye SSL
- O agregar `DB_SSL=true` si usas variables individuales

### Las tablas no se crean
- Verificar que el servidor se inició correctamente
- Revisar logs del servidor
- Verificar conexión a Supabase

