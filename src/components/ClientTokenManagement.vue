<template>
  <div class="token-management">
    <!-- Header con estadísticas -->
    <div class="stats-grid">
      <div class="stat-card total">
        <div class="stat-icon">🎫</div>
        <div class="stat-info">
          <div class="stat-label">Total Tokens</div>
          <div class="stat-value">{{ tokens.length }}</div>
        </div>
      </div>
      <div class="stat-card active">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-label">Activos</div>
          <div class="stat-value">{{ activeTokensCount }}</div>
        </div>
      </div>
      <div class="stat-card expired">
        <div class="stat-icon">⏰</div>
        <div class="stat-info">
          <div class="stat-label">Expirados</div>
          <div class="stat-value">{{ expiredTokensCount }}</div>
        </div>
      </div>
      <div class="stat-card inactive">
        <div class="stat-icon">❌</div>
        <div class="stat-info">
          <div class="stat-label">Desactivados</div>
          <div class="stat-value">{{ inactiveTokensCount }}</div>
        </div>
      </div>
    </div>

    <!-- Filtros y acciones -->
    <div class="toolbar">
      <div class="toolbar-left">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Buscar por token o cliente..."
          class="search-input"
        />
        <select v-model="filterClient" class="filter-select">
          <option value="">Todos los clientes</option>
          <option v-for="client in uniqueClients" :key="client.id" :value="client.id">
            {{ client.businessName }}
          </option>
        </select>
        <div class="filter-buttons">
          <button
            :class="['filter-btn', { active: filterStatus === 'all' }]"
            @click="filterStatus = 'all'"
          >
            Todos
          </button>
          <button
            :class="['filter-btn', { active: filterStatus === 'active' }]"
            @click="filterStatus = 'active'"
          >
            Activos
          </button>
          <button
            :class="['filter-btn', { active: filterStatus === 'expired' }]"
            @click="filterStatus = 'expired'"
          >
            Expirados
          </button>
          <button
            :class="['filter-btn', { active: filterStatus === 'inactive' }]"
            @click="filterStatus = 'inactive'"
          >
            Desactivados
          </button>
        </div>
      </div>
      <button class="btn-create" @click="showCreateModal = true">
        ➕ Crear Token
      </button>
    </div>

    <!-- Grid de tokens -->
    <div v-if="loading && tokens.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando tokens...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="fetchTokens()" class="btn-retry">Reintentar</button>
    </div>

    <div v-else-if="filteredTokens.length === 0" class="empty-state">
      <div class="empty-icon">🔐</div>
      <p>No se encontraron tokens</p>
      <button class="btn-create" @click="showCreateModal = true">Crear primer token</button>
    </div>

    <div v-else class="tokens-grid">
      <div v-for="token in filteredTokens" :key="token.id" class="token-card" :class="getTokenStatusClass(token)">
        <!-- Header del token -->
        <div class="token-header">
          <div class="token-status-badge" :class="getTokenStatusClass(token)">
            {{ getTokenStatusText(token) }}
          </div>
          <div class="token-actions">
            <button
              v-if="token.isActive && !isExpired(token)"
              class="action-btn renew"
              @click="openRenewModal(token)"
              title="Renovar"
            >
              🔄
            </button>
            <button
              class="action-btn toggle"
              @click="handleToggleActive(token)"
              :title="token.isActive ? 'Desactivar' : 'Activar'"
            >
              {{ token.isActive ? '🔒' : '🔓' }}
            </button>
            <button
              v-if="canDeleteTokens"
              class="action-btn delete"
              @click="handleDelete(token)"
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- Cliente info -->
        <div class="token-client">
          <div class="client-icon">👤</div>
          <div class="client-info">
            <div class="client-name">{{ token.client?.businessName || 'Cliente desconocido' }}</div>
            <div class="client-id">ID: {{ token.clientId }}</div>
          </div>
        </div>

        <!-- Token value con copy - Solo visible para usuarios con permisos -->
        <div v-if="canViewTokenDetails" class="token-value-container">
          <div class="token-label">Token</div>
          <div class="token-value">
            <code>{{ token.token }}</code>
            <button class="btn-copy" @click="copyToClipboard(token.token)" title="Copiar">
              📋
            </button>
          </div>
        </div>

        <!-- Expiración con countdown -->
        <div class="token-expiration">
          <div class="expiration-icon">⏳</div>
          <div class="expiration-info">
            <div class="expiration-label">
              {{ isExpired(token) ? 'Expiró' : 'Expira' }}
            </div>
            <div class="expiration-date">
              {{ formatDate(token.expiresAt) }}
            </div>
            <div v-if="!isExpired(token)" class="expiration-countdown">
              {{ getTimeRemaining(token.expiresAt) }}
            </div>
          </div>
        </div>

        <!-- Timeline visual -->
        <div class="token-timeline">
          <div class="timeline-bar" :style="{ width: getTimelineProgress(token) + '%' }"></div>
        </div>

        <!-- Metadata -->
        <div class="token-metadata">
          <div class="metadata-item">
            <span class="metadata-label">Creado por:</span>
            <span class="metadata-value">{{ token.creator?.name || 'N/A' }}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Último uso:</span>
            <span class="metadata-value">{{ token.lastUsed ? formatDate(token.lastUsed) : 'Nunca' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de validador de tokens -->
    <div class="validator-section">
      <div class="validator-header">
        <h3>🔍 Validador de Tokens</h3>
        <p>Ingresa un token para verificar su validez</p>
      </div>
      <div class="validator-form">
        <input
          v-model="tokenToValidate"
          type="text"
          placeholder="Ingresa el token (ej: RHC_abc123_1)"
          class="validator-input"
        />
        <button
          class="btn-validate"
          @click="handleValidateToken"
          :disabled="!tokenToValidate || loading"
        >
          {{ loading ? '⏳' : '✓' }} Validar
        </button>
      </div>
      <div v-if="validationResult" class="validation-result" :class="validationResult.isValid ? 'valid' : 'invalid'">
        <div class="validation-icon">
          {{ validationResult.isValid ? '✅' : '❌' }}
        </div>
        <div class="validation-info">
          <div class="validation-status">
            {{ validationResult.isValid ? 'Token Válido' : 'Token Inválido' }}
          </div>
          <div class="validation-message">{{ validationResult.message }}</div>
          <div v-if="validationResult.isValid" class="validation-details">
            <p><strong>Cliente ID:</strong> {{ validationResult.clientId }}</p>
            <p><strong>Expira:</strong> {{ formatDate(validationResult.expiresAt!) }}</p>
            <p v-if="validationResult.lastUsed"><strong>Último uso:</strong> {{ formatDate(validationResult.lastUsed) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal crear token -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Crear Nuevo Token</h3>
          <button class="modal-close" @click="showCreateModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Cliente</label>
            <select v-model="newToken.clientId" class="form-input" required>
              <option value="">Seleccionar cliente...</option>
              <option v-for="client in uniqueClients" :key="client.id" :value="client.id">
                {{ client.businessName }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Validez (minutos)</label>
            <input
              v-model.number="newToken.validityMinutes"
              type="number"
              class="form-input"
              placeholder="Ej: 43200 (30 días)"
              min="1"
            />
            <small class="form-hint">
              Sugerencias: 1440 = 1 día, 10080 = 7 días, 43200 = 30 días
            </small>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showCreateModal = false">Cancelar</button>
          <button
            class="btn-confirm"
            @click="handleCreateToken"
            :disabled="!newToken.clientId || !newToken.validityMinutes"
          >
            Crear Token
          </button>
        </div>
      </div>
    </div>

    <!-- Modal renovar token -->
    <div v-if="showRenewModal" class="modal-overlay" @click="showRenewModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Renovar Token</h3>
          <button class="modal-close" @click="showRenewModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p>Renovar token para: <strong>{{ selectedToken?.client?.businessName }}</strong></p>
          <div class="form-group">
            <label>Nueva validez (minutos)</label>
            <input
              v-model.number="renewValidityMinutes"
              type="number"
              class="form-input"
              placeholder="Ej: 43200 (30 días)"
              min="1"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showRenewModal = false">Cancelar</button>
          <button
            class="btn-confirm"
            @click="handleRenewToken"
            :disabled="!renewValidityMinutes"
          >
            Renovar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
          <button class="modal-close" @click="showDeleteModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de eliminar este token?</p>
          <p class="warning-text">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteModal = false">Cancelar</button>
          <button class="btn-delete" @click="confirmDelete">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClientTokens } from '@/composables/useClientTokens'
import { useAuth } from '@/composables/useAuth'
import type { ClientToken } from '@/types/ClientTokenType'

const {
  tokens,
  loading,
  error,
  validationResult,
  fetchTokens,
  createToken,
  renewToken,
  toggleTokenActive,
  deleteToken,
  validateToken
} = useClientTokens()

const { canViewTokenDetails, canDeleteTokens } = useAuth()

// Estado local
const searchQuery = ref('')
const filterClient = ref('')
const filterStatus = ref<'all' | 'active' | 'expired' | 'inactive'>('all')
const showCreateModal = ref(false)
const showRenewModal = ref(false)
const showDeleteModal = ref(false)
const selectedToken = ref<ClientToken | null>(null)
const tokenToValidate = ref('')
const newToken = ref({
  clientId: null as number | null,
  validityMinutes: 43200 // 30 días por defecto
})
const renewValidityMinutes = ref(43200)

// Computed
const uniqueClients = computed(() => {
  const clientMap = new Map()
  tokens.value.forEach(token => {
    if (token.client && !clientMap.has(token.client.id)) {
      clientMap.set(token.client.id, token.client)
    }
  })
  return Array.from(clientMap.values())
})

const activeTokensCount = computed(() =>
  tokens.value.filter(t => t.isActive && !isExpired(t)).length
)

const expiredTokensCount = computed(() =>
  tokens.value.filter(t => isExpired(t)).length
)

const inactiveTokensCount = computed(() =>
  tokens.value.filter(t => !t.isActive).length
)

const filteredTokens = computed(() => {
  let result = tokens.value

  // Filtrar por cliente
  if (filterClient.value) {
    result = result.filter(t => t.clientId === Number(filterClient.value))
  }

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      t =>
        t.token.toLowerCase().includes(query) ||
        t.client?.businessName.toLowerCase().includes(query)
    )
  }

  // Filtrar por estado
  if (filterStatus.value === 'active') {
    result = result.filter(t => t.isActive && !isExpired(t))
  } else if (filterStatus.value === 'expired') {
    result = result.filter(t => isExpired(t))
  } else if (filterStatus.value === 'inactive') {
    result = result.filter(t => !t.isActive)
  }

  return result
})

// Métodos
const isExpired = (token: ClientToken): boolean => {
  return new Date(token.expiresAt) < new Date()
}

const getTokenStatusClass = (token: ClientToken): string => {
  if (!token.isActive) return 'status-inactive'
  if (isExpired(token)) return 'status-expired'
  return 'status-active'
}

const getTokenStatusText = (token: ClientToken): string => {
  if (!token.isActive) return 'Desactivado'
  if (isExpired(token)) return 'Expirado'
  return 'Activo'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTimeRemaining = (expiresAt: string): string => {
  const now = new Date()
  const expiration = new Date(expiresAt)
  const diff = expiration.getTime() - now.getTime()

  if (diff < 0) return 'Expirado'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const getTimelineProgress = (token: ClientToken): number => {
  const now = new Date().getTime()
  const created = new Date(token.createdAt).getTime()
  const expires = new Date(token.expiresAt).getTime()
  const total = expires - created
  const elapsed = now - created

  if (elapsed >= total) return 100
  if (elapsed <= 0) return 0

  return (elapsed / total) * 100
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('Token copiado al portapapeles')
  } catch {
    alert('Error al copiar el token')
  }
}

const handleCreateToken = async () => {
  if (!newToken.value.clientId || !newToken.value.validityMinutes) return

  const result = await createToken({
    clientId: newToken.value.clientId,
    validityMinutes: newToken.value.validityMinutes
  })

  if (result) {
    showCreateModal.value = false
    newToken.value = { clientId: null, validityMinutes: 43200 }
  }
}

const openRenewModal = (token: ClientToken) => {
  selectedToken.value = token
  renewValidityMinutes.value = 43200
  showRenewModal.value = true
}

const handleRenewToken = async () => {
  if (!selectedToken.value || !renewValidityMinutes.value) return

  const success = await renewToken(selectedToken.value.id, {
    validityMinutes: renewValidityMinutes.value
  })

  if (success) {
    showRenewModal.value = false
    selectedToken.value = null
  }
}

const handleToggleActive = async (token: ClientToken) => {
  await toggleTokenActive(token.id, !token.isActive)
}

const handleDelete = (token: ClientToken) => {
  selectedToken.value = token
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!selectedToken.value) return

  const success = await deleteToken(selectedToken.value.id)

  if (success) {
    showDeleteModal.value = false
    selectedToken.value = null
  }
}

const handleValidateToken = async () => {
  if (!tokenToValidate.value) return
  await validateToken(tokenToValidate.value)
}

onMounted(() => {
  fetchTokens()
})
</script>

<style scoped>
.token-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
  border-radius: 12px;
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.active {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-card.expired {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.inactive {
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 1rem;
  opacity: 1;
  margin-bottom: 0.25rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  flex: 1;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: 0.75rem 1rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  transition: border-color 0.2s;
}

.search-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  background: white;
  cursor: pointer;
}

.filter-select option {
  font-weight: 600;
  color: #0f172a;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.75rem 1.25rem;
  border: 2px solid #cbd5e1;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 700;
  color: #0f172a;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.btn-create {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.btn-create:hover {
  transform: translateY(-2px);
}

/* Tokens Grid */
.tokens-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.token-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.token-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.token-card.status-active {
  border-left: 4px solid #38ef7d;
}

.token-card.status-expired {
  border-left: 4px solid #f5576c;
  opacity: 0.8;
}

.token-card.status-inactive {
  border-left: 4px solid #4b6cb7;
  opacity: 0.7;
}

.token-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.token-status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
}

.token-status-badge.status-active {
  background: #d4fcee;
  color: #047857;
}

.token-status-badge.status-expired {
  background: #ffe0e6;
  color: #dc2626;
}

.token-status-badge.status-inactive {
  background: #e2e8f0;
  color: #334155;
}

.token-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.renew {
  background: #e0f2fe;
}

.action-btn.renew:hover {
  background: #0ea5e9;
}

.action-btn.toggle {
  background: #fef3c7;
}

.action-btn.toggle:hover {
  background: #f59e0b;
}

.action-btn.delete {
  background: #fee2e2;
}

.action-btn.delete:hover {
  background: #ef4444;
}

.token-client {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.client-icon {
  font-size: 2rem;
}

.client-info {
  flex: 1;
}

.client-name {
  font-weight: 700;
  font-size: 1.125rem;
  color: #0f172a;
}

.client-id {
  font-size: 0.9rem;
  color: #475569;
  font-weight: 600;
}

.token-value-container {
  margin-bottom: 1rem;
}

.token-label {
  font-size: 0.9rem;
  color: #334155;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.token-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
}

.token-value code {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  color: #0f172a;
  font-weight: 600;
  word-break: break-all;
}

.btn-copy {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.btn-copy:hover {
  background: #5568d3;
}

.token-expiration {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 8px;
}

.expiration-icon {
  font-size: 1.8rem;
}

.expiration-info {
  flex: 1;
}

.expiration-label {
  font-size: 0.9rem;
  color: #78350f;
  font-weight: 700;
}

.expiration-date {
  font-size: 1rem;
  color: #92400e;
  margin-top: 0.25rem;
  font-weight: 600;
}

.expiration-countdown {
  font-size: 1.125rem;
  font-weight: 700;
  color: #b45309;
  margin-top: 0.25rem;
}

.token-timeline {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.timeline-bar {
  height: 100%;
  background: linear-gradient(90deg, #11998e 0%, #f5576c 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

.token-metadata {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.metadata-label {
  color: #475569;
  font-weight: 700;
}

.metadata-value {
  color: #0f172a;
  font-weight: 600;
}

/* Validator Section */
.validator-section {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 2rem;
  border-radius: 12px;
  margin-top: 3rem;
}

.validator-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.validator-header h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #0f172a;
  font-weight: 700;
}

.validator-header p {
  color: #475569;
  font-weight: 600;
}

.validator-form {
  display: flex;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto 1.5rem;
}

.validator-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.validator-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.btn-validate {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.btn-validate:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-validate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.validation-result {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  gap: 1rem;
  animation: slideIn 0.3s;
}

.validation-result.valid {
  background: #d4fcee;
  border: 2px solid #047857;
}

.validation-result.invalid {
  background: #ffe0e6;
  border: 2px solid #dc2626;
}

.validation-icon {
  font-size: 2.5rem;
}

.validation-info {
  flex: 1;
}

.validation-status {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #0f172a;
}

.validation-message {
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #334155;
}

.validation-details {
  font-size: 0.95rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-weight: 600;
  color: #475569;
}

.validation-details p {
  margin: 0.25rem 0;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-state p,
.error-state p,
.empty-state p {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin-top: 1rem;
}

.error-state .btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: #0f172a;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #475569;
  font-weight: 700;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: #0f172a;
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.form-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-hint {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #475569;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel,
.btn-confirm,
.btn-delete {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-cancel {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.btn-delete {
  background: linear-gradient(135deg, #f5576c 0%, #e83b55 100%);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.btn-cancel:hover,
.btn-confirm:hover,
.btn-delete:hover {
  transform: translateY(-2px);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.warning-text {
  color: #dc2626;
  font-weight: 700;
  margin-top: 1rem;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .tokens-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    flex-direction: column;
  }

  .filter-buttons {
    flex-wrap: wrap;
  }
}
</style>
