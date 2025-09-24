<template>
  <header>
    <nav class="navbar">
      <!-- Logo y marca -->
      <RouterLink class="link-navbar home" to="/" @click="closeMobileMenu">
        <div class="brand-container">
          <div class="logo">
            <div class="logo-image">
              <img src="/images/logo.jpeg" alt="RHC Asesorías Logo" />
            </div>
            <div class="brand-info">
              <div class="brand-title">RHC Asesorías</div>
              <div class="brand-subtitle">Finanzas, Contabilidad y Tributaria</div>
            </div>
          </div>
        </div>
      </RouterLink>

      <!-- Navegación principal -->
      <div class="nav-menu desktop-nav">
        <a href="#inicio" class="nav-link">Inicio</a>
        <a href="#servicios" class="nav-link">Servicios</a>
        <a href="#nosotros" class="nav-link">Nosotros</a>
        <a href="#testimonios" class="nav-link">Testimonios</a>
        <a href="#contacto" class="nav-link">Contacto</a>
      </div>

      <!-- Controles de usuario -->
      <div class="nav-controls desktop-nav">
        <!-- Botón principal de asesoría -->
        <a href="#contacto" class="btn primary-btn">Solicitar Asesoría</a>

        <!-- Controles de login (mantenidos) -->
        <RouterLink v-if="!isLoggedIn" class="btn access-btn" to="/login">Acceder</RouterLink>
        <RouterLink v-if="isLoggedIn && isAdmin" class="btn admin-btn" to="/admin">⚙️ Dinámica</RouterLink>
        <RouterLink v-if="isLoggedIn" class="btn purchases-btn" to="/compras">🧾 Compras</RouterLink>
        <RouterLink v-if="isLoggedIn" @click="logout" class="btn logout-btn" to="/">Cerrar sesión</RouterLink>
        <div v-if="isLoggedIn" class="user-greeting">
          <span>{{ username }}</span>
        </div>
      </div>

      <!-- Menu hamburguesa para mobile -->
      <button class="hamburger-menu" @click="toggleMobileMenu" :class="{ 'active': isMobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Menu mobile desplegable -->
      <div class="mobile-menu" :class="{ 'active': isMobileMenuOpen }">
        <div class="mobile-menu-content">
          <div class="mobile-nav-links">
            <a href="#inicio" class="mobile-link" @click="closeMobileMenu">Inicio</a>
            <a href="#servicios" class="mobile-link" @click="closeMobileMenu">Servicios</a>
            <a href="#nosotros" class="mobile-link" @click="closeMobileMenu">Nosotros</a>
            <a href="#testimonios" class="mobile-link" @click="closeMobileMenu">Testimonios</a>
            <a href="#contacto" class="mobile-link" @click="closeMobileMenu">Contacto</a>
          </div>

          <div class="mobile-controls">
            <a href="#contacto" class="mobile-btn primary-btn" @click="closeMobileMenu">Solicitar Asesoría</a>
            <RouterLink v-if="!isLoggedIn" class="mobile-btn access-btn" to="/login" @click="closeMobileMenu">
              Acceder
            </RouterLink>
            <div v-if="isLoggedIn" class="mobile-user-greeting">
              <span>Hola, {{ username }}</span>
            </div>
            <RouterLink v-if="isLoggedIn && isAdmin" class="mobile-btn admin-btn" to="/admin" @click="closeMobileMenu">
              ⚙️ Dinámica
            </RouterLink>
            <RouterLink v-if="isLoggedIn" class="mobile-btn purchases-btn" to="/compras" @click="closeMobileMenu">
              🧾 Compras
            </RouterLink>
            <RouterLink v-if="isLoggedIn" @click="logout; closeMobileMenu()" class="mobile-btn logout-btn" to="/">
              Cerrar sesión
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <RouterView />

  <!-- Botones flotantes de redes sociales (SocialFloating removed to avoid duplicate WhatsApp button) -->
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { authService } from '@/services/api';
import { onMounted, ref, watch, computed } from 'vue';
import router from './router';
// SocialFloating intentionally not used (duplicate WhatsApp button removed)

const isLoggedIn = ref(false);
const username = ref('');
const isMobileMenuOpen = ref(false);

// Verificar si el usuario es administrador
const isAdmin = computed(() => authService.isAdmin());

