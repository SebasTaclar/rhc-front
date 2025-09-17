<template>
  <div class="purchases-dashboard">
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Panel de Compras</h1>
        <p>Gestión de compras de wallpapers NS200</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="error = null" class="close-error">×</button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingPurchases && purchases.length === 0" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando compras...</p>
      </div>

      <div v-else class="dashboard-content">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card total">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <h3>Total Compras</h3>
              <p class="stat-number">{{ stats.totalPurchases }}</p>
            </div>
          </div>

          <div class="stat-card revenue">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <h3>Ingresos Aprobados</h3>
              <p class="stat-number">${{ stats.totalRevenue.toLocaleString() }} COP</p>
            </div>
          </div>

          <div class="stat-card wallpapers">
            <div class="stat-icon">🖼️</div>
            <div class="stat-content">
              <h3>Wallpapers</h3>
              <p class="stat-number">{{ stats.totalWallpapersSold }}</p>
            </div>
          </div>

          <div class="stat-card pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <h3>Pendientes</h3>
              <p class="stat-number">{{ stats.pendingPurchases }}</p>
            </div>
          </div>
        </div>

        <!-- Status Filter -->
        <div class="filter-section">
          <div class="filter-header">
            <h3>Filtrar por Estado</h3>
            <button @click="refreshData" :disabled="isLoadingPurchases" class="refresh-btn" title="Refrescar datos">
              <span v-if="isLoadingPurchases">🔄</span>
              <span v-else>🔄</span>
              {{ isLoadingPurchases ? 'Actualizando...' : 'Refrescar' }}
            </button>
          </div>

          <div class="status-filters">
            <button @click="selectedStatus = 'ALL'" :class="['filter-btn', { active: selectedStatus === 'ALL' }]">
              Todos ({{ purchases.length }})
            </button>
            <button @click="selectedStatus = 'PENDING'" :class="['filter-btn', 'pending', { active: selectedStatus === 'PENDING' }]">
              Pendientes ({{ purchasesByStatus.PENDING.length }})
            </button>
            <button @click="selectedStatus = 'APPROVED'" :class="['filter-btn', 'approved', { active: selectedStatus === 'APPROVED' }]">
              Aprobadas ({{ purchasesByStatus.APPROVED.length + purchasesByStatus.COMPLETED.length }})
            </button>
            <button @click="selectedStatus = 'REJECTED'" :class="['filter-btn', 'rejected', { active: selectedStatus === 'REJECTED' }]">
              Rechazadas ({{ purchasesByStatus.REJECTED.length }})
            </button>
            <button @click="selectedStatus = 'CANCELLED'" :class="['filter-btn', 'cancelled', { active: selectedStatus === 'CANCELLED' }]">
              Canceladas ({{ purchasesByStatus.CANCELLED.length }})
            </button>
          </div>
        </div>

        <!-- Search Box -->
        <div class="search-box-container">
          <input v-model="searchQuery" type="text" placeholder="Buscar por cliente, email, contacto o número de wallpaper..." class="search-box" />
        </div>

        <!-- Purchases Table -->
        <div class="purchases-section">
          <h3>Lista de Compras</h3>

          <div v-if="filteredPurchases.length === 0" class="no-purchases">
            <p>No hay compras {{ selectedStatus === 'ALL' ? '' : selectedStatus.toLowerCase() }} para mostrar.</p>
          </div>

          <div v-else class="purchases-table-container">
            <table class="purchases-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Contacto</th>
                  <th>Wallpapers</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="purchase in filteredPurchases" :key="purchase.id" :class="`purchase-row ${purchase.status.toLowerCase()}`">
                  <td class="purchase-id">#{{ purchase.id }}</td>
                  <td class="buyer-name">{{ purchase.buyerName }}</td>
                  <td class="buyer-email">
                    <div v-if="editingEmailId === purchase.id" class="email-edit-container">
                      <input v-model="editingEmailValue" type="email" class="email-input" :disabled="isUpdatingEmail" @keyup.enter="saveEmailEdit(purchase)" @keyup.escape="cancelEmailEdit()" placeholder="Email del cliente" />
                      <div class="email-actions">
                        <button @click="saveEmailEdit(purchase)" :disabled="isUpdatingEmail" class="save-btn" title="Guardar cambios">
                          <span v-if="isUpdatingEmail">⏳</span>
                          <span v-else>✅</span>
                        </button>
                        <button @click="cancelEmailEdit()" :disabled="isUpdatingEmail" class="cancel-btn" title="Cancelar edición">
                          ❌
                        </button>
                      </div>
                    </div>
                    <div v-else class="email-display" :class="{ 'email-editable': canEditEmail(purchase), 'email-readonly': !canEditEmail(purchase) }" @click="canEditEmail(purchase) ? startEmailEdit(purchase) : null" :title="canEditEmail(purchase) ? `Clic para editar: ${purchase.buyerEmail}` : `Solo se puede editar emails de compras APPROVED/COMPLETED: ${purchase.buyerEmail}`">
                      <span class="email-text">{{ purchase.buyerEmail }}</span>
                      <span v-if="canEditEmail(purchase)" class="edit-icon">✏️</span>
                      <span v-else class="lock-icon">🔒</span>
                    </div>
                  </td>
                  <td class="buyer-contact">{{ purchase.buyerContactNumber || 'No proporcionado' }}</td>
                  <td class="wallpapers">
                    <div class="wallpaper-numbers">
                      <span v-for="number in purchase.wallpaperNumbers" :key="number" class="wallpaper-tag">
                        #{{ number }}
                      </span>
                    </div>
                    <small class="wallpaper-count">{{ purchase.wallpaperNumbers.length }} wallpaper(s)</small>
                  </td>
                  <td class="amount">${{ purchase.amount.toLocaleString() }} {{ purchase.currency }}</td>
                  <td class="status">
                    <span :class="`status-badge ${purchase.status.toLowerCase()}`">
                      {{ getStatusText(purchase.status) }}
                    </span>
                  </td>
                  <td class="date">{{ formatDate(purchase.createdAt) }}</td>
                  <td class="actions">
                    <button @click="resendEmail(purchase)" class="action-btn resend-btn" :disabled="isResendingEmail || !canResendEmail(purchase)" :title="getResendEmailTooltip(purchase)">
                      <span v-if="isResendingEmail">📤</span>
                      <span v-else>✉️</span>
                      Reenviar Email
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminPurchases } from '@/composables/useAdminPurchases'
import { paymentService, type Purchase } from '@/services/api/paymentService'
import { authService } from '@/services/api/authService'

