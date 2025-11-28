<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useBudgetsStore } from '../stores/budgets';
import { useCategoriesStore } from '../stores/categories';
import { useMovementsStore } from '../stores/movements';
import { useRouter } from 'vue-router';

const budgetsStore = useBudgetsStore();
const categoriesStore = useCategoriesStore();
const movementsStore = useMovementsStore();
const router = useRouter();

const showModal = ref(false);
const showDeleteModal = ref(false);
const budgetToDelete = ref<number | null>(null);
const editingBudget = ref<any>(null);

const budgetForm = ref({
  categoryId: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  limit: 0,
});

onMounted(async () => {
  await Promise.all([
    budgetsStore.fetchBudgets(),
    categoriesStore.fetchCategories(),
    movementsStore.fetchMovements()
  ]);
  
  console.log('=== DATOS CARGADOS ===');
  console.log('📋 Movimientos:', JSON.stringify(movementsStore.movements, null, 2));
  console.log('💰 Presupuestos:', JSON.stringify(budgetsStore.budgets, null, 2));
  console.log('🏷️ Categorías:', JSON.stringify(categoriesStore.categories, null, 2));
});

// Calcular gasto por categoría del mes actual
const budgetsWithProgress = computed(() => {
  console.log('\n🔄 ===== CALCULANDO PRESUPUESTOS =====');
  console.log('📊 Total movimientos disponibles:', movementsStore.movements.length);
  console.log('💰 Total presupuestos disponibles:', budgetsStore.budgets.length);
  
  return budgetsStore.budgets.map(budget => {
    console.log(`\n💼 Procesando presupuesto: ${budget.category?.name}`);
    console.log(`   - ID Categoría del presupuesto: ${budget.categoryId} (tipo: ${typeof budget.categoryId})`);
    console.log(`   - Mes/Año límite: ${budget.month}/${budget.year}`);
    console.log(`   - Límite: ${budget.limit} (tipo: ${typeof budget.limit})`);
    
    // Filtrar movimientos de tipo GASTO de la categoría que NO sean posteriores al mes/año del presupuesto
    const movimientosFiltrados = movementsStore.movements.filter(m => {
      const movementDate = new Date(m.date);
      const mes = movementDate.getMonth() + 1;
      const anio = movementDate.getFullYear();
      
      const isGasto = m.type === 'GASTO';
      const sameCategory = Number(m.categoryId) === Number(budget.categoryId);
      
      // Validar que la fecha NO sea posterior (puede ser igual o anterior)
      const fechaMovimiento = anio * 100 + mes;
      const fechaPresupuesto = budget.year * 100 + budget.month;
      const fechaValida = fechaMovimiento <= fechaPresupuesto;
      
      const match = isGasto && sameCategory && fechaValida;
      
      if (match) {
        console.log(`   ✅ Movimiento incluido:`, {
          id: m.id,
          amount: m.amount,
          categoryId: m.categoryId,
          date: m.date,
          mes: mes,
          anio: anio
        });
      }
      
      return match;
    });
    
    // Sumar los montos con Number() para asegurar precisión
    const spent = movimientosFiltrados.reduce((sum, m) => {
      const amount = Number(m.amount);
      console.log(`      Sumando: ${sum} + ${amount} = ${sum + amount}`);
      return sum + amount;
    }, 0);
    
    const limite = Number(budget.limit);
    const percentage = limite > 0 ? (spent / limite) * 100 : 0;
    const remaining = limite - spent;
    
    console.log(`\n   📊 RESULTADO para ${budget.category?.name}:`);
    console.log(`      - Movimientos encontrados: ${movimientosFiltrados.length}`);
    console.log(`      - Total gastado: ${spent}`);
    console.log(`      - Límite: ${limite}`);
    console.log(`      - Porcentaje: ${percentage}%`);
    console.log(`      - Restante: ${remaining}`);

    return {
      ...budget,
      spent: spent,
      percentage: Math.min(percentage, 100), // Limitar a 100 para la barra visual
      actualPercentage: percentage, // Porcentaje real (puede ser > 100)
      remaining: remaining,
      status: percentage >= 100 ? 'exceeded' : percentage >= 75 ? 'warning' : 'good'
    };
  });
});

function goBack() {
  router.push('/dashboard');
}

function openModal() {
  editingBudget.value = null;
  budgetForm.value = {
    categoryId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    limit: 0,
  };
  showModal.value = true;
}

