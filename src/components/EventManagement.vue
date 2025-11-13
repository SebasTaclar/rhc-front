<template>
  <div class="event-management">
    <div class="management-header">
      <h2>📅 Gestión de Eventos</h2>
      <button @click="openCreateModal" class="btn-create">
        <span>➕</span>
        Crear Evento
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
        <label>📋 Tipo:</label>
        <select v-model="filterType" class="filter-select">
          <option value="">Todos</option>
          <option value="MEETING">Reunión</option>
          <option value="DEADLINE">Fecha Límite</option>
          <option value="REMINDER">Recordatorio</option>
          <option value="OTHER">Otro</option>
        </select>
      </div>
      <div class="filter-group">
        <label>🔒 Privacidad:</label>
        <select v-model="filterPrivacy" class="filter-select">
          <option value="">Todos</option>
          <option value="public">Público</option>
          <option value="private">Privado</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando eventos...</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
    </div>

    <!-- Lista de eventos -->
    <div v-else-if="filteredEvents.length > 0" class="events-grid">
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="event-card"
        :class="{ 'past-event': isPastEvent(event) }"
      >
        <div class="event-card-header">
          <div class="event-type-badge" :class="`type-${event.eventType.toLowerCase()}`">
            {{ getEventTypeLabel(event.eventType) }}
          </div>
          <div class="event-actions">
            <button @click="openEditModal(event)" class="btn-icon" title="Editar">
              ✏️
            </button>
            <button
              v-if="canDeleteEvents"
              @click="confirmDelete(event)"
              class="btn-icon danger"
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        </div>

        <h3 class="event-title">{{ event.title }}</h3>
        <p v-if="event.description" class="event-description">{{ event.description }}</p>

        <div class="event-meta">
          <div class="meta-item">
            <span class="meta-label">📅 Inicio:</span>
            <span class="meta-value">{{ formatDate(event.startDate) }}</span>
          </div>
          <div v-if="event.endDate" class="meta-item">
            <span class="meta-label">🏁 Fin:</span>
            <span class="meta-value">{{ formatDate(event.endDate) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ event.isPrivate ? '🔒' : '🌐' }}</span>
            <span class="meta-value">{{ event.isPrivate ? 'Privado' : 'Público' }}</span>
          </div>
        </div>

        <!-- Asociaciones -->
        <div v-if="event.clients?.length || event.employees?.length" class="event-associations">
          <div v-if="event.clients?.length" class="association-group">
            <span class="association-label">👥 Clientes:</span>
            <span class="association-count">{{ event.clients.length }}</span>
          </div>
          <div v-if="event.employees?.length" class="association-group">
            <span class="association-label">👔 Empleados:</span>
            <span class="association-count">{{ event.employees.length }}</span>
          </div>
        </div>

        <!-- Documentos -->
        <div v-if="event.documents && event.documents.length > 0" class="event-documents">
          <div class="documents-header">
            <span class="documents-label">📎 Documentos:</span>
            <span class="documents-count">{{ event.documents.length }}</span>
          </div>
          <div class="documents-grid">
            <a
              v-for="(doc, index) in event.documents"
              :key="index"
              :href="doc.url"
              target="_blank"
              class="document-link"
              :title="doc.description || doc.name"
            >
              <span class="doc-icon">📄</span>
              <span class="doc-name">{{ doc.name }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>No se encontraron eventos</h3>
      <p>Crea tu primer evento para comenzar.</p>
    </div>

    <!-- Modal de creación/edición -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? '✏️ Editar Evento' : '➕ Crear Evento' }}</h3>
          <button @click="closeModal" class="btn-close">✖️</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label>Título *</label>
            <input
              v-model="formData.title"
              type="text"
              required
              placeholder="Nombre del evento"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea
              v-model="formData.description"
              rows="3"
              placeholder="Descripción del evento (opcional)"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Fecha de Inicio *</label>
              <input
                v-model="formData.startDate"
                type="datetime-local"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Fecha de Fin</label>
              <input
                v-model="formData.endDate"
                type="datetime-local"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Tipo de Evento *</label>
              <select v-model="formData.eventType" required class="form-select">
                <option value="MEETING">📋 Reunión</option>
                <option value="DEADLINE">⏰ Fecha Límite</option>
                <option value="REMINDER">🔔 Recordatorio</option>
                <option value="OTHER">📌 Otro</option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="formData.isPrivate"
                  type="checkbox"
                  class="form-checkbox"
                />
                <span>🔒 Evento Privado</span>
              </label>
              <small class="form-hint">Los eventos son privados por defecto</small>
            </div>
          </div>

          <!-- Asociaciones -->
          <div class="form-group">
            <label>👥 Asociar Cliente (Opcional)</label>
            <select v-model="selectedClientId" class="form-select">
              <option value="">Ninguno</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.businessName }}
              </option>
            </select>
            <small class="form-hint">El cliente asociado podrá ver este evento en su portal</small>
          </div>

          <div class="form-group">
            <label>
              👔 Asociar Empleados (Opcional)
              <span v-if="formData.employeeIds && formData.employeeIds.length > 0" class="selected-count">
                {{ formData.employeeIds.length }} seleccionado{{ formData.employeeIds.length > 1 ? 's' : '' }}
              </span>
            </label>
            <div class="employees-selection">
              <label
                v-for="employee in employees"
                :key="employee.id"
                class="employee-option"
              >
                <input
                  type="checkbox"
                  :value="employee.id"
                  v-model="formData.employeeIds"
                  class="employee-checkbox"
                />
                <div class="employee-info">
                  <div class="employee-avatar">
                    {{ getInitials(employee.name) }}
                  </div>
                  <div class="employee-details">
                    <span class="employee-name">{{ employee.name }}</span>
                    <span class="employee-role">{{ employee.role }}</span>
                  </div>
                </div>
              </label>
            </div>
            <small class="form-hint">Los empleados asociados recibirán notificaciones</small>
          </div>

          <!-- Documentos -->
          <div class="form-group documents-section">
            <label>
              📎 Documentos Adjuntos (Opcional)
              <span v-if="formData.documents && formData.documents.length > 0" class="selected-count">
                {{ formData.documents.length }} documento{{ formData.documents.length > 1 ? 's' : '' }}
              </span>
            </label>

            <div class="documents-list">
              <div
                v-for="(doc, index) in formData.documents"
                :key="index"
                class="document-item"
              >
                <div class="document-icon">📄</div>
                <div class="document-info">
                  <div class="document-name">{{ doc.name }}</div>
                  <div class="document-url">{{ doc.url }}</div>
                  <div v-if="doc.description" class="document-description">{{ doc.description }}</div>
                </div>
                <button
                  type="button"
                  @click="removeDocument(index)"
                  class="btn-remove-doc"
                  title="Eliminar documento"
                >
                  ✖️
                </button>
              </div>

              <div v-if="!formData.documents || formData.documents.length === 0" class="no-documents">
                <span class="empty-icon">📭</span>
                <p>No hay documentos adjuntos</p>
              </div>
            </div>

            <div class="add-document-form">
              <input
                v-model="newDocument.name"
                type="text"
                placeholder="Nombre del documento"
                class="form-input-small"
              />
              <input
                v-model="newDocument.url"
                type="url"
                placeholder="URL del documento"
                class="form-input-small"
              />
              <input
                v-model="newDocument.description"
                type="text"
                placeholder="Descripción (opcional)"
                class="form-input-small"
              />
              <button
                type="button"
                @click="addDocument"
                class="btn-add-doc"
                :disabled="!newDocument.name || !newDocument.url"
              >
                ➕ Agregar
              </button>
            </div>
            <small class="form-hint">Adjunta documentos relevantes como PDFs, hojas de cálculo, presentaciones, etc.</small>
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
          <p>¿Estás seguro de que deseas eliminar este evento?</p>
          <p class="event-to-delete"><strong>{{ eventToDelete?.title }}</strong></p>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useEvents } from '@/composables/useEvents'
