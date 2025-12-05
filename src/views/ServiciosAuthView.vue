<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useServiciosStore } from '@/stores/servicios'
import { useFavoritosStore } from '@/stores/favoritos'
import { useChatStore } from '@/stores/chat'
import { useNotificationsStore } from '@/stores/notifications'
import NavbarAuth from '@/components/layout/NavbarAuth.vue'
import ServicioCard from '@/components/servicios/ServicioCard.vue'
import ServicioDetalle from '@/components/servicios/ServicioDetalle.vue'
import ServicioForm from '@/components/servicios/ServicioForm.vue'
import FavoritosList from '@/components/servicios/FavoritosList.vue'
import SidebarFiltros from '@/components/layout/SidebarFiltros.vue'
import BaseModal from '@/components/common/Modal.vue'

const router = useRouter()
const serviciosStore = useServiciosStore()
const favoritosStore = useFavoritosStore()
const chatStore = useChatStore()
const notifications = useNotificationsStore()

const servicioSeleccionado = ref(null)
const mostrarDetalle = ref(false)
const mostrarFormulario = ref(false)
const mostrarFavoritos = ref(false)

onMounted(() => {
  serviciosStore.cargarServicios()
  favoritosStore.cargarFavoritos()
})

function verDetalle(servicio) {
  // Cerrar otros modales primero
  mostrarFormulario.value = false
  mostrarFavoritos.value = false

  // Abrir detalle
  servicioSeleccionado.value = servicio
  mostrarDetalle.value = true
}

function cerrarDetalle() {
  mostrarDetalle.value = false
  servicioSeleccionado.value = null
}

function abrirFormulario() {
  // Cerrar otros modales primero
  mostrarDetalle.value = false
  mostrarFavoritos.value = false

  mostrarFormulario.value = true
}

function cerrarFormulario() {
  mostrarFormulario.value = false
}

async function guardarServicio(data) {
  const result = await serviciosStore.crearServicio(data)
  if (result.success) {
    notifications.success('¡Servicio publicado!', 'Tu servicio está ahora visible para todos')
    cerrarFormulario()
    // Recargar servicios para mostrar el nuevo
    await serviciosStore.cargarServicios()
  } else {
    notifications.error('Error', result.message || 'No se pudo publicar el servicio')
  }
}

function aplicarFiltros(filtros) {
  serviciosStore.aplicarFiltros(filtros)
  notifications.info('Filtros aplicados', 'Mostrando resultados filtrados')
}

function abrirFavoritos() {
  // Cerrar otros modales primero
  mostrarDetalle.value = false
  mostrarFormulario.value = false

  mostrarFavoritos.value = true
}

function cerrarFavoritos() {
  mostrarFavoritos.value = false
}

async function contactar(servicio) {
  console.log('📞 Contactar llamado:', servicio)
  console.log('🆔 ID del servicio:', servicio.idServicio) // ← AGREGAR ESTE LOG

  try {
    cerrarDetalle()
    chatStore.abrirChat(servicio.usuario)

    const mensaje = `Hola, estoy interesado en tu servicio: "${servicio.titulo}". Precio: $${servicio.precio}`

    // ← PASAR EL servicio.idServicio como tercer parámetro
    await chatStore.enviarMensaje(
      servicio.usuario_id,
      mensaje,
      servicio.idServicio, // ← AGREGAR
    )

    notifications.success('Mensaje enviado', 'Se ha abierto el chat con el proveedor')

    router.push({
      name: 'chat',
      query: { userId: servicio.usuario_id },
    })
  } catch (error) {
    notifications.error('Error', 'No se pudo enviar el mensaje')
    console.error('Error al contactar servicio:', error)
  }
}

async function contratarServicio(servicio) {
  try {
    // Cerrar modal de detalle primero
    cerrarDetalle()

    chatStore.abrirChat(servicio.usuario)

    const mensaje = `Hola, estoy interesado en tu servicio: "${servicio.titulo}". Precio: $${servicio.precio}`
    await chatStore.enviarMensaje(servicio.usuario.idUsuario, mensaje)

    notifications.success('Mensaje enviado', 'Se ha abierto el chat con el proveedor')
    router.push('/chat')
  } catch (error) {
    notifications.error('Error', 'No se pudo enviar el mensaje')
    console.error('Error al contratar servicio:', error)
  }
}

