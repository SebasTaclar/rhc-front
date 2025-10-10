export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'contador' | 'asistente' | 'becario'
  skills: string[]
  location: 'oficina' | 'remoto' | 'cliente'
  status: 'disponible' | 'ocupado' | 'ausente'
  workload: number // Porcentaje de carga de trabajo (0-100)
}

export interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  priority: 'alta' | 'media' | 'baja'
  status: 'activo' | 'inactivo'
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'pendiente' | 'en-progreso' | 'revision' | 'completado'
  priority: 'alta' | 'media' | 'baja'
  assignedTo: TeamMember[]
  clientId: string
  client?: Client
  createdAt: string
  dueDate: string
  estimatedHours: number
  actualHours?: number
  tags: string[]
  comments: TaskComment[]
  attachments: string[]
}

export interface TaskComment {
  id: string
  taskId: string
  authorId: string
  author: string
  content: string
  createdAt: string
}

export interface TaskBoard {
  id: string
  name: string
  columns: TaskColumn[]
  tasks: Task[]
  members: TeamMember[]
}

export interface TaskColumn {
  id: string
  title: string
  status: Task['status']
  color: string
  limit?: number
}

export interface TaskFilter {
  assignee?: string
  client?: string
  priority?: Task['priority']
  status?: Task['status']
  dateRange?: {
    start: string
    end: string
  }
}

export interface WorkloadSummary {
  memberId: string
  member: TeamMember
  activeTasks: number
  totalHours: number
  overdueTask: number
  completionRate: number
}
