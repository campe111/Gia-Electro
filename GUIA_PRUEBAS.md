# 🧪 Guía Paso a Paso para Probar Mercado Pago

## 📋 Preparación

### Paso 1: Verificar que el servidor esté corriendo

1. Abre una terminal en la carpeta del proyecto
2. Ejecuta:
   ```bash
   npm run dev
   ```
3. Deberías ver algo como: `Local: http://localhost:5173`
4. Abre tu navegador en esa URL

### Paso 2: Configurar Credenciales de Mercado Pago (Opcional)

Si tienes credenciales de Mercado Pago:

1. Ve al [Panel de Desarrolladores](https://www.mercadopago.com.ar/developers/panel)
2. Obtén tu **Public Key** (empieza con `TEST-` para pruebas)
3. Crea un archivo `.env` en la raíz del proyecto:
   ```
   VITE_MP_PUBLIC_KEY=TEST-tu-public-key-aqui
   ```
4. Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)

**Si NO tienes credenciales**: El sistema funcionará en modo de prueba (simulado)

---

## 🛒 Flujo de Prueba Completo

### Paso 3: Agregar Productos al Carrito

1. Ve a `http://localhost:5173`
2. Navega al **Catálogo** o usa los productos destacados
3. Haz clic en **"Agregar"** en cualquier producto
4. Verifica que el icono del carrito muestre el número de productos

### Paso 4: Ir al Carrito

1. Haz clic en el **icono del carrito** (arriba a la derecha)
2. O navega a `/carrito`
3. Verifica que veas todos los productos agregados
4. Puedes cambiar cantidades con los botones `+` y `-`
5. Haz clic en **"Proceder al Pago"**

### Paso 5: Completar el Checkout

#### **Paso 5.1: Información Personal**
1. Completa el formulario:
   - Nombre: `Juan`
   - Apellido: `Pérez`
   - Email: `juan@ejemplo.com`
   - Teléfono: `+54 11 1234-5678`
2. Haz clic en **"Siguiente"**

#### **Paso 5.2: Dirección de Envío**
1. Completa los campos:
   - Dirección: `Av. Corrientes 1234`
   - Ciudad: `Buenos Aires`
   - Estado/Provincia: `CABA`
   - Código Postal: `1043`
   - País: `Argentina`
2. Haz clic en **"Siguiente"**

#### **Paso 5.3: Información de Pago**

**Si tienes credenciales configuradas:**
- Verás el botón **"Pagar con Mercado Pago"**
- Haz clic y serás redirigido a Mercado Pago
- Usa tarjetas de prueba (ver abajo)

**Si NO tienes credenciales (Modo Prueba):**
- Verás un aviso amarillo: "Modo de Prueba Activado"
- Haz clic en **"Simular Pago de Prueba"**
- Espera 2 segundos y verás la confirmación

### Paso 6: Aceptar Términos y Confirmar

1. Marca la casilla **"Acepto los términos y condiciones"**
2. Haz clic en el botón de pago
3. Si estás en modo real, serás redirigido a Mercado Pago

### Paso 7: Probar el Pago en Mercado Pago (Solo si tienes credenciales)

Si usas credenciales reales, en Mercado Pago puedes usar:

**Tarjetas de Prueba:**
- **Aprobada**: `5031 7557 3453 0604`
  - CVV: `123`
  - Fecha: Cualquier fecha futura (ej: `11/25`)
  - Nombre: Cualquier nombre
  
- **Rechazada**: `5031 4332 1540 6351`
  - CVV: `123`
  - Fecha: Cualquier fecha futura
  
- **Pendiente**: `5031 7354 6519 3619`
  - CVV: `123`
  - Fecha: Cualquier fecha futura

Después del pago, Mercado Pago te redirigirá de vuelta a tu sitio.

### Paso 8: Ver la Confirmación

1. Después del pago exitoso, verás:
   - **Página de confirmación** con todos los detalles
   - Número de orden único
   - Resumen de productos
   - Información de envío
   - Total pagado

### Paso 9: Verificar en el Panel Admin

1. Ve a `http://localhost:5173/admin/login`
2. Ingresa:
   - Email: `admin@giaelectro.com`
   - Password: `admin123`
3. En el dashboard verás:
   - Estadísticas actualizadas
   - La nueva orden en la tabla
   - Puedes cambiar el estado de la orden
   - Ver detalles completos haciendo clic en "Ver"

---

## 🔍 Verificación de Funcionalidades

### ✅ Checklist de Verificación

- [ ] Productos se agregan al carrito correctamente
- [ ] El contador del carrito se actualiza
- [ ] Puedo ver los productos en el carrito
- [ ] Puedo cambiar cantidades
- [ ] El checkout tiene 3 pasos funcionales
- [ ] La validación de formularios funciona
- [ ] El pago se procesa (real o simulado)
- [ ] Veo la página de confirmación
- [ ] La orden aparece en el panel admin
- [ ] Puedo cambiar el estado de la orden
- [ ] Recibo notificaciones cuando cambio estados

---

## 🐛 Solución de Problemas

### El servidor no inicia
```bash
# Verifica que Node.js esté instalado
node --version

# Limpia e instala dependencias
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### No veo el botón de Mercado Pago
- Verifica que hayas creado el archivo `.env` con tu Public Key
- Reinicia el servidor después de crear/modificar `.env`
- Verifica la consola del navegador para errores

### El pago no se procesa
- Verifica que hayas aceptado los términos y condiciones
- Revisa la consola del navegador para ver errores
- Si usas credenciales reales, verifica que sean correctas

### No veo las órdenes en el panel admin
- Verifica que hayas iniciado sesión correctamente
- Recarga la página del dashboard
- Revisa el localStorage del navegador (F12 > Application > Local Storage > giaElectroOrders)

---

## 📱 Pruebas Responsive

Prueba también en:
- **Móvil**: Redimensiona la ventana o usa DevTools (F12 > Toggle device toolbar)
- **Tablet**: Verifica que todos los formularios sean usables
- **Desktop**: Verifica el layout completo

---

## ✨ Funcionalidades Extra a Probar

1. **Búsqueda de productos**: Busca por nombre o marca
2. **Filtros**: Filtra por categoría y marca
3. **Carrusel**: Ve el carrusel en la página de inicio
4. **Mapa**: Verifica la ubicación en la página de contacto
5. **Navegación**: Prueba todas las rutas del sitio

---

¡Listo para probar! 🚀

