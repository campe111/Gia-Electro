// Servicio para backup automático de pedidos
// Puede integrarse con Google Sheets API en el futuro

export const exportToGoogleSheets = async (orders) => {
  // Esta función puede implementarse con Google Sheets API
  // Por ahora, exporta a formato CSV que puede importarse a Google Sheets
  try {
    const csv = convertOrdersToCSV(orders)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `backup_pedidos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return { success: true, message: 'Backup exportado exitosamente' }
  } catch (error) {
    console.error('Error exportando backup:', error)
    return { success: false, error: error.message }
  }
}

const convertOrdersToCSV = (orders) => {
  const headers = [
    'ID Pedido',
    'Fecha',
    'Cliente Nombre',
    'Cliente Email',
    'Cliente Teléfono',
    'Dirección',
    'Ciudad',
    'Estado',
    'Código Postal',
    'Total',
    'Estado Pedido',
    'Método de Pago',
    'Tracking',
    'Productos'
  ]

  const rows = orders.map(order => {
    const products = order.items.map(item => `${item.name} (x${item.quantity})`).join('; ')
    return [
      order.id,
      new Date(order.date).toISOString(),
      `${order.customer.firstName} ${order.customer.lastName}`,
      order.customer.email || '',
      order.customer.phone || '',
      order.shipping.address || '',
      order.shipping.city || '',
      order.shipping.state || '',
      order.shipping.zipCode || '',
      order.total,
      order.status,
      order.payment?.payment_method || 'email',
      order.trackingNumber || '',
      products
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

// Función para programar backups automáticos (puede llamarse desde un cron job o servicio)
export const scheduleBackup = (orders, frequency = 'daily') => {
  // Guardar configuración de backup
  const backupConfig = {
    frequency, // 'daily', 'weekly'
    lastBackup: new Date().toISOString(),
    enabled: true
  }
  localStorage.setItem('backupConfig', JSON.stringify(backupConfig))
  
  // En producción, esto podría integrarse con un servicio de backend
  // que ejecute backups automáticamente
}

