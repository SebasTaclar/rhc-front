<template>
  <div class="admin-dashboard">
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Selección del Wallpaper Ganador</h1>
        <p>Dinámica disponible solo para administradores</p>
        <button @click="refreshData" :disabled="isLoadingPurchases || isRefreshingWallpapers" class="refresh-btn">
          <span v-if="isLoadingPurchases || isRefreshingWallpapers">🔄</span>
          <span v-else>↻</span>
          {{ isRefreshingWallpapers ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </div>

      <div class="winner-selection-section">
        <!-- Confetti Animation -->
        <div v-if="isGameComplete && winnerNumber" class="confetti-container">
          <!-- Lluvia de confeti (existente) -->
          <div v-for="i in 50" :key="`rain-${i}`" class="confetti" :style="getConfettiStyle(i)"></div>
          <!-- Estallido central de confeti (nuevo) -->
          <div v-for="i in 80" :key="`burst-${i}`" class="confetti-burst" :style="getBurstConfettiStyle(i)"></div>
        </div>

        <div class="winner-header">
          <h3>🎯 Selección del Wallpaper Ganador</h3>
          <p>Genera el número ganador de entre los wallpapers pagados/aprobados</p>
        </div>

        <div class="winner-stats">
          <div class="eligible-numbers">
            <span class="stat-label">Wallpapers Vendidos - Números Elegibles:</span>
            <span class="stat-value">{{ eligibleNumbers.length }}</span>
          </div>
        </div>

        <div class="winner-game-container">
          <div v-if="!isGameStarted && !winnerNumber" class="game-start">
            <button @click="startWinnerGame" :disabled="eligibleNumbers.length === 0 || isGameRunning"
              class="start-game-btn">
              🎲 Iniciar Dinámica
            </button>
            <div class="game-rules">
              <p class="game-hint">
                Se realizarán 5 intentos antes de revelar el ganador de la moto
                <br>
                <small v-if="eligibleNumbers.length < 5" class="warning-text">⚠️ Solo hay {{ eligibleNumbers.length }}
                  números únicos - algunos números pueden repetirse</small>
                <small v-else class="success-text">✅ {{ eligibleNumbers.length }} números únicos disponibles</small>
              </p>
            </div>
          </div>

          <div v-if="isGameStarted" class="game-active">
            <div class="game-explanation">
              <h4>🏆 ¡El quinto número es el ganador de la moto!</h4>
              <p>Los primeros 4 números ganarán dinero</p>
            </div>
            <div class="attempts-container">
              <h4>Intentos: {{ currentAttempt - 1 }}/5</h4>
              <div class="attempts-display">
                <div v-for="(attempt, index) in attempts" :key="index" class="attempt-number" :class="{
                  'current': index === currentAttempt - 1 && !isGameComplete,
                  'revealed': index < currentAttempt - 1 || isGameComplete,
                  'spinning': isShowingSpinEffect && index === currentAttempt - 1,
                  'clickable': attempt && index < 4
                }" @click="attempt && index < 4 ? showWinnerModal(attempt, index) : null">
                  <div class="attempt-number-display">
                    {{ isShowingSpinEffect && index === currentAttempt - 1 ? (spinningNumbers[index] || '?') : (attempt
                      || '?') }}
                  </div>
                </div>
              </div>
            </div>

            <div class="game-controls">
              <button v-if="currentAttempt <= 5 && !isGameComplete" @click="nextAttempt" :disabled="isProcessingAttempt"
                class="next-attempt-btn">
                {{ isProcessingAttempt ? '🎯 Generando...' : (currentAttempt === 5 ? '🏆 Revelar Ganador' : `🎯 Intento
                ${currentAttempt}`) }}
              </button>
            </div>

            <div v-if="isGameStarted" class="reset-controls">
              <button @click="confirmResetGame" class="reset-game-btn">🔄 Nueva Dinámica</button>
            </div>

            <div v-if="showModal" class="inline-winner-modal">
              <div class="inline-modal-content">
                <button class="modal-close" @click="closeModal">×</button>
                <div class="modal-header">
                  <h2>🎉 ¡FELICITACIONES! 🎉</h2>
                  <div class="modal-number-display">#{{ selectedWinner.number }}</div>
                </div>
                <div class="modal-body">
                  <h3 v-if="selectedWinner.position === 4">🏆 ¡Ganaste la motocicleta!</h3>
                  <h3 v-else>💰 ¡Ganaste dinero!</h3>
                  <p class="win-message">{{ getWinMessage(selectedWinner.position) }}</p>
                  <div v-if="selectedWinner.purchase" class="modal-winner-details">
                    <h4>Detalles del Ganador:</h4>
                    <p><strong>Nombre:</strong> {{ formatWinnerName(selectedWinner.purchase.buyerName) }}</p>
                    <p><strong>Teléfono:</strong> {{ formatWinnerPhone(selectedWinner.purchase.buyerContactNumber) }}
                    </p>
                    <p><strong>Fecha de Compra:</strong> {{ formatDateOnly(selectedWinner.purchase.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="isGameComplete && winnerNumber" class="winner-reveal">
              <div class="winner-announcement">
                <h2>🎉 ¡NÚMERO GANADOR! 🎉</h2>
                <div class="winner-number-display">#{{ winnerNumber }}</div>
                <h2 class="winner-title">🎉 ¡Felicitaciones al Ganador de la Moto! 🎉</h2>
                <div v-if="winnerPurchase" class="winner-details">
                  <h3>Detalles del Ganador:</h3>
                  <p><strong>Nombre:</strong> {{ formatWinnerName(winnerPurchase.buyerName) }}</p>
                  <p><strong>Teléfono:</strong> {{ formatWinnerPhone(winnerPurchase.buyerContactNumber) }}</p>
                  <p><strong>Fecha de Compra:</strong> {{ formatDateOnly(winnerPurchase.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para resetear dinámica -->
    <div v-if="showResetConfirmModal" class="reset-confirm-modal">
      <div class="reset-modal-overlay" @click="cancelResetGame"></div>
      <div class="reset-modal-content">
        <div class="reset-modal-header">
          <h3>⚠️ Confirmar Nueva Dinámica</h3>
        </div>
        <div class="reset-modal-body">
          <p>¿Estás seguro de que deseas iniciar una nueva dinámica?</p>
          <p><strong>Esta acción eliminará:</strong></p>
          <ul>
            <li>El progreso actual de la dinámica</li>
            <li>Los ganadores guardados</li>
            <li>Todos los intentos realizados</li>
          </ul>
          <p class="warning-text">Esta acción no se puede deshacer.</p>
        </div>
        <div class="reset-modal-actions">
          <button @click="cancelResetGame" class="cancel-reset-btn">Cancelar</button>
          <button @click="executeResetGame" class="confirm-reset-btn">Sí, Nueva Dinámica</button>
        </div>
      </div>
    </div>

    <!-- Tiempo restante durante revelación -->
    <div v-if="showRemainingTime" class="remaining-time-overlay">
      <div class="remaining-time-content">
        <h3>Revelando número...</h3>
        <div class="time-display">{{ remainingTime }}s</div>
      </div>
    </div>

    <!-- Overlay de bloqueo durante procesamiento -->
    <div v-if="isProcessingAttempt && !showRemainingTime" class="processing-overlay">
      <div class="processing-content">
        <div class="spinner"></div>
        <h3>Generando número...</h3>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminPurchases } from '@/composables/useAdminPurchases'
import { useNumbersAvailability } from '@/composables/useNumbersAvailability'
import { authService } from '@/services/api/authService'
import { useRouter } from 'vue-router'
import type { Purchase } from '@/services/api/paymentService'

const router = useRouter()

// Verificar permisos de administrador
if (!authService.isAdmin()) {
  router.push('/')
}

// Admin purchases composable
const {
  isLoading: isLoadingPurchases,
  purchasesByStatus,
  getAllPurchases
} = useAdminPurchases()

// Numbers availability composable
const {
  refreshTakenNumbers,
} = useNumbersAvailability()

// Estado local
const isRefreshingWallpapers = ref(false)

// Persistencia de ganadores en localStorage
const WINNERS_KEY = 'dw_winners'
const GAME_STATE_KEY = 'dw_game_state'

type PrizeType = 'money' | 'grand'
type StoredWinner = {
  position: number // 1..5
  number: number
  prize: PrizeType
  purchase: {
    id: string
    buyerName: string
    buyerEmail: string
    buyerContactNumber: string
    createdAt: string
  } | null
  savedAt: string // ISO string
}

type GameState = {
  isGameStarted: boolean
  currentAttempt: number
  attempts: (number | null)[]
  winnerNumber: number | null
  isGameComplete: boolean
  isGameRunning: boolean
  savedAt: string
}

const winners = ref<StoredWinner[]>([])

const loadWinnersFromStorage = () => {
  try {
    const raw = localStorage.getItem(WINNERS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StoredWinner[]
      if (Array.isArray(parsed)) winners.value = parsed
    }
  } catch (e) {
    console.warn('No se pudo cargar ganadores del localStorage', e)
  }
}

const saveWinnersToStorage = () => {
  try {
    localStorage.setItem(WINNERS_KEY, JSON.stringify(winners.value))
  } catch (e) {
    console.warn('No se pudo guardar ganadores en localStorage', e)
  }
}

const loadGameStateFromStorage = () => {
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as GameState
      isGameStarted.value = parsed.isGameStarted
      currentAttempt.value = parsed.currentAttempt
      attempts.value = parsed.attempts
      winnerNumber.value = parsed.winnerNumber
      isGameComplete.value = parsed.isGameComplete
      isGameRunning.value = parsed.isGameRunning
      console.log('Estado del juego cargado desde localStorage', parsed)
    }
  } catch (e) {
    console.warn('No se pudo cargar estado del juego del localStorage', e)
  }
}

const saveGameStateToStorage = () => {
  try {
    const gameState: GameState = {
      isGameStarted: isGameStarted.value,
      currentAttempt: currentAttempt.value,
      attempts: attempts.value,
      winnerNumber: winnerNumber.value,
      isGameComplete: isGameComplete.value,
      isGameRunning: isGameRunning.value,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState))
  } catch (e) {
    console.warn('No se pudo guardar estado del juego en localStorage', e)
  }
}

const addWinner = (positionIndex: number, number: number | null, purchase: Purchase | null, prize: PrizeType) => {
  if (number == null) return
  const position = positionIndex + 1 // convertir 0..4 -> 1..5
  // Evitar duplicar si ya existe ese puesto
  if (winners.value.some(w => w.position === position)) return

  winners.value.push({
    position,
    number,
    prize,
    purchase: purchase
      ? {
        id: purchase.id,
        buyerName: purchase.buyerName,
        buyerEmail: purchase.buyerEmail,
        buyerContactNumber: purchase.buyerContactNumber,
        createdAt: purchase.createdAt,
      }
      : null,
    savedAt: new Date().toISOString(),
  })
  saveWinnersToStorage()
}

const clearWinners = () => {
  winners.value = []
  saveWinnersToStorage()
}

// Winner game state
const isGameStarted = ref(false)
const currentAttempt = ref(1)
const attempts = ref<(number | null)[]>([null, null, null, null, null])
const winnerNumber = ref<number | null>(null)
const isGameComplete = ref(false)
const isGameRunning = ref(false)
const isProcessingAttempt = ref(false)
const isShowingSpinEffect = ref(false)
const spinningNumbers = ref<(number | null)[]>([null, null, null, null, null])

// Modal state para confirmación de reset
const showResetConfirmModal = ref(false)

// Countdown state
const remainingTime = ref(0)
const showRemainingTime = ref(false)

// Modal state para ganadores de dinero
const showModal = ref(false)
const selectedWinner = ref<{
  number: number | null
  position: number
  purchase: Purchase | null
}>({
  number: null,
  position: 0,
  purchase: null
})

// (El modal de confirmación se omitió en esta vista simplificada)

// Compras filtradas

// Números elegibles para el sorteo (solo aprobados y completados)
const eligibleNumbers = computed(() => {
  const approvedPurchases = purchasesByStatus.value.APPROVED || []
  const completedPurchases = purchasesByStatus.value.COMPLETED || []
  const eligiblePurchases = [...approvedPurchases, ...completedPurchases]
  const numbers: number[] = []

  eligiblePurchases.forEach(purchase => {
    if (purchase.wallpaperNumbers && Array.isArray(purchase.wallpaperNumbers)) {
      numbers.push(...purchase.wallpaperNumbers)
    }
  })

  return Array.from(new Set(numbers)).sort((a, b) => a - b) // Remove duplicates and sort
})

// Encontrar la compra ganadora
const winnerPurchase = computed(() => {
  if (!winnerNumber.value) return null

  const approvedPurchases = purchasesByStatus.value.APPROVED || []
  const completedPurchases = purchasesByStatus.value.COMPLETED || []
  const eligiblePurchases = [...approvedPurchases, ...completedPurchases]

  return (
    eligiblePurchases.find(purchase =>
      purchase.wallpaperNumbers && purchase.wallpaperNumbers.includes(winnerNumber.value!)
    ) || null
  )
})

// Métodos
const refreshData = async () => {
  try {
    isRefreshingWallpapers.value = true

    // Refrescar compras y wallpapers en paralelo
    await Promise.all([
      getAllPurchases(),
      refreshTakenNumbers()
    ])

  } catch (error) {
    console.error('❌ Error actualizando datos:', error)
  } finally {
    isRefreshingWallpapers.value = false
  }
}

// (Funciones de listado eliminadas; no se usan en esta vista)

const formatWinnerName = (fullName: string) => {
  const nameParts = fullName.trim().split(' ')
  if (nameParts.length === 1) {
    return nameParts[0] // Solo un nombre
  }

  // Primer nombre + apellido censurado
  const firstName = nameParts[0]
  const lastName = nameParts[nameParts.length - 1]
  const censoredLastName = lastName.charAt(0) + '*'.repeat(lastName.length - 1)

  return `${firstName} ${censoredLastName}`
}

const formatWinnerPhone = (phoneNumber: string) => {
  if (!phoneNumber || phoneNumber === 'No proporcionado') {
    return 'No proporcionado'
  }

  // Retornar el número tal como está almacenado en la base de datos
  return phoneNumber
}

const formatDateOnly = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Función para verificar si se puede reenviar email

// Modal functions para ganadores de dinero
const showWinnerModal = (number: number, position: number) => {
  // Si es el quinto número (position 4), no mostrar modal
  if (position === 4) {
    return
  }

  const approvedPurchases = purchasesByStatus.value.APPROVED || []
  const completedPurchases = purchasesByStatus.value.COMPLETED || []
  const eligiblePurchases = [...approvedPurchases, ...completedPurchases]
  const purchase = eligiblePurchases.find(p =>
    p.wallpaperNumbers && p.wallpaperNumbers.includes(number)
  )

  selectedWinner.value = {
    number,
    position,
    purchase: purchase || null
  }

  showModal.value = true

  // Guardar ganador (puestos 1..4) como premio de dinero
  addWinner(position, number, purchase || null, 'money')
}

const closeModal = () => {
  showModal.value = false
}

const getWinMessage = (position: number) => {
  const messages = [
    "¡Increíble! Eres el primer ganador del día. ¡Gracias por participar!",
    "¡Fantástico! El segundo lugar es tuyo. ¡Gracias por participar!.",
    "¡Excelente! Tercer puesto ganador. ¡Gracias por participar!",
    "¡Genial! Cuarto lugar premiado. ¡Gracias por participar!",
    "🏆 ¡EXTRAORDINARIO! ¡Eres el gran ganador de la motocicleta NS200! ¡Felicitaciones! 🏆"
  ]
  return messages[position] || "¡Felicitaciones, ganaste dinero en efectivo!"
}

// Winner game methods
const startWinnerGame = () => {
  if (eligibleNumbers.value.length === 0) return

  // Check if we have enough numbers for a complete game (at least 5 unique numbers recommended)
  if (eligibleNumbers.value.length < 5) {
    // Still allow the game but show a warning in console
    console.warn(`⚠️ Solo hay ${eligibleNumbers.value.length} números elegibles. Se pueden repetir números en los intentos.`)
  }

  isGameStarted.value = true
  isGameRunning.value = true
  currentAttempt.value = 1
  attempts.value = [null, null, null, null, null]
  winnerNumber.value = null
  isGameComplete.value = false
  isShowingSpinEffect.value = false
  spinningNumbers.value = [null, null, null, null, null]

  // Pre-select the winner number (will be revealed on 5th attempt)
  const randomIndex = Math.floor(Math.random() * eligibleNumbers.value.length)
  winnerNumber.value = eligibleNumbers.value[randomIndex]

  // Guardar estado del juego
  saveGameStateToStorage()
}

const nextAttempt = async () => {
  if (currentAttempt.value > 5 || isProcessingAttempt.value) return

  isProcessingAttempt.value = true

  // Get numbers that have already been used in previous attempts
  const usedNumbers = attempts.value.filter(num => num !== null) as number[]

  // Start spinning effect
  isShowingSpinEffect.value = true

  // Spin numbers for dramatic effect
  // - Intentos 1 a 4: 6 segundos
  // - Intento 5 (ganador): 10 segundos
  const spinDuration = currentAttempt.value === 5 ? 10000 : 6000
  const spinInterval = 100
  const spinTimes = spinDuration / spinInterval

  // Mostrar tiempo restante durante la revelación
  showRemainingTime.value = true
  remainingTime.value = Math.ceil(spinDuration / 1000)

  // Update remaining time every second
  const timeInterval = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      clearInterval(timeInterval)
      showRemainingTime.value = false
    }
  }, 1000)

  // Create a pool of available numbers for spinning effect (excluding used ones and winner)
  const availableForSpinning = eligibleNumbers.value.filter(num =>
    num !== winnerNumber.value && !usedNumbers.includes(num)
  )

  for (let i = 0; i < spinTimes; i++) {
    // If we have available unique numbers, use them; otherwise use all eligible except winner
    const spinPool = availableForSpinning.length > 0 ? availableForSpinning :
      eligibleNumbers.value.filter(num => num !== winnerNumber.value)

    if (spinPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * spinPool.length)
      spinningNumbers.value[currentAttempt.value - 1] = spinPool[randomIndex]
    }
    await new Promise(resolve => setTimeout(resolve, spinInterval))
  }

  // Clear the interval just in case
  clearInterval(timeInterval)
  showRemainingTime.value = false

  // Stop spinning effect
  isShowingSpinEffect.value = false

  if (currentAttempt.value === 5) {
    // Cerrar automáticamente el modal del ganador anterior
    showModal.value = false

    // Reveal the winner on 5th attempt
    attempts.value[4] = winnerNumber.value
    isGameComplete.value = true
    isGameRunning.value = false

    // Guardar ganador final (puesto 5)
    addWinner(4, winnerNumber.value, winnerPurchase.value, 'grand')
  } else {
    // Generate a random number from eligible numbers (excluding winner and previously used numbers)
    let randomNumber
    let availableNumbers = eligibleNumbers.value.filter(num =>
      num !== winnerNumber.value && !usedNumbers.includes(num)
    )

    // If we don't have enough unique numbers (excluding the winner),
    // allow previously used numbers but still exclude the winner
    if (availableNumbers.length === 0) {
      availableNumbers = eligibleNumbers.value.filter(num => num !== winnerNumber.value)
    }

    // Select a random number from available numbers
    if (availableNumbers.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length)
      randomNumber = availableNumbers[randomIndex]
    } else {
      // Fallback: use any eligible number except the winner
      do {
        const randomIndex = Math.floor(Math.random() * eligibleNumbers.value.length)
        randomNumber = eligibleNumbers.value[randomIndex]
      } while (randomNumber === winnerNumber.value && eligibleNumbers.value.length > 1)
    }

    attempts.value[currentAttempt.value - 1] = randomNumber

    // Guardar ganadores de dinero
    if (currentAttempt.value < 4) {
      // Para los intentos 1 a 3, abrir modal (esto ya guarda el ganador)
      showWinnerModal(randomNumber, currentAttempt.value - 1)
    } else if (currentAttempt.value === 4) {
      // Para el 4to intento, persistir automáticamente sin abrir modal
      const approvedPurchases = purchasesByStatus.value.APPROVED || []
      const completedPurchases = purchasesByStatus.value.COMPLETED || []
      const eligiblePurchases = [...approvedPurchases, ...completedPurchases]
      const purchase = eligiblePurchases.find(p =>
        p.wallpaperNumbers && p.wallpaperNumbers.includes(randomNumber)
      )
      addWinner(3, randomNumber, purchase || null, 'money')
    }
  }

  // Increment attempt counter after processing
  currentAttempt.value++

  // Guardar estado del juego después de cada intento
  saveGameStateToStorage()

  isProcessingAttempt.value = false
}

