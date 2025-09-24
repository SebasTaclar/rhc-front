<template>
  <div class="admin-dashboard">
    <div class="dashboard-container">
      <CustomersModule />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { authService } from '@/services/api/authService'
import CustomersModule from '@/components/CustomersModule.vue'

const router = useRouter()

// Admin guard
if (!authService.isAdmin()) {
  router.push('/')
}
</script>

<style scoped>
.admin-dashboard { padding: 3rem 0; }
.dashboard-container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
</style>
