<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
//import { useRouter } from 'vue-router'
import NavbarAuth from '@/components/layout/NavbarAuth.vue'
import api from '@/services/api'

const authStore = useAuthStore()
//const router = useRouter()

const stats = ref({
  total_servicios: 0,
  servicios_activos: 0,
  mis_servicios: 0,
  favoritos: 0,
})

const loading = ref(true)

onMounted(async () => {
  await cargarEstadisticas()
})

async function cargarEstadisticas() {
  loading.value = true
  try {
    // Cargar estadísticas básicas
    const [servicios, favoritos] = await Promise.all([api.get('/servicios'), api.get('/favoritos')])

    stats.value = {
      total_servicios: servicios.data.data.total || servicios.data.data.data?.length || 0,
      servicios_activos: servicios.data.data.data?.length || 0,
      favoritos: favoritos.data.data.length || 0,
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="inicio-view">
    <NavbarAuth />

    <div class="container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>¡Bienvenido, {{ authStore.user?.nombre }}! 👋</h1>
          <p>Encuentra y gestiona servicios de limpieza de manera fácil y segura</p>
        </div>
      </section>

      <!-- Stats Cards -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else class="stats-grid">
        <div class="stat-card">
          <div
            class="stat-icon"
            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                stroke="white"
                stroke-width="2"
              />
              <path
                d="M9 7H15M9 12H15M9 17H12"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ stats.servicios_activos }}</h3>
            <p>Servicios disponibles</p>
          </div>
        </div>

        <div class="stat-card">
          <div
            class="stat-icon"
            style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                stroke="white"
                stroke-width="2"
                fill="none"
              />
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ stats.favoritos }}</h3>
            <p>Servicios favoritos</p>
          </div>
        </div>

        <div class="stat-card">
          <div
            class="stat-icon"
            style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="white" stroke-width="2" fill="none" />
              <path
                d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ authStore.user?.rol }}</h3>
            <p>Tu rol</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <section class="quick-actions">
        <h2>Acciones rápidas</h2>
        <div class="actions-grid">
          <router-link to="/servicios-auth" class="action-card">
            <div class="action-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  stroke="#667eea"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <h3>Explorar servicios</h3>
            <p>Busca y contrata servicios de limpieza</p>
          </router-link>

          <div @click="$router.push('/servicios-auth')" class="action-card" style="cursor: pointer">
            <div class="action-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 4v16m8-8H4" stroke="#667eea" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <h3>Publicar servicio</h3>
            <p>Ofrece tus servicios de limpieza</p>
          </div>

          <router-link to="/chat" class="action-card">
            <div class="action-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  stroke="#667eea"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <h3>Mensajes</h3>
            <p>Chatea con proveedores</p>
          </router-link>

          <router-link to="/mis-servicios-contratados" class="action-card">
            <div class="action-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  stroke="#667eea"
                  stroke-width="2"
                />
              </svg>
            </div>
            <h3>Mis servicios</h3>
            <p>Ver servicios contratados</p>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.inicio-view {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 60px 40px;
  margin-bottom: 40px;
  color: white;
  text-align: center;
}

.hero-content h1 {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 16px;
}

.hero-content p {
  font-size: 18px;
  opacity: 0.95;
}

.loading {
  text-align: center;
  padding: 60px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 50px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info h3 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-info p {
  color: #6b7280;
  font-size: 14px;
}

.quick-actions {
  margin-top: 50px;
}

.quick-actions h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.action-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.action-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.action-card p {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 32px;
  }

  .hero-section {
    padding: 40px 24px;
  }

  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
