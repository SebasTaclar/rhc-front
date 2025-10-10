<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content task-modal" @click.stop>
      <div class="modal-header">
        <h3>{{ isEditing ? 'Editar Tarea' : 'Nueva Tarea' }}</h3>
        <button @click="closeModal" class="close-button">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-grid">
          <!-- Título -->
          <div class="form-group full-width">
            <label for="title">Título *</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              class="form-input"
              placeholder="Ingresa el título de la tarea"
              required
            />
          </div>

          <!-- Descripción -->
          <div class="form-group full-width">
            <label for="description">Descripción</label>
            <textarea
              id="description"
              v-model="formData.description"
              class="form-textarea"
              placeholder="Describe los detalles de la tarea"
              rows="3"
            ></textarea>
          </div>

          <!-- Cliente -->
          <div class="form-group">
            <label for="client">Cliente *</label>
            <select
              id="client"
              v-model="formData.clientId"
              class="form-select"
              required
            >
              <option value="">Seleccionar cliente</option>
              <option
                v-for="client in clients"
                :key="client.id"
                :value="client.id"
              >
                {{ client.name }}
              </option>
            </select>
          </div>

          <!-- Prioridad -->
          <div class="form-group">
            <label for="priority">Prioridad</label>
            <select
              id="priority"
              v-model="formData.priority"
              class="form-select"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <!-- Fecha de vencimiento -->
          <div class="form-group">
            <label for="dueDate">Fecha de vencimiento *</label>
            <input
              id="dueDate"
              v-model="formData.dueDate"
              type="date"
              class="form-input"
              required
            />
          </div>

          <!-- Horas estimadas -->
          <div class="form-group">
            <label for="estimatedHours">Horas estimadas</label>
            <input
              id="estimatedHours"
              v-model.number="formData.estimatedHours"
              type="number"
              class="form-input"
              min="0"
              step="0.5"
              placeholder="0"
            />
          </div>

          <!-- Horas reales (solo en edición) -->
          <div v-if="isEditing" class="form-group">
            <label for="actualHours">Horas reales</label>
            <input
              id="actualHours"
              v-model.number="formData.actualHours"
              type="number"
              class="form-input"
              min="0"
              step="0.5"
              placeholder="0"
            />
          </div>

          <!-- Estado (solo en edición) -->
          <div v-if="isEditing" class="form-group">
            <label for="status">Estado</label>
            <select
              id="status"
              v-model="formData.status"
              class="form-select"
            >
              <option value="pendiente">Pendiente</option>
              <option value="en-progreso">En Progreso</option>
              <option value="revision">En Revisión</option>
              <option value="completado">Completado</option>
            </select>
          </div>

          <!-- Miembros asignados -->
          <div class="form-group full-width">
            <label>Miembros asignados</label>
            <div class="members-grid">
              <div
                v-for="member in members"
                :key="member.id"
                class="member-checkbox"
                :class="{ 'member-unavailable': member.status === 'ausente' }"
              >
                <input
                  :id="`member-${member.id}`"
                  v-model="selectedMembers"
                  type="checkbox"
                  :value="member.id"
                  :disabled="member.status === 'ausente'"
                />
                <label :for="`member-${member.id}`" class="member-label">
                  <div class="member-avatar" :class="`status-${member.status}`">
                    {{ getInitials(member.name) }}
                  </div>
                  <div class="member-info">
                    <div class="member-name">{{ member.name }}</div>
                    <div class="member-details">
                      {{ member.role }} • {{ member.location }}
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
                  </div>
                  <div class="member-status" :class="`status-${member.status}`">
                    {{ getStatusLabel(member.status) }}
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="form-group full-width">
            <label for="tags">Etiquetas</label>
            <div class="tags-input">
              <div class="tags-list">
                <span
                  v-for="(tag, index) in formData.tags"
                  :key="index"
                  class="tag-item"
                >
                  {{ tag }}
                  <button
                    type="button"
                    @click="removeTag(index)"
                    class="tag-remove"
                  >
                    ×
                  </button>
                </span>
              </div>
              <input
                v-model="newTag"
                @keydown.enter.prevent="addTag"
                @keydown="handleTagInput"
                type="text"
                class="tag-input"
                placeholder="Agregar etiqueta (Enter o coma para añadir)"
              />
            </div>
          </div>
        </div>

        <!-- Comentarios (solo en edición) -->
        <div v-if="isEditing && task && task.comments && task.comments.length > 0" class="comments-section">
          <h4>Comentarios</h4>
          <div class="comments-list">
            <div
              v-for="comment in task.comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-header">
                <strong>{{ comment.author }}</strong>
                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="closeModal" class="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? 'Actualizar' : 'Crear' }} Tarea
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Task, TeamMember, Client } from '@/types/TeamManagementType'

