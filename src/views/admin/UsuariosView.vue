<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useNotificationsStore } from '@/stores/notifications'

const notifications = useNotificationsStore()

const usuarios = ref([])
const loading = ref(true)
const filtros = ref({
  buscar: '',
  rol: '',
  activo: '',
})

const paginacion = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const usuarioSeleccionado = ref(null)
const mostrarDetalles = ref(false)

onMounted(async () => {
  await cargarUsuarios()
})

async function cargarUsuarios(page = 1) {
  loading.value = true
  try {
    const params = {
      page,
      ...filtros.value,
    }

    console.log('📤 Petición:', `/admin/usuarios`, params) // ← AGREGAR

    const response = await api.get('/admin/usuarios', { params })

    console.log('📥 Respuesta completa:', response) // ← AGREGAR
    console.log('📥 Data:', response.data) // ← AGREGAR
    console.log('📥 Usuarios:', response.data.data) // ← AGREGAR

    usuarios.value = response.data.data.data
    paginacion.value = {
      current_page: response.data.data.current_page,
      last_page: response.data.data.last_page,
      per_page: response.data.data.per_page,
      total: response.data.data.total,
    }

    console.log('✅ Usuarios cargados:', usuarios.value) // ← AGREGAR
    console.log('✅ Paginación:', paginacion.value) // ← AGREGAR
  } catch (error) {
    console.error('Error al cargar usuarios:', error)

    console.error('❌ Error completo:', error) // ← CAMBIAR
    console.error('❌ Response:', error.response) // ← AGREGAR

    notifications.error('Error al cargar usuarios')
  } finally {
    loading.value = false
  }
}

async function verDetalles(usuario) {
  try {
    const response = await api.get(`/admin/usuarios/${usuario.idUsuario}`)
    usuarioSeleccionado.value = response.data.data
    mostrarDetalles.value = true
  } catch (error) {
    console.error('Error al cargar detalles:', error)
    notifications.error('Error al cargar detalles del usuario')
  }
}

async function toggleEstado(usuario) {
  try {
    const response = await api.patch(`/admin/usuarios/${usuario.idUsuario}/toggle`)
    notifications.success(response.data.message)
    await cargarUsuarios(paginacion.value.current_page)
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    notifications.error('Error al cambiar estado del usuario')
  }
}

async function eliminarUsuario(usuario) {
  if (!confirm(`¿Estás seguro de eliminar a ${usuario.nombre} ${usuario.apellido}?`)) {
    return
  }

  try {
    const response = await api.delete(`/admin/usuarios/${usuario.idUsuario}`)
    notifications.success(response.data.message)
    await cargarUsuarios(paginacion.value.current_page)
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    notifications.error(error.response?.data?.message || 'Error al eliminar usuario')
  }
}

function aplicarFiltros() {
  cargarUsuarios(1)
}

function limpiarFiltros() {
  filtros.value = {
    buscar: '',
    rol: '',
    activo: '',
  }
  cargarUsuarios(1)
}

