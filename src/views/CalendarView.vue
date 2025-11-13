<template>
  <div class="calendar-view">
    <div class="calendar-container">
      <!-- Header profesional -->
      <div class="calendar-header">
        <div class="header-content">
          <div class="header-icon">📅</div>
          <div class="header-text">
            <h1 class="header-title">Calendario de Eventos</h1>
            <p class="header-subtitle">
              {{ isAuthenticated ? 'Eventos públicos y privados' : 'Eventos públicos' }}
            </p>
          </div>
          <div class="header-actions" v-if="isAuthenticated && isAdmin">
            <button @click="openCreateEventModal" class="btn-create-event">
              <span class="icon">+</span>
              Nuevo Evento
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido del calendario -->
      <div class="calendar-content">
        <!-- Indicador de carga -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando eventos...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="error-state">
          <span class="error-icon">⚠️</span>
          <p>{{ error }}</p>
          <button @click="loadEvents" class="btn-retry">Reintentar</button>
        </div>

        <!-- Calendario con eventos -->
        <div v-else>
          <EventCalendar
            :events="displayedEvents"
            :can-edit="isAuthenticated && isAdmin"
            :is-admin="isAdmin"
            @edit-event="openEditEventModal"
            @delete-event="handleDeleteEvent"
            @day-click="handleDayClick"
          />

          <!-- Filtros de eventos -->
          <div class="events-filters">
            <h4 class="filters-title">📊 Ver eventos</h4>
                        <div class="filter-buttons">
              <button
                :class="['filter-btn', { active: filterMode === 'weekly' }]"
                @click="selectWeeklyFilter"
              >
                Semanal
              </button>
              <button
                :class="['filter-btn', { active: filterMode === 'custom' }]"
                @click="filterMode = 'custom'"
              >
                Por fecha
              </button>
            </div>

            <!-- Navegador semanal -->
            <div v-if="filterMode === 'weekly'" class="weekly-navigator">
              <button @click="previousWeek" class="nav-btn">
                <span class="nav-icon">←</span>
                Semana anterior
              </button>
              <div class="week-info">
                <span class="week-label">Semana del</span>
                <span class="week-dates">
                  {{ formatWeekRange(currentWeekStart) }}
                </span>
              </div>
              <button @click="nextWeek" class="nav-btn">
                Semana siguiente
                <span class="nav-icon">→</span>
              </button>
            </div>

            <!-- Selector de fechas personalizado -->
            <div v-if="filterMode === 'custom'" class="custom-date-range">
              <div class="date-input-group">
                <label for="start-date">Desde:</label>
                <input
                  id="start-date"
                  type="date"
                  v-model="customDateRange.start"
                  class="date-input"
                />
              </div>
              <div class="date-input-group">
                <label for="end-date">Hasta:</label>
                <input
                  id="end-date"
                  type="date"
                  v-model="customDateRange.end"
                  class="date-input"
                />
              </div>
              <button @click="applyCustomFilter" class="btn-apply-filter">
                Aplicar filtro
              </button>
            </div>

            <!-- Lista de eventos filtrados (solo para semanal y personalizado) -->
            <div v-if="filteredEventsList.length > 0" class="filtered-events-list">
              <div class="events-count-header">
                <span class="count-text">{{ filteredEventsList.length }} evento{{ filteredEventsList.length !== 1 ? 's' : '' }} encontrado{{ filteredEventsList.length !== 1 ? 's' : '' }}</span>
              </div>
              <div class="events-timeline">
                <div
                  v-for="event in filteredEventsList"
                  :key="event.id"
                  :class="['event-item-compact', { 'private': event.isPrivate }]"
                >
                  <div class="event-time-badge">
                    <span class="time-hour">{{ formatEventTime(event.startDate) }}</span>
                  </div>
                  <div class="event-details-compact">
                    <div class="event-title-row">
                      <h5 class="event-title-compact">{{ event.title }}</h5>
                      <span class="event-type-badge-small" :style="{ background: getEventTypeColor(event.eventType) }">
                        {{ getEventTypeLabel(event.eventType) }}
                      </span>
                    </div>
                    <p v-if="event.description" class="event-desc-compact">{{ event.description }}</p>
                    <div class="event-meta-compact">
                      <span class="meta-item">
                        🕐 {{ formatEventTime(event.startDate) }} - {{ formatEventTime(event.endDate) }}
                      </span>
                      <span v-if="event.isPrivate" class="meta-item private">🔒 Privado</span>
                      <span v-else class="meta-item public">🌐 Público</span>
                      <span v-if="'documents' in event && event.documents && event.documents.length > 0" class="meta-item">
                        📎 {{ event.documents.length }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="filterMode !== null" class="no-events-message">
              <span class="empty-icon">📭</span>
              <p>No hay eventos para este período</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar evento -->
    <EventModal
      v-if="showEventModal"
      :event="selectedEvent"
      :mode="modalMode"
      @close="closeEventModal"
      @save="handleSaveEvent"
    />

    <!-- Modal para ver eventos del día -->
    <DayEventsModal
      :is-open="showDayEventsModal"
      :selected-date="selectedDayDate"
      :events="selectedDayEvents"
      :can-edit="isAuthenticated && isAdmin"
      @close="closeDayEventsModal"
      @edit-event="openEditEventModal"
      @delete-event="handleDeleteEvent"
      @create-event="handleCreateEventForDay"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useEvents } from '@/composables/useEvents'
