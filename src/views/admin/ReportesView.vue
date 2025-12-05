<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useNotificationsStore } from '@/stores/notifications'

const notifications = useNotificationsStore()

const reportes = ref([])
const loading = ref(true)
const generandoReporte = ref(false)

const nuevoReporte = ref({
  tipo: 'usuarios',
  fecha_desde: '',
  fecha_hasta: '',
})

const paginacion = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const tiposReporte = [
  { value: 'usuarios', label: '👥 Usuarios', icon: '👥' },
  { value: 'servicios', label: '🧹 Servicios', icon: '🧹' },
  { value: 'pagos', label: '💳 Pagos', icon: '💳' },
  { value: 'chats', label: '💬 Chats', icon: '💬' },
  { value: 'calificaciones', label: '⭐ Calificaciones', icon: '⭐' },
]

onMounted(async () => {
  await cargarReportes()
  establecerFechasPorDefecto()
})

function establecerFechasPorDefecto() {
  const hoy = new Date()
  const hace30Dias = new Date(hoy)
  hace30Dias.setDate(hace30Dias.getDate() - 30)

  nuevoReporte.value.fecha_hasta = hoy.toISOString().split('T')[0]
  nuevoReporte.value.fecha_desde = hace30Dias.toISOString().split('T')[0]
}

async function cargarReportes(page = 1) {
  loading.value = true
  try {
    const response = await api.get('/admin/reportes', { params: { page } })

    // ← AGREGAR ESTOS CONSOLE.LOG PARA DEBUG
    console.log('Respuesta completa:', response)
    console.log('response.data:', response.data)
    console.log('response.data.data:', response.data.data)

    // La respuesta viene con paginación de Laravel
    const data = response.data.data || response.data

    reportes.value = data.data || []
    paginacion.value = {
      current_page: data.current_page || 1,
      last_page: data.last_page || 1,
      per_page: data.per_page || 15,
      total: data.total || 0,
    }

    console.log('reportes.value:', reportes.value) //debug
    console.log('paginacion.value:', paginacion.value) //debug
  } catch (error) {
    console.error('Error al cargar reportes:', error)
    console.error('Error completo:', error.response?.data) // ← AGREGAR ESTO
    notifications.error('Error al cargar historial de reportes')
  } finally {
    loading.value = false
  }
}

async function generarReporte() {
  if (!nuevoReporte.value.fecha_desde || !nuevoReporte.value.fecha_hasta) {
    notifications.error('Debes seleccionar un rango de fechas')
    return
  }

  generandoReporte.value = true
  try {
    const response = await api.post('/admin/reportes', nuevoReporte.value)
    notifications.success('Reporte generado exitosamente')

    // Descargar el reporte como JSON
    descargarReporte(response.data.data)

    await cargarReportes(1)
  } catch (error) {
    console.error('Error al generar reporte:', error)
    notifications.error('Error al generar reporte')
  } finally {
    generandoReporte.value = false
  }
}

