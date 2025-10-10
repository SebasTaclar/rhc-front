<template>
  <section class="client-portal">
    <header class="cp-header">
      <div class="cp-title">
        <h1>Panel de Cliente</h1>
        <p class="subtitle">Consulta el estado de tu gestión con RHC Asesorías</p>
      </div>
      <div class="cp-actions">
        <RouterLink class="btn link-btn" to="/accounting">📊 Ver contabilidad</RouterLink>
        <a class="btn outline-btn" href="#contacto">📞 Contacto</a>
      </div>
    </header>

    <div class="cp-grid">
      <!-- Resumen -->
      <div class="card summary">
        <h2>Resumen</h2>
        <div class="summary-grid">
          <div class="metric">
            <div class="label">Cliente</div>
            <div class="value">{{ user?.name || '—' }}</div>
            <div class="hint">{{ user?.email }}</div>
          </div>
          <div class="metric">
            <div class="label">Membresía</div>
            <div class="value" :class="{ ok: user?.membershipPaid, warn: !user?.membershipPaid }">
              {{ user?.membershipPaid ? 'Activa' : 'Pendiente' }}
            </div>
            <div class="hint">Estado de pago</div>
          </div>
          <div class="metric">
            <div class="label">Compras</div>
            <div class="value">{{ purchases.length }}</div>
            <div class="hint">Historial total</div>
          </div>
          <div class="metric">
            <div class="label">Última actualización</div>
            <div class="value">{{ lastUpdated || '—' }}</div>
            <div class="hint">Sincronización</div>
          </div>
        </div>
      </div>

      <!-- Pagos y compras -->
      <div class="card purchases">
        <div class="card-header">
          <h2>Pagos y compras</h2>
          <button class="btn small" @click="refreshPurchases" :disabled="loading">
            {{ loading ? 'Actualizando…' : 'Actualizar' }}
          </button>
        </div>

        <div v-if="loading" class="loading">
          <Spinner />
          <span>Cargando historial…</span>
        </div>

        <div v-else-if="!purchases.length" class="empty">
          <p>No encontramos compras asociadas a tu correo.</p>
          <small>Si realizaste una compra recientemente, presiona Actualizar.</small>
        </div>

        <div v-else class="table-wrapper">
          <table class="purchases-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Números</th>
                <th>Monto</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in purchases" :key="p.id">
                <td>{{ formatDate(p.createdAt) }}</td>
                <td>
                  <div class="chips">
                    <span v-for="n in p.wallpaperNumbers" :key="n" class="chip">#{{ n }}</span>
                  </div>
                </td>
                <td>{{ formatCurrency(p.amount, p.currency) }}</td>
                <td>
                  <span class="status" :class="p.status.toLowerCase()">{{ mapStatus(p.status) }}</span>
                </td>
                <td class="row-actions">
                  <button class="btn xsmall ghost" @click="resendEmail(p.id)" :disabled="resendingId === p.id">
                    {{ resendingId === p.id ? 'Enviando…' : 'Reenviar correo' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Documentos -->
      <div class="card documents">
        <h2>Documentos</h2>
        <div class="empty">
          <p>Próximamente podrás ver y descargar tus documentos aquí.</p>
          <small>Estados financieros, certificados y más.</small>
        </div>
      </div>

      <!-- Soporte / Solicitudes -->
      <div class="card support">
        <h2>Solicitudes y soporte</h2>
        <form @submit.prevent="submitSupport">
          <div class="form-grid">
            <label class="field">
              <span>Tipo</span>
              <select v-model="support.type">
                <option value="consulta">Consulta</option>
                <option value="documento">Solicitud de documento</option>
                <option value="actualizacion">Actualización de datos</option>
              </select>
            </label>
            <label class="field full">
              <span>Descripción</span>
              <textarea v-model="support.message" rows="4" placeholder="Describe tu solicitud…" />
            </label>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn primary" :disabled="!support.message.trim()">Enviar</button>
            <span class="help">Se abrirá tu cliente de correo con los datos prellenados.</span>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import Spinner from '@/components/Spinner.vue'
import { authService } from '@/services/api'
import { paymentService, type Purchase } from '@/services/api/paymentService'

const user = computed(() => authService.getCurrentUser())

const purchases = ref<Purchase[]>([])
const loading = ref(false)
const lastUpdated = ref<string>('')
const resendingId = ref<string | null>(null)

const support = ref({ type: 'consulta', message: '' })

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch {
    return iso
  }
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

function mapStatus(s: Purchase['status']) {
  switch (s) {
    case 'APPROVED':
      return 'Aprobado'
    case 'COMPLETED':
      return 'Completado'
    case 'PENDING':
      return 'Pendiente'
    case 'REJECTED':
      return 'Rechazado'
    case 'CANCELLED':
      return 'Cancelado'
    default:
      return s
  }
}

async function loadPurchases() {
  if (!user.value?.email) return
  loading.value = true
  try {
    const resp = await paymentService.getPurchasesByEmail(user.value.email)
    if (resp.success && resp.data) {
      purchases.value = resp.data.purchases || []
      lastUpdated.value = new Date().toLocaleString()
    } else {
      purchases.value = []
    }
  } catch {
    // Silenciar error en UI, mostrar vacío
    purchases.value = []
  } finally {
    loading.value = false
  }
}

async function refreshPurchases() {
  await loadPurchases()
}

async function resendEmail(purchaseId: string) {
  try {
    resendingId.value = purchaseId
    const r = await paymentService.resendPurchaseEmail(purchaseId)
    if (r.success) {
      alert('Correo reenviado exitosamente.')
    } else {
      alert('No fue posible reenviar el correo. Intenta más tarde.')
    }
  } catch {
    alert('Ocurrió un error al reenviar el correo.')
  } finally {
    resendingId.value = null
  }
}

function submitSupport() {
  const subject = encodeURIComponent(`[${support.value.type}] Solicitud de ${user.value?.name || 'cliente'}`)
  const body = encodeURIComponent(`${support.value.message}\n\nCliente: ${user.value?.name} (${user.value?.email})`)
  window.location.href = `mailto:contacto@rhc-asesorias.com?subject=${subject}&body=${body}`
}

onMounted(() => {
  loadPurchases()
})
</script>

<style scoped>
/* ===== CONTENEDOR PRINCIPAL ===== */
.client-portal {
  max-width: 1280px;
  margin: 110px auto 60px;
  padding: 0 2rem;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  min-height: calc(100vh - 170px);
}

/* ===== HEADER DEL PORTAL ===== */
.cp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  padding: 1.75rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.cp-title h1 {
  margin: 0;
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  background: linear-gradient(135deg, #1f2937 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

.cp-title .subtitle {
  margin: 0.5rem 0 0;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
}

.cp-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* ===== BOTONES ===== */
.btn {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
}

.btn.link-btn {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(96, 165, 250, 0.25);
}

.btn.link-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 16px rgba(96, 165, 250, 0.35);
}

.btn.outline-btn {
  background: transparent;
  border-color: #d1d5db;
  color: #374151;
}

.btn.outline-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn.small {
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
}

.btn.xsmall {
  padding: 0.375rem 0.625rem;
  font-size: 0.8125rem;
}

.btn.ghost {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}

.btn.ghost:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
}

/* ===== GRID DE TARJETAS ===== */
.cp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02);
}

