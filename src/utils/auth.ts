import { authService } from '@/services/api'

// Función de autenticación que ahora usa el servicio real
export const authenticateUser = async (email: string, password: string) => {
  try {
    const response = await authService.login({ email, password })
    if (response.success) {
      return { success: true, user: authService.getCurrentUser() }
    } else {
      return { success: false, message: response.message }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error de conexión'
    return { success: false, message: errorMessage }
  }
}

export const getToken = (): string | null => {
  return authService.getToken()
}

interface TokenData {
  email: string
  name: string
  role: string
  exp: number
}

export const getTokenData = (): TokenData | null => {
  const userInfo = authService.getUserInfo()
  if (!userInfo) return null

  return {
    email: userInfo.email,
    name: userInfo.name,
    role: userInfo.role,
    exp: userInfo.exp,
  }
}

export const getTokenName = (): string | null => {
  const userInfo = authService.getCurrentUser()
  return userInfo?.name || null
}

export const getUserRole = (): string | null => {
  return authService.getUserRole()
}

export const getUserTeamId = (): number | null => {
  const userInfo = authService.getCurrentUser()
  return userInfo?.teamId || null
}

export const isTokenValid = (): boolean => {
  return authService.isAuthenticated()
}

export const userHasAdminRole = (): boolean => {
  return authService.isAdmin()
}

export const userHasSupervisorRole = (): boolean => {
  return getUserRole() === 'supervisor'
}

export const userHasEmployRole = (): boolean => {
  return getUserRole() === 'employ'
}

export const canAccessFinanciero = (): boolean => {
  return userHasAdminRole()
}

export const canAccessOperativo = (): boolean => {
  const role = getUserRole()
  return role === 'admin' || role === 'supervisor'
}

export const canAccessProducto = (): boolean => {
  const role = getUserRole()
  return role === 'admin' || role === 'supervisor'
}

export const canAccessRecursosHumanos = (): boolean => {
  const role = getUserRole()
  return role === 'admin' || role === 'supervisor' || role === 'employ'
}

export const logout = (): void => {
  authService.logout()
}
