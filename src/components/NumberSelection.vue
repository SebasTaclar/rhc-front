<template>
  <section id="number-selection" class="number-selection-section">
    <div class="selection-container">
      <!-- Título y descripción -->
      <div class="selection-header">
        <h2>Elige tus Wallpapers</h2>
        <p>Selecciona los números de WallpapersMoto que quieres comprar. Cada wallpaper cuesta $15.000 COP.</p>
      </div>

      <!-- Sección ¿Cómo funciona? -->
      <div class="how-it-works-section">
        <h3 class="how-it-works-title">¿Cómo funciona?</h3>
        <div class="steps-container">
          <div class="step-card">
            <div class="step-icon">�️</div>
            <div class="step-content">
              <h4>1. Elige tus wallpapers</h4>
              <p>Cada número representa un Wallpaper. Selecciona los números de WallpapersMoto que quieres adquirir.</p>
            </div>
          </div>

          <div class="step-card">
            <div class="step-icon">1️⃣</div>
            <div class="step-content">
              <h4>2. Realiza el pago</h4>
              <p>Paga de forma segura con Wompi.</p>
            </div>
          </div>

          <div class="step-card">
            <div class="step-icon">📱</div>
            <div class="step-content">
              <h4>3. Descarga inmediata</h4>
              <p>Recibe tus wallpapers en alta calidad.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="selection-content">
        <!-- Panel de números -->
        <div class="numbers-panel">
          <!-- Texto informativo sobre selección de números -->
          <div class="number-info-block">
            <h3 class="number-info-title">Elige tus números como prefieras:</h3>
            <ul class="number-info-list">
              <li>“¡Déjalo a la suerte! Usa la opción aleatoria y el sistema escogerá por ti en segundos.”</li>
              <li>“Búscalos rápidamente: ingresa el número que quieres y el sistema te dirá si está disponible.”</li>
              <li>“Toma el control: selecciona manualmente los números que más te gusten.”</li>
            </ul>
          </div>

          <!-- Botones de control -->
          <div class="control-buttons">
            <button class="control-btn random-btn" @click="selectRandomNumbers(3)">
              Aleatorio x3
            </button>
            <button class="control-btn random-btn" @click="selectRandomNumbers(5)">
              Aleatorio x5
            </button>
            <button class="control-btn random-btn" @click="selectRandomNumbers(10)">
              Aleatorio x10
            </button>
            <button class="control-btn clear-btn" @click="clearSelection">
              Limpiar
            </button>
          </div>

          <!-- Buscador de número específico -->
          <div class="number-search">
            <div class="search-input-container">
              <input v-model="searchNumber" type="number" min="1" max="5000" placeholder="Buscar wallpaper (ej: 1234)"
                class="search-input" @keyup.enter="goToNumber" />
              <button class="search-btn" @click="goToNumber" :disabled="!searchNumber">
                🔍 Buscar
              </button>
            </div>
          </div>

          <!-- Lista de números en cuadrícula -->
          <div class="numbers-list-container">
            <div class="numbers-grid">
              <div v-for="number in displayNumbers" :key="number" class="number-item">
                <button @click="toggleNumber(number)"
                  :disabled="takenNumbers.includes(number) || isNumberReserved(number)" :class="[
                    'number-btn',
                    {
                      'btn-selected': selectedNumbers.includes(number),
                      'btn-taken': takenNumbers.includes(number),
                      'btn-reserved': isNumberReserved(number),
                      'btn-searched': number === searchedNumber
                    }
                  ]" :data-number="number">
                  {{ number.toString().padStart(4, '0') }}
                </button>
              </div>
            </div>
          </div> <!-- Paginación -->
          <div class="pagination-controls">
            <button class="pagination-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
              ‹ Anterior
            </button>

            <div class="page-info">
              <span>Página {{ currentPage }} de {{ totalPages }}</span>
              <span class="numbers-range">Números {{ firstNumberInPage }} - {{ lastNumberInPage }}</span>

              <!-- Selector de página -->
              <div class="page-selector">
                <label for="page-select">Ir a página:</label>
                <select id="page-select" v-model="currentPage" @change="goToPage(currentPage)" class="page-select">
                  <option v-for="page in totalPages" :key="page" :value="page">
                    {{ page }}
                  </option>
                </select>
              </div>
            </div>

            <button class="pagination-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
              Siguiente ›
            </button>
          </div>

          <!-- Controles de limpieza -->
          <div class="clean-controls">
            <button class="control-btn clear-all-btn" @click="clearAllNumbers">
              🧹 Limpiar selección
            </button>
          </div>
        </div>

        <!-- Panel lateral -->
        <div class="sidebar-panel">
          <!-- Tu selección -->
          <div class="selection-summary">
            <h3>Tu selección</h3>
            <span class="selection-count">{{ selectedNumbers.length }} seleccionados</span>

            <div class="selected-numbers">
              <span v-for="number in selectedNumbers" :key="number" class="selected-number-tag">
                #{{ number.toString().padStart(2, '0') }}
                <button @click="removeNumber(number)" class="remove-btn">×</button>
              </span>
            </div>
          </div>

          <!-- Total a pagar -->
          <div class="payment-summary">
            <h3>Total a pagar</h3>
            <div class="total-amount">${{ (selectedNumbers.length * 15000).toLocaleString() }} COP</div>
          </div>

          <!-- Formulario de datos del comprador -->
          <div class="user-form">
            <h4>Datos del comprador</h4>
            <input v-model="userForm.name" type="text" placeholder="Nombre completo *" class="form-input" required />
            <input v-model="userForm.email" type="email" placeholder="Email *" class="form-input" required />
            <input v-model="userForm.contactNumber" type="tel" placeholder="Número de contacto *" class="form-input"
              required />
            <input v-model="userForm.identificationNumber" type="text" placeholder="Número de identificación *"
              class="form-input" required />
            <p class="required-note">* Campos obligatorios</p>
          </div>

          <!-- Botones de pago -->
          <div class="payment-buttons">
            <!-- BOTÓN MERCADOPAGO TEMPORALMENTE OCULTO - PARA EMERGENCIAS REMOVER STYLE="display: none" -->
            <button class="payment-btn mercadopago-payment" style="display: none"
              :disabled="!isFormValid || selectedNumbers.length === 0 || isProcessingPayment" @click="showTermsModal">
              <span v-if="!isProcessingPayment">💳 Pagar con MercadoPago</span>
              <span v-else class="processing-text">
                <div class="processing-spinner"></div>
                Validando disponibilidad...
              </span>
            </button>

            <button class="payment-btn wompi-payment"
              :disabled="!isFormValid || selectedNumbers.length === 0 || isProcessingPayment"
              @click="showTermsModalWompi">
              <span v-if="!isProcessingPayment">🏦 Pagar con Wompi</span>
              <span v-else class="processing-text">
                <div class="processing-spinner"></div>
                Procesando con Wompi...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Términos y Condiciones -->
    <TermsAndConditionsModal v-if="showTermsAndConditions" @close="handleTermsClose" @accept="handleTermsAccept" />

    <!-- Notificación de números no disponibles -->
    <div v-if="unavailableNotification.show" class="unavailable-notification">
      <div class="notification-content">
        <div class="notification-icon">⚠️</div>
        <div class="notification-text">
          <h4>Wallpapers no disponibles</h4>
          <p>{{ unavailableNotification.message }}</p>
        </div>
        <button @click="unavailableNotification.show = false" class="notification-close">✕</button>
      </div>
    </div>

    <!-- Overlay de carga -->
    <div v-if="isProcessingPayment" class="payment-loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h3>Procesando pago...</h3>
        <p>Abriendo widget de pago seguro</p>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePayments } from '@/composables/usePayments'
