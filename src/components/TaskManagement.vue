<template>
  <div class="task-management">
    <div class="management-header">
      <h2>✅ Gestión de Tareas</h2>
      <button @click="openCreateModal" class="btn-create">
        <span>➕</span>
        Crear Tarea
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filter-group">
        <label>🔍 Buscar:</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por título o descripción..."
          class="filter-input"
        />
      </div>
      <div class="filter-group">
        <label>📊 Estado:</label>
        <select v-model="filterStatus" class="filter-select">
          <option value="">Todos</option>
          <option value="PENDING">Pendiente</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="COMPLETED">Completada</option>
          <option value="CANCELLED">Cancelada</option>
        </select>
      </div>
      <div class="filter-group">
        <label>⚡ Prioridad:</label>
        <select v-model="filterPriority" class="filter-select">
          <option value="">Todas</option>
          <option value="LOW">Baja</option>
          <option value="MEDIUM">Media</option>
          <option value="HIGH">Alta</option>
          <option value="URGENT">Urgente</option>
        </select>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <div class="stat-value">{{ taskStats.total }}</div>
          <div class="stat-label">Total Tareas</div>
        </div>
      </div>
      <div class="stat-card pending">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-value">{{ taskStats.pending }}</div>
          <div class="stat-label">Pendientes</div>
        </div>
      </div>
      <div class="stat-card progress">
        <div class="stat-icon">🔄</div>
        <div class="stat-info">
          <div class="stat-value">{{ taskStats.inProgress }}</div>
          <div class="stat-label">En Progreso</div>
        </div>
      </div>
      <div class="stat-card completed">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ taskStats.completed }}</div>
          <div class="stat-label">Completadas</div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando tareas...</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
    </div>

    <!-- Lista de tareas -->
    <div v-else-if="filteredTasks.length > 0" class="tasks-grid">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="task-card"
        :class="[
          `status-${task.status.toLowerCase()}`,
          { 'overdue': isOverdue(task) }
        ]"
      >
        <div class="task-card-header">
          <div class="task-badges">
            <div class="priority-badge" :class="`priority-${task.priority.toLowerCase()}`">
              {{ getPriorityLabel(task.priority) }}
            </div>
            <div class="status-badge" :class="`status-${task.status.toLowerCase()}`">
              {{ getStatusLabel(task.status) }}
            </div>
          </div>
          <div class="task-actions">
            <button @click="openEditModal(task)" class="btn-icon" title="Editar">
              ✏️
            </button>
            <button @click="confirmDelete(task)" class="btn-icon danger" title="Eliminar">
              🗑️
            </button>
          </div>
        </div>

        <h3 class="task-title">{{ task.title }}</h3>
        <p v-if="task.description" class="task-description">{{ task.description }}</p>

        <div class="task-meta">
          <div class="meta-item">
            <span class="meta-label">📅 Vencimiento:</span>
            <span class="meta-value" :class="{ 'overdue-text': isOverdue(task) }">
              {{ formatDate(task.dueDate) }}
            </span>
          </div>
          <div v-if="task.estimatedHours" class="meta-item">
            <span class="meta-label">⏱️ Estimado:</span>
            <span class="meta-value">{{ task.estimatedHours }}h</span>
          </div>
          <div v-if="task.actualHours" class="meta-item">
            <span class="meta-label">✓ Real:</span>
            <span class="meta-value">{{ task.actualHours }}h</span>
          </div>
        </div>

        <!-- Asociaciones -->
        <div class="task-associations">
          <div v-if="task.taskType" class="association-item">
            <span class="association-icon">📋</span>
            <span class="association-text">{{ task.taskType.name }}</span>
          </div>
          <div v-if="task.clients?.length" class="association-item">
            <span class="association-icon">👥</span>
            <span class="association-text">{{ task.clients.length }} cliente(s)</span>
          </div>
          <div v-if="task.employees?.length" class="association-item">
            <span class="association-icon">👔</span>
            <span class="association-text">{{ task.employees.length }} empleado(s)</span>
          </div>
          <div v-if="task.event" class="association-item">
            <span class="association-icon">📅</span>
            <span class="association-text">{{ task.event.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>No se encontraron tareas</h3>
      <p>Crea tu primera tarea para comenzar.</p>
    </div>

    <!-- Modal de creación/edición -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? '✏️ Editar Tarea' : '➕ Crear Tarea' }}</h3>
          <button @click="closeModal" class="btn-close">✖️</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label>Título *</label>
            <input
              v-model="formData.title"
              type="text"
              required
              placeholder="Nombre de la tarea"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea
              v-model="formData.description"
              rows="3"
              placeholder="Descripción detallada de la tarea"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Estado *</label>
              <select v-model="formData.status" required class="form-select">
                <option value="PENDING">⏳ Pendiente</option>
                <option value="IN_PROGRESS">🔄 En Progreso</option>
                <option value="COMPLETED">✅ Completada</option>
                <option value="CANCELLED">❌ Cancelada</option>
              </select>
            </div>

            <div class="form-group">
              <label>Prioridad *</label>
              <select v-model="formData.priority" required class="form-select">
                <option value="LOW">🟢 Baja</option>
                <option value="MEDIUM">🟡 Media</option>
                <option value="HIGH">🟠 Alta</option>
                <option value="URGENT">🔴 Urgente</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Fecha de Vencimiento *</label>
              <input
                v-model="formData.dueDate"
                type="datetime-local"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Horas Estimadas</label>
              <input
                v-model.number="formData.estimatedHours"
                type="number"
                min="0"
                step="0.5"
                placeholder="8"
                class="form-input"
              />
            </div>
          </div>

          <div v-if="isEditing" class="form-group">
            <label>Horas Reales</label>
            <input
              v-model.number="formData.actualHours"
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>📋 Tipo de Tarea (Opcional)</label>
            <select v-model="formData.taskTypeId" class="form-select">
              <option :value="undefined">Sin tipo específico</option>
              <!-- Aquí deberías cargar los tipos de tarea disponibles -->
            </select>
          </div>

          <div class="form-group">
            <label>👥 Asociar Clientes (Opcional)</label>
            <p class="form-hint">Los clientes verán esta tarea en su portal</p>
            <!-- Multi-select de clientes -->
          </div>

          <div class="form-group">
            <label>👔 Asociar Empleados (Opcional)</label>
            <p class="form-hint">Empleados asignados a esta tarea</p>
            <!-- Multi-select de empleados -->
          </div>

          <div class="form-group">
            <label>📅 Asociar a Evento (Opcional)</label>
            <select v-model="formData.eventId" class="form-select">
              <option :value="undefined">Sin evento asociado</option>
              <!-- Multi-select de eventos -->
            </select>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-cancel">
              Cancelar
            </button>
            <button type="submit" :disabled="submitting" class="btn-submit">
              {{ submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content small" @click.stop>
        <div class="modal-header danger">
          <h3>⚠️ Confirmar Eliminación</h3>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar esta tarea?</p>
          <p class="task-to-delete"><strong>{{ taskToDelete?.title }}</strong></p>
          <p class="warning-text">Esta acción no se puede deshacer.</p>
        </div>
        <div class="form-actions">
          <button @click="showDeleteModal = false" class="btn-cancel">
            Cancelar
          </button>
          <button @click="handleDelete" :disabled="submitting" class="btn-danger">
            {{ submitting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasks } from '@/composables/useTasks'
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskPriority } from '@/types/TaskType'

const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask } = useTasks()

// Filtros
const searchQuery = ref('')
const filterStatus = ref('')
const filterPriority = ref('')

// Modal state
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const taskToDelete = ref<Task | null>(null)
const currentEditTask = ref<Task | null>(null)

// Form data
const formData = ref<CreateTaskRequest>({
  title: '',
  description: '',
  status: 'PENDING',
  priority: 'MEDIUM',
  dueDate: '',
  estimatedHours: undefined,
  actualHours: undefined,
  clientIds: [],
  employeeIds: [],
  taskTypeId: undefined,
  eventId: undefined
})

// Computed
const filteredTasks = computed(() => {
  let filtered = [...tasks.value]

  // Buscar
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
    )
  }

  // Filtrar por estado
  if (filterStatus.value) {
    filtered = filtered.filter((task) => task.status === filterStatus.value)
  }

  // Filtrar por prioridad
  if (filterPriority.value) {
    filtered = filtered.filter((task) => task.priority === filterPriority.value)
  }

  // Ordenar: primero urgentes y vencidas, luego por fecha
  return filtered.sort((a, b) => {
    // Primero urgentes
    if (a.priority === 'URGENT' && b.priority !== 'URGENT') return -1
    if (b.priority === 'URGENT' && a.priority !== 'URGENT') return 1

    // Luego vencidas
    const aOverdue = isOverdue(a)
    const bOverdue = isOverdue(b)
    if (aOverdue && !bOverdue) return -1
    if (bOverdue && !aOverdue) return 1

    // Finalmente por fecha de vencimiento
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
})

const taskStats = computed(() => ({
  total: tasks.value.length,
  pending: tasks.value.filter(t => t.status === 'PENDING').length,
  inProgress: tasks.value.filter(t => t.status === 'IN_PROGRESS').length,
  completed: tasks.value.filter(t => t.status === 'COMPLETED').length
}))

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPriorityLabel = (priority: TaskPriority) => {
  const labels: Record<TaskPriority, string> = {
    LOW: '🟢 Baja',
    MEDIUM: '🟡 Media',
    HIGH: '🟠 Alta',
    URGENT: '🔴 Urgente'
  }
  return labels[priority]
}

const getStatusLabel = (status: TaskStatus) => {
  const labels: Record<TaskStatus, string> = {
    PENDING: '⏳ Pendiente',
    IN_PROGRESS: '🔄 En Progreso',
    COMPLETED: '✅ Completada',
    CANCELLED: '❌ Cancelada'
  }
  return labels[status]
}

const isOverdue = (task: Task) => {
  if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
    return false
  }
  return new Date(task.dueDate) < new Date()
}

