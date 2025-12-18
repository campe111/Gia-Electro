# 🔧 Configuración de Variables de Entorno en Vercel

Este documento explica cómo configurar las variables de entorno necesarias para que la aplicación funcione correctamente en Vercel.

## ⚠️ Error Actual

Si ves este error en la consola:
```
❌ Faltan variables de entorno requeridas: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

Significa que las variables de entorno no están configuradas en Vercel.

## 📋 Variables Requeridas

Necesitas configurar las siguientes 5 variables de entorno:

1. **VITE_SUPABASE_URL**
2. **VITE_SUPABASE_ANON_KEY**
3. **VITE_EMAILJS_SERVICE_ID**
4. **VITE_EMAILJS_TEMPLATE_ID**
5. **VITE_EMAILJS_PUBLIC_KEY**

## 🚀 Pasos para Configurar

### Paso 1: Acceder a Vercel Dashboard

1. Ve a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Inicia sesión con tu cuenta
3. Selecciona el proyecto **Gia-Electro**

### Paso 2: Ir a Environment Variables

1. En el menú lateral, haz clic en **Settings**
2. En el submenú, haz clic en **Environment Variables**

### Paso 3: Agregar Variables

Para cada variable, sigue estos pasos:

1. Haz clic en el botón **Add New**
2. Ingresa el **Name** (nombre de la variable)
3. Ingresa el **Value** (valor de la variable)
4. **IMPORTANTE**: Selecciona los ambientes donde aplicará:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
5. Haz clic en **Save**

### Paso 4: Valores de las Variables

Agrega estas variables con sus respectivos valores:

#### Variable 1: VITE_SUPABASE_URL
```
Name: VITE_SUPABASE_URL
Value: https://worpraelmlhsdkvuapbb.supabase.co
```

#### Variable 2: VITE_SUPABASE_ANON_KEY
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcnByYWVsbWxoc2RrdnVhcGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MTM2MjIsImV4cCI6MjA3OTA4OTYyMn0.IeytMhyQfkx18CJcSAeMHqHfgGVkUUxI5NPgE-8S3EU
```

#### Variable 3: VITE_EMAILJS_SERVICE_ID
```
Name: VITE_EMAILJS_SERVICE_ID
Value: service_yvw35bo
```

#### Variable 4: VITE_EMAILJS_TEMPLATE_ID
```
Name: VITE_EMAILJS_TEMPLATE_ID
Value: template_ax5isde
```

#### Variable 5: VITE_EMAILJS_PUBLIC_KEY
```
Name: VITE_EMAILJS_PUBLIC_KEY
Value: 77m2T9Qu0ZMLjrjfw
```

### Paso 5: Redeploy

Después de agregar todas las variables:

1. Ve a la pestaña **Deployments**
2. Encuentra el último deployment
3. Haz clic en los tres puntos (⋯) junto al deployment
4. Selecciona **Redeploy**
5. Confirma el redeploy

**O** simplemente espera a que Vercel haga un redeploy automático con el próximo push.

## ✅ Verificación

Después del redeploy:

1. Espera a que el deployment termine (verás un checkmark verde)
2. Haz clic en el deployment para ver la URL
3. Abre la URL en tu navegador
4. Abre la consola del navegador (F12)
5. Verifica que **NO** aparezca el error de variables de entorno

## 🔍 Solución de Problemas

### Si el error persiste después de configurar las variables:

1. **Verifica que las variables estén en todos los ambientes**:
   - Production ✅
   - Preview ✅
   - Development ✅

2. **Verifica que los nombres sean exactos** (case-sensitive):
   - `VITE_SUPABASE_URL` (no `vite_supabase_url`)
   - `VITE_SUPABASE_ANON_KEY` (no `VITE_SUPABASE_ANON_KEY_`)

3. **Verifica que no haya espacios extra** al inicio o final de los valores

4. **Asegúrate de hacer un redeploy** después de agregar las variables

5. **Espera unos minutos** - a veces Vercel tarda en aplicar los cambios

### Si necesitas ayuda adicional:

- Revisa los logs del deployment en Vercel
- Verifica que el build se complete exitosamente
- Contacta al soporte de Vercel si el problema persiste

## 📝 Notas Importantes

- ⚠️ **NUNCA** subas el archivo `.env` al repositorio (ya está en `.gitignore`)
- ✅ Las variables de entorno en Vercel son seguras y no se exponen públicamente
- ✅ Cada ambiente (Production, Preview, Development) puede tener valores diferentes
- ✅ Puedes editar o eliminar variables en cualquier momento desde el dashboard

