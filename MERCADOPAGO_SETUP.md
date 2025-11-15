# Configuración de Mercado Pago

## 📋 Pasos para Configurar Mercado Pago

### 1. Crear una cuenta en Mercado Pago

1. Ve a [https://www.mercadopago.com.ar](https://www.mercadopago.com.ar)
2. Crea una cuenta o inicia sesión
3. Completa la verificación de tu cuenta

### 2. Obtener tus credenciales

1. Ve al [Panel de Desarrolladores](https://www.mercadopago.com.ar/developers/panel)
2. Selecciona tu aplicación o crea una nueva
3. En la sección "Credenciales", encontrarás:
   - **Public Key**: Se puede usar en el frontend (seguro para exponer)
   - **Access Token**: SOLO para backend (NUNCA exponer en frontend)

### 3. Configurar las variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto (copia de `.env.example`)
2. Agrega tus credenciales:

```env
VITE_MP_PUBLIC_KEY=TEST-tu-public-key-aqui
VITE_API_URL=http://localhost:3000/api
```

### 4. Credenciales de Prueba (Sandbox)

Para probar el sistema sin hacer pagos reales, usa las credenciales de TEST:

- **Public Key de Test**: Empieza con `TEST-`
- **Access Token de Test**: Empieza con `TEST-`

Puedes obtener tarjetas de prueba en: [Tarjetas de Prueba Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/integration-test/test-cards)

#### Tarjetas de Prueba:
- **Aprobada**: `5031 7557 3453 0604`
- **Rechazada**: `5031 4332 1540 6351`
- **Pendiente**: `5031 7354 6519 3619`
- CVV: Cualquier número de 3 dígitos
- Fecha: Cualquier fecha futura

### 5. Modo Producción

Cuando estés listo para recibir pagos reales:

1. Cambia a credenciales de PRODUCCIÓN (sin el prefijo TEST-)
2. Configura el webhook en tu backend
3. Implementa la verificación de pagos en el servidor

## 🔒 Protocolos de Seguridad Implementados

### ✅ Seguridad del Frontend

1. **No almacenamiento de datos sensibles**: Los datos de tarjeta NUNCA se almacenan
2. **Public Key segura**: Solo se usa la Public Key en el frontend
3. **Redirección segura**: El pago se procesa en los servidores de Mercado Pago
4. **Validación de datos**: Sanitización y validación de todos los inputs
5. **HTTPS obligatorio**: En producción siempre usar HTTPS

### ✅ Seguridad del Backend (Para implementar)

1. **Access Token protegido**: Solo se usa en el servidor
2. **Verificación de webhooks**: Validar firmas de Mercado Pago
3. **Idempotencia**: Evitar procesar pagos duplicados
4. **Logs de auditoría**: Registrar todos los intentos de pago

## 📝 Notas Importantes

⚠️ **NUNCA expongas tu Access Token en el frontend**
⚠️ **NUNCA almacenes datos de tarjetas**
⚠️ **Siempre valida los pagos en el backend usando webhooks**

## 🚀 Próximos Pasos

Para producción completa, necesitas:

1. Backend API que:
   - Cree preferencias de pago usando el Access Token
   - Procese webhooks de Mercado Pago
   - Verifique pagos antes de confirmar órdenes
   - Almacene órdenes en base de datos

2. Implementar webhooks para recibir notificaciones de Mercado Pago

3. Sistema de verificación de pagos en el servidor

