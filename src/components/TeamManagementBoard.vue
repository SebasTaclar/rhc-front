<template>
  <div class="team-management-board">
    <!-- Header con filtros y acciones -->
    <div class="board-header">
      <div class="header-left">
        <h2>Gestión de Equipos</h2>
        <div class="board-stats">
          <div class="stat-item">
            <span class="stat-number">{{ totalTasks }}</span>
            <span class="stat-label">Tareas Totales</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ activeTasks }}</span>
            <span class="stat-label">En Progreso</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ teamMembers.length }}</span>
            <span class="stat-label">Miembros</span>
          </div>
        </div>
      </div>

      <div class="header-right">
        <div class="filters">
          <div class="filter-group">
            <label class="filter-label">👥 Miembro:</label>
            <select v-model="filters.assignee" class="filter-select">
              <option value="">Todos</option>
              <option v-for="member in teamMembers" :key="member.id" :value="member.id">
                {{ member.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">🏢 Cliente:</label>
            <select v-model="filters.client" class="filter-select">
              <option value="">Todos</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">⚡ Prioridad:</label>
            <select v-model="filters.priority" class="filter-select">
              <option value="">Todas</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>

        <button @click="openCreateTaskModal" class="btn btn-primary">
          <span class="icon">+</span>
          Nueva Tarea
        </button>
      </div>
    </div>

    <!-- Tablero Kanban -->
    <div class="kanban-board">
      <div
        v-for="column in columns"
        :key="column.id"
        class="kanban-column"
        :class="{ 'column-over-limit': isColumnOverLimit(column) }"
      >
        <div class="column-header">
          <h3 class="column-title">
            {{ column.title }}
            <span class="task-count">({{ getTasksInColumn(column.status).length }})</span>
          </h3>
          <div class="column-limit" v-if="column.limit">
            Límite: {{ column.limit }}
          </div>
        </div>

        <div
          class="column-content"
          @drop="onDrop($event, column.status)"
          @dragover="onDragOver($event)"
          @dragenter="onDragEnter($event)"
        >
          <div
            v-for="task in getTasksInColumn(column.status)"
            :key="task.id"
            class="task-card"
            :class="{
              'priority-alta': task.priority === 'alta',
              'priority-media': task.priority === 'media',
              'priority-baja': task.priority === 'baja',
              'overdue': isOverdue(task)
            }"
            draggable="true"
            @dragstart="onDragStart($event, task)"
          >
            <div class="task-header">
              <!-- Prioridad Badge con Texto -->
              <div class="task-priority-header">
                <div class="task-priority-badge-compact" :class="`priority-badge-${task.priority}`">
                  <span v-if="task.priority === 'alta'">🔴</span>
                  <span v-else-if="task.priority === 'media'">🟡</span>
                  <span v-else>🟢</span>
                </div>
                <span class="priority-label" :class="`priority-text-${task.priority}`">
                  <span v-if="task.priority === 'alta'">Alta</span>
                  <span v-else-if="task.priority === 'media'">Media</span>
                  <span v-else>Baja</span>
                </span>
              </div>

              <div class="task-actions">
                <button @click.stop="openTaskModal(task)" class="task-action-btn">
                  <span class="icon">✏️</span>
                </button>
                <button 
                  v-if="canDeleteTasks" 
                  @click.stop="deleteTask(task.id)" 
                  class="task-action-btn delete"
                >
                  <span class="icon">🗑️</span>
                </button>
              </div>
            </div>

            <!-- Descripción Tarea -->
            <div class="task-section">
              <div class="section-title">
                <span class="section-icon">📋</span> Descripción Tarea
              </div>
              <h4 class="task-title">{{ task.title }}</h4>
              <p class="task-description" v-if="task.description">{{ task.description }}</p>
            </div>

            <!-- Cliente -->
            <div class="task-section">
              <div class="section-title">
                <span class="section-icon">🏢</span>
                Cliente
              </div>
              <div class="task-client" v-if="task.client">
                <span class="client-name">{{ task.client.name }}</span>
              </div>
              <div class="task-client no-client" v-else>
                <span class="client-name">Sin cliente asignado</span>
              </div>
            </div>

            <!-- Fecha de vencimiento -->
            <div class="task-section">
              <div class="section-title">
                <span class="section-icon">📅</span>
                Fecha de Vencimiento
              </div>
              <div class="task-due-date" :class="{ 'overdue': isOverdue(task) }">
                {{ formatDate(task.dueDate) }}
              </div>
            </div>

            <!-- Asignado a -->
            <div class="task-section">
              <div class="section-title">
                <span class="section-icon">👥</span>
                Asignado a
              </div>
              <div class="task-assignees-compact">
                <span
                  v-for="member in task.assignedTo"
                  :key="member.id"
                  class="assignee-name-compact"
                >
                  {{ member.name }}
                </span>
                <span v-if="task.assignedTo.length === 0" class="no-assignee-compact">
                  Sin asignar
                </span>
              </div>
            </div>

            <div class="task-tags" v-if="task.tags.length > 0">
              <span
                v-for="tag in task.tags"
                :key="tag"
                class="task-tag"
              >
                {{ tag }}
              </span>
            </div>

            <div class="task-footer">
              <div class="task-hours">
                <span class="hours-icon">⏱️</span>
                {{ task.estimatedHours }}h
                <span v-if="task.actualHours" class="actual-hours">
                  / {{ task.actualHours }}h
                </span>
              </div>

              <div class="task-comments" v-if="task.comments.length > 0">
                <span class="comments-icon">💬</span>
                {{ task.comments.length }}
              </div>
            </div>
          </div>

          <!-- Drop zone indicator -->
          <div class="drop-zone" v-if="draggedTask && draggedTask.status !== column.status">
            Soltar aquí para cambiar estado
          </div>
        </div>
      </div>
    </div>

    <!-- Botón flotante para toggle del sidebar -->
    <button
      @click="toggleSidebar"
      class="floating-sidebar-btn"
      :class="{ 'sidebar-closed': !showSidebar }"
      :title="showSidebar ? 'Cerrar panel de equipo' : 'Abrir panel de equipo'"
    >
      <span class="floating-icon">{{ showSidebar ? '✕' : '👥' }}</span>
      <span v-if="!showSidebar" class="floating-badge">{{ teamMembers.length }}</span>
    </button>

    <!-- Panel lateral con información del equipo -->
    <div class="team-sidebar" :class="{ 'sidebar-open': showSidebar }">
      <div class="sidebar-header">
        <h3>Equipo</h3>
        <button @click="toggleSidebar" class="sidebar-toggle" title="Cerrar panel">
          <span class="toggle-icon">✕</span>
        </button>
      </div>

      <div class="team-list">
        <div
          v-for="member in teamMembers"
          :key="member.id"
          class="team-member"
          :class="`status-${member.status}`"
        >
          <div class="member-avatar">
            {{ getInitials(member.name) }}
          </div>

          <div class="member-info">
            <h4 class="member-name">{{ member.name }}</h4>
            <div class="member-role">{{ member.role }}</div>
            <div class="member-location">
              <span class="location-icon">📍</span>
              {{ member.location }}
            </div>

            <div class="member-workload">
              <div class="workload-bar">
                <div
                  class="workload-fill"
                  :style="{ width: `${member.workload}%` }"
                  :class="{
                    'workload-high': member.workload > 80,
                    'workload-medium': member.workload > 60 && member.workload <= 80,
                    'workload-low': member.workload <= 60
                  }"
                ></div>
              </div>
              <span class="workload-text">{{ member.workload }}%</span>
            </div>

            <div class="member-tasks">
              {{ getMemberActiveTasks(member.id) }} tareas activas
            </div>
          </div>

          <div class="member-status" :class="`status-${member.status}`">
            {{ getStatusLabel(member.status) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar tareas -->
    <div v-if="showTaskModal" class="modal-overlay" @click="closeTaskModal">
      <div class="modal-content task-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedTask ? 'Editar Tarea' : 'Nueva Tarea' }}</h3>
          <button @click="closeTaskModal" class="close-button">&times;</button>
        </div>

        <form @submit.prevent="handleTaskSubmit" class="modal-body">
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Título *</label>
              <input v-model="taskForm.title" type="text" class="form-input" required />
            </div>

            <div class="form-group full-width">
              <label>Descripción</label>
              <textarea v-model="taskForm.description" class="form-textarea" rows="3"></textarea>
            </div>

            <div class="form-group full-width">
              <label class="form-label-with-icon">
                <span class="label-icon">🏢</span>
                Cliente *
              </label>
              <select v-model="taskForm.clientId" class="form-select form-select-client" required>
                <option value="">Seleccionar cliente...</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
              <div v-if="taskForm.clientId" class="selected-client-preview">
                <span class="client-badge">
                  <span class="badge-icon">✓</span>
                  Cliente seleccionado: {{ clients.find(c => c.id === taskForm.clientId)?.name }}
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label-with-icon">
                <span class="label-icon">⚡</span>
                Prioridad
              </label>
              <select v-model="taskForm.priority" class="form-select">
                <option value="baja">🟢 Baja</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🔴 Alta</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label-with-icon">
                <span class="label-icon">📅</span>
                Fecha de vencimiento *
              </label>
              <input v-model="taskForm.dueDate" type="date" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label-with-icon">
                <span class="label-icon">⏱️</span>
                Horas estimadas
              </label>
              <input v-model.number="taskForm.estimatedHours" type="number" class="form-input" min="0" step="0.5" placeholder="0" />
            </div>

            <div class="form-group full-width">
              <label class="form-label-with-icon">
                <span class="label-icon">👥</span>
                Asignar empleados
                <span class="selected-count" v-if="selectedMembersForTask.length > 0">
                  ({{ selectedMembersForTask.length }} seleccionado{{ selectedMembersForTask.length !== 1 ? 's' : '' }})
                </span>
              </label>
              <div class="members-selection">
                <div v-for="member in teamMembers" :key="member.id" class="member-option">
                  <input
                    :id="`modal-member-${member.id}`"
                    v-model="selectedMembersForTask"
                    type="checkbox"
                    :value="member.id"
                    :disabled="member.status === 'ausente'"
                    class="member-checkbox"
                  />
                  <label :for="`modal-member-${member.id}`" class="member-label">
                    <div class="member-avatar-small" :class="`status-${member.status}`">
                      {{ getInitials(member.name) }}
                    </div>
                    <div class="member-details">
                      <span class="member-name-text">{{ member.name }}</span>
                      <span class="member-role-text">{{ member.role }}</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeTaskModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              {{ selectedTask ? 'Actualizar' : 'Crear' }} Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTasks } from '@/composables/useTasks'
import { useEmployees } from '@/composables/useEmployees'
import { useClients } from '@/composables/useClients'
import { useAuth } from '@/composables/useAuth'
import type {
  Task,
  TeamMember,
  Client,
  TaskColumn,
  TaskFilter
} from '@/types/TeamManagementType'

// Composables
const { tasks: backendTasks, fetchTasks, createTask: createBackendTask, updateTask: updateBackendTask, deleteTask: deleteBackendTask } = useTasks()
const { employees, fetchEmployees } = useEmployees()
const { clients: backendClients, fetchClients } = useClients()
const { canDeleteTasks } = useAuth()

// Estado reactivo
const showSidebar = ref(true)
const showTaskModal = ref(false)
const selectedTask = ref<Task | null>(null)
const draggedTask = ref<Task | null>(null)
const isSubmitting = ref(false)

// Estado del formulario de tareas
const taskForm = ref({
  title: '',
  description: '',
  clientId: '',
  priority: 'media' as Task['priority'],
  dueDate: '',
  estimatedHours: 0
})
const selectedMembersForTask = ref<string[]>([])

// Filtros
const filters = ref<TaskFilter>({
  assignee: '',
  client: '',
  priority: '',
  status: undefined
})

// Mapear rol del backend al formato display
const mapEmployeeRole = (role: 'ADMIN' | 'EMPLOYEE'): string => {
  return role === 'ADMIN' ? 'Administrador' : 'Empleado'
}

// Mapear empleados del backend a TeamMembers
const teamMembers = computed<TeamMember[]>(() => {
  // Forzar recalculo cuando backendTasks cambie
  const tasksCount = backendTasks.value.length

  return employees.value.map(emp => ({
    id: emp.id.toString(),
    name: emp.name,
    email: emp.email,
    role: mapEmployeeRole(emp.role),
    skills: [], // El backend no tiene skills
    location: 'oficina' as const,
    status: 'disponible' as const,
    workload: calculateEmployeeWorkload(emp.id)
  }))
})

// Mapear clientes del backend
const clients = computed<Client[]>(() => {
  return backendClients.value.map(client => ({
    id: client.id.toString(),
    name: client.businessName,
    company: client.businessName,
    email: client.email || '',
    phone: client.phone,
    priority: 'media' as const,
    status: 'activo' as const
  }))
})

// Función auxiliar para calcular carga de trabajo
const calculateEmployeeWorkload = (employeeId: number): number => {
  // Obtener todas las tareas asignadas al empleado
  const employeeTasks = backendTasks.value.filter(task => {
    const hasInEmployees = task.employees?.some(emp => emp.id === employeeId)
    const hasInEmployeeIds = task.employeeIds?.includes(employeeId)
    return hasInEmployees || hasInEmployeeIds
  })

  if (employeeTasks.length === 0) return 0

  // Contar tareas por estado
  const totalTasks = employeeTasks.length
  const pendingTasks = employeeTasks.filter(task => task.status === 'PENDING').length
  const inProgressTasks = employeeTasks.filter(task => task.status === 'IN_PROGRESS').length
  const completedTasks = employeeTasks.filter(task => task.status === 'COMPLETED').length

  // Calcular porcentaje de progreso:
  // - Tareas pendientes = 0% cada una
  // - Tareas en progreso = 50% cada una (a la mitad)
  // - Tareas completadas = 100% cada una
  const progressPoints = (inProgressTasks * 50) + (completedTasks * 100)
  const totalPoints = totalTasks * 100
  const workload = totalPoints > 0 ? Math.round((progressPoints / totalPoints) * 100) : 0

  // Log para debugging
  console.log(`📊 Workload para empleado ${employeeId}:`, {
    totalTareas: totalTasks,
    pendientes: pendingTasks,
    enProgreso: inProgressTasks,
    completadas: completedTasks,
    porcentaje: workload
  })

  return workload
}

// Mapear estados del backend a estados del Kanban
const mapBackendStatusToKanban = (status: string): Task['status'] => {
  const statusMap: Record<string, Task['status']> = {
    'PENDING': 'pendiente',
    'IN_PROGRESS': 'en-progreso',
    'COMPLETED': 'completado',
    'CANCELLED': 'completado'
  }
  return statusMap[status] || 'pendiente'
}

const mapKanbanStatusToBackend = (status: Task['status']): string => {
  const statusMap: Record<Task['status'], string> = {
    'pendiente': 'PENDING',
    'en-progreso': 'IN_PROGRESS',
    'revision': 'IN_PROGRESS',
    'completado': 'COMPLETED'
  }
  return statusMap[status] || 'PENDING'
}

// Mapear prioridades
const mapBackendPriorityToKanban = (priority: string): Task['priority'] => {
  const priorityMap: Record<string, Task['priority']> = {
    'LOW': 'baja',
    'MEDIUM': 'media',
    'HIGH': 'alta',
    'URGENT': 'alta'
  }
  return priorityMap[priority] || 'media'
}

const mapKanbanPriorityToBackend = (priority: Task['priority']): string => {
  const priorityMap: Record<Task['priority'], string> = {
    'baja': 'LOW',
    'media': 'MEDIUM',
    'alta': 'HIGH'
  }
  return priorityMap[priority] || 'MEDIUM'
}

// Mapear tareas del backend al formato Kanban
const tasks = computed<Task[]>(() => {
  console.log('🔄 Mapeando tareas del backend...')
  console.log('📦 Backend tasks raw:', backendTasks.value)
  console.log('👥 Employees disponibles:', employees.value)
  console.log('🏢 Clientes disponibles:', backendClients.value)

  return backendTasks.value.map(task => {
    console.log(`\n📋 Procesando tarea "${task.title}":`)
    console.log('  - Empleados en tarea:', task.employees)
    console.log('  - Clientes en tarea:', task.clients)
    console.log('  - ClientIds en tarea:', task.clientIds)
    console.log('  - EmployeeIds en tarea:', task.employeeIds)

    // MAPEAR EMPLEADOS: Si task.employees existe con datos, usarlo. Si no, buscar por employeeIds
    let assignedEmployees: TeamMember[] = []

    if (task.employees && task.employees.length > 0 && task.employees[0].name) {
      // Caso 1: El backend devuelve employees con datos completos
      assignedEmployees = task.employees.map(emp => {
        const fullEmployee = employees.value.find(e => e.id === emp.id)
        console.log(`  ✓ Empleado con datos: ${emp.name} (ID: ${emp.id})`)
        return {
          id: emp.id.toString(),
          name: emp.name,
          email: fullEmployee?.email || '',
          role: fullEmployee ? mapEmployeeRole(fullEmployee.role) : 'Empleado',
          skills: [],
          location: 'oficina' as const,
          status: 'disponible' as const,
          workload: calculateEmployeeWorkload(emp.id)
        }
      })
    } else if (task.employeeIds && task.employeeIds.length > 0) {
      // Caso 2: El backend solo devuelve employeeIds (SOLUCIÓN TEMPORAL)
      const employeeIds = task.employeeIds
      console.log(`  ⚠️ Solo tenemos employeeIds:`, employeeIds)
      const mappedEmployees: (TeamMember | null)[] = employeeIds
        .map(empId => {
          const fullEmployee = employees.value.find(e => e.id === empId)
          if (fullEmployee) {
            console.log(`  ✓ Encontrado empleado por ID: ${fullEmployee.name} (ID: ${empId})`)
            const member: TeamMember = {
              id: empId.toString(),
              name: fullEmployee.name,
              email: fullEmployee.email,
              role: mapEmployeeRole(fullEmployee.role),
              skills: [] as string[],
              location: 'oficina' as const,
              status: 'disponible' as const,
              workload: calculateEmployeeWorkload(empId)
            }
            return member
          } else {
            console.log(`  ✗ No encontrado empleado con ID: ${empId}`)
            return null
          }
        })
      assignedEmployees = mappedEmployees.filter((emp): emp is TeamMember => emp !== null)
    }

    // MAPEAR CLIENTE: Si task.clients existe con datos, usarlo. Si no, buscar por clientIds
    let taskClient: Client | undefined = undefined

    if (task.clients && task.clients.length > 0 && task.clients[0].businessName) {
      // Caso 1: El backend devuelve clients con datos completos
      console.log(`  ✓ Cliente con datos: ${task.clients[0].businessName}`)
      taskClient = {
        id: task.clients[0].id.toString(),
        name: task.clients[0].businessName,
        company: task.clients[0].businessName,
        email: '',
        phone: '',
        priority: 'media' as const,
        status: 'activo' as const
      }
    } else if (task.clientIds && task.clientIds.length > 0) {
      // Caso 2: El backend solo devuelve clientIds (SOLUCIÓN TEMPORAL)
      const clientId = task.clientIds[0]
      console.log(`  ⚠️ Solo tenemos clientId:`, clientId)
      const fullClient = backendClients.value.find(c => c.id === clientId)
      if (fullClient) {
        console.log(`  ✓ Encontrado cliente por ID: ${fullClient.businessName} (ID: ${clientId})`)
        taskClient = {
          id: clientId.toString(),
          name: fullClient.businessName,
          company: fullClient.businessName,
          email: fullClient.email || '',
          phone: fullClient.phone,
          priority: 'media' as const,
          status: 'activo' as const
        }
      } else {
        console.log(`  ✗ No encontrado cliente con ID: ${clientId}`)
      }
    }

    console.log(`  ✅ Resultado - Empleados asignados: ${assignedEmployees.length}, Cliente:`, taskClient?.name || 'Sin cliente')

    return {
      id: task.id.toString(),
      title: task.title,
      description: task.description || '',
      status: mapBackendStatusToKanban(task.status),
      priority: mapBackendPriorityToKanban(task.priority),
      assignedTo: assignedEmployees,
      clientId: taskClient ? taskClient.id : '',
      client: taskClient,
      createdAt: task.createdAt.split('T')[0],
      dueDate: task.dueDate.split('T')[0],
      estimatedHours: task.estimatedHours || 0,
      actualHours: task.actualHours || 0,
      tags: task.taskType ? [task.taskType.name] : [],
      comments: [],
      attachments: [],
      taskTypeId: task.taskTypeId || null,
      eventId: task.eventId || null
    }
  })
})

// Definición de columnas Kanban
const columns = ref<TaskColumn[]>([
  { id: '1', title: 'Pendiente', status: 'pendiente', color: '#64748b', limit: 5 },
  { id: '2', title: 'En Progreso', status: 'en-progreso', color: '#3b82f6', limit: 3 },
  { id: '3', title: 'En Revisión', status: 'revision', color: '#f59e0b', limit: 2 },
  { id: '4', title: 'Completado', status: 'completado', color: '#10b981' }
])

// Computed properties
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    if (filters.value.assignee && !task.assignedTo.some(member => member.id === filters.value.assignee)) {
      return false
    }
    if (filters.value.client && task.clientId !== filters.value.client) {
      return false
    }
    if (filters.value.priority && task.priority !== filters.value.priority) {
      return false
    }
    return true
  })
})

