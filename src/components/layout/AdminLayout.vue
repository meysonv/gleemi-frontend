<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const sidebarOpen = ref(true)

const menuItems = [
  { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
  { icon: '👥', label: 'Usuarios', route: '/admin/usuarios' },
  { icon: '🧹', label: 'Servicios', route: '/admin/servicios' },
  { icon: '💬', label: 'Chats', route: '/admin/chats' },
  { icon: '💳', label: 'Pagos', route: '/admin/pagos' },
  { icon: '⭐', label: 'Calificaciones', route: '/admin/calificaciones' },
  { icon: '📄', label: 'Reportes', route: '/admin/reportes' },
]

async function logout() {
  await authStore.logout()
  router.replace('/login')
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function volverInicio() {
  router.push('/inicio')
}
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-closed': !sidebarOpen }">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">🧹</span>
          <span v-if="sidebarOpen" class="logo-text">Gleemi Admin</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.route"
          :to="item.route"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span v-if="sidebarOpen" class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="volverInicio" class="back-btn">
          <span class="nav-icon">🏠</span>
          <span v-if="sidebarOpen">Volver al inicio</span>
        </button>
        <button @click="logout" class="logout-btn">
          <span class="nav-icon">🚪</span>
          <span v-if="sidebarOpen">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Navbar -->
      <header class="top-navbar">
        <button @click="toggleSidebar" class="toggle-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12H21M3 6H21M3 18H21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <div class="navbar-right">
          <div class="user-info">
            <span class="user-name">{{ authStore.user?.nombre }}</span>
            <span class="user-role">Administrador</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar-closed {
  width: 80px;
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-bottom: 4px;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #667eea;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.back-btn,
.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  background: transparent;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn {
  color: #667eea;
}

.back-btn:hover {
  background: #ede9fe;
}

.logout-btn {
  color: #dc2626;
}

.logout-btn:hover {
  background: #fef2f2;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar-closed + .main-content {
  margin-left: 80px;
}

.top-navbar {
  height: 70px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: #f3f4f6;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
}

.user-role {
  font-size: 12px;
  color: #9ca3af;
}

.page-content {
  flex: 1;
  padding: 24px;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar-closed {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
