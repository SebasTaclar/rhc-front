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
          <select v-model="filters.assignee" class="filter-select">
            <option value="">Todos los miembros</option>
            <option v-for="member in teamMembers" :key="member.id" :value="member.id">
              {{ member.name }}
            </option>
          </select>

          <select v-model="filters.client" class="filter-select">
            <option value="">Todos los clientes</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </option>
          </select>

          <select v-model="filters.priority" class="filter-select">
            <option value="">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
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
            @click="openTaskModal(task)"
          >
            <div class="task-header">
              <div class="task-priority">
                <span class="priority-indicator" :class="`priority-${task.priority}`"></span>
              </div>
              <div class="task-actions">
                <button @click.stop="openTaskModal(task)" class="task-action-btn">
                  <span class="icon">✏️</span>
                </button>
                <button @click.stop="deleteTask(task.id)" class="task-action-btn delete">
                  <span class="icon">🗑️</span>
                </button>
              </div>
            </div>

            <h4 class="task-title">{{ task.title }}</h4>
            <p class="task-description">{{ task.description }}</p>

            <div class="task-meta">
              <div class="task-client" v-if="task.client">
                <span class="client-icon">🏢</span>
                {{ task.client.name }}
              </div>

              <div class="task-due-date" :class="{ 'overdue': isOverdue(task) }">
                <span class="date-icon">📅</span>
                {{ formatDate(task.dueDate) }}
              </div>
            </div>

            <div class="task-assignees">
              <div
                v-for="member in task.assignedTo"
                :key="member.id"
                class="assignee-avatar"
                :title="member.name"
                :class="`status-${member.status}`"
              >
                {{ getInitials(member.name) }}
              </div>
              <div v-if="task.assignedTo.length === 0" class="no-assignee">
                Sin asignar
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

    <!-- Botón flotante para abrir el sidebar cuando está cerrado -->
    <button
      v-if="!showSidebar"
      @click="toggleSidebar"
      class="floating-sidebar-btn"
      title="Abrir panel de equipo"
    >
      <span class="floating-icon">👥</span>
      <span class="floating-badge">{{ teamMembers.length }}</span>
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

            <div class="form-group">
              <label>Cliente *</label>
              <select v-model="taskForm.clientId" class="form-select" required>
                <option value="">Seleccionar cliente</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Prioridad</label>
              <select v-model="taskForm.priority" class="form-select">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            <div class="form-group">
              <label>Fecha de vencimiento *</label>
              <input v-model="taskForm.dueDate" type="date" class="form-input" required />
            </div>

            <div class="form-group">
              <label>Horas estimadas</label>
              <input v-model.number="taskForm.estimatedHours" type="number" class="form-input" min="0" step="0.5" />
            </div>

            <div class="form-group full-width">
              <label>Miembros asignados</label>
              <div class="members-selection">
                <div v-for="member in teamMembers" :key="member.id" class="member-option">
                  <input
                    :id="`modal-member-${member.id}`"
                    v-model="selectedMembersForTask"
                    type="checkbox"
                    :value="member.id"
                    :disabled="member.status === 'ausente'"
                  />
                  <label :for="`modal-member-${member.id}`" class="member-label">
                    <div class="member-avatar-small" :class="`status-${member.status}`">
                      {{ getInitials(member.name) }}
                    </div>
                    <span>{{ member.name }} ({{ member.role }})</span>
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
import { ref, computed, onMounted } from 'vue'
import type {
  Task,
  TeamMember,
  Client,
  TaskColumn,
  TaskFilter
} from '@/types/TeamManagementType'

// Estado reactivo
const showSidebar = ref(true)
const showTaskModal = ref(false)
const selectedTask = ref<Task | null>(null)
const draggedTask = ref<Task | null>(null)

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
  priority: undefined,
  status: undefined
})

// Datos mock (en producción vendrían de una API)
const teamMembers = ref<TeamMember[]>([
  {
    id: '1',
    name: 'Ana García',
    email: 'ana@rhc.com',
    role: 'contador',
    skills: ['Contabilidad', 'Auditoría', 'NIIF'],
    location: 'oficina',
    status: 'disponible',
    workload: 75
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    email: 'carlos@rhc.com',
    role: 'asistente',
    skills: ['Nómina', 'Declaraciones', 'SAP'],
    location: 'remoto',
    status: 'ocupado',
    workload: 90
  },
  {
    id: '3',
    name: 'María López',
    email: 'maria@rhc.com',
    role: 'admin',
    skills: ['Gestión', 'Análisis', 'Reportes'],
    location: 'cliente',
    status: 'disponible',
    workload: 60
  },
  {
    id: '4',
    name: 'Diego Martín',
    email: 'diego@rhc.com',
    role: 'becario',
    skills: ['Excel', 'Archivo', 'Digitación'],
    location: 'oficina',
    status: 'ausente',
    workload: 45
  }
])

