<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useBudgetsStore } from '../stores/budgets';
import { useCategoriesStore } from '../stores/categories';

const budgetsStore = useBudgetsStore();
const categoriesStore = useCategoriesStore();

const newBudget = ref({
  categoryId: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  limit: 0,
});

onMounted(() => {
  budgetsStore.fetchBudgets();
  categoriesStore.fetchCategories();
});

async function handleSubmit() {
  const success = await budgetsStore.createBudget({
    ...newBudget.value,
    categoryId: Number(newBudget.value.categoryId),
    limit: Number(newBudget.value.limit),
  });
  if (success) {
    newBudget.value.limit = 0;
    newBudget.value.categoryId = '';
  }
}

async function handleDelete(id: number) {
  if (confirm('¿Estás seguro de eliminar este presupuesto?')) {
    await budgetsStore.deleteBudget(id);
  }
}
</script>

<template>
  <div class="budgets-view">
    <h1>Presupuestos</h1>

    <div class="form-card">
      <h2>Nuevo Presupuesto</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label>Categoría</label>
            <select v-model="newBudget.categoryId" required>
              <option v-for="cat in categoriesStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Límite Mensual</label>
            <input v-model="newBudget.limit" type="number" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Mes</label>
            <input v-model="newBudget.month" type="number" min="1" max="12" required />
          </div>
          <div class="form-group">
            <label>Año</label>
            <input v-model="newBudget.year" type="number" required />
          </div>
        </div>
        <button type="submit" class="btn-primary">Guardar</button>
      </form>
    </div>

    <div class="list-card">
      <table>
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Mes/Año</th>
            <th>Límite</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="budget in budgetsStore.budgets" :key="budget.id">
            <td>{{ budget.category?.name }}</td>
            <td>{{ budget.month }}/{{ budget.year }}</td>
            <td>{{ budget.limit }}</td>
            <td>
              <button @click="handleDelete(budget.id)" class="btn-danger">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.budgets-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.form-card, .list-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
input, select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.btn-primary { background: #3498db; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.btn-danger { background: #c0392b; color: white; padding: 0.25rem 0.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #eee; }
</style>
