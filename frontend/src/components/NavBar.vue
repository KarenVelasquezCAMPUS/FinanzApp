<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

function logout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <nav v-if="authStore.isAuthenticated" class="navbar">
    <div class="container">
      <router-link to="/dashboard" class="brand">FinanzApp</router-link>
      <div class="links">
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/movimientos">Movimientos</router-link>
        <router-link to="/categorias">Categorías</router-link>
        <router-link to="/presupuestos">Presupuestos</router-link>
        <router-link to="/reportes">Reportes</router-link>
        <button @click="logout" class="logout-btn">Salir</button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: #2c3e50;
  padding: 1rem;
  color: white;
}
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}
.brand {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: white;
}
.links {
  display: flex;
  gap: 1rem;
}
.links a {
  color: #ecf0f1;
  text-decoration: none;
}
.links a.router-link-active {
  font-weight: bold;
  color: #3498db;
}
.logout-btn {
  background: none;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}
.logout-btn:hover {
  background: #e74c3c;
  color: white;
}
</style>
