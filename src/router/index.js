import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore()
        if (authStore.estaAutenticado) {
          // ← CAMBIO: Redirigir según el rol
          if (authStore.user?.rol === 'admin') {
            next('/admin/dashboard')
          } else {
            next('/inicio')
          }
        } else {
          next()
        }
      },
    },
    {
      path: '/servicios',
      name: 'servicios',
      component: () => import('@/views/ServiciosPublicView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    // Rutas autenticadas
    {
      path: '/dashboard',
      redirect: '/inicio',
    },
    {
      path: '/inicio',
      name: 'inicio',
      component: () => import('@/views/InicioView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/servicios-auth',
      name: 'servicios-auth',
      component: () => import('@/views/ServiciosAuthView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/ChatView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/mis-servicios-contratados',
      name: 'mis-servicios-contratados',
      component: () => import('@/views/MisServiciosView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/mis-publicaciones',
      name: 'MisPublicaciones',
      component: () => import('../views/MisPublicacionesView.vue'),
      meta: { requiresAuth: true },
    },

    // ========== RUTAS DE ADMINISTRADOR ==========
    {
      path: '/admin',
      component: () => import('@/components/layout/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard',
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/DashboardView.vue'),
        },
        {
          path: 'usuarios',
          name: 'admin-usuarios',
          component: () => import('@/views/admin/UsuariosView.vue'),
        },
        {
          path: 'servicios',
          name: 'admin-servicios',
          component: () => import('@/views/admin/ServiciosAdminView.vue'),
        },
        {
          path: 'chats',
          name: 'admin-chats',
          component: () => import('@/views/admin/ChatsView.vue'),
        },
        {
          path: 'pagos',
          name: 'admin-pagos',
          component: () => import('@/views/admin/PagosView.vue'),
        },
        {
          path: 'calificaciones',
          name: 'admin-calificaciones',
          component: () => import('@/views/admin/CalificacionesView.vue'),
        },
        {
          path: 'reportes',
          name: 'admin-reportes',
          component: () => import('@/views/admin/ReportesView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Si intenta acceder a rutas autenticadas sin estar autenticado
  if (to.meta.requiresAuth && !authStore.estaAutenticado) {
    next('/login')
    return // ← AGREGAR return
  }

  // Si está autenticado e intenta acceder a login/register
  if (to.meta.requiresGuest && authStore.estaAutenticado) {
    // ← CAMBIO: Redirigir según el rol
    if (authStore.user?.rol === 'admin') {
      next('/admin/dashboard')
    } else {
      next('/inicio')
    }
    return // ← AGREGAR return
  }

  // Si intenta acceder a rutas de admin sin ser admin
  if (to.meta.requiresAdmin && authStore.user?.rol !== 'admin') {
    next('/inicio')
    return // ← AGREGAR return
  }

  next()
})

export default router
