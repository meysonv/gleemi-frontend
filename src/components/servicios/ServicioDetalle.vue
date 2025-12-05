<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFavoritosStore } from '@/stores/favoritos'
import { useNotificationsStore } from '@/stores/notifications'
import { getImagenesUrls } from '@/utils/storage'
import api from '@/services/api'
import CalificacionesList from '@/components/calificaciones/CalificacionesList.vue'
import CalificacionForm from '@/components/calificaciones/CalificacionForm.vue'
import BaseModal from '@/components/common/Modal.vue'

const props = defineProps({
  servicio: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['contactar', 'close'])

const authStore = useAuthStore()
const favoritosStore = useFavoritosStore()
const notifications = useNotificationsStore()

const imagenActual = ref(0)
const imagenesUrls = computed(() => getImagenesUrls(props.servicio.imagenes))

// Calificaciones
const calificaciones = ref([])
const promedio = ref(0)
const totalCalificaciones = ref(0)
const loadingCalificaciones = ref(false)
const miCalificacion = ref(null)
const mostrarFormCalificacion = ref(false)
const calificacionEditando = ref(null)

onMounted(() => {
  cargarCalificaciones()
  if (authStore.estaAutenticado) {
    // ← CAMBIO AQUÍ
    cargarMiCalificacion()
  }
})

async function cargarCalificaciones() {
  loadingCalificaciones.value = true
  try {
    const response = await api.get(`/calificaciones/servicio/${props.servicio.idServicio}`)
    if (response.data.success) {
      calificaciones.value = response.data.data.calificaciones
      promedio.value = response.data.data.promedio
      totalCalificaciones.value = response.data.data.total
    }
  } catch (error) {
    console.error('Error al cargar calificaciones:', error)
  } finally {
    loadingCalificaciones.value = false
  }
}

async function cargarMiCalificacion() {
  try {
    const response = await api.get(`/calificaciones/mi-calificacion/${props.servicio.idServicio}`)
    if (response.data.success) {
      miCalificacion.value = response.data.data
    }
  } catch (error) {
    console.error('Error al cargar mi calificación:', error)
  }
}

function abrirFormCalificar() {
  calificacionEditando.value = null
  mostrarFormCalificacion.value = true
}

function abrirFormEditar(calificacion) {
  calificacionEditando.value = calificacion
  mostrarFormCalificacion.value = true
}

function cerrarFormCalificacion() {
  mostrarFormCalificacion.value = false
  calificacionEditando.value = null
}

async function guardarCalificacion(data) {
  try {
    let response

    if (calificacionEditando.value) {
      response = await api.put(`/calificaciones/${calificacionEditando.value.idCalificacion}`, data)
      notifications.success('¡Actualizado!', 'Tu calificación ha sido actualizada')
    } else {
      response = await api.post('/calificaciones', data)
      notifications.success('¡Calificación enviada!', 'Gracias por tu opinión')
    }

    if (response.data.success) {
      cerrarFormCalificacion()
      await cargarCalificaciones()
      await cargarMiCalificacion()
    }
  } catch (error) {
    console.error('Error al guardar calificación:', error)
    const mensaje = error.response?.data?.message || 'No se pudo enviar la calificación'
    notifications.error('Error', mensaje)
  }
}

async function eliminarCalificacion(calificacion) {
  if (!confirm('¿Estás seguro de que quieres eliminar tu calificación?')) return

  try {
    const response = await api.delete(`/calificaciones/${calificacion.idCalificacion}`)
    if (response.data.success) {
      notifications.success('Eliminado', 'Tu calificación ha sido eliminada')
      await cargarCalificaciones()
      miCalificacion.value = null
    }
  } catch (error) {
    console.error('Error al eliminar calificación:', error)
    notifications.error('Error', 'No se pudo eliminar la calificación')
  }
}

const esFavorito = computed(() => {
  return favoritosStore.esFavorito(props.servicio.idServicio)
})

async function toggleFavorito() {
  console.log('Toggle favorito llamado')

  if (!authStore.estaAutenticado) {
    // ← CAMBIO AQUÍ
    notifications.warning('No autenticado', 'Debes iniciar sesión para agregar favoritos')
    return
  }

  try {
    const resultado = await favoritosStore.toggleFavorito(props.servicio.idServicio)

    if (resultado.success) {
      if (resultado.agregado) {
        notifications.success('Agregado', 'Servicio agregado a favoritos')
      } else {
        notifications.info('Eliminado', 'Servicio eliminado de favoritos')
      }
    } else {
      notifications.error('Error', resultado.message || 'No se pudo actualizar favoritos')
    }
  } catch (error) {
    console.error('Error en toggleFavorito:', error)
    notifications.error('Error', 'No se pudo actualizar favoritos')
  }
}

function contactar() {
  console.log('Contactar llamado')

  if (!authStore.estaAutenticado) {
    // ← CAMBIO AQUÍ
    notifications.warning('No autenticado', 'Debes iniciar sesión para contactar al proveedor')
    return
  }

  emit('contactar', props.servicio)
}

function siguienteImagen() {
  imagenActual.value = (imagenActual.value + 1) % imagenesUrls.value.length
}

function anteriorImagen() {
  imagenActual.value =
    imagenActual.value === 0 ? imagenesUrls.value.length - 1 : imagenActual.value - 1
}

function seleccionarImagen(index) {
  imagenActual.value = index
}

const puedeCalificar = computed(() => {
  if (!authStore.estaAutenticado) return false // ← CAMBIO AQUÍ
  if (props.servicio.usuario_id === authStore.user?.idUsuario) return false
  if (miCalificacion.value) return false
  return true
})

const textoBotonCalificar = computed(() => {
  if (!authStore.estaAutenticado) return 'Inicia sesión para calificar' // ← CAMBIO AQUÍ
  if (props.servicio.usuario_id === authStore.user?.idUsuario)
    return 'No puedes calificar tu propio servicio'
  if (miCalificacion.value) return 'Ya calificaste este servicio'
  return 'Calificar servicio'
})
</script>

<template>
  <div class="servicio-detalle">
    <div class="detalle-container">
      <!-- Columna izquierda: Galería -->
      <div class="galeria-section">
        <!-- Imagen principal -->
        <div class="imagen-principal">
          <img :src="imagenesUrls[imagenActual]" :alt="servicio.titulo" />

          <!-- Controles de navegación -->
          <button
            v-if="imagenesUrls.length > 1"
            @click="anteriorImagen"
            class="btn-nav btn-prev"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <button
            v-if="imagenesUrls.length > 1"
            @click="siguienteImagen"
            class="btn-nav btn-next"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <!-- Contador de imágenes -->
          <div v-if="imagenesUrls.length > 1" class="contador-imagenes">
            {{ imagenActual + 1 }} / {{ imagenesUrls.length }}
          </div>
        </div>

        <!-- Miniaturas -->
        <div v-if="imagenesUrls.length > 1" class="miniaturas">
          <button
            v-for="(imagen, index) in imagenesUrls"
            :key="index"
            @click="seleccionarImagen(index)"
            class="miniatura"
            :class="{ active: index === imagenActual }"
            type="button"
          >
            <img :src="imagen" :alt="`Imagen ${index + 1}`" />
          </button>
        </div>
      </div>

      <!-- Columna derecha: Información Y Calificaciones -->
      <div class="info-section">
        <!-- Usuario proveedor -->
        <div class="proveedor-info">
          <div class="proveedor-avatar">
            <img
              v-if="servicio.usuario?.foto"
              :src="servicio.usuario.foto"
              :alt="servicio.usuario.nombre"
            />
            <span v-else class="avatar-placeholder">
              {{ servicio.usuario?.nombre?.charAt(0) }}{{ servicio.usuario?.apellido?.charAt(0) }}
            </span>
          </div>
          <div class="proveedor-detalles">
            <p class="proveedor-nombre">
              {{ servicio.usuario?.nombre }} {{ servicio.usuario?.apellido }}
            </p>
            <p class="proveedor-email">{{ servicio.usuario?.email }}</p>
          </div>
        </div>

        <!-- Título y precio -->
        <div class="titulo-precio">
          <h1 class="titulo">{{ servicio.titulo }}</h1>
          <div class="precio-container">
            <span class="precio-label">Precio del servicio</span>
            <span class="precio">${{ Number(servicio.precio).toLocaleString('es-CO') }}</span>
          </div>
        </div>

        <!-- Descripción -->
        <div class="descripcion-container">
          <h3>Descripción</h3>
          <p class="descripcion">{{ servicio.descripcion }}</p>
        </div>

        <!-- Estado -->
        <div class="estado-container">
          <span class="estado-label">Estado:</span>
          <span class="estado-badge" :class="servicio.estado">
            {{ servicio.estado }}
          </span>
        </div>

        <!-- Acciones -->
        <div class="acciones">
          <button
            @click="toggleFavorito"
            class="btn-favorito"
            :class="{ activo: esFavorito }"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                :fill="esFavorito ? 'currentColor' : 'none'"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            {{ esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos' }}
          </button>

          <button @click="contactar" class="btn-contactar" type="button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
                fill="currentColor"
              />
            </svg>
            Contactar proveedor
          </button>
        </div>

        <!-- Sección de calificaciones DENTRO de info-section -->
        <div class="seccion-calificaciones">
          <div class="calificaciones-header">
            <h3>Calificaciones y reseñas</h3>
            <button
              v-if="puedeCalificar"
              @click="abrirFormCalificar"
              class="btn-calificar"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="currentColor"
                />
              </svg>
              Calificar servicio
            </button>
            <button
              v-else-if="miCalificacion"
              @click="abrirFormEditar(miCalificacion)"
              class="btn-calificar-secondary"
              type="button"
            >
              Editar mi calificación
            </button>
            <span v-else class="texto-no-puede-calificar">
              {{ textoBotonCalificar }}
            </span>
          </div>

          <CalificacionesList
            :calificaciones="calificaciones"
            :promedio="promedio"
            :total="totalCalificaciones"
            :loading="loadingCalificaciones"
            @editar="abrirFormEditar"
            @eliminar="eliminarCalificacion"
          />
        </div>
      </div>
    </div>

    <!-- Modal de calificación -->
    <BaseModal v-if="mostrarFormCalificacion" max-width="600px" @close="cerrarFormCalificacion">
      <CalificacionForm
        :calificacion="calificacionEditando"
        :servicio-id="servicio.idServicio"
        @guardar="guardarCalificacion"
        @cancelar="cerrarFormCalificacion"
      />
    </BaseModal>
  </div>
</template>

<style scoped>
.servicio-detalle {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.detalle-container {
  display: grid;
  grid-template-columns: 500px 1fr; /* ← Columna izquierda fija, derecha flexible */
  gap: 40px;
  padding: 40px;
  overflow-y: auto;
  flex: 1;
}

/* Galería - Columna izquierda */
.galeria-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 0;
  height: fit-content;
}

.imagen-principal {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.imagen-principal img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.btn-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
}

.btn-nav:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: translateY(-50%) scale(1.1);
}

.btn-prev {
  left: 16px;
}

.btn-next {
  right: 16px;
}

.contador-imagenes {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  z-index: 2;
}

.miniaturas {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0;
}

.miniaturas::-webkit-scrollbar {
  height: 6px;
}

.miniaturas::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.miniaturas::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.miniaturas::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.miniatura {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f3f4f6;
}

.miniatura img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.miniatura:hover {
  border-color: #667eea50;
}

.miniatura.active {
  border-color: #667eea;
}

/* Información - Columna derecha CON calificaciones */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0; /* ← Importante para que funcione el scroll horizontal */
}

.proveedor-info {
  display: flex;
  gap: 16px;
  align-items: center;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.proveedor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.proveedor-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-weight: 700;
  font-size: 24px;
  text-transform: uppercase;
}

.proveedor-detalles {
  flex: 1;
  min-width: 0;
}

.proveedor-nombre {
  font-weight: 700;
  font-size: 18px;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.proveedor-email {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.titulo-precio {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.titulo {
  font-size: 32px;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

.precio-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.precio-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.precio {
  font-size: 36px;
  font-weight: 800;
  color: #667eea;
}

.descripcion-container h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.descripcion {
  color: #4b5563;
  font-size: 16px;
  line-height: 1.7;
  margin: 0;
}

.estado-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.estado-label {
  font-weight: 600;
  color: #6b7280;
}

.estado-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-badge.activo {
  background: #dcfce7;
  color: #16a34a;
}

.estado-badge.inactivo {
  background: #fee2e2;
  color: #dc2626;
}

.acciones {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-favorito,
.btn-contactar {
  width: 100%;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-favorito {
  background: white;
  color: #dc2626;
  border: 2px solid #fecaca;
}

.btn-favorito:hover {
  background: #fef2f2;
  border-color: #dc2626;
}

.btn-favorito.activo {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}

.btn-contactar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-contactar:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* Calificaciones - DENTRO de info-section */
.seccion-calificaciones {
  margin-top: 20px;
  padding-top: 40px;
  border-top: 2px solid #e5e7eb;
}

.calificaciones-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.calificaciones-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.btn-calificar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-calificar:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-calificar-secondary {
  padding: 10px 20px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-calificar-secondary:hover {
  background: #f3f4f6;
}

.texto-no-puede-calificar {
  color: #9ca3af;
  font-size: 14px;
  font-style: italic;
}

/* Scrollbar personalizado */
.detalle-container::-webkit-scrollbar {
  width: 10px;
}

.detalle-container::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.detalle-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 5px;
}

.detalle-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

@media (max-width: 968px) {
  .detalle-container {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 24px;
  }

  .galeria-section {
    position: static;
  }

  .imagen-principal {
    height: 300px;
  }

  .titulo {
    font-size: 24px;
  }

  .precio {
    font-size: 28px;
  }

  .calificaciones-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-calificar,
  .btn-calificar-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
