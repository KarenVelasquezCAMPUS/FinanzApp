<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useMovementsStore } from '../stores/movements';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const movementsStore = useMovementsStore();

onMounted(() => {
  movementsStore.fetchMovements();
});

const expensesByCategoryData = computed(() => {
  const expenses = movementsStore.movements.filter((m: any) => m.type === 'GASTO');
  const categories: Record<string, number> = {};

  expenses.forEach((m: any) => {
    const catName = m.category?.name || 'Sin categoría';
    categories[catName] = (categories[catName] || 0) + Number(m.amount);
  });

  return {
    labels: Object.keys(categories),
    datasets: [
      {
        label: 'Gastos por Categoría',
        backgroundColor: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'],
        data: Object.values(categories),
      },
    ],
  };
});

const balanceData = computed(() => {
  const income = movementsStore.movements
    .filter((m: any) => m.type === 'INGRESO')
    .reduce((sum: number, m: any) => sum + Number(m.amount), 0);
  const expense = movementsStore.movements
    .filter((m: any) => m.type === 'GASTO')
    .reduce((sum: number, m: any) => sum + Number(m.amount), 0);

  return {
    labels: ['Ingresos', 'Gastos'],
    datasets: [
      {
        backgroundColor: ['#27ae60', '#c0392b'],
        data: [income, expense],
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>

<template>
  <div class="reports-view">
    <h1>Reportes</h1>

    <div class="charts-container">
      <div class="chart-card">
        <h2>Gastos por Categoría</h2>
        <div class="chart-wrapper">
          <Bar :data="expensesByCategoryData" :options="chartOptions" />
        </div>
      </div>

      <div class="chart-card">
        <h2>Balance General</h2>
        <div class="chart-wrapper">
          <Pie :data="balanceData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reports-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  height: 400px;
  display: flex;
  flex-direction: column;
}
.chart-wrapper {
  flex: 1;
  position: relative;
}
</style>