function descargarReporte(data) {
  // Obtener el label sin emoji
  const tipo = nuevoReporte.value.tipo
  const tipoLabel =
    {
      usuarios: 'Usuarios',
      servicios: 'Servicios',
      pagos: 'Pagos',
      chats: 'Chats',
      calificaciones: 'Calificaciones',
    }[tipo] || tipo

  const fecha = new Date().toISOString().split('T')[0]
  const filename = `Reporte_${tipoLabel}_${fecha}.json`

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
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

function obtenerIconoTipo(tipo) {
  return tiposReporte.find((t) => t.value === tipo)?.icon || '📄'
}

function obtenerLabelTipo(tipo) {
  return tiposReporte.find((t) => t.value === tipo)?.label || tipo
}
</script>

<template>
  <div class="reportes-view">
    <div class="page-header">
      <div>
        <h1>Generación de Reportes</h1>
        <p>Crea y descarga reportes del sistema</p>
      </div>
    </div>

    <!-- Formulario de nuevo reporte -->
    <div class="nuevo-reporte-card">
      <div class="card-header">
        <h2>📊 Generar Nuevo Reporte</h2>
        <p>Selecciona el tipo de reporte y el rango de fechas</p>
      </div>

      <div class="form-content">
        <div class="form-row">
          <div class="form-item">
            <label>Tipo de Reporte</label>
            <select v-model="nuevoReporte.tipo">
              <option v-for="tipo in tiposReporte" :key="tipo.value" :value="tipo.value">
                {{ tipo.label }}
              </option>
            </select>
          </div>

          <div class="form-item">
            <label>Fecha desde</label>
            <input v-model="nuevoReporte.fecha_desde" type="date" />
          </div>

          <div class="form-item">
            <label>Fecha hasta</label>
            <input v-model="nuevoReporte.fecha_hasta" type="date" />
          </div>
        </div>

        <button @click="generarReporte" :disabled="generandoReporte" class="btn-generar">
          <span v-if="generandoReporte">⏳ Generando...</span>
          <span v-else>📥 Generar y Descargar Reporte</span>
        </button>
      </div>
    </div>

    <!-- Historial de reportes -->
    <div class="historial-section">
      <div class="section-header">
        <h2>📋 Historial de Reportes</h2>
        <span class="total-badge">{{ paginacion.total }} reportes generados</span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando historial...</p>
      </div>

      <!-- Lista de reportes -->
      <div v-else class="reportes-list">
        <div v-for="reporte in reportes" :key="reporte.idReporte" class="reporte-item">
          <div class="reporte-icon">
            {{ obtenerIconoTipo(reporte.tipo) }}
          </div>

          <div class="reporte-info">
            <h3>{{ obtenerLabelTipo(reporte.tipo) }}</h3>
            <div class="reporte-detalles">
              <span class="detalle">
                <span class="label">Generado por:</span>
                {{ reporte.admin?.nombre }} {{ reporte.admin?.apellido }}
              </span>
              <span class="detalle">
                <span class="label">Fecha:</span>
                {{ formatearFecha(reporte.fechaGeneracion) }}
              </span>
            </div>
            <div class="reporte-parametros" v-if="reporte.parametros">
              <span class="label">Parámetros:</span>
              <code>{{ reporte.parametros }}</code>
            </div>
          </div>

          <div class="reporte-actions">
            <button class="btn-descargar" title="Descargar reporte">📥 Descargar</button>
          </div>
        </div>

        <!-- Sin resultados -->
        <div v-if="reportes.length === 0" class="no-results">
          <div class="no-results-icon">📊</div>
          <h3>No hay reportes generados</h3>
          <p>Genera tu primer reporte usando el formulario de arriba</p>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="paginacion.last_page > 1" class="pagination">
        <button
          @click="cargarReportes(paginacion.current_page - 1)"
          :disabled="paginacion.current_page === 1"
          class="btn-pagination"
        >
          ← Anterior
        </button>

        <span class="pagination-info">
          Página {{ paginacion.current_page }} de {{ paginacion.last_page }}
        </span>

        <button
          @click="cargarReportes(paginacion.current_page + 1)"
          :disabled="paginacion.current_page === paginacion.last_page"
          class="btn-pagination"
        >
          Siguiente →
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reportes-view {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
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

.nuevo-reporte-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #667eea;
}

.card-header {
  margin-bottom: 24px;
}

.card-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.card-header p {
  color: #6b7280;
  font-size: 14px;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-item select,
.form-item input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-item select:focus,
.form-item input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-generar {
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-generar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-generar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.historial-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.section-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}

.total-badge {
  padding: 6px 16px;
  background: #ede9fe;
  color: #7c3aed;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
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

.reportes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reporte-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.reporte-item:hover {
  background: white;
  border-color: #667eea;
  transform: translateX(4px);
}

.reporte-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.reporte-info {
  flex: 1;
}

.reporte-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.reporte-detalles {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
}

.detalle {
  font-size: 14px;
  color: #6b7280;
}

.detalle .label {
  font-weight: 600;
  color: #374151;
}

.reporte-parametros {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 8px;
}

.reporte-parametros .label {
  font-weight: 600;
}

.reporte-parametros code {
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #6b7280;
}

.reporte-actions {
  display: flex;
  gap: 8px;
}

.btn-descargar {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: #667eea;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-descargar:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.no-results {
  text-align: center;
  padding: 80px 20px;
}

.no-results-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.no-results h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.no-results p {
  color: #9ca3af;
  font-size: 14px;
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .reporte-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .reporte-detalles {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
