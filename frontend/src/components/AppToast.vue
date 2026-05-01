<script setup>
import { useToastStore } from '@/stores/toastStore';
import { storeToRefs } from 'pinia';

const { toasts } = storeToRefs(useToastStore());

const typeClass = (type) => {
    return {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500 text-black',
        info: 'bg-blue-500',
    }[type] || 'bg-gray-800';
};
</script>

<template>
    <div class="fixed top-5 right-5 z-50 space-y-3">
        <transition-group name="toast" tag="div">
            <div v-for="toast in toasts" :key="toast.id"
                class="min-w-62.5 max-w-sm px-4 py-3 rounded shadow-lg text-white flex justify-between items-center"
                :class="typeClass(toast.type)">
                <span>{{ toast.message }}</span>
                <!-- <button @click="removeToast(toast.id)" class="ml-3 text-sm opacity-70 hover:opacity-100">
                    ✕
                </button> -->
            </div>
        </transition-group>
    </div>
</template>