const totalTasks = computed(() => filteredTasks.value.length)
const activeTasks = computed(() => filteredTasks.value.filter(task =>
  task.status === 'en-progreso' || task.status === 'revision'
).length)

// Métodos
const getTasksInColumn = (status: Task['status']) => {
  return filteredTasks.value.filter(task => task.status === status)
}

const isColumnOverLimit = (column: TaskColumn) => {
  if (!column.limit) return false
  return getTasksInColumn(column.status).length > column.limit
}

const isOverdue = (task: Task) => {
  const today = new Date()
  const dueDate = new Date(task.dueDate)
  return dueDate < today && task.status !== 'completado'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getStatusLabel = (status: TeamMember['status']) => {
  const labels = {
    'disponible': 'Disponible',
    'ocupado': 'Ocupado',
    'ausente': 'Ausente'
  }
  return labels[status]
}

const getMemberActiveTasks = (memberId: string) => {
  return filteredTasks.value.filter(task =>
    task.assignedTo.some(member => member.id === memberId) &&
    task.status !== 'completado'
  ).length
}

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

const openCreateTaskModal = () => {
  selectedTask.value = null
  taskForm.value = {
    title: '',
    description: '',
    clientId: '',
    priority: 'media',
    dueDate: '',
    estimatedHours: 0
  }
  selectedMembersForTask.value = []
  showTaskModal.value = true
}

const openTaskModal = (task: Task) => {
  selectedTask.value = task
  taskForm.value = {
    title: task.title,
    description: task.description,
    clientId: task.clientId,
    priority: task.priority,
    dueDate: task.dueDate,
    estimatedHours: task.estimatedHours
  }
  selectedMembersForTask.value = task.assignedTo.map(member => member.id)
  showTaskModal.value = true
}

const closeTaskModal = () => {
  showTaskModal.value = false
  selectedTask.value = null
}

const handleTaskSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const employeeIds = selectedMembersForTask.value.map(id => parseInt(id))
    const clientIds = taskForm.value.clientId ? [parseInt(taskForm.value.clientId)] : []

    // Convertir fecha al formato ISO esperado por el backend
    const dueDate = new Date(taskForm.value.dueDate).toISOString()

    if (selectedTask.value) {
      // Editar tarea existente
      const priority = mapKanbanPriorityToBackend(taskForm.value.priority)
      await updateBackendTask(parseInt(selectedTask.value.id), {
        title: taskForm.value.title,
        description: taskForm.value.description,
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        dueDate,
        estimatedHours: taskForm.value.estimatedHours || undefined,
        employeeIds,
        clientIds
      })
    } else {
      // Crear nueva tarea
      const priority = mapKanbanPriorityToBackend(taskForm.value.priority)
      await createBackendTask({
        title: taskForm.value.title,
        description: taskForm.value.description,
        status: 'PENDING',
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        dueDate,
        estimatedHours: taskForm.value.estimatedHours || undefined,
        employeeIds,
        clientIds
      })
    }

    // Recargar tareas
    await fetchTasks()
    closeTaskModal()
  } catch (error) {
    console.error('Error al guardar tarea:', error)
    alert('Error al guardar la tarea. Por favor intente nuevamente.')
  } finally {
    isSubmitting.value = false
  }
}

