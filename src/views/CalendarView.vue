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
            @edit-event="openEditEventModal"
            @delete-event="handleDeleteEvent"
          />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useEvents } from '@/composables/useEvents'
import EventCalendar from '@/components/EventCalendar.vue'
import EventModal from '@/components/EventModal.vue'
import type { Event } from '@/types/EventType'

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
  selectedEvent.value = null
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
    }
  }
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
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.5rem;
  }

  .header-subtitle {
    font-size: 0.9rem;
  }
}
</style>
