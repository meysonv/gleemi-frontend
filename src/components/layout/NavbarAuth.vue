<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const authStore = useAuthStore()
const notifications = useNotificationsStore()

const menuAbierto = ref(false)

function toggleMenu() {
  menuAbierto.value = !menuAbierto.value
}

function cerrarMenu() {
  menuAbierto.value = false
}

async function handleLogout() {
  await authStore.logout()
  cerrarMenu()
  notifications.success('Sesión cerrada', 'Has cerrado sesión exitosamente')
  router.push('/')
}

function irAServicios() {
  cerrarMenu()
  router.push('/servicios-auth')
}

function irAServiciosContratados() {
  cerrarMenu()
  router.push('/mis-servicios-contratados')
}

function irAMisPublicaciones() {
  cerrarMenu()
  router.push('/mis-publicaciones')
}

function handleClickOutside(event) {
  if (!event.target.closest('.user-menu-container')) {
    cerrarMenu()
  }
}
</script>

<template>
  <nav class="navbar" @click="handleClickOutside">
    <div class="container navbar-content">
      <router-link to="/inicio" class="logo">
        <h2>Gleemi</h2>
      </router-link>

      <div class="nav-links">
        <router-link to="/inicio" class="nav-link">Inicio</router-link>
        <router-link to="/servicios-auth" class="nav-link">Servicios</router-link>
        <router-link to="/chat" class="nav-link">Chats</router-link>

        <!-- Menú de usuario -->
        <div class="user-menu-container">
          <button @click.stop="toggleMenu" class="user-button">
            <div class="user-avatar">
              <img
                v-if="authStore.user?.foto"
                :src="authStore.user.foto"
                :alt="authStore.user.nombre"
              />
              <span v-else class="avatar-placeholder">
                {{ authStore.user?.nombre?.charAt(0) }}{{ authStore.user?.apellido?.charAt(0) }}
              </span>
            </div>
            <span class="user-name">{{ authStore.user?.nombre }}</span>
            <svg
              class="chevron"
              :class="{ rotated: menuAbierto }"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <!-- Dropdown menu -->
          <transition name="dropdown">
            <div v-if="menuAbierto" class="dropdown-menu">
              <div class="dropdown-header">
                <div class="dropdown-avatar">
                  <img
                    v-if="authStore.user?.foto"
                    :src="authStore.user.foto"
                    :alt="authStore.user.nombre"
                  />
                  <span v-else class="avatar-placeholder-large">
                    {{ authStore.user?.nombre?.charAt(0) }}{{ authStore.user?.apellido?.charAt(0) }}
                  </span>
                </div>
                <div class="dropdown-user-info">
                  <p class="dropdown-name">
                    {{ authStore.user?.nombre }} {{ authStore.user?.apellido }}
                  </p>
                  <p class="dropdown-email">{{ authStore.user?.email }}</p>
                </div>
              </div>

              <div class="dropdown-divider"></div>

              <!-- Servicios contratados (los que YO contraté) -->
              <button @click="irAServiciosContratados" class="dropdown-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" fill="currentColor" />
                  <path
                    fill-rule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                    fill="currentColor"
                  />
                </svg>
                <span>Servicios contratados</span>
              </button>

              <!-- Mis publicaciones (los que YO ofrezco) -->
              <button @click="irAMisPublicaciones" class="dropdown-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" fill="currentColor" />
                  <path
                    fill-rule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clip-rule="evenodd"
                    fill="currentColor"
                  />
                </svg>
                <span>Mis publicaciones</span>
              </button>

              <!-- Añadir servicio (abre el modal) -->
              <button @click="irAServicios" class="dropdown-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    fill-rule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    fill="currentColor"
                  />
                </svg>
                <span>Añadir servicio</span>
              </button>

              <div class="dropdown-divider"></div>

              <button @click="handleLogout" class="dropdown-item danger">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    fill-rule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    fill="currentColor"
                  />
                </svg>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </transition>
        </div>
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
  position: relative;
}

.nav-link:hover {
  color: #667eea;
}

.nav-link.router-link-active {
  color: #667eea;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2px;
  background: #667eea;
}

/* User Menu */
.user-menu-container {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.user-button:hover {
  background: #f3f4f6;
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
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.user-name {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.chevron {
  color: #6b7280;
  transition: transform 0.3s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dropdown-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-large {
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.dropdown-user-info {
  flex: 1;
  min-width: 0;
}

.dropdown-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-email {
  color: #6b7280;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 8px 0;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item svg {
  flex-shrink: 0;
  color: #6b7280;
}

.dropdown-item.danger {
  color: #dc2626;
}

.dropdown-item.danger svg {
  color: #dc2626;
}

.dropdown-item.danger:hover {
  background: #fee2e2;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
  transform-origin: top right;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }

  .dropdown-menu {
    right: -10px;
  }
}
</style>
