import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/lib/axios';
import { useToastStore } from '@/stores/toastStore';
import { useCategoriesStore } from './categoriesStore';
import { useReportsStore } from './reportsStore';

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
    const trasanctionsTrash = ref([]);
    const showTrashModal = ref(false);
    const categoriesStore = useCategoriesStore();
    const reportsStore = useReportsStore();

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
            const response = await api.post('/transactions', transaction);
            const newTransaction = response.data.data;

            // ✅ update transactions
            transactions.value.unshift(newTransaction);

            // ✅ update category count
            const category = categoriesStore.categories.find(
                c => c.id === newTransaction.category_id
            );

            if (category) {
                category.transactions_count += 1;
            }

            // 🔥 ADD THIS PART (centralized refresh)
            reportsStore.clearCache(); // if you created this method

            await reportsStore.getMonthlyStats(
                new Date(newTransaction.transaction_date),
                true
            );

            await reportsStore.getAnnualReport(
                new Date(newTransaction.transaction_date).getFullYear(),
                true
            );

            await reportsStore.getCategoryReport(
                new Date(newTransaction.transaction_date).getFullYear(),
                true
            );

            await reportsStore.loadCharityStats(new Date());

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
            // ✅ get OLD transaction before update
            const old = transactions.value.find(t => t.id === transactionId);

            // ✅ call API and get UPDATED data
            const response = await api.put(`/transactions/${transactionId}`, updatedData);
            const updated = response.data.data;

            // ✅ update transaction locally
            const index = transactions.value.findIndex(t => t.id === transactionId);
            if (index !== -1) {
                transactions.value[index] = updated;
            }

            // ✅ sync category counts
            if (old && old.category_id !== updated.category_id) {
                const oldCategory = categoriesStore.categories.find(c => c.id === old.category_id);
                const newCategory = categoriesStore.categories.find(c => c.id === updated.category_id);

                if (oldCategory && oldCategory.transactions_count > 0) {
                    oldCategory.transactions_count--;
                }

                if (newCategory) {
                    newCategory.transactions_count++;
                }
            }

            // 🔥 NEW: refresh reports
            reportsStore.monthlyCache.value = {};
            reportsStore.annualCache.value = {};

            await reportsStore.getMonthlyStats(
                new Date(updated.transaction_date),
                true
            );

            transactionsCache.value = {};

            reportsStore.clearCache();

            await reportsStore.getMonthlyStats(
                new Date(updated.transaction_date),
                true
            );

            await reportsStore.getAnnualReport(
                new Date(updated.transaction_date).getFullYear(),
                true
            );

            await reportsStore.getCategoryReport(
                new Date(updated.transaction_date).getFullYear(),
                true
            );

            await reportsStore.loadCharityStats(new Date());

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
            const deleted = transactions.value.find(t => t.id === transactionId);

            await api.delete(`/transactions/${transactionId}`);

            // ✅ remove from transactions
            transactions.value = transactions.value.filter(t => t.id !== transactionId);

            // ✅ decrement category count
            if (deleted) {
                const category = categoriesStore.categories.find(
                    c => c.id === deleted.category_id
                );

                if (category && category.transactions_count > 0) {
                    category.transactions_count -= 1;
                }
            }

            showToast('Transaction deleted successfully', 'success');
        } catch (error) {
            showToast(`Failed to delete transaction: ${error.message}`, 'error');
        } finally {
            transactionsLoading.value.delete = false;
        }
    };

    const fetchTrashedTransactions = async () => {
        transactionsLoading.value.fetch = true;

        try {
            const response = await api.get('/transactions/trashed');
            trasanctionsTrash.value = response.data.data;
        } catch (error) {
            showToast(`Failed to load trashed transactions: ${error.message}`, 'error');
        } finally {
            transactionsLoading.value.fetch = false;
        }
    };

    const restoreTransaction = async (transactionId) => {
        try {
            await api.post(`/transactions/${transactionId}/restore`);

            // ✅ remove from trash immediately
            const restored = trasanctionsTrash.value.find(t => t.id === transactionId);
            trasanctionsTrash.value = trasanctionsTrash.value.filter(t => t.id !== transactionId);

            // ✅ optionally add back to main list (nice UX)
            if (restored) {
                transactions.value.unshift(restored);
            }

            transactionsCache.value = {};

            showToast('Transaction restored successfully', 'success');
        } catch (error) {
            showToast(`Failed to restore transaction: ${error.message}`, 'error');
        }
    };

    const deletePermanentlyTransaction = async (transactionId) => {
        try {
            await api.delete(`/transactions/${transactionId}/force-delete`);

            // ✅ remove from trash immediately
            trasanctionsTrash.value = trasanctionsTrash.value.filter(t => t.id !== transactionId);

            showToast('Transaction deleted permanently', 'success');
        } catch (error) {
            showToast(`Failed to delete transaction permanently: ${error.message}`, 'error');
        }
    };

    return {
        transactions,
        transactionsLoading,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        pagination,
        fetchTrashedTransactions,
        restoreTransaction,
        trasanctionsTrash,
        deletePermanentlyTransaction,
        showTrashModal
    };
});