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
  const isAdmin = computed(() => {
    const role = currentUser.value?.role
    return role === 'admin' || role === 'ADMIN'
  })
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

  // Permisos específicos para empleados (EMPLOYEE role) - case-insensitive
  const isEmployee = computed(() => {
    const role = userRole.value?.toLowerCase()
    return role === 'employee'
  })

  // Permisos de eventos
  const canDeleteEvents = computed(() => !isEmployee.value)

  // Permisos de tareas
  const canDeleteTasks = computed(() => !isEmployee.value)

  // Permisos de clientes
  const canDeleteClients = computed(() => !isEmployee.value)

  // Permisos de empleados
  const canManageEmployees = computed(() => !isEmployee.value) // Crear, editar, borrar

  // Permisos de tokens
  const canViewTokens = computed(() => !isEmployee.value)
  const canViewTokenDetails = computed(() => !isEmployee.value)
  const canDeleteTokens = computed(() => !isEmployee.value)

  return {
    // Estado
    isAuthenticated: computed(() => isAuthenticated.value),
    currentUser: computed(() => currentUser.value),
    isAdmin,
    isEmployee,
    userRole,
    userName,

    // Funciones
    initAuth,
    login,
    logout,
    hasRole,

    // Permisos de acceso
    canAccessFinanciero,
    canAccessOperativo,
    canAccessProducto,
    canAccessRecursosHumanos,

    // Permisos específicos
    canDeleteEvents,
    canDeleteTasks,
    canDeleteClients,
    canManageEmployees,
    canViewTokens,
    canViewTokenDetails,
    canDeleteTokens,
  }
}
