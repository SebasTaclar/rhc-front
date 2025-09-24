<template>
  <section class="client-accounting">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="title-section">
          <h1>Portal Financiero</h1>
          <p class="subtitle">Gestión de movimientos contables y estados financieros</p>
        </div>
        <div class="period-selector" aria-hidden="false">
          <span class="period-label">Período</span>
          <div class="date-inputs">
            <div class="input-group">
              <label for="fromDate">Desde</label>
              <input id="fromDate" class="date-input" type="date" v-model="from" :max="to || undefined" />
            </div>
            <div class="input-group">
              <label for="toDate">Hasta</label>
              <input id="toDate" class="date-input" type="date" v-model="to" :min="from || undefined" />
            </div>
          </div>
        </div>
      </div>
    </header>

    <section class="financial-summary">
      <div class="summary-card main-balance" aria-live="polite">
        <div class="card-header">
          <h3>Balance General</h3>
          <span class="period-tag">Actual</span>
        </div>
        <div class="balance-amount">{{ formatCurrency(currentBalance) }}</div>
        <div class="balance-date">Actualizado: {{ formatDate(updatedAt) }}</div>
      </div>

      <div class="summary-card income">
        <div class="card-header">
          <h3>Ingresos Totales</h3>
          <span class="period-tag">Período</span>
        </div>
        <div class="amount positive">{{ formatCurrency(totalIncome) }}</div>
        <div class="movement-count">{{ filtered.filter(m => m.type === 'Ingreso').length }} movimientos</div>
      </div>

      <div class="summary-card expenses">
        <div class="card-header">
          <h3>Egresos Totales</h3>
          <span class="period-tag">Período</span>
        </div>
        <div class="amount negative">{{ formatCurrency(totalExpense) }}</div>
        <div class="movement-count">{{ filtered.filter(m => m.type === 'Egreso').length }} movimientos</div>
      </div>
    </section>

    <section class="transactions-section" aria-labelledby="transactionsHeading">
      <div class="section-header">
        <h2 id="transactionsHeading">Movimientos</h2>
        <div class="actions">
          <div class="search-container">
            <label class="sr-only" for="searchInput">Buscar movimientos</label>
            <input id="searchInput" class="search-input" type="search" v-model="q" placeholder="Buscar por descripción o referencia" aria-label="Buscar movimientos" />
            <span class="search-icon">🔍</span>
          </div>

          <button class="btn clear" @click="clearFilters" title="Limpiar filtros" aria-label="Limpiar filtros">↺ Limpiar</button>
          <button class="btn export" @click="exportCSV" title="Exportar CSV" aria-label="Exportar movimientos a CSV">⤓ Exportar</button>
        </div>
      </div>

      <div class="table-container">
        <table class="transactions-table" role="table">
          <thead>
            <tr>
              <th class="date-col">Fecha</th>
              <th class="type-col">Tipo</th>
              <th class="desc-col">Descripción</th>
              <th class="ref-col">Referencia</th>
              <th class="amount-col">Monto</th>
              <th class="balance-col">Saldo</th>
              <th class="actions-col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in paged" :key="m.id">
              <td>{{ formatDate(m.date) }}</td>
              <td>{{ m.type }}</td>
              <td>{{ m.description }}</td>
              <td class="ref-cell">{{ m.reference || '-' }}</td>
              <td :class="['amount-cell', m.type === 'Ingreso' ? 'credit' : 'debit']">{{ formatCurrency(m.amount) }}</td>
              <td>{{ formatCurrency(m.balanceAfter) }}</td>
              <td class="actions-cell">
                <button class="btn view-details" @click="openDetail(m)" :aria-label="`Ver detalle ${m.id}`">👁</button>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="muted">No se encontraron movimientos.</td>
            </tr>
          </tbody>

          <tfoot v-if="filtered.length > 0">
            <tr>
              <td colspan="7">
                <div class="table-footer">
                  <span class="results-count">{{ filtered.length }} resultados totales</span>
                  <div class="pagination" v-if="totalPages > 1">
                    <button class="btn page-nav" @click="prevPage" :disabled="page===1" aria-label="Página anterior">← Anterior</button>
                    <span class="page-info">Página {{ page }} de {{ totalPages }}</span>
                    <button class="btn page-nav" @click="nextPage" :disabled="page===totalPages" aria-label="Página siguiente">Siguiente →</button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>

    <div v-if="showDetail" class="modal-overlay" role="dialog" aria-modal="true" :aria-label="detail ? `Detalle movimiento ${detail.id}` : 'Detalle'">
      <div class="modal">
        <button class="close" @click="closeDetail" title="Cerrar">×</button>
        <div class="modal-header">
          <h3>Detalle del Movimiento</h3>
          <span :class="['type-badge', detail?.type === 'Ingreso' ? 'income' : 'expense']">{{ detail?.type }}</span>
        </div>

        <dl class="detail-list">
          <div class="detail-group">
            <dt>Fecha y hora</dt>
            <dd>{{ detail ? formatDate(detail.date) : '-' }}</dd>
          </div>
          <div class="detail-group">
            <dt>Descripción</dt>
            <dd>{{ detail?.description ?? '-' }}</dd>
          </div>
          <div class="detail-group">
            <dt>Referencia</dt>
            <dd>{{ detail?.reference || '-' }}</dd>
          </div>
          <div class="detail-group amount">
            <dt>Monto</dt>
            <dd :class="detail?.type === 'Ingreso' ? 'credit' : 'debit'">{{ detail ? formatCurrency(detail.amount) : '-' }}</dd>
          </div>
          <div class="detail-group">
            <dt>Saldo resultante</dt>
            <dd>{{ detail ? formatCurrency(detail.balanceAfter) : '-' }}</dd>
          </div>
        </dl>

        <div class="modal-actions">
          <button class="btn close-btn" @click="closeDetail">Cerrar</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

