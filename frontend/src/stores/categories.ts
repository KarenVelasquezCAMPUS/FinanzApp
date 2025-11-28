import { defineStore } from 'pinia';
import api from '../services/api';
import { ref } from 'vue';

export const useCategoriesStore = defineStore('categories', () => {
    const categories = ref<any[]>([]);

    async function fetchCategories() {
        try {
            const { data } = await api.get('/categorias');
            categories.value = data;
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    }

    async function createCategory(category: any) {
        try {
            await api.post('/categorias', category);
            await fetchCategories();
            return true;
        } catch (error) {
            console.error('Error creating category', error);
            return false;
        }
    }

    async function deleteCategory(id: number) {
        try {
            await api.delete(`/categorias/${id}`);
            await fetchCategories();
            return true;
        } catch (error) {
            console.error('Error deleting category', error);
            return false;
        }
    }

    async function updateCategory(id: number, category: any) {
        try {
            await api.patch(`/categorias/${id}`, category);
            await fetchCategories();
            return true;
        } catch (error) {
            console.error('Error updating category', error);
            return false;
        }
    }

    return { categories, fetchCategories, createCategory, updateCategory, deleteCategory };
});