import { useNumbersAvailability } from '@/composables/useNumbersAvailability'
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal.vue'

// Form refs
const userForm = ref({
  name: '',
  email: '',
  contactNumber: '',
  identificationType: 'CC',
  identificationNumber: ''
})

// Usar el composable de disponibilidad de números
const {
  takenNumbers,
  isNumberReserved,
  getAvailableNumbersArraySync,
  clearAll,
  refreshTakenNumbers
} = useNumbersAvailability()

// Estado de números seleccionados localmente
const selectedNumbers = ref<number[]>([])

// Estado de paginación
const currentPage = ref<number>(1)
const totalNumbers = 5000

// Computed para números por página responsivo
const responsiveNumbersPerPage = computed(() => {
  // En móvil mostrar 50 números (5x10) hasta 640px, en desktop/tablet 100 (10x10)
  if (window.innerWidth <= 640) return 50 // 5 columnas x 10 filas
  return 50 // 10 columnas x 10 filas para pantallas mayores a 640px
})

// Estado de búsqueda
const searchNumber = ref<string>('')
const searchedNumber = ref<number | null>(null)

// Estado de reserva actual
const reservationExpiry = ref<number>(0)

// Estado de carga para el pago
const isProcessingPayment = ref<boolean>(false)

// Estado del modal de términos y condiciones
const showTermsAndConditions = ref<boolean>(false)

// Estado para rastrear el método de pago seleccionado
const selectedPaymentMethod = ref<'mercadopago' | 'wompi'>('mercadopago')

// Estado para mostrar notificaciones de números no disponibles
const unavailableNotification = ref<{
  show: boolean
  numbers: number[]
  message: string
}>({
  show: false,
  numbers: [],
  message: ''
})

// Función para validar números seleccionados en tiempo real
const validateSelectedNumbers = async () => {
  if (selectedNumbers.value.length === 0) return

  try {
    // Refrescar datos desde la API
    await refreshTakenNumbers()

    // Verificar números seleccionados
    const nowUnavailable = selectedNumbers.value.filter(number =>
      takenNumbers.value.includes(number) || isNumberReserved(number)
    )

    if (nowUnavailable.length > 0) {
      // Remover números no disponibles automáticamente
      selectedNumbers.value = selectedNumbers.value.filter(
        number => !nowUnavailable.includes(number)
      )

      // Mostrar notificación
      unavailableNotification.value = {
        show: true,
        numbers: nowUnavailable,
        message: `Wallpapers ${nowUnavailable.map(n => `#${n.toString().padStart(4, '0')}`).join(', ')} ya no están disponibles y fueron removidos de tu selección.`
      }

      // Ocultar notificación después de 5 segundos
      setTimeout(() => {
        unavailableNotification.value.show = false
      }, 5000)
    }
  } catch (error) {
    console.error('Error validating selected numbers:', error)
  }
}

// Refrescar datos al cargar el componente
onMounted(async () => {
  await refreshTakenNumbers()

  // Validar números seleccionados cada 30 segundos
  setInterval(validateSelectedNumbers, 30000)
})

// Función para alternar selección de número
const toggleNumber = async (number: number) => {
  // Verificar que el número no esté tomado o reservado
  if (takenNumbers.value.includes(number) || isNumberReserved(number)) {
    return
  }

  const index = selectedNumbers.value.indexOf(number)
  if (index > -1) {
    // Remover número
    selectedNumbers.value.splice(index, 1)
  } else {
    // Antes de agregar, verificar disponibilidad en tiempo real
    try {
      // Refrescar datos para este número específico
      await refreshTakenNumbers()

      // Verificar nuevamente si está disponible
      if (takenNumbers.value.includes(number) || isNumberReserved(number)) {
        // Mostrar notificación rápida
        unavailableNotification.value = {
          show: true,
          numbers: [number],
          message: `El wallpaper #${number.toString().padStart(4, '0')} ya no está disponible.`
        }

        setTimeout(() => {
          unavailableNotification.value.show = false
        }, 3000)

        return
      }

      // Si está disponible, agregarlo
      selectedNumbers.value.push(number)
    } catch (error) {
      console.error('Error verificando disponibilidad:', error)
      // En caso de error, permitir la selección pero mostrar advertencia
      selectedNumbers.value.push(number)
    }
  }
}

