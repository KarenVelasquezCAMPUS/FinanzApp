import { defineStore } from 'pinia';
import api from '../services/api';
import { ref } from 'vue';

export const useBudgetsStore = defineStore('budgets', () => {
    const budgets = ref<any[]>([]);

    async function fetchBudgets() {
        try {
            const { data } = await api.get('/presupuestos');
            budgets.value = data;
        } catch (error) {
            console.error('Error fetching budgets', error);
        }
    }

    async function createBudget(budget: any) {
        try {
            await api.post('/presupuestos', budget);
            await fetchBudgets();
            return true;
        } catch (error) {
            console.error('Error creating budget', error);
            return false;
        }
    }

    async function deleteBudget(id: number) {
        try {
            await api.delete(`/presupuestos/${id}`);
            await fetchBudgets();
            return true;
        } catch (error) {
            console.error('Error deleting budget', error);
            return false;
        }
    }

    async function updateBudget(id: number, budget: any) {
        try {
            await api.patch(`/presupuestos/${id}`, budget);
            await fetchBudgets();
            return true;
        } catch (error) {
            console.error('Error updating budget', error);
            return false;
        }
    }

    return { budgets, fetchBudgets, createBudget, updateBudget, deleteBudget };
});
