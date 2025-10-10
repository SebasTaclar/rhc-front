<template>
  <section class="tax-calendar-section">
    <div class="container">
      <div class="section-header">
        <h2>Calendario Tributario 2025</h2>
        <p class="subtitle">
          Mantente al día con las fechas clave de presentación y liquidación de impuestos.
          Nunca más te pierdas un plazo importante.
        </p>
      </div>

      <div class="calendar-container">
        <div class="calendar-sidebar">
          <h3>Obligaciones Tributarias</h3>
          <div class="obligation-list">
            <div class="obligation-item" v-for="obligation in obligations" :key="obligation.id">
              <div class="obligation-icon" :style="{ backgroundColor: obligation.color }">
                {{ obligation.icon }}
              </div>
              <div class="obligation-info">
                <span class="obligation-name">{{ obligation.name }}</span>
                <span class="obligation-desc">{{ obligation.description }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="calendar-main">
          <div class="calendar-controls">
            <button class="control-btn" @click="previousMonth" :disabled="currentMonth === 0">
              ←
            </button>
            <h3 class="current-month">{{ monthNames[currentMonth] }} 2025</h3>
            <button class="control-btn" @click="nextMonth" :disabled="currentMonth === 11">
              →
            </button>
          </div>

          <div class="calendar-grid">
            <div class="calendar-header">
              <div class="day-header" v-for="day in dayHeaders" :key="day">{{ day }}</div>
            </div>

            <div class="calendar-body">
                        <div
            v-for="day in calendarDays"
            :key="`${day.month}-${day.number}`"
            :class="[
              'calendar-day',
              {
                'other-month': day.isOtherMonth,
                'has-events': day.events.length > 0,
                'clickable': !day.isOtherMonth
              }
            ]"
            @click="openDayModal(day)"
          >
                <span class="day-number">{{ day.number }}</span>
                <div class="day-events">
                  <div
                    v-for="event in day.events.slice(0, 2)"
                    :key="event.id"
                    class="event-dot"
                    :style="{ backgroundColor: event.color }"
                    :title="event.title"
                  ></div>
                  <span v-if="day.events.length > 2" class="more-events">
                    +{{ day.events.length - 2 }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="month-highlights" v-if="currentMonthEvents.length > 0">
            <h4>Fechas importantes en {{ monthNames[currentMonth] }}</h4>
            <div class="highlights-list">
              <div
                v-for="event in currentMonthEvents"
                :key="event.id"
                class="highlight-item"
              >
                <div class="highlight-date">
                  <span class="date-number">{{ event.day }}</span>
                  <span class="date-month">{{ monthNames[currentMonth].slice(0, 3) }}</span>
                </div>
                <div class="highlight-info">
                  <h5>{{ event.title }}</h5>
                  <p>{{ event.description }}</p>
                </div>
                <div class="highlight-badge" :style="{ backgroundColor: event.color }">
                  {{ event.type }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="cta-banner">
        <div class="cta-content">
          <h3>¿Necesitas recordatorios personalizados?</h3>
          <p>Configura alertas automáticas para tus obligaciones tributarias específicas</p>
          <button class="cta-button" @click="scrollToContact">
            Configurar alertas
          </button>
        </div>
        <div class="cta-icon">📅</div>
      </div>
    </div>

    <!-- Modal para mostrar información de eventos -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ selectedDate }}</h3>
            <button @click="closeModal" class="close-button">&times;</button>
          </div>
          <div class="modal-body">
            <div v-if="selectedEvents.length === 0" class="no-events">
              <p>No hay obligaciones tributarias para esta fecha</p>
            </div>
            <div v-else class="events-list">
              <div
                v-for="event in selectedEvents"
                :key="event.id"
                class="event-item"
                :style="{ borderLeftColor: event.color }"
              >
                <h4>{{ event.title }}</h4>
                <p class="event-description">{{ event.description }}</p>
                <div class="event-meta">
                  <span class="event-category">{{ event.category }}</span>
                  <span class="event-deadline">Vencimiento</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeModal(); scrollToContact()" class="btn btn-primary">
              Necesito asesoría
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface TaxEvent {
  id: string
  title: string
  description: string
  day: number
  month: number
  type: string
  color: string
  category: string
}

