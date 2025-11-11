export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  estimatedHours?: number
  actualHours?: number
  createdBy?: number
  createdAt: string
  updatedAt?: string
  // Relaciones (pueden venir completas o solo como IDs)
  clients?: Array<{ id: number; businessName: string }>
  employees?: Array<{ id: number; name: string }>
  clientIds?: number[]
  employeeIds?: number[]
  taskTypeId?: number | null
  eventId?: number | null
  taskType?: { id: number; name: string; description?: string }
  event?: {
    id: number
    title: string
    startDate: string
    eventType: string
  }
  creator?: { id: number; name: string }
}

export interface CreateTaskRequest {
  title: string
  description?: string
  status?: TaskStatus
  priority: TaskPriority
  dueDate: string
  estimatedHours?: number
  actualHours?: number
  clientIds?: number[]
  employeeIds?: number[]
  taskTypeId?: number
  eventId?: number
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  clientIds?: number[]
  employeeIds?: number[]
  taskTypeId?: number
  eventId?: number
}

export interface TaskFilters {
  clientId?: number
  employeeId?: number
  status?: TaskStatus
  priority?: TaskPriority
  taskTypeId?: number
}
