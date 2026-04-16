<script setup>
import { RouterView, useRoute } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import MobileHeader from '@/components/MobileHeader.vue';

const route = useRoute();
</script>

<template>
    <div class="min-h-screen bg-slate-50 flex">
        <!-- Mobile Sidebar Overlay -->
        <div v-if="isMenuOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] md:hidden"
            @click="isMenuOpen = false"></div>
        <Sidebar />

        <main class="flex-1 flex flex-col min-w-0 min-h-screen">
            <MobileHeader />

            <div class="flex-1 p-4 md:p-8">
                <div :class="!['Login', 'Register'].includes(route.name) ? 'max-w-6xl mx-auto' : 'w-full h-full'">
                    <RouterView v-slot="{ Component }">
                        <transition name="fade" mode="out-in">
                            <component :is="Component" />
                        </transition>
                    </RouterView>
                </div>
            </div>
        </main>
    </div>
</template>