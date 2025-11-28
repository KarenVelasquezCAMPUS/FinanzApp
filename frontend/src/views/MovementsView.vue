<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMovementsStore } from '../stores/movements';
import { useCategoriesStore } from '../stores/categories';
import { useRouter } from 'vue-router';

const movementsStore = useMovementsStore();
const categoriesStore = useCategoriesStore();
const router = useRouter();

const showForm = ref(false);
const showDeleteModal = ref(false);
const showEditModal = ref(false);
const movementToDelete = ref<number | null>(null);
const movementToEdit = ref<any>(null);
const newMovement = ref({
  type: 'GASTO' as 'GASTO' | 'INGRESO',
  amount: 0,
  categoryId: '',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'Efectivo',
  note: '',
});
const editMovement = ref({
  type: 'GASTO' as 'GASTO' | 'INGRESO',
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

function goBack() {
  router.push('/dashboard');
}

function openForm() {
  showForm.value = true;
}

async function handleSubmit() {
  // Crear el objeto con el formato correcto del backend
  const movementData = {
    type: newMovement.value.type,
    amount: Number(newMovement.value.amount),
    categoryId: Number(newMovement.value.categoryId),
    date: new Date(newMovement.value.date).toISOString(),
    paymentMethod: newMovement.value.paymentMethod,
    note: newMovement.value.note || ''
  };

  const success = await movementsStore.createMovement(movementData);
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

function handleCancel() {
  showForm.value = false;
}

function openDeleteModal(id: number) {
  movementToDelete.value = id;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  movementToDelete.value = null;
}

async function confirmDelete() {
  if (movementToDelete.value) {
    await movementsStore.deleteMovement(movementToDelete.value);
    closeDeleteModal();
  }
}

function openEditModal(movement: any) {
  movementToEdit.value = movement;
  editMovement.value = {
    type: movement.type,
    amount: movement.amount,
    categoryId: movement.categoryId.toString(),
    date: new Date(movement.date).toISOString().split('T')[0],
    paymentMethod: movement.paymentMethod,
    note: movement.note || '',
  };
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  movementToEdit.value = null;
}

async function handleUpdate() {
  console.log('handleUpdate llamado');
  if (!movementToEdit.value) {
    console.error('No hay movimiento para editar');
    return;
  }

  console.log('Movimiento a editar:', movementToEdit.value);
  console.log('Datos del formulario:', editMovement.value);

  const movementData = {
    type: editMovement.value.type,
    amount: Number(editMovement.value.amount),
    categoryId: Number(editMovement.value.categoryId),
    date: new Date(editMovement.value.date).toISOString(),
    paymentMethod: editMovement.value.paymentMethod,
    note: editMovement.value.note || ''
  };

  console.log('Datos a enviar:', movementData);
  console.log('ID:', movementToEdit.value.id);

  const success = await movementsStore.updateMovement(movementToEdit.value.id, movementData);
  console.log('Resultado de actualización:', success);
  
  if (success) {
    closeEditModal();
  } else {
    alert('Error al actualizar el movimiento. Revisa la consola para más detalles.');
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(value);
}

</script>

<template>
  <!-- Vista principal de movimientos -->
  <div v-if="!showForm" class="movements-main-container">
    <div class="movements-main-content">
      <!-- Header -->
      <header class="movements-header">
        <button @click="goBack" class="back-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="back-icon">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>
        <button @click="openForm" class="add-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="add-icon">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo
        </button>
      </header>

      <!-- Empty State -->
      <div v-if="movementsStore.movements.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <h2 class="empty-title">No hay movimientos</h2>
        <p class="empty-subtitle">Comienza agregando tu primer ingreso o gasto</p>
        <button @click="openForm" class="empty-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button-icon">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Agregar movimiento
        </button>
      </div>

      <!-- Lista de movimientos -->
      <div v-else class="movements-list">
        <h2 class="list-title">Todos los movimientos</h2>
        <div class="movements-grid">
          <div 
            v-for="movement in movementsStore.movements" 
            :key="movement.id"
            class="movement-card"
          >
            <div class="movement-info">
              <div 
                class="movement-type-icon" 
                :class="movement.type === 'INGRESO' ? 'income-icon' : 'expense-icon'"
              >
                <svg v-if="movement.type === 'INGRESO'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                  <polyline points="17 18 23 18 23 12"/>
                </svg>
              </div>
              <div class="movement-details">
                <p class="movement-category">{{ movement.category?.name || movement.type }}</p>
                <p class="movement-date">{{ new Date(movement.date).toLocaleDateString('es-CO') }}</p>
                <p v-if="movement.note" class="movement-note">{{ movement.note }}</p>
              </div>
            </div>
            <div class="movement-actions">
              <p 
                class="movement-amount" 
                :class="movement.type === 'INGRESO' ? 'income-text' : 'expense-text'"
              >
                {{ movement.type === 'INGRESO' ? '+' : '-' }}{{ formatCurrency(movement.amount) }}
              </p>
              <div class="action-buttons">
                <button @click="openEditModal(movement)" class="edit-button" title="Editar movimiento">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button @click="openDeleteModal(movement.id)" class="delete-button" title="Eliminar movimiento">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Formulario de nuevo movimiento -->
  <div v-else class="movements-container">
    <div class="movements-card">
      <!-- Botón Volver -->
      <button @click="handleCancel" class="back-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="back-icon">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Volver
      </button>

      <!-- Título -->
      <h2 class="form-title">Registrar {{ newMovement.type === 'GASTO' ? 'gasto' : 'ingreso' }}</h2>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="movement-form">
        <!-- Tipo de movimiento (tabs) -->
        <div class="type-tabs">
          <button 
            type="button"
            @click="newMovement.type = 'GASTO'"
            :class="['type-tab', { active: newMovement.type === 'GASTO' }]"
          >
            Gasto
          </button>
          <button 
            type="button"
            @click="newMovement.type = 'INGRESO'"
            :class="['type-tab', { active: newMovement.type === 'INGRESO' }]"
          >
            Ingreso
          </button>
        </div>

        <!-- Monto -->
        <div class="form-group">
          <label class="form-label">Monto</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <input 
              v-model="newMovement.amount" 
              type="number" 
              step="0.01"
              placeholder="0.00"
              class="form-input"
              required
            />
          </div>
        </div>

        <!-- Categoría -->
        <div class="form-group">
          <label class="form-label">Categoría</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <select v-model="newMovement.categoryId" class="form-select" required>
              <option value="" disabled>Selecciona una categoría</option>
              <option v-for="cat in categoriesStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Fecha -->
        <div class="form-group">
          <label class="form-label">Fecha</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input 
              v-model="newMovement.date" 
              type="date"
              class="form-input"
              required
            />
          </div>
        </div>

        <!-- Método de pago -->
        <div class="form-group">
          <label class="form-label">Método de pago</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <select v-model="newMovement.paymentMethod" class="form-select" required>
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
            </select>
          </div>
        </div>

        <!-- Nota -->
        <div class="form-group">
          <label class="form-label">Nota (opcional)</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon textarea-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <textarea 
              v-model="newMovement.note" 
              placeholder="Agrega una descripción..."
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>

        <!-- Botones -->
        <div class="button-group">
          <button type="button" @click="handleCancel" class="btn-cancel">
            Cancelar
          </button>
          <button type="submit" class="btn-submit">
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal de confirmación de eliminación -->
  <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
    <div class="modal-content" @click.stop>
      <div class="modal-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      </div>
      <h3 class="modal-title">¿Eliminar movimiento?</h3>
      <p class="modal-text">Esta acción no se puede deshacer. El movimiento será eliminado permanentemente.</p>
      <div class="modal-buttons">
        <button @click="closeDeleteModal" class="modal-btn-cancel">
          Cancelar
        </button>
        <button @click="confirmDelete" class="modal-btn-delete">
          Eliminar
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de edición -->
  <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
    <div class="edit-modal-content" @click.stop>
      <!-- Botón cerrar -->
      <button @click="closeEditModal" class="close-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- Título -->
      <h2 class="edit-modal-title">Editar {{ editMovement.type === 'GASTO' ? 'gasto' : 'ingreso' }}</h2>

      <!-- Formulario -->
      <form @submit.prevent="handleUpdate" class="edit-form">
        <!-- Tipo de movimiento (tabs) -->
        <div class="type-tabs">
          <button 
            type="button"
            @click="editMovement.type = 'GASTO'"
            :class="['type-tab', { active: editMovement.type === 'GASTO' }]"
          >
            Gasto
          </button>
          <button 
            type="button"
            @click="editMovement.type = 'INGRESO'"
            :class="['type-tab', { active: editMovement.type === 'INGRESO' }]"
          >
            Ingreso
          </button>
        </div>

        <!-- Monto -->
        <div class="form-group">
          <label class="form-label">Monto</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <input 
              v-model="editMovement.amount" 
              type="number" 
              step="0.01"
              placeholder="0.00"
              class="form-input"
              required
            />
          </div>
        </div>

        <!-- Categoría -->
        <div class="form-group">
          <label class="form-label">Categoría</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <select v-model="editMovement.categoryId" class="form-select" required>
              <option value="" disabled>Selecciona una categoría</option>
              <option v-for="cat in categoriesStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Fecha -->
        <div class="form-group">
          <label class="form-label">Fecha</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <input 
              v-model="editMovement.date" 
              type="date"
              class="form-input"
              required
            />
          </div>
        </div>

        <!-- Método de pago -->
        <div class="form-group">
          <label class="form-label">Método de pago</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <select v-model="editMovement.paymentMethod" class="form-select" required>
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
            </select>
          </div>
        </div>

        <!-- Nota -->
        <div class="form-group">
          <label class="form-label">Nota (opcional)</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon textarea-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <textarea 
              v-model="editMovement.note" 
              placeholder="Agrega una descripción..."
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>

        <!-- Botones -->
        <div class="button-group">
          <button type="button" @click="closeEditModal" class="btn-cancel">
            Cancelar
          </button>
          <button type="submit" class="btn-submit">
            Actualizar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Vista principal */
.movements-main-container {
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

.movements-main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.movements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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

.button-icon {
  width: 20px;
  height: 20px;
}

/* Lista de movimientos */
.movements-list {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.list-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1.5rem;
}

.movements-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.movement-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.movement-card:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.movement-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.movement-type-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.movement-type-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.income-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.expense-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.movement-details {
  flex: 1;
}

.movement-category {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem;
}

.movement-date {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
}

.movement-note {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0.25rem 0 0;
  font-style: italic;
}

.movement-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.movement-amount {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.income-text {
  color: #10b981;
}

.expense-text {
  color: #ef4444;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.edit-button {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 0.5rem;
  border: none;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.edit-button:hover {
  background: #bfdbfe;
  transform: scale(1.05);
}

.edit-button svg {
  width: 20px;
  height: 20px;
  color: #3b82f6;
  stroke: #3b82f6;
  stroke-width: 2;
  flex-shrink: 0;
}

.delete-button {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 0.5rem;
  border: none;
  background: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.delete-button:hover {
  background: #fecaca;
  transform: scale(1.05);
}

.delete-button svg {
  width: 20px;
  height: 20px;
  color: #dc2626;
  stroke: #dc2626;
  stroke-width: 2;
  flex-shrink: 0;
}

/* Formulario (mantiene los estilos anteriores) */
.movements-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #e8eeff 0%, #f0f4ff 50%, #e8eeff 100%);
  box-sizing: border-box;
  overflow-y: auto;
}

.movements-card {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem 2.5rem;
  max-width: 520px;
  width: 100%;
  margin: auto;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #4b5563;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1.5rem;
  transition: color 0.2s;
}

.back-button:hover {
  color: #1f2937;
}

.back-icon {
  width: 20px;
  height: 20px;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 1.5rem;
}

.movement-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.type-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.type-tab {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 0.5rem;
  color: #6b7280;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.type-tab.active {
  border-color: #4f46e5;
  background: #f5f3ff;
  color: #4f46e5;
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

.textarea-icon {
  top: 0.875rem;
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

.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #1f2937;
  background-color: white;
  transition: all 0.2s;
  box-sizing: border-box;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  background-color: white;
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
  transition: all 0.3s ease;
}

.btn-submit:hover {
  background: linear-gradient(to right, #4338ca, #4f46e5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

/* Modal de confirmación */
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
  border-radius: 1rem;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.modal-icon svg {
  width: 32px;
  height: 32px;
  color: #dc2626;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.75rem;
}

.modal-text {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 2rem;
  line-height: 1.5;
}

.modal-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-btn-cancel,
.modal-btn-delete {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn-cancel {
  background: #e5e7eb;
  color: #374151;
}

.modal-btn-cancel:hover {
  background: #d1d5db;
}

.modal-btn-delete {
  background: linear-gradient(to right, #dc2626, #b91c1c);
  color: white;
}

.modal-btn-delete:hover {
  background: linear-gradient(to right, #b91c1c, #991b1b);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

/* Modal de edición */
.edit-modal-content {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 0.5rem;
  border: none;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
  flex-shrink: 0;
}

.close-button:hover {
  background: #e2e8f0;
  transform: rotate(90deg);
}

.close-button svg {
  width: 20px;
  height: 20px;
  color: #64748b;
  stroke: #64748b;
  stroke-width: 2;
  flex-shrink: 0;
}

.edit-modal-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1.5rem;
  text-align: center;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>
