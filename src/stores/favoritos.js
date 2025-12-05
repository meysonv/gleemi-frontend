import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useFavoritosStore = defineStore('favoritos', () => {
  const favoritos = ref([])
  const loading = ref(false)

  async function cargarFavoritos() {
    loading.value = true
    try {
      const response = await api.get('/favoritos')
      favoritos.value = response.data.data
      return { success: true }
    } catch (error) {
      console.error('Error al cargar favoritos:', error)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  async function agregarFavorito(servicioId) {
    try {
      await api.post('/favoritos', { servicio_id: servicioId })
      await cargarFavoritos()
      return { success: true, message: 'Agregado a favoritos' }
    } catch (error) {
      console.error('Error al agregar favorito:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al agregar a favoritos',
      }
    }
  }

  async function eliminarFavorito(servicioId) {
    try {
      await api.delete(`/favoritos/${servicioId}`)
      await cargarFavoritos()
      return { success: true, message: 'Eliminado de favoritos' }
    } catch (error) {
      console.error('Error al eliminar favorito:', error)
      return { success: false, message: 'Error al eliminar' }
    }
  }

  // ← AGREGAR ESTA FUNCIÓN
  async function toggleFavorito(servicioId) {
    const yaEsFavorito = esFavorito(servicioId)

    if (yaEsFavorito) {
      const resultado = await eliminarFavorito(servicioId)
      return { ...resultado, agregado: false }
    } else {
      const resultado = await agregarFavorito(servicioId)
      return { ...resultado, agregado: true }
    }
  }

  function esFavorito(servicioId) {
    return favoritos.value.some((fav) => fav.servicio_id === servicioId)
  }

  return {
    favoritos,
    loading,
    cargarFavoritos,
    agregarFavorito,
    eliminarFavorito,
    toggleFavorito, // ← AGREGAR AL RETURN
    esFavorito,
  }
})
