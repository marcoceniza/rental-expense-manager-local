import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([]);
    let toastId = 0;

    const showToast = (message, type = 'info', duration = 3000) => {
        const id = toastId++;
        toasts.value.push({ id, message, type });

        setTimeout(() => removeToast(id), duration);
    };

    const removeToast = (id) => {
        toasts.value = toasts.value.filter(t => t.id !== id);
    };

    return {
        toasts,
        showToast,
        removeToast
    };
});