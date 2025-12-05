import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useServiciosStore = defineStore('servicios', () => {
  const servicios = ref([])
  const servicioActual = ref(null)
  const loading = ref(false)
  const filtros = ref({
    buscar: '',
    precio_min: null,
    precio_max: null,
  })

  async function cargarServicios() {
    loading.value = true
    try {
      const params = {}
      if (filtros.value.buscar) params.buscar = filtros.value.buscar
      if (filtros.value.precio_min) params.precio_min = filtros.value.precio_min
      if (filtros.value.precio_max) params.precio_max = filtros.value.precio_max

      const response = await api.get('/servicios', { params })
      servicios.value = response.data.data.data
      return { success: true }
    } catch (error) {
      console.error('Error al cargar servicios:', error)
      return { success: false, message: error.message }
    } finally {
      loading.value = false
    }
  }

  async function obtenerServicio(id) {
    try {
      const response = await api.get(`/servicios/${id}`)
      servicioActual.value = response.data.data
      return { success: true }
    } catch (error) {
      console.error('Error al obtener servicio:', error)
      return { success: false, message: error.message }
    }
  }

  async function crearServicio(data) {
    try {
      const response = await api.post('/servicios', data)
      await cargarServicios()
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Error al crear servicio:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear el servicio',
      }
    }
  }

  function aplicarFiltros(nuevosFiltros) {
    filtros.value = { ...filtros.value, ...nuevosFiltros }
    cargarServicios()
  }

  function limpiarFiltros() {
    filtros.value = {
      buscar: '',
      precio_min: null,
      precio_max: null,
    }
    cargarServicios()
  }

  return {
    servicios,
    servicioActual,
    loading,
    filtros,
    cargarServicios,
    obtenerServicio,
    crearServicio,
    aplicarFiltros,
    limpiarFiltros,
  }
})
