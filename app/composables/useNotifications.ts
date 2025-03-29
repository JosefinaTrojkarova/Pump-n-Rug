import { ref } from 'vue';

export function useNotifications() {
  const notification = ref('');
  const notificationType = ref<'info' | 'success' | 'error'>('info');
  
  // Show a notification
  const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info', duration: number = 3000) => {
    notification.value = message;
    notificationType.value = type;
    
    // Clear notification after specified duration
    if (duration > 0) {
      setTimeout(() => {
        clearNotification();
      }, duration);
    }
  };
  
  // Clear the notification
  const clearNotification = () => {
    notification.value = '';
  };
  
  return {
    notification,
    notificationType,
    showNotification,
    clearNotification
  };
}