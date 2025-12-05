<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  calificacion: {
    type: Object,
    default: null,
  },
  servicioId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['guardar', 'cancelar'])

const form = ref({
  puntuacion: 0,
  comentario: '',
})

const hoveredStar = ref(0)
const loading = ref(false)
const errors = ref({})

// Cargar datos si es edición
watch(
  () => props.calificacion,
  (calificacion) => {
    if (calificacion) {
      form.value = {
        puntuacion: calificacion.puntuacion || 0,
        comentario: calificacion.comentario || '',
      }
    }
  },
  { immediate: true },
)

const estrellas = computed(() => {
  return Array.from({ length: 5 }, (_, i) => i + 1)
})

function seleccionarPuntuacion(puntuacion) {
  form.value.puntuacion = puntuacion
  errors.value.puntuacion = null
}

function validar() {
  errors.value = {}

  if (form.value.puntuacion === 0) {
    errors.value.puntuacion = 'Selecciona una puntuación'
  }

  if (form.value.comentario && form.value.comentario.length > 500) {
    errors.value.comentario = 'El comentario no puede tener más de 500 caracteres'
  }

  return Object.keys(errors.value).length === 0
}

async function guardar() {
  if (loading.value) return
  if (!validar()) return

  loading.value = true

  try {
    emit('guardar', {
      servicio_id: props.servicioId,
      ...form.value,
    })
  } finally {
    loading.value = false
  }
}

function cancelar() {
  emit('cancelar')
}
</script>

<template>
  <div class="calificacion-form">
    <!-- Header -->
    <div class="form-header">
      <h2>{{ calificacion ? 'Editar calificación' : 'Calificar servicio' }}</h2>
      <button @click="cancelar" class="btn-close" :disabled="loading">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6L18 18M6 18L18 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <!-- Formulario -->
    <div class="form-content">
      <form @submit.prevent="guardar">
        <!-- Puntuación -->
        <div class="form-group">
          <label>Puntuación *</label>
          <div class="estrellas-selector">
            <button
              v-for="estrella in estrellas"
              :key="estrella"
              type="button"
              class="estrella-btn"
              @click="seleccionarPuntuacion(estrella)"
              @mouseenter="hoveredStar = estrella"
              @mouseleave="hoveredStar = 0"
            >
              <svg width="40" height="40" viewBox="0 0 24 24">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  :fill="estrella <= (hoveredStar || form.puntuacion) ? '#fbbf24' : '#e5e7eb'"
                  :class="{ 'star-pulse': estrella === hoveredStar }"
                />
              </svg>
            </button>
          </div>
          <div class="puntuacion-texto">
            <span v-if="form.puntuacion === 0">Selecciona tu puntuación</span>
            <span v-else-if="form.puntuacion === 1" class="texto-puntuacion malo">Muy malo</span>
            <span v-else-if="form.puntuacion === 2" class="texto-puntuacion regular">Malo</span>
            <span v-else-if="form.puntuacion === 3" class="texto-puntuacion bueno">Regular</span>
            <span v-else-if="form.puntuacion === 4" class="texto-puntuacion muy-bueno">Bueno</span>
            <span v-else-if="form.puntuacion === 5" class="texto-puntuacion excelente"
              >Excelente</span
            >
          </div>
          <span v-if="errors.puntuacion" class="error-message">{{ errors.puntuacion }}</span>
        </div>

        <!-- Comentario -->
        <div class="form-group">
          <label for="comentario">Comentario (opcional)</label>
          <textarea
            id="comentario"
            v-model="form.comentario"
            rows="4"
            placeholder="Cuéntanos tu experiencia con este servicio..."
            maxlength="500"
            :disabled="loading"
            :class="{ error: errors.comentario }"
          ></textarea>
          <div class="contador">{{ form.comentario.length }}/500 caracteres</div>
          <span v-if="errors.comentario" class="error-message">{{ errors.comentario }}</span>
        </div>

        <!-- Acciones -->
        <div class="form-actions">
          <button type="button" @click="cancelar" class="btn-cancelar" :disabled="loading">
            Cancelar
          </button>
          <button type="submit" class="btn-guardar" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Enviando...' : calificacion ? 'Actualizar' : 'Enviar calificación' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.calificacion-form {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  max-width: 600px;
  margin: 0 auto;
}

.form-header {
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.form-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.btn-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.3s ease;
}

.btn-close:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.btn-close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-content {
  padding: 32px;
}

.form-group {
  margin-bottom: 28px;
}

label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  font-size: 15px;
}

.estrellas-selector {
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 20px 0;
}

.estrella-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s ease;
}

.estrella-btn:hover {
  transform: scale(1.15);
}

.estrella-btn:active {
  transform: scale(0.95);
}

.star-pulse {
  animation: pulse 0.3s ease;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.puntuacion-texto {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  margin-top: 8px;
  min-height: 28px;
}

.texto-puntuacion {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 20px;
}

.malo {
  background: #fee2e2;
  color: #dc2626;
}

.regular {
  background: #fed7aa;
  color: #ea580c;
}

.bueno {
  background: #fef3c7;
  color: #d97706;
}

.muy-bueno {
  background: #dbeafe;
  color: #2563eb;
}

.excelente {
  background: #dcfce7;
  color: #16a34a;
}

textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
}

textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

textarea:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}

textarea.error {
  border-color: #ef4444;
}

.contador {
  text-align: right;
  font-size: 13px;
  color: #9ca3af;
  margin-top: 6px;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 13px;
  margin-top: 8px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancelar,
.btn-guardar {
  flex: 1;
  padding: 14px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-cancelar {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancelar:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.btn-guardar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-guardar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-guardar:disabled,
.btn-cancelar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .form-header {
    padding: 20px 24px;
  }

  .form-content {
    padding: 24px;
  }

  .estrellas-selector {
    gap: 4px;
  }

  .estrella-btn svg {
    width: 36px;
    height: 36px;
  }
}
</style>
