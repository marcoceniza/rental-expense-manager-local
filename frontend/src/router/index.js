import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Views
import Dashboard from '@/views/Dashboard.vue'
import Transactions from '@/views/Transactions.vue'
import Recurring from '@/views/Recurring.vue'
import Reports from '@/views/Reports.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Profile from '@/views/Profile.vue'
import Categories from '@/views/Categories.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import Charity from '@/views/Charity.vue'
import Others from '@/views/Others.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),

    routes: [
        // =========================
        // AUTH ROUTES
        // =========================
        {
            path: '/login',
            component: Login,
            meta: { guest: true }
        },
        {
            path: '/register',
            component: Register,
            meta: { guest: true }
        },

        // =========================
        // APP ROUTES (ROLE HANDLED IN META)
        // =========================
        {
            path: '/',
            component: DashboardLayout,
            meta: { requiresAuth: true },

            children: [
                {
                    path: '',
                    redirect: '/dashboard'
                },

                // USER + ADMIN SHARED
                {
                    path: 'dashboard',
                    name: 'Dashboard',
                    component: Dashboard
                },
                {
                    path: 'transactions',
                    name: 'Transactions',
                    component: Transactions
                },
                {
                    path: 'reports',
                    name: 'Reports',
                    component: Reports
                },

                // ADMIN ONLY (protected via meta)
                {
                    path: 'recurring',
                    name: 'Recurring',
                    component: Recurring,
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'categories',
                    name: 'Categories',
                    component: Categories,
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'charity',
                    name: 'Charity',
                    component: Charity,
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'others',
                    name: 'Others',
                    component: Others,
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'profile',
                    name: 'Profile',
                    component: Profile,
                    meta: { requiresAdmin: true }
                },
            ]
        }
    ],
})

/**
 * =========================
 * GLOBAL ROUTE GUARD
 * =========================
 */
router.beforeEach(async (to) => {
    const auth = useAuthStore()

    // Ensure user is loaded once per session
    if (!auth.user) {
        await auth.fetchUser()
    }

    // Not logged in
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return '/login'
    }

    // Guest pages (login/register)
    if (to.meta.guest && auth.isAuthenticated) {
        return '/dashboard'
    }

    // Admin-only routes
    if (to.meta.requiresAdmin && !auth.isAdmin) {
        return auth.isAuthenticated ? '/dashboard' : '/login'
    }
})

export default router