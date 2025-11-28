<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function goToLogin() {
  router.push("/login");
}

function goToRegister() {
  router.push("/register");
}
</script>

<template>
  <div class="welcome-container">
    <div class="welcome-card">
      <!-- Icono de billetera -->
      <div class="icon-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="wallet-icon"
        >
          <path
            d="M2.273 5.625A4.483 4.483 0 015.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 3H5.25a3 3 0 00-2.977 2.625zM2.273 8.625A4.483 4.483 0 015.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 6H5.25a3 3 0 00-2.977 2.625zM5.25 9a3 3 0 00-3 3v6a3 3 0 003 3h13.5a3 3 0 003-3v-6a3 3 0 00-3-3H15a.75.75 0 00-.75.75 2.25 2.25 0 01-4.5 0A.75.75 0 009 9H5.25z"
          />
        </svg>
      </div>

      <!-- Título y subtítulo -->
      <h1 class="app-title">FinanzApp</h1>
      <p class="app-subtitle">Tu gestor de finanzas personales</p>

      <!-- Botones -->
      <div class="button-group">
        <button @click="goToLogin" class="btn-primary">Iniciar sesión</button>
        <button @click="goToRegister" class="btn-secondary">Registrarse</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #e8eeff 0%, #f0f4ff 50%, #e8eeff 100%);
  box-sizing: border-box;
}

.welcome-card {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem 2.5rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.icon-container {
  width: 80px;
  height: 80px;
  background: #4f46e5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.wallet-icon {
  width: 40px;
  height: 40px;
  color: #fbbf24;
}

.app-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem;
}

.app-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 2rem;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-primary {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(to right, #4f46e5, #6366f1);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: linear-gradient(to right, #4338ca, #4f46e5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.btn-secondary {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: white;
  color: #4f46e5;
  border: 2px solid #4f46e5;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #f5f3ff;
  transform: translateY(-1px);
}
</style>
