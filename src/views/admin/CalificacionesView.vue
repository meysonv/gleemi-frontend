<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'
import { useNotificationsStore } from '@/stores/notifications'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const notifications = useNotificationsStore()

const calificaciones = ref([])
const loading = ref(true)
const filtros = ref({
  servicio_id: '',
  usuario_id: '',
  buscar: '',
  rango_puntuacion: '', // 'negativas', 'medias', 'altas'
  rango_fecha: '', // 'hoy', 'semana', 'mes', '3meses'
  fecha_desde: '',
  fecha_hasta: '',
})

const paginacion = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const usuarios = ref([])
const servicios = ref([])
const calificacionSeleccionada = ref(null)
const mostrarDetalles = ref(false)
const mostrarConfirmEliminar = ref(false)

onMounted(async () => {
  await Promise.all([cargarCalificaciones(), cargarUsuarios(), cargarServicios()])
})

// ← AGREGAR: Computed para obtener rango de fechas según selección rápida
const rangoFechas = computed(() => {
  const hoy = new Date()
  let desde = null
  let hasta = hoy.toISOString().split('T')[0]

  switch (filtros.value.rango_fecha) {
    case 'hoy':
      desde = hoy.toISOString().split('T')[0]
      break
    case 'semana':
      desde = new Date(hoy.setDate(hoy.getDate() - 7)).toISOString().split('T')[0]
      break
    case 'mes':
      desde = new Date(hoy.setMonth(hoy.getMonth() - 1)).toISOString().split('T')[0]
      break
    case '3meses':
      desde = new Date(hoy.setMonth(hoy.getMonth() - 3)).toISOString().split('T')[0]
      break
  }

  return { desde, hasta }
})

// ← AGREGAR: Computed para obtener rango de puntuación
const rangoPuntuacion = computed(() => {
  switch (filtros.value.rango_puntuacion) {
    case 'negativas':
      return { min: 1, max: 2 }
    case 'medias':
      return { min: 3, max: 3 }
    case 'altas':
      return { min: 4, max: 5 }
    default:
      return { min: null, max: null }
  }
})

async function cargarCalificaciones(page = 1) {
  loading.value = true
  try {
    const params = {
      page,
      servicio_id: filtros.value.servicio_id,
      usuario_id: filtros.value.usuario_id,
      buscar: filtros.value.buscar,
    }

    // Aplicar rango de puntuación
    if (rangoPuntuacion.value.min) {
      params.puntuacion_min = rangoPuntuacion.value.min
      params.puntuacion_max = rangoPuntuacion.value.max
    }

    // Aplicar rango de fechas
    if (filtros.value.rango_fecha) {
      params.fecha_desde = rangoFechas.value.desde
      params.fecha_hasta = rangoFechas.value.hasta
    } else if (filtros.value.fecha_desde || filtros.value.fecha_hasta) {
      params.fecha_desde = filtros.value.fecha_desde
      params.fecha_hasta = filtros.value.fecha_hasta
    }

    const response = await api.get('/admin/calificaciones', { params })
    calificaciones.value = response.data.data.data
    paginacion.value = {
      current_page: response.data.data.current_page,
      last_page: response.data.data.last_page,
      per_page: response.data.data.per_page,
      total: response.data.data.total,
    }
  } catch (error) {
    console.error('Error al cargar calificaciones:', error)
    notifications.error('Error al cargar calificaciones')
  } finally {
    loading.value = false
  }
}

async function cargarUsuarios() {
  try {
    const response = await api.get('/admin/usuarios')
    usuarios.value = response.data.data.data
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  }
}

async function cargarServicios() {
  try {
    const response = await api.get('/admin/servicios')
    servicios.value = response.data.data.data
  } catch (error) {
    console.error('Error al cargar servicios:', error)
  }
}

function verDetalles(calificacion) {
  calificacionSeleccionada.value = calificacion
  mostrarDetalles.value = true
}

function cerrarDetalles() {
  mostrarDetalles.value = false
  calificacionSeleccionada.value = null
}

