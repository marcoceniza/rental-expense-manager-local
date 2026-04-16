import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/lib/axios';
import { useToastStore } from '@/stores/toastStore';

export const useTransactionsStore = defineStore('transactions', () => {
    const transactions = ref([]);
    const pagination = ref({});
    const transactionsCache = ref({});
    const { showToast } = useToastStore();
    const transactionsLoading = ref({
        fetch: false,
        add: false,
        update: false,
        delete: false,
    });

    const fetchTransactions = async (page = 1, force = false) => {

        if (transactionsCache.value[page] && !force) {
            transactions.value = transactionsCache.value[page].data;
            pagination.value = transactionsCache.value[page].pagination;
            return;
        }

        transactionsLoading.value.fetch = true;

        try {
            const response = await api.get(`/transactions?page=${page}`);

            transactions.value = response.data.data;
            pagination.value = response.data;

            transactionsCache.value[page] = {
                data: response.data.data,
                pagination: response.data
            };

        } catch (error) {
            showToast(`Failed to load transactions: ${error.message}`, 'error');
        } finally {
            transactionsLoading.value.fetch = false;
        }
    };

    const addTransaction = async (transaction) => {
        transactionsLoading.value.add = true;
        try {
            await api.post('/transactions', transaction);
            transactionsCache.value = {};
            await fetchTransactions(1);

            showToast('Transaction added successfully', 'success');
        } catch (error) {
            showToast(`Failed to add transaction: ${error.message}`, 'error');
        } finally {
            transactionsLoading.value.add = false;
        }
    };

    const updateTransaction = async (transactionId, updatedData) => {
        transactionsLoading.value.update = true;
        try {
            await api.put(`/transactions/${transactionId}`, updatedData);
            transactionsCache.value = {};
            await fetchTransactions(1);

            showToast('Transaction updated successfully', 'success');
        } catch (error) {
            showToast(`Failed to update transaction: ${error.message}`, 'error');
        } finally {
            transactionsLoading.value.update = false;
        }
    };

    const deleteTransaction = async (transactionId) => {
        transactionsLoading.value.delete = true;
        try {
            await api.delete(`/transactions/${transactionId}`);
            transactionsCache.value = {};
            await fetchTransactions(1);

            showToast('Transaction deleted successfully', 'success');
        } catch (error) {
            showToast(`Failed to delete transaction: ${error.message}`, 'error');
        } finally {
            transactionsLoading.value.delete = false;
        }
    };

    return {
        transactions,
        transactionsLoading,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        pagination
    };
});