<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
  >
    <div class="toggle-container">
      <div class="toggle-slider" :class="{ 'dark': isDark }">
        <div class="toggle-icon">
          <span v-if="isDark" class="icon">🌙</span>
          <span v-else class="icon">☀️</span>
        </div>
      </div>
    </div>
  </button>

</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const isDark = ref(false) // Default to light mode

const toggleTheme = () => {
 isDark.value = !isDark.value
 updateTheme()
}

const updateTheme = () => {
 const root = document.documentElement

 if (isDark.value) {
  root.setAttribute('data-theme', 'dark')
  localStorage.setItem('theme', 'dark')
 } else {
  root.setAttribute('data-theme', 'light')
  localStorage.setItem('theme', 'light')
 }
}

// Load saved theme on component mount
onMounted(() => {
 const savedTheme = localStorage.getItem('theme')
 if (savedTheme) {
  isDark.value = savedTheme === 'dark'
 } else {
  // Check system preference if no saved theme
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = prefersDark
 }
 updateTheme()
})

// Watch for changes and update theme
watch(isDark, () => {
 updateTheme()
}, { immediate: true })
</script>

<style scoped>
.theme-toggle {
 background: none;
 border: none;
 cursor: pointer;
 padding: 8px;
 border-radius: 12px;
 transition: all 0.3s ease;
 display: flex;
 align-items: center;
 justify-content: center;
}

.theme-toggle:hover {
 background: rgba(255, 255, 255, 0.1);
 transform: scale(1.05);
}

.toggle-container {
 position: relative;
 width: 60px;
 height: 30px;
 background: rgba(255, 255, 255, 0.2);
 border-radius: 15px;
 border: 2px solid rgba(255, 255, 255, 0.3);
 transition: all 0.3s ease;
 backdrop-filter: blur(10px);
}

.toggle-slider {
 position: absolute;
 top: 2px;
 left: 2px;
 width: 22px;
 height: 22px;
 background: var(--primary-gradient);
 border-radius: 50%;
 transition: all 0.3s ease;
 display: flex;
 align-items: center;
 justify-content: center;
 box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.toggle-slider.dark {
 transform: translateX(28px);
}

.toggle-icon {
 display: flex;
 align-items: center;
 justify-content: center;
}

.icon {
 font-size: 12px;
 filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

/* Light theme adjustments */
[data-theme="light"] .theme-toggle .toggle-container {
 background: rgba(0, 0, 0, 0.1);
 border-color: rgba(0, 0, 0, 0.2);
}

[data-theme="light"] .theme-toggle:hover {
 background: rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
 .toggle-container {
  width: 50px;
  height: 26px;
 }

 .toggle-slider {
  width: 20px;
  height: 20px;
 }

 .toggle-slider.dark {
  transform: translateX(22px);
 }

 .icon {
  font-size: 10px;
 }
}
</style>
