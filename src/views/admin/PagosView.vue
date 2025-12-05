<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useNotificationsStore } from '@/stores/notifications'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const notifications = useNotificationsStore()

const pagos = ref([])
const loading = ref(true)
const filtros = ref({
  estado: '',
  fecha_desde: '',
  fecha_hasta: '',
})

const paginacion = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const pagoSeleccionado = ref(null)
const mostrarDetalles = ref(false)
const mostrarConfirmCambio = ref(false)
const nuevoEstado = ref('')

onMounted(async () => {
  await cargarPagos()
})

async function cargarPagos(page = 1) {
  loading.value = true
  try {
    const params = {
      page,
      ...filtros.value,
    }

    const response = await api.get('/admin/pagos', { params })
    pagos.value = response.data.data.data
    paginacion.value = {
      current_page: response.data.data.current_page,
      last_page: response.data.data.last_page,
      per_page: response.data.data.per_page,
      total: response.data.data.total,
    }
  } catch (error) {
    console.error('Error al cargar pagos:', error)
    notifications.error('Error al cargar pagos')
  } finally {
    loading.value = false
  }
}

function verDetalles(pago) {
  pagoSeleccionado.value = pago
  mostrarDetalles.value = true
}

function cerrarDetalles() {
  mostrarDetalles.value = false
  pagoSeleccionado.value = null
}

function confirmarCambioEstado(pago, estado) {
  pagoSeleccionado.value = pago
  nuevoEstado.value = estado
  mostrarConfirmCambio.value = true
}

async function cambiarEstadoPago() {
  try {
    const response = await api.patch(`/admin/pagos/${pagoSeleccionado.value.idPago}/estado`, {
      estado: nuevoEstado.value,
    })
    notifications.success(response.data.message)
    mostrarConfirmCambio.value = false
    pagoSeleccionado.value = null
    nuevoEstado.value = ''
    await cargarPagos(paginacion.value.current_page)
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    notifications.error('Error al cambiar estado del pago')
  }
}

function cancelarCambio() {
  mostrarConfirmCambio.value = false
  pagoSeleccionado.value = null
  nuevoEstado.value = ''
}

function aplicarFiltros() {
  cargarPagos(1)
}

function limpiarFiltros() {
  filtros.value = {
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
  }
  cargarPagos(1)
}

