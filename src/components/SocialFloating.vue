<template>
  <div class="floating-social">
    <a
      href="https://wa.me/+573118715539"
      target="_blank"
      rel="noopener"
      class="social-btn whatsapp"
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
        alt="WhatsApp"
        class="social-icon"
      >
      <span class="social-tooltip">WhatsApp</span>
    </a>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'SocialFloating'
})
</script>

<style scoped>
.floating-social {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 1000;
}

.social-btn {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.4s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  opacity: 0.4;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.social-btn:hover {
  opacity: 1 !important;
  transform: scale(1.2);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.social-btn.facebook:hover {
  background: rgba(24, 119, 242, 1);
  box-shadow: 0 8px 30px rgba(24, 119, 242, 0.6);
  border-color: rgba(24, 119, 242, 0.8);
}

.social-btn.instagram:hover {
  background: linear-gradient(45deg, rgba(228, 64, 95, 1), rgba(252, 175, 69, 1));
  box-shadow: 0 8px 30px rgba(228, 64, 95, 0.6);
  border-color: rgba(228, 64, 95, 0.8);
}

.social-btn.whatsapp:hover {
  background: rgba(37, 211, 102, 1);
  box-shadow: 0 8px 30px rgba(37, 211, 102, 0.6);
  border-color: rgba(37, 211, 102, 0.8);
}

.social-icon {
  width: 32px;
  height: 32px;
  transition: all 0.4s ease;
  opacity: 0.3;
  filter: grayscale(100%) brightness(1.2);
}

.social-btn:hover .social-icon {
  transform: scale(1.3);
  opacity: 1 !important;
  filter: grayscale(0%) brightness(1) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.social-tooltip {
  position: absolute;
  right: 70px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.social-tooltip::after {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-left-color: rgba(0, 0, 0, 0.8);
}

.social-btn:hover .social-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) translateX(-5px);
}

/* Animación de entrada */
.social-btn {
  animation: slideInRight 0.6s ease;
  animation-fill-mode: both;
}

.social-btn:nth-child(1) {
  animation-delay: 0.1s;
}

.social-btn:nth-child(2) {
  animation-delay: 0.2s;
}

.social-btn:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes slideInRight {
  from {
    transform: translateX(100px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 0.4;
  }
}

/* Responsivo */
@media (max-width: 768px) {
  .floating-social {
    bottom: 15px;
    right: 15px;
    gap: 12px;
  }

  .social-btn {
    width: 50px;
    height: 50px;
  }

  .social-icon {
    width: 26px;
    height: 26px;
  }

  .social-tooltip {
    right: 60px;
    font-size: 12px;
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .floating-social {
    bottom: 10px;
    right: 10px;
    gap: 10px;
  }

  .social-btn {
    width: 45px;
    height: 45px;
  }

  .social-icon {
    width: 24px;
    height: 24px;
  }
}
</style>
