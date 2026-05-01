<script setup>
import { useRoute } from 'vue-router';
import { Menu } from 'lucide-vue-next';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const uiStore = useUiStore();
const authStore = useAuthStore();

</script>

<template>
    <header v-if="!['Login', 'Register'].includes(route.name)"
        class="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div class="flex items-center gap-3">
            <button @click="uiStore.toggleMenu" class="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <Menu v-show="!uiStore.isMenuOpen" class="w-6 h-6" />
            </button>
            <figure><img src="@/assets/logo2.png" alt="Rental Manager Logo" class="mx-auto w-37.5"/></figure>
        </div>

        <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
            {{ authStore.user ? authStore.user.name.charAt(0).toUpperCase() : '' }}
        </div>
    </header>
</template>>