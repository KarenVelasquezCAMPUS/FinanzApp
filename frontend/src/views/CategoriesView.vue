<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useCategoriesStore } from '../stores/categories';
import { useRouter } from 'vue-router';

const categoriesStore = useCategoriesStore();
const router = useRouter();

const showModal = ref(false);
const showDeleteModal = ref(false);
const categoryToDelete = ref<number | null>(null);
const editingCategory = ref<any>(null);

const categoryForm = ref({
  name: ''
});

const categoryIcons: Record<string, string> = {
  'Alimentación': '🍔',
  'Transporte': '🚗',
  'Vivienda': '🏠',
  'Ocio': '🎮',
  'Salud': '💊',
  'Educación': '📚',
};

onMounted(() => {
  categoriesStore.fetchCategories();
});

function goBack() {
  router.push('/dashboard');
}

function openModal() {
  editingCategory.value = null;
  categoryForm.value = { name: '' };
  showModal.value = true;
}

function openEditModal(category: any) {
  editingCategory.value = category;
  categoryForm.value = { name: category.name };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingCategory.value = null;
}

async function handleSubmit() {
  if (!categoryForm.value.name.trim()) return;

  let success = false;
  if (editingCategory.value) {
    success = await categoriesStore.updateCategory(editingCategory.value.id, categoryForm.value);
  } else {
    success = await categoriesStore.createCategory(categoryForm.value);
  }

  if (success) {
    closeModal();
  }
}

function openDeleteModal(id: number) {
  categoryToDelete.value = id;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  categoryToDelete.value = null;
}

async function confirmDelete() {
  if (categoryToDelete.value) {
    await categoriesStore.deleteCategory(categoryToDelete.value);
    closeDeleteModal();
  }
}

function getCategoryIcon(name: string): string {
  return categoryIcons[name] || '📦';
}
</script>

<template>
  <div class="categories-container">
    <div class="categories-content">
      <!-- Header -->
      <header class="categories-header">
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
          Nueva categoría
        </button>
      </header>

      <h1 class="page-title">Categorías</h1>

      <!-- Lista de categorías -->
      <div v-if="categoriesStore.categories.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <h2 class="empty-title">No hay categorías</h2>
        <p class="empty-subtitle">Crea tu primera categoría para organizar tus movimientos</p>
        <button @click="openModal" class="empty-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Crear categoría
        </button>
      </div>

      <div v-else class="categories-list">
        <div 
          v-for="category in categoriesStore.categories" 
          :key="category.id"
          class="category-card"
        >
          <div class="category-info">
            <span class="category-icon">{{ getCategoryIcon(category.name) }}</span>
            <span class="category-name">{{ category.name }}</span>
          </div>
          <div class="category-actions">
            <button @click="openEditModal(category)" class="icon-button edit-btn" title="Editar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button @click="openDeleteModal(category.id)" class="icon-button delete-btn" title="Eliminar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para crear/editar categoría -->
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button @click="closeModal" class="close-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <h2 class="modal-title">{{ editingCategory ? 'Editar' : 'Nueva' }} Categoría</h2>

      <form @submit.prevent="handleSubmit" class="category-form">
        <div class="form-group">
          <label class="form-label">Nombre de la categoría</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <input 
              v-model="categoryForm.name" 
              type="text" 
              placeholder="Ej: Alimentación, Transporte..."
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="button-group">
          <button type="button" @click="closeModal" class="btn-cancel">
            Cancelar
          </button>
          <button type="submit" class="btn-submit">
            {{ editingCategory ? 'Actualizar' : 'Crear' }}
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
      <h3 class="delete-title">¿Eliminar categoría?</h3>
      <p class="delete-text">Esta acción no se puede deshacer. La categoría será eliminada permanentemente.</p>
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
.categories-container {
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

.categories-content {
  max-width: 800px;
  margin: 0 auto;
}

.categories-header {
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

.categories-list {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.category-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
}

.category-card:last-child {
  margin-bottom: 0;
}

.category-card:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.category-icon {
  font-size: 2rem;
  line-height: 1;
}

.category-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.category-actions {
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
}

.close-button svg {
  width: 20px;
  height: 20px;
  color: #64748b;
  stroke: #64748b;
  stroke-width: 2;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1.5rem;
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.form-input {
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

.form-input:focus {
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