function formatearFecha(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function calcularEstadisticas() {
  const total = pagos.value.reduce((sum, pago) => sum + Number(pago.monto), 0)
  const completados = pagos.value.filter((p) => p.estado === 'completado').length
  const pendientes = pagos.value.filter((p) => p.estado === 'pendiente').length
  const fallidos = pagos.value.filter((p) => p.estado === 'fallido').length

  return { total, completados, pendientes, fallidos }
}
</script>

<template>
  <div class="pagos-view">
    <div class="page-header">
      <div>
        <h1>Supervisión de Pagos</h1>
        <p>Gestiona y supervisa todas las transacciones del sistema</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filtros-card">
      <div class="filtros-row">
        <div class="filtro-item">
          <label>Estado</label>
          <select v-model="filtros.estado">
            <option value="">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="completado">Completados</option>
            <option value="fallido">Fallidos</option>
          </select>
        </div>

        <div class="filtro-item">
          <label>Fecha desde</label>
          <input v-model="filtros.fecha_desde" type="date" />
        </div>

        <div class="filtro-item">
          <label>Fecha hasta</label>
          <input v-model="filtros.fecha_hasta" type="date" />
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
        <span class="stat-label">Total Pagos</span>
        <span class="stat-value">{{ paginacion.total }}</span>
      </div>
      <div class="stat-quick completado">
        <span class="stat-label">Completados</span>
        <span class="stat-value">{{ calcularEstadisticas().completados }}</span>
      </div>
      <div class="stat-quick pendiente">
        <span class="stat-label">Pendientes</span>
        <span class="stat-value">{{ calcularEstadisticas().pendientes }}</span>
      </div>
      <div class="stat-quick fallido">
        <span class="stat-label">Fallidos</span>
        <span class="stat-value">{{ calcularEstadisticas().fallidos }}</span>
      </div>
      <div class="stat-quick monto">
        <span class="stat-label">Monto Total</span>
        <span class="stat-value">${{ calcularEstadisticas().total.toLocaleString('es-ES') }}</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando pagos...</p>
    </div>

    <!-- Tabla de pagos -->
    <div v-else class="pagos-table-container">
      <table class="pagos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Pagador</th>
            <th>Receptor</th>
            <th>Servicio</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pago in pagos" :key="pago.idPago">
            <td>{{ pago.idPago }}</td>
            <td>
              <div class="user-info">
                <div class="user-avatar">
                  {{ pago.pagador?.nombre?.[0] }}{{ pago.pagador?.apellido?.[0] }}
                </div>
                <div>
                  <div class="user-name">
                    {{ pago.pagador?.nombre }} {{ pago.pagador?.apellido }}
                  </div>
                  <div class="user-email">{{ pago.pagador?.email }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="user-info">
                <div class="user-avatar receptor">
                  {{ pago.receptor?.nombre?.[0] }}{{ pago.receptor?.apellido?.[0] }}
                </div>
                <div>
                  <div class="user-name">
                    {{ pago.receptor?.nombre }} {{ pago.receptor?.apellido }}
                  </div>
                  <div class="user-email">{{ pago.receptor?.email }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="servicio-info">
                <span class="servicio-titulo">{{ pago.servicio?.titulo || 'N/A' }}</span>
              </div>
            </td>
            <td>
              <span class="monto">${{ Number(pago.monto).toLocaleString('es-ES') }}</span>
            </td>
            <td>
              <span class="badge" :class="pago.estado">
                {{ pago.estado }}
              </span>
            </td>
            <td>{{ formatearFecha(pago.fechaPago) }}</td>
            <td>
              <div class="actions">
                <button @click="verDetalles(pago)" class="btn-icon" title="Ver detalles">👁️</button>
                <button
                  v-if="pago.estado !== 'completado'"
                  @click="confirmarCambioEstado(pago, 'completado')"
                  class="btn-icon completar"
                  title="Marcar como completado"
                >
                  ✓
                </button>
                <button
                  v-if="pago.estado !== 'fallido'"
                  @click="confirmarCambioEstado(pago, 'fallido')"
                  class="btn-icon fallar"
                  title="Marcar como fallido"
                >
                  ✗
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Sin resultados -->
      <div v-if="pagos.length === 0" class="no-results">
        <p>No se encontraron pagos</p>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="paginacion.last_page > 1" class="pagination">
      <button
        @click="cargarPagos(paginacion.current_page - 1)"
        :disabled="paginacion.current_page === 1"
        class="btn-pagination"
      >
        ← Anterior
      </button>

      <span class="pagination-info">
        Página {{ paginacion.current_page }} de {{ paginacion.last_page }}
      </span>

      <button
        @click="cargarPagos(paginacion.current_page + 1)"
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
          <h2>Detalles del Pago</h2>
          <button @click="cerrarDetalles" class="btn-close">✕</button>
        </div>

        <div v-if="pagoSeleccionado" class="modal-body">
          <div class="detail-section">
            <h3>Información del Pago</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>ID del Pago</label>
                <p>#{{ pagoSeleccionado.idPago }}</p>
              </div>
              <div class="detail-item">
                <label>Monto</label>
                <p class="monto">${{ Number(pagoSeleccionado.monto).toLocaleString('es-ES') }}</p>
              </div>
              <div class="detail-item">
                <label>Estado</label>
                <p>
                  <span class="badge" :class="pagoSeleccionado.estado">
                    {{ pagoSeleccionado.estado }}
                  </span>
                </p>
              </div>
              <div class="detail-item">
                <label>Fecha del Pago</label>
                <p>{{ formatearFecha(pagoSeleccionado.fechaPago) }}</p>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Pagador</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Nombre</label>
                <p>
                  {{ pagoSeleccionado.pagador?.nombre }} {{ pagoSeleccionado.pagador?.apellido }}
                </p>
              </div>
              <div class="detail-item">
                <label>Email</label>
                <p>{{ pagoSeleccionado.pagador?.email }}</p>
              </div>
              <div class="detail-item">
                <label>Teléfono</label>
                <p>{{ pagoSeleccionado.pagador?.telefono || 'No especificado' }}</p>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Receptor</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Nombre</label>
                <p>
                  {{ pagoSeleccionado.receptor?.nombre }} {{ pagoSeleccionado.receptor?.apellido }}
                </p>
              </div>
              <div class="detail-item">
                <label>Email</label>
                <p>{{ pagoSeleccionado.receptor?.email }}</p>
              </div>
              <div class="detail-item">
                <label>Teléfono</label>
                <p>{{ pagoSeleccionado.receptor?.telefono || 'No especificado' }}</p>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="pagoSeleccionado.servicio">
            <h3>Servicio</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Título</label>
                <p>{{ pagoSeleccionado.servicio.titulo }}</p>
              </div>
              <div class="detail-item">
                <label>Descripción</label>
                <p>{{ pagoSeleccionado.servicio.descripcion }}</p>
              </div>
              <div class="detail-item">
                <label>Precio del Servicio</label>
                <p>${{ Number(pagoSeleccionado.servicio.precio).toLocaleString('es-ES') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación cambio de estado -->
    <ConfirmModal
      v-if="mostrarConfirmCambio"
      :titulo="
        nuevoEstado === 'completado'
          ? 'Marcar como Completado'
          : nuevoEstado === 'fallido'
            ? 'Marcar como Fallido'
            : 'Cambiar Estado'
      "
      :mensaje="
        nuevoEstado === 'completado'
          ? `¿Confirmar que el pago de $${Number(pagoSeleccionado?.monto).toLocaleString('es-ES')} fue completado exitosamente?`
          : nuevoEstado === 'fallido'
            ? `¿Marcar el pago de $${Number(pagoSeleccionado?.monto).toLocaleString('es-ES')} como fallido?`
            : '¿Cambiar el estado de este pago?'
      "
      texto-confirmar="Confirmar"
      texto-cancelar="Cancelar"
      :tipo="nuevoEstado === 'fallido' ? 'danger' : 'info'"
      @confirm="cambiarEstadoPago"
      @cancel="cancelarCambio"
    />
  </div>
</template>

<style scoped>
.pagos-view {
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
  grid-template-columns: 1fr 1fr 1fr auto;
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
  overflow-x: auto;
}

.stat-quick {
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-width: 150px;
  border-left: 4px solid #667eea;
}

.stat-quick.completado {
  border-left-color: #16a34a;
}

.stat-quick.pendiente {
  border-left-color: #ca8a04;
}

.stat-quick.fallido {
  border-left-color: #dc2626;
}

.stat-quick.monto {
  border-left-color: #7c3aed;
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

.pagos-table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pagos-table {
  width: 100%;
  border-collapse: collapse;
}

.pagos-table thead {
  background: #f9fafb;
}

.pagos-table th {
  padding: 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pagos-table td {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

.user-avatar.receptor {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.user-email {
  font-size: 12px;
  color: #9ca3af;
}

.servicio-info {
  max-width: 200px;
}

.servicio-titulo {
  font-size: 14px;
  color: #374151;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.monto {
  font-size: 16px;
  font-weight: 700;
  color: #667eea;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.badge.completado {
  background: #dcfce7;
  color: #16a34a;
}

.badge.pendiente {
  background: #fef3c7;
  color: #ca8a04;
}

.badge.fallido {
  background: #fee2e2;
  color: #dc2626;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #e5e7eb;
  transform: scale(1.1);
}

.btn-icon.completar {
  background: #dcfce7;
  color: #16a34a;
}

.btn-icon.completar:hover {
  background: #bbf7d0;
}

.btn-icon.fallar {
  background: #fee2e2;
  color: #dc2626;
}

.btn-icon.fallar:hover {
  background: #fecaca;
}

.no-results {
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

@media (max-width: 1200px) {
  .filtros-row {
    grid-template-columns: 1fr 1fr;
  }

  .filtro-actions {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .filtros-row {
    grid-template-columns: 1fr;
  }

  .stats-quick {
    flex-wrap: wrap;
  }

  .pagos-table-container {
    overflow-x: auto;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
