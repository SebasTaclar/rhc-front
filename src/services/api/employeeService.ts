import { apiClient } from './apiConfig'
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types/EmployeeType'

export const employeeService = {
  // Crear empleado
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

  // Actualizar empleado
  async update(id: number, data: UpdateEmployeeRequest): Promise<Employee> {
    const response = await apiClient.put<Employee>(`/employees/${id}`, data)
    return response.data
  },

  // Eliminar empleado (físico)
  async delete(id: number): Promise<void> {
    await apiClient.delete<void>(`/employees/${id}`)
  },

  // Desactivar/Activar empleado
  async toggleActive(id: number, active: boolean): Promise<Employee> {
    const response = await apiClient.put<Employee>(`/employees/${id}`, { active })
    return response.data
  }
}