import EventCalendar from '@/components/EventCalendar.vue'
import EventModal from '@/components/EventModal.vue'
import DayEventsModal from '@/components/DayEventsModal.vue'
import type { Event, PublicEvent } from '@/types/EventType'

defineOptions({
  name: 'CalendarView'
})

// Composables
const { isAuthenticated, isAdmin, initAuth } = useAuth()
const {
  events,
  publicEvents,
  loading,
  error,
  fetchEvents,
  fetchPublicEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = useEvents()

// Estado del modal
const showEventModal = ref(false)
const selectedEvent = ref<Event | null>(null)
const modalMode = ref<'create' | 'edit'>('create')

// Estado del modal de eventos del día
const showDayEventsModal = ref(false)
const selectedDayDate = ref('')
const selectedDayEvents = ref<(Event | PublicEvent)[]>([])

// Estado de filtros
const filterMode = ref<'weekly' | 'custom' | null>(null)
const customDateRange = ref({
  start: new Date().toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0]
})
const appliedDateRange = ref({
  start: '',
  end: ''
})

// Estado para navegación semanal
const currentWeekStart = ref(new Date())

// Computed para eventos a mostrar
const displayedEvents = computed(() => {
  if (isAuthenticated.value) {
    // Usuario autenticado: mostrar todos los eventos
    return events.value
  } else {
    // Usuario no autenticado: solo eventos públicos
    return publicEvents.value.map(event => ({
      ...event,
      clients: [],
      employees: []
    }))
  }
})

// Cargar eventos
const loadEvents = async () => {
  if (isAuthenticated.value) {
    await fetchEvents()
  } else {
    await fetchPublicEvents()
  }
}

// Abrir modal para crear evento
const openCreateEventModal = () => {
  if (selectedDayDate.value) {
    // Pre-llenar con la fecha seleccionada
    const dateTime = new Date(selectedDayDate.value + 'T12:00:00')
    const now = new Date().toISOString()
    selectedEvent.value = {
      id: 0,
      title: '',
      description: '',
      eventType: 'OTHER',
      startDate: dateTime.toISOString(),
      endDate: dateTime.toISOString(),
      isPrivate: false,
      documents: [],
      createdAt: now,
      updatedAt: now
    } as Event
  } else {
    selectedEvent.value = null
  }
  modalMode.value = 'create'
  showEventModal.value = true
}

// Abrir modal para editar evento
const openEditEventModal = (event: Event) => {
  selectedEvent.value = event
  modalMode.value = 'edit'
  showEventModal.value = true
}

// Cerrar modal
const closeEventModal = () => {
  showEventModal.value = false
  selectedEvent.value = null
}

// Guardar evento (crear o actualizar)
interface EventFormData {
  title: string
  description?: string
  startDate: string
  endDate: string
  eventType: 'MEETING' | 'DEADLINE' | 'REMINDER' | 'OTHER'
  isPrivate: boolean
}

const handleSaveEvent = async (eventData: EventFormData) => {
  if (modalMode.value === 'create') {
    const success = await createEvent(eventData)
    if (success) {
      closeEventModal()
      await loadEvents()
    }
  } else if (selectedEvent.value) {
    const success = await updateEvent(selectedEvent.value.id, eventData)
    if (success) {
      closeEventModal()
      await loadEvents()
    }
  }
}

