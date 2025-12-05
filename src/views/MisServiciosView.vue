<script setup>
import { ref, onMounted } from 'vue'
import NavbarAuth from '@/components/layout/NavbarAuth.vue'
import ServicioDetalle from '@/components/servicios/ServicioDetalle.vue' // ← AGREGAR
import BaseModal from '@/components/common/Modal.vue' // ← AGREGAR
import api from '@/services/api'
import { getPrimeraImagen } from '@/utils/storage'

const servicios = ref([])
const loading = ref(true)
const mostrarDetalle = ref(false) // ← AGREGAR
const servicioSeleccionado = ref(null) // ← AGREGAR

onMounted(async () => {
  await cargarServicios()
})

async function cargarServicios() {
  loading.value = true
  try {
    const response = await api.get('/chat/servicios-contactados')
    console.log('📦 Servicios contactados:', response.data.data)

    if (response.data.data.length > 0) {
      console.log('🖼️ Imágenes del primer servicio:', response.data.data[0].imagenes)
      console.log('🎯 URL generada:', getPrimeraImagen(response.data.data[0].imagenes))
    }

    servicios.value = response.data.data
  } catch (error) {
    console.error('Error al cargar servicios:', error)
  } finally {
    loading.value = false
  }
}

// ← CAMBIAR ESTA FUNCIÓN
function verServicio(servicio) {
  servicioSeleccionado.value = servicio
  mostrarDetalle.value = true
}

// ← AGREGAR ESTA FUNCIÓN
function cerrarDetalle() {
  mostrarDetalle.value = false
  servicioSeleccionado.value = null
}

function formatearFecha(fecha) {
  if (!fecha) return 'Fecha no disponible'

  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="mis-servicios-page">
    <NavbarAuth />

    <div class="container">
      <div class="page-header">
        <h1>Servicios Contratados</h1>
        <p>Historial de servicios que has contactado</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando servicios...</p>
      </div>

      <!-- Sin servicios -->
      <div v-else-if="servicios.length === 0" class="no-servicios">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="50" fill="#f3f4f6" />
          <rect
            x="40"
            y="45"
            width="40"
            height="30"
            rx="4"
            stroke="#9ca3af"
            stroke-width="3"
            fill="none"
          />
        </svg>
        <h3>No has contactado servicios aún</h3>
        <p>Cuando contactes un servicio desde "Contactar proveedor", aparecerá aquí</p>
        <router-link to="/servicios-auth" class="btn-primary">
          Ver servicios disponibles
        </router-link>
      </div>

      <!-- Lista de servicios -->
      <div v-else class="servicios-list">
        <div
          v-for="servicio in servicios"
          :key="servicio.idServicio"
          class="servicio-item"
          @click="verServicio(servicio)"
        >
          <div class="servicio-info">
            <!-- Imagen del servicio -->
            <div class="servicio-imagen">
              <img
                :src="getPrimeraImagen(servicio.imagenes)"
                :alt="servicio.titulo"
                @error="
                  (e) =>
                    (e.target.src =
                      'https://via.placeholder.com/400x300/667eea/ffffff?text=Sin+Imagen')
                "
              />
            </div>

            <div class="servicio-detalles">
              <h3>{{ servicio.titulo }}</h3>
              <p class="proveedor">
                Proveedor: {{ servicio.usuario?.nombre }} {{ servicio.usuario?.apellido }}
              </p>
              <p class="descripcion">{{ servicio.descripcion }}</p>
              <p class="fecha">Contactado: {{ formatearFecha(servicio.fecha_contacto) }}</p>
            </div>
          </div>

          <div class="servicio-costo">
            <span class="label">Precio</span>
            <span class="monto">${{ Number(servicio.precio).toLocaleString('es-ES') }}</span>
            <span class="estado" :class="servicio.estado">{{ servicio.estado }}</span>
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
  </div>
</template>

<style scoped>
.mis-servicios-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 0px; /* ← AGREGAR para el navbar fijo */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 40px;
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

.no-servicios {
  text-align: center;
  padding: 80px 20px;
}

.no-servicios h3 {
  font-size: 24px;
  color: #1f2937;
  margin: 24px 0 8px;
}

.no-servicios p {
  color: #6b7280;
  margin-bottom: 24px;
}

.btn-primary {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: transform 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.servicios-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.servicio-item {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.servicio-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.servicio-info {
  display: flex;
  gap: 20px;
  align-items: center;
  flex: 1;
}

.servicio-imagen {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.servicio-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.imagen-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.servicio-detalles {
  flex: 1;
  min-width: 0;
}

.servicio-detalles h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}

.servicio-detalles p {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.proveedor {
  font-weight: 500;
  color: #374151;
}

.descripcion {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 500px;
}

.fecha {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 4px;
}

.servicio-costo {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.label {
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.monto {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.estado {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.estado.activo {
  background: #dcfce7;
  color: #16a34a;
}

.estado.inactivo {
  background: #fef3c7;
  color: #ca8a04;
}

.estado.eliminado {
  background: #fee2e2;
  color: #dc2626;
}

@media (max-width: 768px) {
  .servicio-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .servicio-info {
    width: 100%;
  }

  .servicio-costo {
    align-items: flex-start;
    width: 100%;
  }

  .descripcion {
    max-width: 100%;
  }
}
</style>
