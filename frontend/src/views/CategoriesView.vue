<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useCategoriesStore } from '../stores/categories';

const categoriesStore = useCategoriesStore();
const newCategoryName = ref('');

onMounted(() => {
  categoriesStore.fetchCategories();
});

async function handleSubmit() {
  if (!newCategoryName.value) return;
  const success = await categoriesStore.createCategory({ name: newCategoryName.value });
  if (success) {
    newCategoryName.value = '';
  }
}

async function handleDelete(id: number) {
  if (confirm('¿Estás seguro de eliminar esta categoría?')) {
    await categoriesStore.deleteCategory(id);
  }
}
</script>

<template>
  <div class="categories-view">
    <h1>Categorías</h1>
    
    <div class="form-card">
      <form @submit.prevent="handleSubmit" class="inline-form">
        <input v-model="newCategoryName" type="text" placeholder="Nueva categoría" required />
        <button type="submit" class="btn-primary">Agregar</button>
      </form>
    </div>

    <div class="list-card">
      <ul>
        <li v-for="category in categoriesStore.categories" :key="category.id">
          <span>{{ category.name }}</span>
          <button @click="handleDelete(category.id)" class="btn-danger">Eliminar</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.categories-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 600px;
  margin: 0 auto;
}
.form-card, .list-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.inline-form {
  display: flex;
  gap: 1rem;
}
input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}
li:last-child { border-bottom: none; }
.btn-primary { background: #3498db; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.btn-danger { background: #c0392b; color: white; padding: 0.25rem 0.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
</style>
