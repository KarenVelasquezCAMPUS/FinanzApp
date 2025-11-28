<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const authStore = useAuthStore();
const router = useRouter();
const error = ref("");

function goBack() {
  router.push("/");
}

function goToLogin() {
  router.push("/login");
}

async function handleSubmit() {
  error.value = "";

  if (
    !name.value ||
    !email.value ||
    !password.value ||
    !confirmPassword.value
  ) {
    error.value = "Todos los campos son obligatorios";
    return;
  }

  if (!email.value.includes("@")) {
    error.value = "Ingresa un correo válido";
    return;
  }

  if (password.value.length < 6) {
    error.value = "La contraseña debe tener mínimo 6 caracteres";
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = "Las contraseñas no coinciden";
    return;
  }

  const success = await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
  });
  if (success) {
    router.push("/login");
  } else {
    error.value = "Error al registrarse";
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Botón Volver -->
      <button @click="goBack" class="back-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="back-icon"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      <!-- Título y subtítulo -->
      <h2 class="register-title">Crear cuenta</h2>
      <p class="register-subtitle">Completa tus datos para registrarte</p>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="register-form">
        <!-- Nombre completo -->
        <div class="form-group">
          <label class="form-label">Nombre completo</label>
          <div class="input-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="input-icon"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              v-model="name"
              type="text"
              placeholder="Ingresa tu nombre"
              class="form-input"
            />
          </div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label class="form-label">Correo electrónico</label>
          <div class="input-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="input-icon"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              class="form-input"
            />
          </div>
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <div class="input-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="input-icon"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              v-model="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              class="form-input"
            />
          </div>
        </div>

        <!-- Confirmar Contraseña -->
        <div class="form-group">
          <label class="form-label">Confirmar contraseña</label>
          <div class="input-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="input-icon"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              class="form-input"
            />
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Botón Submit -->
        <button type="submit" class="submit-button">Crear cuenta</button>
      </form>

      <!-- Link a login -->
      <p class="login-link">
        ¿Ya tienes cuenta?
        <button @click="goToLogin" class="link-button">Inicia sesión</button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-container {
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
  overflow-y: auto;
}

.register-card {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem 2.5rem;
  max-width: 420px;
  width: 100%;
  margin: auto;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #4b5563;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1.5rem;
  transition: color 0.2s;
}

.back-button:hover {
  color: #1f2937;
}

.back-icon {
  width: 20px;
  height: 20px;
}

.register-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 0.5rem;
}

.register-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 1.5rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  width: 20px;
  height: 20px;
  color: #9ca3af;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #1f2937;
  background-color: white;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  background-color: white;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.submit-button {
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

.submit-button:hover {
  background: linear-gradient(to right, #4338ca, #4f46e5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.login-link {
  text-align: center;
  color: #6b7280;
  margin-top: 1.5rem;
  font-size: 0.95rem;
}

.link-button {
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
}

.link-button:hover {
  text-decoration: underline;
}
</style>
