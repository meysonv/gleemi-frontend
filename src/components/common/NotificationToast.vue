<script setup>
import { useNotificationsStore } from '@/stores/notifications'

const notificationsStore = useNotificationsStore()

function close(id) {
  notificationsStore.removeNotification(id)
}

function getIcon(type) {
  const icons = {
    success: `<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"/>`,
    error: `<path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"/>`,
    warning: `<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" fill="none"/>`,
    info: `<path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"/>`,
  }
  return icons[type] || icons.info
}

function getColors(type) {
  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      title: 'text-green-900',
      message: 'text-green-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      message: 'text-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      message: 'text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      message: 'text-blue-700',
    },
  }
  return colors[type] || colors.info
}
</script>

<template>
  <div class="notifications-container">
    <transition-group name="notification" tag="div">
      <div
        v-for="notification in notificationsStore.notifications"
        :key="notification.id"
        class="notification-item"
        :class="getColors(notification.type).bg"
      >
        <div class="notification-content">
          <div class="notification-icon" :class="getColors(notification.type).icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              v-html="getIcon(notification.type)"
            ></svg>
          </div>

          <div class="notification-text">
            <h4
              v-if="notification.title"
              class="notification-title"
              :class="getColors(notification.type).title"
            >
              {{ notification.title }}
            </h4>
            <p class="notification-message" :class="getColors(notification.type).message">
              {{ notification.message }}
            </p>
          </div>

          <button @click="close(notification.id)" class="notification-close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M6 6L14 14M6 14L14 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.notifications-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 99990;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  width: 100%;
}

.notification-item {
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid;
  animation: slideInRight 0.3s ease;
  transform-origin: right;
}

.notification-content {
  display: flex;
  align-items: start;
  gap: 12px;
  padding: 16px;
}

.notification-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 14px;
  line-height: 1.5;
}

.notification-close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

/* Utilidades de color (inline styles en el template) */
.bg-green-50 {
  background: #f0fdf4;
}
.border-green-200 {
  border-color: #bbf7d0;
}
.text-green-600 {
  color: #16a34a;
}
.text-green-900 {
  color: #14532d;
}
.text-green-700 {
  color: #15803d;
}

.bg-red-50 {
  background: #fef2f2;
}
.border-red-200 {
  border-color: #fecaca;
}
.text-red-600 {
  color: #dc2626;
}
.text-red-900 {
  color: #7f1d1d;
}
.text-red-700 {
  color: #b91c1c;
}

.bg-yellow-50 {
  background: #fefce8;
}
.border-yellow-200 {
  border-color: #fef08a;
}
.text-yellow-600 {
  color: #ca8a04;
}
.text-yellow-900 {
  color: #713f12;
}
.text-yellow-700 {
  color: #a16207;
}

.bg-blue-50 {
  background: #eff6ff;
}
.border-blue-200 {
  border-color: #bfdbfe;
}
.text-blue-600 {
  color: #2563eb;
}
.text-blue-900 {
  color: #1e3a8a;
}
.text-blue-700 {
  color: #1d4ed8;
}

/* Animaciones */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-enter-active {
  animation: slideInRight 0.3s ease;
}

.notification-leave-active {
  animation: slideOutRight 0.3s ease;
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.notification-move {
  transition: transform 0.3s ease;
}

@media (max-width: 640px) {
  .notifications-container {
    left: 20px;
    right: 20px;
    max-width: none;
  }
}
</style>
