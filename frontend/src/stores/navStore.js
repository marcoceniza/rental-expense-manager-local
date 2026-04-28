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
        const isAdmin = auth.isAdmin // ✅ use computed getter from authStore

        const items = [
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { name: 'Transactions', path: '/transactions', icon: ReceiptText },
            { name: 'Reports', path: '/reports', icon: FileChartPie },
        ]

        if (isAdmin) {
            items.push(
                { name: 'Recurring', path: '/admin/recurring', icon: Repeat },
                { name: 'Categories', path: '/admin/categories', icon: Tag },
                { name: 'Charity', path: '/admin/charity', icon: Heart },
                { name: 'Others', path: '/admin/others', icon: LayoutGrid },
                { name: 'Profile', path: '/admin/profile', icon: User },
            )
        }

        return items
    })

    return { navItems }
})