type Movement = {
  id: string
  date: string
  type: 'Ingreso' | 'Egreso'
  description: string
  reference?: string
  amount: number
  balanceAfter: number
}

// mock data generation (latest first)
const all = ref<Movement[]>([])
{
  const seed: Movement[] = []
  let bal = 1250000
  for (let i = 0; i < 64; i++) {
    const isIncome = Math.random() > 0.4
    const amount = Math.round((Math.random() * 500000 + 10000) / 100) * 100
    // use newer dates first
    seed.push({
      id: String(10000 + i),
      date: new Date(Date.now() - i * 86400000).toISOString(),
      type: isIncome ? 'Ingreso' : 'Egreso',
      description: isIncome ? `Cobro por servicio ${i + 1}` : `Pago a proveedor ${i + 1}`,
      reference: `REF-${1000 + i}`,
      amount,
      balanceAfter: 0, // placeholder
    })
  }
  // compute running balance from first (latest) to last
  bal = 1250000
  for (const m of seed) {
    bal += (m.type === 'Ingreso' ? m.amount : -m.amount)
    m.balanceAfter = bal
  }
  all.value = seed
}

const q = ref('')
const from = ref<string | null>(null)
const to = ref<string | null>(null)
const page = ref(1)
const pageSize = ref(10)

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  let list = all.value.slice()
  if (term) {
    list = list.filter(m => (m.description + (m.reference || '')).toLowerCase().includes(term))
  }
  if (from.value) {
    const f = new Date(from.value)
    list = list.filter(m => new Date(m.date) >= f)
  }
  if (to.value) {
    const t = new Date(to.value)
    t.setHours(23,59,59,999)
    list = list.filter(m => new Date(m.date) <= t)
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))

const prevPage = () => { if (page.value > 1) page.value-- }
const nextPage = () => { if (page.value < totalPages.value) page.value++ }

const clearFilters = () => { q.value = ''; from.value = null; to.value = null; page.value = 1 }

const currentBalance = computed(() => all.value.length ? all.value[0].balanceAfter : 0)
const totalIncome = computed(() => filtered.value.filter(m => m.type === 'Ingreso').reduce((s, m) => s + m.amount, 0))
const totalExpense = computed(() => filtered.value.filter(m => m.type === 'Egreso').reduce((s, m) => s + m.amount, 0))

