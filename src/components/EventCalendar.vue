<template>
  <div class="event-calendar">
    <!-- Controles del calendario -->
    <div class="calendar-controls">
      <button class="control-btn" @click="previousMonth">
        ←
      </button>
      <h3 class="current-month">{{ currentMonthName }} {{ currentYear }}</h3>
      <button class="control-btn" @click="nextMonth">
        →
      </button>
    </div>

    <!-- Grid del calendario -->
    <div class="calendar-grid">
      <!-- Headers de días -->
      <div class="calendar-header">
        <div class="day-header" v-for="day in dayHeaders" :key="day">{{ day }}</div>
      </div>

      <!-- Días del mes -->
      <div class="calendar-body">
        <div
          v-for="day in calendarDays"
          :key="`${day.date}`"
          :class="[
            'calendar-day',
            {
              'other-month': day.isOtherMonth,
              'today': day.isToday,
              'has-events': day.events.length > 0
            }
          ]"
          @click="openDayDetails(day)"
        >
          <span class="day-number">{{ day.number }}</span>
          <div class="day-events">
            <div
              v-for="event in day.events.slice(0, 3)"
              :key="event.id"
              :class="['event-indicator', { 'private': event.isPrivate }]"
              :title="event.title"
            >
              <span class="event-dot" :style="{ backgroundColor: getEventColor(event) }"></span>
              <span class="event-title">{{ event.title }}</span>
              <span v-if="event.isPrivate" class="private-badge">🔒</span>
            </div>
            <span v-if="day.events.length > 3" class="more-events">
              +{{ day.events.length - 3 }} más
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de eventos del mes -->
    <div class="month-events" v-if="currentMonthEvents.length > 0">
      <h4>Eventos en {{ currentMonthName }}</h4>
      <div class="events-list">
        <div
          v-for="event in currentMonthEvents"
          :key="event.id"
          :class="['event-card', { 'private': event.isPrivate }]"
        >
          <div class="event-date">
            <span class="date-number">{{ formatDay(event.startDate) }}</span>
            <span class="date-month">{{ formatMonth(event.startDate) }}</span>
          </div>
          <div class="event-info">
            <div class="event-header">
              <h5>{{ event.title }}</h5>
              <span v-if="event.isPrivate" class="private-indicator">🔒 Privado</span>
              <span v-else class="public-indicator">🌐 Público</span>
            </div>
            <p v-if="event.description">{{ event.description }}</p>
            <div class="event-meta">
              <span class="event-type">{{ formatEventType(event.eventType) }}</span>
              <span class="event-time">{{ formatTime(event.startDate) }} - {{ formatTime(event.endDate) }}</span>
            </div>
          </div>
          <div class="event-actions" v-if="canEdit">
            <button @click.stop="$emit('edit-event', event)" class="btn-edit" title="Editar">
              ✏️
            </button>
            <button @click.stop="$emit('delete-event', event.id)" class="btn-delete" title="Eliminar">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Event, PublicEvent } from '@/types/EventType'

interface Props {
  events: (Event | PublicEvent)[]
  canEdit?: boolean
}

interface CalendarDay {
  number: number
  date: string
  isOtherMonth: boolean
  isToday: boolean
  events: (Event | PublicEvent)[]
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: false
})

defineEmits<{
  'edit-event': [event: Event | PublicEvent]
  'delete-event': [eventId: number]
}>()

const currentDate = ref(new Date())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())

const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const currentMonthName = computed(() => monthNames[currentMonth.value])

// Generar días del calendario
const calendarDays = computed((): CalendarDay[] => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const prevLastDay = new Date(year, month, 0)

  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const daysInPrevMonth = prevLastDay.getDate()

  const days: CalendarDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Días del mes anterior
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i
    const date = new Date(year, month - 1, dayNumber)
    days.push({
      number: dayNumber,
      date: date.toISOString().split('T')[0],
      isOtherMonth: true,
      isToday: false,
      events: getEventsForDate(date)
    })
  }

  // Días del mes actual
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    const dateStr = date.toISOString().split('T')[0]
    days.push({
      number: i,
      date: dateStr,
      isOtherMonth: false,
      isToday: dateStr === today.toISOString().split('T')[0],
      events: getEventsForDate(date)
    })
  }

  // Días del siguiente mes
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      number: i,
      date: date.toISOString().split('T')[0],
      isOtherMonth: true,
      isToday: false,
      events: getEventsForDate(date)
    })
  }

  return days
})

