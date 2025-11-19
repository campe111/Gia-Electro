# 🔌 Instrucciones para Conectar a Supabase

## ❌ Problema Actual

El puerto 5432 está bloqueado por firewall/red. Necesitamos usar **Connection Pooling** (puerto 6543).

## ✅ Solución: Obtener Connection String de Pooling

### Pasos Exactos:

1. **Ir a Supabase Dashboard:**
   - URL: https://app.supabase.com/project/worpraelmlhsdkvuapbb

2. **Navegar a Settings:**
   - Click en el ícono **⚙️ Settings** (rueda) en el menú lateral izquierdo
   - Click en **"Database"** en el submenú

3. **Obtener Connection Pooling:**
   - En la misma página de **Settings > Database**, **scroll hacia abajo** (más abajo de donde estás ahora)
   - Busca la sección que dice **"Connection string"** o **"Cadena de conexión"**
   - En esa sección verás varias pestañas o tabs:
     - **"URI"** (conexión directa, puerto 5432)
     - **"Connection pooling"** o **"Agrupación de conexiones"** ← **USA ESTA**
   - **Click en la pestaña "Connection pooling"** (NO en "URI")
   - Verás opciones como:
     - **"Session mode"** ← Selecciona esta
     - **"Transaction mode"**
   - Verás un campo de texto con la connection string completa
   - **Copia toda la connection string** (debe incluir `pooler.supabase.com:6543`)
   
   **Nota:** Si no ves la sección "Connection string", puede estar en otra parte:
   - Busca en el menú lateral izquierdo bajo "Database" si hay una opción "Connection string"
   - O busca un botón/tab que diga "Connection string" o "Cadena de conexión"

4. **Formato Esperado:**
   ```
   postgresql://postgres.worpraelmlhsdkvuapbb:CONTRASEÑA@aws-0-REGION.pooler.supabase.com:6543/postgres
   ```

5. **Actualizar .env:**
   - Reemplaza `[YOUR-PASSWORD]` con: `xwFyR2MzDbw0o5N1`
   - O si ya viene con la contraseña, úsala tal cual
   - Actualiza `DATABASE_URL` en `server/.env`

6. **Probar Conexión:**
   ```bash
   cd server
   node test-connection.js
   ```

## 🎯 Alternativa: Encontrar la Región

Si prefieres construir la URL manualmente:

1. Ir a **Settings** > **General**
2. Buscar **"Region"** o **"Región"**
3. Usar esa región en la URL de pooling

## 📝 Ejemplo de URL de Pooling

```
postgresql://postgres.worpraelmlhsdkvuapbb:xwFyR2MzDbw0o5N1@aws-0-REGION.pooler.supabase.com:6543/postgres
```

Reemplaza `REGION` con la región de tu proyecto (ej: `us-west-1`, `us-east-1`, etc.)

## ✅ Después de Conectar

Una vez que la conexión funcione:

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

