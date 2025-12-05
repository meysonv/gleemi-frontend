import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  let notificationId = 0

  function addNotification({ type = 'info', title, message, duration = 3000 }) {
    const id = ++notificationId

    const notification = {
      id,
      type, // success, error, warning, info
      title,
      message,
      duration,
      createdAt: Date.now(),
    }

    notifications.value.push(notification)

    // Auto-remover después del duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  function removeNotification(id) {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function success(title, message, duration) {
    return addNotification({ type: 'success', title, message, duration })
  }

  function error(title, message, duration) {
    return addNotification({ type: 'error', title, message, duration })
  }

  function warning(title, message, duration) {
    return addNotification({ type: 'warning', title, message, duration })
  }

  function info(title, message, duration) {
    return addNotification({ type: 'info', title, message, duration })
  }

  function clear() {
    notifications.value = []
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    clear,
  }
})
