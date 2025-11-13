import { apiClient } from './apiConfig'
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  ChangePasswordRequest,
  ChangeUserRoleRequest,
  ChangePasswordResponse,
  ChangeUserRoleResponse
} from '@/types/EmployeeType'

export const employeeService = {
  /**
   * Crear empleado
   * - Si no existe un usuario con el email, se crea automáticamente
   * - Usuario creado con contraseña por defecto: 1234567!
   * - Si no se especifica userRole, se asigna EMPLOYEE por defecto
   */
  async create(data: CreateEmployeeRequest): Promise<Employee> {
    const response = await apiClient.post<Employee>('/employees', data)
    return response.data
  },

  // Listar todos los empleados
  async getAll(): Promise<Employee[]> {
    const response = await apiClient.get<Employee[]>('/employees')
    return response.data
  },

  // Obtener empleado por ID
  async getById(id: number): Promise<Employee> {
    const response = await apiClient.get<Employee>(`/employees/${id}`)
    return response.data
  },

  /**
   * Actualizar empleado
   */
  async update(id: number, data: UpdateEmployeeRequest): Promise<Employee> {
    const response = await apiClient.put<Employee>(`/employees/${id}`, data)
    return response.data
  },

  /**
   * Eliminar empleado (DELETE Físico)
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete<void>(`/employees/${id}`)
  },

  // Desactivar/Activar empleado
  async toggleActive(id: number, active: boolean): Promise<Employee> {
    const response = await apiClient.put<Employee>(`/employees/${id}`, { active })
    return response.data
  },

  /**
   * Cambiar contraseña de empleado (Solo ADMIN)
   */
  async changePassword(id: number, data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await apiClient.put<ChangePasswordResponse>(`/employees/${id}/password`, data)
    return response.data
  },

  /**
   * Cambiar rol de usuario de empleado (Solo ADMIN)
   */
  async changeUserRole(id: number, data: ChangeUserRoleRequest): Promise<ChangeUserRoleResponse> {
    const response = await apiClient.put<ChangeUserRoleResponse>(`/employees/${id}/user-role`, data)
    return response.data
  }
}
