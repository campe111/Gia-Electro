# Configuración de Email para Pedidos

Este proyecto está configurado para enviar automáticamente un email a `giaelectro32@gmail.com` cada vez que se completa un pedido.

## Opción 1: Usar EmailJS (Recomendado)

### Pasos para configurar EmailJS:

1. **Crear cuenta en EmailJS**
   - Ve a https://www.emailjs.com/
   - Crea una cuenta gratuita (permite hasta 200 emails/mes)

2. **Configurar un servicio de email**
   - En el dashboard de EmailJS, ve a "Email Services"
   - Agrega un nuevo servicio (Gmail, Outlook, etc.)
   - Sigue las instrucciones para conectar tu cuenta de email

3. **Crear un template de email**
   - Ve a "Email Templates"
   - Crea un nuevo template
   - Usa estas variables en el template:
     - `{{to_email}}` - Email del destinatario
     - `{{to_name}}` - Nombre del destinatario
     - `{{from_name}}` - Nombre del cliente
     - `{{from_email}}` - Email del cliente
     - `{{subject}}` - Asunto del email
     - `{{message}}` - Contenido del pedido
     - `{{order_id}}` - ID del pedido
     - `{{customer_name}}` - Nombre completo del cliente
     - `{{customer_email}}` - Email del cliente
     - `{{customer_phone}}` - Teléfono del cliente
     - `{{total}}` - Total del pedido
     - `{{items_count}}` - Cantidad de items

4. **Obtener las credenciales**
   - Ve a "Account" > "General"
   - Copia tu "Public Key"
   - Ve a "Email Services" y copia el "Service ID"
   - Ve a "Email Templates" y copia el "Template ID"

5. **Configurar variables de entorno**
   - Crea un archivo `.env` en la raíz del proyecto (si no existe)
   - Agrega las siguientes variables:
   ```
   VITE_EMAILJS_SERVICE_ID=tu_service_id
   VITE_EMAILJS_TEMPLATE_ID=tu_template_id
   VITE_EMAILJS_PUBLIC_KEY=tu_public_key
   ```

6. **Reiniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

## Opción 2: Método Alternativo (Sin configuración)

Si no configuras EmailJS, el sistema guardará los pedidos en `localStorage` con la información lista para enviar. Puedes:

1. Revisar los pedidos pendientes en la consola del navegador
2. Usar el enlace `mailto` generado automáticamente
3. Implementar un backend que procese estos pedidos

## Verificación

Para verificar que el email funciona:

1. Completa un pedido de prueba
2. Revisa la consola del navegador para ver los logs
3. Verifica que recibes el email en `giaelectro32@gmail.com`

## Notas

- El email se envía automáticamente después de guardar la orden en Supabase
- Si el envío de email falla, el pedido aún se guarda correctamente
- Los emails incluyen toda la información del pedido: cliente, dirección, productos y total

