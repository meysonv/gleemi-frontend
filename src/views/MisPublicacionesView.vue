<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useNotificationsStore } from '@/stores/notifications'
import { getPrimeraImagen } from '@/utils/storage'
import NavbarAuth from '@/components/layout/NavbarAuth.vue'
import ServicioForm from '@/components/servicios/ServicioForm.vue'
import ServicioDetalle from '@/components/servicios/ServicioDetalle.vue' // ← AGREGAR
import BaseModal from '@/components/common/Modal.vue'

const notifications = useNotificationsStore()

const servicios = ref([])
const loading = ref(false)
const mostrarFormulario = ref(false)
const servicioEditando = ref(null)
const mostrarConfirmacion = ref(false)
const servicioAEliminar = ref(null)
const mostrarDetalle = ref(false) // ← AGREGAR
const servicioSeleccionado = ref(null) // ← AGREGAR

onMounted(() => {
  cargarMisPublicaciones()
})

async function cargarMisPublicaciones() {
  loading.value = true
  try {
    const response = await api.get('/servicios/mis-publicaciones')
    servicios.value = response.data.data
  } catch (error) {
    console.error('Error al cargar servicios:', error)
    notifications.error('Error', 'No se pudieron cargar tus publicaciones')
  } finally {
    loading.value = false
  }
}

function abrirFormularioNuevo() {
  servicioEditando.value = null
  mostrarFormulario.value = true
}

function abrirFormularioEditar(servicio) {
  servicioEditando.value = { ...servicio }
  mostrarFormulario.value = true
}

function cerrarFormulario() {
  mostrarFormulario.value = false
  servicioEditando.value = null
}

async function guardarServicio(data) {
  try {
    if (servicioEditando.value) {
      const response = await api.put(`/servicios/${servicioEditando.value.idServicio}`, data)
      if (response.data.success) {
        notifications.success('¡Actualizado!', 'Servicio actualizado correctamente')
        cerrarFormulario()
        await cargarMisPublicaciones()
      }
    } else {
      const response = await api.post('/servicios', data)
      if (response.data.success) {
        notifications.success('¡Publicado!', 'Servicio creado correctamente')
        cerrarFormulario()
        await cargarMisPublicaciones()
      }
    }
  } catch (error) {
    console.error('Error al guardar:', error)
    notifications.error('Error', error.response?.data?.message || 'No se pudo guardar el servicio')
  }
}

function confirmarEliminar(servicio) {
  servicioAEliminar.value = servicio
  mostrarConfirmacion.value = true
}

function cancelarEliminar() {
  servicioAEliminar.value = null
  mostrarConfirmacion.value = false
}

async function eliminarServicio() {
  if (!servicioAEliminar.value) return

  try {
    const response = await api.delete(`/servicios/${servicioAEliminar.value.idServicio}`)
    if (response.data.success) {
      notifications.success('¡Eliminado!', 'Servicio eliminado correctamente')
      cancelarEliminar()
      await cargarMisPublicaciones()
    }
  } catch (error) {
    console.error('Error al eliminar:', error)
    notifications.error('Error', 'No se pudo eliminar el servicio')
  }
}

async function toggleEstado(servicio) {
  try {
    const nuevoEstado = servicio.estado === 'activo' ? 'inactivo' : 'activo'

    const response = await api.put(`/servicios/${servicio.idServicio}`, {
      estado: nuevoEstado,
    })

    if (response.data.success) {
      const mensaje = nuevoEstado === 'activo' ? 'Servicio activado' : 'Servicio desactivado'
      notifications.success('Estado actualizado', mensaje)

      const index = servicios.value.findIndex((s) => s.idServicio === servicio.idServicio)
      if (index !== -1) {
        servicios.value[index] = {
          ...servicios.value[index],
          estado: nuevoEstado,
        }
      }
    }
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    notifications.error('Error', 'No se pudo cambiar el estado')
  }
}

// ← CAMBIAR ESTA FUNCIÓN
function verDetalle(servicio) {
  servicioSeleccionado.value = servicio
  mostrarDetalle.value = true
}

// ← AGREGAR ESTA FUNCIÓN
function cerrarDetalle() {
  mostrarDetalle.value = false
  servicioSeleccionado.value = null
}
</script>

