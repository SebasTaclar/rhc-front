export interface TaskType {
  id: number
  name: string
  description?: string | null
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateTaskTypeRequest {
  name: string
  description?: string | null
  active: boolean
}

export interface UpdateTaskTypeRequest {
  name?: string
  description?: string | null
  active?: boolean
}