// Función para remover número específico
const removeNumber = (number: number) => {
  const index = selectedNumbers.value.indexOf(number)
  if (index > -1) {
    selectedNumbers.value.splice(index, 1)
  }
}

// Función para seleccionar números aleatorios
const selectRandomNumbers = (count: number = 3) => {
  // Usar el composable para obtener números disponibles (versión síncrona)
  const availableNumbers = getAvailableNumbersArraySync()

  // Seleccionar la cantidad especificada de números aleatorios
  const maxSelectable = Math.min(count, availableNumbers.length)
  for (let i = 0; i < maxSelectable; i++) {
    const randomIndex = Math.floor(Math.random() * availableNumbers.length)
    const randomNumber = availableNumbers[randomIndex]

    if (!selectedNumbers.value.includes(randomNumber)) {
      selectedNumbers.value.push(randomNumber)
    }

    availableNumbers.splice(randomIndex, 1)
  }
}

// Funciones de paginación
const totalPages = computed(() => Math.ceil(totalNumbers / responsiveNumbersPerPage.value))

const currentPageNumbers = computed(() => {
  const startNumber = (currentPage.value - 1) * responsiveNumbersPerPage.value + 1
  const endNumber = Math.min(currentPage.value * responsiveNumbersPerPage.value, totalNumbers)
  const numbers = []
  for (let i = startNumber; i <= endNumber; i++) {
    numbers.push(i)
  }
  return numbers
})

// Computed que muestra números con el buscado al principio
const displayNumbers = computed(() => {
  let numbers = [...currentPageNumbers.value]

  // Si hay un número buscado, ponerlo al principio
  if (searchedNumber.value) {
    numbers = numbers.filter(n => n !== searchedNumber.value)
    numbers.unshift(searchedNumber.value)

    // Mantener solo los primeros responsiveNumbersPerPage números
    numbers = numbers.slice(0, responsiveNumbersPerPage.value)
  }

  return numbers
})

const firstNumberInPage = computed(() => (currentPage.value - 1) * responsiveNumbersPerPage.value + 1)
const lastNumberInPage = computed(() => Math.min(currentPage.value * responsiveNumbersPerPage.value, totalNumbers))

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Función para buscar un número específico
const goToNumber = () => {
  const number = parseInt(searchNumber.value)
  if (number >= 1 && number <= totalNumbers) {
    // Calcular en qué página está el número
    const targetPage = Math.ceil(number / responsiveNumbersPerPage.value)
    currentPage.value = targetPage

    // Establecer el número buscado para mostrarlo al principio
    searchedNumber.value = number

    // Seleccionar el número automáticamente si no está tomado o reservado
    if (!takenNumbers.value.includes(number) && !isNumberReserved(number)) {
      if (!selectedNumbers.value.includes(number)) {
        selectedNumbers.value.push(number)
      }
    }

    // Limpiar el campo de búsqueda
    searchNumber.value = ''

    // Limpiar el número buscado después de 1 segundo (reducido de 3)
    setTimeout(() => {
      searchedNumber.value = null
    }, 400)
  } else {
    alert('Número no válido. Ingresa un número entre 1 y 5000.')
  }
}

// Función para limpiar selección
const clearSelection = () => {
  selectedNumbers.value = []
}

// Función para limpiar todo
const clearAllNumbers = () => {
  clearAll()
  selectedNumbers.value = []
  reservationExpiry.value = 0
}

// Computed properties
const totalAmount = computed(() => {
  return selectedNumbers.value.length * 15000 // $1,500 COP por wallpaper (precio de prueba)
})

const isFormValid = computed(() => {
  return userForm.value.name.trim() !== '' &&
    userForm.value.email.trim() !== '' &&
    userForm.value.contactNumber.trim() !== '' &&
    userForm.value.identificationNumber.trim() !== ''
})