// Estado compras
const { isLoading: isLoadingPurchases, error, purchases, purchasesByStatus, stats, getAllPurchases } = useAdminPurchases()

const selectedStatus = ref<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'>('ALL')
const searchQuery = ref('')
const isResendingEmail = ref(false)

// Estado para edición de email
const editingEmailId = ref<string | null>(null)
const editingEmailValue = ref('')
const isUpdatingEmail = ref(false)

const filteredPurchases = computed<Purchase[]>(() => {
  let filtered: Purchase[] = []

  if (selectedStatus.value === 'ALL') {
    filtered = purchases.value
  } else if (selectedStatus.value === 'APPROVED') {
    filtered = [...(purchasesByStatus.value.APPROVED || []), ...(purchasesByStatus.value.COMPLETED || [])]
  } else {
    filtered = purchasesByStatus.value[selectedStatus.value] || []
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter((purchase: Purchase) => {
      const nameMatch = purchase.buyerName?.toLowerCase().includes(query)
      const emailMatch = purchase.buyerEmail?.toLowerCase().includes(query)
      const contactMatch = purchase.buyerContactNumber?.toLowerCase().includes(query)
      const wallpaperMatch = purchase.wallpaperNumbers?.some((num: number) => num.toString().includes(query.replace('#', '')))
      return nameMatch || emailMatch || contactMatch || wallpaperMatch
    })
  }

  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// Usuario actual y permisos
const currentUser = computed(() => authService.getUserInfo())
const currentUserEmail = computed(() => currentUser.value?.email?.toLowerCase() || '')
const isAdminUser = computed(() => authService.isAdmin())
const isOwner = (purchase: Purchase) => purchase.buyerEmail?.toLowerCase() === currentUserEmail.value

const refreshData = async () => {
  try {
    // Si es admin, usa la ruta de admin; si no, carga por email del usuario autenticado
    if (authService.isAdmin()) {
      await getAllPurchases()
    } else {
      const user = authService.getUserInfo()
      if (!user?.email) {
        throw new Error('Usuario no autenticado')
      }
      // Marcar loading manualmente ya que estamos fuera del composable
      isLoadingPurchases.value = true
      const resp = await paymentService.getPurchasesByEmail(user.email)
      if (resp.success && resp.data) {
        purchases.value = resp.data.purchases
      } else {
        throw new Error(resp.message || 'No se pudieron obtener las compras')
      }
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error desconocido al actualizar datos'
    console.error('Error actualizando datos:', e)
    error.value = message
  } finally {
    isLoadingPurchases.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = { PENDING: 'Pendiente', APPROVED: 'Aprobada', COMPLETED: 'Completada', REJECTED: 'Rechazada', CANCELLED: 'Cancelada' }
  return statusMap[status] || status
}

// Permisos por estado
const canResendEmail = (purchase: Purchase): boolean =>
  (purchase.status === 'APPROVED' || purchase.status === 'COMPLETED') && (isAdminUser.value || isOwner(purchase))
const getResendEmailTooltip = (purchase: Purchase): string => canResendEmail(purchase)
  ? `Reenviar email con wallpaper a ${purchase.buyerEmail}`
  : `Solo disponible para compras aprobadas/completadas y si eres admin o propietario. Estado: ${purchase.status}`

const resendEmail = async (purchase: Purchase) => {
  if (!canResendEmail(purchase)) {
    alert(`❌ No se puede reenviar email. Solo se permite para compras APPROVED o COMPLETED. Estado actual: ${purchase.status}`)
    return
  }
  try {
    isResendingEmail.value = true
    const response = await paymentService.resendPurchaseEmail(purchase.id)
    if (response.success) {
      alert(`✅ Email reenviado exitosamente para la compra ${purchase.id} a ${purchase.buyerEmail}`)
    } else {
      throw new Error(response.message || 'Error al reenviar email')
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'desconocido'
    alert(`❌ Error al reenviar el email: ${message}`)
  } finally {
    isResendingEmail.value = false
  }
}

// Edición inline de email
// Por seguridad, solo los administradores pueden editar correos de compras
const canEditEmail = (purchase: Purchase): boolean => isAdminUser.value && (purchase.status === 'APPROVED' || purchase.status === 'COMPLETED')
const startEmailEdit = (purchase: Purchase) => {
  if (!canEditEmail(purchase) || isResendingEmail.value || isUpdatingEmail.value) return
  editingEmailId.value = purchase.id
  editingEmailValue.value = purchase.buyerEmail
}
const cancelEmailEdit = () => { editingEmailId.value = null; editingEmailValue.value = '' }
const saveEmailEdit = async (purchase: Purchase) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(editingEmailValue.value)) { alert('❌ Email inválido'); return }
  if (editingEmailValue.value === purchase.buyerEmail) { cancelEmailEdit(); return }
  try {
    isUpdatingEmail.value = true
    const response = await paymentService.updatePurchaseEmail(purchase.id, editingEmailValue.value)
    if (response.success) {
      const idx = purchases.value.findIndex(p => p.id === purchase.id)
      if (idx !== -1) purchases.value[idx].buyerEmail = editingEmailValue.value
      alert(`✅ Email actualizado para la compra ${purchase.id}`)
      cancelEmailEdit()
    } else {
      throw new Error(response.message || 'Error al actualizar email')
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'desconocido'
    alert(`❌ Error al actualizar email: ${message}`)
  } finally {
    isUpdatingEmail.value = false
  }
}

onMounted(async () => { await refreshData() })
</script>

<style scoped>
.purchases-dashboard {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  min-height: 100vh;
  padding: 6rem 0 2rem 0;
}

.dashboard-container { max-width: 1400px; margin: 0 auto; padding: 0 2rem; }
.dashboard-header { text-align: center; margin-bottom: 2rem; }
.dashboard-header h1 { font-size: 2rem; font-weight: 800; color: #fff; margin-bottom: .25rem; }
.dashboard-header p { color: #cbd5e1; }

.error-message { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
.error-message p { color: #ef4444; margin: 0; }
.close-error { background: none; border: none; color: #ef4444; font-size: 1.2rem; cursor: pointer; }

.loading-state { text-align: center; padding: 4rem 0; color: #cbd5e1; }
.loading-spinner { width: 48px; height: 48px; border: 4px solid rgba(96,165,250,.3); border-top-color: #60a5fa; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }

.dashboard-content { display: flex; flex-direction: column; gap: 2rem; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.stat-card { background: rgba(30,41,59,.8); border: 1px solid rgba(96,165,250,.2); border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 1rem; }
.stat-icon { width: 45px; height: 45px; border-radius: 50%; display:flex; align-items:center; justify-content:center; font-size:1.4rem; }
.stat-card.total .stat-icon { background: linear-gradient(135deg,#60a5fa,#3b82f6); }
.stat-card.revenue .stat-icon { background: linear-gradient(135deg,#10b981,#059669); }
.stat-card.wallpapers .stat-icon { background: linear-gradient(135deg,#f59e0b,#d97706); }
.stat-card.pending .stat-icon { background: linear-gradient(135deg,#f97316,#ea580c); }
.stat-content h3 { font-size: .9rem; font-weight: 600; color: #cbd5e1; margin-bottom: .25rem; }
.stat-number { font-size: 1.6rem; font-weight: 800; color: #fff; }

.filter-section { margin-top: .5rem; }
.filter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .5rem; }
.filter-section h3 { color: #10b981; font-size: 1.2rem; font-weight: 700; }
.refresh-btn { padding: .5rem 1rem; background: linear-gradient(135deg,#059669,#047857); color: #fff; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: .5rem; }
.status-filters { display: flex; gap: .8rem; flex-wrap: wrap; }
.filter-btn { padding: .7rem 1rem; border: 2px solid rgba(96,165,250,.3); background: rgba(51,65,85,.6); color: #e2e8f0; border-radius: 8px; font-weight: 600; cursor: pointer; }
.filter-btn.active { background: linear-gradient(135deg,#60a5fa,#3b82f6); border-color:#60a5fa; color: #fff; }
.filter-btn.pending.active { background: linear-gradient(135deg,#f97316,#ea580c); border-color:#f97316; }
.filter-btn.approved.active { background: linear-gradient(135deg,#10b981,#059669); border-color:#10b981; }
.filter-btn.rejected.active { background: linear-gradient(135deg,#ef4444,#dc2626); border-color:#ef4444; }
.filter-btn.cancelled.active { background: linear-gradient(135deg,#6b7280,#4b5563); border-color:#6b7280; }

.search-box { width: 100%; padding: 1rem 1.5rem; background: rgba(30,41,59,.8); border: 1px solid rgba(96,165,250,.2); border-radius: 12px; color: #fff; }

.purchases-section h3 { color: #fff; font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem; }
.purchases-table-container { background: rgba(30,41,59,.8); border-radius: 16px; overflow-x: auto; border: 1px solid rgba(96,165,250,.2); }
.purchases-table { width: 100%; min-width: 1250px; border-collapse: collapse; table-layout: fixed; }
.purchases-table th { background: rgba(15,23,42,.8); color:#e2e8f0; font-weight:700; padding: 1rem; text-align:left; border-bottom: 1px solid rgba(96,165,250,.2); font-size: .9rem; }

/* Column widths to preserve layout */
.purchases-table th:nth-child(1), .purchases-table td:nth-child(1) { width: 90px; }
.purchases-table th:nth-child(2), .purchases-table td:nth-child(2) { width: 150px; }
.purchases-table th:nth-child(3), .purchases-table td:nth-child(3) { width: 180px; max-width: 200px; overflow: hidden; }
.purchases-table th:nth-child(4), .purchases-table td:nth-child(4) { width: 140px; }
.purchases-table th:nth-child(5), .purchases-table td:nth-child(5) { width: 200px; }
.purchases-table th:nth-child(6), .purchases-table td:nth-child(6) { width: 120px; }
.purchases-table th:nth-child(7), .purchases-table td:nth-child(7) { width: 160px; padding-right: 1.5rem; }
.purchases-table th:nth-child(8), .purchases-table td:nth-child(8) { width: 150px; padding-left: 1.5rem; }
.purchases-table th:nth-child(9), .purchases-table td:nth-child(9) { width: 150px; }

.purchases-table td { padding: .8rem 1rem; border-bottom: 1px solid rgba(96,165,250,.1); color:#cbd5e1; vertical-align: top; word-wrap: break-word; }
.purchase-row:hover { background: rgba(96,165,250,.05); }
.purchase-id { font-weight: 700; color: #60a5fa; }
.buyer-name { font-weight: 600; color: #fff; line-height: 1.4; }
.buyer-email { font-size: .9rem; color:#94a3b8; line-height: 1.4; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 200px; }

/* Email inline editing */
.email-display { cursor: pointer; display:flex; align-items:center; gap:.5rem; padding:.2rem; border-radius:4px; transition: background-color .2s ease; }
.email-display:hover { background: rgba(96,165,250,.1) }
.email-text { flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; min-width: 0; }
.edit-icon { opacity: 0; transition: opacity .2s ease; font-size: .8rem; }
.email-display:hover .edit-icon { opacity: 1; }
.email-readonly { cursor: not-allowed !important; opacity:.7 }
.email-readonly:hover { background: rgba(239,68,68,.05) !important; }
.lock-icon { opacity: .6; font-size: .8rem; color: #ef4444; }
.email-readonly:hover .lock-icon { opacity: 1; }
.email-edit-container { display: flex; flex-direction: column; gap: .5rem; }
.email-input { background: rgba(30,41,59,.9); border: 1px solid rgba(96,165,250,.3); border-radius: 4px; padding: .4rem .6rem; color: #fff; font-size: .9rem; width: 100%; box-sizing: border-box; }
.email-input:focus { outline: none; border-color: #60a5fa; box-shadow: 0 0 0 2px rgba(96,165,250,.2); }
.email-actions { display:flex; gap:.3rem; }
.save-btn, .cancel-btn { padding: .2rem .4rem; border: none; border-radius: 3px; cursor: pointer; font-size: .8rem; transition: all .2s ease; }
.save-btn { background: rgba(16,185,129,.2); color:#10b981; border: 1px solid rgba(16,185,129,.3) }
.save-btn:hover:not(:disabled) { background: rgba(16,185,129,.3); }
.cancel-btn { background: rgba(239,68,68,.2); color:#ef4444; border: 1px solid rgba(239,68,68,.3) }
.cancel-btn:hover:not(:disabled) { background: rgba(239,68,68,.3); }
.save-btn:disabled, .cancel-btn:disabled { opacity: .5; cursor: not-allowed; }

.buyer-contact { font-size: .9rem; color:#cbd5e1; font-weight: 500; line-height: 1.4; }
.wallpapers { max-width: 400px; }
.wallpaper-numbers { display:flex; flex-wrap:wrap; gap:.3rem; margin-bottom:.25rem }
.wallpaper-tag { background: rgba(96,165,250,.2); color:#60a5fa; padding:.2rem .5rem; border-radius:12px; font-size:.7rem; font-weight:600 }
.wallpaper-count { color:#94a3b8; font-size: .8rem; }
.amount { font-weight: 700; color: #10b981 }
.status-badge { padding:.4rem .8rem; border-radius:20px; font-size:.8rem; font-weight:600; text-transform:uppercase }
.status-badge.pending { background: rgba(249,115,22,.2); color:#f97316; border:1px solid rgba(249,115,22,.3) }
.status-badge.approved, .status-badge.completed { background: rgba(16,185,129,.2); color:#10b981; border:1px solid rgba(16,185,129,.3) }
.status-badge.rejected { background: rgba(239,68,68,.2); color:#ef4444; border:1px solid rgba(239,68,68,.3) }
.status-badge.cancelled { background: rgba(107,114,128,.2); color:#6b7280; border:1px solid rgba(107,114,128,.3) }

/* Actions column */
.actions { text-align: center; padding: .8rem; }
.action-btn { padding: .5rem 1rem; border: none; border-radius: 6px; font-size: .8rem; font-weight:600; cursor: pointer; transition: all .3s ease; display: inline-flex; align-items: center; gap: .3rem; }
.resend-btn { background: linear-gradient(135deg,#10b981,#059669); color:#fff; }
.resend-btn:hover:not(:disabled) { background: linear-gradient(135deg,#059669,#047857); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16,185,129,.3) }
.resend-btn:disabled { opacity: .4; cursor: not-allowed; transform: none; background: linear-gradient(135deg, #6b7280, #4b5563) !important; color:#9ca3af !important; }

@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2,1fr) } }
@media (max-width: 768px) {
  .dashboard-container { padding: 0 1rem; }
  .status-filters { flex-direction: column; }
  .filter-btn { width: 100%; text-align: center; }
}
@media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr } }
</style>
