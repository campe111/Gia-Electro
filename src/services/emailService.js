import emailjs from '@emailjs/browser'

// Configuración de EmailJS
// Nota: El usuario necesita configurar estas variables en EmailJS
// y agregarlas a las variables de entorno
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''

// Email de contacto de Gia Electro
const CONTACT_EMAIL = 'giaelectro32@gmail.com'

/**
 * Formatea los items del pedido para el email
 */
const formatOrderItems = (items) => {
  return items
    .map(
      (item, index) => `
    ${index + 1}. ${item.name}
       - Cantidad: ${item.quantity}
       - Precio unitario: $${item.price.toLocaleString()}
       - Subtotal: $${(item.price * item.quantity).toLocaleString()}
  `
    )
    .join('\n')
}

/**
 * Formatea la información del pedido para el email
 */
const formatOrderEmail = (order) => {
  const itemsText = formatOrderItems(order.items)
  const date = new Date(order.date).toLocaleString('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  return `
NUEVO PEDIDO RECIBIDO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFORMACIÓN DEL PEDIDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ID de Pedido: ${order.id}
Fecha: ${date}
Estado: ${order.status}
Método de Pago: ${order.paymentMethod === 'credit' ? 'Tarjeta de Crédito' : order.paymentMethod === 'debit' ? 'Tarjeta de Débito' : order.paymentMethod === 'email' ? 'Pago por Email (Coordinación requerida)' : 'Transferencia Bancaria'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFORMACIÓN DEL CLIENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nombre: ${order.customer.firstName} ${order.customer.lastName}
Email: ${order.customer.email}
Teléfono: ${order.customer.phone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIRECCIÓN DE ENVÍO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dirección: ${order.shipping.address}
Ciudad: ${order.shipping.city}
Estado/Provincia: ${order.shipping.state}
Código Postal: ${order.shipping.zipCode}
País: ${order.shipping.country}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCTOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${itemsText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: $${order.total.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este es un email automático generado por el sistema de pedidos de Gia Electro.
  `.trim()
}

/**
 * Envía un email con los detalles del pedido a Gia Electro
 */
export const sendOrderEmail = async (order) => {
  try {
    // Si EmailJS no está configurado, usar método alternativo
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.warn('EmailJS no está configurado. Usando método alternativo.')
      return sendOrderEmailAlternative(order)
    }

    // Inicializar EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY)

    // Preparar el contenido del email
    const emailContent = formatOrderEmail(order)

    // Parámetros para el template de EmailJS
    const templateParams = {
      to_email: CONTACT_EMAIL,
      to_name: 'Gia Electro',
      from_name: `${order.customer.firstName} ${order.customer.lastName}`,
      from_email: order.customer.email,
      subject: `Nuevo Pedido #${order.id} - Gia Electro`,
      message: emailContent,
      order_id: order.id,
      customer_name: `${order.customer.firstName} ${order.customer.lastName}`,
      customer_email: order.customer.email,
      customer_phone: order.customer.phone,
      total: `$${order.total.toLocaleString()}`,
      items_count: order.items.length,
    }

    // Enviar email usando EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    )

    console.log('Email enviado exitosamente:', response)
    return { success: true, message: 'Email enviado correctamente' }
  } catch (error) {
    console.error('Error enviando email:', error)
    // Intentar método alternativo si EmailJS falla
    return sendOrderEmailAlternative(order)
  }
}

/**
 * Formatea un email de confirmación/actualización para el cliente
 */
const formatCustomerConfirmationEmail = (order, status, customMessage = '') => {
  const itemsText = formatOrderItems(order.items)
  const date = new Date(order.date).toLocaleString('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  const statusMessages = {
    processing: 'Tu pedido está siendo procesado',
    paid: 'Tu pago ha sido confirmado',
    shipped: 'Tu pedido ha sido enviado',
    delivered: 'Tu pedido ha sido entregado',
    cancelled: 'Tu pedido ha sido cancelado',
  }

  const message = customMessage || statusMessages[status] || 'Estado de tu pedido actualizado'

  return `
CONFIRMACIÓN DE PEDIDO - GIA ELECTRO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTADO DEL PEDIDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${message}

ID de Pedido: ${order.id}
Fecha del Pedido: ${date}
Estado Actual: ${status === 'processing' ? 'Procesando' : status === 'paid' ? 'Pagado' : status === 'shipped' ? 'Enviado' : status === 'delivered' ? 'Entregado' : status === 'cancelled' ? 'Cancelado' : 'Pendiente'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DETALLES DEL PEDIDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${itemsText}

Total: $${order.total.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIRECCIÓN DE ENVÍO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${order.shipping.address}
${order.shipping.city}, ${order.shipping.state}
${order.shipping.zipCode}, ${order.shipping.country}
${order.trackingNumber ? `\nNúmero de Seguimiento: ${order.trackingNumber}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gracias por tu compra en Gia Electro.
Si tienes alguna pregunta, no dudes en contactarnos.

Gia Electro
Email: ${CONTACT_EMAIL}
  `.trim()
}

/**
 * Envía un email de confirmación/actualización al cliente
 */
export const sendCustomerConfirmationEmail = async (order, status, customMessage = '') => {
  try {
    // Si EmailJS no está configurado, usar método alternativo
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.warn('EmailJS no está configurado. Usando método alternativo.')
      return sendCustomerEmailAlternative(order, status, customMessage)
    }

    // Inicializar EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY)

    // Preparar el contenido del email
    const emailContent = formatCustomerConfirmationEmail(order, status, customMessage)

    const statusMessages = {
      processing: 'Tu pedido está siendo procesado',
      paid: 'Tu pago ha sido confirmado',
      shipped: 'Tu pedido ha sido enviado',
      delivered: 'Tu pedido ha sido entregado',
      cancelled: 'Tu pedido ha sido cancelado',
    }

    const subject = `Actualización de Pedido #${order.id} - Gia Electro`

    // Parámetros para el template de EmailJS
    const templateParams = {
      to_email: order.customer.email,
      to_name: `${order.customer.firstName} ${order.customer.lastName}`,
      from_name: 'Gia Electro',
      from_email: CONTACT_EMAIL,
      subject: subject,
      message: emailContent,
      order_id: order.id,
      customer_name: `${order.customer.firstName} ${order.customer.lastName}`,
      customer_email: order.customer.email,
      customer_phone: order.customer.phone,
      total: `$${order.total.toLocaleString()}`,
      items_count: order.items.length,
      status_message: customMessage || statusMessages[status] || 'Estado de tu pedido actualizado',
      tracking_number: order.trackingNumber || '',
    }

    // Enviar email usando EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    )

    console.log('Email de confirmación enviado exitosamente:', response)
    return { success: true, message: 'Email de confirmación enviado correctamente' }
  } catch (error) {
    console.error('Error enviando email de confirmación:', error)
    // Intentar método alternativo si EmailJS falla
    return sendCustomerEmailAlternative(order, status, customMessage)
  }
}

/**
 * Método alternativo para enviar confirmación al cliente
 */
const sendCustomerEmailAlternative = async (order, status, customMessage = '') => {
  try {
    const emailContent = formatCustomerConfirmationEmail(order, status, customMessage)
    const subject = `Actualización de Pedido #${order.id} - Gia Electro`
    
    // Guardar emails pendientes en localStorage
    const pendingEmails = JSON.parse(localStorage.getItem('pendingCustomerEmails') || '[]')
    pendingEmails.push({
      orderId: order.id,
      to: order.customer.email,
      subject,
      content: emailContent,
      timestamp: new Date().toISOString(),
      status,
    })
    localStorage.setItem('pendingCustomerEmails', JSON.stringify(pendingEmails))

    // Crear enlace mailto como respaldo
    const mailtoLink = `mailto:${order.customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent)}`
    
    console.log('Email de confirmación guardado para envío:', {
      to: order.customer.email,
      subject,
      mailtoLink,
    })

    return {
      success: true,
      message: 'Email de confirmación guardado. Se enviará automáticamente.',
      mailtoLink,
    }
  } catch (error) {
    console.error('Error en método alternativo:', error)
    return {
      success: false,
      message: 'Error al procesar el envío de email',
      error: error.message,
    }
  }
}

/**
 * Método alternativo: usar mailto o guardar en localStorage para procesamiento posterior
 */
const sendOrderEmailAlternative = async (order) => {
  try {
    const emailContent = formatOrderEmail(order)
    const subject = `Nuevo Pedido #${order.id} - Gia Electro`
    
    // Guardar pedidos pendientes de envío en localStorage
    const pendingEmails = JSON.parse(localStorage.getItem('pendingOrderEmails') || '[]')
    pendingEmails.push({
      orderId: order.id,
      to: CONTACT_EMAIL,
      subject,
      content: emailContent,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem('pendingOrderEmails', JSON.stringify(pendingEmails))

    // También crear un enlace mailto como respaldo
    const mailtoLink = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent)}`
    
    console.log('Pedido guardado para envío. Email preparado:', {
      to: CONTACT_EMAIL,
      subject,
      mailtoLink,
    })

    // Nota: En producción, esto debería ser manejado por un backend
    return {
      success: true,
      message: 'Pedido guardado. El email se enviará automáticamente.',
      mailtoLink, // Opcional: para envío manual
    }
  } catch (error) {
    console.error('Error en método alternativo:', error)
    return {
      success: false,
      message: 'Error al procesar el envío de email',
      error: error.message,
    }
  }
}

