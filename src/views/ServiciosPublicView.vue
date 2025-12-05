<script setup>
import { ref, onMounted } from 'vue'
import { useServiciosStore } from '@/stores/servicios'
import NavbarPublic from '@/components/layout/NavbarPublic.vue'
import ServicioCard from '@/components/servicios/ServicioCard.vue'
import ServicioDetalle from '@/components/servicios/ServicioDetalle.vue'
import SidebarFiltros from '@/components/layout/SidebarFiltros.vue'
import BaseModal from '@/components/common/Modal.vue'

const serviciosStore = useServiciosStore()

const servicioSeleccionado = ref(null)
const mostrarDetalle = ref(false)

onMounted(() => {
  serviciosStore.cargarServicios()
})

function verDetalle(servicio) {
  console.time('Abrir modal público') // ← Debug temporal
  servicioSeleccionado.value = servicio
  mostrarDetalle.value = true

  setTimeout(() => {
    console.timeEnd('Abrir modal público')
  }, 0)
}

function cerrarDetalle() {
  mostrarDetalle.value = false
  servicioSeleccionado.value = null
}

function aplicarFiltros(filtros) {
  serviciosStore.aplicarFiltros(filtros)
}
</script>

<template>
  <div class="servicios-page">
    <NavbarPublic />

    <div class="page-container">
      <!-- Sidebar de filtros -->
      <SidebarFiltros @aplicar-filtros="aplicarFiltros" :autenticado="false" />

      <!-- Contenido principal -->
      <main class="main-content">
        <div class="content-header">
          <h1>Servicios de Limpieza</h1>
          <p>Encuentra el servicio perfecto para tus necesidades</p>
        </div>

        <!-- Loading -->
        <div v-if="serviciosStore.loading" class="loading">
          <div class="spinner"></div>
          <p>Cargando servicios...</p>
        </div>

        <!-- Sin servicios -->
        <div v-else-if="serviciosStore.servicios.length === 0" class="no-servicios">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" fill="#f3f4f6" />
            <path
              d="M45 55C45 52.2386 47.2386 50 50 50H70C72.7614 50 75 52.2386 75 55V75C75 77.7614 72.7614 80 70 80H50C47.2386 80 45 77.7614 45 75V55Z"
              stroke="#9ca3af"
              stroke-width="3"
              fill="none"
            />
            <circle cx="55" cy="62" r="3" fill="#9ca3af" />
            <circle cx="65" cy="62" r="3" fill="#9ca3af" />
            <path d="M52 70Q60 75 68 70" stroke="#9ca3af" stroke-width="2" fill="none" />
          </svg>
          <h3>No se encontraron servicios</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
        </div>

        <!-- Grid de servicios -->
        <div v-else class="servicios-grid">
          <ServicioCard
            v-for="servicio in serviciosStore.servicios"
            :key="servicio.idServicio"
            :servicio="servicio"
            @ver-detalle="verDetalle"
            :autenticado="false"
          />
        </div>

        <!-- Paginación (opcional) -->
        <div v-if="serviciosStore.servicios.length > 0" class="pagination">
          <p class="results-count">Mostrando {{ serviciosStore.servicios.length }} servicios</p>
        </div>
      </main>
    </div>
  </div>

  <!-- Modal de detalle -->
  <BaseModal v-if="mostrarDetalle" max-width="1200px" @close="cerrarDetalle">
    <ServicioDetalle
      v-if="servicioSeleccionado"
      :servicio="servicioSeleccionado"
      :autenticado="false"
      @close="cerrarDetalle"
    />
  </BaseModal>
</template>

<style scoped>
.servicios-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 24px;
  padding: 24px;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.content-header {
  margin-bottom: 32px;
}

.content-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.content-header p {
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

.loading p {
  color: #6b7280;
  font-size: 16px;
}

.no-servicios {
  text-align: center;
  padding: 80px 20px;
}

.no-servicios svg {
  margin-bottom: 24px;
}

.no-servicios h3 {
  font-size: 24px;
  color: #1f2937;
  margin-bottom: 8px;
}

.no-servicios p {
  color: #6b7280;
  font-size: 16px;
}

.servicios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.pagination {
  padding: 24px;
  text-align: center;
}

.results-count {
  color: #6b7280;
  font-size: 14px;
}

@media (max-width: 968px) {
  .page-container {
    flex-direction: column;
  }

  .servicios-grid {
    grid-template-columns: 1fr;
  }
}
</style>
