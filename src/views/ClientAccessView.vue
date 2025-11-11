<template>
  <div class="client-access-view">
    <!-- Vista de login con token -->
    <div v-if="!isAuthenticated" class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="login-icon">🔐</div>
          <h1 class="login-title">Acceso Clientes</h1>
          <p class="login-subtitle">Ingrese su token para acceder a sus actividades</p>
        </div>

        <form @submit.prevent="handleTokenLogin" class="login-form">
          <div class="form-group">
            <label for="token" class="form-label">Token de Acceso</label>
            <input
              id="token"
              v-model="tokenInput"
              type="text"
              class="form-input"
              placeholder="Ejemplo: RHC_abc123_1"
              :disabled="loading"
            />
          </div>

          <button type="submit" class="btn-submit" :disabled="!tokenInput || loading">
            <span v-if="loading">⏳ Validando...</span>
            <span v-else>🔓 Acceder</span>
          </button>

          <div v-if="error" class="error-message">
            <div class="error-icon">⚠️</div>
            <div class="error-text">{{ error }}</div>
          </div>
        </form>

        <div class="login-help">
          <p>¿No tienes un token?</p>
          <a href="#contacto" class="help-link">Contacta con RHC Asesorías</a>
        </div>
      </div>
    </div>

    <!-- Vista de actividades del cliente -->
    <div v-else class="activities-container">
      <div class="activities-header">
        <div class="header-content">
          <div class="client-info">
            <div class="client-icon">👤</div>
            <div class="client-details">
              <h1 class="client-name">{{ clientInfo?.businessName || 'Cliente' }}</h1>
              <p class="client-id">ID: {{ clientInfo?.id }}</p>
            </div>
          </div>
          <button @click="handleLogout" class="btn-logout">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      <div class="activities-content">
        <div class="welcome-section">
          <h2 class="section-title">Bienvenido a tu Portal</h2>
          <p class="section-description">
            Aquí podrás ver todas tus actividades, documentos y notificaciones.
          </p>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-value">{{ clientInfo?.totalEvents || 0 }}</div>
              <div class="stat-label">Total Eventos</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🌐</div>
            <div class="stat-info">
              <div class="stat-value">{{ clientInfo?.publicEvents || 0 }}</div>
              <div class="stat-label">Eventos Públicos</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔒</div>
            <div class="stat-info">
              <div class="stat-value">{{ clientInfo?.privateEvents || 0 }}</div>
              <div class="stat-label">Eventos Privados</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-info">
              <div class="stat-value">{{ upcomingEventsCount }}</div>
              <div class="stat-label">Próximos Eventos</div>
            </div>
          </div>
        </div>

        <!-- Sección de actividades -->
        <div class="activities-section">
          <div class="section-header">
            <h2 class="section-title">Mis Eventos</h2>
            <span class="total-count">{{ allClientEvents.length }} evento{{ allClientEvents.length !== 1 ? 's' : '' }}</span>
          </div>

          <div v-if="allClientEvents.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>No hay eventos registrados</h3>
            <p>Cuando tengas eventos asignados aparecerán aquí.</p>
          </div>

          <div v-else class="events-list">
            <!-- Próximos eventos -->
            <div v-if="upcomingEvents.length > 0" class="event-group">
              <h3 class="group-title">📅 Próximos Eventos</h3>
              <div v-for="event in upcomingEvents" :key="event.id" class="event-card">
                <div class="event-header">
                  <div class="event-type-badge" :class="`type-${event.eventType.toLowerCase()}`">
                    {{ getEventTypeLabel(event.eventType) }}
                  </div>
                  <div class="event-privacy">
                    {{ event.isPrivate ? '🔒 Privado' : '🌐 Público' }}
                  </div>
                </div>
                <h4 class="event-title">{{ event.title }}</h4>
                <p v-if="event.description" class="event-description">{{ event.description }}</p>
                <div class="event-footer">
                  <div class="event-date">
                    <span class="date-label">Inicio:</span>
                    <span class="date-value">{{ formatDate(event.startDate) }}</span>
                  </div>
                  <div v-if="event.endDate" class="event-date">
                    <span class="date-label">Fin:</span>
                    <span class="date-value">{{ formatDate(event.endDate) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Eventos pasados -->
            <div v-if="pastEvents.length > 0" class="event-group">
              <h3 class="group-title">📜 Eventos Pasados</h3>
              <div v-for="event in pastEvents" :key="event.id" class="event-card past-event">
                <div class="event-header">
                  <div class="event-type-badge" :class="`type-${event.eventType.toLowerCase()}`">
                    {{ getEventTypeLabel(event.eventType) }}
                  </div>
                  <div class="event-privacy">
                    {{ event.isPrivate ? '🔒 Privado' : '🌐 Público' }}
                  </div>
                </div>
                <h4 class="event-title">{{ event.title }}</h4>
                <p v-if="event.description" class="event-description">{{ event.description }}</p>
                <div class="event-footer">
                  <div class="event-date">
                    <span class="date-label">Inicio:</span>
                    <span class="date-value">{{ formatDate(event.startDate) }}</span>
                  </div>
                  <div v-if="event.endDate" class="event-date">
                    <span class="date-label">Fin:</span>
                    <span class="date-value">{{ formatDate(event.endDate) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección de documentos -->
        <div class="documents-section">
          <div class="section-header">
            <h2 class="section-title">Mis Documentos</h2>
            <button class="btn-secondary">📥 Ver Todos</button>
          </div>

          <div class="empty-state">
            <div class="empty-icon">📂</div>
            <h3>No hay documentos disponibles</h3>
            <p>Los documentos compartidos aparecerán aquí.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { eventService } from '@/services/api/eventService'
import type { PublicEvent } from '@/types/EventType'

defineOptions({
  name: 'ClientAccessView'
})

const isAuthenticated = ref(false)
const tokenInput = ref('')
const loading = ref(false)
const error = ref('')
const clientInfo = ref<{ id: number; businessName: string; totalEvents: number; publicEvents: number; privateEvents: number } | null>(null)
const currentToken = ref('')
const clientEvents = ref<{ public: PublicEvent[]; private: PublicEvent[] }>({ public: [], private: [] })

const handleTokenLogin = async () => {
  if (!tokenInput.value) return

  loading.value = true
  error.value = ''

  try {
    const result = await eventService.validateTokenAndGetEvents(tokenInput.value)

    if (result.tokenValidation.isValid) {
      isAuthenticated.value = true
      currentToken.value = tokenInput.value
      clientInfo.value = {
        id: result.clientData.clientId,
        businessName: 'Cliente', // Puedes obtener el nombre del cliente si está disponible
        totalEvents: result.clientData.totalEvents,
        publicEvents: result.clientData.publicEvents,
        privateEvents: result.clientData.privateEvents
      }
      clientEvents.value = result.events

      // Guardar en sessionStorage
      sessionStorage.setItem('clientToken', tokenInput.value)
      sessionStorage.setItem('clientId', result.clientData.clientId.toString())
    } else {
      error.value = result.tokenValidation.message || 'Token inválido'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al validar el token'
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  isAuthenticated.value = false
  tokenInput.value = ''
  currentToken.value = ''
  clientInfo.value = null
  clientEvents.value = { public: [], private: [] }
  error.value = ''
  sessionStorage.removeItem('clientToken')
  sessionStorage.removeItem('clientId')
}

// Computed
const upcomingEventsCount = computed(() => {
  const now = new Date()
  const allEvents = [...clientEvents.value.public, ...clientEvents.value.private]
  return allEvents.filter(event => new Date(event.startDate) > now).length
})

const allClientEvents = computed(() => {
  return [...clientEvents.value.public, ...clientEvents.value.private].sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )
})

const upcomingEvents = computed(() => {
  const now = new Date()
  return allClientEvents.value.filter(event => new Date(event.startDate) > now)
})

const pastEvents = computed(() => {
  const now = new Date()
  return allClientEvents.value.filter(event => new Date(event.startDate) <= now)
})

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
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

// Verificar si hay un token guardado al montar
const checkSavedToken = async () => {
  const savedToken = sessionStorage.getItem('clientToken')
  const savedClientId = sessionStorage.getItem('clientId')

  if (savedToken && savedClientId) {
    tokenInput.value = savedToken
    await handleTokenLogin()
  }
}

checkSavedToken()
</script>

<style scoped>
.client-access-view {
  min-height: 100vh;
}

/* Login Container - Estilos idénticos a Login.vue */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  padding: 2rem;
  padding-top: 8rem;
  background: var(--bg-gradient-primary);
  position: relative;
  transition: all 0.3s ease;
}

/* Estilos específicos para modo oscuro */
:root[data-theme='dark'] .login-container {
  background: linear-gradient(135deg, #001122 0%, #002244 50%, #001833 100%);
}

:root[data-theme='dark'] .login-card {
  background: rgba(0, 30, 60, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Bordes blancos para inputs en modo oscuro */
:root[data-theme='dark'] .form-input {
  border: 2px solid rgba(255, 255, 255, 0.3);
}

:root[data-theme='dark'] .form-input:focus {
  border-color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 40, 80, 0.6);
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.2);
}

:root[data-theme='dark'] .form-input:invalid {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--bg-gradient-accent);
  pointer-events: none;
}

.login-card {
  background: var(--bg-secondary);
  backdrop-filter: var(--backdrop-blur);
  border-radius: 20px;
  padding: 3rem;
  border: 1px solid var(--border-primary);
  box-shadow: 0 8px 32px var(--shadow-primary);
  text-align: center;
  width: 100%;
  max-width: 500px;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  animation: slideUp 0.5s ease-out;
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

.login-header {
  margin-bottom: 2rem;
}

.login-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.login-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px var(--shadow-primary);
  font-family: var(--font-primary);
}

.login-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
  opacity: 0.9;
  font-family: var(--font-primary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  text-align: left;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: var(--font-primary);
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 1rem;
  font-family: var(--font-primary);
  backdrop-filter: var(--backdrop-blur);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color-alpha-60);
  background: var(--bg-secondary);
  box-shadow: 0 0 20px var(--primary-color-alpha-30);
  transform: translateY(-1px);
}

.form-input:invalid {
  border-color: rgba(0, 94, 180, 0.6);
  box-shadow: 0 0 8px rgba(0, 94, 180, 0.2);
}

.form-input:disabled {
  background: var(--bg-tertiary);
  color: var(--text-disabled);
  cursor: not-allowed;
}

.btn-submit {
  width: 100%;
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px var(--primary-color-alpha-30);
  backdrop-filter: blur(10px);
  font-family: var(--font-primary);
  margin-top: 1rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--primary-color-alpha-40);
  background: var(--primary-gradient-hover);
}

.btn-submit:disabled {
  background: var(--bg-tertiary);
  color: var(--text-disabled);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fee2e2;
  border: 2px solid #ef4444;
  border-radius: 10px;
  padding: 1rem;
  margin-top: 1rem;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.error-icon {
  font-size: 1.5rem;
}

.error-text {
  color: #dc2626;
  font-weight: 500;
}

.login-help {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.login-help p {
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
  font-family: var(--font-primary);
}

.help-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
  font-family: var(--font-primary);
}

.help-link:hover {
  color: var(--primary-color-hover);
  text-decoration: underline;
}

/* Activities Container */
.activities-container {
  min-height: 100vh;
  background: #f8fafc;
}

.activities-header {
  background: white;
  padding: 2rem;
  padding-top: 6rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-bottom: 2px solid #e2e8f0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.client-icon {
  font-size: 3rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.client-details {
  flex: 1;
}

.client-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.client-id {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

.btn-logout {
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

.activities-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.welcome-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.section-description {
  color: #64748b;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
  color: #2563eb;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
}

/* Activities Section */
.activities-section,
.documents-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.filter-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #3b82f6;
  color: #3b82f6;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #3b82f6;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.2rem;
  color: #334155;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0;
}

/* Events List */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.event-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #334155;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.total-count {
  font-size: 0.9rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
}

.event-card {
  background: white;
  border: 2px solid #e0e7ff;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.1);
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  border-color: #3b82f6;
}

.event-card.past-event {
  opacity: 0.7;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.event-type-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-type-badge.type-meeting {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.event-type-badge.type-deadline {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.event-type-badge.type-reminder {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.event-type-badge.type-other {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.event-privacy {
  font-size: 0.85rem;
  color: #64748b;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.event-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
}

.event-description {
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.event-footer {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.event-date {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.date-value {
  font-size: 0.95rem;
  color: #334155;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }

  .login-card {
    padding: 2rem;
    max-width: 450px;
  }

  .login-title {
    font-size: 2rem;
  }

  .login-subtitle {
    font-size: 1rem;
  }

  .activities-header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .client-name {
    font-size: 1.4rem;
  }

  .activities-content {
    padding: 1rem;
  }

  .welcome-section,
  .activities-section,
  .documents-section {
    padding: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
    max-width: 350px;
  }

  .login-title {
    font-size: 1.8rem;
  }
}
</style>