interface Obligation {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

const currentMonth = ref(new Date().getMonth())

// Modal state
const showModal = ref(false)
const selectedDate = ref<string>('')
const selectedEvents = ref<TaxEvent[]>([])

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const obligations = ref<Obligation[]>([
  {
    id: '1',
    name: 'Renta y Complementarios',
    description: 'Personas jurídicas y naturales',
    icon: '📊',
    color: '#3b82f6'
  },
  {
    id: '2',
    name: 'IVA',
    description: 'Bimestral según cronograma',
    icon: '💳',
    color: '#10b981'
  },
  {
    id: '3',
    name: 'Retenciones',
    description: 'Mensuales y bimestrales',
    icon: '🎯',
    color: '#f59e0b'
  },
  {
    id: '4',
    name: 'ICA',
    description: 'Industria y comercio',
    icon: '🏢',
    color: '#ef4444'
  },
  {
    id: '5',
    name: 'Información Exógena',
    description: 'Reportes anuales',
    icon: '📋',
    color: '#8b5cf6'
  }
])

// Mock tax events data
const taxEvents = ref<TaxEvent[]>([
  // Enero
  { id: '1', title: 'IVA Bimestral', description: 'Vencimiento según últimos dígitos NIT', day: 17, month: 0, type: 'IVA', color: '#10b981', category: 'Impuestos' },
  { id: '2', title: 'Retención en la Fuente', description: 'Grandes contribuyentes', day: 11, month: 0, type: 'Retención', color: '#f59e0b', category: 'Retenciones' },
  { id: '3', title: 'Autoliquidación Renta', description: 'Personas naturales', day: 31, month: 0, type: 'Renta', color: '#3b82f6', category: 'Declaraciones' },

  // Febrero
  { id: '4', title: 'ICA Bimestral', description: 'Declaración industria y comercio', day: 15, month: 1, type: 'ICA', color: '#ef4444', category: 'Territoriales' },
  { id: '5', title: 'Información Exógena', description: 'Formato 1001 - Socios', day: 28, month: 1, type: 'Exógena', color: '#8b5cf6', category: 'Informes' },

  // Marzo
  { id: '6', title: 'IVA Bimestral', description: 'Período enero-febrero', day: 19, month: 2, type: 'IVA', color: '#10b981', category: 'Impuestos' },
  { id: '7', title: 'Retención en la Fuente', description: 'Declaración mensual', day: 11, month: 2, type: 'Retención', color: '#f59e0b', category: 'Retenciones' },
  { id: '8', title: 'Renta Personas Jurídicas', description: 'Según cronograma DIAN', day: 28, month: 2, type: 'Renta', color: '#3b82f6', category: 'Declaraciones' },

  // Abril
  { id: '9', title: 'ICA Anual', description: 'Declaración anual', day: 30, month: 3, type: 'ICA', color: '#ef4444', category: 'Territoriales' },
  { id: '10', title: 'Retención en la Fuente', description: 'Marzo 2025', day: 11, month: 3, type: 'Retención', color: '#f59e0b', category: 'Retenciones' },

  // Mayo
  { id: '11', title: 'IVA Bimestral', description: 'Marzo-abril 2025', day: 21, month: 4, type: 'IVA', color: '#10b981', category: 'Impuestos' },
  { id: '12', title: 'Renta Personas Naturales', description: 'Inicio período declaración', day: 15, month: 4, type: 'Renta', color: '#3b82f6', category: 'Declaraciones' },

  // Junio
  { id: '13', title: 'Información Exógena', description: 'Formato 1003 - Pagos', day: 30, month: 5, type: 'Exógena', color: '#8b5cf6', category: 'Informes' },
  { id: '14', title: 'IVA Bimestral', description: 'Mayo-junio 2025', day: 23, month: 5, type: 'IVA', color: '#10b981', category: 'Impuestos' },

  // Julio
  { id: '15', title: 'Retención en la Fuente', description: 'Junio 2025', day: 11, month: 6, type: 'Retención', color: '#f59e0b', category: 'Retenciones' },
  { id: '16', title: 'ICA Bimestral', description: 'Segundo período', day: 15, month: 6, type: 'ICA', color: '#ef4444', category: 'Territoriales' },

  // Agosto
  { id: '17', title: 'Renta Empresas', description: 'Grandes contribuyentes', day: 31, month: 7, type: 'Renta', color: '#3b82f6', category: 'Declaraciones' },
  { id: '18', title: 'IVA Bimestral', description: 'Julio-agosto 2025', day: 21, month: 7, type: 'IVA', color: '#10b981', category: 'Impuestos' },

  // Septiembre
  { id: '19', title: 'Retención en la Fuente', description: 'Agosto 2025', day: 11, month: 8, type: 'Retención', color: '#f59e0b', category: 'Retenciones' },
  { id: '20', title: 'ICA Trimestral', description: 'Tercer trimestre', day: 30, month: 8, type: 'ICA', color: '#ef4444', category: 'Territoriales' },

  // Octubre
  { id: '21', title: 'IVA Bimestral', description: 'Septiembre-octubre 2025', day: 23, month: 9, type: 'IVA', color: '#10b981', category: 'Impuestos' },
  { id: '22', title: 'Información Exógena', description: 'Medios magnéticos', day: 31, month: 9, type: 'Exógena', color: '#8b5cf6', category: 'Informes' },

  // Noviembre
  { id: '23', title: 'Retención en la Fuente', description: 'Octubre 2025', day: 11, month: 10, type: 'Retención', color: '#f59e0b', category: 'Retenciones' },
  { id: '24', title: 'Renta Anticipada', description: 'Cuota diciembre', day: 30, month: 10, type: 'Renta', color: '#3b82f6', category: 'Declaraciones' },

  // Diciembre
  { id: '25', title: 'IVA Bimestral', description: 'Noviembre-diciembre 2025', day: 19, month: 11, type: 'IVA', color: '#10b981', category: 'Impuestos' },
  { id: '26', title: 'ICA Final', description: 'Cierre anual', day: 31, month: 11, type: 'ICA', color: '#ef4444', category: 'Territoriales' }
])

const calendarDays = computed(() => {
  const year = 2025
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const today = new Date()

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    const dayEvents = taxEvents.value.filter(event =>
      event.day === date.getDate() && event.month === date.getMonth()
    )

    days.push({
      number: date.getDate(),
      date: date.toISOString().split('T')[0],
      month: date.getMonth(),
      isOtherMonth: date.getMonth() !== month,
      isToday: date.toDateString() === today.toDateString(),
      events: dayEvents
    })
  }

  return days
})

