import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import {
    LayoutDashboard,
    ReceiptText,
    Repeat,
    FileChartPie,
    User,
    Tag,
    LayoutGrid,
    Heart
} from 'lucide-vue-next'

export const useNavStore = defineStore('nav', () => {
    const auth = useAuthStore()

    const navItems = computed(() => {
        const isAdmin = auth.isAdmin;

        const items = [
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { name: 'Transactions', path: '/transactions', icon: ReceiptText },
            { name: 'Reports', path: '/reports', icon: FileChartPie },
            { name: 'Charity', path: '/charity', icon: Heart },
        ]

        if (isAdmin) {
            items.push(
                { name: 'Recurring', path: '/recurring', icon: Repeat },
                { name: 'Categories', path: '/categories', icon: Tag },
                { name: 'Others', path: '/others', icon: LayoutGrid },
                { name: 'Profile', path: '/profile', icon: User },
            )
        }

        return items
    })

    return { navItems }
})