// Eliminar evento
const handleDeleteEvent = async (eventId: number) => {
  if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
    const success = await deleteEvent(eventId)
    if (success) {
      await loadEvents()
      // Actualizar eventos del día si el modal está abierto
      if (showDayEventsModal.value) {
        const updatedEvents = displayedEvents.value.filter(e => {
          const eventDate = e.startDate.split('T')[0]
          return eventDate === selectedDayDate.value
        })
        selectedDayEvents.value = updatedEvents
      }
    }
  }
}

// Manejar clic en día del calendario
const handleDayClick = (date: string, events: (Event | PublicEvent)[]) => {
  if (events.length === 0) {
    // No hay eventos
    // Solo admins pueden crear eventos en días vacíos
    if (isAdmin.value) {
      selectedDayDate.value = date
      openCreateEventModal()
    }
    // Si no es admin, no hace nada (no abre modal)
  } else {
    // Hay eventos, abrir modal de visualización (todos pueden ver)
    selectedDayDate.value = date
    selectedDayEvents.value = events
    showDayEventsModal.value = true
  }
}

// Cerrar modal de eventos del día
const closeDayEventsModal = () => {
  showDayEventsModal.value = false
  selectedDayDate.value = ''
  selectedDayEvents.value = []
}

// Crear evento para un día específico
const handleCreateEventForDay = (date: string) => {
  selectedDayDate.value = date
  closeDayEventsModal()
  openCreateEventModal()
}

// Funciones para navegación semanal
const selectWeeklyFilter = () => {
  filterMode.value = 'weekly'
  // Reiniciar a la semana actual
  const now = new Date()
  currentWeekStart.value = new Date(now)
  currentWeekStart.value.setHours(0, 0, 0, 0)
  currentWeekStart.value.setDate(now.getDate() - now.getDay())
}

const previousWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeekStart.value = newDate
}

const nextWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeekStart.value = newDate
}

const formatWeekRange = (startDate: Date): string => {
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

// Aplicar filtro personalizado
const applyCustomFilter = () => {
  appliedDateRange.value = {
    start: customDateRange.value.start,
    end: customDateRange.value.end
  }
}

// Eventos filtrados según el modo seleccionado
const filteredEventsList = computed(() => {
  const events = displayedEvents.value

  switch (filterMode.value) {
    case 'weekly': {
      // Eventos de la semana seleccionada
      const startOfWeek = new Date(currentWeekStart.value)
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      return events.filter(event => {
        const eventDate = new Date(event.startDate)
        return eventDate >= startOfWeek && eventDate <= endOfWeek
      }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    }

    case 'custom': {
      // Eventos en el rango personalizado
      if (!appliedDateRange.value.start || !appliedDateRange.value.end) {
        return []
      }

      const startDate = new Date(appliedDateRange.value.start + 'T00:00:00')
      const endDate = new Date(appliedDateRange.value.end + 'T23:59:59')

      return events.filter(event => {
        const eventDate = new Date(event.startDate)
        return eventDate >= startDate && eventDate <= endDate
      }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    }

    default:
      return []
  }
})

// Funciones de formato para la lista de eventos
const formatEventTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const getEventTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    MEETING: '#3b82f6',
    DEADLINE: '#ef4444',
    REMINDER: '#f59e0b',
    OTHER: '#8b5cf6'
  }
  return colors[type] || '#64748b'
}

const getEventTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    MEETING: 'Reunión',
    DEADLINE: 'Fecha límite',
    REMINDER: 'Recordatorio',
    OTHER: 'Otro'
  }
  return labels[type] || type
}

// Inicializar
onMounted(async () => {
  initAuth()
  await loadEvents()
})
</script>

