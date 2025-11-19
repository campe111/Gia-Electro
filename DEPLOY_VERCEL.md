# 🚀 Desplegar Frontend en Vercel - Guía Paso a Paso

## Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com) (gratis)
2. Repositorio en GitHub con tu código
3. Backend desplegado (Render, Railway, etc.)

## Paso 1: Preparar el Proyecto

Asegúrate de que tu proyecto tenga:

1. **package.json** con script de build:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

2. **Archivo .env.example** (opcional pero recomendado):
```env
VITE_API_URL=http://localhost:5000/api
```

## Paso 2: Crear Proyecto en Vercel

1. **Ir a Vercel Dashboard**
   - Visita [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub

2. **Importar Proyecto**
   - Click en "Add New Project"
   - Seleccionar tu repositorio de GitHub
   - Click en "Import"

## Paso 3: Configurar el Proyecto

Vercel detectará automáticamente que es un proyecto Vite. Configuración:

### Build Settings

- **Framework Preset**: Vite (debería detectarse automáticamente)
- **Root Directory**: `./` (raíz del proyecto)
- **Build Command**: `npm run build` (o `vite build`)
- **Output Directory**: `dist`
- **Install Command**: `npm install` (o dejar vacío para automático)

### Environment Variables

Click en "Environment Variables" y agregar:

```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

**Importante**: Reemplazar con la URL real de tu backend desplegado.

Si tienes otras variables de entorno que empiezan con `VITE_`, agrégalas aquí también.

## Paso 4: Desplegar

1. Click en "Deploy"
2. Vercel comenzará a construir y desplegar
3. Esto toma 1-2 minutos normalmente
4. Verás el progreso en tiempo real

## Paso 5: Obtener URL

Una vez desplegado, Vercel te dará una URL como:
```
https://gia-electro.vercel.app
```

O si configuraste un dominio personalizado:
```
https://tu-dominio.com
```

## Paso 6: Configurar Dominio Personalizado (Opcional)

1. En el proyecto, ir a "Settings" > "Domains"
2. Agregar tu dominio
3. Seguir las instrucciones para configurar DNS
4. Vercel configurará SSL automáticamente

## Paso 7: Verificar Despliegue

1. Visitar la URL de Vercel
2. La aplicación debería cargar correctamente
3. Probar funcionalidades:
   - Navegación
   - Registro/Login
   - OAuth (si está configurado)

## Paso 8: Actualizar Backend

Actualizar la variable `FRONTEND_URL` en tu backend (Render/Railway):

```env
FRONTEND_URL=https://tu-frontend.vercel.app
```

Esto es importante para:
- CORS
- Callbacks de OAuth
- Redirecciones

## 🔄 Auto-Deploy

Vercel se conecta automáticamente a GitHub y despliega cuando:
- Haces push a la rama principal
- Haces merge de un pull request

Puedes configurar esto en Settings > Git.

## 📊 Características de Vercel

### ✅ Ventajas del Plan Gratuito

- **Ilimitado**: Sin límites de tráfico o builds
- **SSL Automático**: HTTPS para todos los dominios
- **CDN Global**: Contenido servido desde múltiples ubicaciones
- **Preview Deployments**: Cada PR genera un preview
- **Analytics**: Métricas básicas incluidas
- **Edge Functions**: Funciones serverless en el edge

### 🚀 Performance

- **CDN Global**: Tu app se sirve desde múltiples ubicaciones
- **Caching Inteligente**: Assets estáticos cacheados automáticamente
- **Compresión**: Gzip/Brotli automático
- **Image Optimization**: Optimización automática de imágenes

## 🔧 Configuración Avanzada

### vercel.json (Opcional)

Si necesitas configuración personalizada, crear `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Headers de Seguridad

Vercel incluye headers de seguridad por defecto, pero puedes agregar más en `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 🔧 Troubleshooting

### Error: "Build failed"
- Verificar que `package.json` tiene el script `build`
- Verificar que todas las dependencias están correctas
- Revisar logs de build en Vercel

### Error: "Module not found"
- Verificar que todas las dependencias están en `package.json`
- Verificar imports en el código
- Limpiar cache: Settings > Clear Build Cache

### Error: "CORS error"
- Verificar `VITE_API_URL` en variables de entorno
- Verificar `FRONTEND_URL` en backend
- Verificar configuración de CORS en backend

### La app no carga después del deploy
- Verificar que el build fue exitoso
- Verificar que `dist/index.html` existe
- Revisar logs de runtime

### Variables de entorno no funcionan
- Verificar que empiezan con `VITE_`
- Verificar que están en "Environment Variables"
- Hacer redeploy después de agregar variables

## 📈 Analytics y Monitoreo

Vercel incluye:
- **Web Analytics**: Métricas básicas (en plan pago)
- **Speed Insights**: Métricas de performance
- **Logs**: Logs de funciones serverless

## ✅ Checklist Final

- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Despliegue exitoso
- [ ] App carga correctamente
- [ ] Backend actualizado con URL de frontend
- [ ] OAuth URLs actualizadas (si aplica)
- [ ] Probar todas las funcionalidades
- [ ] Verificar que HTTPS funciona

## 🎉 ¡Listo!

Tu frontend está desplegado y funcionando. Tu aplicación completa está en la nube:
- ✅ Frontend: Vercel
- ✅ Backend: Render/Railway
- ✅ Base de datos: MongoDB Atlas

Todo gratis y funcionando perfectamente.