.card h2 {
  margin: 0 0 1.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

/* ===== TARJETA RESUMEN ===== */
.card.summary {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border: 2px solid #dbeafe;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.metric {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  position: relative;
  overflow: hidden;
}

.metric .label {
  color: #6b7280;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.metric .value {
  font-weight: 800;
  font-size: 1.5rem;
  color: #111827;
  margin: 0.25rem 0;
  line-height: 1.2;
}

.metric .value.ok {
  color: #059669;
}

.metric .value.warn {
  color: #d97706;
}

.metric .hint {
  color: #9ca3af;
  font-size: 0.8125rem;
  margin-top: 0.25rem;
}

/* ===== ESTADOS VACÍO Y CARGA ===== */
.loading,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #6b7280;
  padding: 2.5rem 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
}

.loading {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.empty p {
  margin: 0;
  font-weight: 600;
  font-size: 1rem;
  color: #374151;
}

.empty small {
  color: #9ca3af;
  font-size: 0.875rem;
}

/* ===== TABLA DE COMPRAS ===== */
.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}

thead {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

thead tr {
  border-bottom: 2px solid #e5e7eb;
}

th {
  color: #6b7280;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

tbody tr:last-child td {
  border-bottom: none;
}

td {
  color: #111827;
  font-size: 0.9375rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.chip {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  color: #4338ca;
  border: 1px solid #c7d2fe;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.row-actions {
  text-align: right;
}

/* ===== ESTADOS (BADGES) ===== */
.status {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.8125rem;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.15s;
}

.status::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status.approved,
.status.completed {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #065f46;
  border-color: #a7f3d0;
}

.status.pending {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #92400e;
  border-color: #fde68a;
}

.status.rejected,
.status.cancelled {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  color: #991b1b;
  border-color: #fca5a5;
}

/* ===== FORMULARIO DE SOPORTE ===== */
.form-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field span {
  color: #374151;
  font-weight: 600;
  font-size: 0.9375rem;
}

select,
textarea {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0.75rem 0.875rem;
  font: inherit;
  transition: all 0.2s;
  background: #ffffff;
  color: #111827;
}

select:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

select:hover,
textarea:hover {
  border-color: #9ca3af;
}

.field.full {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.help {
  color: #6b7280;
  font-size: 0.875rem;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .cp-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .card.summary {
    grid-column: 1;
  }
}

@media (max-width: 640px) {
  .client-portal {
    margin: 90px auto 40px;
    padding: 0 1rem;
  }

  .cp-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem 1.5rem;
    gap: 1rem;
  }

  .cp-title h1 {
    font-size: 1.75rem;
  }

  .cp-title .subtitle {
    font-size: 0.9375rem;
  }

  .cp-actions {
    width: 100%;
  }

  .cp-actions .btn {
    flex: 1;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 1.25rem;
  }

  th,
  td {
    padding: 0.625rem 0.5rem;
    font-size: 0.875rem;
  }

  .chips {
    flex-direction: column;
  }
}
</style>
