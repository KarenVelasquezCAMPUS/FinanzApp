<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useMovementsStore } from '../stores/movements';

const authStore = useAuthStore();
const movementsStore = useMovementsStore();
const currentDate = new Date();
const currentMonth = ref(currentDate.getMonth() + 1);
const currentYear = ref(currentDate.getFullYear());

onMounted(() => {
  movementsStore.fetchMonthlySummary(currentMonth.value, currentYear.value);
});

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
}
</script>

<template>
  <div class="dashboard">
    <h1>Bienvenido, {{ authStore.user?.name }}</h1>
    
    <div class="summary-cards">
      <div class="card income">
        <h3>Ingresos</h3>
        <p>{{ formatCurrency(movementsStore.summary.income) }}</p>
      </div>
      <div class="card expense">
        <h3>Gastos</h3>
        <p>{{ formatCurrency(movementsStore.summary.expense) }}</p>
      </div>
      <div class="card balance">
        <h3>Balance</h3>
        <p>{{ formatCurrency(movementsStore.summary.balance) }}</p>
      </div>
    </div>

    <div class="recent-movements">
      <h2>Movimientos Recientes</h2>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Categoría</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movement in movementsStore.summary.movements.slice(0, 5)" :key="movement.id">
            <td>{{ new Date(movement.date).toLocaleDateString() }}</td>
            <td>{{ movement.type }}</td>
            <td>{{ movement.category?.name || 'Sin categoría' }}</td>
            <td :class="movement.type === 'INGRESO' ? 'text-green' : 'text-red'">
              {{ formatCurrency(movement.amount) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.card {
  padding: 1.5rem;
  border-radius: 8px;
  color: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.card.income { background-color: #27ae60; }
.card.expense { background-color: #c0392b; }
.card.balance { background-color: #2980b9; }
.card h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
.card p { margin: 0; font-size: 1.8rem; font-weight: bold; }

.recent-movements {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th, td {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}
.text-green { color: #27ae60; font-weight: bold; }
.text-red { color: #c0392b; font-weight: bold; }
</style>
