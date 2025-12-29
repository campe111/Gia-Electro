# Guía de Migración de Imágenes a Supabase Storage

Este documento explica cómo migrar las imágenes existentes de la carpeta `public/images/products/` a Supabase Storage.

## Requisitos Previos

1. ✅ Bucket `product-images` creado en Supabase Dashboard
2. ✅ Variables de entorno configuradas en tu archivo `.env`:
   ```
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anon
   ```

   **Para scripts de migración (opcional pero recomendado):**
   ```
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   ```
   ⚠️ **IMPORTANTE**: La service_role key solo debe usarse en scripts del servidor, NUNCA en el frontend.
   Puedes obtenerla en: Supabase Dashboard → Settings → API → service_role key (secret)

## Pasos para Migrar

### 1. Instalar dependencias (si no está instalado dotenv)

```bash
npm install
```

### 2. Ejecutar el script de migración

```bash
npm run migrate-images
```

## ¿Qué hace el script?

1. **Lee todas las imágenes** de `public/images/products/Gia Electro/`
2. **Sube cada imagen** a Supabase Storage con un nombre único
3. **Crea un mapeo** de las rutas antiguas a las nuevas URLs
4. **Actualiza automáticamente**:
   - `src/data/products.js`
   - `src/components/CategorySlider.jsx`
5. **Guarda el mapeo** en `image-migration-mapping.json` (por si necesitas revertir)

## Ejemplo de Salida

```
🚀 Iniciando migración de imágenes a Supabase Storage...

📁 Encontradas 43 imágenes para migrar

✅ Bucket "product-images" encontrado

📤 Subiendo: Aire Acondicionado BGH Split Frio_Calor 5200W BSH5_2.jpg...
✅ Subida exitosa: Aire Acondicionado BGH Split Frio_Calor 5200W BSH5_2.jpg -> https://...
...

✅ Migración completada: 43 imágenes migradas
📝 Mapeo guardado en: image-migration-mapping.json

🔄 Actualizando archivos de código...

✅ Actualizado products.js: 22 referencias
✅ Actualizado CategorySlider.jsx: 11 referencias

✅ Actualización de archivos completada

🎉 ¡Migración completada exitosamente!

📋 Resumen:
   - Imágenes migradas: 43
   - Archivos actualizados: products.js, CategorySlider.jsx
   - Mapeo guardado en: image-migration-mapping.json
```

## Notas Importantes

- ⚠️ **El script NO elimina** las imágenes originales de la carpeta `public`
- ✅ **Las nuevas URLs** se guardan en los archivos de código
- 📝 **El mapeo** se guarda por si necesitas revertir los cambios
- 🔄 **Puedes ejecutar el script múltiples veces** sin problemas (creará nuevas URLs cada vez)

## Solución de Problemas

### Error: "El bucket no existe"
- Ve a Supabase Dashboard → Storage
- Crea el bucket `product-images` como público
- Vuelve a ejecutar el script

### Error: "Faltan variables de entorno"
- Crea un archivo `.env` en la raíz del proyecto
- Agrega tus credenciales de Supabase:
  ```
  VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
  VITE_SUPABASE_ANON_KEY=tu_clave_anon
  ```

### Error: "new row violates row-level security policy"
- **Solución 1 (Recomendada)**: Usa `SUPABASE_SERVICE_ROLE_KEY` en tu `.env` para el script de migración
  - Obtén la key en: Supabase Dashboard → Settings → API → service_role key (secret)
  - Agrega `SUPABASE_SERVICE_ROLE_KEY=tu_key` a tu `.env`
  - ⚠️ **NUNCA** uses esta key en el frontend, solo en scripts del servidor

- **Solución 2**: Modifica temporalmente las políticas RLS del bucket para permitir subidas públicas
  - Ve a Supabase Dashboard → Storage → Policies
  - Crea una política temporal que permita INSERT a todos
  - Ejecuta el script
  - Elimina la política temporal después

- **Solución 3**: Autentícate como admin antes de ejecutar el script (más complejo)

## Después de la Migración

Una vez completada la migración:

1. ✅ Verifica que las imágenes se muestren correctamente en la aplicación
2. ✅ (Opcional) Puedes eliminar las imágenes de `public/images/products/` si todo funciona bien
3. ✅ Las nuevas imágenes subidas desde el admin irán directamente a Supabase

## Revertir la Migración

Si necesitas revertir los cambios:

1. Abre `image-migration-mapping.json`
2. Reemplaza las URLs de Supabase por las rutas originales en:
   - `src/data/products.js`
   - `src/components/CategorySlider.jsx`

