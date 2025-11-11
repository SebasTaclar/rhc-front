<template>
  <div class="rhc-access-view">
    <div class="access-container">
      <!-- Header profesional -->
      <div class="access-header">
        <div class="header-content">
          <div class="header-info">
            <div class="header-icon">⚙️</div>
            <div class="header-text">
              <h1 class="header-title">Panel de Administración RHC</h1>
              <p class="header-subtitle">Sistema de gestión completo para RHC Asesorías</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs de navegación -->
      <div class="tabs-container">
        <div class="tabs">
          <button
            @click="activeTab = 'teams'"
            class="tab"
            :class="{ active: activeTab === 'teams' }"
          >
            <span class="tab-icon">👥</span>
            <span class="tab-label">Equipos</span>
          </button>
          <button
            @click="activeTab = 'employees'"
            class="tab"
            :class="{ active: activeTab === 'employees' }"
          >
            <span class="tab-icon">🧑‍💼</span>
            <span class="tab-label">Empleados</span>
          </button>
          <button
            @click="activeTab = 'clients'"
            class="tab"
            :class="{ active: activeTab === 'clients' }"
          >
            <span class="tab-icon">🏢</span>
            <span class="tab-label">Clientes</span>
          </button>
          <button
            @click="activeTab = 'taskTypes'"
            class="tab"
            :class="{ active: activeTab === 'taskTypes' }"
          >
            <span class="tab-icon">📋</span>
            <span class="tab-label">Tipos de Tarea</span>
          </button>
          <button
            @click="activeTab = 'clientTokens'"
            class="tab"
            :class="{ active: activeTab === 'clientTokens' }"
          >
            <span class="tab-icon">🔐</span>
            <span class="tab-label">Tokens</span>
          </button>
          <button
            @click="activeTab = 'events'"
            class="tab"
            :class="{ active: activeTab === 'events' }"
          >
            <span class="tab-icon">📅</span>
            <span class="tab-label">Eventos</span>
          </button>
        </div>
      </div>

      <!-- Contenido según pestaña activa -->
      <div class="tab-content">
        <TeamManagementBoard v-if="activeTab === 'teams'" />
        <EmployeeManagement v-if="activeTab === 'employees'" />
        <ClientManagement v-if="activeTab === 'clients'" />
        <TaskTypeManagement v-if="activeTab === 'taskTypes'" />
        <ClientTokenManagement v-if="activeTab === 'clientTokens'" />
        <EventManagement v-if="activeTab === 'events'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/api/authService'
import TeamManagementBoard from '@/components/TeamManagementBoard.vue'
import EmployeeManagement from '@/components/EmployeeManagement.vue'
import ClientManagement from '@/components/ClientManagement.vue'
import TaskTypeManagement from '@/components/TaskTypeManagement.vue'
import ClientTokenManagement from '@/components/ClientTokenManagement.vue'
import EventManagement from '@/components/EventManagement.vue'

defineOptions({
  name: 'RHCAccessView'
})

const router = useRouter()
const activeTab = ref<'teams' | 'employees' | 'clients' | 'taskTypes' | 'clientTokens' | 'events'>('teams')

// Admin guard
if (!authService.isAdmin()) {
  router.push('/')
}
</script>

<style scoped>
.rhc-access-view {
  min-height: 100vh;
  background: #f8fafc;
}

.access-container {
  max-width: 1600px;
  margin: 0 auto;
}

/* Header */
.access-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  padding-top: 6rem;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  font-size: 3.5rem;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.header-subtitle {
  font-size: 1rem;
  margin: 0;
  opacity: 0.95;
}

/* Tabs Container */
.tabs-container {
  background: white;
  border-bottom: 2px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.tabs {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 0.5rem;
  padding: 0 2rem;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.tabs::-webkit-scrollbar {
  height: 4px;
}

.tabs::-webkit-scrollbar-track {
  background: transparent;
}

.tabs::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.tab {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
  position: relative;
}

.tab::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transition: transform 0.2s;
}

.tab:hover {
  color: #667eea;
  background: #f8fafc;
}

.tab:hover::before {
  transform: scaleX(0.5);
}

.tab.active {
  color: #667eea;
  background: #f8fafc;
}

.tab.active::before {
  transform: scaleX(1);
}

.tab-icon {
  font-size: 1.3rem;
}

.tab-label {
  font-weight: 600;
}

/* Tab Content */
.tab-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
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

/* Responsive */
@media (max-width: 1024px) {
  .header-title {
    font-size: 1.5rem;
  }

  .header-subtitle {
    font-size: 0.9rem;
  }

  .header-icon {
    font-size: 2.5rem;
  }

  .tabs {
    padding: 0 1rem;
  }

  .tab-content {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .access-header {
    padding: 1.5rem 1rem;
  }

  .header-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .header-title {
    font-size: 1.3rem;
  }

  .header-subtitle {
    font-size: 0.85rem;
  }

  .tabs {
    gap: 0.25rem;
    padding: 0 0.5rem;
  }

  .tab {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .tab-icon {
    font-size: 1.1rem;
  }

  .tab-label {
    display: none;
  }

  .tab-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .header-icon {
    font-size: 2rem;
  }

  .tab {
    padding: 0.75rem 0.75rem;
  }
}
</style>
