<script setup>
import { RouterLink, useRoute } from 'vue-router';
import { LogOut, Menu, X } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/authStore';
import { useNavStore } from '@/stores/navStore';
import { storeToRefs } from 'pinia';

const route = useRoute();
const authStore = useAuthStore();
const { navItems } = storeToRefs(useNavStore());
</script>

<template>
    <header v-if="!['Login', 'Register'].includes(route.name)"
        class="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div class="flex items-center gap-3">
            <button @click="isMenuOpen = !isMenuOpen" class="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <Menu v-if="!isMenuOpen" class="w-6 h-6" />
                <X v-else class="w-6 h-6" />
            </button>
            <h1 class="text-lg font-bold">RentalManager</h1>
        </div>

        <div
            class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
            A
        </div>
    </header>
</template>