<template>
  <div class="mis-publicaciones-view">
    <NavbarAuth />
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Mis Publicaciones</h1>
          <p class="subtitle">Administra los servicios que ofreces</p>
        </div>
        <button @click="abrirFormularioNuevo" class="btn-nuevo">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4V16M4 10H16"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          Nuevo servicio
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando servicios...</p>
      </div>

      <!-- Sin servicios -->
      <div v-else-if="servicios.length === 0" class="empty-state">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="50" fill="#f3f4f6" />
          <path
            d="M40 50h40M40 60h40M40 70h25"
            stroke="#9ca3af"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
        <h2>No tienes servicios publicados</h2>
        <p>Comienza a ofrecer tus servicios a la comunidad</p>
        <button @click="abrirFormularioNuevo" class="btn-primary">Publicar primer servicio</button>
      </div>

      <!-- Lista de servicios -->
      <div v-else class="servicios-grid">
        <div v-for="servicio in servicios" :key="servicio.idServicio" class="servicio-card">
          <!-- Imagen -->
          <div class="card-image" @click="verDetalle(servicio)">
            <img :src="getPrimeraImagen(servicio.imagenes)" :alt="servicio.titulo" />
            <div class="estado-badge" :class="servicio.estado">
              {{ servicio.estado }}
            </div>
          </div>

          <!-- Contenido -->
          <div class="card-content">
            <h3 @click="verDetalle(servicio)">{{ servicio.titulo }}</h3>
            <p class="descripcion">{{ servicio.descripcion }}</p>

            <div class="card-footer">
              <div class="precio">${{ Number(servicio.precio).toLocaleString('es-CO') }}</div>
              <div class="acciones">
                <!-- ← AGREGAR @click.stop para evitar que abra el detalle -->
                <button
                  @click.stop="toggleEstado(servicio)"
                  class="btn-icon"
                  :title="servicio.estado === 'activo' ? 'Desactivar' : 'Activar'"
                >
                  <svg
                    v-if="servicio.estado === 'activo'"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                    <path
                      d="M7 10h6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5 10L8 13L15 6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <button
                  @click.stop="abrirFormularioEditar(servicio)"
                  class="btn-icon"
                  title="Editar"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button
                  @click.stop="confirmarEliminar(servicio)"
                  class="btn-icon btn-danger"
                  title="Eliminar"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ← AGREGAR MODAL DE DETALLE -->
    <BaseModal v-if="mostrarDetalle" max-width="1200px" @close="cerrarDetalle">
      <ServicioDetalle
        v-if="servicioSeleccionado"
        :servicio="servicioSeleccionado"
        @close="cerrarDetalle"
      />
    </BaseModal>

    <!-- Modal Formulario -->
    <BaseModal v-if="mostrarFormulario" max-width="700px" @close="cerrarFormulario">
      <ServicioForm
        :servicio="servicioEditando"
        @guardar="guardarServicio"
        @cancelar="cerrarFormulario"
      />
    </BaseModal>

    <!-- Modal Confirmación Eliminar -->
    <BaseModal v-if="mostrarConfirmacion" max-width="500px" @close="cancelarEliminar">
      <div class="modal-confirmacion">
        <div class="icon-warning">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#ef4444" stroke-width="2" />
            <path d="M24 16v8M24 28h.01" stroke="#ef4444" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h2>¿Eliminar servicio?</h2>
        <p>
          Esta acción no se puede deshacer. El servicio "{{ servicioAEliminar?.titulo }}" será
          eliminado permanentemente.
        </p>
        <div class="modal-actions">
          <button @click="cancelarEliminar" class="btn-cancelar">Cancelar</button>
          <button @click="eliminarServicio" class="btn-eliminar">Eliminar servicio</button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.mis-publicaciones-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 0px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  gap: 20px;
}

.header-content h1 {
  font-size: 36px;
  font-weight: 800;
  color: white;
  margin: 0 0 8px 0;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  margin: 0;
}

.btn-nuevo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-nuevo:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
  color: white;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.empty-state svg {
  margin-bottom: 24px;
}

.empty-state h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.empty-state p {
  color: #6b7280;
  font-size: 16px;
  margin: 0 0 32px 0;
}

.btn-primary {
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.servicios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.servicio-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.servicio-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.card-image:hover img {
  transform: scale(1.05);
}

.estado-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.estado-badge.activo {
  background: #10b981;
  color: white;
}

.estado-badge.inactivo {
  background: #6b7280;
  color: white;
}

.card-content {
  padding: 20px;
}

.card-content h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
  cursor: pointer;
  transition: color 0.3s ease;
}

.card-content h3:hover {
  color: #667eea;
}

.descripcion {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.precio {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.acciones {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: #e5e7eb;
  color: #374151;
}

.btn-icon.btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Modal Confirmación */
.modal-confirmacion {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
}

.icon-warning {
  margin-bottom: 20px;
}

.modal-confirmacion h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.modal-confirmacion p {
  color: #6b7280;
  font-size: 15px;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-cancelar,
.btn-eliminar {
  flex: 1;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancelar {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancelar:hover {
  background: #e5e7eb;
}

.btn-eliminar {
  background: #dc2626;
  color: white;
}

.btn-eliminar:hover {
  background: #b91c1c;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-content h1 {
    font-size: 28px;
  }

  .servicios-grid {
    grid-template-columns: 1fr;
  }
}
</style>
