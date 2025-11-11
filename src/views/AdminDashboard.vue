<template>
  <div class="admin-dashboard">
    <div class="dashboard-container">
      <!-- Pestañas de navegación -->
      <div class="tabs">
        <button
          @click="activeTab = 'teams'"
          class="tab"
          :class="{ active: activeTab === 'teams' }"
        >
          👥 Gestión de Equipos
        </button>
        <button
          @click="activeTab = 'employees'"
          class="tab"
          :class="{ active: activeTab === 'employees' }"
        >
          🧑‍💼 Empleados
        </button>
        <button
          @click="activeTab = 'clients'"
          class="tab"
          :class="{ active: activeTab === 'clients' }"
        >
          🏢 Clientes
        </button>
        <button
          @click="activeTab = 'taskTypes'"
          class="tab"
          :class="{ active: activeTab === 'taskTypes' }"
        >
          📋 Tipos de Tarea
        </button>
        <button
          v-if="canViewTokens"
          @click="activeTab = 'clientTokens'"
          class="tab"
          :class="{ active: activeTab === 'clientTokens' }"
        >
          🔐 Tokens de Cliente
        </button>
      </div>

      <!-- Contenido según la pestaña activa -->
      <div class="tab-content">
        <TeamManagementBoard v-if="activeTab === 'teams'" />
        <EmployeeManagement v-if="activeTab === 'employees'" />
        <ClientManagement v-if="activeTab === 'clients'" />
        <TaskTypeManagement v-if="activeTab === 'taskTypes'" />
        <ClientTokenManagement v-if="activeTab === 'clientTokens' && canViewTokens" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/api/authService'
import { useAuth } from '@/composables/useAuth'
import TeamManagementBoard from '@/components/TeamManagementBoard.vue'
import EmployeeManagement from '@/components/EmployeeManagement.vue'
import ClientManagement from '@/components/ClientManagement.vue'
import TaskTypeManagement from '@/components/TaskTypeManagement.vue'
import ClientTokenManagement from '@/components/ClientTokenManagement.vue'

const router = useRouter()
const { canViewTokens } = useAuth()
const activeTab = ref<'teams' | 'employees' | 'clients' | 'taskTypes' | 'clientTokens'>('teams')

// Admin guard - Permitir admin y empleados
if (!authService.canAccessAdmin()) {
  router.push('/')
}
</script>

<style scoped>
.admin-dashboard {
  padding: 3rem 0;
  min-height: 100vh;
  background: #f8fafc;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 5rem 1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
}

.tab {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab:hover {
  color: #2563eb;
  background: #f8fafc;
}

.tab.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  background: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.tab-content {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .tabs {
    overflow-x: auto;
  }

  .tab {
    white-space: nowrap;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
}
</style>