import { useClients } from '@/composables/useClients'
import { useEmployees } from '@/composables/useEmployees'
import { useAuth } from '@/composables/useAuth'
import type { Event, CreateEventRequest, UpdateEventRequest } from '@/types/EventType'

const { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent } = useEvents()
const { clients, fetchClients } = useClients()
const { employees, fetchEmployees } = useEmployees()
const { canDeleteEvents } = useAuth()

// Filtros
const searchQuery = ref('')
const filterType = ref('')
const filterPrivacy = ref('')

// Modal state
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const eventToDelete = ref<Event | null>(null)
const selectedClientId = ref<number | string>('')

// Form data
const formData = ref<CreateEventRequest | UpdateEventRequest>({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  eventType: 'OTHER',
  isPrivate: true,
  clientIds: [],
  employeeIds: [],
  documents: []
})

// Nuevo documento temporal
const newDocument = ref({
  name: '',
  url: '',
  description: ''
})

// Función para agregar documento
const addDocument = () => {
  if (newDocument.value.name && newDocument.value.url) {
    if (!formData.value.documents) {
      formData.value.documents = []
    }
    formData.value.documents.push({
      name: newDocument.value.name,
      url: newDocument.value.url,
      description: newDocument.value.description || undefined
    })
    // Limpiar formulario
    newDocument.value = {
      name: '',
      url: '',
      description: ''
    }
  }
}

