<template>
  <section class="customers-module">
    <div class="module-header">
      <h2>Clientes</h2>
      <p>Administra la lista de clientes: busca, visualiza, edita o exporta.</p>
      <div class="module-actions">
        <input v-model="q" placeholder="Buscar por nombre, email o teléfono" class="search" />
        <button @click="exportCSV" class="btn export">Exportar CSV</button>
      </div>
    </div>

    <div class="customers-list">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in pagedItems" :key="client.id">
            <td>{{ client.id }}</td>
            <td>{{ client.name }}</td>
            <td>{{ client.email }}</td>
            <td>{{ client.phone }}</td>
            <td>
              <button class="btn small" @click="viewClient(client)">Ver</button>
              <button class="btn small ghost" @click="editClient(client)">Editar</button>
              <button class="btn small danger" @click="removeClient(client.id)">Eliminar</button>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="5" class="muted">No se encontraron clientes.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pager" v-if="totalPages > 1">
      <button @click="prevPage" :disabled="page===1">Anterior</button>
      <span>Página {{ page }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page===totalPages">Siguiente</button>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <button class="close" @click="closeModal">×</button>
        <h3>{{ editing ? 'Editar cliente' : 'Ver cliente' }}</h3>
        <div class="modal-body">
          <label>Nombre</label>
          <input v-model="active.name" :readonly="!editing" />
          <label>Email</label>
          <input v-model="active.email" :readonly="!editing" />
          <label>Teléfono</label>
          <input v-model="active.phone" :readonly="!editing" />
        </div>
        <div class="modal-actions">
          <button v-if="editing" @click="saveEdit" class="btn">Guardar</button>
          <button @click="closeModal" class="btn ghost">Cerrar</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type Client = { id: string; name: string; email: string; phone: string }

// Mock data (in a real app this comes from API)
const items = ref<Client[]>(Array.from({ length: 32 }).map((_, i) => ({
  id: String(1000 + i),
  name: `Cliente ${i + 1}`,
  email: `cliente${i + 1}@ejemplo.com`,
  phone: `+57 300 000 ${String(i + 1).padStart(4, '0')}`
})))

const q = ref('')
const page = ref(1)
const pageSize = ref(8)

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return items.value
  return items.value.filter(c => [c.name, c.email, c.phone].some(f => f.toLowerCase().includes(term)))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const pagedItems = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))

const prevPage = () => { if (page.value > 1) page.value-- }
const nextPage = () => { if (page.value < totalPages.value) page.value++ }

// Modal state
const showModal = ref(false)
const editing = ref(false)
const active = ref<Client>({ id: '', name: '', email: '', phone: '' })

const viewClient = (c: Client) => { active.value = { ...c }; editing.value = false; showModal.value = true }
const editClient = (c: Client) => { active.value = { ...c }; editing.value = true; showModal.value = true }
const closeModal = () => { showModal.value = false; editing.value = false }

const saveEdit = () => {
  const idx = items.value.findIndex(x => x.id === active.value.id)
  if (idx >= 0) items.value[idx] = { ...active.value }
  closeModal()
}

const removeClient = (id: string) => {
  if (!confirm('¿Eliminar cliente? Esta acción es irreversible.')) return
  items.value = items.value.filter(c => c.id !== id)
}

const exportCSV = () => {
  const rows = [ ['id','name','email','phone'], ...filtered.value.map(c => [c.id,c.name,c.email,c.phone]) ]
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'clientes.csv'
  a.click()
  URL.revokeObjectURL(url)
}

</script>

<style scoped>
.customers-module { padding: 18px; background: #fff; border-radius: 8px; box-shadow: 0 6px 20px rgba(2,6,23,0.06); }
.module-header { display:flex; align-items:center; gap:16px; justify-content:space-between }
.module-header p { margin:0; color:#6b7280 }
.module-actions { display:flex; gap:12px; align-items:center }
.search { padding:8px 10px; border-radius:8px; border:1px solid #e6eef6 }
.btn.export { background:#0b3a99; color:white; padding:8px 12px; border-radius:8px; }
.customers-list { margin-top:12px }
.table { width:100%; border-collapse:collapse }
.table th, .table td { padding:10px 12px; border-bottom:1px solid #eef2f7; text-align:left }
.btn.small{ padding:6px 8px; border-radius:6px; margin-right:6px }
.btn.ghost{ background:transparent; border:1px solid #cbd5e1 }
.btn.danger{ background:#ef4444; color:white }
.muted{ color:#9aa6be; text-align:center }
.pager{ display:flex; gap:10px; align-items:center; justify-content:center; margin-top:12px }

.modal-overlay{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(2,6,23,0.45); z-index:2000 }
.modal{ background:white; padding:18px; border-radius:10px; width:520px; max-width:95% }
.modal .close{ position:absolute; right:12px; top:12px; border:none; background:transparent; font-size:22px }
.modal-body{ display:flex; flex-direction:column; gap:8px; margin-top:8px }
.modal-body label{ font-size:13px; color:#374151 }
.modal-body input{ padding:8px 10px; border-radius:8px; border:1px solid #e6eef6 }
.modal-actions{ display:flex; gap:8px; justify-content:flex-end; margin-top:12px }

@media (max-width:720px){ .module-header{ flex-direction:column; align-items:flex-start; gap:10px } }
</style>
