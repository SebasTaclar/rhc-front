<template>
  <div v-if="visible" class="popup-overlay" @click="closePopup">
    <div class="popup-content" @click.stop>
      <button class="close-button" @click="closePopup">✕</button>

      <!-- Image view when image exists -->
      <div v-if="imageSrc" class="image-container">
        <img :src="imageSrc" :alt="`Foto de ${clientName || 'cliente'}`" class="client-image" />
        <div v-if="clientName" class="client-name">{{ clientName }}</div>
      </div>

      <!-- No image view -->
      <div v-else class="no-image-container">
        <div class="no-image-icon">👤</div>
        <h3 class="no-image-title">Sin foto registrada</h3>
        <p class="no-image-message">
          El cliente <strong>{{ clientName || 'seleccionado' }}</strong> no tiene una foto registrada en el sistema.
        </p>
        <p class="no-image-suggestion">
          Puede agregar una foto editando la información del cliente en la sección de Clientes.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps({
  imageSrc: {
    type: String,
    required: false,
  },
  clientName: {
    type: String,
    required: false,
  },
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close']);

const closePopup = () => {
  emit('close');
};
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--overlay-bg, rgba(0, 0, 0, 0.7));
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: var(--backdrop-blur, blur(8px));
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.popup-content {
  background: var(--bg-secondary, white);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  max-width: 90%;
  max-height: 90%;
  min-width: 400px;
  overflow: auto;
  border: 1px solid var(--border-primary, #e0e0e0);
  box-shadow: 0 20px 60px var(--shadow-primary, rgba(0, 0, 0, 0.15));
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: var(--bg-tertiary, #f5f5f5);
  border: 2px solid var(--border-primary, #e0e0e0);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, #666);
  transition: all 0.3s ease;
}

.close-button:hover {
  background: var(--bg-secondary, #e9e9e9);
  border-color: var(--border-secondary, #ccc);
  color: var(--text-primary, #333);
  transform: scale(1.1);
}

/* Image container styles */
.image-container {
  text-align: center;
}

.client-image {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  object-fit: contain;
}

.client-name {
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary, #333);
  text-align: center;
}

/* No image container styles */
.no-image-container {
  text-align: center;
  padding: 2rem 1rem;
  max-width: 450px;
  margin: 0 auto;
}

.no-image-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
  background: var(--bg-tertiary, #f5f5f5);
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  border: 3px solid var(--border-primary, #e0e0e0);
}

.no-image-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #333);
  margin-bottom: 1rem;
}

.no-image-message {
  font-size: 1rem;
  color: var(--text-secondary, #666);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.no-image-message strong {
  color: var(--text-primary, #333);
  font-weight: 600;
}

.no-image-suggestion {
  font-size: 0.9rem;
  color: var(--text-muted, #999);
  line-height: 1.4;
  font-style: italic;
}

/* Responsive design */
@media (max-width: 768px) {
  .popup-content {
    margin: 20px;
    padding: 1.5rem;
    min-width: auto;
    width: calc(100% - 40px);
  }

  .no-image-container {
    padding: 1.5rem 0.5rem;
  }

  .no-image-icon {
    font-size: 3rem;
    width: 100px;
    height: 100px;
    margin-bottom: 1rem;
  }

  .no-image-title {
    font-size: 1.3rem;
  }

  .no-image-message {
    font-size: 0.95rem;
  }

  .no-image-suggestion {
    font-size: 0.85rem;
  }
}

/* Dark theme support */
:root[data-theme='dark'] .popup-overlay,
:root:not([data-theme]) .popup-overlay {
  background: rgba(0, 0, 0, 0.8);
}

:root[data-theme='dark'] .no-image-icon,
:root:not([data-theme]) .no-image-icon {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
}

/* Light theme support */
:root[data-theme='light'] .popup-overlay {
  background: rgba(0, 0, 0, 0.5);
}

:root[data-theme='light'] .no-image-icon {
  background: #f8f9fa;
  border-color: #dee2e6;
}
</style>
