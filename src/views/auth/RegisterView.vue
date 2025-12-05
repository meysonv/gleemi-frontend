<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const authStore = useAuthStore()
const notifications = useNotificationsStore()

const form = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const error = ref('')
const errors = ref({})

async function handleRegister() {
  error.value = ''
  errors.value = {}
  loading.value = true

  try {
    const result = await authStore.register(form.value)

    if (result.success) {
      notifications.success('¡Registro exitoso!', 'Bienvenido a Gleemi')
      router.push('/inicio')
    } else {
      error.value = result.message
      errors.value = result.errors || {}
      notifications.error('Error en el registro', result.message)
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al conectar con el servidor'
    notifications.error('Error', error.value)
    console.error('Error de registro:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <div class="logo-section">
        <h1>Gleemi</h1>
        <p>Crea tu cuenta</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="nombre">Nombre</label>
            <input id="nombre" v-model="form.nombre" type="text" placeholder="Juan" required />
            <span v-if="errors.nombre" class="field-error">{{ errors.nombre[0] }}</span>
          </div>

          <div class="form-group">
            <label for="apellido">Apellido</label>
            <input id="apellido" v-model="form.apellido" type="text" placeholder="Pérez" required />
            <span v-if="errors.apellido" class="field-error">{{ errors.apellido[0] }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input id="email" v-model="form.email" type="email" placeholder="tu@email.com" required />
          <span v-if="errors.email" class="field-error">{{ errors.email[0] }}</span>
        </div>

        <div class="form-group">
          <label for="telefono">Teléfono (opcional)</label>
          <input id="telefono" v-model="form.telefono" type="tel" placeholder="3001234567" />
          <span v-if="errors.telefono" class="field-error">{{ errors.telefono[0] }}</span>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
          />
          <span v-if="errors.password" class="field-error">{{ errors.password[0] }}</span>
        </div>

        <div class="form-group">
          <label for="password_confirmation">Confirmar contraseña</label>
          <input
            id="password_confirmation"
            v-model="form.password_confirmation"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" class="btn-register" :disabled="loading">
          {{ loading ? 'Registrando...' : 'Crear cuenta' }}
        </button>
      </form>

      <div class="login-link">
        ¿Ya tienes cuenta?
        <router-link to="/login">Inicia sesión aquí</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 540px;
}

.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-section h1 {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.logo-section p {
  color: #6b7280;
  font-size: 14px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.field-error {
  color: #dc2626;
  font-size: 12px;
}

.btn-register {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 12px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
  text-align: center;
}

.login-link {
  text-align: center;
  margin-top: 24px;
  color: #6b7280;
  font-size: 14px;
}

.login-link a {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
