<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const conversaciones = computed(() => chatStore.conversaciones)

function seleccionarChat(usuario) {
  chatStore.abrirChat(usuario)
}

function esChatActivo(usuario) {
  return chatStore.usuarioActual?.idUsuario === usuario.idUsuario
}
</script>

<template>
  <div class="chat-list">
    <div class="chat-list-header">
      <h2>Mensajes</h2>
    </div>

    <!-- Loading -->
    <div v-if="chatStore.loading" class="loading">
      <div class="spinner"></div>
    </div>

    <!-- Sin conversaciones -->
    <div v-else-if="conversaciones.length === 0" class="sin-conversaciones">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="35" fill="#f3f4f6" />
        <path
          d="M30 35a3 3 0 013-3h14a3 3 0 013 3v12a3 3 0 01-3 3h-3l-5 5v-5h-6a3 3 0 01-3-3V35z"
          stroke="#9ca3af"
          stroke-width="2"
          fill="none"
        />
      </svg>
      <p>No tienes conversaciones</p>
      <small>Cuando contactes a alguien, aparecerá aquí</small>
    </div>

    <!-- Lista de conversaciones -->
    <div v-else class="conversaciones-list">
      <div
        v-for="usuario in conversaciones"
        :key="usuario.idUsuario"
        class="conversacion-item"
        :class="{ active: esChatActivo(usuario) }"
        @click="seleccionarChat(usuario)"
      >
        <div class="conv-avatar">
          <img v-if="usuario.foto" :src="usuario.foto" :alt="usuario.nombre" />
          <span v-else class="avatar-placeholder">
            {{ usuario.nombre?.charAt(0) }}{{ usuario.apellido?.charAt(0) }}
          </span>
        </div>

        <div class="conv-info">
          <div class="conv-header">
            <h4 class="conv-nombre">{{ usuario.nombre }} {{ usuario.apellido }}</h4>
          </div>
          <p class="conv-email">{{ usuario.email }}</p>
        </div>

        <div class="conv-indicator"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-list {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.chat-list-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.chat-list-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sin-conversaciones {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  flex: 1;
}

.sin-conversaciones svg {
  margin-bottom: 16px;
}

.sin-conversaciones p {
  color: #6b7280;
  font-size: 15px;
  margin-bottom: 4px;
}

.sin-conversaciones small {
  color: #9ca3af;
  font-size: 13px;
}

.conversaciones-list {
  overflow-y: auto;
  flex: 1;
}

.conversacion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-left: 3px solid transparent;
}

.conversacion-item:hover {
  background: #f9fafb;
}

.conversacion-item.active {
  background: linear-gradient(90deg, #667eea15 0%, #764ba215 100%);
  border-left-color: #667eea;
}

.conv-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.conv-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.conv-nombre {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-email {
  font-size: 13px;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;
}

/* Scrollbar */
.conversaciones-list::-webkit-scrollbar {
  width: 6px;
}

.conversaciones-list::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.conversaciones-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.conversaciones-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

@media (max-width: 968px) {
  .chat-list {
    max-height: 400px;
  }
}
</style>
