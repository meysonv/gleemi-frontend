<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
</script>

<template>
  <div class="home">
    <nav class="navbar">
      <div class="container navbar-content">
        <router-link to="/" class="logo">
          <h2>Gleemi</h2>
        </router-link>
        
        <div class="nav-links">
          <router-link to="/">Inicio</router-link>
          <router-link to="/servicios">Servicios</router-link>
          
          <template v-if="authStore.isAuthenticated">
            <router-link to="/dashboard">Dashboard</router-link>
            <button @click="authStore.logout(); router.push('/')" class="btn-nav">
              Cerrar sesión
            </button>
          </template>
          
          <template v-else>
            <router-link to="/login" class="btn-nav">Iniciar sesión</router-link>
            <router-link to="/register" class="btn-nav btn-primary">Registrarse</router-link>
          </template>
        </div>
      </div>
    </nav>

    <section class="hero">
      <div class="container hero-content">
        <h1>Encuentra servicios de limpieza confiables</h1>
        <p>Conectamos personas que necesitan servicios de limpieza con profesionales calificados</p>
        <div class="hero-buttons">
          <router-link to="/servicios" class="btn btn-large btn-primary">
            Ver servicios
          </router-link>
          <router-link to="/register" class="btn btn-large btn-secondary">
            Publicar servicio
          </router-link>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2>¿Por qué elegir Gleemi?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🛡️</div>
            <h3>Seguro</h3>
            <p>Pagos seguros y usuarios verificados</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>Chat integrado</h3>
            <p>Comunícate directamente con los proveedores</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">⭐</div>
            <h3>Calificaciones</h3>
            <p>Sistema de reseñas y calificaciones confiables</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>Precios justos</h3>
            <p>Compara y elige el mejor precio</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>

.home {
  min-height: 100vh;
  background: #f5f7fa;
}

.navbar {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.logo {
  text-decoration: none;
}

.logo h2 {
  color: #667eea;
  font-size: 28px;
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 24px;
  align-items: center;
}

.nav-links a {
  color: #374151;
  text-decoration: none;
  font-weight: 500;
}

</style>