// Obtener eventos para una fecha específica
const getEventsForDate = (date: Date): (Event | PublicEvent)[] => {
  const dateStr = date.toISOString().split('T')[0]
  return props.events.filter(event => {
    const eventStart = event.startDate.split('T')[0]
    const eventEnd = event.endDate.split('T')[0]
    return dateStr >= eventStart && dateStr <= eventEnd
  })
}

// Eventos del mes actual
const currentMonthEvents = computed(() => {
  return props.events.filter(event => {
    const eventDate = new Date(event.startDate)
    return eventDate.getMonth() === currentMonth.value &&
           eventDate.getFullYear() === currentYear.value
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
})

// Navegación
const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

// Abrir detalles del día
const openDayDetails = (day: CalendarDay) => {
  if (day.events.length > 0 && !day.isOtherMonth) {
    // Aquí puedes implementar un modal con los detalles del día
    console.log('Day details:', day)
  }
}

// Utilidades de formato
const getEventColor = (event: Event | PublicEvent): string => {
  const colors: Record<string, string> = {
    MEETING: '#3b82f6',
    DEADLINE: '#ef4444',
    REMINDER: '#f59e0b',
    OTHER: '#8b5cf6'
  }
  return colors[event.eventType] || '#64748b'
}

const formatDay = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.getDate().toString()
}

const formatMonth = (dateStr: string): string => {
  const date = new Date(dateStr)
  return monthNames[date.getMonth()].slice(0, 3)
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
.event-calendar {
  width: 100%;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.control-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.current-month {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.calendar-grid {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.day-header {
  text-align: center;
  padding: 1rem 0.5rem;
  font-weight: 600;
  color: #475569;
  font-size: 0.875rem;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e2e8f0;
}

.calendar-day {
  background: white;
  min-height: 100px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.calendar-day:hover {
  background: #f8fafc;
}

.calendar-day.other-month {
  background: #f8fafc;
  opacity: 0.5;
}

.calendar-day.today {
  background: #eff6ff;
}

.calendar-day.today .day-number {
  background: #3b82f6;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.day-number {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.9375rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.day-events {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  background: #f8fafc;
  border-radius: 4px;
  font-size: 0.75rem;
  overflow: hidden;
}

.event-indicator.private {
  background: #fef3c7;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e293b;
}

.private-badge {
  font-size: 0.625rem;
  margin-left: auto;
}

.more-events {
  font-size: 0.75rem;
  color: #475569;
  font-weight: 600;
  padding: 0.125rem 0.25rem;
}

.month-events {
  margin-top: 2rem;
}

.month-events h4 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid #3b82f6;
}

.event-card.private {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.date-number {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.date-month {
  font-size: 0.875rem;
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 0.25rem;
}

.event-info {
  flex: 1;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.event-header h5 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.private-indicator,
.public-indicator {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.private-indicator {
  background: #fef3c7;
  color: #78350f;
}

.public-indicator {
  background: #dbeafe;
  color: #1e3a8a;
}

.event-info p {
  color: #475569;
  margin: 0 0 0.75rem 0;
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.5;
}

.event-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
}

.event-type {
  font-weight: 700;
  color: #1e293b;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.btn-edit,
.btn-delete {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-edit:hover {
  background: #eff6ff;
}

.btn-delete:hover {
  background: #fef2f2;
}

@media (max-width: 768px) {
  .calendar-day {
    min-height: 80px;
    padding: 0.25rem;
  }

  .day-number {
    font-size: 0.75rem;
  }

  .event-indicator {
    padding: 0.125rem;
  }

  .event-title {
    font-size: 0.625rem;
  }

  .event-card {
    flex-direction: column;
    gap: 1rem;
  }

  .event-date {
    min-width: auto;
    flex-direction: row;
    gap: 0.5rem;
  }
}
</style>
