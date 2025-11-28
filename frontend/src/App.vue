<script setup lang="ts">
import { useRoute } from 'vue-router';
import NavBar from './components/NavBar.vue';
import { computed } from 'vue';

const route = useRoute();
const showNavBar = computed(() => {
  const noNavRoutes = ['/', '/login', '/register'];
  return !noNavRoutes.includes(route.path);
});
</script>

<template>
  <NavBar v-if="showNavBar" />
  <main :class="{ 'with-nav': showNavBar, 'full-screen': !showNavBar }">
    <router-view />
  </main>
</template>

<style>
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: #f5f6fa;
}
main.with-nav {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
main.full-screen {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100vh;
}
</style>
