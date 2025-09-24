<template>
  <section aria-label="Servicios (placeholder)">
    <div class="container">
      <h2>Servicios (migrado)</h2>
      <p>Usa <code>ServicesSection.vue</code> en su lugar. Este archivo existe por compatibilidad.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'ServicesPlaceholder' })
// Placeholder to avoid linting errors; real component is ServicesSection.vue
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 24px; }
</style>
