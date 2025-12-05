<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useNotificationsStore } from '@/stores/notifications'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const notifications = useNotificationsStore()

const vistaActual = ref('conversaciones') // 'conversaciones' | 'mensajes'

// Estado para vista de conversaciones
const conversaciones = ref([])
const loadingConversaciones = ref(true)
const paginacionConversaciones = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

// Estado para vista de mensajes individuales
const chats = ref([])
const loading = ref(true)
const filtros = ref({
  usuario_id: '',
  buscar: '',
})
const paginacion = ref({
  current_page: 1,
  last_page: 1,
  per_page: 50,
  total: 0,
})

// Estado para modal de conversación completa
const mostrarConversacion = ref(false)
const conversacionCompleta = ref([])
const loadingConversacion = ref(false)
const usuariosConversacion = ref({ usuario1: null, usuario2: null })

const usuarios = ref([])
const mostrarConfirmEliminar = ref(false)
const chatAEliminar = ref(null)

onMounted(async () => {
  await Promise.all([cargarConversaciones(), cargarUsuarios()])
})

async function cargarConversaciones(page = 1) {
  loadingConversaciones.value = true
  try {
    const response = await api.get('/admin/chats/conversaciones', {
      params: { page },
    })
    conversaciones.value = response.data.data.data
    paginacionConversaciones.value = {
      current_page: response.data.data.current_page,
      last_page: response.data.data.last_page,
      per_page: response.data.data.per_page,
      total: response.data.data.total,
    }
  } catch (error) {
    console.error('Error al cargar conversaciones:', error)
    notifications.error('Error al cargar conversaciones')
  } finally {
    loadingConversaciones.value = false
  }
}

async function cargarChats(page = 1) {
  loading.value = true
  try {
    const params = {
      page,
      ...filtros.value,
    }

    const response = await api.get('/admin/chats', { params })
    chats.value = response.data.data.data
    paginacion.value = {
      current_page: response.data.data.current_page,
      last_page: response.data.data.last_page,
      per_page: response.data.data.per_page,
      total: response.data.data.total,
    }
  } catch (error) {
    console.error('Error al cargar chats:', error)
    notifications.error('Error al cargar mensajes')
  } finally {
    loading.value = false
  }
}

async function verConversacionCompleta(conversacion) {
  loadingConversacion.value = true
  mostrarConversacion.value = true
  usuariosConversacion.value = {
    usuario1: conversacion.usuario1,
    usuario2: conversacion.usuario2,
  }

  try {
    const response = await api.get(
      `/admin/chats/conversacion/${conversacion.usuario1_id}/${conversacion.usuario2_id}`,
    )
    conversacionCompleta.value = response.data.data
  } catch (error) {
    console.error('Error al cargar conversación:', error)
    notifications.error('Error al cargar conversación completa')
  } finally {
    loadingConversacion.value = false
  }
}

function cerrarConversacion() {
  mostrarConversacion.value = false
  conversacionCompleta.value = []
  usuariosConversacion.value = { usuario1: null, usuario2: null }
}

async function cargarUsuarios() {
  try {
    const response = await api.get('/admin/usuarios')
    usuarios.value = response.data.data.data
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  }
}

function confirmarEliminar(chat) {
  chatAEliminar.value = chat
  mostrarConfirmEliminar.value = true
}

async function eliminarChat() {
  try {
    const response = await api.delete(`/admin/chats/${chatAEliminar.value.idChat}`)
    notifications.success(response.data.message)
    mostrarConfirmEliminar.value = false
    chatAEliminar.value = null

    if (vistaActual.value === 'conversaciones') {
      await cargarConversaciones(paginacionConversaciones.value.current_page)
    } else {
      await cargarChats(paginacion.value.current_page)
    }
  } catch (error) {
    console.error('Error al eliminar mensaje:', error)
    notifications.error('Error al eliminar mensaje')
  }
}

function cancelarEliminar() {
  mostrarConfirmEliminar.value = false
  chatAEliminar.value = null
}

function cambiarVista(vista) {
  vistaActual.value = vista
  if (vista === 'mensajes' && chats.value.length === 0) {
    cargarChats()
  }
}

function aplicarFiltros() {
  cargarChats(1)
}

function limpiarFiltros() {
  filtros.value = {
    usuario_id: '',
    buscar: '',
  }
  cargarChats(1)
}

