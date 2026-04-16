import { defineStore } from 'pinia';
import { ref } from 'vue';
import { LayoutDashboard, ReceiptText, Repeat, FileChartPie, User, Tag, LayoutGrid, Heart } from 'lucide-vue-next';

export const useNavStore = defineStore('nav', () => {
    const navItems = ref([
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Transactions', path: '/transactions', icon: ReceiptText },
        { name: 'Reports', path: '/reports', icon: FileChartPie },
        { name: 'Recurring', path: '/recurring', icon: Repeat },
        { name: 'Categories', path: '/categories', icon: Tag },
        { name: 'Charity', path: '/charity', icon: Heart },
        { name: 'Others', path: '/others', icon: LayoutGrid },
        { name: 'Profile', path: '/profile', icon: User },
    ]);

    return {
        navItems
    };
});