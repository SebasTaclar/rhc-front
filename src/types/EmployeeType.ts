export interface Employee {
  id: number
  name: string
  email: string
  role: string // Rol organizacional (ej: "RECURSOS HUMANOS", "CONTABILIDAD", "GERENCIA GENERAL")
  active: boolean
  userId?: number | null
  userRole?: 'ADMIN' | 'EMPLOYEE' // Rol de sistema para autenticación
  createdAt?: string
  updatedAt?: string
}

export interface CreateEmployeeRequest {
  name: string
  email: string
  role: string // Rol organizacional (acepta cualquier string)
  active: boolean
  userId?: number | null // ID de usuario existente para vincular
  userRole?: 'ADMIN' | 'EMPLOYEE' // Rol de sistema (por defecto EMPLOYEE si no se especifica)
}

export interface UpdateEmployeeRequest {
  name?: string
  email?: string
  role?: string // Rol organizacional
  active?: boolean
  userId?: number | null // null para desvincular usuario
}

export interface ChangePasswordRequest {
  newPassword: string
}

export interface ChangeUserRoleRequest {
  userRole: 'ADMIN' | 'EMPLOYEE'
}

export interface ChangePasswordResponse {
  message: string
  employeeId: number
  employeeName: string
}

export interface ChangeUserRoleResponse {
  message: string
  employeeId: number
  employeeName: string
  newUserRole: 'ADMIN' | 'EMPLOYEE'
}
