<template>
  <div class="admin-dashboard">
    <div class="dashboard-container">
      <TeamManagementBoard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { authService } from '@/services/api/authService'
import TeamManagementBoard from '@/components/TeamManagementBoard.vue'

const router = useRouter()

// Admin guard
if (!authService.isAdmin()) {
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
  padding: 0 1rem;
}
</style>
