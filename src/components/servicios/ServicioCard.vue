<script setup>
import { computed } from 'vue'
import { getPrimeraImagen } from '@/utils/storage'

const props = defineProps({
  servicio: {
    type: Object,
    required: true,
  },
  esFavorito: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['ver-detalle', 'toggle-favorito'])

const imagenPrincipal = computed(() => {
  return getPrimeraImagen(props.servicio.imagenes)
})

const promedioCalificacion = computed(() => {
  if (!props.servicio.calificaciones || props.servicio.calificaciones.length === 0) {
    return 0
  }

  const suma = props.servicio.calificaciones.reduce((acc, cal) => acc + cal.puntuacion, 0)
  return (suma / props.servicio.calificaciones.length).toFixed(1)
})

const totalCalificaciones = computed(() => {
  return props.servicio.calificaciones?.length || 0
})

const estrellas = computed(() => {
  return Array.from({ length: 5 }, (_, i) => i + 1)
})

function verDetalle() {
  emit('ver-detalle', props.servicio)
}

function toggleFavorito(event) {
  event.stopPropagation()
  emit('toggle-favorito', props.servicio.idServicio)
}
</script>

<template>
  <div class="servicio-card" @click="verDetalle">
    <!-- Imagen -->
    <div class="card-image">
      <img :src="imagenPrincipal" :alt="servicio.titulo" />

      <!-- Botón favorito -->
      <button @click="toggleFavorito" class="btn-favorito" :class="{ activo: esFavorito }">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            :fill="esFavorito ? '#dc2626' : 'none'"
            :stroke="esFavorito ? '#dc2626' : 'white'"
            stroke-width="2"
          />
        </svg>
      </button>

      <!-- Badge de mejor valorado -->
      <div
        v-if="promedioCalificacion >= 4.5 && totalCalificaciones >= 5"
        class="badge-mejor-valorado"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="currentColor"
          />
        </svg>
        Mejor valorado
      </div>
    </div>

    <!-- Contenido -->
    <div class="card-content">
      <h3 class="card-title">{{ servicio.titulo }}</h3>
      <p class="card-descripcion">{{ servicio.descripcion }}</p>

      <!-- Calificación -->
      <div v-if="totalCalificaciones > 0" class="card-rating">
        <div class="estrellas">
          <svg
            v-for="estrella in estrellas"
            :key="estrella"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              :fill="estrella <= Math.round(promedioCalificacion) ? '#fbbf24' : '#e5e7eb'"
            />
          </svg>
        </div>
        <span class="rating-texto">{{ promedioCalificacion }} ({{ totalCalificaciones }})</span>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <div class="proveedor">
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
          <span class="proveedor-nombre">{{ servicio.usuario?.nombre }}</span>
        </div>
        <div class="precio">${{ Number(servicio.precio).toLocaleString('es-CO') }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.servicio-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.servicio-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-image {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.servicio-card:hover .card-image img {
  transform: scale(1.05);
}

.btn-favorito {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
}

.btn-favorito:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.btn-favorito.activo {
  background: rgba(220, 38, 38, 0.1);
  backdrop-filter: blur(8px);
}

.badge-mejor-valorado {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-descripcion {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.estrellas {
  display: flex;
  gap: 2px;
}

.rating-texto {
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
}

.proveedor {
  display: flex;
  align-items: center;
  gap: 8px;
}

.proveedor-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.proveedor-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
}

.proveedor-nombre {
  font-weight: 500;
  color: #6b7280;
  font-size: 14px;
}

.precio {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}
</style>