// Payment methods
const payWithMercadoPago = async () => {
  if (selectedNumbers.value.length > 0 && isFormValid.value) {
    try {
      // Activar loading
      isProcessingPayment.value = true

      // VALIDACIÓN CRÍTICA: Verificar que todos los números seleccionados aún estén disponibles
      console.log('🔍 Validando disponibilidad de números antes del pago...')

      // Refrescar los datos desde la API para obtener el estado más actualizado
      await refreshTakenNumbers()

      // Verificar cada número seleccionado
      const unavailableNumbers: number[] = []

      for (const number of selectedNumbers.value) {
        // Verificar si el número está tomado (pagado por otro usuario)
        if (takenNumbers.value.includes(number)) {
          unavailableNumbers.push(number)
        }
        // Verificar si el número está reservado por otro usuario
        if (isNumberReserved(number)) {
          unavailableNumbers.push(number)
        }
      }

      // Si hay números no disponibles, mostrar error y removerlos de la selección
      if (unavailableNumbers.length > 0) {
        // Remover números no disponibles de la selección
        selectedNumbers.value = selectedNumbers.value.filter(
          number => !unavailableNumbers.includes(number)
        )

        // Mostrar mensaje de error específico
        const numbersList = unavailableNumbers
          .map(n => `#${n.toString().padStart(4, '0')}`)
          .join(', ')

        alert(
          `⚠️ Los siguientes wallpapers ya no están disponibles: ${numbersList}\n\n` +
          `Han sido removidos de tu selección. Por favor, selecciona otros wallpapers.`
        )

        // Desactivar loading y salir
        isProcessingPayment.value = false
        return
      }

      // Si no quedan números seleccionados después de la validación
      if (selectedNumbers.value.length === 0) {
        alert('Todos los wallpapers seleccionados ya no están disponibles. Por favor, selecciona otros.')
        isProcessingPayment.value = false
        return
      }

      console.log('✅ Todos los números están disponibles, procesando pago...')

      const { createPayment } = usePayments()

      // Enviar todos los números seleccionados como array
      const paymentData = {
        wallpaperNumbers: selectedNumbers.value,
        buyerEmail: userForm.value.email,
        buyerName: userForm.value.name,
        buyerContactNumber: userForm.value.contactNumber,
        buyerIdentificationNumber: userForm.value.identificationNumber,
        amount: totalAmount.value
      }

      const response = await createPayment(paymentData)

      if (response?.payment?.paymentUrl) {
        // Redirect to MercadoPago
        window.open(response.payment.paymentUrl, '_blank')

        // Clear selection after successful initiation
        selectedNumbers.value = []
        userForm.value = {
          name: '',
          email: '',
          contactNumber: '',
          identificationType: 'CC',
          identificationNumber: ''
        }
      }
    } catch (error) {
      console.error('Error creating payment:', error)

      // Verificar si el error es debido a números no disponibles
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      if (errorMessage.toLowerCase().includes('not available') ||
        errorMessage.toLowerCase().includes('no disponible') ||
        errorMessage.toLowerCase().includes('already taken')) {
        alert('❌ Algunos wallpapers seleccionados ya no están disponibles. La página se actualizará con los números correctos.')
        // Refrescar la página para mostrar el estado actualizado
        window.location.reload()
      } else {
        alert('❌ Error al procesar el pago. Intenta nuevamente.')
      }
    } finally {
      // Desactivar loading después de 2 segundos para dar tiempo al redirect
      setTimeout(() => {
        isProcessingPayment.value = false
      }, 2000)
    }
  } else if (selectedNumbers.value.length === 0) {
    alert('Selecciona al menos un wallpaper para pagar')
  } else {
    alert('Completa todos los campos requeridos')
  }
}

// Payment with Wompi
const payWithWompi = async () => {
  if (selectedNumbers.value.length > 0 && isFormValid.value) {
    try {
      // Activar loading
      isProcessingPayment.value = true

      // VALIDACIÓN CRÍTICA: Verificar que todos los números seleccionados aún estén disponibles
      console.log('🔍 Validando disponibilidad de números antes del pago con Wompi...')

      // Refrescar los datos desde la API para obtener el estado más actualizado
      await refreshTakenNumbers()

      // Verificar cada número seleccionado
      const unavailableNumbers: number[] = []

      for (const number of selectedNumbers.value) {
        // Verificar si el número está tomado (pagado por otro usuario)
        if (takenNumbers.value.includes(number)) {
          unavailableNumbers.push(number)
        }
        // Verificar si el número está reservado por otro usuario
        if (isNumberReserved(number)) {
          unavailableNumbers.push(number)
        }
      }

      // Si hay números no disponibles, mostrar error y removerlos de la selección
      if (unavailableNumbers.length > 0) {
        // Remover números no disponibles de la selección
        selectedNumbers.value = selectedNumbers.value.filter(
          number => !unavailableNumbers.includes(number)
        )

        // Mostrar mensaje de error específico
        const numbersList = unavailableNumbers
          .map(n => `#${n.toString().padStart(4, '0')}`)
          .join(', ')

        alert(
          `⚠️ Los siguientes wallpapers ya no están disponibles: ${numbersList}\n\n` +
          `Han sido removidos de tu selección. Por favor, selecciona otros wallpapers.`
        )

        // Desactivar loading y salir
        isProcessingPayment.value = false
        return
      }

      // Si no quedan números seleccionados después de la validación
      if (selectedNumbers.value.length === 0) {
        alert('Todos los wallpapers seleccionados ya no están disponibles. Por favor, selecciona otros.')
        isProcessingPayment.value = false
        return
      }

      console.log('✅ Todos los números están disponibles, procesando pago con Wompi...')

      const { createWompiPayment } = usePayments()

      // Enviar todos los números seleccionados como array
      const paymentData = {
        wallpaperNumbers: selectedNumbers.value,
        buyerEmail: userForm.value.email,
        buyerName: userForm.value.name,
        buyerContactNumber: userForm.value.contactNumber,
        buyerIdentificationNumber: userForm.value.identificationNumber,
        amount: totalAmount.value
      }

      const response = await createWompiPayment(paymentData)

      console.log('🔍 Respuesta completa del backend:', response)

      if (response?.payment?.checkoutUrl) {
        // Redirigir al Web Checkout de Wompi
        console.log('🚀 Redirigiendo a Wompi Web Checkout:', response.payment.checkoutUrl)
        window.open(response.payment.checkoutUrl, '_blank')

        // Limpiar selección después de iniciar el pago
        selectedNumbers.value = []
        userForm.value = {
          name: '',
          email: '',
          contactNumber: '',
          identificationType: 'CC',
          identificationNumber: ''
        }
      } else {
        console.error('❌ No se recibió checkoutUrl del backend')
        alert('❌ Error: No se pudo generar la URL de pago. Intenta nuevamente.')
      }
    } catch (error) {
      console.error('Error creating Wompi payment:', error)

      // Verificar si el error es debido a números no disponibles
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      if (errorMessage.toLowerCase().includes('not available') ||
        errorMessage.toLowerCase().includes('no disponible') ||
        errorMessage.toLowerCase().includes('already taken')) {
        alert('❌ Algunos wallpapers seleccionados ya no están disponibles. La página se actualizará con los números correctos.')
        // Refrescar la página para mostrar el estado actualizado
        window.location.reload()
      } else {
        alert('❌ Error al procesar el pago con Wompi. Intenta nuevamente.')
      }
    } finally {
      // Desactivar loading después de 2 segundos para dar tiempo al redirect
      setTimeout(() => {
        isProcessingPayment.value = false
      }, 2000)
    }
  } else if (selectedNumbers.value.length === 0) {
    alert('Selecciona al menos un wallpaper para pagar')
  } else {
    alert('Completa todos los campos requeridos')
  }
}