function cerrarDetalles() {
  mostrarDetalles.value = false
  usuarioSeleccionado.value = null
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
</script>

<template>
  <div class="usuarios-view">
    <div class="page-header">
      <div>
        <h1>Gestión de Usuarios</h1>
        <p>Administra y supervisa todos los usuarios del sistema</p>
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
            placeholder="Nombre, apellido o email..."
            @keyup.enter="aplicarFiltros"
          />
        </div>

        <div class="filtro-item">
          <label>Rol</label>
          <select v-model="filtros.rol">
            <option value="">Todos</option>
            <option value="registrado">Registrado</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div class="filtro-item">
          <label>Estado</label>
          <select v-model="filtros.activo">
            <option value="">Todos</option>
            <option value="1">Activos</option>
            <option value="0">Inactivos</option>
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
      <p>Cargando usuarios...</p>
    </div>

    <!-- Tabla de usuarios -->
    <div v-else class="usuarios-table-container">
      <table class="usuarios-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.idUsuario">
            <td>{{ usuario.idUsuario }}</td>
            <td>
              <div class="user-info">
                <div class="user-avatar">{{ usuario.nombre[0] }}{{ usuario.apellido[0] }}</div>
                <div>
                  <div class="user-name">{{ usuario.nombre }} {{ usuario.apellido }}</div>
                  <div class="user-phone" v-if="usuario.telefono">{{ usuario.telefono }}</div>
                </div>
              </div>
            </td>
            <td>{{ usuario.email }}</td>
            <td>
              <span class="badge" :class="usuario.rol">
                {{ usuario.rol === 'admin' ? 'Admin' : 'Usuario' }}
              </span>
            </td>
            <td>
              <span class="badge" :class="usuario.activo ? 'activo' : 'inactivo'">
                {{ usuario.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>{{ formatearFecha(usuario.fechaRegistro) }}</td>
            <td>
              <div class="actions">
                <button @click="verDetalles(usuario)" class="btn-icon" title="Ver detalles">
                  👁️
                </button>
                <button
                  @click="toggleEstado(usuario)"
                  class="btn-icon"
                  :title="usuario.activo ? 'Desactivar' : 'Activar'"
                >
                  {{ usuario.activo ? '🔒' : '🔓' }}
                </button>
                <button
                  v-if="usuario.rol !== 'admin'"
                  @click="eliminarUsuario(usuario)"
                  class="btn-icon delete"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Sin resultados -->
      <div v-if="usuarios.length === 0" class="no-results">
        <p>No se encontraron usuarios</p>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="paginacion.last_page > 1" class="pagination">
      <button
        @click="cargarUsuarios(paginacion.current_page - 1)"
        :disabled="paginacion.current_page === 1"
        class="btn-pagination"
      >
        ← Anterior
      </button>

      <span class="pagination-info">
        Página {{ paginacion.current_page }} de {{ paginacion.last_page }}
      </span>

      <button
        @click="cargarUsuarios(paginacion.current_page + 1)"
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
          <h2>Detalles del Usuario</h2>
          <button @click="cerrarDetalles" class="btn-close">✕</button>
        </div>

        <div v-if="usuarioSeleccionado" class="modal-body">
          <div class="detail-section">
            <h3>Información Personal</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Nombre Completo</label>
                <p>{{ usuarioSeleccionado.nombre }} {{ usuarioSeleccionado.apellido }}</p>
              </div>
              <div class="detail-item">
                <label>Email</label>
                <p>{{ usuarioSeleccionado.email }}</p>
              </div>
              <div class="detail-item">
                <label>Teléfono</label>
                <p>{{ usuarioSeleccionado.telefono || 'No especificado' }}</p>
              </div>
              <div class="detail-item">
                <label>Rol</label>
                <p>
                  <span class="badge" :class="usuarioSeleccionado.rol">
                    {{ usuarioSeleccionado.rol }}
                  </span>
                </p>
              </div>
              <div class="detail-item">
                <label>Estado</label>
                <p>
                  <span class="badge" :class="usuarioSeleccionado.activo ? 'activo' : 'inactivo'">
                    {{ usuarioSeleccionado.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </p>
              </div>
              <div class="detail-item">
                <label>Fecha de Registro</label>
                <p>{{ formatearFecha(usuarioSeleccionado.fechaRegistro) }}</p>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Estadísticas</h3>
            <div class="stats-grid">
              <div class="stat-box">
                <span class="stat-number">{{ usuarioSeleccionado.servicios?.length || 0 }}</span>
                <span class="stat-label">Servicios Publicados</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{
                  usuarioSeleccionado.calificaciones?.length || 0
                }}</span>
                <span class="stat-label">Calificaciones Recibidas</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{
                  usuarioSeleccionado.pagos_realizados?.length || 0
                }}</span>
                <span class="stat-label">Pagos Realizados</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{
                  usuarioSeleccionado.pagos_recibidos?.length || 0
                }}</span>
                <span class="stat-label">Pagos Recibidos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.usuarios-view {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  grid-template-columns: 2fr 1fr 1fr auto;
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

.usuarios-table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.usuarios-table {
  width: 100%;
  border-collapse: collapse;
}

.usuarios-table thead {
  background: #f9fafb;
}

.usuarios-table th {
  padding: 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.usuarios-table td {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
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
}

.user-name {
  font-weight: 600;
  color: #1f2937;
}

.user-phone {
  font-size: 12px;
  color: #9ca3af;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge.admin {
  background: #fef3c7;
  color: #d97706;
}

.badge.registrado {
  background: #dbeafe;
  color: #2563eb;
}

.badge.activo {
  background: #dcfce7;
  color: #16a34a;
}

.badge.inactivo {
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

.btn-icon.delete:hover {
  background: #fee2e2;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-box {
  background: #f9fafb;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-box .stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .filtros-row {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .usuarios-table-container {
    overflow-x: auto;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