// Función para eliminar documento
const removeDocument = (index: number) => {
  if (formData.value.documents) {
    formData.value.documents.splice(index, 1)
  }
}

// Función para obtener iniciales
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Formatear fecha para input datetime-local
const formatDateTimeLocal = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Watch para sincronizar selectedClientId con clientIds
watch(selectedClientId, (newVal) => {
  if (newVal) {
    formData.value.clientIds = [Number(newVal)]
  } else {
    formData.value.clientIds = []
  }
})

// Computed
const filteredEvents = computed(() => {
  let filtered = [...events.value]

  // Buscar
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
    )
  }

  // Filtrar por tipo
  if (filterType.value) {
    filtered = filtered.filter((event) => event.eventType === filterType.value)
  }

  // Filtrar por privacidad
  if (filterPrivacy.value === 'public') {
    filtered = filtered.filter((event) => !event.isPrivate)
  } else if (filterPrivacy.value === 'private') {
    filtered = filtered.filter((event) => event.isPrivate)
  }

  // Ordenar por fecha de inicio (más recientes primero)
  return filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
})

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

const getEventTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    MEETING: '📋 Reunión',
    DEADLINE: '⏰ Fecha Límite',
    REMINDER: '🔔 Recordatorio',
    OTHER: '📌 Otro'
  }
  return labels[type] || type
}

const isPastEvent = (event: Event) => {
  return new Date(event.startDate) < new Date()
}

// Modal functions
const openCreateModal = () => {
  isEditing.value = false
  formData.value = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    eventType: 'OTHER',
    isPrivate: true,
    clientIds: [],
    employeeIds: [],
    documents: []
  }
  // Limpiar nuevo documento
  newDocument.value = {
    name: '',
    url: '',
    description: ''
  }
  showModal.value = true
}

const openEditModal = (event: Event) => {
  isEditing.value = true

  // Obtener IDs de clientes (del campo directo o extrayendo del objeto)
  const clientIdsToUse = event.clientIds || event.clients?.map((c) => c.id) || []

  // Obtener IDs de empleados (del campo directo o extrayendo del objeto)
  const employeeIdsToUse = event.employeeIds || event.employees?.map((e) => e.id) || []

  formData.value = {
    title: event.title,
    description: event.description || '',
    startDate: formatDateTimeLocal(event.startDate),
    endDate: formatDateTimeLocal(event.endDate || ''),
    eventType: event.eventType,
    isPrivate: event.isPrivate,
    clientIds: clientIdsToUse,
    employeeIds: employeeIdsToUse,
    documents: event.documents ? [...event.documents.map(doc => ({
      name: doc.name,
      url: doc.url,
      description: doc.description
    }))] : []
  }

  // Inicializar cliente seleccionado
  selectedClientId.value = clientIdsToUse.length > 0 ? clientIdsToUse[0] : ''

  // Limpiar nuevo documento
  newDocument.value = {
    name: '',
    url: '',
    description: ''
  }

  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  selectedClientId.value = ''
  // Limpiar nuevo documento
  newDocument.value = {
    name: '',
    url: '',
    description: ''
  }
  formData.value = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    eventType: 'OTHER',
    isPrivate: true,
    clientIds: [],
    employeeIds: []
  }
}

const confirmDelete = (event: Event) => {
  eventToDelete.value = event
  showDeleteModal.value = true
}

// CRUD operations
const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEditing.value && eventToDelete.value) {
      await updateEvent(eventToDelete.value.id, formData.value as UpdateEventRequest)
    } else {
      await createEvent(formData.value as CreateEventRequest)
    }
    closeModal()
    await fetchEvents()
  } catch (err) {
    console.error('Error al guardar evento:', err)
  } finally {
    submitting.value = false
  }
}

const handleDelete = async () => {
  if (!eventToDelete.value) return

  submitting.value = true
  try {
    await deleteEvent(eventToDelete.value.id)
    showDeleteModal.value = false
    eventToDelete.value = null
    await fetchEvents()
  } catch (err) {
    console.error('Error al eliminar evento:', err)
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchEvents(),
    fetchClients(),
    fetchEmployees()
  ])
})
</script>

