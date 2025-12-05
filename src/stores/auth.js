import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))
  const estaAutenticado = computed(() => !!token.value)

  // Inicializar usuario desde localStorage
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) {
      console.error('Error parsing user:', e)
    }
  }

  async function login(credentials) {
    try {
      const response = await api.post('/login', credentials)

      token.value = response.data.token
      user.value = response.data.user

      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión',
        errors: error.response?.data?.errors,
      }
    }
  }

  async function register(userData) {
    try {
      const response = await api.post('/register', userData)

      token.value = response.data.token
      user.value = response.data.user

      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al registrarse',
        errors: error.response?.data?.errors,
      }
    }
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  async function checkAuth() {
    if (!token.value) return false

    try {
      const response = await api.get('/me')
      user.value = response.data.data
      localStorage.setItem('user', JSON.stringify(user.value))
      return true
    } catch (error) {
      console.error('Error verificando auth:', error)
      logout()
      return false
    }
  }

  return {
    user,
    token,
    estaAutenticado,
    login,
    register,
    logout,
    checkAuth,
  }
})
