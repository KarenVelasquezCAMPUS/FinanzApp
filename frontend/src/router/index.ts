import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import WelcomeView from '../views/WelcomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';
import MovementsView from '../views/MovementsView.vue';
import CategoriesView from '../views/CategoriesView.vue';
import BudgetsView from '../views/BudgetsView.vue';
import ReportsView from '../views/ReportsView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'welcome',
            component: WelcomeView,
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
        },
        {
            path: '/register',
            name: 'register',
            component: RegisterView,
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: DashboardView,
            meta: { requiresAuth: true },
        },
        {
            path: '/movimientos',
            name: 'movements',
            component: MovementsView,
            meta: { requiresAuth: true },
        },
        {
            path: '/categorias',
            name: 'categories',
            component: CategoriesView,
            meta: { requiresAuth: true },
        },
        {
            path: '/presupuestos',
            name: 'budgets',
            component: BudgetsView,
            meta: { requiresAuth: true },
        },
        {
            path: '/reportes',
            name: 'reports',
            component: ReportsView,
            meta: { requiresAuth: true },
        },
    ],
});

router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login');
    } else if (authStore.isAuthenticated && (to.path === '/' || to.path === '/login' || to.path === '/register')) {
        next('/dashboard');
    } else {
        if (authStore.isAuthenticated && !authStore.user) {
            await authStore.fetchUser();
        }
        next();
    }
});

export default router;
