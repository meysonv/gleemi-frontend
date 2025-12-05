<script setup>
//import { useRouter } from 'vue-router'

//const router = useRouter()
</script>

<template>
  <nav class="navbar">
    <div class="container navbar-content">
      <router-link to="/" class="logo">
        <h2>Gleemi</h2>
      </router-link>

      <div class="nav-links">
        <router-link to="/" class="nav-link">Inicio</router-link>
        <router-link to="/servicios" class="nav-link">Servicios</router-link>
        <router-link to="/login" class="btn-nav">Iniciar sesión</router-link>
        <router-link to="/register" class="btn-nav btn-primary">Registrarse</router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
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

.nav-link {
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #667eea;
}

.nav-link.router-link-active {
  color: #667eea;
}

.btn-nav {
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  color: #374151;
}

.btn-nav:hover {
  background: #f3f4f6;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
