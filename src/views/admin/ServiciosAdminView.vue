<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useNotificationsStore } from '@/stores/notifications'
import { getPrimeraImagen } from '@/utils/storage'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const notifications = useNotificationsStore()

const servicios = ref([])
const loading = ref(true)
const filtros = ref({
  buscar: '',
  estado: '',
})

const paginacion = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const servicioSeleccionado = ref(null)
const mostrarDetalles = ref(false)
const mostrarConfirmEliminar = ref(false) // ← AGREGAR
const servicioAEliminar = ref(null) // ← AGREGAR

onMounted(async () => {
  await cargarServicios()
})

async function cargarServicios(page = 1) {
  loading.value = true
  try {
    const params = {
      page,
      ...filtros.value,
    }

    const response = await api.get('/admin/servicios', { params })
    servicios.value = response.data.data.data
    paginacion.value = {
      current_page: response.data.data.current_page,
      last_page: response.data.data.last_page,
      per_page: response.data.data.per_page,
      total: response.data.data.total,
    }
  } catch (error) {
    console.error('Error al cargar servicios:', error)
    notifications.error('Error al cargar servicios')
  } finally {
    loading.value = false
  }
}

async function cambiarEstado(servicio, nuevoEstado) {
  try {
    const response = await api.patch(`/admin/servicios/${servicio.idServicio}/estado`, {
      estado: nuevoEstado,
    })
    notifications.success(response.data.message)
    await cargarServicios(paginacion.value.current_page)
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    notifications.error('Error al cambiar estado del servicio')
  }
}

function confirmarEliminar(servicio) {
  servicioAEliminar.value = servicio
  mostrarConfirmEliminar.value = true
}

async function eliminarServicio() {
  try {
    const response = await api.delete(`/admin/servicios/${servicioAEliminar.value.idServicio}`)
    notifications.success(response.data.message)
    mostrarConfirmEliminar.value = false
    servicioAEliminar.value = null
    await cargarServicios(paginacion.value.current_page)
  } catch (error) {
    console.error('Error al eliminar servicio:', error)
    notifications.error('Error al eliminar servicio')
  }
}

function cancelarEliminar() {
  mostrarConfirmEliminar.value = false
  servicioAEliminar.value = null
}

function verDetalles(servicio) {
  servicioSeleccionado.value = servicio
  mostrarDetalles.value = true
}

function cerrarDetalles() {
  mostrarDetalles.value = false
  servicioSeleccionado.value = null
}

function aplicarFiltros() {
  cargarServicios(1)
}

function limpiarFiltros() {
  filtros.value = {
    buscar: '',
    estado: '',
  }
  cargarServicios(1)
}