// Métodos para manejar el modal de términos y condiciones
const showTermsModal = () => {
  if (selectedNumbers.value.length === 0) {
    alert('Selecciona al menos un wallpaper para pagar')
    return
  }

  if (!isFormValid.value) {
    alert('Completa todos los campos requeridos')
    return
  }

  selectedPaymentMethod.value = 'mercadopago'
  showTermsAndConditions.value = true
}

const showTermsModalWompi = () => {
  if (selectedNumbers.value.length === 0) {
    alert('Selecciona al menos un wallpaper para pagar')
    return
  }

  if (!isFormValid.value) {
    alert('Completa todos los campos requeridos')
    return
  }

  selectedPaymentMethod.value = 'wompi'
  showTermsAndConditions.value = true
}

const handleTermsClose = () => {
  showTermsAndConditions.value = false
}

const handleTermsAccept = () => {
  showTermsAndConditions.value = false
  if (selectedPaymentMethod.value === 'wompi') {
    payWithWompi()
  } else {
    payWithMercadoPago()
  }
}

// Nota: la aceptación para Wompi se maneja con handleTermsAccept
</script>

<style scoped>
.number-selection-section {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  min-height: 100vh;
  padding: 4rem 0;
  position: relative;
  overflow-x: hidden;
  width: 100%;
}

.selection-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.selection-header {
  text-align: center;
  margin-bottom: 3rem;
}

.selection-header h2 {
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 1rem;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.selection-header p {
  font-size: 1.1rem;
  color: #cbd5e1;
  max-width: 600px;
  margin: 0 auto;
}

/* Sección ¿Cómo funciona? */
.how-it-works-section {
  margin-bottom: 3rem;
  text-align: center;
}

.how-it-works-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 2rem;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.step-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(96, 165, 250, 0.2);
  transition: all 0.3s ease;
  text-align: center;
}

.step-card:hover {
  transform: translateY(-5px);
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 10px 30px rgba(96, 165, 250, 0.2);
}

.step-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  box-shadow: 0 4px 15px rgba(96, 165, 250, 0.3);
  font-size: 1.8rem;
  line-height: 1;
}

.step-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.step-content h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.8rem;
}

.step-content p {
  font-size: 0.95rem;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0;
}

.selection-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 3rem;
  align-items: start;
}

/* Panel de números */
.numbers-panel {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.control-buttons {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.control-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.random-btn {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
}

.random-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(96, 165, 250, 0.4);
}

.clear-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}


/* Lista de números horizontal */
.numbers-list-container {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(71, 85, 105, 0.4);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  padding: 1.5rem 1.2rem;
}

.numbers-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.5rem;
  justify-content: center;
  align-items: stretch;
}

.numbers-horizontal-row {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.5rem;
  justify-content: center;
  align-items: stretch;
}

.number-item {
  flex: 0 0 auto;
  display: flex;
  align-items: stretch;
}

.number-btn {
  width: 70px;
  height: 70px;
  padding: 0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  border: 2px solid #4b6cae;
  background: rgba(51, 65, 85, 0.9);
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.number-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border-color: #4b6cae;
  background: rgba(71, 85, 105, 0.9);
}

/* ...resto de estilos sin cambios... */

/* Estilos para scroll horizontal */
.numbers-grid::-webkit-scrollbar,
.numbers-horizontal-row::-webkit-scrollbar {
  height: 4px;
  width: 4px;
}

.numbers-grid::-webkit-scrollbar-track,
.numbers-horizontal-row::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.2);
  border-radius: 2px;
}

.numbers-grid::-webkit-scrollbar-thumb,
.numbers-horizontal-row::-webkit-scrollbar-thumb {
  background: rgba(96, 165, 250, 0.3);
  border-radius: 2px;
}

.numbers-grid::-webkit-scrollbar-thumb:hover,
.numbers-horizontal-row::-webkit-scrollbar-thumb:hover {
  background: rgba(96, 165, 250, 0.5);
}

.number-item {
  flex: 0 0 auto;
  display: flex;
  align-items: stretch;
}

.number-btn {
  width: 70px;
  height: 70px;
  padding: 0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  border: 2px solid #4b6cae;
  background: rgba(51, 65, 85, 0.9);
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.number-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border-color: #4b6cae;
  background: rgba(71, 85, 105, 0.9);
}

.number-btn.btn-selected {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  color: white !important;
  border-color: #10b981 !important;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4) !important;
  transition: all 0.1s ease !important;
}

.number-btn.btn-taken {
  background: linear-gradient(135deg, #ef4444b0, #d12e2edc);
  color: white;
  border-color: #ef4444b4;
  opacity: 0.7;
  cursor: not-allowed;
}

.number-btn.btn-reserved {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
  border-color: #f59e0b;
  opacity: 0.85;
  cursor: not-allowed;
  animation: reservedPulse 2s infinite;
}

.number-btn.btn-searched {
  background: linear-gradient(135deg, #ffc107, #ff8f00) !important;
  color: white !important;
  border-color: #ffc107 !important;
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.7) !important;
  transform: scale(1.05) !important;
  animation: searchPulse 0.4s ease-in-out;
}

.number-btn:disabled {
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

@keyframes searchPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(255, 193, 7, 0.7);
  }

  50% {
    transform: scale(1.08);
    box-shadow: 0 0 18px rgba(255, 193, 7, 0.9);
  }

  100% {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(255, 193, 7, 0.7);
  }
}

@keyframes reservedPulse {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 0.9;
  }
}

