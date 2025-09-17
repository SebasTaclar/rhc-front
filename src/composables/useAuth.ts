import { ref, computed } from 'vue'
import { authService, type LoginCredentials, type UserInfo } from '@/services/api'

// Estado global de autenticación
const isAuthenticated = ref(false)
const currentUser = ref<UserInfo | null>(null)

export function useAuth() {
  // Función para inicializar el estado de autenticación
  const initAuth = () => {
    isAuthenticated.value = authService.isAuthenticated()
    currentUser.value = authService.getCurrentUser()
  }

  // Función de login
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials)

      if (response.success) {
        // Actualizar estado reactivo
        isAuthenticated.value = true
        currentUser.value = authService.getCurrentUser()
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión'
      return { success: false, message: errorMessage }
    }
  }

  // Función de logout
  const logout = () => {
    authService.logout()
    isAuthenticated.value = false
    currentUser.value = null
  }

  // Computeds para permisos
  const isAdmin = computed(() => authService.isAdmin())
  const userRole = computed(() => currentUser.value?.role || null)
  const userName = computed(() => currentUser.value?.name || '')

  // Funciones de verificación de permisos
  const hasRole = (role: string) => userRole.value === role
  const canAccessFinanciero = computed(() => isAdmin.value)
  const canAccessOperativo = computed(() => {
    const role = userRole.value
    return role === 'admin' || role === 'supervisor'
  })
  const canAccessProducto = computed(() => {
    const role = userRole.value
    return role === 'admin' || role === 'supervisor'
  })
  const canAccessRecursosHumanos = computed(() => {
    const role = userRole.value
    return role === 'admin' || role === 'supervisor' || role === 'employ'
  })

  return {
    // Estado
    isAuthenticated: computed(() => isAuthenticated.value),
    currentUser: computed(() => currentUser.value),
    isAdmin,
    userRole,
    userName,

    // Funciones
    initAuth,
    login,
    logout,
    hasRole,

    // Permisos
    canAccessFinanciero,
    canAccessOperativo,
    canAccessProducto,
    canAccessRecursosHumanos,
  }
}