const resetGame = () => {
  isGameStarted.value = false
  currentAttempt.value = 1
  attempts.value = [null, null, null, null, null]
  winnerNumber.value = null
  isGameComplete.value = false
  isGameRunning.value = false
  isProcessingAttempt.value = false
  isShowingSpinEffect.value = false
  spinningNumbers.value = [null, null, null, null, null]
  showResetConfirmModal.value = false

  // Limpiar ganadores persistidos al iniciar una nueva dinámica
  clearWinners()

  // Limpiar estado del juego del localStorage
  localStorage.removeItem(GAME_STATE_KEY)
}

// Función para mostrar modal de confirmación
const confirmResetGame = () => {
  showResetConfirmModal.value = true
}

// Función para confirmar el reset
const executeResetGame = () => {
  resetGame()
}

// Función para cancelar el reset
const cancelResetGame = () => {
  showResetConfirmModal.value = false
}

// Función para generar estilos aleatorios para confetis
const getConfettiStyle = (index: number) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e']
  const randomColor = colors[index % colors.length]
  const randomLeft = Math.random() * 100
  const randomDelay = Math.random() * 3
  const randomDuration = 3 + Math.random() * 2

  return {
    backgroundColor: randomColor,
    left: `${randomLeft}%`,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`
  }
}

// Estilos para estallido central de confeti (explota desde el centro)
const getBurstConfettiStyle = (index: number): Record<string, string> => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e']
  const color = colors[index % colors.length]
  // Ángulo y distancia aleatoria
  const angle = Math.random() * Math.PI * 2
  const distance = 200 + Math.random() * 280 // px
  const tx = Math.cos(angle) * distance
  const ty = Math.sin(angle) * distance
  const sizes = [6, 8, 10, 12]
  const size = sizes[Math.floor(Math.random() * sizes.length)]
  const radii = ['0%', '50%', '20%']
  const borderRadius = radii[Math.floor(Math.random() * radii.length)]
  const delay = Math.random() * 0.1
  const duration = 0.9 + Math.random() * 0.5
  const rotateStart = Math.floor(Math.random() * 360)
  const style: Record<string, string> = {
    backgroundColor: color,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius,
    transform: `rotate(${rotateStart}deg)`,
  }
  style['--tx'] = `${tx}px`
  style['--ty'] = `${ty}px`
  style['--dur'] = `${duration}s`
  style['--delay'] = `${delay}s`
  return style
}

// Cargar datos al montar el componente
onMounted(async () => {
  loadWinnersFromStorage()
  loadGameStateFromStorage()
  await refreshData()
})
</script>

<style scoped>
.admin-dashboard {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  min-height: 100vh;
  padding: 6rem 0 2rem 0;
}

/* Deshabilitar interfaz cuando se está enviando email */
.admin-dashboard.sending-email {
  pointer-events: none;
  user-select: none;
}

.admin-dashboard.sending-email * {
  cursor: wait !important;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.dashboard-header p {
  font-size: 1.1rem;
  color: #cbd5e1;
  margin-bottom: 2rem;
}

.refresh-btn {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(96, 165, 250, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message p {
  color: #ef4444;
  margin: 0;
}

.close-error {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state {
  text-align: center;
  padding: 4rem 0;
  color: #cbd5e1;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(96, 165, 250, 0.3);
  border-top: 4px solid #60a5fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Winner Selection Styles */
.winner-selection-section {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  border: 1px solid rgba(96, 165, 250, 0.2);
  position: relative;
}

.winner-header {
  text-align: center;
  margin-bottom: 2rem;
}

.winner-header h3 {
  color: #ffffff;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.winner-header p {
  color: #cbd5e1;
  font-size: 1rem;
}

.winner-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
  gap: 2rem;
}

.eligible-numbers,
.total-revenue {
  text-align: center;
  background: rgba(15, 23, 42, 0.4);
  padding: 1rem;
  border-radius: 12px;
  flex: 1;
}

.stat-label {
  display: block;
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  color: #60a5fa;
  font-size: 1.5rem;
  font-weight: 700;
}

.winner-game-container {
  text-align: center;
}

.game-start {
  padding: 2rem;
}

.start-game-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.start-game-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
}

.start-game-btn:disabled {
  background: #6b7280;
  cursor: not-allowed;
  transform: none;
}

.game-hint {
  color: #94a3b8;
  font-style: italic;
}

.game-rules {
  margin-bottom: 2rem;
}

.game-explanation {
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.game-explanation h4 {
  color: #60a5fa;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.game-explanation p {
  color: #cbd5e1;
  font-size: 1rem;
  margin: 0;
}

.warning-text {
  color: #f59e0b;
  font-weight: 600;
}

.success-text {
  color: #10b981;
  font-weight: 600;
}

.game-active {
  padding: 2rem;
}

.attempts-container h4 {
  color: #ffffff;
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
}

.attempts-display {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.attempt-number {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.attempt-number.clickable {
  cursor: pointer;
}

.attempt-number.clickable:hover .attempt-number-display {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(96, 165, 250, 0.3);
}

.attempt-number-display {
  width: 80px;
  height: 80px;
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid #475569;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.attempt-result {
  font-size: 0.9rem;
  font-weight: 600;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.15);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(34, 197, 94, 0.3);
  white-space: nowrap;
}

.attempt-number.current .attempt-number-display {
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
  animation: pulse 2s infinite;
}

.attempt-number.revealed .attempt-number-display {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.2);
  color: #ffffff;
}

.attempt-number.spinning .attempt-number-display {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.2);
  color: #ffffff;
  animation: spin-effect 0.1s linear infinite;
  transform-origin: center;
}

@keyframes spin-effect {
  0% {
    transform: rotateY(0deg) scale(1);
    background: rgba(245, 158, 11, 0.2);
  }

  25% {
    transform: rotateY(90deg) scale(1.1);
    background: rgba(239, 68, 68, 0.2);
  }

  50% {
    transform: rotateY(180deg) scale(1);
    background: rgba(139, 92, 246, 0.2);
  }

  75% {
    transform: rotateY(270deg) scale(1.1);
    background: rgba(34, 197, 94, 0.2);
  }

  100% {
    transform: rotateY(360deg) scale(1);
    background: rgba(245, 158, 11, 0.2);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.next-attempt-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-attempt-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.next-attempt-btn:disabled {
  background: #6b7280;
  cursor: not-allowed;
}

.reset-controls {
  padding-top: 0;
  display: flex;
  justify-content: center;
}

.winner-reveal {
  margin-top: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 16px;
  border: 2px solid rgba(96, 165, 250, 0.3);
}

.winner-announcement h2 {
  color: #ffffff;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1rem;
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-10px);
  }

  60% {
    transform: translateY(-5px);
  }
}

.winner-number-display {
  font-size: 4rem;
  font-weight: 900;
  color: #ffffff;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 20px;
  padding: 1rem 2rem;
  margin: 1rem 0;
  display: inline-block;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
  }

  to {
    box-shadow: 0 0 30px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.6);
  }
}

.winner-details {
  margin-top: 2rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: left;
}

.winner-title {
  color: #10b981;
}


.winner-details h3 {
  color: #60a5fa;
  margin-bottom: 1rem;
}

.winner-details p {
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.winner-note {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1f2937 !important;
  font-weight: 700 !important;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  margin-top: 1rem !important;
  border: 2px solid #d97706;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.reset-game-btn {
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  /* morado -> azul */
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 2rem;
}

.reset-game-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.32);
}

.filter-section {
  margin-bottom: 3rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-section h3 {
  color: #10b981;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.refresh-btn {
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #047857, #065f46);
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.refresh-btn span {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.status-filters {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.8rem 1.2rem;
  border: 2px solid rgba(96, 165, 250, 0.3);
  background: rgba(51, 65, 85, 0.6);
  color: #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.filter-btn:hover {
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.filter-btn.active {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  border-color: #60a5fa;
  color: white;
}

.filter-btn.pending.active {
  background: linear-gradient(135deg, #f97316, #ea580c);
  border-color: #f97316;
}

.filter-btn.approved.active {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #10b981;
}

.filter-btn.rejected.active {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-color: #ef4444;
}

.filter-btn.cancelled.active {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  border-color: #6b7280;
}

/* Search Box Styles */
.search-box-container {
  margin-bottom: 2rem;
}

.search-box {
  width: 100%;
  padding: 1rem 1.5rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 12px;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-box:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  background: rgba(30, 41, 59, 0.9);
}

.search-box::placeholder {
  color: #94a3b8;
}

.purchases-section h3 {
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
}

.no-purchases {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(96, 165, 250, 0.1);
}

.purchases-table-container {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  overflow-x: auto;
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.purchases-table {
  width: 100%;
  min-width: 1250px;
  border-collapse: collapse;
  table-layout: fixed;
}

.purchases-table th {
  background: rgba(15, 23, 42, 0.8);
  color: #e2e8f0;
  font-weight: 700;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(96, 165, 250, 0.2);
  font-size: 0.9rem;
}

/* Column-specific widths */
.purchases-table th:nth-child(1),
/* ID */
.purchases-table td:nth-child(1) {
  width: 80px;
}

.purchases-table th:nth-child(2),
/* Nombre */
.purchases-table td:nth-child(2) {
  width: 150px;
}

.purchases-table th:nth-child(3),
/* Email */
.purchases-table td:nth-child(3) {
  width: 200px;
  max-width: 200px;
  overflow: hidden;
}

.purchases-table th:nth-child(4),
/* Contacto */
.purchases-table td:nth-child(4) {
  width: 120px;
}

.purchases-table th:nth-child(5),
/* Wallpapers */
.purchases-table td:nth-child(5) {
  width: 200px;
}

.purchases-table th:nth-child(6),
/* Monto */
.purchases-table td:nth-child(6) {
  width: 120px;
}

.purchases-table th:nth-child(7),
/* Estado */
.purchases-table td:nth-child(7) {
  width: 130px;
  padding-right: 1.5rem;
}

.purchases-table th:nth-child(8),
/* Fecha */
.purchases-table td:nth-child(8) {
  width: 140px;
  padding-left: 1.5rem;
}

.purchases-table th:nth-child(9),
/* Acciones */
.purchases-table td:nth-child(9) {
  width: 150px;
}

.purchases-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.1);
  color: #cbd5e1;
  vertical-align: top;
  word-wrap: break-word;
}

.purchase-row:hover {
  background: rgba(96, 165, 250, 0.05);
}

.purchase-id {
  font-weight: 700;
  color: #60a5fa;
}

.buyer-name {
  font-weight: 600;
  color: #ffffff;
  word-wrap: break-word;
  line-height: 1.4;
}

.buyer-email {
  font-size: 0.9rem;
  color: #94a3b8;
  word-wrap: break-word;
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* Email inline editing styles */
.email-display {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.2rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.email-display:hover {
  background-color: rgba(96, 165, 250, 0.1);
}

.email-text {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;
}

.edit-icon {
  opacity: 0;
  transition: opacity 0.2s ease;
  font-size: 0.8rem;
}

.email-display:hover .edit-icon {
  opacity: 1;
}

/* Estilos para email no editable */
.email-readonly {
  cursor: not-allowed !important;
  opacity: 0.7;
}

.email-readonly:hover {
  background-color: rgba(239, 68, 68, 0.05) !important;
}

.lock-icon {
  opacity: 0.6;
  font-size: 0.8rem;
  color: #ef4444;
}

.email-readonly:hover .lock-icon {
  opacity: 1;
}

/* Estilos para email editable */
.email-editable {
  cursor: pointer;
}

.email-edit-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.email-input {
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  color: #ffffff;
  font-size: 0.9rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.email-input:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

.email-actions {
  display: flex;
  gap: 0.3rem;
}

.save-btn,
.cancel-btn {
  padding: 0.2rem 0.4rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.save-btn {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.save-btn:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.3);
}

.cancel-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.cancel-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
}

.save-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.buyer-contact {
  font-size: 0.9rem;
  color: #cbd5e1;
  font-weight: 500;
  word-wrap: break-word;
  line-height: 1.4;
}

.wallpapers {
  max-width: 400px;
}

.wallpaper-numbers {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}

.wallpaper-tag {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.wallpaper-count {
  color: #94a3b8;
  font-size: 0.8rem;
}

.amount {
  font-weight: 700;
  color: #10b981;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.status-badge.approved {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-badge.completed {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-badge.rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-badge.cancelled {
  background: rgba(107, 114, 128, 0.2);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

/* Estado column - no wrap */
.status {
  white-space: nowrap;
}

/* Fecha column - with wrap */
.date {
  font-size: 0.9rem;
  color: #94a3b8;
  word-wrap: break-word;
  line-height: 1.3;
}

/* Actions Column Styles */
.actions {
  text-align: center;
  padding: 0.8rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.resend-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.resend-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.resend-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  background: linear-gradient(135deg, #6b7280, #4b5563) !important;
  color: #9ca3af !important;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .purchases-table-container {
    overflow-x: auto;
  }

  .purchases-table {
    min-width: 1250px;
  }
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 0 1rem;
  }

  .winner-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .attempts-display {
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  .attempt-number .attempt-number-display {
    width: 60px;
    height: 60px;
    font-size: 1.2rem;
  }

  .attempt-result {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
  }

  .winner-number-display {
    font-size: 3rem;
    padding: 0.8rem 1.5rem;
  }

  .winner-selection-section {
    padding: 1.5rem;
  }


  .dashboard-header h1 {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }

  .status-filters {
    flex-direction: column;
  }

  .filter-btn {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .attempts-display {
    gap: 0.5rem;
  }

  .attempt-number {
    width: 50px;
    height: 50px;
    font-size: 1rem;
  }

  .winner-number-display {
    font-size: 2.5rem;
    padding: 0.6rem 1rem;
  }

  .start-game-btn,
  .next-attempt-btn,
  .reset-game-btn {
    width: 100%;
    padding: 1rem;
  }

  .winner-header h3 {
    font-size: 1.5rem;
  }
}

/* Inline Winner Modal Styles */
.inline-winner-modal {
  margin-top: 2rem;
  width: 100%;
  animation: slideDown 0.3s ease-out;
}

.inline-modal-content {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(96, 165, 250, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(96, 165, 250, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  position: relative;
}

/* Reset Confirmation Modal Styles */
.reset-confirmation-modal {
  max-width: 400px;
  text-align: center;
}

.reset-confirmation-modal .modal-header h2 {
  color: #f59e0b;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.reset-confirmation-modal .modal-body p {
  color: #e2e8f0;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.reset-confirmation-modal .warning-text {
  color: #ef4444;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.confirmation-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cancel-btn,
.confirm-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.cancel-btn {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
}

.cancel-btn:hover {
  background: linear-gradient(135deg, #4b5563, #374151);
  transform: translateY(-1px);
}

.confirm-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.modal-header h2 {
  color: #ffffff;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.modal-number-display {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 auto 1rem;
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.4);
  animation: bounce-in 0.6s ease-out;
}

.modal-body {
  text-align: center;
}

.modal-body h3 {
  color: #22c55e;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.win-message {
  color: #cbd5e1;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-style: italic;
}

.modal-winner-details {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(51, 65, 85, 0.5);
}

.modal-winner-details h4 {
  color: #60a5fa;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.modal-winner-details p {
  color: #e2e8f0;
  margin: 0.5rem 0;
  font-size: 1rem;
}

@keyframes bounce-in {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }

  50% {
    transform: scale(1.05);
  }

  70% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .modal-content {
    padding: 1.5rem;
    margin: 1rem;
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }

  .modal-number-display {
    width: 100px;
    height: 100px;
    font-size: 2rem;
  }

  .modal-body h3 {
    font-size: 1.2rem;
  }

  .win-message {
    font-size: 1rem;
  }
}

/* Confetti Animation Styles */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 5;
  border-radius: 16px;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #ff6b6b;
  animation: confetti-fall linear infinite;
  transform-origin: center;
}

.confetti-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: confetti-burst var(--dur) ease-out var(--delay) forwards;
}

@keyframes confetti-burst {
  0% {
    transform: translate(-50%, -50%) translate(0, 0) scale(0.8) rotate(0deg);
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(1) rotate(720deg);
    opacity: 0;
  }
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }

  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Diferentes formas de confeti */
.confetti:nth-child(2n) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.confetti:nth-child(3n) {
  width: 6px;
  height: 12px;
  border-radius: 3px;
}

.confetti:nth-child(4n) {
  width: 12px;
  height: 6px;
  border-radius: 6px;
}

.confetti:nth-child(5n) {
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
}

/* Modal de confirmación para reset */
.reset-confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
}

.reset-modal-content {
  position: relative;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.reset-modal-header h3 {
  color: #f97316;
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  text-align: center;
}

.reset-modal-body {
  color: #cbd5e1;
  line-height: 1.6;
}

.reset-modal-body ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.reset-modal-body li {
  margin: 0.5rem 0;
}

.warning-text {
  color: #ef4444;
  font-weight: 600;
  margin-top: 1rem;
}

.reset-modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
}

.cancel-reset-btn,
.confirm-reset-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-reset-btn {
  background: rgba(71, 85, 105, 0.8);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.cancel-reset-btn:hover {
  background: rgba(71, 85, 105, 1);
}

.confirm-reset-btn {
  background: rgba(239, 68, 68, 0.8);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.confirm-reset-btn:hover {
  background: rgba(239, 68, 68, 1);
}

/* Tiempo restante durante revelación */
.remaining-time-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.remaining-time-content {
  text-align: center;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 1.5rem 2rem;
  border-radius: 12px;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.remaining-time-content h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #60a5fa;
}

.time-display {
  font-size: 3rem;
  font-weight: 700;
  color: #f97316;
  text-shadow: 0 0 15px rgba(249, 115, 22, 0.5);
}

/* Processing overlay */
.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 9997;
  display: flex;
  align-items: center;
  justify-content: center;
}

.processing-content {
  text-align: center;
  color: white;
}

.processing-content h3 {
  margin-top: 1rem;
  font-size: 1.5rem;
  color: #60a5fa;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(96, 165, 250, 0.3);
  border-top: 4px solid #60a5fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
