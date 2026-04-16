import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue';
import Transactions from '@/views/Transactions.vue';
import Recurring from '@/views/Recurring.vue';
import Reports from '@/views/Reports.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Profile from '@/views/Profile.vue';
import Categories from '@/views/Categories.vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import Charity from '@/views/Charity.vue';
import Others from '@/views/Others.vue';
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: DashboardLayout,
            meta: { requiresAuth: true },
            children: [
                { path: 'dashboard', name: 'Dashboard', component: Dashboard },
                { path: 'transactions', name: 'Transactions', component: Transactions },
                { path: 'reports', name: 'Reports', component: Reports },
                { path: 'recurring', name: 'Recurring', component: Recurring },
                { path: 'categories', name: 'Categories', component: Categories },
                { path: 'charity', name: 'Charity', component: Charity },
                { path: 'others', name: 'Others', component: Others },
                { path: 'profile', name: 'Profile', component: Profile },
            ],
        },
        {
            path: '/login',
            name: 'Login',
            component: Login,
            meta: { guest: true }
        },
        {
            path: '/register',
            name: 'Register',
            component: Register,
            meta: { guest: true }
        }
    ],
});

router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore();

    // ✅ if user not loaded yet, fetch it
    if (!auth.user) {
        await auth.fetchUser();
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        next('/login');
    } else if (to.meta.guest && auth.isAuthenticated) {
        next('/dashboard');
    } else {
        next();
    }
});

export default router