<style scoped>
.calendar-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.calendar-container {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.calendar-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.calendar-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.calendar-header::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -5%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.header-icon {
  font-size: 5rem;
  animation: float 3s ease-in-out infinite;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-create-event {
  background: white;
  color: #667eea;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-create-event:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  background: #f8f9fa;
}

.btn-create-event .icon {
  font-size: 1.25rem;
  line-height: 1;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  color: white;
  letter-spacing: 0.5px;
}

.header-subtitle {
  font-size: 1.2rem;
  margin: 0;
  opacity: 1;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
}

.calendar-content {
  padding: 2rem;
  background: white;
  min-height: 400px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p,
.error-state p {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0.5rem 0;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.btn-retry {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Filtros de eventos */
.events-filters {
  margin-top: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
  border-radius: 16px;
  border: 2px solid #c7d2fe;
}

.filters-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.filter-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  flex: 1;
  min-width: 150px;
  padding: 1rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.filter-btn:hover {
  border-color: #667eea;
  background: #f8fafc;
  transform: translateY(-2px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.custom-date-range {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.date-input-group {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-input-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.date-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  font-weight: 600;
  color: #0f172a;
  background: white;
  transition: all 0.3s ease;
}

.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: brightness(0) saturate(100%) invert(16%) sepia(14%) saturate(1051%) hue-rotate(189deg) brightness(96%) contrast(94%);
  opacity: 0.8;
}

.date-input::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
  transform: scale(1.1);
}

.date-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-apply-filter {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  white-space: nowrap;
}

.btn-apply-filter:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Navegador semanal */
.weekly-navigator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  margin-top: 1.5rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  white-space: nowrap;
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.nav-icon {
  font-size: 1.25rem;
  font-weight: 700;
}

.week-info {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.week-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.week-dates {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

/* Lista de eventos filtrados compacta */
.filtered-events-list {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.events-count-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.count-text {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.events-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item-compact {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 10px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
}

.event-item-compact.private {
  border-left-color: #fbbf24;
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
}

.event-item-compact:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.event-time-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.time-hour {
  font-size: 0.875rem;
  font-weight: 700;
  text-align: center;
}

.event-details-compact {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.event-title-compact {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.event-type-badge-small {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
  border-radius: 10px;
  color: white;
  white-space: nowrap;
}

.event-desc-compact {
  margin: 0;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-meta-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.8125rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #64748b;
  font-weight: 500;
}

.meta-item.private {
  color: #78350f;
}

.meta-item.public {
  color: #1e3a8a;
}

/* Lista de eventos filtrados (DEPRECADO - eliminado) */
.filtered-events-section {
  margin-top: 3rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.events-count-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1rem;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.event-card-list {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.event-card-list:hover {
  border-color: #667eea;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
  transform: translateY(-4px);
}

.event-card-list.private {
  border-color: #fbbf24;
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
}

.event-date-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.date-day {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.date-month {
  font-size: 0.875rem;
  text-transform: uppercase;
  font-weight: 700;
  margin-top: 0.25rem;
  letter-spacing: 0.5px;
}

.event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-header-list {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.75rem;
}

.event-title-list {
  flex: 1;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  min-width: 150px;
}

.event-badges {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.event-type-tag {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  color: white;
  white-space: nowrap;
}

.private-tag,
.public-tag {
  font-size: 0.875rem;
}

.event-description-list {
  margin: 0;
  color: #475569;
  font-size: 0.9375rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-meta-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.meta-time,
.meta-docs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.no-events-message {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.no-events-message p {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-view {
    padding: 1rem 0.5rem;
  }

  .calendar-container {
    border-radius: 12px;
  }

  .calendar-header {
    padding: 2rem 1rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .header-icon {
    font-size: 3.5rem;
  }

  .header-title {
    font-size: 1.8rem;
  }

  .header-subtitle {
    font-size: 1rem;
  }

  .calendar-content {
    padding: 1rem;
  }

  .events-filters {
    padding: 1.5rem;
  }

  .filter-buttons {
    flex-direction: column;
  }

  .filter-btn {
    min-width: auto;
  }

  .custom-date-range {
    flex-direction: column;
    align-items: stretch;
  }

  .date-input-group {
    min-width: auto;
  }

  .btn-apply-filter {
    width: 100%;
  }

  .weekly-navigator {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-btn {
    width: 100%;
    justify-content: center;
  }

  .event-item-compact {
    flex-direction: column;
    gap: 0.75rem;
  }

  .event-time-badge {
    min-width: auto;
    width: fit-content;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.5rem;
  }

  .header-subtitle {
    font-size: 0.9rem;
  }

  .filters-title {
    font-size: 1.25rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .event-title-list {
    font-size: 1.125rem;
  }
}
</style>