<style scoped>
.event-management {
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
  color: #0f172a;
  margin: 0;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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
  font-size: 0.9375rem;
  font-weight: 700;
  color: #334155;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.filter-input,
.filter-select {
  padding: 0.75rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  transition: border-color 0.2s;
  background: white;
}

.filter-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.filter-select option {
  font-weight: 600;
  color: #0f172a;
  padding: 0.5rem;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Loading & Error states */
.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
}

.loading-state p {
  color: #475569;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 1rem;
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
  color: #dc2626;
  font-weight: 600;
  font-size: 1rem;
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

/* Events Grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.event-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.event-card.past-event {
  opacity: 0.7;
  background: #f8fafc;
}

.event-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.event-type-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.event-type-badge.type-meeting {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.event-type-badge.type-deadline {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.event-type-badge.type-reminder {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.event-type-badge.type-other {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.event-actions {
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

.event-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.75rem 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.event-description {
  color: #475569;
  font-weight: 500;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9375rem;
}

.meta-label {
  color: #64748b;
  font-weight: 600;
}

.meta-value {
  color: #1e293b;
  font-weight: 700;
}

.event-associations {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.association-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.association-label {
  color: #475569;
  font-weight: 600;
}

.association-count {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 700;
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
  color: #1e293b;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.empty-state p {
  color: #475569;
  font-weight: 500;
  margin: 0;
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
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 95%;
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
  font-weight: 700;
  color: #0f172a;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e2e8f0;
  transform: rotate(90deg);
}

.modal-body {
  padding: 1.5rem;
}

.event-to-delete {
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
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: white;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.form-select option {
  font-weight: 600;
  color: #0f172a;
  padding: 0.5rem;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 700;
  color: #0f172a;
  font-size: 1rem;
}

.form-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #667eea;
}

.form-hint {
  display: block;
  font-size: 0.875rem;
  color: #475569;
  margin-top: 0.25rem;
  font-weight: 500;
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
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  color: #0f172a;
  font-weight: 700;
}

.btn-cancel:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Estilos para selección de empleados */
.employees-selection {
  max-height: 300px;
  overflow-y: auto;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem;
  background: #fafafa;
  margin-top: 0.5rem;
}

.employee-option {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  border: 1px solid #e2e8f0;
}

.employee-option:hover {
  background: #f8fafc;
  border-color: #667eea;
  transform: translateX(4px);
}

.employee-checkbox {
  width: 18px;
  height: 18px;
  margin-right: 0.75rem;
  cursor: pointer;
  accent-color: #667eea;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.employee-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.employee-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.employee-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #1e293b;
}

.employee-role {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
}

.selected-count {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 0.5rem;
}

/* Estilos para documentos en tarjetas */
.event-documents {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.documents-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.documents-label {
  font-weight: 700;
  font-size: 0.875rem;
  color: #1e293b;
}

.documents-count {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
}

.documents-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.document-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  text-decoration: none;
  color: #1e293b;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.document-link:hover {
  background: #e2e8f0;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
}

.doc-icon {
  font-size: 1.125rem;
}

.doc-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Estilos para sección de documentos en formulario */
.documents-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.documents-list {
  margin-bottom: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.document-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;
}

.document-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.document-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.document-info {
  flex: 1;
  min-width: 0;
}

.document-name {
  font-weight: 700;
  font-size: 0.9375rem;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.document-url {
  font-size: 0.8125rem;
  color: #667eea;
  font-weight: 500;
  word-break: break-all;
  margin-bottom: 0.25rem;
}

.document-description {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
  font-style: italic;
}

.btn-remove-doc {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.btn-remove-doc:hover {
  background: #fecaca;
  transform: scale(1.1);
}

.no-documents {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

.no-documents p {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
}

.add-document-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  align-items: end;
}

.add-document-form .form-input-small:nth-child(3) {
  grid-column: 1 / 2;
}

.add-document-form .btn-add-doc {
  grid-column: 2 / 3;
  justify-self: end;
  min-width: 140px;
}

.form-input-small {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.2s;
  background: white;
}

.form-input-small:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input-small::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.btn-add-doc {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-add-doc:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-add-doc:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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

  .events-grid {
    grid-template-columns: 1fr;
  }

  .filters-section {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-height: 95vh;
  }

  .add-document-form {
    grid-template-columns: 1fr;
  }

  .doc-name {
    max-width: 100px;
  }
}
</style>
