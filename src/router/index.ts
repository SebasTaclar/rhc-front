import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '@/services/api'
import Home from '@/views/Home.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresGuest?: boolean
    requiredRole?: string
    requiredRoles?: string[]
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: {
        requiresGuest: true, // Solo accesible cuando no está autenticado
      },
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('../views/AdminDashboard.vue'),
      meta: {
        requiresAuth: true,
        requiredRoles: ['admin', 'ADMIN', 'employee', 'EMPLOYEE'], // Accesible para administradores y empleados (case-insensitive)
      },
    },
    {
      path: '/compras',
      name: 'purchases-dashboard',
      component: () => import('../views/PurchasesDashboard.vue'),
      meta: {
        requiresAuth: true, // Accesible para cualquier usuario autenticado
      },
    },
    {
      path: '/accounting',
      name: 'client-accounting',
      component: () => import('@/views/ClientAccounting.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/clientes',
      name: 'client-portal',
      component: () => import('@/views/ClientPortal.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/calendario',
      name: 'calendar',
      component: () => import('../views/CalendarView.vue'),
    },
    {
      path: '/acceso-cliente',
      name: 'client-access',
      component: () => import('../views/ClientAccessView.vue'),
    },
    {
      path: '/acceso-rhc',
      name: 'rhc-access',
      component: () => import('../views/RHCAccessView.vue'),
      meta: {
        requiresAuth: true,
        requiredRoles: ['admin', 'ADMIN', 'employee', 'EMPLOYEE'], // Accesible para administradores y empleados (case-insensitive)
      },
    },
    {
      path: '/payment/success',
      name: 'payment-success',
      component: () => import('../views/PaymentSuccess.vue'),
    },
    {
      path: '/payment/failure',
      name: 'payment-failure',
      component: () => import('../views/PaymentFailure.vue'),
    },
    {
      path: '/payment/pending',
      name: 'payment-pending',
      component: () => import('../views/PaymentPending.vue'),
    },
    // Catch-all route - debe ir al final
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/',
    },
  ],
})

// Guard de navegación global
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  const userRole = authService.getUserRole()

  console.log('🛣️ Router Guard - Route:', to.path)
  console.log('🛣️ Router Guard - User role:', userRole)
  console.log('🛣️ Router Guard - Required roles:', to.meta.requiredRoles)

  // Si la ruta requiere estar autenticado
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // Redirigir al login si no está autenticado
      console.log('🛣️ Router Guard - Not authenticated, redirecting to login')
      next('/login')
      return
    }

    // Verificar rol específico si se requiere
    if (to.meta.requiredRole && userRole !== to.meta.requiredRole) {
      // Redirigir a home si no tiene el rol requerido
      console.log('🛣️ Router Guard - Role mismatch (requiredRole), redirecting to home')
      next('/')
      return
    }

    // Verificar múltiples roles si se requiere (case-insensitive)
    if (to.meta.requiredRoles) {
      if (!userRole) {
        console.log('🛣️ Router Guard - No user role, redirecting to home')
        next('/')
        return
      }
      
      const userRoleLower = userRole.toLowerCase()
      const requiredRolesLower = to.meta.requiredRoles.map((r: string) => r.toLowerCase())
      
      if (!requiredRolesLower.includes(userRoleLower)) {
        console.log('🛣️ Router Guard - Role not in requiredRoles, redirecting to home')
        console.log('🛣️ User role (lower):', userRoleLower)
        console.log('🛣️ Required roles (lower):', requiredRolesLower)
        next('/')
        return
      }
    }
  }

  // Si la ruta requiere ser invitado (no autenticado)
  if (to.meta.requiresGuest && isAuthenticated) {
    // Redirigir a home si ya está autenticado
    next('/')
    return
  }

  next()
})

export default router