@media (max-width: 1024px) {
  .numbers-horizontal-row {
    gap: 0.8rem;
  }

  .number-btn {
    padding: 0.8rem 1.2rem;
    font-size: 1.1rem;
    min-width: 100px;
  }
}

@media (max-width: 768px) {
  .selection-container {
    padding: 0 1rem;
  }

  .selection-header h2 {
    font-size: 2.2rem;
    margin-bottom: 0.8rem;
  }

  .selection-header p {
    font-size: 1rem;
    padding: 0 1rem;
  }

  .selection-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .numbers-panel {
    padding: 1.5rem;
  }

  .control-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }

  .control-buttons .clear-btn {
    grid-column: 1 / -1;
  }

  .number-info-block {
    padding: 0 !important;
    margin-bottom: 1.5rem;
  }

  .number-info-title {
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
  }

  .number-info-list {
    font-size: 0.9rem;
  }

  .number-info-list li {
    padding-left: 1.8rem;
    margin-bottom: 0.6rem;
  }

  .numbers-list-container {
    padding: 1rem 0.5rem;
    margin: 0;
    overflow: hidden;
  }

  .numbers-grid,
  .numbers-horizontal-row {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 0.4rem;
    justify-content: center;
  }

  .number-btn {
    width: 15px;
    height: 15px;
    border-radius: 10px;
    aspect-ratio: 1;
    border: 2px solid #4b6cae;
    min-height: 45px;
  }

  .search-input-container {
    flex-direction: column;
    max-width: 100%;
    gap: 0.6rem;
  }

  .search-btn {
    width: 100%;
    padding: 0.9rem;
  }

  .sidebar-panel {
    padding: 1.5rem;
    position: static;
  }

  .selected-numbers {
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    gap: 0.4rem;
  }

  .selected-number-tag {
    padding: 0.3rem 0.6rem;
    font-size: 0.85rem;
  }

  .pagination-controls {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .pagination-btn {
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }

  .page-selector {
    flex-direction: column;
    gap: 0.3rem;
  }

  .how-it-works-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }

  .steps-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 1rem;
  }

  .step-card {
    padding: 1.5rem;
  }

  .step-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  .selection-container {
    padding: 0 1rem;
    max-width: 100%;
    overflow-x: hidden;
  }

  .selection-header h2 {
    font-size: 1.8rem;
    margin-bottom: 0.6rem;
  }

  .selection-header p {
    font-size: 0.9rem;
    padding: 0 0.5rem;
  }

  .numbers-panel {
    padding: 1rem 0.5rem;
    max-width: 100%;
    overflow: hidden;
  }

  .control-buttons {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .control-btn {
    padding: 0.7rem 1rem;
    font-size: 0.85rem;
  }

  .number-info-block {
    padding: 0 !important;
    margin-bottom: 1rem;
  }

  .number-info-title {
    font-size: 1rem;
    margin-bottom: 0.6rem;
  }

  .number-info-title::before {
    font-size: 1.2rem;
  }

  .number-info-list {
    font-size: 0.85rem;
  }

  .number-info-list li {
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
    line-height: 1.0;
  }

  .number-info-list li::before {
    font-size: 1rem;
  }

  .numbers-list-container {
    padding: 0.8rem 0.5rem;
    margin: 0;
    overflow: hidden;
    border-radius: 12px;
  }

  .numbers-grid,
  .numbers-horizontal-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.3rem;
    justify-content: center;
    max-width: 95vw;
    margin: 0 auto;
  }

  .number-btn {
    width: 15px;
    height: 15px;
    border: 2px solid #4b6cae;
    aspect-ratio: 1;
    min-height: 58px;
    min-width: 58px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }

  .search-input {
    padding: 0.8rem;
    font-size: 0.9rem;
  }

  .search-btn {
    padding: 0.8rem;
    font-size: 0.9rem;
  }

  .sidebar-panel {
    padding: 1rem;
  }

  .selection-summary h3,
  .payment-summary h3 {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }

  .selected-numbers {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
    gap: 0.3rem;
    max-height: 150px;
  }

  .selected-number-tag {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }

  .form-input {
    padding: 0.7rem;
    font-size: 0.9rem;
    margin-bottom: 0.8rem;
  }

  .payment-btn {
    padding: 0.7rem;
    font-size: 0.9rem;
  }

  .pagination-btn {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }

  .how-it-works-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .steps-container {
    padding: 0 0.5rem;
    gap: 1rem;
  }

  .step-card {
    padding: 1.2rem 1rem;
  }

  .step-icon {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }

  .step-content h4 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .step-content p {
    font-size: 0.85rem;
    line-height: 1.4;
  }
}

