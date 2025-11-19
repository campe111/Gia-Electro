# 🔍 Cómo Encontrar la Connection String de Pooling

## 📍 Dónde Estás Ahora

Estás viendo la página de **"Configuración de la base de datos"** (Database Settings), específicamente la sección de **"Configuración de agrupación de conexiones"** (Connection pooling configuration).

Esta sección es para **configurar** el pool, NO para obtener la connection string.

## 🎯 Dónde Está la Connection String

La connection string está en una sección **diferente** de la misma página o en otra sección.

### Opción 1: Scroll en la Misma Página

1. **Scroll hacia abajo** en la página actual de Settings > Database
2. Busca una sección que diga:
   - **"Connection string"** (en inglés)
   - **"Cadena de conexión"** (en español)
   - **"Connection parameters"** (parámetros de conexión)

3. En esa sección verás **pestañas** o **tabs**:
   - Una pestaña dice **"URI"** (conexión directa)
   - Otra pestaña dice **"Connection pooling"** o **"Agrupación de conexiones"** ← **USA ESTA**

4. **Click en "Connection pooling"**
5. Selecciona **"Session mode"**
6. Copia la connection string completa

### Opción 2: Buscar en el Menú Lateral

1. En el menú lateral izquierdo, bajo **"Base de datos"** (Database)
2. Busca si hay una opción que diga:
   - **"Connection string"**
   - **"Cadena de conexión"**
   - O algo similar

### Opción 3: En la Parte Superior de la Página

1. En la parte superior de la página de Database Settings
2. Puede haber un botón o tab que diga **"Connection string"**
3. Click ahí y luego selecciona la pestaña **"Connection pooling"**

## 📝 Formato que Debes Ver

La connection string de pooling debe verse así:

```
postgresql://postgres.worpraelmlhsdkvuapbb:[PASSWORD]@aws-0-REGION.pooler.supabase.com:6543/postgres
```

**Características importantes:**
- ✅ Usuario: `postgres.worpraelmlhsdkvuapbb` (con el reference ID)
- ✅ Hostname: `aws-0-REGION.pooler.supabase.com` (incluye `.pooler.`)
- ✅ Puerto: `6543` (NO 5432)
- ✅ Base de datos: `postgres`

## 🆘 Si No La Encuentras

1. **Toma una captura de pantalla** de toda la página de Settings > Database
2. O busca en la página palabras clave como:
   - "connection"
   - "string"
   - "pooling"
   - "6543"
   - "pooler"

## 💡 Alternativa Rápida

Si no encuentras la sección, puedes intentar construir la URL manualmente:

1. Ve a **Settings > General** (en el menú lateral)
2. Busca la **"Region"** o **"Región"** de tu proyecto
3. Usa esta URL (reemplaza `REGION` con la región que encuentres):

```
postgresql://postgres.worpraelmlhsdkvuapbb:xwFyR2MzDbw0o5N1@aws-0-REGION.pooler.supabase.com:6543/postgres
```

**Regiones comunes:**
- `us-west-1`
- `us-east-1`
- `eu-west-1`
- `ap-southeast-1`

