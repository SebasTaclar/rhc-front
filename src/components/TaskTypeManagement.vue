<template>
  <div class="task-type-management">
    <div class="header">
      <div class="header-content">
        <h2>Tipos de Tarea</h2>
        <p class="subtitle">Gestiona los tipos de tareas contables disponibles</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary">
        <span class="icon">+</span>
        Nuevo Tipo de Tarea
      </button>
    </div>

    <!-- Estadísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #dbeafe;">📋</div>
        <div class="stat-content">
          <div class="stat-value">{{ taskTypes.length }}</div>
          <div class="stat-label">Total Tipos</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #dcfce7;">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ activeTaskTypes }}</div>
          <div class="stat-label">Activos</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #fee2e2;">⏸️</div>
        <div class="stat-content">
          <div class="stat-value">{{ inactiveTaskTypes }}</div>
          <div class="stat-label">Inactivos</div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando tipos de tarea...</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      {{ error }}
    </div>

    <!-- Filtros y búsqueda -->
    <div v-if="!loading && taskTypes.length > 0" class="filters-section">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar tipo de tarea..."
          class="search-input"
        />
      </div>
      <div class="filter-buttons">
        <button
          @click="filterStatus = 'all'"
          class="filter-btn"
          :class="{ active: filterStatus === 'all' }"
        >
          Todos ({{ taskTypes.length }})
        </button>
        <button
          @click="filterStatus = 'active'"
          class="filter-btn"
          :class="{ active: filterStatus === 'active' }"
        >
          Activos ({{ activeTaskTypes }})
        </button>
        <button
          @click="filterStatus = 'inactive'"
          class="filter-btn"
          :class="{ active: filterStatus === 'inactive' }"
        >
          Inactivos ({{ inactiveTaskTypes }})
        </button>
      </div>
    </div>

    <!-- Grid de tarjetas -->
    <div v-if="!loading && filteredTaskTypes.length > 0" class="cards-grid">
      <div v-for="taskType in filteredTaskTypes" :key="taskType.id" class="task-card">
        <div class="card-header">
          <div class="card-title-section">
            <h3 class="card-title">{{ taskType.name }}</h3>
            <span class="card-id">#{{ taskType.id }}</span>
          </div>
          <div class="card-status">
            <span class="status-badge" :class="taskType.active ? 'active' : 'inactive'">
              {{ taskType.active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>

        <div class="card-body">
          <p v-if="taskType.description" class="card-description">
            {{ taskType.description }}
          </p>
          <p v-else class="card-description empty">Sin descripción</p>
        </div>

        <div class="card-footer">
          <div class="card-meta">
            <span class="meta-item" v-if="taskType.createdAt">
              <span class="meta-icon">📅</span>
              {{ formatDate(taskType.createdAt) }}
            </span>
          </div>
          <div class="card-actions">
            <button @click="openEditModal(taskType)" class="action-btn primary" title="Editar">
              ✏️
            </button>
            <button
              @click="toggleActive(taskType)"
              class="action-btn"
              :class="taskType.active ? 'warning' : 'success'"
              :title="taskType.active ? 'Desactivar' : 'Activar'"
            >
              {{ taskType.active ? '⏸️' : '▶️' }}
            </button>
            <button @click="confirmDelete(taskType)" class="action-btn danger" title="Eliminar">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin resultados -->
    <div
      v-if="!loading && taskTypes.length > 0 && filteredTaskTypes.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">🔍</div>
      <p>No se encontraron tipos de tarea con los filtros aplicados</p>
      <button @click="clearFilters" class="btn btn-secondary">Limpiar Filtros</button>
    </div>

    <!-- Sin tipos de tarea -->
    <div v-if="!loading && taskTypes.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <p>No hay tipos de tarea registrados</p>
      <button @click="openCreateModal" class="btn btn-primary">Crear Primer Tipo de Tarea</button>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Editar Tipo de Tarea' : 'Nuevo Tipo de Tarea' }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-group">
            <label
              >Nombre *
              <span class="required">(obligatorio)</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              class="form-input"
              required
              placeholder="Ej: Declaración de Renta Persona Natural"
            />
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea
              v-model="formData.description"
              class="form-textarea"
              rows="4"
              placeholder="Describe brevemente este tipo de tarea..."
            ></textarea>
            <small>Opcional - Proporciona más contexto sobre este tipo de tarea</small>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input v-model="formData.active" type="checkbox" class="checkbox-input" />
              <span class="checkbox-text">
                <strong>Activo</strong>
                <small>Los tipos de tarea activos están disponibles para asignación</small>
              </span>
            </label>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ isEditMode ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmación -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
      <div class="modal-content confirm-modal" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
        </div>
        <div class="modal-body">
          <div class="confirm-content">
            <div class="confirm-icon">⚠️</div>
            <p>
              ¿Está seguro de eliminar el tipo de tarea
              <strong>{{ taskTypeToDelete?.name }}</strong
              >?
            </p>
            <p class="warning">Esta acción no se puede deshacer.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showConfirmModal = false" class="btn btn-secondary">Cancelar</button>
          <button @click="handleDelete" class="btn btn-danger">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskTypes } from '@/composables/useTaskTypes'
import type { TaskType } from '@/types/TaskTypeApi'

const {
  taskTypes,
  loading,
  error,
  fetchTaskTypes,
  createTaskType,
  updateTaskType,
  deleteTaskType,
  toggleTaskTypeActive
} = useTaskTypes()

const showModal = ref(false)
const showConfirmModal = ref(false)
const isEditMode = ref(false)
const taskTypeToDelete = ref<TaskType | null>(null)
const searchQuery = ref('')
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')

const formData = ref({
  name: '',
  description: '',
  active: true
})

const currentTaskTypeId = ref<number | null>(null)

// Computed
const activeTaskTypes = computed(() => taskTypes.value.filter((tt) => tt.active).length)
const inactiveTaskTypes = computed(() => taskTypes.value.filter((tt) => !tt.active).length)

const filteredTaskTypes = computed(() => {
  let filtered = taskTypes.value

  // Filtrar por estado
  if (filterStatus.value === 'active') {
    filtered = filtered.filter((tt) => tt.active)
  } else if (filterStatus.value === 'inactive') {
    filtered = filtered.filter((tt) => !tt.active)
  }

  // Filtrar por búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (tt) =>
        tt.name.toLowerCase().includes(query) ||
        (tt.description && tt.description.toLowerCase().includes(query))
    )
  }

  return filtered
})

