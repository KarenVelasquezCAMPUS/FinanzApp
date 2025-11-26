<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMovementsStore } from '../stores/movements';
import { useCategoriesStore } from '../stores/categories';

const movementsStore = useMovementsStore();
const categoriesStore = useCategoriesStore();

const showForm = ref(false);
const newMovement = ref({
  type: 'GASTO',
  amount: 0,
  categoryId: '',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'Efectivo',
  note: '',
});

onMounted(() => {
  movementsStore.fetchMovements();
  categoriesStore.fetchCategories();
});

async function handleSubmit() {
  const success = await movementsStore.createMovement({
    ...newMovement.value,
    categoryId: newMovement.value.categoryId ? Number(newMovement.value.categoryId) : undefined,
    amount: Number(newMovement.value.amount),
  });
  if (success) {
    showForm.value = false;
    newMovement.value = {
      type: 'GASTO',
      amount: 0,
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Efectivo',
      note: '',
    };
  }
}

async function handleDelete(id: number) {
  if (confirm('¿Estás seguro de eliminar este movimiento?')) {
    await movementsStore.deleteMovement(id);
  }
}
</script>

<template>
  <div class="movements-view">
    <div class="header">
      <h1>Movimientos</h1>
      <button @click="showForm = !showForm" class="btn-primary">
        {{ showForm ? 'Cancelar' : 'Nuevo Movimiento' }}
      </button>
    </div>

    <div v-if="showForm" class="form-card">
      <h2>Registrar Movimiento</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label>Tipo</label>
            <select v-model="newMovement.type">
              <option value="INGRESO">Ingreso</option>
              <option value="GASTO">Gasto</option>
            </select>
          </div>
          <div class="form-group">
            <label>Monto</label>
            <input v-model="newMovement.amount" type="number" step="0.01" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Categoría</label>
            <select v-model="newMovement.categoryId">
              <option value="">Sin categoría</option>
              <option v-for="cat in categoriesStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Fecha</label>
            <input v-model="newMovement.date" type="date" required />
          </div>
        </div>
        <div class="form-group">
          <label>Método de Pago</label>
          <input v-model="newMovement.paymentMethod" type="text" required />
        </div>
        <div class="form-group">
          <label>Nota</label>
          <input v-model="newMovement.note" type="text" />
        </div>
        <button type="submit" class="btn-success">Guardar</button>
      </form>
    </div>

    <div class="list-card">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Categoría</th>
            <th>Monto</th>
            <th>Nota</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movement in movementsStore.movements" :key="movement.id">
            <td>{{ new Date(movement.date).toLocaleDateString() }}</td>
            <td>{{ movement.type }}</td>
            <td>{{ movement.category?.name || '-' }}</td>
            <td :class="movement.type === 'INGRESO' ? 'text-green' : 'text-red'">
              {{ movement.amount }}
            </td>
            <td>{{ movement.note }}</td>
            <td>
              <button @click="handleDelete(movement.id)" class="btn-danger">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.movements-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}
.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
input, select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.btn-primary { background: #3498db; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.btn-success { background: #27ae60; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.btn-danger { background: #c0392b; color: white; padding: 0.25rem 0.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #eee; }
.text-green { color: #27ae60; }
.text-red { color: #c0392b; }
</style>