function formatearFecha(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="servicios-admin-view">
    <div class="page-header">
      <div>
        <h1>Gestión de Servicios</h1>
        <p>Administra y supervisa todos los servicios publicados</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filtros-card">
      <div class="filtros-row">
        <div class="filtro-item">
          <label>Buscar</label>
          <input
            v-model="filtros.buscar"
            type="text"
            placeholder="Título o descripción..."
            @keyup.enter="aplicarFiltros"
          />
        </div>

        <div class="filtro-item">
          <label>Estado</label>
          <select v-model="filtros.estado">
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
            <option value="eliminado">Eliminados</option>
          </select>
        </div>

        <div class="filtro-actions">
          <button @click="aplicarFiltros" class="btn-primary">Buscar</button>
          <button @click="limpiarFiltros" class="btn-secondary">Limpiar</button>
        </div>
      </div>
    </div>

    <!-- Stats rápidas -->
    <div class="stats-quick">
      <div class="stat-quick">
        <span class="stat-label">Total</span>
        <span class="stat-value">{{ paginacion.total }}</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando servicios...</p>
    </div>

    <!-- Grid de servicios -->
    <div v-else class="servicios-grid">
      <div v-for="servicio in servicios" :key="servicio.idServicio" class="servicio-card">
        <div class="servicio-imagen">
          <img
            :src="getPrimeraImagen(servicio.imagenes)"
            :alt="servicio.titulo"
            @error="
              (e) =>
                (e.target.src = 'https://via.placeholder.com/400x300/667eea/ffffff?text=Sin+Imagen')
            "
          />
          <span class="badge-estado" :class="servicio.estado">
            {{ servicio.estado }}
          </span>
        </div>

        <div class="servicio-content">
          <h3>{{ servicio.titulo }}</h3>
          <p class="descripcion">{{ servicio.descripcion }}</p>

          <div class="servicio-info">
            <div class="info-item">
              <span class="label">Proveedor:</span>
              <span class="value"
                >{{ servicio.usuario?.nombre }} {{ servicio.usuario?.apellido }}</span
              >
            </div>
            <div class="info-item">
              <span class="label">Precio:</span>
              <span class="value precio"
                >${{ Number(servicio.precio).toLocaleString('es-ES') }}</span
              >
            </div>
            <div class="info-item">
              <span class="label">Publicado:</span>
              <span class="value">{{ formatearFecha(servicio.fechaPublicacion) }}</span>
            </div>
          </div>

          <div class="servicio-actions">
            <button @click="verDetalles(servicio)" class="btn-action ver">👁️ Ver detalles</button>

            <div class="estado-buttons">
              <button
                v-if="servicio.estado !== 'activo'"
                @click="cambiarEstado(servicio, 'activo')"
                class="btn-estado activo"
                title="Activar"
              >
                ✓
              </button>
              <button
                v-if="servicio.estado !== 'inactivo'"
                @click="cambiarEstado(servicio, 'inactivo')"
                class="btn-estado inactivo"
                title="Desactivar"
              >
                ⊘
              </button>
              <button
                @click="confirmarEliminar(servicio)"
                class="btn-estado eliminado"
                title="Eliminar permanentemente"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin resultados -->
      <div v-if="servicios.length === 0" class="no-results">
        <p>No se encontraron servicios</p>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="paginacion.last_page > 1" class="pagination">
      <button
        @click="cargarServicios(paginacion.current_page - 1)"
        :disabled="paginacion.current_page === 1"
        class="btn-pagination"
      >
        ← Anterior
      </button>

      <span class="pagination-info">
        Página {{ paginacion.current_page }} de {{ paginacion.last_page }}
      </span>

      <button
        @click="cargarServicios(paginacion.current_page + 1)"
        :disabled="paginacion.current_page === paginacion.last_page"
        class="btn-pagination"
      >
        Siguiente →
      </button>
    </div>

    <!-- Modal de detalles -->
    <div v-if="mostrarDetalles" class="modal-overlay" @click="cerrarDetalles">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Detalles del Servicio</h2>
          <button @click="cerrarDetalles" class="btn-close">✕</button>
        </div>

        <div v-if="servicioSeleccionado" class="modal-body">
          <div class="detail-section">
            <h3>Información del Servicio</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Título</label>
                <p>{{ servicioSeleccionado.titulo }}</p>
              </div>
              <div class="detail-item">
                <label>Descripción</label>
                <p>{{ servicioSeleccionado.descripcion }}</p>
              </div>
              <div class="detail-item">
                <label>Precio</label>
                <p class="precio">
                  ${{ Number(servicioSeleccionado.precio).toLocaleString('es-ES') }}
                </p>
              </div>
              <div class="detail-item">
                <label>Estado</label>
                <p>
                  <span class="badge" :class="servicioSeleccionado.estado">
                    {{ servicioSeleccionado.estado }}
                  </span>
                </p>
              </div>
              <div class="detail-item">
                <label>Fecha de Publicación</label>
                <p>{{ formatearFecha(servicioSeleccionado.fechaPublicacion) }}</p>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Información del Proveedor</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Nombre</label>
                <p>
                  {{ servicioSeleccionado.usuario?.nombre }}
                  {{ servicioSeleccionado.usuario?.apellido }}
                </p>
              </div>
              <div class="detail-item">
                <label>Email</label>
                <p>{{ servicioSeleccionado.usuario?.email }}</p>
              </div>
              <div class="detail-item">
                <label>Teléfono</label>
                <p>{{ servicioSeleccionado.usuario?.telefono || 'No especificado' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ConfirmModal
    v-if="mostrarConfirmEliminar"
    titulo="Eliminar Servicio"
    :mensaje="`¿Estás seguro de eliminar permanentemente el servicio &quot;${servicioAEliminar?.titulo}&quot;?\n\nEsta acción no se puede deshacer y se perderán todos los datos asociados.`"
    texto-confirmar="Sí, eliminar"
    texto-cancelar="Cancelar"
    tipo="danger"
    @confirm="eliminarServicio"
    @cancel="cancelarEliminar"
  />
</template>

<style scoped>
.servicios-admin-view {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
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

.filtros-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filtros-row {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
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

.loading {
  text-align: center;
  padding: 80px 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.servicios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.servicio-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.servicio-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.servicio-imagen {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.servicio-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-estado {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-estado.activo {
  background: #dcfce7;
  color: #16a34a;
}

.badge-estado.inactivo {
  background: #fef3c7;
  color: #ca8a04;
}

.badge-estado.eliminado {
  background: #fee2e2;
  color: #dc2626;
}

.servicio-content {
  padding: 20px;
}

.servicio-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.descripcion {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.servicio-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-item .label {
  color: #6b7280;
  font-weight: 500;
}

.info-item .value {
  color: #1f2937;
  font-weight: 600;
}

.info-item .precio {
  color: #667eea;
}

.servicio-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.btn-action {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-action.ver {
  background: #f3f4f6;
  color: #374151;
}

.btn-action.ver:hover {
  background: #e5e7eb;
}

.estado-buttons {
  display: flex;
  gap: 8px;
}

.btn-estado {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-estado.activo {
  background: #dcfce7;
  color: #16a34a;
}

.btn-estado.activo:hover {
  background: #bbf7d0;
}

.btn-estado.inactivo {
  background: #fef3c7;
  color: #ca8a04;
}

.btn-estado.inactivo:hover {
  background: #fde68a;
}

.btn-estado.eliminado {
  background: #fee2e2;
  color: #dc2626;
}

.btn-estado.eliminado:hover {
  background: #fecaca;
}

.no-results {
  grid-column: 1 / -1;
  padding: 40px;
  text-align: center;
  color: #9ca3af;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
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
}

.btn-close:hover {
  background: #e5e7eb;
}

.modal-body {
  padding: 24px;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.detail-item p {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.badge.activo {
  background: #dcfce7;
  color: #16a34a;
}

.badge.inactivo {
  background: #fef3c7;
  color: #ca8a04;
}

.badge.eliminado {
  background: #fee2e2;
  color: #dc2626;
}

@media (max-width: 768px) {
  .filtros-row {
    grid-template-columns: 1fr;
  }

  .servicios-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
