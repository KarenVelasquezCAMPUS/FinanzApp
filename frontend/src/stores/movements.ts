import { defineStore } from 'pinia';
import api from '../services/api';
import { ref } from 'vue';

export const useMovementsStore = defineStore('movements', () => {
    const movements = ref<any[]>([]);
    const summary = ref<any>({ income: 0, expense: 0, balance: 0, movements: [] });

    async function fetchMovements() {
        try {
            const { data } = await api.get('/movimientos');
            movements.value = data;
        } catch (error) {
            console.error('Error fetching movements', error);
        }
    }

    async function fetchMonthlySummary(month: number, year: number) {
        try {
            const { data } = await api.get('/movimientos/resumen-mensual', { params: { month, year } });
            summary.value = data;
        } catch (error) {
            console.error('Error fetching summary', error);
        }
    }

    async function createMovement(movement: any) {
        try {
            await api.post('/movimientos', movement);
            await fetchMovements();
            return true;
        } catch (error) {
            console.error('Error creating movement', error);
            return false;
        }
    }

    async function deleteMovement(id: number) {
        try {
            await api.delete(`/movimientos/${id}`);
            await fetchMovements();
            return true;
        } catch (error) {
            console.error('Error deleting movement', error);
            return false;
        }
    }

    async function updateMovement(id: number, movement: any) {
        try {
            await api.patch(`/movimientos/${id}`, movement);
            await fetchMovements();
            return true;
        } catch (error) {
            console.error('Error updating movement', error);
            return false;
        }
    }

    return { movements, summary, fetchMovements, fetchMonthlySummary, createMovement, deleteMovement, updateMovement };
});