function formatearFecha(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatearFechaRelativa(fecha) {
  if (!fecha) return 'N/A'
  const ahora = new Date()
  const fechaMensaje = new Date(fecha)
  const diferencia = ahora - fechaMensaje
  const minutos = Math.floor(diferencia / 60000)
  const horas = Math.floor(diferencia / 3600000)
  const dias = Math.floor(diferencia / 86400000)

  if (minutos < 60) return `Hace ${minutos} min`
  if (horas < 24) return `Hace ${horas}h`
  if (dias < 7) return `Hace ${dias}d`
  return formatearFecha(fecha)
}
</script>

<template>
  <div class="chats-view">
    <div class="page-header">
      <div>
        <h1>Supervisión de Chats</h1>
        <p>Revisa y modera las conversaciones del sistema</p>
      </div>

      <!-- Toggle de vistas -->
      <div class="vista-toggle">
        <button
          @click="cambiarVista('conversaciones')"
          :class="{ active: vistaActual === 'conversaciones' }"
          class="btn-vista"
        >
          💬 Por Conversaciones
        </button>
        <button
          @click="cambiarVista('mensajes')"
          :class="{ active: vistaActual === 'mensajes' }"
          class="btn-vista"
        >
          📝 Todos los Mensajes
        </button>
      </div>
    </div>

    <!-- ========== VISTA DE CONVERSACIONES AGRUPADAS ========== -->
    <div v-if="vistaActual === 'conversaciones'">
      <!-- Stats -->
      <div class="stats-quick">
        <div class="stat-quick">
          <span class="stat-label">Total Conversaciones</span>
          <span class="stat-value">{{ paginacionConversaciones.total }}</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loadingConversaciones" class="loading">
        <div class="spinner"></div>
        <p>Cargando conversaciones...</p>
      </div>

      <!-- Grid de conversaciones -->
      <div v-else class="conversaciones-grid">
        <div
          v-for="conv in conversaciones"
          :key="`${conv.usuario1_id}-${conv.usuario2_id}`"
          class="conversacion-card"
        >
          <div class="conversacion-header">
            <div class="usuarios">
              <div class="usuario">
                <span class="avatar"
                  >{{ conv.usuario1?.nombre?.[0] }}{{ conv.usuario1?.apellido?.[0] }}</span
                >
                <span class="nombre"
                  >{{ conv.usuario1?.nombre }} {{ conv.usuario1?.apellido }}</span
                >
              </div>
              <div class="flecha">↔</div>
              <div class="usuario">
                <span class="avatar"
                  >{{ conv.usuario2?.nombre?.[0] }}{{ conv.usuario2?.apellido?.[0] }}</span
                >
                <span class="nombre"
                  >{{ conv.usuario2?.nombre }} {{ conv.usuario2?.apellido }}</span
                >
              </div>
            </div>
          </div>

          <div class="conversacion-stats">
            <div class="stat-item">
              <span class="icon">💬</span>
              <span class="value">{{ conv.total_mensajes }} mensajes</span>
            </div>
            <div class="stat-item">
              <span class="icon">🕐</span>
              <span class="value">{{ formatearFechaRelativa(conv.ultimo_mensaje) }}</span>
            </div>
          </div>

          <button @click="verConversacionCompleta(conv)" class="btn-ver-conversacion">
            👁️ Ver conversación completa
          </button>
        </div>

        <!-- Sin resultados -->
        <div v-if="conversaciones.length === 0" class="no-results">
          <p>No hay conversaciones registradas</p>
        </div>
      </div>

      <!-- Paginación conversaciones -->
      <div v-if="paginacionConversaciones.last_page > 1" class="pagination">
        <button
          @click="cargarConversaciones(paginacionConversaciones.current_page - 1)"
          :disabled="paginacionConversaciones.current_page === 1"
          class="btn-pagination"
        >
          ← Anterior
        </button>

        <span class="pagination-info">
          Página {{ paginacionConversaciones.current_page }} de
          {{ paginacionConversaciones.last_page }}
        </span>

        <button
          @click="cargarConversaciones(paginacionConversaciones.current_page + 1)"
          :disabled="paginacionConversaciones.current_page === paginacionConversaciones.last_page"
          class="btn-pagination"
        >
          Siguiente →
        </button>
      </div>
    </div>

    <!-- ========== VISTA DE MENSAJES INDIVIDUALES ========== -->
    <div v-else>
      <!-- Filtros -->
      <div class="filtros-card">
        <div class="filtros-row">
          <div class="filtro-item">
            <label>Buscar en mensajes</label>
            <input
              v-model="filtros.buscar"
              type="text"
              placeholder="Buscar palabra clave..."
              @keyup.enter="aplicarFiltros"
            />
          </div>

          <div class="filtro-item">
            <label>Filtrar por Usuario</label>
            <select v-model="filtros.usuario_id">
              <option value="">Todos los usuarios</option>
              <option
                v-for="usuario in usuarios"
                :key="usuario.idUsuario"
                :value="usuario.idUsuario"
              >
                {{ usuario.nombre }} {{ usuario.apellido }} ({{ usuario.email }})
              </option>
            </select>
          </div>

          <div class="filtro-actions">
            <button @click="aplicarFiltros" class="btn-primary">Buscar</button>
            <button @click="limpiarFiltros" class="btn-secondary">Limpiar</button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-quick">
        <div class="stat-quick">
          <span class="stat-label">Total Mensajes</span>
          <span class="stat-value">{{ paginacion.total }}</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando mensajes...</p>
      </div>

      <!-- Lista de chats -->
      <div v-else class="chats-container">
        <div v-for="chat in chats" :key="chat.idChat" class="chat-item">
          <div class="chat-header">
            <div class="usuarios-info">
              <div class="usuario emisor">
                <span class="avatar"
                  >{{ chat.emisor?.nombre?.[0] }}{{ chat.emisor?.apellido?.[0] }}</span
                >
                <div class="usuario-detalles">
                  <span class="nombre">{{ chat.emisor?.nombre }} {{ chat.emisor?.apellido }}</span>
                  <span class="email">{{ chat.emisor?.email }}</span>
                </div>
              </div>

              <div class="flecha">→</div>

              <div class="usuario receptor">
                <span class="avatar"
                  >{{ chat.receptor?.nombre?.[0] }}{{ chat.receptor?.apellido?.[0] }}</span
                >
                <div class="usuario-detalles">
                  <span class="nombre"
                    >{{ chat.receptor?.nombre }} {{ chat.receptor?.apellido }}</span
                  >
                  <span class="email">{{ chat.receptor?.email }}</span>
                </div>
              </div>
            </div>

            <div class="chat-fecha">
              {{ formatearFecha(chat.fechaEnvio) }}
            </div>
          </div>

          <div class="chat-mensaje">
            <p>{{ chat.mensaje }}</p>
          </div>

          <div class="chat-actions">
            <button @click="confirmarEliminar(chat)" class="btn-eliminar" title="Eliminar mensaje">
              🗑️ Eliminar
            </button>
          </div>
        </div>

        <!-- Sin resultados -->
        <div v-if="chats.length === 0" class="no-results">
          <p>No se encontraron mensajes</p>
        </div>
      </div>

      <!-- Paginación mensajes -->
      <div v-if="paginacion.last_page > 1" class="pagination">
        <button
          @click="cargarChats(paginacion.current_page - 1)"
          :disabled="paginacion.current_page === 1"
          class="btn-pagination"
        >
          ← Anterior
        </button>

        <span class="pagination-info">
          Página {{ paginacion.current_page }} de {{ paginacion.last_page }}
        </span>

        <button
          @click="cargarChats(paginacion.current_page + 1)"
          :disabled="paginacion.current_page === paginacion.last_page"
          class="btn-pagination"
        >
          Siguiente →
        </button>
      </div>
    </div>

    <!-- ========== MODAL DE CONVERSACIÓN COMPLETA ========== -->
    <div v-if="mostrarConversacion" class="modal-overlay" @click="cerrarConversacion">
      <div class="modal-conversacion" @click.stop>
        <div class="modal-header">
          <div class="header-info">
            <h2>Conversación Completa</h2>
            <div class="usuarios-header">
              <span
                >{{ usuariosConversacion.usuario1?.nombre }}
                {{ usuariosConversacion.usuario1?.apellido }}</span
              >
              <span class="separador">↔</span>
              <span
                >{{ usuariosConversacion.usuario2?.nombre }}
                {{ usuariosConversacion.usuario2?.apellido }}</span
              >
            </div>
          </div>
          <button @click="cerrarConversacion" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <div v-if="loadingConversacion" class="loading-conversacion">
            <div class="spinner-small"></div>
            <p>Cargando conversación...</p>
          </div>

          <div v-else class="mensajes-lista">
            <div
              v-for="mensaje in conversacionCompleta"
              :key="mensaje.idChat"
              class="mensaje-item"
              :class="{
                emisor: mensaje.emisor_id === usuariosConversacion.usuario1?.idUsuario,
              }"
            >
              <div class="mensaje-header">
                <span class="mensaje-autor"
                  >{{ mensaje.emisor?.nombre }} {{ mensaje.emisor?.apellido }}</span
                >
                <span class="mensaje-fecha">{{ formatearFecha(mensaje.fechaEnvio) }}</span>
              </div>
              <div class="mensaje-contenido">
                <p>{{ mensaje.mensaje }}</p>
              </div>
              <button
                @click="confirmarEliminar(mensaje)"
                class="btn-eliminar-mini"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>

            <div v-if="conversacionCompleta.length === 0" class="no-mensajes">
              <p>No hay mensajes en esta conversación</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <ConfirmModal
      v-if="mostrarConfirmEliminar"
      titulo="Eliminar Mensaje"
      :mensaje="`¿Estás seguro de eliminar este mensaje?\n\nEsta acción no se puede deshacer.`"
      texto-confirmar="Sí, eliminar"
      texto-cancelar="Cancelar"
      tipo="danger"
      @confirm="eliminarChat"
      @cancel="cancelarEliminar"
    />
  </div>