interface Props {
  task?: Task | null
  members: TeamMember[]
  clients: Client[]
}

interface Emits {
  (e: 'close'): void
  (e: 'save', task: Partial<Task>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isEditing = computed(() => !!props.task)

const formData = ref({
  title: '',
  description: '',
  clientId: '',
  priority: 'media' as Task['priority'],
  status: 'pendiente' as Task['status'],
  dueDate: '',
  estimatedHours: 0,
  actualHours: 0,
  tags: [] as string[]
})

const selectedMembers = ref<string[]>([])
const newTag = ref('')

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const addTag = () => {
  const tag = newTag.value.trim().replace(',', '')
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    newTag.value = ''
  }
}

const handleTagInput = (event: KeyboardEvent) => {
  if (event.key === ',') {
    event.preventDefault()
    addTag()
  }
}

const removeTag = (index: number) => {
  formData.value.tags.splice(index, 1)
}

const closeModal = () => {
  emit('close')
}

const handleSubmit = () => {
  const assignedMembers = props.members.filter(member =>
    selectedMembers.value.includes(member.id)
  )

  const taskData: Partial<Task> = {
    ...formData.value,
    assignedTo: assignedMembers
  }

  emit('save', taskData)
}

// Inicializar datos del formulario
watch(() => props.task, (newTask) => {
  if (newTask) {
    formData.value = {
      title: newTask.title,
      description: newTask.description,
      clientId: newTask.clientId,
      priority: newTask.priority,
      status: newTask.status,
      dueDate: newTask.dueDate,
      estimatedHours: newTask.estimatedHours,
      actualHours: newTask.actualHours || 0,
      tags: [...newTask.tags]
    }
    selectedMembers.value = newTask.assignedTo.map(member => member.id)
  } else {
    // Resetear formulario para nueva tarea
    formData.value = {
      title: '',
      description: '',
      clientId: '',
      priority: 'media',
      status: 'pendiente',
      dueDate: '',
      estimatedHours: 0,
      actualHours: 0,
      tags: []
    }
    selectedMembers.value = []
  }
}, { immediate: true })

onMounted(() => {
  // Establecer fecha mínima como hoy
  const today = new Date().toISOString().split('T')[0]
  const dueDateInput = document.getElementById('dueDate') as HTMLInputElement
  if (dueDateInput) {
    dueDateInput.min = today
  }
})
</script>

<style scoped>
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
  width: 800px;
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
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.member-checkbox {
  position: relative;
}

.member-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.member-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.member-label:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.member-checkbox input:checked + .member-label {
  border-color: #3b82f6;
  background: #eff6ff;
}

.member-checkbox.member-unavailable .member-label {
  opacity: 0.5;
  cursor: not-allowed;
}

.member-checkbox.member-unavailable .member-label:hover {
  border-color: #e5e7eb;
  background: white;
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
  font-size: 0.875rem;
  flex-shrink: 0;
}

.member-avatar.status-ocupado {
  background: #f59e0b;
}

.member-avatar.status-ausente {
  background: #64748b;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.member-details {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.5rem;
  text-transform: capitalize;
}

.member-workload {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.workload-bar {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
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
  font-size: 0.625rem;
  font-weight: 600;
  color: #374151;
}

.member-status {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  text-align: center;
  flex-shrink: 0;
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

.tags-input {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem;
  background: white;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag-item {
  background: #e5e7eb;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tag-remove {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
}

.tag-remove:hover {
  color: #ef4444;
}

.tag-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.875rem;
}

.comments-section {
  margin-bottom: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.comments-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-header strong {
  color: #1e293b;
  font-size: 0.875rem;
}

.comment-date {
  color: #64748b;
  font-size: 0.75rem;
}

.comment-content {
  color: #374151;
  font-size: 0.875rem;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
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

/* Responsive design */
@media (max-width: 768px) {
  .task-modal {
    width: 95vw;
    height: 95vh;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .members-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