async function toggleFavorito(servicioId) {
  const esFav = favoritosStore.esFavorito(servicioId)

  if (esFav) {
    const result = await favoritosStore.eliminarFavorito(servicioId)
    if (result.success) {
      notifications.info('Favorito eliminado', 'Se quitó de tus favoritos')
    }
  } else {
    const result = await favoritosStore.agregarFavorito(servicioId)
    if (result.success) {
      notifications.success('¡Agregado a favoritos!', 'Puedes verlo en tu lista de favoritos')
    } else {
      notifications.error('Error', result.message)
    }
  }
}

function verDetalleDesdeFavoritos(servicio) {
  cerrarFavoritos()
  verDetalle(servicio)
}
</script>

<template>
  <div class="servicios-auth-view">
    <NavbarAuth />

    <div class="container main-content">
      <!-- Sidebar de filtros -->
      <SidebarFiltros
        :autenticado="true"
        @aplicar-filtros="aplicarFiltros"
        @abrir-favoritos="abrirFavoritos"
        @abrir-formulario="abrirFormulario"
      />

      <!-- Grid de servicios -->
      <div class="servicios-section">
        <div class="section-header">
          <h1>Servicios de Limpieza</h1>
          <p>Encuentra y contrata el servicio perfecto</p>
        </div>

        <!-- Loading -->
        <div v-if="serviciosStore.loading" class="loading">
          <div class="spinner"></div>
          <p>Cargando servicios...</p>
        </div>

        <!-- Sin resultados -->
        <div v-else-if="serviciosStore.servicios.length === 0" class="sin-servicios">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" stroke="#e5e7eb" stroke-width="3" />
            <path d="M50 30v20m0 10h.01" stroke="#9ca3af" stroke-width="3" stroke-linecap="round" />
          </svg>
          <h3>No hay servicios disponibles</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
        </div>

        <!-- Grid de servicios -->
        <div v-else class="servicios-grid">
          <ServicioCard
            v-for="servicio in serviciosStore.servicios"
            :key="servicio.idServicio"
            :servicio="servicio"
            :es-favorito="favoritosStore.esFavorito(servicio.idServicio)"
            @ver-detalle="verDetalle"
            @toggle-favorito="toggleFavorito"
          />
        </div>
      </div>
    </div>

    <!-- Modal de Detalle (SOLO UNO) -->
    <BaseModal v-if="mostrarDetalle" max-width="1200px" @close="cerrarDetalle">
      <ServicioDetalle
        v-if="servicioSeleccionado"
        :servicio="servicioSeleccionado"
        :es-favorito="favoritosStore.esFavorito(servicioSeleccionado.idServicio)"
        @close="cerrarDetalle"
        @contactar="contactar"
        @contratar="contratarServicio"
        @toggle-favorito="toggleFavorito"
      />
    </BaseModal>

    <!-- Modal de Formulario (SOLO UNO) -->
    <BaseModal v-if="mostrarFormulario" max-width="700px" @close="cerrarFormulario">
      <div class="modal-header">
        <h2>Publicar Nuevo Servicio</h2>
      </div>
      <ServicioForm @guardar="guardarServicio" @cancelar="cerrarFormulario" />
    </BaseModal>

    <!-- Modal de Favoritos (SOLO UNO) -->
    <BaseModal v-if="mostrarFavoritos" max-width="1000px" @close="cerrarFavoritos">
      <div class="modal-header">
        <h2>Mis Favoritos</h2>
      </div>
      <FavoritosList @ver-detalle="verDetalleDesdeFavoritos" @cerrar="cerrarFavoritos" />
    </BaseModal>
  </div>
</template>

<style scoped>
.servicios-auth-view {
  min-height: 100vh;
  background: #f5f7fa;
}

.main-content {
  display: flex;
  gap: 32px;
  padding: 32px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.servicios-section {
  flex: 1;
  min-width: 0;
}

.section-header {
  margin-bottom: 32px;
}

.section-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.section-header p {
  color: #6b7280;
  font-size: 16px;
}

.loading {
  text-align: center;
  padding: 80px 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
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
  font-size: 16px;
}

.sin-servicios {
  text-align: center;
  padding: 80px 20px;
}

.sin-servicios svg {
  margin-bottom: 24px;
}

.sin-servicios h3 {
  font-size: 22px;
  color: #1f2937;
  margin-bottom: 8px;
}

.sin-servicios p {
  color: #6b7280;
  font-size: 15px;
}

.servicios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

@media (max-width: 968px) {
  .main-content {
    flex-direction: column;
  }

  .servicios-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 640px) {
  .servicios-grid {
    grid-template-columns: 1fr;
  }

  .section-header h1 {
    font-size: 24px;
  }
}
</style>