const currentMonthEvents = computed(() => {
  return taxEvents.value
    .filter(event => event.month === currentMonth.value)
    .sort((a, b) => a.day - b.day)
    .slice(0, 4) // Mostrar máximo 4 eventos destacados
})

const previousMonth = () => {
  if (currentMonth.value > 0) {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value < 11) {
    currentMonth.value++
  }
}

const scrollToContact = () => {
  const contactSection = document.getElementById('contacto')
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' })
  }
}

// Modal functions
const openDayModal = (day: {
  number: number
  isOtherMonth: boolean
  events: TaxEvent[]
  month: number
}) => {
  if (day.isOtherMonth) return

  const date = new Date(2025, day.month, day.number)
  selectedDate.value = date.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  selectedEvents.value = day.events
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedDate.value = ''
  selectedEvents.value = []
}
</script>

<style scoped>
.tax-calendar-section {
  padding: 4rem 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2.5rem;
  color: #0f172a;
  margin-bottom: 1rem;
  font-weight: 700;
}

.subtitle {
  font-size: 1.1rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.calendar-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.calendar-sidebar {
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  padding: 2rem;
  color: white;
}

.calendar-sidebar h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: #f1f5f9;
}

.obligation-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.obligation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.obligation-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.obligation-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.obligation-info {
  flex: 1;
}

