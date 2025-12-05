import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useChatStore = defineStore('chat', () => {
  const conversaciones = ref([])
  const mensajes = ref([])
  const usuarioActual = ref(null)
  const loading = ref(false)

  async function cargarConversaciones() {
    loading.value = true
    try {
      const response = await api.get('/chat/conversaciones')
      conversaciones.value = response.data.data
      return { success: true }
    } catch (error) {
      console.error('Error al cargar conversaciones:', error)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  async function cargarMensajes(usuarioId) {
    loading.value = true
    try {
      const response = await api.get(`/chat/mensajes/${usuarioId}`)
      mensajes.value = response.data.data
      return { success: true }
    } catch (error) {
      console.error('Error al cargar mensajes:', error)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  // ← ACTUALIZAR: Agregar parámetro servicioId
  async function enviarMensaje(receptorId, mensaje, servicioId = null) {
    try {
      const response = await api.post('/chat/enviar', {
        receptor_id: receptorId,
        mensaje: mensaje,
        servicio_id: servicioId, // ← AGREGAR
      })

      const nuevoMensaje = response.data.data

      if (nuevoMensaje) {
        mensajes.value.push(nuevoMensaje)
      }

      return { success: true }
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      return { success: false, message: 'Error al enviar mensaje' }
    }
  }

  async function abrirChat(usuario) {
    usuarioActual.value = usuario
    await cargarMensajes(usuario.idUsuario)
  }

  // ← AGREGAR NUEVA FUNCIÓN
  async function cargarServiciosContactados() {
    try {
      const response = await api.get('/chat/servicios-contactados')
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Error al cargar servicios contactados:', error)
      return { success: false, data: [] }
    }
  }

  return {
    conversaciones,
    mensajes,
    usuarioActual,
    loading,
    cargarConversaciones,
    cargarMensajes,
    enviarMensaje,
    abrirChat,
    cargarServiciosContactados, // ← EXPORTAR
  }
})
