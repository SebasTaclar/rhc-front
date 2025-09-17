import { ref, computed } from 'vue'
import { paymentService } from '@/services/api/paymentService'
import type { CreatePaymentRequest, Purchase } from '@/services/api/paymentService'

export function usePayments() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const userPurchases = ref<Purchase[]>([])
  const currentPaymentUrl = ref<string | null>(null)

  /**
   * Crear un nuevo pago para un wallpaper
   */
  const createPayment = async (paymentData: CreatePaymentRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await paymentService.createPayment(paymentData)

      if (response.success && response.data) {
        // Guardar la URL de pago para redirigir al usuario
        currentPaymentUrl.value = response.data.payment.paymentUrl

        // Opcional: guardar información del pago en localStorage para tracking
        localStorage.setItem(
          'lastPaymentData',
          JSON.stringify({
            purchaseId: response.data.purchase.id,
            wallpaperNumbers: response.data.purchase.wallpaperNumbers,
            amount: response.data.purchase.amount,
            timestamp: new Date().toISOString(),
          }),
        )

        return response.data
      } else {
        throw new Error(response.message || 'Failed to create payment')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      error.value = errorMessage
      console.error('Payment creation error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crear un nuevo pago con Wompi
   */
  const createWompiPayment = async (paymentData: CreatePaymentRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await paymentService.createWompiPayment(paymentData)

      if (response.success && response.data) {
        // Guardar la URL de pago para redirigir al usuario
        currentPaymentUrl.value = response.data.payment.checkoutUrl

        // Guardar información del pago en localStorage para tracking
        localStorage.setItem(
          'lastWompiPaymentData',
          JSON.stringify({
            purchaseId: response.data.purchase.id,
            reference: response.data.payment.reference, // Usar reference en lugar de transactionId
            wallpaperNumbers: response.data.purchase.wallpaperNumbers,
            amount: response.data.purchase.amount,
            timestamp: new Date().toISOString(),
          }),
        )

        return response.data
      } else {
        throw new Error(response.message || 'Failed to create Wompi payment')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      error.value = errorMessage
      console.error('Wompi payment creation error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtener todas las compras de un usuario
   */
  const getUserPurchases = async (email: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await paymentService.getPurchasesByEmail(email)

      if (response.success && response.data) {
        userPurchases.value = response.data.purchases
        return response.data
      } else {
        throw new Error(response.message || 'Error getting purchases')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error getting purchases'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verificar si el usuario ya compró un wallpaper específico
   */
  const hasUserPurchasedWallpaper = async (
    email: string,
    wallpaperNumber: number,
  ): Promise<boolean> => {
    try {
      return await paymentService.hasUserPurchasedWallpaper(email, wallpaperNumber)
    } catch (err) {
      console.error('Error checking wallpaper purchase:', err)
      return false
    }
  }

  /**
   * Limpiar la URL de pago actual
   */
  const clearPaymentUrl = () => {
    currentPaymentUrl.value = null
  }

  /**
   * Verificar el estado de una compra específica
   */
  const getPurchaseStatus = (wallpaperNumber: number) => {
    return computed(() => {
      const purchase = userPurchases.value.find((p) => p.wallpaperNumbers.includes(wallpaperNumber))
      return purchase?.status || null
    })
  }

  /**
   * Obtener todas las compras aprobadas
   */
  const approvedPurchases = computed(() => {
    return userPurchases.value.filter((purchase) => purchase.status === 'APPROVED')
  })

  /**
   * Obtener todas las compras pendientes
   */
  const pendingPurchases = computed(() => {
    return userPurchases.value.filter((purchase) => purchase.status === 'PENDING')
  })

  /**
   * Procesar pago exitoso (para llamar después del webhook)
   */
  const handlePaymentSuccess = async (email: string) => {
    // Recargar las compras del usuario para actualizar el estado
    await getUserPurchases(email)
  }

  return {
    // Estado
    isLoading,
    error,
    userPurchases,
    currentPaymentUrl,
    approvedPurchases,
    pendingPurchases,

    // Métodos
    createPayment,
    createWompiPayment,
    getUserPurchases,
    hasUserPurchasedWallpaper,
    clearPaymentUrl,
    getPurchaseStatus,
    handlePaymentSuccess,
  }
}