.obligation-name {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: #f8fafc;
}

.obligation-desc {
  display: block;
  font-size: 0.8rem;
  color: #cbd5e1;
  margin-top: 0.25rem;
}

.calendar-main {
  padding: 2rem;
}

.calendar-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.control-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.2rem;
  color: #64748b;
}

.control-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-month {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
  font-weight: 600;
}

.calendar-grid {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
}

.day-header {
  padding: 1rem 0.5rem;
  text-align: center;
  font-weight: 600;
  color: #64748b;
  font-size: 0.9rem;
  border-right: 1px solid #e2e8f0;
}

.day-header:last-child {
  border-right: none;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 80px;
  padding: 0.5rem;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-day:hover {
  background: #f8fafc;
}

.calendar-day.other-month {
  background: #f9fafb;
  color: #9ca3af;
}

.calendar-day.today {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.calendar-day.has-events .day-number {
  font-weight: 600;
}

.day-number {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.day-events {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  align-items: center;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.more-events {
  font-size: 0.7rem;
  color: #64748b;
  margin-left: 2px;
}

.month-highlights {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.month-highlights h4 {
  margin: 0 0 1.5rem 0;
  color: #0f172a;
  font-size: 1.1rem;
}

.highlights-list {
  display: grid;
  gap: 1rem;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
}

.highlight-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  min-width: 60px;
}

.date-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.date-month {
  font-size: 0.8rem;
  color: #64748b;
  text-transform: uppercase;
}

.highlight-info {
  flex: 1;
}

.highlight-info h5 {
  margin: 0 0 0.25rem 0;
  color: #0f172a;
  font-size: 1rem;
}

.highlight-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.highlight-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
}

.cta-banner {
  margin-top: 3rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.cta-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.cta-content p {
  margin: 0 0 1.5rem 0;
  color: #dbeafe;
}

.cta-button {
  background: white;
  color: #3b82f6;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cta-icon {
  font-size: 3rem;
  opacity: 0.7;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .calendar-container {
    grid-template-columns: 1fr;
  }

  .calendar-sidebar {
    order: 2;
    background: #f8fafc;
    color: #0f172a;
  }

  .calendar-sidebar h3 {
    color: #0f172a;
  }

  .obligation-item {
    background: white;
    border: 1px solid #e2e8f0;
  }

  .obligation-name {
    color: #0f172a;
  }

  .obligation-desc {
    color: #64748b;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .calendar-main {
    padding: 1rem;
  }

  .calendar-day {
    min-height: 60px;
    padding: 0.25rem;
  }

  .day-number {
    font-size: 0.8rem;
  }

  .highlight-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .cta-banner {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .cta-icon {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .calendar-body {
    font-size: 0.8rem;
  }

  .day-header {
    padding: 0.5rem 0.25rem;
    font-size: 0.8rem;
  }

  .calendar-day {
    min-height: 50px;
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

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  min-width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalSlideIn 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  text-transform: capitalize;
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
  padding: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.no-events {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.no-events p {
  margin: 0;
  font-style: italic;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  border-left: 4px solid #667eea;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0 8px 8px 0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.event-item h4 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
}

.event-description {
  margin: 0 0 0.75rem 0;
  color: #475569;
  font-size: 0.875rem;
  line-height: 1.5;
}

.event-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.event-category {
  background: #e2e8f0;
  color: #475569;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.event-deadline {
  color: #dc2626;
  font-weight: 600;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Clickable calendar days */
.calendar-day.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-day.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f1f5f9;
}

.calendar-day.other-month.clickable {
  cursor: not-allowed;
}

.calendar-day.other-month.clickable:hover {
  transform: none;
  box-shadow: none;
  background-color: transparent;
}

/* Modal transitions */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
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

@media (max-width: 768px) {
  .modal-content {
    min-width: 320px;
    margin: 1rem;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
  }
}
</style>
