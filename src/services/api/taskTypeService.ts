import { apiClient } from './apiConfig'
import type { TaskType, CreateTaskTypeRequest, UpdateTaskTypeRequest } from '@/types/TaskTypeApi'

export const taskTypeService = {
  // Crear tipo de tarea
  async create(data: CreateTaskTypeRequest): Promise<TaskType> {
    const response = await apiClient.post<TaskType>('/tasktypes', data)
    return response.data
  },

  // Listar todos los tipos de tarea
  async getAll(): Promise<TaskType[]> {
    const response = await apiClient.get<TaskType[]>('/tasktypes')
    return response.data
  },

  // Obtener tipo de tarea por ID
  async getById(id: number): Promise<TaskType> {
    const response = await apiClient.get<TaskType>(`/tasktypes/${id}`)
    return response.data
  },

  // Actualizar tipo de tarea
  async update(id: number, data: UpdateTaskTypeRequest): Promise<TaskType> {
    const response = await apiClient.put<TaskType>(`/tasktypes/${id}`, data)
    return response.data
  },

  // Eliminar tipo de tarea (físico)
  async delete(id: number): Promise<void> {
    await apiClient.delete<void>(`/tasktypes/${id}`)
  },

  // Desactivar/Activar tipo de tarea
  async toggleActive(id: number, active: boolean): Promise<TaskType> {
    const response = await apiClient.put<TaskType>(`/tasktypes/${id}`, { active })
    return response.data
  }
}
