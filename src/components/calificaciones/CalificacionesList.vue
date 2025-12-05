<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

defineProps({
  calificaciones: {
    type: Array,
    default: () => [],
  },
  promedio: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['editar', 'eliminar'])

const authStore = useAuthStore()

function getIniciales(nombre, apellido) {
  return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase()
}

function esmiCalificacion(calificacion) {
  return calificacion.usuario_id === authStore.user?.idUsuario
}

function formatearFecha(fecha) {
  const date = new Date(fecha)
  const ahora = new Date()
  const diff = ahora - date
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `Hace ${dias} días`
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`
  if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`
  return date.toLocaleDateString('es-CO')
}

const estrellas = computed(() => {
  return Array.from({ length: 5 }, (_, i) => i + 1)
})
</script>

<template>
  <div class="calificaciones-list">
    <!-- Resumen -->
    <div class="resumen">
      <div class="promedio-container">
        <div class="promedio-numero">{{ promedio }}</div>
        <div class="estrellas-promedio">
          <svg
            v-for="estrella in estrellas"
            :key="estrella"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            :class="{ filled: estrella <= Math.round(promedio) }"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              :fill="estrella <= Math.round(promedio) ? '#fbbf24' : '#e5e7eb'"
            />
          </svg>
        </div>
        <div class="total-reviews">
          {{ total }} {{ total === 1 ? 'calificación' : 'calificaciones' }}
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando calificaciones...</p>
    </div>

    <!-- Sin calificaciones -->
    <div v-else-if="calificaciones.length === 0" class="sin-calificaciones">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="35" fill="#f3f4f6" />
        <path
          d="M40 20l5 10 11 1.5-8 7.5 2 11-10-5.5-10 5.5 2-11-8-7.5 11-1.5 5-10z"
          fill="#9ca3af"
        />
      </svg>
      <h3>Sin calificaciones aún</h3>
      <p>Sé el primero en calificar este servicio</p>
    </div>

    <!-- Lista de calificaciones -->
    <div v-else class="calificaciones-items">
      <div
        v-for="calificacion in calificaciones"
        :key="calificacion.idCalificacion"
        class="calificacion-item"
      >
        <!-- Usuario -->
        <div class="calificacion-header">
          <div class="usuario-info">
            <div class="usuario-avatar">
              <img
                v-if="calificacion.usuario?.foto"
                :src="calificacion.usuario.foto"
                :alt="calificacion.usuario.nombre"
              />
              <span v-else class="avatar-placeholder">
                {{ getIniciales(calificacion.usuario?.nombre, calificacion.usuario?.apellido) }}
              </span>
            </div>
            <div class="usuario-detalles">
              <p class="usuario-nombre">
                {{ calificacion.usuario?.nombre }} {{ calificacion.usuario?.apellido }}
              </p>
              <p class="fecha">{{ formatearFecha(calificacion.fecha) }}</p>
            </div>
          </div>

          <!-- Acciones (solo si es mi calificación) -->
          <div v-if="esmiCalificacion(calificacion)" class="acciones">
            <button @click="emit('editar', calificacion)" class="btn-icon" title="Editar">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              @click="emit('eliminar', calificacion)"
              class="btn-icon btn-danger"
              title="Eliminar"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Puntuación -->
        <div class="calificacion-estrellas">
          <svg
            v-for="estrella in estrellas"
            :key="estrella"
            width="18"
            height="18"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              :fill="estrella <= calificacion.puntuacion ? '#fbbf24' : '#e5e7eb'"
            />
          </svg>
        </div>

        <!-- Comentario -->
        <p v-if="calificacion.comentario" class="comentario">
          {{ calificacion.comentario }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calificaciones-list {
  margin-top: 32px;
}

.resumen {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.promedio-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.promedio-numero {
  font-size: 48px;
  font-weight: 800;
  color: #667eea;
}

.estrellas-promedio {
  display: flex;
  gap: 4px;
}

.total-reviews {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sin-calificaciones {
  text-align: center;
  padding: 60px 20px;
}

.sin-calificaciones svg {
  margin-bottom: 20px;
}

.sin-calificaciones h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.sin-calificaciones p {
  color: #6b7280;
  margin: 0;
}

.calificaciones-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.calificacion-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
}

.calificacion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.usuario-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.usuario-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.usuario-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-weight: 700;
  font-size: 16px;
}

.usuario-detalles {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.usuario-nombre {
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;
  margin: 0;
}

.fecha {
  color: #9ca3af;
  font-size: 13px;
  margin: 0;
}

.acciones {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: #e5e7eb;
  color: #374151;
}

.btn-icon.btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

.calificacion-estrellas {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.comentario {
  color: #4b5563;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .calificacion-item {
    padding: 16px;
  }
}
</style>
