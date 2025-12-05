<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const chatStore = useChatStore()
const authStore = useAuthStore()
const notifications = useNotificationsStore()

const nuevoMensaje = ref('')
const chatContainer = ref(null)
const scrollReady = ref(false) // ← NUEVO: controlar visibilidad

const usuarioActual = computed(() => chatStore.usuarioActual)
const mensajes = computed(() => chatStore.mensajes)

// Watch para cuando cambian los mensajes
watch(
  () => mensajes.value,
  async () => {
    await nextTick()
    scrollToBottom()
  },
  { deep: true },
)

// Watch para cuando cambia el usuario
watch(
  () => usuarioActual.value,
  async () => {
    scrollReady.value = false // ← Ocultar mientras carga
    await nextTick()
    scrollToBottom()
  },
)

// Watch para cuando termina de cargar
watch(
  () => chatStore.loading,
  async (loading) => {
    if (!loading && mensajes.value.length > 0) {
      await nextTick()
      scrollToBottom()
    }
  },
)

// Scroll al montar el componente
onMounted(() => {
  if (mensajes.value.length > 0) {
    scrollReady.value = false
    setTimeout(() => {
      scrollToBottom()
    }, 50)
  } else {
    scrollReady.value = true
  }
})

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    // Mostrar después de hacer scroll
    setTimeout(() => {
      scrollReady.value = true
    }, 50)
  }
}

async function enviar() {
  if (!nuevoMensaje.value.trim() || !usuarioActual.value) return

  const result = await chatStore.enviarMensaje(usuarioActual.value.idUsuario, nuevoMensaje.value)

  if (result.success) {
    nuevoMensaje.value = ''
    await nextTick()
    scrollToBottom()
  } else {
    notifications.error('Error', 'No se pudo enviar el mensaje')
  }
}

function esMiMensaje(mensaje) {
  return mensaje.emisor_id === authStore.user?.idUsuario || mensaje.emisor_id === authStore.user?.id
}

function formatearHora(fecha) {
  if (!fecha) return ''

  try {
    const date = new Date(fecha)

    if (isNaN(date.getTime())) {
      return ''
    }

    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.error('Error al formatear fecha:', error)
    return ''
  }
}
</script>

<template>
  <div class="chat-window">
    <!-- Sin conversación seleccionada -->
    <div v-if="!usuarioActual" class="no-chat">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill="#f3f4f6" />
        <path
          d="M40 50a5 5 0 015-5h30a5 5 0 015 5v20a5 5 0 01-5 5h-5l-10 10v-10h-15a5 5 0 01-5-5V50z"
          stroke="#9ca3af"
          stroke-width="3"
          fill="none"
        />
      </svg>
      <h3>Selecciona una conversación</h3>
      <p>Elige un contacto para comenzar a chatear</p>
    </div>

    <!-- Chat activo -->
    <div v-else class="chat-active">
      <!-- Header del chat -->
      <div class="chat-header">
        <div class="usuario-info">
          <div class="usuario-avatar">
            <img v-if="usuarioActual.foto" :src="usuarioActual.foto" :alt="usuarioActual.nombre" />
            <span v-else class="avatar-placeholder">
              {{ usuarioActual.nombre?.charAt(0) }}{{ usuarioActual.apellido?.charAt(0) }}
            </span>
          </div>
          <div class="usuario-detalles">
            <h3>{{ usuarioActual.nombre }} {{ usuarioActual.apellido }}</h3>
            <p class="estado">En línea</p>
          </div>
        </div>
      </div>

      <!-- Mensajes -->
      <div ref="chatContainer" class="mensajes-container">
        <div v-if="chatStore.loading" class="loading">
          <div class="spinner"></div>
        </div>

        <div v-else-if="mensajes.length === 0" class="sin-mensajes">
          <p>No hay mensajes aún. ¡Comienza la conversación!</p>
        </div>

        <!-- ← AGREGAR :class para ocultar mientras posiciona -->
        <div v-else class="mensajes-list" :class="{ 'scroll-ready': scrollReady }">
          <div
            v-for="mensaje in mensajes"
            :key="mensaje.idChat"
            class="mensaje"
            :class="{ 'mensaje-propio': esMiMensaje(mensaje) }"
          >
            <div class="mensaje-bubble">
              <p class="mensaje-texto">{{ mensaje.mensaje }}</p>
              <span class="mensaje-hora">{{ formatearHora(mensaje.fechaEnvio) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input de mensaje -->
      <div class="chat-footer">
        <form @submit.prevent="enviar" class="mensaje-form">
          <input
            v-model="nuevoMensaje"
            type="text"
            placeholder="Escribe un mensaje..."
            class="mensaje-input"
          />
          <button type="submit" class="btn-enviar" :disabled="!nuevoMensaje.trim()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.no-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
}

.no-chat svg {
  margin-bottom: 24px;
}

.no-chat h3 {
  font-size: 22px;
  color: #1f2937;
  margin-bottom: 8px;
}

.no-chat p {
  color: #6b7280;
  font-size: 15px;
}

.chat-active {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.usuario-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.usuario-avatar {
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

.usuario-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.usuario-detalles h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.estado {
  font-size: 13px;
  color: #10b981;
  font-weight: 500;
}

.mensajes-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f9fafb;
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

.sin-mensajes {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.mensajes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  opacity: 0; /* ← Oculto por defecto */
  transition: opacity 0.15s ease; /* ← Transición suave */
}

.mensajes-list.scroll-ready {
  opacity: 1; /* ← Visible cuando está listo */
}

.mensaje {
  display: flex;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mensaje-propio {
  justify-content: flex-end;
}

.mensaje-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.mensaje-propio .mensaje-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.mensaje-texto {
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.mensaje-hora {
  font-size: 11px;
  opacity: 0.7;
}

.chat-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.mensaje-form {
  display: flex;
  gap: 12px;
  align-items: center;
}

.mensaje-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 24px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.mensaje-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-enviar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-enviar:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-enviar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar personalizado */
.mensajes-container::-webkit-scrollbar {
  width: 6px;
}

.mensajes-container::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.mensajes-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.mensajes-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

@media (max-width: 768px) {
  .mensaje-bubble {
    max-width: 85%;
  }
}
</style>
