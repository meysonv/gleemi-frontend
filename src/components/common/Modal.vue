<script setup>
import { onMounted, onUnmounted } from 'vue'

defineOptions({
  name: 'BaseModal',
})

defineProps({
  maxWidth: {
    type: String,
    default: '800px',
  },
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}

function handleEscape(event) {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<template>
  <teleport to="body">
    <div class="modal-wrapper">
      <div class="modal-overlay" @click="close">
        <div class="modal-container" :style="{ maxWidth }" @click.stop>
          <slot></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000; /* ← Aumentar z-index */
  animation: fadeIn 0.2s ease; /* ← Animación más rápida */
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75); /* ← Overlay más oscuro */
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001; /* ← Asegurar que esté arriba */
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  width: 100%;
  margin: auto;
  animation: modalSlideIn 0.2s ease; /* ← Animación más rápida */
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative; /* ← Importante */
  z-index: 10002; /* ← Contenedor por encima de todo */
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.98); /* ← Animación más sutil */
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
    align-items: flex-start;
  }

  .modal-container {
    margin-top: 20px;
  }
}
</style>