const deleteTask = async (taskId: string) => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    return
  }

  try {
    await deleteBackendTask(parseInt(taskId))
    await fetchTasks()
  } catch (error) {
    console.error('Error al eliminar tarea:', error)
    alert('Error al eliminar la tarea. Por favor intente nuevamente.')
  }
}

// Drag and Drop functionality
const onDragStart = (event: DragEvent, task: Task) => {
  draggedTask.value = task
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', task.id)
  }
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDragEnter = (event: DragEvent) => {
  event.preventDefault()
}

const onDrop = async (event: DragEvent, newStatus: Task['status']) => {
  event.preventDefault()

  if (draggedTask.value && draggedTask.value.status !== newStatus) {
    const taskId = parseInt(draggedTask.value.id)
    const backendStatus = mapKanbanStatusToBackend(newStatus)

    try {
      // Actualizar estado en el backend
      await updateBackendTask(taskId, {
        status: backendStatus as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
      })

      // Recargar tareas para reflejar el cambio
      await fetchTasks()
    } catch (error) {
      console.error('Error al actualizar estado de tarea:', error)
      alert('Error al mover la tarea. Por favor intente nuevamente.')
    }
  }

  draggedTask.value = null
}

// Watch para debuggear tareas
watch(tasks, (newTasks) => {
  console.log('📋 Tareas actualizadas:', newTasks)
  newTasks.forEach(task => {
    if (task.assignedTo && task.assignedTo.length > 0) {
      console.log(`✅ Tarea "${task.title}" tiene ${task.assignedTo.length} empleado(s) asignado(s):`,
        task.assignedTo.map(e => ({ name: e.name, role: e.role }))
      )
    } else {
      console.log(`⚠️ Tarea "${task.title}" NO tiene empleados asignados`)
    }
  })
}, { immediate: true, deep: true })

