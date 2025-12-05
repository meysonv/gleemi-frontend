<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const authStore = useAuthStore()
const notifications = useNotificationsStore()

const form = ref({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    const result = await authStore.login(form.value)

    if (result.success) {
      notifications.success('¡Bienvenido!', 'Has iniciado sesión correctamente')
      if (authStore.user?.rol === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/inicio')
      }
    } else {
      error.value = result.message
      notifications.error('Error', result.message)
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al conectar con el servidor'
    notifications.error('Error', error.value)
    console.error('Error de login:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-section">
        <h1>Gleemi</h1>
        <p>Inicia sesión en tu cuenta</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input id="email" v-model="form.email" type="email" placeholder="tu@email.com" required />
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
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
        </button>
      </form>

      <div class="register-link">
        ¿No tienes cuenta?
        <router-link to="/register">Regístrate aquí</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 440px;
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

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.btn-login {
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

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-login:disabled {
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

.register-link {
  text-align: center;
  margin-top: 24px;
  color: #6b7280;
  font-size: 14px;
}

.register-link a {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
