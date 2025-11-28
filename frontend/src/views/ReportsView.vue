<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useMovementsStore } from '../stores/movements';
import { useCategoriesStore } from '../stores/categories';
import { useRouter } from 'vue-router';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);

const movementsStore = useMovementsStore();
const categoriesStore = useCategoriesStore();
const router = useRouter();

onMounted(() => {
  movementsStore.fetchMovements();
  categoriesStore.fetchCategories();
});

function goBack() {
  router.push('/dashboard');
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(value);
}

const totalIncome = computed(() => {
  return movementsStore.movements
    .filter((m: any) => m.type === 'INGRESO')
    .reduce((sum: number, m: any) => sum + Number(m.amount), 0);
});

const totalExpense = computed(() => {
  return movementsStore.movements
    .filter((m: any) => m.type === 'GASTO')
    .reduce((sum: number, m: any) => sum + Number(m.amount), 0);
});

const balance = computed(() => totalIncome.value - totalExpense.value);

const expensesByCategory = computed(() => {
  const expenses = movementsStore.movements.filter((m: any) => m.type === 'GASTO');
  const categories: Record<string, number> = {};

  expenses.forEach((m: any) => {
    const catName = m.category?.name || 'Sin categoría';
    categories[catName] = (categories[catName] || 0) + Number(m.amount);
  });

  return Object.entries(categories)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
});

const incomesByCategory = computed(() => {
  const incomes = movementsStore.movements.filter((m: any) => m.type === 'INGRESO');
  const categories: Record<string, number> = {};

  incomes.forEach((m: any) => {
    const catName = m.category?.name || 'Sin categoría';
    categories[catName] = (categories[catName] || 0) + Number(m.amount);
  });

  return Object.entries(categories)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
});

const recentTransactions = computed(() => {
  return [...movementsStore.movements]
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
});

const getColorForCategory = (index: number) => {
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  return colors[index % colors.length];
};

const getIncomeColorForCategory = (index: number) => {
  const colors = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
  return colors[index % colors.length];
};

const pieChartData = computed(() => {
  if (expensesByCategory.value.length === 0) return null;
  
  return {
    labels: expensesByCategory.value.map(cat => cat.name),
    datasets: [
      {
        data: expensesByCategory.value.map(cat => cat.amount),
        backgroundColor: expensesByCategory.value.map((_, index) => getColorForCategory(index)),
        borderWidth: 0,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 15,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.parsed;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
        },
      },
    },
  },
};
</script>