.status-col {
  text-align: center;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-indicator.selected {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-indicator.taken {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-indicator.reserved {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.status-indicator.available {
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.status-icon {
  font-size: 0.9rem;
  font-weight: 700;
}

.status-text {
  font-size: 0.8rem;
  letter-spacing: 0.3px;
}

.action-col {
  text-align: center;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  min-width: 70px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-select {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
  box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
}

.btn-select:hover {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.4);
}

.btn-remove {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-remove:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-disabled {
  background: rgba(51, 65, 85, 0.5);
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-disabled:hover {
  transform: none;
  box-shadow: none;
}

.reservation-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: #ffffff;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 10;
  margin-top: 0.5rem;
  pointer-events: none;
}

.number-list-row.reserved:hover .reservation-tooltip {
  opacity: 1;
  visibility: visible;
}

.reservation-tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-bottom-color: rgba(0, 0, 0, 0.9);
}

@keyframes reservedPulse {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 0.9;
  }
}

@keyframes highlightFound {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
  }

  20% {
    transform: scale(1.2);
    box-shadow: 0 8px 30px rgba(255, 193, 7, 0.8);
    border-color: #ffc107;
    background: linear-gradient(135deg, #ffc107, #ff8f00);
  }

  50% {
    transform: scale(1.25);
    box-shadow: 0 12px 40px rgba(255, 193, 7, 1);
    border-color: #ffc107;
    background: linear-gradient(135deg, #ffc107, #ff8f00);
  }

  80% {
    transform: scale(1.1);
    box-shadow: 0 8px 30px rgba(255, 193, 7, 0.6);
    border-color: #ffc107;
    background: linear-gradient(135deg, #ffc107, #ff8f00);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
  }
}

/* Buscador de números */
.number-search {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.2);
}

.search-input-container {
  display: flex;
  gap: 0.8rem;
  max-width: 400px;
  margin: 0;
}

.search-input {
  flex: 1;
  padding: 0.8rem 1rem;
  background: rgba(51, 65, 85, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #60a5fa;
  background: rgba(51, 65, 85, 0.8);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  white-space: nowrap;
}

.search-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(51, 65, 85, 0.6);
}

/* Controles de paginación */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(96, 165, 250, 0.2);
}

.pagination-btn {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.pagination-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(96, 165, 250, 0.4);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(51, 65, 85, 0.6);
}

.page-info {
  text-align: center;
  color: #e2e8f0;
}

.page-info span {
  display: block;
  margin-bottom: 0.3rem;
}

.numbers-range {
  font-size: 0.8rem;
  color: #94a3b8;
}

.page-selector {
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.page-selector label {
  font-size: 0.85rem;
  color: #cbd5e1;
  font-weight: 600;
}

.page-select {
  background: rgba(51, 65, 85, 0.8);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 6px;
  color: #e2e8f0;
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  max-height: 200px;
  overflow-y: auto;
}

.page-select:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.1);
}

.page-select option {
  background: #334155;
  color: #e2e8f0;
  padding: 0.4rem;
}

/* Controles de limpieza */
.clean-controls {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(96, 165, 250, 0.1);
}

/* Controles de reserva */
.clear-all-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.clear-all-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

/* Panel lateral */
.sidebar-panel {
  background: rgba(30, 41, 59, 0.9);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(96, 165, 250, 0.2);
  position: sticky;
  top: 2rem;
}

.selection-summary h3,
.payment-summary h3 {
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.selection-count {
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.selected-numbers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 4px;
}

.selected-number-tag {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
}

.remove-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.remove-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.total-amount {
  font-size: 2rem;
  font-weight: 800;
  color: #10b981;
  margin-bottom: 0.5rem;
}

.payment-note {
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.4;
  margin-bottom: 2rem;
}

.user-form {
  margin-bottom: 2rem;
}

.user-form h4 {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
  background: rgba(96, 165, 250, 0.1);
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.required-note {
  color: #f59e0b;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  margin: 0.5rem 0 0 0;
  background: rgba(245, 158, 11, 0.1);
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.form-input {
  width: 100%;
  padding: 0.8rem;
  background: rgba(51, 65, 85, 0.6);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #60a5fa;
  background: rgba(51, 65, 85, 0.8);
}

.form-input::placeholder {
  color: #94a3b8;
}

.payment-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 2rem;
}

.payment-btn {
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.payment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mercadopago-payment {
  background: linear-gradient(135deg, #00b4d8, #0077b6);
  color: white;
  position: relative;
  overflow: hidden;
}

.mercadopago-payment:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.mercadopago-payment:hover:not(:disabled):before {
  left: 100%;
}

.mercadopago-payment:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 180, 216, 0.4);
}

.wompi-payment {
  background: linear-gradient(135deg, #1f2937, #374151);
  color: white;
  position: relative;
  overflow: hidden;
  border: 2px solid #10b981;
}

.wompi-payment:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.2), transparent);
  transition: left 0.5s;
}

.wompi-payment:hover:not(:disabled):before {
  left: 100%;
}

.wompi-payment:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  border-color: #059669;
}

.processing-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.processing-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
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

.secondary-payment {
  background: rgba(51, 65, 85, 0.8);
  color: #e2e8f0;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.secondary-payment:hover:not(:disabled) {
  background: rgba(96, 165, 250, 0.1);
  border-color: #60a5fa;
}

.link-payment {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.link-payment:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.2);
}

/* Overlay de carga para pagos */
.payment-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
}

/* Notificación de números no disponibles */
.unavailable-notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 10000;
  animation: slideInRight 0.3s ease-out;
}

