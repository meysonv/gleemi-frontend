// URL base de tu backend Laravel
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Obtener URL completa de una imagen en storage
 * @param {string} path - Ruta relativa de la imagen (ej: "servicios/abc123.jpg")
 * @returns {string} URL completa
 */
export function getStorageUrl(path) {
  if (!path) return getPlaceholderImage()

  // Si ya es una URL completa, retornarla
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${API_URL}/storage/${path}`
}

/**
 * Obtener primera imagen de un array o placeholder
 * @param {Array|string} imagenes - Array de imágenes o imagen única
 * @returns {string} URL de la imagen
 */
export function getPrimeraImagen(imagenes) {
  if (!imagenes) return getPlaceholderImage()

  if (Array.isArray(imagenes) && imagenes.length > 0) {
    return getStorageUrl(imagenes[0])
  }

  if (typeof imagenes === 'string') {
    return getStorageUrl(imagenes)
  }

  return getPlaceholderImage()
}

/**
 * Obtener array de URLs de imágenes
 * @param {Array} imagenes - Array de rutas de imágenes
 * @returns {Array} Array de URLs completas
 */
export function getImagenesUrls(imagenes) {
  if (!imagenes || !Array.isArray(imagenes) || imagenes.length === 0) {
    return [getPlaceholderImage()]
  }

  return imagenes.map((img) => getStorageUrl(img))
}

/**
 * Obtener imagen placeholder
 * @param {number} width - Ancho
 * @param {number} height - Alto
 * @returns {string} URL del placeholder
 */
export function getPlaceholderImage(width = 400, height = 300) {
  return `https://via.placeholder.com/${width}x${height}/667eea/ffffff?text=Sin+Imagen`
}

/**
 * Convertir archivo a Base64
 * @param {File} file - Archivo a convertir
 * @returns {Promise<string>} Base64 string
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}
