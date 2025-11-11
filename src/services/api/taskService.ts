import { apiClient } from './apiConfig'
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilters } from '@/types/TaskType'

export const taskService = {
  // Crear tarea
  async create(data: CreateTaskRequest): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks', data)
    return response.data
  },

  // Obtener todas las tareas con filtros opcionales
  async getAll(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams()

    if (filters?.clientId) {
      params.append('clientId', filters.clientId.toString())
    }
    if (filters?.employeeId) {
      params.append('employeeId', filters.employeeId.toString())
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }
    if (filters?.priority) {
      params.append('priority', filters.priority)
    }
    if (filters?.taskTypeId) {
      params.append('taskTypeId', filters.taskTypeId.toString())
    }

    const queryString = params.toString()
    const url = queryString ? `/tasks?${queryString}` : '/tasks'

    const response = await apiClient.get<Task[]>(url)
    return response.data
  },

  // Obtener tarea por ID
  async getById(id: number): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${id}`)
    return response.data
  },

  // Actualizar tarea
  async update(id: number, data: UpdateTaskRequest): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${id}`, data)
    return response.data
  },

  // Eliminar tarea (solo admin)
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`)
  },

  // Obtener tareas por cliente
  async getByClient(clientId: number): Promise<Task[]> {
    return this.getAll({ clientId })
  },

  // Obtener tareas por empleado
  async getByEmployee(employeeId: number): Promise<Task[]> {
    return this.getAll({ employeeId })
  },

  // Obtener tareas por estado
  async getByStatus(status: TaskFilters['status']): Promise<Task[]> {
    return this.getAll({ status })
  }
}
