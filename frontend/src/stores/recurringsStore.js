import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/lib/axios';
import { useToastStore } from '@/stores/toastStore';

export const useRecurringStore = defineStore('recurring', () => {
    const { showToast } = useToastStore();
    const recurringTransactions = ref([]);
    const isRecurringLoaded = ref(false);
    const errors = ref({});
    const recurringLoading = ref({
        fetch: false,
        add: false,
        update: false,
        delete: false,
    });

    const fetchRecurring = async (force = false) => {
        if (isRecurringLoaded.value && !force) return;

        recurringLoading.value.fetch = true;
        try {
            const response = await api.get('/recurrings');
            recurringTransactions.value = response.data.data ?? response.data;
            isRecurringLoaded.value = true;
        } catch (error) {
            showToast('Failed to load recurring transactions', 'error');
        } finally {
            recurringLoading.value.fetch = false;
        }
    };

    const addRecurring = async (data) => {
        recurringLoading.value.add = true;
        try {
            await api.post('/recurrings', data);
            await fetchRecurring(true);
            showToast('Recurring transaction added', 'success');
        } catch (error) {
            if (error.response?.status === 422) {
                errors.value = error.response.data.errors;
            } else {
                showToast('Failed to add recurring transaction', 'error');
            }
            throw error;
        } finally {
            recurringLoading.value.add = false;
        }
    };

    const updateRecurring = async (id, data) => {
        recurringLoading.value.update = true;
        try {
            await api.put(`/recurrings/${id}`, data);
            await fetchRecurring(true);
            showToast('Recurring transaction updated', 'success');
        } catch (error) {
            if (error.response?.status === 422) {
                errors.value = error.response.data.errors;
            } else {
                showToast('Failed to update recurring transaction', 'error');
            }
            throw error;
        } finally {
            recurringLoading.value.update = false;
        }
    };

    const deleteRecurring = async (id) => {
        recurringLoading.value.delete = true;
        try {
            await api.delete(`/recurrings/${id}`);
            await fetchRecurring(true);
            showToast('Recurring transaction deleted', 'success');
        } catch (error) {
            showToast('Failed to delete recurring transaction', 'error');
        } finally {
            recurringLoading.value.delete = false;
        }
    };

    return {
        recurringTransactions,
        recurringLoading,
        fetchRecurring,
        addRecurring,
        updateRecurring,
        deleteRecurring,
        errors,
    };
});