const formatCurrency = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(v)
const formatDate = (iso: string | Date) => {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return isNaN(d.getTime()) ? '-' : d.toLocaleString('es-CO')
}

const updatedAt = new Date().toISOString()

// Details modal
const showDetail = ref(false)
const detail = ref<Movement | null>(null)
const openDetail = (m: Movement) => { detail.value = m; showDetail.value = true }
const closeDetail = () => { showDetail.value = false; detail.value = null }

const exportCSV = () => {
  const rows = [ ['id','date','type','description','reference','amount','balanceAfter'], ...filtered.value.map(m => [m.id, m.date, m.type, m.description, m.reference || '', String(m.amount), String(m.balanceAfter)]) ]
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'movimientos_contables.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// reset pagination when filters change
watch([q, from, to], () => { page.value = 1 })
</script>

<style scoped>
.client-accounting {
  padding: 2rem;
  background: var(--app-bg-primary, #f8fafc);
  min-height: 100vh;
  color: var(--app-text-primary, #1e293b);
}

/* Header Styles */
.dashboard-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  margin: -2rem -2rem 2rem;
  padding: 2rem;
  color: white;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.title-section h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.subtitle {
  margin: 0.5rem 0 0;
  color: #94a3b8;
  font-size: 1.1rem;
}

.period-selector {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 12px;
  min-width: 300px;
}

.period-label {
  display: block;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.date-inputs {
  display: flex;
  gap: 1rem;
}

.input-group {
  flex: 1;
}

.input-group label {
  display: block;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  color: #cbd5e1;
}

.date-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.9rem;
}

/* Financial Summary Cards */
.financial-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #64748b;
}

.period-tag {
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: #f1f5f9;
  color: #64748b;
}

.balance-amount {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 1rem 0;
}

.balance-date {
  font-size: 0.9rem;
  color: #64748b;
}

.amount {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 1rem 0;
}

.amount.positive { color: #10b981; }
.amount.negative { color: #ef4444; }

.movement-count {
  font-size: 0.9rem;
  color: #64748b;
}

/* Transactions Section */
.transactions-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-container {
  position: relative;
}

.search-input {
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 300px;
  font-size: 0.95rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.clear {
  background: #f1f5f9;
  color: #64748b;
}

.btn.export {
  background: #3b82f6;
  color: white;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Table Styles */
.table-container {
  overflow-x: auto;
  margin: 0 -1.5rem;
  padding: 0 1.5rem;
}

.transactions-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.transactions-table th {
  background: #f8fafc;
  padding: 1rem;
  font-weight: 600;
  color: #475569;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.transactions-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

.transactions-table tbody tr:hover {
  background: #f8fafc;
}

.ref-cell {
  font-family: monospace;
  color: #64748b;
}

.amount-cell {
  font-weight: 600;
}

.credit { color: #10b981; }
.debit { color: #ef4444; }

.actions-cell {
  width: 1%;
  white-space: nowrap;
}

.view-details {
  background: transparent;
  color: #64748b;
  padding: 0.4rem;
  border-radius: 6px;
}

.view-details:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.results-count {
  color: #64748b;
  font-size: 0.9rem;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-nav {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.page-info {
  color: #64748b;
  font-size: 0.9rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #0f172a;
}

.type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.type-badge.income {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.type-badge.expense {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.close {
  position: absolute;
  right: 1.5rem;
  top: 1.5rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.detail-list {
  margin: 0;
  padding: 1.5rem;
}

.detail-group {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: baseline;
}

.detail-group dt {
  color: #64748b;
  font-size: 0.9rem;
}

.detail-group dd {
  margin: 0;
  color: #0f172a;
  font-weight: 500;
}

.modal-actions {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  background: #f1f5f9;
  color: #64748b;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 500;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .period-selector {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .client-accounting {
    padding: 1rem;
  }

  .dashboard-header {
    margin: -1rem -1rem 1.5rem;
    padding: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .actions {
    flex-direction: column;
  }

  .search-container {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .table-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .detail-group {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}

/* Utility Classes */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* Accessibility Improvements */
@media (prefers-reduced-motion: reduce) {
  .btn:hover {
    transform: none;
  }
}

:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