onMounted(async () => {
  // Cargar datos del backend
  console.log('🔄 Cargando datos del backend...')
  await Promise.all([
    fetchEmployees(),  // Cargar empleados PRIMERO
    fetchClients()
  ])
  console.log('👥 Empleados cargados:', employees.value.length, employees.value)
  console.log('🏢 Clientes cargados:', backendClients.value.length, backendClients.value)

  // Cargar tareas después de tener los empleados
  await fetchTasks()
  console.log('📋 Tareas cargadas:', backendTasks.value.length)
  console.log('📋 Estructura de tareas del backend:', JSON.stringify(backendTasks.value, null, 2))
})
</script>

<style scoped>
.team-management-board {
  min-height: 100vh;
  background: #f0f4ff;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.team-management-board:has(.team-sidebar:not(.sidebar-open)) {
  margin-right: 0;
}

.board-header {
  background: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.board-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.filter-select {
  padding: 0.625rem 2.5rem 0.625rem 1rem;
  border: 2px solid #dbeafe;
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e40af;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 160px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232563eb' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.1);
}

.filter-select:hover {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.filter-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  background: white;
}

.filter-select option {
  padding: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  background: white;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.kanban-board {
  flex: 1;
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  padding-right: 340px;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  box-sizing: border-box;
  align-items: stretch;
  min-height: calc(100vh - 180px);
}

.kanban-board::-webkit-scrollbar {
  height: 8px;
}

.kanban-board::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.kanban-board::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 4px;
}

.kanban-board::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.kanban-column {
  background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
  border-radius: 16px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  flex: 0 0 340px;
  width: 340px;
  border: 2px solid #e0e7ff;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1), 0 2px 4px -1px rgba(37, 99, 235, 0.06);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.kanban-column::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.kanban-column:hover {
  border-color: #3b82f6;
  box-shadow: 0 12px 24px -4px rgba(37, 99, 235, 0.15), 0 8px 16px -4px rgba(37, 99, 235, 0.1);
  transform: translateY(-2px);
}

.kanban-column:hover::before {
  opacity: 1;
}

.column-over-limit {
  background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);
  border: 2px solid #fca5a5;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.1), 0 2px 4px -1px rgba(239, 68, 68, 0.06);
  }
  50% {
    box-shadow: 0 8px 12px -2px rgba(239, 68, 68, 0.2), 0 4px 8px -2px rgba(239, 68, 68, 0.12);
  }
}