// Cargar tipos de tarea al montar
onMounted(() => {
  fetchTaskTypes()
})

// Formatear fecha
const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Abrir modal de creación
const openCreateModal = () => {
  isEditMode.value = false
  formData.value = {
    name: '',
    description: '',
    active: true
  }
  showModal.value = true
}

// Abrir modal de edición
const openEditModal = (taskType: TaskType) => {
  isEditMode.value = true
  currentTaskTypeId.value = taskType.id
  formData.value = {
    name: taskType.name,
    description: taskType.description || '',
    active: taskType.active
  }
  showModal.value = true
}

// Cerrar modal
const closeModal = () => {
  showModal.value = false
  isEditMode.value = false
  currentTaskTypeId.value = null
}

// Manejar envío del formulario
const handleSubmit = async () => {
  const data = {
    name: formData.value.name,
    description: formData.value.description || null,
    active: formData.value.active
  }

  if (isEditMode.value && currentTaskTypeId.value) {
    await updateTaskType(currentTaskTypeId.value, data)
  } else {
    await createTaskType(data)
  }

  if (!error.value) {
    closeModal()
  }
}

// Alternar estado activo
const toggleActive = async (taskType: TaskType) => {
  await toggleTaskTypeActive(taskType.id, !taskType.active)
}

// Confirmar eliminación
const confirmDelete = (taskType: TaskType) => {
  taskTypeToDelete.value = taskType
  showConfirmModal.value = true
}

// Eliminar tipo de tarea
const handleDelete = async () => {
  if (taskTypeToDelete.value) {
    await deleteTaskType(taskTypeToDelete.value.id)
    showConfirmModal.value = false
    taskTypeToDelete.value = null
  }
}

// Limpiar filtros
const clearFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'all'
}
</script>

<style scoped>
.task-type-management {
  background: #f8fafc;
  min-height: 100vh;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

/* Filtros */
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.625rem 1rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.filter-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

/* Grid de tarjetas */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.task-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid transparent;
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: #3b82f6;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 2px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.card-title-section {
  flex: 1;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.card-id {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.card-body {
  padding: 1.5rem;
  flex: 1;
}

.card-description {
  color: #475569;
  line-height: 1.6;
  margin: 0;
  font-size: 0.9375rem;
}

.card-description.empty {
  color: #94a3b8;
  font-style: italic;
}

.card-footer {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.card-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.meta-icon {
  font-size: 1rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #dbeafe;
  color: #1e40af;
}

.action-btn.primary:hover {
  background: #3b82f6;
  color: white;
  transform: scale(1.1);
}

.action-btn.success {
  background: #dcfce7;
  color: #166534;
}

.action-btn.success:hover {
  background: #10b981;
  color: white;
  transform: scale(1.1);
}

.action-btn.warning {
  background: #fef3c7;
  color: #92400e;
}

.action-btn.warning:hover {
  background: #f59e0b;
  color: white;
  transform: scale(1.1);
}

.action-btn.danger {
  background: #fee2e2;
  color: #991b1b;
}

.action-btn.danger:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
}

.loading {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  background: #fef2f2;
  color: #991b1b;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  border: 2px solid #fecaca;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
  font-size: 1.05rem;
}

/* Modal */
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
}

.confirm-modal {
  max-width: 450px;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: 1.75rem 2rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.75rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1e293b;
}

.modal-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.625rem;
  font-size: 0.9375rem;
}

.required {
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 400;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9375rem;
  color: #1f2937;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-group small {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.checkbox-group {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  margin: 0;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-top: 2px;
}

.checkbox-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.checkbox-text strong {
  color: #1e293b;
  font-weight: 600;
}

.checkbox-text small {
  color: #64748b;
  font-size: 0.8125rem;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 2px solid #e2e8f0;
  background: #f8fafc;
}

.confirm-content {
  text-align: center;
}

.confirm-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.confirm-content p {
  margin: 0 0 1rem;
  color: #1e293b;
  font-size: 1.05rem;
}

.confirm-content .warning {
  color: #dc2626;
  font-weight: 600;
  font-size: 0.9375rem;
}

/* Responsive */
@media (max-width: 768px) {
  .task-type-management {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header .btn {
    width: 100%;
    justify-content: center;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: 100%;
  }

  .filter-buttons {
    flex-wrap: wrap;
  }

  .filter-btn {
    flex: 1;
    min-width: calc(50% - 0.25rem);
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1.25rem;
  }
}
</style>