// Funciones para el menú hamburguesa
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const checkAuthStatus = () => {
  isLoggedIn.value = authService.isAuthenticated();
  if (isLoggedIn.value) {
    const currentUser = authService.getCurrentUser();
    username.value = currentUser?.name || '';
  } else {
    username.value = '';
  }
};

const logout = () => {
  authService.logout();
  isLoggedIn.value = false;
  username.value = '';
  router.push('/');
};

onMounted(() => {
  checkAuthStatus();
});

const route = useRoute();
watch(route, () => {
  checkAuthStatus();
});
</script>

<style scoped>
.navbar {
  background-color: #ffffff;
  margin: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  height: 80px;
  padding: 0 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e5e7eb;
}

/* Logo y marca */
.brand-container {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-image {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.brand-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
  margin: 0;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  line-height: 1;
  margin: 0;
  white-space: nowrap;
}

/* Navegación principal */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-left: auto;
  margin-right: 2rem;
}

.nav-link {
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.05);
}

/* Controles de usuario */
.nav-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.primary-btn {
  background-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.primary-btn:hover {
  background-color: #2563eb;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.access-btn {
  background: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
}

.access-btn:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
  color: #1f2937;
}

.logout-btn {
  background: rgba(248, 113, 113, 0.1);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.logout-btn:hover {
  background: rgba(248, 113, 113, 0.2);
  border-color: rgba(248, 113, 113, 0.5);
  transform: translateY(-1px);
}

.admin-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(139, 92, 246, 0.3);
}

.admin-btn:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.5);
  transform: translateY(-2px);
}

.purchases-btn {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(96, 165, 250, 0.3);
}

.purchases-btn:hover {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 15px rgba(96, 165, 250, 0.5);
  transform: translateY(-2px);
}

.user-greeting {
  color: #374151;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

/* Menu hamburguesa */
.hamburger-menu {
  display: none;
  flex-direction: column;
  width: 30px;
  height: 30px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  justify-content: space-around;
  align-items: center;
  z-index: 1001;
}

.hamburger-menu span {
  display: block;
  height: 3px;
  width: 100%;
  background-color: #374151;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.hamburger-menu.active span:nth-child(1) {
  transform: rotate(45deg) translate(8px, 8px);
}

.hamburger-menu.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-menu.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Menu mobile */
.mobile-menu {
  display: none;
  position: fixed;
  top: 80px;
  left: 0;
  width: 100%;
  height: calc(100vh - 80px);
  background-color: #ffffff;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 999;
  overflow-y: auto;
  border-top: 1px solid #e5e7eb;
}

.mobile-menu.active {
  transform: translateX(0);
}

.mobile-menu-content {
  padding: 2rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mobile-link {
  color: #374151;
  text-decoration: none;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-align: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.mobile-link:hover {
  background: rgba(59, 130, 246, 0.05);
  color: #3b82f6;
  border-color: #3b82f6;
}

.mobile-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e5e7eb;
}

.mobile-btn {
  padding: 0.875rem 1.25rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  text-align: center;
  transition: all 0.2s ease;
  border: none;
}

.mobile-btn.primary-btn {
  background-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mobile-btn.primary-btn:hover {
  background-color: #2563eb;
}

.mobile-btn.access-btn {
  background: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
}

.mobile-btn.access-btn:hover {
  background-color: #f9fafb;
}

.mobile-btn.logout-btn {
  background: rgba(248, 113, 113, 0.1);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.mobile-btn.admin-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
}

.mobile-btn.purchases-btn {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(96, 165, 250, 0.3);
}

.mobile-user-greeting {
  color: #374151;
  text-align: center;
  padding: 1rem 1.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    height: 70px;
    padding: 0 1.25rem;
  }

  .desktop-nav {
    display: none;
  }

  .hamburger-menu {
    display: flex;
  }

  .mobile-menu {
    display: block;
    top: 70px;
    height: calc(100vh - 70px);
  }

  .brand-title {
    font-size: 1.125rem;
  }

  .brand-subtitle {
    font-size: 0.7rem;
  }

  .logo-image {
    width: 44px;
    height: 44px;
  }

  .logo-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0 1rem;
  }

  .logo {
    gap: 0.5rem;
  }

  .brand-title {
    font-size: 1rem;
  }

  .brand-subtitle {
    font-size: 0.65rem;
  }

  .logo-image {
    width: 40px;
    height: 40px;
  }

  .logo-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
}

/* Quitar subrayado del link principal */
.link-navbar {
  text-decoration: none !important;
}

.link-navbar:hover {
  text-decoration: none !important;
}
</style>
