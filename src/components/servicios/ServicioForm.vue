<script setup>
import { ref, watch, onMounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { getStorageUrl } from '@/utils/storage'
import ImageUpload from '@/components/common/ImageUpload.vue'

const props = defineProps({
  servicio: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['guardar', 'cancelar'])
const notifications = useNotificationsStore()

const form = ref({
  titulo: '',
  descripcion: '',
  precio: '',
  imagenes: [],
})

const errors = ref({})
const loading = ref(false)

// Cargar datos del servicio cuando se monta o cuando cambia la prop
async function cargarDatosServicio() {
  if (props.servicio) {
    console.log('📝 Cargando servicio para editar:', props.servicio)

    // Convertir rutas de imágenes a URLs completas para preview
    let imagenesParaPreview = []
    if (Array.isArray(props.servicio.imagenes) && props.servicio.imagenes.length > 0) {
      imagenesParaPreview = props.servicio.imagenes.map((ruta) => {
        // Si ya es una URL completa (base64 o http), usarla directamente
        if (ruta.startsWith('data:') || ruta.startsWith('http')) {
          return ruta
        }
        // Si es una ruta, convertirla a URL completa
        return getStorageUrl(ruta)
      })
    }

    form.value = {
      titulo: props.servicio.titulo || '',
      descripcion: props.servicio.descripcion || '',
      precio: props.servicio.precio || '',
      imagenes: imagenesParaPreview,
    }

    console.log('✅ Imágenes cargadas para preview:', imagenesParaPreview)
  } else {
    // Limpiar formulario para nuevo servicio
    form.value = {
      titulo: '',
      descripcion: '',
      precio: '',
      imagenes: [],
    }
  }
}

// Cargar datos al montar el componente
onMounted(() => {
  cargarDatosServicio()
})

// Recargar si cambia el servicio
watch(
  () => props.servicio,
  () => {
    cargarDatosServicio()
  },
  { immediate: true, deep: true },
)

function validar() {
  errors.value = {}

  if (!form.value.titulo.trim()) {
    errors.value.titulo = 'El título es obligatorio'
  }

  if (!form.value.descripcion.trim()) {
    errors.value.descripcion = 'La descripción es obligatoria'
  }

  if (!form.value.precio || form.value.precio <= 0) {
    errors.value.precio = 'Ingresa un precio válido'
  }

  if (Object.keys(errors.value).length > 0) {
    notifications.warning('Campos incompletos', 'Por favor completa todos los campos requeridos')
    return false
  }

  return true
}

async function guardar() {
  if (loading.value) return
  if (!validar()) return

  loading.value = true

  try {
    console.log('💾 Guardando servicio:', form.value)

    // Las imágenes pueden ser:
    // 1. URLs completas de imágenes existentes (http://localhost:8000/storage/...)
    // 2. Base64 de nuevas imágenes (data:image/...)
    // El backend sabrá diferenciarlas

    emit('guardar', form.value)
  } catch (error) {
    console.error('Error al guardar:', error)
    notifications.error('Error', 'No se pudo guardar el servicio')
    loading.value = false
  }
}

function cancelar() {
  emit('cancelar')
}
</script>

<template>
  <div class="servicio-form">
    <!-- Header del formulario -->
    <div class="form-header">
      <h2>{{ servicio ? 'Editar Servicio' : 'Publicar Nuevo Servicio' }}</h2>
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

    <!-- Formulario con padding -->
    <div class="form-content">
      <form @submit.prevent="guardar">
        <div class="form-group">
          <label for="titulo">Título del servicio *</label>
          <input
            id="titulo"
            v-model="form.titulo"
            type="text"
            placeholder="Ej: Limpieza profunda de oficinas"
            maxlength="150"
            :class="{ error: errors.titulo }"
            :disabled="loading"
          />
          <span v-if="errors.titulo" class="error-message">{{ errors.titulo }}</span>
        </div>

        <div class="form-group">
          <label for="descripcion">Descripción del servicio *</label>
          <textarea
            id="descripcion"
            v-model="form.descripcion"
            rows="5"
            placeholder="Describe detalladamente tu servicio..."
            :class="{ error: errors.descripcion }"
            :disabled="loading"
          ></textarea>
          <span v-if="errors.descripcion" class="error-message">{{ errors.descripcion }}</span>
        </div>

        <div class="form-group">
          <label for="precio">Precio (COP) *</label>
          <div class="input-precio">
            <span class="precio-symbol">$</span>
            <input
              id="precio"
              v-model.number="form.precio"
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              :class="{ error: errors.precio }"
              :disabled="loading"
            />
          </div>
          <span v-if="errors.precio" class="error-message">{{ errors.precio }}</span>
        </div>

        <!-- Componente de upload de imágenes -->
        <ImageUpload v-model="form.imagenes" :max-images="5" />

        <div class="form-actions">
          <button type="button" @click="cancelar" class="btn-cancelar" :disabled="loading">
            Cancelar
          </button>
          <button type="submit" class="btn-guardar" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            {{
              loading
                ? servicio
                  ? 'Actualizando...'
                  : 'Publicando...'
                : servicio
                  ? 'Actualizar servicio'
                  : 'Publicar servicio'
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.servicio-form {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.form-header {
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
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
  flex-shrink: 0;
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
  overflow-y: auto;
  background: white;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

input,
textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
}

input:disabled,
textarea:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input.error,
textarea.error {
  border-color: #ef4444;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.input-precio {
  position: relative;
}

.precio-symbol {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: 600;
  font-size: 16px;
  pointer-events: none;
}

.input-precio input {
  padding-left: 36px;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 13px;
  margin-top: 6px;
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

.btn-cancelar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-guardar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-guardar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-guardar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Loading spinner */
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

/* Scrollbar personalizado */
.form-content::-webkit-scrollbar {
  width: 8px;
}

.form-content::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.form-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.form-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

@media (max-width: 768px) {
  .servicio-form {
    max-height: 100vh;
    border-radius: 0;
  }

  .form-header {
    padding: 20px 24px;
  }

  .form-content {
    padding: 24px;
  }
}
</style>
