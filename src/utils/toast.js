import { toast } from 'react-hot-toast'

export const showToast = {
  success: (message) => toast.success(message, { duration: 4000 }),
  error: (message) => toast.error(message, { duration: 5000 }),
  warning: (message) => toast(message, { 
    icon: '⚠️',
    duration: 4000,
    style: {
      background: '#fef3c7',
      color: '#92400e',
    }
  }),
  info: (message) => toast(message, {
    icon: 'ℹ️',
    duration: 4000,
    style: {
      background: '#dbeafe',
      color: '#1e40af',
    }
  }),
  loading: (message) => toast.loading(message),
}

export default showToast