function confirmarEliminar(calificacion) {
  calificacionSeleccionada.value = calificacion
  mostrarConfirmEliminar.value = true
}

async function eliminarCalificacion() {
  try {
    const response = await api.delete(
      `/admin/calificaciones/${calificacionSeleccionada.value.idCalificacion}`,
    )
    notifications.success(response.data.message)
    mostrarConfirmEliminar.value = false
    calificacionSeleccionada.value = null
    await cargarCalificaciones(paginacion.value.current_page)
  } catch (error) {
    console.error('Error al eliminar calificación:', error)
    notifications.error('Error al eliminar calificación')
  }
}

function cancelarEliminar() {
  mostrarConfirmEliminar.value = false
  calificacionSeleccionada.value = null
}

function aplicarFiltros() {
  cargarCalificaciones(1)
}

function limpiarFiltros() {
  filtros.value = {
    servicio_id: '',
    usuario_id: '',
    buscar: '',
    rango_puntuacion: '',
    rango_fecha: '',
    fecha_desde: '',
    fecha_hasta: '',
  }
  cargarCalificaciones(1)
}

function formatearFecha(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function calcularPromedios() {
  if (calificaciones.value.length === 0) return { promedio: 0, total: 0 }

  const suma = calificaciones.value.reduce((acc, cal) => acc + cal.puntuacion, 0)
  const promedio = (suma / calificaciones.value.length).toFixed(1)

  return {
    promedio,
    total: calificaciones.value.length,
  }
}

function renderEstrellas(puntuacion) {
  return '⭐'.repeat(puntuacion) + '☆'.repeat(5 - puntuacion)
}
</script>

<template>
  <div class="calificaciones-view">
    <div class="page-header">
      <div>
        <h1>Gestión de Calificaciones</h1>
        <p>Supervisa y modera las reseñas del sistema</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filtros-card">
      <!-- Primera fila de filtros -->
      <div class="filtros-row">
        <div class="filtro-item">
          <label>Buscar en comentarios</label>
          <input
            v-model="filtros.buscar"
            type="text"
            placeholder="Palabra clave..."
            @keyup.enter="aplicarFiltros"
          />
        </div>

        <div class="filtro-item">
          <label>Filtrar por Puntuación</label>
          <select v-model="filtros.rango_puntuacion">
            <option value="">Todas las puntuaciones</option>
            <option value="negativas">⭐⭐ Negativas (1-2)</option>
            <option value="medias">⭐⭐⭐ Medias (3)</option>
            <option value="altas">⭐⭐⭐⭐⭐ Altas (4-5)</option>
          </select>
        </div>

        <div class="filtro-item">
          <label>Filtro Rápido de Fecha</label>
          <select v-model="filtros.rango_fecha" @change="aplicarFiltros">
            <option value="">Seleccionar rango...</option>
            <option value="hoy">📅 Hoy</option>
            <option value="semana">📅 Última semana</option>
            <option value="mes">📅 Último mes</option>
            <option value="3meses">📅 Últimos 3 meses</option>
          </select>
        </div>
      </div>

      <!-- Segunda fila de filtros -->
      <div class="filtros-row" style="margin-top: 16px">
        <div class="filtro-item">
          <label>Filtrar por Usuario</label>
          <select v-model="filtros.usuario_id">
            <option value="">Todos los usuarios</option>
            <option v-for="usuario in usuarios" :key="usuario.idUsuario" :value="usuario.idUsuario">
              {{ usuario.nombre }} {{ usuario.apellido }} ({{ usuario.email }})
            </option>
          </select>
        </div>

        <div class="filtro-item">
          <label>Filtrar por Servicio</label>
          <select v-model="filtros.servicio_id">
            <option value="">Todos los servicios</option>
            <option
              v-for="servicio in servicios"
              :key="servicio.idServicio"
              :value="servicio.idServicio"
            >
              {{ servicio.titulo }}
            </option>
          </select>
        </div>

        <div class="filtro-actions">
          <button @click="aplicarFiltros" class="btn-primary">Buscar</button>
          <button @click="limpiarFiltros" class="btn-secondary">Limpiar</button>
        </div>
      </div>

      <!-- Tercera fila: Fechas personalizadas -->
      <div class="filtros-fecha" v-if="!filtros.rango_fecha">
        <div class="fecha-divider">
          <span>Selecciona rango de fechas</span>
        </div>
        <div class="fecha-inputs">
          <div class="filtro-item">
            <label>Fecha desde</label>
            <input v-model="filtros.fecha_desde" type="date" />
          </div>
          <span class="fecha-separator">hasta</span>
          <div class="filtro-item">
            <label>Fecha hasta</label>
            <input v-model="filtros.fecha_hasta" type="date" />
          </div>
        </div>
      </div>
    </div>

    <!-- Stats rápidas -->
    <div class="stats-quick">
      <div class="stat-quick">
        <span class="stat-label">Total Calificaciones</span>
        <span class="stat-value">{{ paginacion.total }}</span>
      </div>
      <div class="stat-quick promedio">
        <span class="stat-label">Promedio General</span>
        <span class="stat-value">{{ calcularPromedios().promedio }} ⭐</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando calificaciones...</p>
    </div>

    <!-- Grid de calificaciones -->
    <div v-else class="calificaciones-grid">
      <div
        v-for="calificacion in calificaciones"
        :key="calificacion.idCalificacion"
        class="calificacion-card"
      >
        <div class="calificacion-header">
          <div class="usuario-info">
            <div class="avatar">
              {{ calificacion.usuario?.nombre?.[0] }}{{ calificacion.usuario?.apellido?.[0] }}
            </div>
            <div class="usuario-detalles">
              <span class="nombre"
                >{{ calificacion.usuario?.nombre }} {{ calificacion.usuario?.apellido }}</span
              >
              <span class="fecha">{{ formatearFecha(calificacion.fecha) }}</span>
            </div>
          </div>

          <div class="puntuacion">
            <span class="estrellas">{{ renderEstrellas(calificacion.puntuacion) }}</span>
            <span class="numero">{{ calificacion.puntuacion }}/5</span>
          </div>
        </div>

        <div class="servicio-info">
          <span class="label">Servicio:</span>
          <span class="titulo">{{ calificacion.servicio?.titulo || 'N/A' }}</span>
        </div>

        <div class="comentario-box">
          <p>{{ calificacion.comentario || 'Sin comentario' }}</p>
        </div>

        <div class="calificacion-actions">
          <button @click="verDetalles(calificacion)" class="btn-ver">👁️ Ver detalles</button>
          <button @click="confirmarEliminar(calificacion)" class="btn-eliminar">🗑️ Eliminar</button>
        </div>
      </div>

      <!-- Sin resultados -->
      <div v-if="calificaciones.length === 0" class="no-results">
        <p>No se encontraron calificaciones</p>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="paginacion.last_page > 1" class="pagination">
      <button
        @click="cargarCalificaciones(paginacion.current_page - 1)"
        :disabled="paginacion.current_page === 1"
        class="btn-pagination"
      >
        ← Anterior
      </button>

      <span class="pagination-info">
        Página {{ paginacion.current_page }} de {{ paginacion.last_page }}
      </span>

      <button
        @click="cargarCalificaciones(paginacion.current_page + 1)"
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
          <h2>Detalles de la Calificación</h2>
          <button @click="cerrarDetalles" class="btn-close">✕</button>
        </div>

        <div v-if="calificacionSeleccionada" class="modal-body">
          <div class="detail-section">
            <h3>Calificación</h3>
            <div class="puntuacion-detalle">
              <span class="estrellas-grande">{{
                renderEstrellas(calificacionSeleccionada.puntuacion)
              }}</span>
              <span class="numero-grande">{{ calificacionSeleccionada.puntuacion }}/5</span>
            </div>
          </div>

          <div class="detail-section">
            <h3>Usuario</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Nombre</label>
                <p>
                  {{ calificacionSeleccionada.usuario?.nombre }}
                  {{ calificacionSeleccionada.usuario?.apellido }}
                </p>
              </div>
              <div class="detail-item">
                <label>Email</label>
                <p>{{ calificacionSeleccionada.usuario?.email }}</p>
              </div>
              <div class="detail-item">
                <label>Fecha</label>
                <p>{{ formatearFecha(calificacionSeleccionada.fecha) }}</p>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Servicio</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Título</label>
                <p>{{ calificacionSeleccionada.servicio?.titulo || 'N/A' }}</p>
              </div>
              <div class="detail-item">
                <label>Proveedor</label>
                <p>
                  {{ calificacionSeleccionada.servicio?.usuario?.nombre }}
                  {{ calificacionSeleccionada.servicio?.usuario?.apellido }}
                </p>
              </div>
              <div class="detail-item">
                <label>Precio</label>
                <p>
                  ${{ Number(calificacionSeleccionada.servicio?.precio).toLocaleString('es-ES') }}
                </p>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Comentario</h3>
            <div class="comentario-completo">
              <p>{{ calificacionSeleccionada.comentario || 'Sin comentario' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <ConfirmModal
      v-if="mostrarConfirmEliminar"
      titulo="Eliminar Calificación"
      :mensaje="`¿Estás seguro de eliminar esta calificación?\n\nEsta acción no se puede deshacer.`"
      texto-confirmar="Sí, eliminar"
      texto-cancelar="Cancelar"
      tipo="danger"
      @confirm="eliminarCalificacion"
      @cancel="cancelarEliminar"
    />
  </div>
</template>

<style scoped>
.calificaciones-view {
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

.filtro-item select {
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

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
  border-left: 4px solid #667eea;
}

.stat-quick.promedio {
  border-left-color: #fbbf24;
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

.calificaciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.calificacion-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.calificacion-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.calificacion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.usuario-info {
  display: flex;
  align-items: center;
  gap: 12px;
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

.usuario-detalles {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nombre {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.fecha {
  font-size: 12px;
  color: #9ca3af;
}

.puntuacion {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.estrellas {
  font-size: 16px;
}

.numero {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.servicio-info {
  margin-bottom: 12px;
  font-size: 14px;
}

.servicio-info .label {
  color: #6b7280;
  font-weight: 500;
}

.servicio-info .titulo {
  color: #1f2937;
  font-weight: 600;
}

.comentario-box {
  background: #f9fafb;
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  min-height: 80px;
}

.comentario-box p {
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.calificacion-actions {
  display: flex;
  gap: 8px;
}

.btn-ver,
.btn-eliminar {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ver {
  background: #f3f4f6;
  color: #374151;
}

.btn-ver:hover {
  background: #e5e7eb;
}

.btn-eliminar {
  background: #fee2e2;
  color: #dc2626;
}

.btn-eliminar:hover {
  background: #fecaca;
}

.no-results {
  grid-column: 1 / -1;
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

.puntuacion-detalle {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 12px;
}

.estrellas-grande {
  font-size: 32px;
}

.numero-grande {
  font-size: 28px;
  font-weight: 700;
  color: white;
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

.comentario-completo {
  background: #f9fafb;
  padding: 20px;
  border-radius: 12px;
}

.comentario-completo p {
  color: #374151;
  font-size: 15px;
  line-height: 1.7;
  margin: 0;
}

.filtros-fecha {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.fecha-divider {
  text-align: center;
  margin-bottom: 12px;
}

.fecha-divider span {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
}

.fecha-inputs {
  display: flex;
  align-items: end;
  gap: 12px;
}

.fecha-separator {
  padding-bottom: 10px;
  color: #6b7280;
  font-weight: 600;
  font-size: 14px;
}

.filtro-item input[type='date'] {
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.filtro-item input[type='date']:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filtro-item input[type='text'] {
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.filtro-item input[type='text']:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

@media (max-width: 768px) {
  .filtros-row {
    grid-template-columns: 1fr;
  }

  .calificaciones-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
