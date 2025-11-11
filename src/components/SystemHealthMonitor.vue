<template>
  <div class="health-monitor">
    <div class="monitor-header">
      <div class="header-left">
        <h3>🏥 Estado del Sistema</h3>
        <p>Monitoreo en tiempo real</p>
      </div>
      <div class="header-right">
        <button
          class="btn-refresh"
          @click="checkHealth"
          :disabled="loading"
        >
          {{ loading ? '⏳' : '🔄' }} Actualizar
        </button>
        <div class="auto-refresh-toggle">
          <input
            type="checkbox"
            id="autoRefresh"
            v-model="autoRefresh"
            class="toggle-input"
          />
          <label for="autoRefresh">Auto-actualizar (30s)</label>
        </div>
      </div>
    </div>

    <!-- Status Overview -->
    <div v-if="healthData" class="status-overview">
      <div class="status-card main-status" :class="getStatusClass(healthData.status)">
        <div class="status-icon">
          {{ getStatusIcon(healthData.status) }}
        </div>
        <div class="status-info">
          <div class="status-label">Estado General</div>
          <div class="status-value">{{ healthData.status.toUpperCase() }}</div>
          <div class="status-time">{{ formatTimestamp(healthData.timestamp) }}</div>
        </div>
      </div>

      <div class="status-card" :class="getDatabaseStatusClass()">
        <div class="status-icon">🗄️</div>
        <div class="status-info">
          <div class="status-label">Base de Datos</div>
          <div class="status-value">{{ healthData.database.status }}</div>
          <div class="status-detail">{{ healthData.database.responseTime }}ms</div>
        </div>
      </div>

      <div class="status-card uptime">
        <div class="status-icon">⏱️</div>
        <div class="status-info">
          <div class="status-label">Tiempo Activo</div>
          <div class="status-value">{{ formatUptime(healthData.uptime) }}</div>
        </div>
      </div>

      <div class="status-card version">
        <div class="status-icon">📦</div>
        <div class="status-info">
          <div class="status-label">Versión</div>
          <div class="status-value">{{ healthData.version }}</div>
        </div>
      </div>
    </div>

    <!-- Memory Usage -->
    <div v-if="healthData" class="memory-section">
      <h4>💾 Uso de Memoria</h4>
      <div class="memory-stats">
        <div class="memory-info">
          <span class="memory-label">Usado:</span>
          <span class="memory-value">{{ formatBytes(healthData.memory.used) }}</span>
        </div>
        <div class="memory-info">
          <span class="memory-label">Total:</span>
          <span class="memory-value">{{ formatBytes(healthData.memory.total) }}</span>
        </div>
        <div class="memory-info">
          <span class="memory-label">Porcentaje:</span>
          <span class="memory-value">{{ healthData.memory.percentage.toFixed(1) }}%</span>
        </div>
      </div>
      <div class="memory-bar">
        <div
          class="memory-fill"
          :style="{ width: healthData.memory.percentage + '%' }"
          :class="getMemoryClass(healthData.memory.percentage)"
        ></div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !healthData" class="loading-state">
      <div class="spinner"></div>
      <p>Verificando estado del sistema...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="checkHealth" class="btn-retry">Reintentar</button>
    </div>

    <!-- Health History Chart (Simple Visual) -->
    <div v-if="healthHistory.length > 0" class="health-history">
      <h4>📊 Historial (Últimas {{ healthHistory.length }} Verificaciones)</h4>
      <div class="history-chart">
        <div
          v-for="(record, index) in healthHistory"
          :key="index"
          class="history-bar"
          :class="getStatusClass(record.status)"
          :style="{ height: record.responseTime + 'px' }"
          :title="`${record.status} - ${record.responseTime}ms - ${formatTimestamp(record.timestamp)}`"
        >
          <span class="bar-label">{{ record.responseTime }}ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { healthService, type HealthCheckResponse } from '@/services/api/healthService'

