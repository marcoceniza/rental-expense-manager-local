<script setup>
import { LayoutGrid, AlertCircle } from 'lucide-vue-next';
</script>

<template>
    <div class="space-y-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 class="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <LayoutGrid class="w-8 h-8 text-indigo-600" />
                    Others (Super Admin Only)
                </h2>
                <p class="text-slate-500 mt-1">This page is restricted to super administrators for advanced system
                    management.</p>
            </div>
        </div>

        <!-- Dummy Content -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i"
                class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 border-dashed flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                <div class="p-4 bg-slate-50 rounded-full">
                    <AlertCircle class="w-8 h-8 text-slate-300" />
                </div>
                <div>
                    <h3 class="text-lg font-bold text-slate-400">Restricted Module {{ i }}</h3>
                    <p class="text-sm text-slate-300 mt-1">Advanced configuration and system logs will appear here in
                        future updates.</p>
                </div>
            </div>
        </div>

        <!-- Placeholder Table -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden opacity-40 grayscale">
            <div class="p-6 border-b border-slate-100">
                <h3 class="text-lg font-bold text-slate-900">System Logs (Sample)</h3>
            </div>
            <div class="p-12 flex flex-col items-center justify-center space-y-2">
                <p class="text-slate-400 font-medium italic">No logs available at the moment.</p>
                <p class="text-xs text-slate-300 uppercase font-bold tracking-widest">End of Stream</p>
            </div>
        </div>
    </div>
</template>
