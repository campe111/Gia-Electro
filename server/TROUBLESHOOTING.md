# 🔧 Solución de Problemas - Conexión a Supabase

## ❌ Error: ECONNREFUSED o ENOTFOUND

Si estás viendo estos errores, significa que no se puede conectar al servidor de Supabase.

## 🔍 Verificaciones Necesarias

### 1. Verificar que el Proyecto esté Activo

1. Ir a [Supabase Dashboard](https://app.supabase.com)
2. Verificar que tu proyecto esté en estado **"Active"**
3. Si dice "Paused", hacer click en **"Resume project"**
4. Esperar 1-2 minutos a que se active completamente

### 2. Verificar Connection String

En Supabase Dashboard > Settings > Database:
- Copiar la connection string completa desde ahí
- Verificar que el hostname sea correcto
- Asegurarse de que no haya espacios extra

### 3. Verificar que el Proyecto esté Completamente Inicializado

El proyecto debe mostrar:
- ✅ Database: Ready
- ✅ API: Ready
- ✅ Status: Active

Si alguno dice "Setting up", esperar a que termine.

### 4. Probar desde Supabase Dashboard

En Supabase Dashboard > SQL Editor:
- Intentar ejecutar una query simple: `SELECT 1;`
- Si funciona desde ahí, el problema es de conexión externa

## 🔧 Soluciones

### Solución 1: Usar Connection Pooling (RECOMENDADO)

El puerto 5432 puede estar bloqueado por firewall. Connection Pooling usa el puerto **6543** y es más confiable.

**Pasos para obtener Connection Pooling:**

1. Ir a Supabase Dashboard > **Settings** > **Database**
2. Scroll hasta **"Connection string"**
3. Seleccionar pestaña **"Connection pooling"** (no "URI")
4. Seleccionar **"Session mode"**
5. Copiar la connection string completa

**Formato esperado:**
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-REGION.pooler.supabase.com:6543/postgres
```

**Diferencias con conexión directa:**
- Usa puerto **6543** en lugar de **5432**
- Hostname incluye **`.pooler.`** y la región
- Usuario es **`postgres.xxxxx`** (con el reference ID)

**Ventajas:**
- ✅ Más confiable (menos bloqueos de firewall)
- ✅ Mejor para múltiples conexiones
- ✅ Más eficiente
- ✅ Recomendado para producción

### Solución 2: Verificar Firewall/Red

- Verificar que no haya firewall bloqueando la conexión
- Probar desde otra red (móvil, etc.)
- Verificar que el puerto 5432 no esté bloqueado

### Solución 3: Verificar Credenciales

- Verificar que la contraseña sea correcta
- Si es necesario, resetear la contraseña en Supabase Dashboard

## 📝 Connection String Correcta

La connection string debe verse así (sin espacios ni caracteres extra):

```
postgresql://postgres:CONTRASEÑA@db.XXXXX.supabase.co:5432/postgres
```

**NO debe tener:**
- Espacios
- Corchetes []
- Caracteres especiales extra

## ✅ Prueba Rápida

Ejecutar:
```bash
cd server
node test-connection.js
```

Si funciona, deberías ver:
```
✅ Conexión a Supabase exitosa!
✅ Base de datos: postgres
✅ Host: db.xxxxx.supabase.co
```

## 🆘 Si Nada Funciona

1. **Crear nuevo proyecto en Supabase**
2. **Obtener nueva connection string**
3. **Actualizar .env con la nueva connection string**