// Modal functions
const openCreateModal = () => {
  isEditing.value = false
  currentEditTask.value = null
  formData.value = {
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '',
    estimatedHours: undefined,
    actualHours: undefined,
    clientIds: [],
    employeeIds: [],
    taskTypeId: undefined,
    eventId: undefined
  }
  showModal.value = true
}

const openEditModal = (task: Task) => {
  isEditing.value = true
  currentEditTask.value = task
  formData.value = {
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    estimatedHours: task.estimatedHours,
    actualHours: task.actualHours,
    clientIds: task.clients?.map((c) => c.id) || [],
    employeeIds: task.employees?.map((e) => e.id) || [],
    taskTypeId: task.taskType?.id,
    eventId: task.event?.id
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  currentEditTask.value = null
}

const confirmDelete = (task: Task) => {
  taskToDelete.value = task
  showDeleteModal.value = true
}

// CRUD operations
const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEditing.value && currentEditTask.value) {
      await updateTask(currentEditTask.value.id, formData.value as UpdateTaskRequest)
    } else {
      await createTask(formData.value)
    }
    closeModal()
    await fetchTasks()
  } catch (err) {
    console.error('Error al guardar tarea:', err)
  } finally {
    submitting.value = false
  }
}

const handleDelete = async () => {
  if (!taskToDelete.value) return

  submitting.value = true
  try {
    await deleteTask(taskToDelete.value.id)
    showDeleteModal.value = false
    taskToDelete.value = null
    await fetchTasks()
  } catch (err) {
    console.error('Error al eliminar tarea:', err)
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.task-management {
  width: 100%;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.management-header h2 {
  font-size: 1.8rem;
  color: #1e293b;
  margin: 0;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* Filters */
.filters-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
}

.filter-input,
.filter-select {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #667eea;
}

.stat-card.pending {
  border-left-color: #f59e0b;
}

.stat-card.progress {
  border-left-color: #3b82f6;
}

.stat-card.completed {
  border-left-color: #10b981;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
}

/* Loading & Error states */
.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  color: #ef4444;
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

/* Tasks Grid */
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.task-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-left-width: 6px;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
}

.task-card.status-pending {
  border-left-color: #f59e0b;
}

.task-card.status-in_progress {
  border-left-color: #3b82f6;
}

.task-card.status-completed {
  border-left-color: #10b981;
  opacity: 0.8;
}

.task-card.status-cancelled {
  border-left-color: #ef4444;
  opacity: 0.6;
}

.task-card.overdue {
  border-left-color: #dc2626;
  background: linear-gradient(135deg, #fff 0%, #fee2e2 100%);
}

.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.task-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.priority-badge,
.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.priority-badge.priority-low {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.priority-badge.priority-medium {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.priority-badge.priority-high {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
}

.priority-badge.priority-urgent {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.status-badge.status-pending {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.status-badge.status-in_progress {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.status-badge.status-completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.status-badge.status-cancelled {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: #f1f5f9;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e2e8f0;
  transform: scale(1.1);
}

.btn-icon.danger:hover {
  background: #fee2e2;
}

.task-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
}

.task-description {
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.meta-label {
  color: #94a3b8;
  font-weight: 500;
}

.meta-value {
  color: #334155;
  font-weight: 600;
}

.overdue-text {
  color: #dc2626;
  font-weight: 700;
}

.task-associations {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.association-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8fafc;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
}

.association-icon {
  font-size: 1rem;
}

.association-text {
  color: #475569;
  font-weight: 500;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.4rem;
  color: #334155;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #64748b;
  margin: 0;
}

/* Modal (reusing same styles as EventManagement) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.modal-content.small {
  max-width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.modal-header.danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-bottom-color: #ef4444;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #1e293b;
}

.btn-close {
  background: #f1f5f9;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e2e8f0;
  transform: rotate(90deg);
}

.modal-body {
  padding: 1.5rem;
}

.task-to-delete {
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 1rem 0;
}

.warning-text {
  color: #ef4444;
  font-weight: 600;
  text-align: center;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-hint {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.25rem;
  font-weight: 400;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e2e8f0;
}

.btn-cancel,
.btn-submit,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .management-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-create {
    justify-content: center;
  }

  .tasks-grid {
    grid-template-columns: 1fr;
  }

  .filters-section {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-height: 95vh;
  }
}
</style>