<template>
  <div class="reports-container">
    <div class="reports-content">
      <!-- Header -->
      <header class="reports-header">
        <button @click="goBack" class="back-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="back-icon">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>
        <h1 class="reports-title">Reportes Financieros</h1>
      </header>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card income-card">
          <div class="card-icon income-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <div class="card-content">
            <p class="card-label">Total Ingresos</p>
            <p class="card-amount income-text">{{ formatCurrency(totalIncome) }}</p>
          </div>
        </div>

        <div class="summary-card expense-card">
          <div class="card-icon expense-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
              <polyline points="17 18 23 18 23 12"/>
            </svg>
          </div>
          <div class="card-content">
            <p class="card-label">Total Gastos</p>
            <p class="card-amount expense-text">{{ formatCurrency(totalExpense) }}</p>
          </div>
        </div>

        <div class="summary-card balance-card">
          <div class="card-icon balance-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="card-content">
            <p class="card-label">Balance</p>
            <p class="card-amount" :class="balance >= 0 ? 'income-text' : 'expense-text'">
              {{ formatCurrency(balance) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Pie Chart -->
        <div class="chart-card pie-chart-card">
          <h2 class="chart-title">Distribución de gastos</h2>
          <div v-if="pieChartData" class="pie-chart-wrapper">
            <Pie :data="pieChartData" :options="chartOptions" />
          </div>
          <div v-else class="empty-chart">
            <p>No hay gastos registrados</p>
          </div>
        </div>

        <!-- Expenses by Category -->
        <div class="chart-card">
          <h2 class="chart-title">Gastos por Categoría</h2>
          <div v-if="expensesByCategory.length > 0" class="category-list">
            <div 
              v-for="(cat, index) in expensesByCategory" 
              :key="cat.name"
              class="category-item"
            >
              <div class="category-info">
                <div class="category-color" :style="{ backgroundColor: getColorForCategory(index) }"></div>
                <span class="category-name">{{ cat.name }}</span>
              </div>
              <div class="category-amount-wrapper">
                <span class="category-amount">{{ formatCurrency(cat.amount) }}</span>
                <span class="category-percentage">
                  {{ ((cat.amount / totalExpense) * 100).toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>
          <div v-else class="empty-chart">
            <p>No hay gastos registrados</p>
          </div>
        </div>
      </div>

      <!-- Income Section -->
      <div class="charts-section" v-if="incomesByCategory.length > 0">
        <div class="chart-card income-section">
          <h2 class="chart-title">Ingresos por Categoría</h2>
          <div class="category-list">
            <div 
              v-for="(cat, index) in incomesByCategory" 
              :key="cat.name"
              class="category-item"
            >
              <div class="category-info">
                <div class="category-color" :style="{ backgroundColor: getIncomeColorForCategory(index) }"></div>
                <span class="category-name">{{ cat.name }}</span>
              </div>
              <div class="category-amount-wrapper">
                <span class="category-amount income-text">{{ formatCurrency(cat.amount) }}</span>
                <span class="category-percentage">
                  {{ ((cat.amount / totalIncome) * 100).toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="chart-card">
          <h2 class="chart-title">Transacciones Recientes</h2>
          <div v-if="recentTransactions.length > 0" class="transactions-list">
            <div 
              v-for="transaction in recentTransactions" 
              :key="transaction.id"
              class="transaction-item"
            >
              <div 
                class="transaction-icon" 
                :class="transaction.type === 'INGRESO' ? 'income-icon-small' : 'expense-icon-small'"
              >
                <svg v-if="transaction.type === 'INGRESO'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                  <polyline points="17 18 23 18 23 12"/>
                </svg>
              </div>
              <div class="transaction-details">
                <p class="transaction-category">{{ transaction.category?.name || transaction.type }}</p>
                <p class="transaction-date">{{ new Date(transaction.date).toLocaleDateString('es-CO') }}</p>
              </div>
              <p 
                class="transaction-amount" 
                :class="transaction.type === 'INGRESO' ? 'income-text' : 'expense-text'"
              >
                {{ transaction.type === 'INGRESO' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
              </p>
            </div>
          </div>
          <div v-else class="empty-chart">
            <p>No hay transacciones</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reports-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #e8eeff 0%, #f0f4ff 50%, #e8eeff 100%);
  padding: 2rem;
  overflow-y: auto;
  box-sizing: border-box;
}

.reports-content {
  max-width: 1200px;
  margin: 0 auto;
}

.reports-header {
  margin-bottom: 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  color: #4b5563;
  font-size: 0.95rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.back-button:hover {
  background: #f9fafb;
  transform: translateX(-4px);
}

.back-icon {
  width: 20px;
  height: 20px;
}

.reports-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

/* Summary Cards */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.income-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.expense-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.balance-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.5rem;
  font-weight: 500;
}

.card-amount {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.income-text {
  color: #10b981;
}

.expense-text {
  color: #ef4444;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.pie-chart-card {
  grid-column: span 1;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1.5rem;
}

/* Pie Chart */
.pie-chart-wrapper {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Category List */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.category-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.category-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
}

.category-amount-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.category-amount {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.category-percentage {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

/* Income Section */
.income-section .category-amount {
  color: #10b981;
}

/* Transactions List */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.transaction-item:hover {
  background: #f1f5f9;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.transaction-icon svg {
  width: 20px;
  height: 20px;
  color: white;
}

.income-icon-small {
  background: linear-gradient(135deg, #10b981, #059669);
}

.expense-icon-small {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.transaction-details {
  flex: 1;
}

.transaction-category {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem;
}

.transaction-date {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
}

.transaction-amount {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

/* Empty State */
.empty-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #94a3b8;
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
