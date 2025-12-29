import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFile, writeFile } from 'fs/promises'
import { config } from 'dotenv'

// Cargar variables de entorno
config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
// Para scripts de migración, usar service_role key si está disponible (bypasa RLS)
// Si no está disponible, usar anon key (requiere políticas RLS permisivas)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno')
  console.error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env')
  console.error('\n💡 Para scripts de migración, puedes usar SUPABASE_SERVICE_ROLE_KEY')
  console.error('   (solo para scripts, nunca en el frontend)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
const BUCKET_NAME = 'product-images'
const IMAGES_DIR = join(__dirname, '../public/images/products/Gia Electro')

// Mapeo de rutas antiguas a nuevas URLs
const imageMapping = {}

/**
 * Obtiene el MIME type basado en la extensión del archivo
 */
function getMimeType(fileName) {
  const ext = fileName.split('.').pop().toLowerCase()
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
  }
  return mimeTypes[ext] || 'image/jpeg'
}

/**
 * Sube una imagen a Supabase Storage
 */
async function uploadImageToSupabase(filePath, fileName) {
  try {
    const fileBuffer = readFileSync(filePath)
    const fileExt = fileName.split('.').pop()
    const mimeType = getMimeType(fileName)
    
    // Generar nombre único
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    
    console.log(`📤 Subiendo: ${fileName}...`)
    
    // Crear un Blob con el tipo MIME correcto
    const blob = new Blob([fileBuffer], { type: mimeType })
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFileName, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType
      })

    if (error) {
      console.error(`❌ Error subiendo ${fileName}:`, error.message)
      return null
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uniqueFileName)

    console.log(`✅ Subida exitosa: ${fileName} -> ${urlData.publicUrl}`)
    return urlData.publicUrl
  } catch (error) {
    console.error(`❌ Error procesando ${fileName}:`, error.message)
    return null
  }
}

/**
 * Lee todas las imágenes de la carpeta
 */
function getAllImages() {
  try {
    const files = readdirSync(IMAGES_DIR)
    return files.filter(file => {
      const filePath = join(IMAGES_DIR, file)
      const stats = statSync(filePath)
      return stats.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(file)
    })
  } catch (error) {
    console.error('❌ Error leyendo carpeta de imágenes:', error.message)
    return []
  }
}

/**
 * Migra todas las imágenes
 */
async function migrateImages() {
  console.log('🚀 Iniciando migración de imágenes a Supabase Storage...\n')
  
  const images = getAllImages()
  console.log(`📁 Encontradas ${images.length} imágenes para migrar\n`)

  if (images.length === 0) {
    console.log('⚠️  No se encontraron imágenes para migrar')
    return
  }

  // Subir todas las imágenes
  for (const imageFile of images) {
    const imagePath = join(IMAGES_DIR, imageFile)
    const oldPath = `/images/products/Gia Electro/${imageFile}`
    const newUrl = await uploadImageToSupabase(imagePath, imageFile)
    
    if (newUrl) {
      imageMapping[oldPath] = newUrl
    }
    
    // Pequeña pausa para no sobrecargar
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`\n✅ Migración completada: ${Object.keys(imageMapping).length} imágenes migradas`)
  
  // Guardar mapeo en archivo JSON
  const mappingPath = join(__dirname, '../image-migration-mapping.json')
  await writeFile(mappingPath, JSON.stringify(imageMapping, null, 2))
  console.log(`📝 Mapeo guardado en: ${mappingPath}\n`)

  return imageMapping
}

/**
 * Actualiza los archivos de código con las nuevas URLs
 */
async function updateCodeFiles(mapping) {
  console.log('🔄 Actualizando archivos de código...\n')

  // Actualizar products.js
  const productsPath = join(__dirname, '../src/data/products.js')
  let productsContent = await readFile(productsPath, 'utf-8')
  
  let updatedCount = 0
  for (const [oldPath, newUrl] of Object.entries(mapping)) {
    const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    if (productsContent.includes(oldPath)) {
      productsContent = productsContent.replace(regex, newUrl)
      updatedCount++
    }
  }
  
  if (updatedCount > 0) {
    await writeFile(productsPath, productsContent)
    console.log(`✅ Actualizado products.js: ${updatedCount} referencias`)
  } else {
    console.log('ℹ️  No se encontraron referencias en products.js')
  }

  // Actualizar CategorySlider.jsx
  const categorySliderPath = join(__dirname, '../src/components/CategorySlider.jsx')
  let categorySliderContent = await readFile(categorySliderPath, 'utf-8')
  
  updatedCount = 0
  for (const [oldPath, newUrl] of Object.entries(mapping)) {
    const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    if (categorySliderContent.includes(oldPath)) {
      categorySliderContent = categorySliderContent.replace(regex, newUrl)
      updatedCount++
    }
  }
  
  if (updatedCount > 0) {
    await writeFile(categorySliderPath, categorySliderContent)
    console.log(`✅ Actualizado CategorySlider.jsx: ${updatedCount} referencias`)
  } else {
    console.log('ℹ️  No se encontraron referencias en CategorySlider.jsx')
  }

  console.log('\n✅ Actualización de archivos completada')
}

// Ejecutar migración
async function main() {
  try {
    // Verificar que el bucket existe intentando acceder directamente
    console.log(`🔍 Verificando bucket "${BUCKET_NAME}"...`)
    
    // Intentar listar archivos del bucket (si está vacío, devolverá array vacío)
    const { data: files, error: bucketError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1 })
    
    if (bucketError) {
      // Si el error es que el bucket no existe, mostrar mensaje específico
      if (bucketError.message.includes('not found') || bucketError.message.includes('does not exist') || bucketError.message.includes('Bucket not found')) {
        console.error(`❌ Error: El bucket "${BUCKET_NAME}" no existe en Supabase`)
        console.error('Por favor, crea el bucket en Supabase Dashboard primero')
        process.exit(1)
      }
      // Otros errores pueden ser de permisos, pero intentamos continuar
      console.warn(`⚠️  Advertencia al verificar bucket: ${bucketError.message}`)
      console.log('⚠️  Continuando de todas formas...\n')
    } else {
      console.log(`✅ Bucket "${BUCKET_NAME}" encontrado\n`)
    }

    // Migrar imágenes
    const mapping = await migrateImages()
    
    if (mapping && Object.keys(mapping).length > 0) {
      // Actualizar archivos de código
      await updateCodeFiles(mapping)
      
      console.log('\n🎉 ¡Migración completada exitosamente!')
      console.log('\n📋 Resumen:')
      console.log(`   - Imágenes migradas: ${Object.keys(mapping).length}`)
      console.log(`   - Archivos actualizados: products.js, CategorySlider.jsx`)
      console.log(`   - Mapeo guardado en: image-migration-mapping.json`)
    } else {
      console.log('\n⚠️  No se migraron imágenes')
    }
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  }
}

main()

