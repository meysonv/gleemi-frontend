<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const stats = ref({
  total_usuarios: 0,
  usuarios_activos: 0,
  total_servicios: 0,
  servicios_activos: 0,
  total_pagos: 0,
  monto_total_pagos: 0,
  total_calificaciones: 0,
  promedio_calificaciones: 0,
  total_chats: 0,
})

const loading = ref(true)

onMounted(async () => {
  await cargarEstadisticas()
})

async function cargarEstadisticas() {
  loading.value = true
  try {
    const response = await api.get('/admin/dashboard')
    stats.value = response.data.data
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Resumen general del sistema Gleemi</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando estadísticas...</p>
    </div>

    <!-- Stats Grid -->
    <div v-else class="stats-grid">
      <!-- Usuarios -->
      <div class="stat-card usuarios">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>{{ stats.total_usuarios }}</h3>
          <p>Total Usuarios</p>
          <span class="stat-detail">{{ stats.usuarios_activos }} activos</span>
        </div>
      </div>

      <!-- Servicios -->
      <div class="stat-card servicios">
        <div class="stat-icon">🧹</div>
        <div class="stat-content">
          <h3>{{ stats.total_servicios }}</h3>
          <p>Total Servicios</p>
          <span class="stat-detail">{{ stats.servicios_activos }} activos</span>
        </div>
      </div>

      <!-- Pagos -->
      <div class="stat-card pagos">
        <div class="stat-icon">💳</div>
        <div class="stat-content">
          <h3>{{ stats.total_pagos }}</h3>
          <p>Total Pagos</p>
          <span class="stat-detail"
            >${{ Number(stats.monto_total_pagos).toLocaleString('es-ES') }}</span
          >
        </div>
      </div>

      <!-- Calificaciones -->
      <div class="stat-card calificaciones">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <h3>{{ stats.total_calificaciones }}</h3>
          <p>Total Calificaciones</p>
          <span class="stat-detail">Promedio: {{ stats.promedio_calificaciones }}/5</span>
        </div>
      </div>

      <!-- Chats -->
      <div class="stat-card chats">
        <div class="stat-icon">💬</div>
        <div class="stat-content">
          <h3>{{ stats.total_chats }}</h3>
          <p>Total Mensajes</p>
          <span class="stat-detail">En el sistema</span>
        </div>
      </div>
    </div>

    <!-- Accesos rápidos -->
    <div class="quick-actions">
      <h2>Accesos Rápidos</h2>
      <div class="actions-grid">
        <router-link to="/admin/usuarios" class="action-card">
          <span class="action-icon">👥</span>
          <span class="action-label">Gestionar Usuarios</span>
        </router-link>

        <router-link to="/admin/servicios" class="action-card">
          <span class="action-icon">🧹</span>
          <span class="action-label">Gestionar Servicios</span>
        </router-link>

        <router-link to="/admin/pagos" class="action-card">
          <span class="action-icon">💳</span>
          <span class="action-label">Ver Pagos</span>
        </router-link>

        <router-link to="/admin/reportes" class="action-card">
          <span class="action-icon">📄</span>
          <span class="action-label">Generar Reportes</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}

.stat-card.usuarios .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.servicios .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.pagos .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.calificaciones .stat-icon {
  background: linear-gradient(135deg, #ffd89b 0%, #ff6f61 100%);
}

.stat-card.chats .stat-icon {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-content p {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 8px;
}

.stat-detail {
  display: inline-block;
  padding: 4px 12px;
  background: #f3f4f6;
  border-radius: 12px;
  font-size: 12px;
  color: #374151;
  font-weight: 600;
}

.quick-actions {
  margin-top: 40px;
}

.quick-actions h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.action-icon {
  font-size: 40px;
}

.action-label {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}
</style>