</template>

<style scoped>
.chats-view {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.page-header p {
  color: #6b7280;
  font-size: 16px;
}

.vista-toggle {
  display: flex;
  gap: 8px;
  background: white;
  padding: 6px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-vista {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-vista.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-vista:hover:not(.active) {
  background: #f3f4f6;
}

.conversaciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.conversacion-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.conversacion-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.conversacion-header {
  margin-bottom: 16px;
}

.usuarios {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.usuario {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.nombre {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.flecha {
  font-size: 20px;
  color: #9ca3af;
  font-weight: 700;
}

.conversacion-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.stat-item .icon {
  font-size: 16px;
}

.btn-ver-conversacion {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ver-conversacion:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.filtros-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filtros-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 16px;
  align-items: end;
}

.filtro-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filtro-item label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.filtro-item input,
.filtro-item select {
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.filtro-item input:focus,
.filtro-item select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filtro-actions {
  display: flex;
  gap: 8px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.stats-quick {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-quick {
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.loading,
.loading-conversacion {
  text-align: center;
  padding: 80px 20px;
}

.spinner,
.spinner-small {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.spinner-small {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.chats-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.chat-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.usuarios-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}
.usuario-detalles {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.email {
  font-size: 12px;
  color: #9ca3af;
}
.chat-fecha {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  white-space: nowrap;
}
.chat-mensaje {
  background: #f9fafb;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
}
.chat-mensaje p {
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  word-wrap: break-word;
}
.chat-actions {
  display: flex;
  justify-content: flex-end;
}
.btn-eliminar {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-eliminar:hover {
  background: #fecaca;
  transform: translateY(-2px);
}
.no-results,
.no-mensajes {
  padding: 40px;
  text-align: center;
  color: #9ca3af;
  background: white;
  border-radius: 16px;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
.btn-pagination {
  padding: 10px 20px;
  border-radius: 8px;
  background: white;
  border: 2px solid #e5e7eb;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-pagination:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #667eea;
}
.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagination-info {
  color: #6b7280;
  font-weight: 500;
}
/* Modal de conversación completa */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}
.modal-conversacion {
  background: white;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}
.header-info h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}
.usuarios-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}
.separador {
  font-weight: 700;
}
.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}
.btn-close:hover {
  background: #e5e7eb;
}
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
.mensajes-lista {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mensaje-item {
  background: #f9fafb;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  position: relative;
  transition: all 0.3s ease;
}
.mensaje-item:hover {
  background: #f3f4f6;
}
.mensaje-item.emisor {
  border-left-color: #764ba2;
}
.mensaje-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.mensaje-autor {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}
.mensaje-fecha {
  font-size: 12px;
  color: #9ca3af;
}
.mensaje-contenido p {
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  word-wrap: break-word;
}
.btn-eliminar-mini {
  position: absolute;
  top: 42px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
}
.mensaje-item:hover .btn-eliminar-mini {
  opacity: 1;
}
.btn-eliminar-mini:hover {
  background: #fecaca;
  transform: scale(1.1);
}
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .vista-toggle {
    width: 100%;
  }
  .btn-vista {
    flex: 1;
  }
  .filtros-row {
    grid-template-columns: 1fr;
  }
  .conversaciones-grid {
    grid-template-columns: 1fr;
  }
  .usuarios-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .flecha {
    transform: rotate(90deg);
  }
  .chat-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
