// Servicio para interactuar con Mercado Pago
// NOTA: Este servicio simula las llamadas a la API
// En producción, estas llamadas deben hacerse desde un backend seguro

import { MERCADOPAGO_CONFIG } from '../config/mercadoPago'

/**
 * Crea una preferencia de pago en Mercado Pago
 * En producción, esto debe hacerse en el backend
 */
export const createPaymentPreference = async (orderData) => {
  try {
    // En producción, esto sería una llamada a tu backend:
    // const response = await fetch(`${MERCADOPAGO_CONFIG.apiUrl}/mercadopago/create-preference`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(orderData),
    // })
    // return await response.json()

    // Por ahora, simulamos la creación de preferencia
    // En producción, tu backend debe llamar a la API de Mercado Pago
    
    const preferenceData = {
      items: orderData.items.map((item) => ({
        title: item.name,
        description: item.description || item.name,
        quantity: item.quantity,
        currency_id: 'ARS', // o la moneda que uses
        unit_price: item.price,
      })),
      payer: {
        name: orderData.customer.firstName,
        surname: orderData.customer.lastName,
        email: orderData.customer.email,
        phone: {
          area_code: '',
          number: orderData.customer.phone,
        },
        address: {
          street_name: orderData.shipping.address,
          street_number: '',
          zip_code: orderData.shipping.zipCode,
        },
      },
      back_urls: {
        success: `${window.location.origin}/confirmacion-pago`,
        failure: `${window.location.origin}/pago-fallido`,
        pending: `${window.location.origin}/pago-pendiente`,
      },
      auto_return: 'approved',
      external_reference: orderData.id,
      notification_url: `${MERCADOPAGO_CONFIG.apiUrl}/mercadopago/webhook`,
      statement_descriptor: 'GIA ELECTRO',
      metadata: {
        order_id: orderData.id,
        customer_id: orderData.customer.email,
      },
    }

    // Simular respuesta de API
    // En producción, esto viene del backend
    const mockResponse = {
      id: `preference-${Date.now()}`,
      init_point: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=preference-${Date.now()}`,
      sandbox_init_point: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=preference-${Date.now()}`,
    }

    return {
      success: true,
      data: mockResponse,
    }
  } catch (error) {
    console.error('Error creando preferencia de pago:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Verifica el estado de un pago
 * En producción, esto debe hacerse en el backend
 */
export const verifyPayment = async (paymentId) => {
  try {
    // En producción:
    // const response = await fetch(`${MERCADOPAGO_CONFIG.apiUrl}/mercadopago/verify/${paymentId}`)
    // return await response.json()

    // Simulación
    return {
      success: true,
      status: 'approved', // approved, pending, rejected
      payment_id: paymentId,
    }
  } catch (error) {
    console.error('Error verificando pago:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Procesa el webhook de Mercado Pago
 * Esto debe manejarse SOLO en el backend
 */
export const processWebhook = async (webhookData) => {
  // Esta función solo debería usarse en el backend
  // El frontend no debe procesar webhooks directamente
  console.warn('⚠️ processWebhook debe usarse solo en el backend')
  return { success: false, error: 'Debe procesarse en el backend' }
}

