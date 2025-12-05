<script setup>
import { onMounted } from 'vue'
import { useFavoritosStore } from '@/stores/favoritos'
import { useNotificationsStore } from '@/stores/notifications'
import { getPrimeraImagen } from '@/utils/storage'

const emit = defineEmits(['ver-detalle', 'cerrar'])
const favoritosStore = useFavoritosStore()
const notifications = useNotificationsStore()

onMounted(() => {
  favoritosStore.cargarFavoritos()
})

function verDetalle(servicio) {
  emit('ver-detalle', servicio)
  emit('cerrar')
}

async function eliminar(servicioId) {
  const result = await favoritosStore.eliminarFavorito(servicioId)
  if (result.success) {
    notifications.success('Eliminado', 'Se quitó de tus favoritos')
  } else {
    notifications.error('Error', 'No se pudo eliminar el favorito')
  }
}
</script>

<template>
  <div class="favoritos-list">
    <!-- Loading -->
    <div v-if="favoritosStore.loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando favoritos...</p>
    </div>

    <!-- Sin favoritos -->
    <div v-else-if="favoritosStore.favoritos.length === 0" class="no-favoritos">
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
        <path
          d="M26.43 41.72a16 16 0 0122.627 0L50 42.686l0.943-0.966a16 16 0 1122.627 22.627L50 87.857 26.43 64.287a16 16 0 010-22.627z"
          fill="#e5e7eb"
        />
        <path
          d="M50 87.857L26.43 64.287a16 16 0 010-22.627 16 16 0 0122.627 0L50 42.686l0.943-0.966a16 16 0 1122.627 22.627L50 87.857z"
          stroke="#9ca3af"
          stroke-width="2"
        />
      </svg>
      <h3>No tienes favoritos</h3>
      <p>Los servicios que marques como favoritos aparecerán aquí</p>
    </div>

    <!-- Grid de favoritos -->
    <div v-else class="favoritos-grid">
      <div
        v-for="favorito in favoritosStore.favoritos"
        :key="favorito.idFavorito"
        class="favorito-card"
      >
        <!-- Imagen -->
        <div class="card-image" @click="verDetalle(favorito.servicio)">
          <img
            :src="getPrimeraImagen(favorito.servicio?.imagenes)"
            :alt="favorito.servicio?.titulo"
          />
        </div>

        <div class="card-header">
          <div class="user-info">
            <div class="user-avatar">
              <img
                v-if="favorito.servicio?.usuario?.foto"
                :src="favorito.servicio.usuario.foto"
                :alt="favorito.servicio.usuario.nombre"
              />
              <span v-else class="avatar-placeholder">
                {{ favorito.servicio?.usuario?.nombre?.charAt(0)
                }}{{ favorito.servicio?.usuario?.apellido?.charAt(0) }}
              </span>
            </div>
            <div class="user-details">
              <p class="user-name">
                {{ favorito.servicio?.usuario?.nombre }} {{ favorito.servicio?.usuario?.apellido }}
              </p>
            </div>
          </div>
          <button @click="eliminar(favorito.servicio_id)" class="btn-remove">
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

        <div class="card-body" @click="verDetalle(favorito.servicio)">
          <h3 class="titulo">{{ favorito.servicio?.titulo }}</h3>
          <p class="descripcion">{{ favorito.servicio?.descripcion }}</p>

          <div class="card-footer">
            <span class="precio"
              >${{ Number(favorito.servicio?.precio).toLocaleString('es-CO') }}</span
            >
            <button class="btn-ver">Ver detalles</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favoritos-list {
  min-height: 300px;
  background: white;
  border-radius: 16px;
  padding: 32px; /* ← Aumentar padding */
  max-height: 70vh; /* ← Altura máxima */
  overflow-y: auto; /* ← Scroll si es necesario */
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
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

.loading p {
  color: #6b7280;
}

.no-favoritos {
  text-align: center;
  padding: 60px 20px;
}

.no-favoritos svg {
  margin-bottom: 24px;
}

.no-favoritos h3 {
  font-size: 20px;
  color: #1f2937;
  margin-bottom: 8px;
}

.no-favoritos p {
  color: #6b7280;
  font-size: 15px;
}

.favoritos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.favorito-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.favorito-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.card-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); /* ← Gradiente suave */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* ← Cambiar de cover a contain */
  transition: transform 0.3s ease;
}

.card-image:hover img {
  transform: scale(1.05);
}

.card-header {
  padding: 16px;
  background: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-weight: 600;
  font-size: 13px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-remove {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.card-body {
  padding: 16px;
  cursor: pointer;
}

.titulo {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.descripcion {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.precio {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}

.btn-ver {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ver:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Scrollbar personalizado */
.favoritos-list::-webkit-scrollbar {
  width: 8px;
}

.favoritos-list::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.favoritos-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.favoritos-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

@media (max-width: 768px) {
  .favoritos-grid {
    grid-template-columns: 1fr;
  }
}
</style>