const clients = ref<Client[]>([
  {
    id: '1',
    name: 'TechCorp SA',
    company: 'TechCorp SA',
    email: 'contact@techcorp.com',
    phone: '+57 1 234 5678',
    priority: 'alta',
    status: 'activo'
  },
  {
    id: '2',
    name: 'Comercial Andina',
    company: 'Comercial Andina LTDA',
    email: 'info@andina.com',
    phone: '+57 1 987 6543',
    priority: 'media',
    status: 'activo'
  },
  {
    id: '3',
    name: 'Servicios Integrales',
    company: 'Servicios Integrales SAS',
    email: 'admin@servicios.com',
    phone: '+57 1 555 1234',
    priority: 'baja',
    status: 'activo'
  }
])

const tasks = ref<Task[]>([
  {
    id: '1',
    title: 'Declaración de Renta TechCorp',
    description: 'Preparar y presentar declaración de renta anual para TechCorp SA',
    status: 'pendiente',
    priority: 'alta',
    assignedTo: [teamMembers.value[0]],
    clientId: '1',
    client: clients.value[0],
    createdAt: '2025-10-01',
    dueDate: '2025-10-15',
    estimatedHours: 20,
    actualHours: 5,
    tags: ['Renta', 'Anual', 'DIAN'],
    comments: [],
    attachments: []
  },
  {
    id: '2',
    title: 'Conciliación Bancaria Octubre',
    description: 'Realizar conciliación bancaria mensual de Comercial Andina',
    status: 'en-progreso',
    priority: 'media',
    assignedTo: [teamMembers.value[1]],
    clientId: '2',
    client: clients.value[1],
    createdAt: '2025-10-05',
    dueDate: '2025-10-12',
    estimatedHours: 8,
    actualHours: 3,
    tags: ['Conciliación', 'Mensual'],
    comments: [
      {
        id: '1',
        taskId: '2',
        authorId: '2',
        author: 'Carlos Rodríguez',
        content: 'Iniciando revisión de extractos bancarios',
        createdAt: '2025-10-08'
      }
    ],
    attachments: ['extracto_octubre.pdf']
  },
  {
    id: '3',
    title: 'Auditoría Interna Servicios',
    description: 'Realizar auditoría interna de procesos contables',
    status: 'revision',
    priority: 'alta',
    assignedTo: [teamMembers.value[0], teamMembers.value[2]],
    clientId: '3',
    client: clients.value[2],
    createdAt: '2025-09-25',
    dueDate: '2025-10-20',
    estimatedHours: 40,
    actualHours: 32,
    tags: ['Auditoría', 'Interna', 'Procesos'],
    comments: [],
    attachments: []
  },
  {
    id: '4',
    title: 'Archivo Digital Facturas',
    description: 'Digitalizar y archivar facturas del mes anterior',
    status: 'completado',
    priority: 'baja',
    assignedTo: [teamMembers.value[3]],
    clientId: '2',
    client: clients.value[1],
    createdAt: '2025-09-28',
    dueDate: '2025-10-05',
    estimatedHours: 12,
    actualHours: 10,
    tags: ['Archivo', 'Digital', 'Facturas'],
    comments: [],
    attachments: []
  }
])

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

const handleTaskSubmit = () => {
  const assignedMembers = teamMembers.value.filter(member =>
    selectedMembersForTask.value.includes(member.id)
  )

  if (selectedTask.value) {
    // Editar tarea existente
    const index = tasks.value.findIndex(t => t.id === selectedTask.value!.id)
    if (index !== -1) {
      tasks.value[index] = {
        ...tasks.value[index],
        ...taskForm.value,
        assignedTo: assignedMembers,
        client: clients.value.find(c => c.id === taskForm.value.clientId)
      }
    }
  } else {
    // Crear nueva tarea
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskForm.value.title,
      description: taskForm.value.description,
      status: 'pendiente',
      priority: taskForm.value.priority,
      assignedTo: assignedMembers,
      clientId: taskForm.value.clientId,
      client: clients.value.find(c => c.id === taskForm.value.clientId),
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: taskForm.value.dueDate,
      estimatedHours: taskForm.value.estimatedHours,
      tags: [],
      comments: [],
      attachments: []
    }
    tasks.value.push(newTask)
  }
  closeTaskModal()
}

const deleteTask = (taskId: string) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
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

const onDrop = (event: DragEvent, newStatus: Task['status']) => {
  event.preventDefault()

  if (draggedTask.value && draggedTask.value.status !== newStatus) {
    const taskIndex = tasks.value.findIndex(t => t.id === draggedTask.value!.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex].status = newStatus
    }
  }

  draggedTask.value = null
}

onMounted(() => {
  // Asignar clientes a las tareas
  tasks.value.forEach(task => {
    task.client = clients.value.find(c => c.id === task.clientId)
  })
})
</script>

<style scoped>
.team-management-board {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  margin-right: 10rem; /* Sin margen - las columnas se ajustarán solas */
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
  color: #3b82f6;
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
  gap: 1rem;
}

.filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.625rem 2.5rem 0.625rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 180px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 14px;
}

.filter-select:hover {
  border-color: #3b82f6;
  background-color: #f9fafb;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select option {
  padding: 0.5rem;
  font-size: 0.9375rem;
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
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 columnas iguales siempre visibles */
  gap: 1.25rem; /* Más espacio entre columnas */
  padding: 1.5rem;
  padding-right: 350px; /* Reducido para dar más espacio a las columnas */
  overflow-x: visible; /* Sin scroll horizontal */
  width: 100%;
  box-sizing: border-box;
}

.kanban-column {
  background: #f1f5f9;
  border-radius: 12px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  width: 100%; /* Ocupa todo el espacio disponible */
  min-width: 280px; /* Ancho mínimo garantizado más generoso */
}

.column-over-limit {
  background: #fef2f2;
  border: 2px dashed #ef4444;
}

.column-header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.column-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.task-count {
  color: #64748b;
  font-weight: 400;
}

.column-limit {
  font-size: 0.75rem;
  color: #64748b;
}

.column-content {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 200px;
}

.task-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid transparent;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-card.priority-alta {
  border-left-color: #ef4444;
}

.task-card.priority-media {
  border-left-color: #f59e0b;
}

.task-card.priority-baja {
  border-left-color: #10b981;
}

.task-card.overdue {
  background: #fef2f2;
  border-color: #ef4444;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.priority-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.priority-indicator.priority-alta { background: #ef4444; }
.priority-indicator.priority-media { background: #f59e0b; }
.priority-indicator.priority-baja { background: #10b981; }

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
  background: #fef2f2;
  color: #ef4444;
}

.task-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.task-description {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
}

.task-client, .task-due-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #64748b;
}

.task-due-date.overdue {
  color: #ef4444;
  font-weight: 600;
}

.task-assignees {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.assignee-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
}

.assignee-avatar.status-ocupado {
  background: #ef4444;
}

.assignee-avatar.status-ausente {
  background: #64748b;
  opacity: 0.6;
}

.no-assignee {
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
}

.task-tags {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.task-tag {
  background: #e5e7eb;
  color: #374151;
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
  color: #10b981;
  font-weight: 600;
}

.drop-zone {
  border: 2px dashed #3b82f6;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  color: #3b82f6;
  font-weight: 500;
  background: rgba(59, 130, 246, 0.05);
}

.team-sidebar {
  position: fixed;
  right: 0;
  top: 80px; /* Debajo del navbar principal */
  height: calc(100vh - 80px);
  width: 320px; /* Ancho del sidebar */
  background: white;
  border-left: 2px solid #e5e7eb;
  transform: translateX(0); /* Visible por defecto */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  overflow-y: auto;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
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
  top: 80px; /* Debajo de la navbar */
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

/* Botón flotante cuando el sidebar está cerrado */
.floating-sidebar-btn {
  position: fixed;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
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
  z-index: 45; /* Menor que el sidebar */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: floatPulse 3s infinite;
}

.floating-sidebar-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 8px 28px rgba(59, 130, 246, 0.5);
  transform: translateY(-50%) scale(1.1);
}

.floating-sidebar-btn:active {
  transform: translateY(-50%) scale(1.05);
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
  background: #ef4444;
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
    transform: translateY(-50%);
  }
  50% {
    box-shadow: 0 8px 28px rgba(59, 130, 246, 0.6);
    transform: translateY(-50%) translateY(-4px);
  }
}

/* Remover el pseudo-elemento anterior que ya no necesitamos */
.team-sidebar:not(.sidebar-open)::before {
  display: none;
}

.team-list {
  padding: 1rem;
}

.team-member {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid #e2e8f0;
}

.team-member.status-disponible {
  border-left-color: #10b981;
}

.team-member.status-ocupado {
  border-left-color: #f59e0b;
}

.team-member.status-ausente {
  border-left-color: #ef4444;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3b82f6;
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

.workload-fill.workload-low { background: #10b981; }
.workload-fill.workload-medium { background: #f59e0b; }
.workload-fill.workload-high { background: #ef4444; }

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
  background: #dcfce7;
  color: #166534;
}

.member-status.status-ocupado {
  background: #fef3c7;
  color: #92400e;
}

.member-status.status-ausente {
  background: #fee2e2;
  color: #991b1b;
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
    right: 1rem;
    width: 48px;
    height: 48px;
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
    gap: 0.75rem;
  }

  .filters {
    width: 100%;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-select {
    width: 100%;
    min-width: unset;
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
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1f2937;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.member-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.member-option input[type="checkbox"] {
  margin: 0;
}

.member-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.member-avatar-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
}

.member-avatar-small.status-ocupado {
  background: #f59e0b;
}

.member-avatar-small.status-ausente {
  background: #64748b;
  opacity: 0.6;
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