function openEditModal(budget: any) {
  editingBudget.value = budget;
  budgetForm.value = {
    categoryId: budget.categoryId.toString(),
    month: budget.month,
    year: budget.year,
    limit: budget.limit,
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingBudget.value = null;
}

async function handleSubmit() {
  const budgetData = {
    categoryId: Number(budgetForm.value.categoryId),
    month: Number(budgetForm.value.month),
    year: Number(budgetForm.value.year),
    limit: Number(budgetForm.value.limit),
  };

  let success = false;
  if (editingBudget.value) {
    success = await budgetsStore.updateBudget(editingBudget.value.id, budgetData);
  } else {
    success = await budgetsStore.createBudget(budgetData);
  }

  if (success) {
    closeModal();
  }
}

function openDeleteModal(id: number) {
  budgetToDelete.value = id;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  budgetToDelete.value = null;
}

async function confirmDelete() {
  if (budgetToDelete.value) {
    await budgetsStore.deleteBudget(budgetToDelete.value);
    closeDeleteModal();
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(value);
}

function getCategoryIcon(categoryName: string) {
  const icons: Record<string, string> = {
    'Alimentación': '🍔',
    'Transporte': '🚗',
    'Vivienda': '🏠',
    'Ocio': '🎮',
    'Salud': '💊',
    'Educación': '📚',
  };
  return icons[categoryName] || '📦';
}
</script>

<template>
  <div class="budgets-container">
    <div class="budgets-content">
      <!-- Header -->
      <header class="budgets-header">
        <button @click="goBack" class="back-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="back-icon">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver al Dashboard
        </button>
        <button @click="openModal" class="add-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="add-icon">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo Presupuesto
        </button>
      </header>

      <h1 class="page-title">Presupuestos mensuales</h1>

      <!-- Lista de presupuestos -->
      <div v-if="budgetsWithProgress.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <h2 class="empty-title">No hay presupuestos configurados</h2>
        <p class="empty-subtitle">Crea tu primer presupuesto para controlar tus gastos mensuales</p>
        <button @click="openModal" class="empty-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Crear presupuesto
        </button>
      </div>

      <div v-else class="budgets-grid">
        <div 
          v-for="budget in budgetsWithProgress" 
          :key="budget.id"
          class="budget-card"
        >
          <div class="budget-header">
            <div class="budget-category">
              <span class="category-icon">{{ getCategoryIcon(budget.category?.name || '') }}</span>
              <div class="category-info">
                <h3 class="category-name">{{ budget.category?.name || 'Sin categoría' }}</h3>
                <p class="budget-period">{{ budget.month }}/{{ budget.year }}</p>
              </div>
            </div>
            <div class="budget-actions">
              <button @click="openEditModal(budget)" class="icon-button edit-btn" title="Editar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button @click="openDeleteModal(budget.id)" class="icon-button delete-btn" title="Eliminar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="budget-amounts">
            <div class="amount-item">
              <span class="amount-label">Gastado</span>
              <span class="amount-value spent">{{ formatCurrency(budget.spent) }}</span>
            </div>
            <div class="amount-item">
              <span class="amount-label">Límite</span>
              <span class="amount-value limit">{{ formatCurrency(budget.limit) }}</span>
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :class="budget.status"
                :style="{ width: budget.percentage + '%' }"
              ></div>
            </div>
            <div class="progress-info">
              <span class="progress-percentage" :class="budget.status">
                {{ budget.actualPercentage.toFixed(1) }}% usado
              </span>
              <span 
                class="progress-remaining"
                :class="{ 'text-danger': budget.remaining < 0 }"
              >
                {{ budget.remaining >= 0 ? 'Quedan' : 'Excedido en' }} {{ formatCurrency(Math.abs(budget.remaining)) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para crear/editar presupuesto -->
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button @click="closeModal" class="close-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <h2 class="modal-title">{{ editingBudget ? 'Editar' : 'Nuevo' }} Presupuesto</h2>

      <form @submit.prevent="handleSubmit" class="budget-form">
        <div class="form-group">
          <label class="form-label">Categoría</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <select v-model="budgetForm.categoryId" class="form-select" required>
              <option value="" disabled>Selecciona una categoría</option>
              <option v-for="cat in categoriesStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Límite Mensual</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <input 
              v-model="budgetForm.limit" 
              type="number" 
              step="1"
              min="0"
              placeholder="0"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Mes</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <input 
                v-model="budgetForm.month" 
                type="number"
                min="1"
                max="12"
                class="form-input"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Año</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <input 
                v-model="budgetForm.year" 
                type="number"
                min="2020"
                max="2100"
                class="form-input"
                required
              />
            </div>
          </div>
        </div>

        <div class="button-group">
          <button type="button" @click="closeModal" class="btn-cancel">
            Cancelar
          </button>
          <button type="submit" class="btn-submit">
            {{ editingBudget ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal de confirmación de eliminación -->
  <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
    <div class="delete-modal-content" @click.stop>
      <div class="delete-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      </div>
      <h3 class="delete-title">¿Eliminar presupuesto?</h3>
      <p class="delete-text">Esta acción no se puede deshacer. El presupuesto será eliminado permanentemente.</p>
      <div class="delete-buttons">
        <button @click="closeDeleteModal" class="delete-btn-cancel">
          Cancelar
        </button>
        <button @click="confirmDelete" class="delete-btn-confirm">
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.budgets-container {
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

.budgets-content {
  max-width: 1200px;
  margin: 0 auto;
}

.budgets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem 1.25rem;
  color: #4b5563;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.back-icon {
  width: 18px;
  height: 18px;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #4f46e5, #6366f1);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.add-button:hover {
  background: linear-gradient(to right, #4338ca, #4f46e5);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
}

.add-icon {
  width: 18px;
  height: 18px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 2rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  background: white;
  border-radius: 1.5rem;
  padding: 4rem 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.empty-icon svg {
  width: 60px;
  height: 60px;
  color: #cbd5e1;
}

.empty-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.empty-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0 0 2rem;
}

.empty-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(to right, #4f46e5, #6366f1);
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.empty-button:hover {
  background: linear-gradient(to right, #4338ca, #4f46e5);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
}

.empty-button svg {
  width: 20px;
  height: 20px;
}

/* Grid de presupuestos */
.budgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.budget-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.budget-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.budget-category {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.category-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.budget-period {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.budget-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-button {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 0.5rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.icon-button svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.edit-btn {
  background: #dbeafe;
  color: #3b82f6;
}

.edit-btn:hover {
  background: #bfdbfe;
  transform: scale(1.05);
}

.edit-btn svg {
  stroke: #3b82f6;
  color: #3b82f6;
  stroke-width: 2;
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fecaca;
  transform: scale(1.05);
}

.delete-btn svg {
  stroke: #dc2626;
  color: #dc2626;
  stroke-width: 2;
}

.delete-btn svg {
  stroke: #dc2626;
}

.budget-amounts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.amount-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.amount-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.amount-value {
  font-size: 1.125rem;
  font-weight: 700;
}

.amount-value.spent {
  color: #ef4444;
}

.amount-value.limit {
  color: #10b981;
}

.progress-section {
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #f1f5f9;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: all 0.3s;
}

.progress-fill.good {
  background: linear-gradient(to right, #10b981, #059669);
}

.progress-fill.warning {
  background: linear-gradient(to right, #f59e0b, #d97706);
}

.progress-fill.exceeded {
  background: linear-gradient(to right, #ef4444, #dc2626);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-percentage {
  font-size: 0.875rem;
  font-weight: 600;
}

.progress-percentage.good {
  color: #10b981;
}

.progress-percentage.warning {
  color: #f59e0b;
}

.progress-percentage.exceeded {
  color: #ef4444;
}

.progress-remaining {
  font-size: 0.875rem;
  color: #64748b;
}

.text-danger {
  color: #ef4444 !important;
  font-weight: 600;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  border: none;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background: #e2e8f0;
}

.close-button svg {
  width: 20px;
  height: 20px;
  color: #64748b;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1.5rem;
}

.budget-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  width: 20px;
  height: 20px;
  color: #9ca3af;
  pointer-events: none;
  z-index: 1;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #1f2937;
  background-color: white;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.875rem center;
  padding-right: 2.5rem;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.button-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn-cancel {
  padding: 0.875rem 1.5rem;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #d1d5db;
}

.btn-submit {
  padding: 0.875rem 1.5rem;
  background: linear-gradient(to right, #4f46e5, #6366f1);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-submit:hover {
  background: linear-gradient(to right, #4338ca, #4f46e5);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
}

/* Modal de eliminación */
.delete-modal-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.delete-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.delete-icon svg {
  width: 40px;
  height: 40px;
  color: #dc2626;
}

.delete-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.75rem;
}

.delete-text {
  font-size: 1rem;
  color: #64748b;
  margin: 0 0 2rem;
  line-height: 1.5;
}

.delete-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.delete-btn-cancel {
  padding: 0.875rem 1.5rem;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn-cancel:hover {
  background: #d1d5db;
}

.delete-btn-confirm {
  padding: 0.875rem 1.5rem;
  background: linear-gradient(to right, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.delete-btn-confirm:hover {
  background: linear-gradient(to right, #dc2626, #b91c1c);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}
</style>
