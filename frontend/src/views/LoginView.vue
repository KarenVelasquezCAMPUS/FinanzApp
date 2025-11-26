<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();
const error = ref('');

async function handleSubmit() {
  const success = await authStore.login({ email: email.value, password: password.value });
  if (success) {
    router.push('/dashboard');
  } else {
    error.value = 'Credenciales inválidas';
  }
}
</script>

<template>
  <div class="auth-container">
    <h1>Iniciar Sesión</h1>
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>
      <div class="form-group">
        <label>Contraseña</label>
        <input v-model="password" type="password" required />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit">Ingresar</button>
    </form>
    <p>¿No tienes cuenta? <router-link to="/register">Regístrate</router-link></p>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
button {
  background: #3498db;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #2980b9;
}
.error {
  color: red;
}
</style>
