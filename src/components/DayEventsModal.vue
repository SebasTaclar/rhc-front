<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <div class="header-content">
              <span class="calendar-icon">📅</span>
              <div>
                <h3 class="modal-title">Eventos del día</h3>
                <p class="modal-date">{{ formattedDate }}</p>
              </div>
            </div>
            <button class="btn-close" @click="closeModal" title="Cerrar">
              ✕
            </button>
          </div>

          <div class="modal-body">
            <div v-if="events.length === 0" class="empty-state">
              <span class="empty-icon">📭</span>
              <p>No hay eventos este día</p>
            </div>

            <div v-else class="events-list">
              <div
                v-for="event in events"
                :key="event.id"
                :class="['event-card', { 'private': event.isPrivate }]"
              >
                <div class="event-header-card">
                  <div class="event-type-badge" :style="{ background: getEventColor(event) }">
                    {{ getEventIcon(event.eventType) }}
                  </div>
                  <div class="event-title-section">
                    <h4 class="event-title">{{ event.title }}</h4>
                    <span v-if="event.isPrivate" class="private-badge">🔒 Privado</span>
                    <span v-else class="public-badge">🌐 Público</span>
                  </div>
                </div>

                <div class="event-details">
                  <div class="detail-row">
                    <span class="detail-icon">🕐</span>
                    <span class="detail-text">{{ formatTime(event.startDate) }} - {{ formatTime(event.endDate) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-icon">📋</span>
                    <span class="detail-text">{{ formatEventType(event.eventType) }}</span>
                  </div>
                  <div v-if="event.description" class="detail-row description">
                    <span class="detail-icon">📝</span>
                    <span class="detail-text">{{ event.description }}</span>
                  </div>
                </div>

                <!-- Documentos adjuntos -->
                <div v-if="'documents' in event && event.documents && event.documents.length > 0" class="event-documents">
                  <h5 class="documents-title">
                    📎 Documentos
                    <span class="documents-count">{{ event.documents.length }}</span>
                  </h5>
                  <div class="documents-grid">
                    <a
                      v-for="doc in event.documents"
                      :key="doc.id || doc.url"
                      :href="doc.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="document-link"
                      :title="doc.description || doc.name"
                    >
                      <span class="doc-icon">📄</span>
                      <span class="doc-name">{{ doc.name }}</span>
                    </a>
                  </div>
                </div>

                <div v-if="canEdit" class="event-actions">
                  <button @click="$emit('edit-event', event)" class="btn-action btn-edit">
                    <span class="action-icon">✏️</span>
                    <span class="action-text">Editar</span>
                  </button>
                  <button @click="$emit('delete-event', event.id)" class="btn-action btn-delete">
                    <span class="action-icon">🗑️</span>
                    <span class="action-text">Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="$emit('create-event', selectedDate)" class="btn-create-event" v-if="canEdit">
              <span class="btn-icon">➕</span>
              Crear nuevo evento
            </button>
            <button @click="closeModal" class="btn-cancel">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Event, PublicEvent } from '@/types/EventType'

interface Props {
  isOpen: boolean
  selectedDate: string
  events: (Event | PublicEvent)[]
  canEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: false
})

const emit = defineEmits<{
  'close': []
  'edit-event': [event: Event | PublicEvent]
  'delete-event': [eventId: number]
  'create-event': [date: string]
}>()

const closeModal = () => {
  emit('close')
}

const formattedDate = computed(() => {
  if (!props.selectedDate) return ''
  const date = new Date(props.selectedDate + 'T00:00:00')
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const getEventColor = (event: Event | PublicEvent): string => {
  const colors: Record<string, string> = {
    MEETING: '#3b82f6',
    DEADLINE: '#ef4444',
    REMINDER: '#f59e0b',
    OTHER: '#8b5cf6'
  }
  return colors[event.eventType] || '#64748b'
}

const getEventIcon = (type: string): string => {
  const icons: Record<string, string> = {
    MEETING: '👥',
    DEADLINE: '⏰',
    REMINDER: '🔔',
    OTHER: '📌'
  }
  return icons[type] || '📌'
}

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const formatEventType = (type: string): string => {
  const types: Record<string, string> = {
    MEETING: 'Reunión',
    DEADLINE: 'Fecha límite',
    REMINDER: 'Recordatorio',
    OTHER: 'Otro'
  }
  return types[type] || type
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.calendar-icon {
  font-size: 2.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.modal-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.modal-date {
  margin: 0.25rem 0 0 0;
  font-size: 1rem;
  opacity: 0.95;
  text-transform: capitalize;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.event-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.event-card:hover {
  border-color: #667eea;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.event-card.private {
  border-color: #fbbf24;
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
}

.event-header-card {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.event-type-badge {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.event-title-section {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.event-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.private-badge,
.public-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  white-space: nowrap;
}

.private-badge {
  background: #fef3c7;
  color: #78350f;
}

.public-badge {
  background: #dbeafe;
  color: #1e3a8a;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9375rem;
}

.detail-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.detail-text {
  color: #475569;
  font-weight: 500;
  line-height: 1.5;
}

.detail-row.description .detail-text {
  color: #334155;
}

.event-documents {
  margin-bottom: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
  border-radius: 12px;
  border: 1px solid #c7d2fe;
}

.documents-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.documents-count {
  background: #667eea;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-weight: 700;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
}

.document-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-decoration: none;
  color: #334155;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.document-link:hover {
  border-color: #667eea;
  background: #f0f4ff;
  color: #667eea;
  transform: translateX(3px);
}

.doc-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.doc-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.action-icon {
  font-size: 1.125rem;
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-create-event {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-create-event:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  font-size: 1.125rem;
  line-height: 1;
}

.btn-cancel {
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .calendar-icon {
    font-size: 2rem;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .modal-date {
    font-size: 0.875rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .event-card {
    padding: 1rem;
  }

  .event-header-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .event-type-badge {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .event-actions {
    flex-direction: column;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-create-event,
  .btn-cancel {
    width: 100%;
  }
}
</style>
