<script setup>
import { ref } from 'vue'
import { useServiciosStore } from '@/stores/servicios'

defineProps({
  autenticado: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['aplicar-filtros', 'abrir-favoritos', 'abrir-formulario'])

const serviciosStore = useServiciosStore()

const filtros = ref({
  buscar: '',
  precio_min: null,
  precio_max: null,
})

function aplicarFiltros() {
  emit('aplicar-filtros', filtros.value)
}

function limpiarFiltros() {
  filtros.value = {
    buscar: '',
    precio_min: null,
    precio_max: null,
  }
  serviciosStore.limpiarFiltros()
}

function abrirFavoritos() {
  emit('abrir-favoritos')
}

function abrirFormulario() {
  emit('abrir-formulario')
}
</script>

<template>
  <aside class="sidebar">
    <!-- Acciones rápidas (solo para usuarios autenticados) -->
    <div v-if="autenticado" class="acciones-rapidas">
      <button @click="abrirFavoritos" class="btn-accion favoritos">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
        </svg>
        Mis favoritos
      </button>

      <button @click="abrirFormulario" class="btn-accion nuevo">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 4V16M4 10H16"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        Añadir servicio
      </button>
    </div>

    <!-- Filtros -->
    <div class="filtros-container">
      <div class="filtros-header">
        <h3>Filtros</h3>
        <button @click="limpiarFiltros" class="btn-limpiar">Limpiar</button>
      </div>

      <div class="filtro-group">
        <label for="buscar">Buscar</label>
        <input
          id="buscar"
          v-model="filtros.buscar"
          type="text"
          placeholder="Nombre del servicio..."
          @keyup.enter="aplicarFiltros"
        />
      </div>

      <div class="filtro-group">
        <label>Rango de precio</label>
        <div class="precio-inputs">
          <div class="precio-input">
            <span class="prefix">$</span>
            <input
              v-model.number="filtros.precio_min"
              type="number"
              placeholder="Minimo"
              min="0"
              step="10000"
              @keyup.enter="aplicarFiltros"
            />
          </div>
          <span class="separator">-</span>
          <div class="precio-input">
            <span class="prefix">$</span>
            <input
              v-model.number="filtros.precio_max"
              type="number"
              placeholder="Maximo"
              min="0"
              step="10000"
              @keyup.enter="aplicarFiltros"
            />
          </div>
        </div>
      </div>

      <button @click="aplicarFiltros" class="btn-aplicar">Aplicar filtros</button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.acciones-rapidas {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-accion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-accion.favoritos {
  background: white;
  color: #dc2626;
  border: 2px solid #fecaca;
}

.btn-accion.favoritos:hover {
  background: #fef2f2;
  border-color: #dc2626;
  transform: translateY(-2px);
}

.btn-accion.nuevo {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-accion.nuevo:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.filtros-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filtros-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.btn-limpiar {
  background: transparent;
  border: none;
  color: #667eea;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.btn-limpiar:hover {
  color: #5568d3;
  text-decoration: underline;
}

.filtro-group {
  margin-bottom: 20px;
}

.filtro-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.filtro-group input[type='text'],
.filtro-group input[type='number'] {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.filtro-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.precio-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.precio-input {
  position: relative;
  flex: 1;
}

.precio-input .prefix {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: 400;
  font-size: 14px;
  line-height: 1;
  pointer-events: none;
  z-index: 1;
}

.precio-input input {
  padding-left: 22px !important;
  padding-right: 8px !important;
  width: 100%;
}

.precio-input input[type='number']::-webkit-inner-spin-button,
.precio-input input[type='number']::-webkit-outer-spin-button {
  opacity: 1;
  height: 18px;
  margin-left: 4px;
}

.separator {
  color: #9ca3af;
  font-weight: 600;
}

.btn-aplicar {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-aplicar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

@media (max-width: 968px) {
  .sidebar {
    width: 100%;
  }

  .acciones-rapidas {
    flex-direction: row;
  }

  .btn-accion {
    flex: 1;
  }
}
</style>