.column-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 2px solid #dbeafe;
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.column-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 0.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 14px;
  font-size: 0.8125rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.column-limit {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.column-limit::before {
  content: '⚠️';
  font-size: 0.875rem;
}

.column-content {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  min-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
}

.column-content::-webkit-scrollbar {
  width: 6px;
}

.column-content::-webkit-scrollbar-track {
  background: transparent;
}

.column-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.task-card {
  background: white;
  border-radius: 12px;
  padding: 1.125rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  cursor: grab;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid #e0e7ff;
  position: relative;
  overflow: hidden;
}

.task-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
  transition: width 0.25s ease;
}

.task-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.15), 0 6px 12px rgba(37, 99, 235, 0.1);
  border-color: #3b82f6;
}

.task-card:hover::before {
  width: 8px;
}

.task-card:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.task-card.priority-alta {
  border-color: #fca5a5;
  background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
}

.task-card.priority-alta::before {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
}

.task-card.priority-media {
  border-color: #fcd34d;
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
}

.task-card.priority-media::before {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
}

.task-card.priority-baja {
  border-color: #6ee7b7;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
}

.task-card.priority-baja::before {
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
}

.task-card.overdue {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.task-priority-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.priority-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.priority-text-alta {
  color: #dc2626;
}

.priority-text-media {
  color: #f59e0b;
}

.priority-text-baja {
  color: #10b981;
}

.priority-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.priority-indicator.priority-alta { background: #1e40af; }
.priority-indicator.priority-media { background: #3b82f6; }
.priority-indicator.priority-baja { background: #93c5fd; }

.task-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.task-action-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}

.task-action-btn:hover {
  background: #f3f4f6;
}

.task-action-btn.delete:hover {
  background: #fee;
  color: #1e40af;
}

.task-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  letter-spacing: -0.01em;
  padding: 0;
}

.task-priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

/* Prioridad Badge Compacta - Solo ícono */
.task-priority-badge-compact {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 0.875rem;
  margin: 0;
  flex-shrink: 0;
}

.task-priority-badge-compact.priority-badge-alta {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 1px solid #fca5a5;
}

.task-priority-badge-compact.priority-badge-media {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fcd34d;
}

.task-priority-badge-compact.priority-badge-baja {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 1px solid #6ee7b7;
}

/* Secciones con Títulos */
.task-section {
  margin-bottom: 0.75rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.section-icon {
  font-size: 0.875rem;
  color: #64748b;
}

/* Asignados Compactos - 3 por fila */
.task-assignees-compact {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.375rem;
}

.assignee-name-compact {
  font-size: 0.7rem;
  font-weight: 600;
  color: #1e293b;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 0.375rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;
}

.assignee-name-compact:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.no-assignee-compact {
  grid-column: 1 / -1;
  font-size: 0.7rem;
  color: #94a3b8;
  font-style: italic;
  font-weight: 500;
  text-align: center;
  padding: 0.375rem 0.5rem;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.priority-badge-alta {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.priority-badge-media {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #fcd34d;
}

.priority-badge-baja {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.task-description {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-client {
  font-weight: 600;
  color: #1e40af;
  font-size: 0.75rem;
  line-height: 1.2;
}

.task-client.no-client {
  color: #64748b;
  font-weight: 500;
  font-style: italic;
}

.client-icon {
  font-size: 0.875rem;
  flex-shrink: 0;
}

.client-name {
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-due-date {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
}

.date-icon {
  font-size: 0.875rem;
}

.task-due-date.overdue {
  color: #dc2626;
  font-weight: 600;
}

.task-assignees-section {
  margin-bottom: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.assignees-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.625rem;
  font-size: 0.65rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.075em;
}

.label-icon {
  font-size: 0.875rem;
  color: #64748b;
}

.label-text {
  line-height: 1;
  color: #64748b;
}

.task-assignees-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.assignee-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.625rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.assignee-item:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  transform: translateX(2px);
}

.assignee-avatar-mini {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
  letter-spacing: -0.5px;
}

.assignee-avatar-mini.status-ocupado {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.assignee-avatar-mini.status-ausente {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  opacity: 0.6;
}

.assignee-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
  min-width: 0;
}

.assignee-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.assignee-role {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #64748b;
  text-transform: capitalize;
}

.no-assignee {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #94a3b8;
  font-style: italic;
  font-weight: 500;
  padding: 0.375rem 0.5rem;
}

.no-assignee-icon {
  font-size: 0.875rem;
  opacity: 0.6;
}

.task-tags {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.task-tag {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.125rem 0.375rem;
  border-radius: 12px;
  font-size: 0.625rem;
  font-weight: 500;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #64748b;
}

.task-hours, .task-comments {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.actual-hours {
  color: #2563eb;
  font-weight: 600;
}

.drop-zone {
  border: 3px dashed #3b82f6;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  color: #2563eb;
  font-weight: 600;
  font-size: 0.9375rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.12) 100%);
  margin: 0.5rem 0;
  animation: dropZonePulse 1.5s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

.drop-zone::before {
  content: '⬇️';
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes dropZonePulse {
  0%, 100% {
    border-color: #3b82f6;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.12) 100%);
  }
  50% {
    border-color: #2563eb;
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(29, 78, 216, 0.16) 100%);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.team-sidebar {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 320px;
  background: white;
  border-left: 2px solid #e5e7eb;
  transform: translateX(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  overflow-y: auto;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.team-sidebar:not(.sidebar-open) {
  transform: translateX(320px); /* Ajustado al ancho */
}

.team-sidebar.sidebar-open {
  transform: translateX(0);
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  position: sticky;
  top: 0;
  z-index: 10;
}

.sidebar-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.sidebar-toggle {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
}

.sidebar-toggle:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
  transform: translateY(-1px);
}

.sidebar-toggle:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.25);
}

.toggle-icon {
  font-size: 1.125rem;
  line-height: 1;
  display: block;
}

/* Botón flotante - siempre visible */
.floating-sidebar-btn {
  position: fixed;
  right: 400px; /* Más separación del sidebar cuando está abierto */
  bottom: 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  z-index: 45;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-sidebar-btn.sidebar-closed {
  right: 1.5rem; /* Se mueve a la derecha cuando el sidebar está cerrado */
  animation: floatPulse 3s infinite;
}

.floating-sidebar-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 8px 28px rgba(59, 130, 246, 0.5);
  transform: scale(1.1);
}

.floating-sidebar-btn:active {
  transform: scale(1.05);
}

.floating-icon {
  font-size: 1.5rem;
  line-height: 1;
  margin-bottom: 2px;
}

.floating-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #1e40af;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  border: 2px solid white;
}

@keyframes floatPulse {
  0%, 100% {
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 8px 28px rgba(59, 130, 246, 0.6);
    transform: translateY(-4px);
  }
}

/* Remover el pseudo-elemento anterior que ya no necesitamos */
.team-sidebar:not(.sidebar-open)::before {
  display: none;
}

.team-list {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
}

.team-member {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid #e0e7ff;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.08);
}

.team-member.status-disponible {
  border-left-color: #3b82f6;
}

.team-member.status-ocupado {
  border-left-color: #1e40af;
}

.team-member.status-ausente {
  border-left-color: #93c5fd;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.member-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.member-role {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: capitalize;
  margin-bottom: 0.5rem;
}

.member-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.member-workload {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.workload-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.workload-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.workload-fill.workload-low { background: #93c5fd; }
.workload-fill.workload-medium { background: #3b82f6; }
.workload-fill.workload-high { background: #1e40af; }

.workload-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

.member-tasks {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.member-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  text-align: center;
}

.member-status.status-disponible {
  background: #dbeafe;
  color: #1e40af;
}

.member-status.status-ocupado {
  background: #bfdbfe;
  color: #1e3a8a;
}

.member-status.status-ausente {
  background: #e0e7ff;
  color: #3730a3;
}

/* Responsive design */
@media (max-width: 1200px) {
  .kanban-board {
    grid-template-columns: repeat(2, 1fr);
    padding-right: 1rem;
  }

  .team-management-board {
    margin-right: 0;
  }

  .team-sidebar {
    width: 280px;
  }

  .team-sidebar:not(.sidebar-open) {
    transform: translateX(280px);
  }

  .floating-sidebar-btn {
    right: 320px;
    width: 48px;
    height: 48px;
  }

  .floating-sidebar-btn.sidebar-closed {
    right: 1rem;
  }

  .floating-icon {
    font-size: 1.25rem;
  }
}

@media (max-width: 768px) {
  .team-management-board {
    margin-right: 0;
  }

  .board-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }

  .header-left h2 {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
  }

  .board-stats {
    gap: 1rem;
    flex-wrap: wrap;
  }

  .stat-item {
    flex: 1;
    min-width: 80px;
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.65rem;
  }

  .header-right {
    width: 100%;
    flex-direction: column;
    gap: 1rem;
  }

  .filters {
    width: 100%;
    flex-direction: column;
    gap: 0.75rem;
  }

  .filter-group {
    width: 100%;
  }

  .filter-label {
    font-size: 0.7rem;
    margin-bottom: 0.375rem;
  }

  .filter-select {
    width: 100%;
    min-width: unset;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    font-size: 0.875rem;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
    padding: 0.75rem 1rem;
  }

  .kanban-board {
    grid-template-columns: 1fr;
    padding: 1rem;
    padding-right: 1rem;
    gap: 1rem;
  }

  .kanban-column {
    min-width: unset;
  }

  .team-sidebar {
    width: 100%;
    top: 0;
    height: 100vh;
  }

  .team-sidebar:not(.sidebar-open) {
    transform: translateX(100%);
  }

  .sidebar-header {
    padding: 1rem;
  }

  .sidebar-header h3 {
    font-size: 1.125rem;
  }

  .team-list {
    padding: 0.75rem;
  }

  .team-member {
    padding: 0.875rem;
  }

  .floating-sidebar-btn {
    right: 1rem;
    bottom: 1rem;
    top: auto;
    transform: none;
    width: 56px;
    height: 56px;
  }

  .floating-sidebar-btn.sidebar-closed {
    right: 1rem;
  }

  .floating-sidebar-btn:hover {
    transform: scale(1.1);
  }

  .task-card {
    padding: 0.875rem;
  }

  .task-title {
    font-size: 0.875rem;
  }

  .task-description {
    font-size: 0.75rem;
  }

  .modal-overlay {
    padding: 1rem;
    align-items: flex-end;
  }

  .task-modal {
    width: 100%;
    max-height: 85vh;
    border-radius: 12px 12px 0 0;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .members-selection {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .board-stats {
    width: 100%;
  }

  .stat-item {
    min-width: 70px;
  }

  .task-header {
    flex-wrap: wrap;
  }

  .task-meta {
    font-size: 0.7rem;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-header h3 {
    font-size: 1.125rem;
  }

  .form-input,
  .form-select,
  .form-textarea {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.task-modal {
  width: 600px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: modalSlideIn 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.close-button:hover {
  opacity: 1;
}

.modal-body {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-label-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.label-icon {
  font-size: 1rem;
}

.selected-count {
  font-size: 0.75rem;
  color: #2563eb;
  font-weight: 500;
  background: #dbeafe;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  margin-left: 0.5rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.875rem 1rem;
  border: 2px solid #e0e7ff;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1f2937;
  background: white;
  transition: all 0.2s ease;
}

.form-select-client {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border-color: #93c5fd;
  color: #1e40af;
  font-weight: 600;
}

.selected-client-preview {
  margin-top: 0.5rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.client-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid #93c5fd;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
}

.badge-icon {
  background: #2563eb;
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 14px;
  padding-right: 2.5rem;
  cursor: pointer;
}

.form-select option {
  padding: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1f2937;
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:hover,
.form-select:hover,
.form-textarea:hover {
  border-color: #9ca3af;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.members-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 2px solid #e0e7ff;
}

.member-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 2px solid #e0e7ff;
  transition: all 0.2s ease;
}

.member-option:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.member-checkbox {
  margin: 0;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2563eb;
}

.member-checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.member-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  flex: 1;
}

.member-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.member-name-text {
  font-weight: 600;
  color: #1e293b;
}

.member-role-text {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: capitalize;
}

.member-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.member-avatar-small.status-ocupado {
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
}

.member-avatar-small.status-ausente {
  background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
  opacity: 0.7;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
