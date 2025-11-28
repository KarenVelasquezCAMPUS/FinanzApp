import { defineStore } from 'pinia';
import api from '../services/api';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any>(null);
    const token = ref(localStorage.getItem('token') || '');
    const isAuthenticated = computed(() => !!token.value);

    async function login(credentials: any) {
        try {
            const { data } = await api.post('/auth/login', credentials);
            token.value = data.access_token;
            user.value = data.user;
            localStorage.setItem('token', data.access_token);
            return true;
        } catch (error) {
            console.error('Login failed', error);
            return false;
        }
    }

    async function register(credentials: any) {
        try {
            await api.post('/auth/register', credentials);
            // No guardamos el token, el usuario debe iniciar sesión manualmente
            return true;
        } catch (error) {
            console.error('Registration failed', error);
            return false;
        }
    }

    async function fetchUser() {
        if (!token.value) return;
        try {
            const { data } = await api.get('/auth/me');
            user.value = data;
        } catch (error) {
            logout();
        }
    }

    function logout() {
        token.value = '';
        user.value = null;
        localStorage.removeItem('token');
        window.location.href = '/login';
    }

    return { user, token, isAuthenticated, login, register, fetchUser, logout };
});