.notification-content {
  background: linear-gradient(135deg, #fef3c7, #fed7aa);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  max-width: 400px;
  position: relative;
}

.notification-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notification-text h4 {
  color: #92400e;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.notification-text p {
  color: #b45309;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

.notification-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: #92400e;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.notification-close:hover {
  background: rgba(146, 64, 14, 0.1);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .unavailable-notification {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    right: 1rem;
  }

  .notification-content {
    padding: 1rem;
    max-width: none;
  }

  .notification-text h4 {
    font-size: 1rem;
  }

  .notification-text p {
    font-size: 0.85rem;
  }
}

.loading-content {
  text-align: center;
  color: white;
  max-width: 400px;
  padding: 3rem 2rem;
  background: rgba(30, 41, 59, 0.9);
  border-radius: 20px;
  border: 1px solid rgba(96, 165, 250, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
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

.loading-content h3 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.loading-content p {
  font-size: 1.1rem;
  color: #cbd5e1;
  margin-bottom: 2rem;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.loading-dots span {
  width: 12px;
  height: 12px;
  background: #60a5fa;
  border-radius: 50%;
  animation: loadingDots 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes loadingDots {

  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Estilos base para vistas de tabla */
.numbers-list-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1rem;
  background: rgba(15, 23, 42, 0.8);
  color: #e2e8f0;
  font-weight: 700;
  padding: 1rem 1.2rem;
  border-bottom: 2px solid rgba(96, 165, 250, 0.3);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.number-list-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1rem;
  padding: 0.8rem 1.2rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.1);
  background: rgba(30, 41, 59, 0.4);
  transition: all 0.2s ease;
  min-height: 60px;
  align-items: center;
}

.number-list-row:hover {
  background: rgba(51, 65, 85, 0.6);
  transform: translateX(4px);
}

.number-display {
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0.4rem 0.8rem;
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 8px;
  color: #60a5fa;
  text-align: center;
  min-width: 60px;
  font-family: 'Courier New', monospace;
}

.numbers-list-content {
  max-height: 400px;
  overflow-y: auto;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.status-col {
  text-align: center;
}

.action-col {
  text-align: center;
}

/* Responsive */
@media (max-width: 1024px) {
  .selection-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .sidebar-panel {
    position: static;
  }

  .numbers-list-header {
    padding: 0.8rem 1rem;
    font-size: 0.85rem;
  }

  .number-list-row {
    padding: 0.6rem 1rem;
    min-height: 55px;
  }

  .number-display {
    font-size: 1rem;
    padding: 0.3rem 0.6rem;
    min-width: 55px;
  }

  .status-indicator {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }

  .status-text {
    font-size: 0.75rem;
  }

  .action-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
    min-width: 65px;
  }

  .steps-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .step-card:last-child {
    grid-column: 1 / -1;
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .selection-header h2 {
    font-size: 2.5rem;
  }

  .numbers-list-header {
    padding: 0.7rem 0.8rem;
    font-size: 0.8rem;
    grid-template-columns: 1fr 1.8fr 1fr;
  }

  .number-list-row {
    padding: 0.5rem 0.8rem;
    min-height: 50px;
    grid-template-columns: 1fr 1.8fr 1fr;
  }

  .number-display {
    font-size: 0.95rem;
    padding: 0.3rem 0.5rem;
    min-width: 50px;
  }

  .status-indicator {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    gap: 0.3rem;
  }

  .status-text {
    font-size: 0.7rem;
  }

  .status-icon {
    font-size: 0.8rem;
  }

  .action-button {
    padding: 0.35rem 0.7rem;
    font-size: 0.7rem;
    min-width: 55px;
  }

  .control-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }

  .control-buttons .clear-btn {
    grid-column: 1 / -1;
  }

  .sidebar-panel {
    padding: 1.5rem;
  }

  .how-it-works-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }

  .steps-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 1rem;
  }

  .step-card {
    padding: 1.5rem;
  }

  .step-card:last-child {
    grid-column: 1;
    max-width: none;
  }

  .step-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .step-icon svg {
    width: 24px;
    height: 24px;
  }

  .step-content h4 {
    font-size: 1.1rem;
    margin-bottom: 0.6rem;
  }

  .step-content p {
    font-size: 0.9rem;
  }

  .pagination-controls {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .pagination-btn {
    width: 100%;
    max-width: 200px;
  }

  .search-input-container {
    flex-direction: column;
    max-width: 100%;
  }

  .search-btn {
    width: 100%;
  }

  .page-selector {
    flex-direction: column;
    gap: 0.3rem;
  }

  .reservation-controls {
    flex-direction: column;
    gap: 0.8rem;
    align-items: center;
  }

  .reserve-btn,
  .clear-all-btn {
    width: 100%;
    max-width: 280px;
  }

  .pagination-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-btn {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 640px) {
  .selection-container {
    padding: 0 1rem;
  }

  .numbers-list-header {
    padding: 0.6rem;
    font-size: 0.75rem;
    grid-template-columns: 1fr 1.5fr 1fr;
    gap: 0.5rem;
  }

  .number-list-row {
    padding: 0.4rem 0.6rem;
    min-height: 45px;
    grid-template-columns: 1fr 1.5fr 1fr;
    gap: 0.5rem;
  }

  .number-display {
    font-size: 0.85rem;
    padding: 0.25rem 0.4rem;
    min-width: 45px;
  }

  .status-indicator {
    padding: 0.2rem 0.4rem;
    font-size: 0.7rem;
    gap: 0.25rem;
  }

  .status-text {
    font-size: 0.65rem;
  }

  .status-icon {
    font-size: 0.7rem;
  }

  .action-button {
    padding: 0.3rem 0.5rem;
    font-size: 0.65rem;
    min-width: 50px;
  }

  .numbers-panel,
  .sidebar-panel {
    padding: 1rem;
  }

  .numbers-list-content {
    max-height: 300px;
  }

  .how-it-works-title {
    font-size: 1.5rem;
  }

  .steps-container {
    padding: 0 0.5rem;
    gap: 1rem;
  }

  .step-card {
    padding: 1.2rem 1rem;
  }

  .step-icon {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }

  .step-icon svg {
    width: 22px;
    height: 22px;
  }

  .reservation-controls {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
  }

  .reserve-btn,
  .clear-all-btn {
    padding: 0.7rem 1rem;
    font-size: 0.85rem;
  }

  .pagination-controls {
    margin-top: 1rem;
    padding-top: 1rem;
  }

  .pagination-btn {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }
}

/* Estilos para el bloque informativo */
.number-info-block {
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;

  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.number-info-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(96, 165, 250, 0.2);
  border-color: rgba(96, 165, 250, 0.5);
}

.number-info-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.number-info-title::before {
  content: "💡";
  font-size: 1.5rem;
}

.number-info-list {
  margin: 0;
  padding-left: 0;
  color: #cbd5e1;
  font-size: 1rem;
  list-style: none;
}

.number-info-list li {
  margin-bottom: 0.8rem;
  line-height: 1.6;
  padding-left: 2rem;
  position: relative;
  font-style: italic;
}

.number-info-list li::before {
  content: "✨";
  position: absolute;
  left: 0;
  top: 0;
  font-size: 1.1rem;
  color: #60a5fa;
}

.number-info-list li:last-child {
  margin-bottom: 0;
}
</style>
