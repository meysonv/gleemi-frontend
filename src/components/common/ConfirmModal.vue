<script setup>
defineProps({
  titulo: {
    type: String,
    default: 'Confirmar acción',
  },
  mensaje: {
    type: String,
    required: true,
  },
  textoConfirmar: {
    type: String,
    default: 'Confirmar',
  },
  textoCancelar: {
    type: String,
    default: 'Cancelar',
  },
  tipo: {
    type: String,
    default: 'danger', // 'danger', 'warning', 'info'
  },
})

const emit = defineEmits(['confirm', 'cancel'])

function confirmar() {
  emit('confirm')
}

function cancelar() {
  emit('cancel')
}
</script>

<template>
  <div class="modal-overlay" @click="cancelar">
    <div class="modal-content" :class="tipo" @click.stop>
      <div class="modal-icon">
        <span v-if="tipo === 'danger'">⚠️</span>
        <span v-else-if="tipo === 'warning'">⚡</span>
        <span v-else>ℹ️</span>
      </div>

      <h2>{{ titulo }}</h2>
      <p>{{ mensaje }}</p>

      <div class="modal-actions">
        <button @click="cancelar" class="btn-cancel">{{ textoCancelar }}</button>
        <button @click="confirmar" class="btn-confirm" :class="tipo">
          {{ textoConfirmar }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 450px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.modal-content h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.modal-content p {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 24px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-cancel,
.btn-confirm {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  min-width: 120px;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm.danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-confirm.danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.btn-confirm.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-confirm.warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
}

.btn-confirm.info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-confirm.info:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}
</style>
