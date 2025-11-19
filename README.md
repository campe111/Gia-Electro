# GiA Electro - Landing Page

Landing page modular para un local de electrodomésticos llamada "GiA Electro". El sitio está construido con React, Vite y TailwindCSS, ofreciendo una experiencia rápida, responsiva y visualmente impactante.

## 🎨 Paleta de Colores

La paleta de colores está inspirada en la bandera de Alemania:

- **Negro**: `#000000` (primary-black) - Representa la fuerza y elegancia
- **Rojo**: `#DD0000` (primary-red) - Representa la pasión y energía
- **Amarillo**: `#FFCC00` (primary-yellow) - Representa la calidad y excelencia
- **Gris**: `#4A4A4A` (primary-gray) - Color complementario

## 🚀 Instalación

1. **Clonar o descargar el repositorio**

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   El proyecto estará disponible en `http://localhost:5173`

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta ESLint para verificar el código
- `npm run format` - Formatea el código con Prettier

## 📁 Estructura del Proyecto

```
Gia-Electro/
├── src/
│   ├── assets/          # Imágenes, logos y recursos estáticos
│   │   └── logoGiaElectro.svg
│   ├── components/      # Componentes reutilizables
│   │   ├── Header.jsx   # Navegación principal
│   │   ├── Footer.jsx   # Pie de página
│   │   ├── Hero.jsx     # Sección hero de la página principal
│   │   ├── Layout.jsx   # Layout base con Header y Footer
│   │   └── ProductCard.jsx  # Tarjeta de producto
│   ├── data/            # Datos y configuraciones
│   │   └── products.js  # Lista de productos
│   ├── pages/           # Páginas/vistas
│   │   ├── Home.jsx     # Página de inicio
│   │   ├── Catalogo.jsx # Página de catálogo
│   │   └── Contacto.jsx # Página de contacto
│   ├── App.jsx          # Componente principal con rutas
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos globales y Tailwind
├── .eslintrc.cjs        # Configuración de ESLint
├── .prettierrc          # Configuración de Prettier
├── tailwind.config.js   # Configuración de TailwindCSS
├── vite.config.js       # Configuración de Vite
└── package.json         # Dependencias y scripts
```

## 🛍️ Cómo Agregar Productos al Catálogo

Para agregar nuevos productos, edita el archivo `src/data/products.js`:

```javascript
export const products = [
  {
    id: 1,                    // ID único (número)
    name: 'Nombre del Producto',
    price: 999.99,            // Precio (número)
    category: 'categoria',    // Categoría (string)
    description: 'Descripción del producto',
    image: 'URL_de_la_imagen', // URL de la imagen
  },
  // Agrega más productos aquí...
]
```

### Campos del Producto:

- **id**: Número único que identifica el producto
- **name**: Nombre del producto
- **price**: Precio en formato numérico (ej: 999.99)
- **category**: Categoría del producto (se usa para filtrado)
  - Ejemplos: `refrigeradores`, `lavadoras`, `microondas`, `cocinas`, etc.
- **description**: Descripción breve del producto (opcional)
- **image**: URL de la imagen del producto

### Ejemplo de Producto:

```javascript
{
  id: 9,
  name: 'Licuadora Oster 600W',
  price: 89.99,
  category: 'licuadoras',
  description: 'Licuadora de alta potencia con vaso de vidrio y múltiples velocidades',
  image: 'https://ejemplo.com/imagen-licuadora.jpg',
}
```

Los productos se mostrarán automáticamente en:
- La página de inicio (primeros 6 productos destacados)
- La página de catálogo (todos los productos con filtros)

## 🎯 Características

- ✅ Diseño responsivo (mobile-first)
- ✅ Navegación con React Router
- ✅ Filtrado de productos por categoría
- ✅ Búsqueda de productos
- ✅ Paleta de colores personalizada
- ✅ Componentes modulares y reutilizables
- ✅ Optimizado para rendimiento con Vite
- ✅ Código limpio con ESLint y Prettier

## 🛠️ Tecnologías Utilizadas

- **React 18** - Biblioteca de UI
- **Vite** - Build tool y servidor de desarrollo
- **TailwindCSS** - Framework de CSS utility-first
- **React Router DOM** - Enrutamiento
- **Heroicons** - Iconos SVG
- **clsx** - Utilidad para clases condicionales
- **ESLint** - Linter de JavaScript
- **Prettier** - Formateador de código

## 📝 Notas

- El logo `logoGiaElectro.svg` debe estar en la carpeta `src/assets/`
- Las imágenes de productos pueden ser URLs externas o archivos locales en `src/assets/`
- Los estilos personalizados están en `src/index.css` usando clases de Tailwind
- La paleta de colores está configurada en `tailwind.config.js`

## 🚀 Despliegue

Para construir la aplicación para producción:

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`, listos para desplegar en cualquier servidor estático.

## 📄 Licencia

Este proyecto es privado y pertenece a GiA Electro.

