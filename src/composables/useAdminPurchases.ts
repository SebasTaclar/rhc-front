import { ref, computed } from 'vue'
import { paymentService } from '@/services/api/paymentService'
import { authService } from '@/services/api/authService'
import type { Purchase } from '@/services/api/paymentService'

export function useAdminPurchases() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const purchases = ref<Purchase[]>([])
  const totalCount = ref(0)

  /**
   * Obtener todas las compras (solo para administradores)
   */
  const getAllPurchases = async () => {
    if (!authService.isAdmin()) {
      error.value = 'No tienes permisos de administrador'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await paymentService.getAllPurchases()

      if (response.success && response.data) {
        purchases.value = response.data.purchases
        totalCount.value = response.data.count
      } else {
        throw new Error(response.message || 'Error al obtener las compras')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener las compras'
      error.value = errorMessage
      console.error('Error getting all purchases:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Compras agrupadas por estado
   */
  const purchasesByStatus = computed(() => {
    const grouped = {
      PENDING: purchases.value.filter((p) => p.status === 'PENDING'),
      APPROVED: purchases.value.filter((p) => p.status === 'APPROVED'),
      COMPLETED: purchases.value.filter((p) => p.status === 'COMPLETED'),
      REJECTED: purchases.value.filter((p) => p.status === 'REJECTED'),
      CANCELLED: purchases.value.filter((p) => p.status === 'CANCELLED'),
    }
    return grouped
  })

  /**
   * Estadísticas generales
   */
  const stats = computed(() => {
    const totalRevenue = purchases.value
      .filter((p) => p.status === 'APPROVED' || p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0)

    const totalWallpapersSold = purchases.value
      .filter((p) => p.status === 'APPROVED' || p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.wallpaperNumbers.length, 0)

    return {
      totalPurchases: purchases.value.length,
      totalRevenue,
      totalWallpapersSold,
      pendingPurchases: purchasesByStatus.value.PENDING.length,
      approvedPurchases: purchasesByStatus.value.APPROVED.length,
      completedPurchases: purchasesByStatus.value.COMPLETED.length,
      rejectedPurchases: purchasesByStatus.value.REJECTED.length,
      cancelledPurchases: purchasesByStatus.value.CANCELLED.length,
    }
  })

  /**
   * Limpiar datos
   */
  const clearData = () => {
    purchases.value = []
    totalCount.value = 0
    error.value = null
  }

  return {
    // Estado
    isLoading,
    error,
    purchases,
    totalCount,
    purchasesByStatus,
    stats,

    // Métodos
    getAllPurchases,
    clearData,
  }
}
