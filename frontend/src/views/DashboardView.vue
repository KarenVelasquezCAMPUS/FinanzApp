<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useMovementsStore } from '../stores/movements';
import { useRouter } from 'vue-router';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);

const authStore = useAuthStore();
const movementsStore = useMovementsStore();
const router = useRouter();
const currentDate = new Date();
const currentMonth = ref(currentDate.getMonth() + 1);
const currentYear = ref(currentDate.getFullYear());

onMounted(() => {
  movementsStore.fetchMonthlySummary(currentMonth.value, currentYear.value);
  movementsStore.fetchMovements();
});

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(value);
}

function logout() {
  authStore.logout();
}

const recentTransactions = computed(() => {
  return [...movementsStore.summary.movements]
    .sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || a.date).getTime();
      const dateB = new Date(b.createdAt || b.date).getTime();
      return dateB - dateA; // Más reciente primero
    })
    .slice(0, 3)
    .map(m => ({
      ...m,
      displayType: m.type === 'INGRESO' ? 'income' : 'expense',
      displayDate: new Date(m.date).toLocaleDateString('es-CO')
    }));
});

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

const getColorForCategory = (index: number) => {
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
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
  <div class="dashboard-container">
    <div class="dashboard-content">
      <!-- Header -->
      <header class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Dashboard</h1>
          <p class="dashboard-subtitle">Bienvenido, {{ authStore.user?.name || 'Usuario' }}</p>
        </div>
        <button @click="logout" class="logout-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logout-icon">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Salir
        </button>
      </header>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card income-card">
          <div class="card-header">
            <span class="card-title">Ingresos del mes</span>
            <div class="card-icon income-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
          </div>
          <p class="card-amount income-amount">{{ formatCurrency(movementsStore.summary.income) }}</p>
        </div>

        <div class="summary-card expense-card">
          <div class="card-header">
            <span class="card-title">Gastos del mes</span>
            <div class="card-icon expense-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                <polyline points="17 18 23 18 23 12"/>
              </svg>
            </div>
          </div>
          <p class="card-amount expense-amount">{{ formatCurrency(movementsStore.summary.expense) }}</p>
        </div>

        <div class="summary-card balance-card">
          <div class="card-header">
            <span class="card-title">Saldo disponible</span>
            <div class="card-icon balance-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
          </div>
          <p class="card-amount balance-amount">{{ formatCurrency(movementsStore.summary.balance) }}</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h2 class="section-title">Accesos rápidos</h2>
        <div class="actions-grid">
          <button @click="router.push('/movimientos')" class="action-card movements-action">
            <div class="action-icon movements-bg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <span class="action-label">Registrar movimiento</span>
          </button>

          <button @click="router.push('/reportes')" class="action-card reports-action">
            <div class="action-icon reports-bg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
              </svg>
            </div>
            <span class="action-label">Ver reportes</span>
          </button>

          <button @click="router.push('/presupuestos')" class="action-card budgets-action">
            <div class="action-icon budgets-bg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <span class="action-label">Presupuestos</span>
          </button>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="bottom-grid">
        <!-- Gastos por categoría -->
        <div class="info-card">
          <h3 class="info-title">Distribución de gastos</h3>
          <div v-if="pieChartData" class="chart-container">
            <div class="pie-chart-wrapper">
              <Pie :data="pieChartData" :options="chartOptions" />
            </div>
          </div>
          <div v-else class="empty-chart">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <p class="empty-text">No hay gastos para mostrar</p>
          </div>
        </div>

        <!-- Recent transactions and categories -->
        <div class="side-cards">
          <button @click="router.push('/movimientos')" class="info-card info-card-clickable">
            <div class="info-header">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="info-icon">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              <div>
                <h3 class="info-title">Historial de movimientos</h3>
                <p class="info-subtitle">Ver todos tus ingresos y gastos</p>
              </div>
            </div>
          </button>

          <button @click="router.push('/categorias')" class="info-card info-card-clickable">
            <div class="info-header">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="info-icon">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <div>
                <h3 class="info-title">Gestionar categorías</h3>
                <p class="info-subtitle">Crear y editar categorías</p>
              </div>
            </div>
          </button>

          <!-- Recent Transactions -->
          <div class="info-card transactions-card">
            <h3 class="info-title">Últimas transacciones</h3>
            <div class="transactions-list">
              <div v-for="transaction in recentTransactions" :key="transaction.id" class="transaction-item">
                <div class="transaction-icon" :class="transaction.displayType + '-bg'">
                  <svg v-if="transaction.displayType === 'income'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                  </svg>
                </div>
                <div class="transaction-details">
                  <p class="transaction-name">{{ transaction.category?.name || transaction.type }}</p>
                  <p class="transaction-date">{{ transaction.displayDate }}</p>
                </div>
                <p class="transaction-amount" :class="transaction.displayType + '-text'">
                  {{ transaction.displayType === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
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

.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.dashboard-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: none;
  border-radius: 0.5rem;
  color: #64748b;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.logout-button:hover {
  background: #f8fafc;
  color: #1e293b;
  transform: translateY(-1px);
}

.logout-icon {
  width: 18px;
  height: 18px;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon svg {
  width: 20px;
  height: 20px;
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

.card-amount {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.income-amount {
  color: #10b981;
}

.expense-amount {
  color: #ef4444;
}

.balance-amount {
  color: #3b82f6;
}

/* Section */
.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

/* Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-card {
  background: white;
  border: none;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.movements-bg {
  background: linear-gradient(135deg, #818cf8, #6366f1);
}

.reports-bg {
  background: linear-gradient(135deg, #bfdbfe, #93c5fd);
}

.budgets-bg {
  background: linear-gradient(135deg, #e9d5ff, #d8b4fe);
}

.action-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
}

/* Bottom Grid */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

.info-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.info-card-clickable {
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  text-align: left;
}

.info-card-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  background: #fafbfc;
}

.info-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.info-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0.25rem 0 0 0;
}

.info-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #e0e7ff, #ddd6fe);
  color: #6366f1;
}

.side-cards {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Chart */
.chart-container {
  padding: 1rem 0;
}

.pie-chart-wrapper {
  height: 280px;
  position: relative;
}

.empty-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 0.95rem;
  color: #94a3b8;
  margin: 0;
}

/* Transactions */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transaction-icon svg {
  width: 20px;
  height: 20px;
  color: white;
}

.transaction-details {
  flex: 1;
}

.transaction-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.transaction-date {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
}

.transaction-amount {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.income-text {
  color: #10b981;
}

.expense-text {
  color: #ef4444;
}
</style>