const healthData = ref<HealthCheckResponse | null>(null)
const loading = ref(false)
const error = ref('')
const autoRefresh = ref(true)
const healthHistory = ref<Array<{ status: string; responseTime: number; timestamp: string }>>([])
let refreshInterval: number | null = null

const checkHealth = async () => {
  loading.value = true
  error.value = ''
  
  const startTime = Date.now()
  
  try {
    const data = await healthService.check()
    const responseTime = Date.now() - startTime
    
    healthData.value = data
    
    // Agregar al historial (máximo 20 registros)
    healthHistory.value.push({
      status: data.status,
      responseTime: Math.min(responseTime, 200), // Cap for visual purposes
      timestamp: data.timestamp
    })
    
    if (healthHistory.value.length > 20) {
      healthHistory.value.shift()
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al verificar el estado del sistema'
    console.error('Health check error:', err)
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status: string): string => {
  const statusLower = status.toLowerCase()
  if (statusLower === 'healthy' || statusLower === 'ok') return 'status-healthy'
  if (statusLower === 'degraded') return 'status-warning'
  return 'status-error'
}

const getDatabaseStatusClass = (): string => {
  if (!healthData.value) return ''
  return getStatusClass(healthData.value.database.status)
}

const getStatusIcon = (status: string): string => {
  const statusLower = status.toLowerCase()
  if (statusLower === 'healthy' || statusLower === 'ok') return '✅'
  if (statusLower === 'degraded') return '⚠️'
  return '❌'
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: 'short'
  })
}

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const getMemoryClass = (percentage: number): string => {
  if (percentage < 60) return 'memory-good'
  if (percentage < 80) return 'memory-warning'
  return 'memory-critical'
}

const startAutoRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval)
  refreshInterval = window.setInterval(() => {
    checkHealth()
  }, 30000) // 30 segundos
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

watch(autoRefresh, (newValue) => {
  if (newValue) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})

onMounted(() => {
  checkHealth()
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.health-monitor {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.8rem;
  color: #1e293b;
}

.header-left p {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-refresh {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  font-size: 1rem;
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auto-refresh-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #475569;
}

.toggle-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Status Overview */
.status-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.status-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
}

.status-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.status-card.main-status {
  grid-column: 1 / -1;
}

.status-card.status-healthy {
  border-left: 4px solid #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.status-card.status-warning {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.status-card.status-error {
  border-left: 4px solid #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.status-icon {
  font-size: 3rem;
}

.status-info {
  flex: 1;
}

.status-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-top: 0.25rem;
}

.status-time,
.status-detail {
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 0.25rem;
}

/* Memory Section */
.memory-section {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.memory-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #1e293b;
}

.memory-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.memory-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.memory-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}

.memory-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.memory-bar {
  height: 30px;
  background: #e2e8f0;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
}

.memory-fill {
  height: 100%;
  border-radius: 15px;
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 1rem;
  color: white;
  font-weight: 600;
}

.memory-fill.memory-good {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}

.memory-fill.memory-warning {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
}

.memory-fill.memory-critical {
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
}

/* States */
.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
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

.error-icon {
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
  font-weight: 600;
  cursor: pointer;
}

/* Health History */
.health-history {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
}

.health-history h4 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #1e293b;
}

.history-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  height: 200px;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.history-bar {
  flex: 1;
  min-height: 20px;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.25rem;
}

.history-bar.status-healthy {
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
}

.history-bar.status-warning {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
}

.history-bar.status-error {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
}

.history-bar:hover {
  opacity: 0.8;
  transform: scaleY(1.05);
}

.bar-label {
  font-size: 0.7rem;
  color: white;
  font-weight: 600;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

/* Responsive */
@media (max-width: 768px) {
  .health-monitor {
    padding: 1rem;
  }

  .monitor-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .btn-refresh {
    width: 100%;
  }

  .status-overview {
    grid-template-columns: 1fr;
  }

  .memory-stats {
    flex-direction: column;
    gap: 0.75rem;
  }

  .history-chart {
    height: 150px;
  }
}
</style>
