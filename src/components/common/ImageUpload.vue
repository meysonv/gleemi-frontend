<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  maxImages: {
    type: Number,
    default: 5,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const imagenes = ref([...props.modelValue])
const dragging = ref(false)

const puedeAgregarMas = computed(() => imagenes.value.length < props.maxImages)

function handleFileInput(event) {
  const files = Array.from(event.target.files)
  procesarArchivos(files)
}

function handleDrop(event) {
  dragging.value = false
  const files = Array.from(event.dataTransfer.files)
  procesarArchivos(files)
}

function procesarArchivos(files) {
  const imagenesRestantes = props.maxImages - imagenes.value.length
  const archivosAProcesar = files.slice(0, imagenesRestantes)

  archivosAProcesar.forEach((file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        imagenes.value.push(e.target.result)
        emit('update:modelValue', imagenes.value)
      }
      reader.readAsDataURL(file)
    }
  })
}

function eliminarImagen(index) {
  imagenes.value.splice(index, 1)
  emit('update:modelValue', imagenes.value)
}

function handleDragOver() {
  // ← Quitar el parámetro completamente
  dragging.value = true
}

function handleDragLeave() {
  dragging.value = false
}
</script>

<template>
  <div class="image-upload">
    <label class="upload-label">Imágenes ({{ imagenes.length }}/{{ maxImages }})</label>

    <!-- Área de drop -->
    <div
      v-if="puedeAgregarMas"
      class="drop-zone"
      :class="{ dragging }"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <input
        type="file"
        multiple
        accept="image/*"
        @change="handleFileInput"
        class="file-input"
        id="file-input"
      />
      <label for="file-input" class="drop-zone-label">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <p class="drop-text">
          <span class="highlight">Haz clic para subir</span> o arrastra imágenes aquí
        </p>
        <p class="drop-hint">PNG, JPG hasta 5MB (máximo {{ maxImages }} imágenes)</p>
      </label>
    </div>

    <!-- Preview de imágenes -->
    <div v-if="imagenes.length > 0" class="images-preview">
      <div v-for="(imagen, index) in imagenes" :key="index" class="image-item">
        <img :src="imagen" :alt="`Imagen ${index + 1}`" />
        <button @click="eliminarImagen(index)" class="btn-remove" type="button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M6 6L14 14M6 14L14 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-upload {
  margin-bottom: 24px;
}

.upload-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  font-size: 14px;
}

.drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s ease;
  background: #f9fafb;
  cursor: pointer;
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
}

.file-input {
  display: none;
}

.drop-zone-label {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.drop-zone svg {
  color: #9ca3af;
}

.drop-text {
  color: #6b7280;
  font-size: 15px;
  margin: 0;
}

.highlight {
  color: #667eea;
  font-weight: 600;
}

.drop-hint {
  color: #9ca3af;
  font-size: 13px;
  margin: 0;
}

.images-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.image-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  border: 2px solid #e5e7eb;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
}

.image-item:hover .btn-remove {
  opacity: 1;
}

.btn-remove:hover {
  background: #dc2626;
  transform: scale(1.1);
}
</style>
