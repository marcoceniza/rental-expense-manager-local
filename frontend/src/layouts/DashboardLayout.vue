<script setup>
import { RouterView, useRoute } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import MobileHeader from '@/components/MobileHeader.vue';
import { useUiStore } from '@/stores/uiStore';

const route = useRoute();
const uiStore = useUiStore();
</script>

<template>
    <div class="min-h-screen bg-slate-50 flex">
        <!-- Mobile Sidebar Overlay -->
        <div v-if="uiStore.isMenuOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] md:hidden"
            @click="uiStore.closeMenu"></div>
        <Sidebar />

        <main class="flex-1 flex flex-col min-w-0 min-h-screen">
            <MobileHeader />

            <div class="flex-1 p-4 md:p-8">
                <div :class="!['Login', 'Register'].includes(route.name) ? 'max-w-6xl mx-auto' : 'w-full h-full'">
                    <RouterView v-slot="{ Component }">
                        <component :is="Component" :key="route.fullPath" />
                    </RouterView>
                </div>
            </div>
        </main>
    </div>
</template>