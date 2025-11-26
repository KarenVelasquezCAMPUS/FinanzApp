<script setup lang="ts">
import NavBar from './components/NavBar.vue';
</script>

<template>
  <NavBar />
  <main>
    <router-view />
  </main>
</template>

<style>
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: #f5f6fa;
}
main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
