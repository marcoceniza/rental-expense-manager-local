import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, format } from 'date-fns';
import api from '@/lib/axios';

export const useFinanceStore = defineStore('finance', () => {
    const reports = ref({});
    const reportLoading = ref(false);
    const transactions = ref(JSON.parse(localStorage.getItem('transactions') || '[]'));
    const categories = ref(JSON.parse(localStorage.getItem('categories') || '[]'));
    const recurringTransactions = ref(JSON.parse(localStorage.getItem('recurring_transactions') || '[]'));

    // Initial categories if empty
    if (categories.value.length === 0) {
        categories.value = [
            // Income
            { id: '1', name: 'Rental Income (Ground Floor)', type: 'income' },
            { id: '2', name: 'Rental Income (2nd Floor)', type: 'income' },
            // Fixed Expenses
            { id: '3', name: 'Salaries (Toto)', type: 'expense' },
            { id: '4', name: 'Salaries (Inday)', type: 'expense' },
            { id: '5', name: 'Salaries (Bookkeeper)', type: 'expense' },
            { id: '6', name: 'Utilities (Electricity)', type: 'expense' },
            { id: '7', name: 'Utilities (Water)', type: 'expense' },
            { id: '8', name: 'Utilities (Internet)', type: 'expense' },
            // Variable Expenses
            { id: '9', name: 'Maintenance', type: 'expense' },
            { id: '10', name: 'Repairs', type: 'expense' },
            { id: '11', name: 'Permits/Taxes/Insurance', type: 'expense' },
            { id: '12', name: 'Miscellaneous', type: 'expense' },
            // Liabilities
            { id: '13', name: 'Loan Payments', type: 'liability' },
            { id: '14', name: 'Land Rental', type: 'liability' },
            { id: '15', name: 'Property Obligations', type: 'liability' },
        ];
    }

    // watch(transactions, (val) => localStorage.setItem('transactions', JSON.stringify(val)), { deep: true });
    // watch(categories, (val) => localStorage.setItem('categories', JSON.stringify(val)), { deep: true });
    // watch(recurringTransactions, (val) => localStorage.setItem('recurring_transactions', JSON.stringify(val)), { deep: true });

    const addTransaction = (t) => {
        transactions.value.push({ ...t, id: uuidv4() });
    };

    const updateTransaction = (t) => {
        const index = transactions.value.findIndex(item => item.id === t.id);
        if (index !== -1) transactions.value[index] = t;
    };

    const deleteTransaction = (id) => {
        transactions.value = transactions.value.filter(t => t.id !== id);
    };

    const addRecurring = (r) => {
        recurringTransactions.value.push({ ...r, id: uuidv4() });
    };

    const deleteRecurring = (id) => {
        recurringTransactions.value = recurringTransactions.value.filter(r => r.id !== id);
    };

    const addCategory = (c) => {
        categories.value.push({ ...c, id: uuidv4() });
    };

    const updateCategory = (c) => {
        const index = categories.value.findIndex(item => item.id === c.id);
        if (index !== -1) categories.value[index] = c;
    };

    const deleteCategory = (id) => {
        // Check if category is used in transactions or recurring
        const isUsed = transactions.value.some(t => t.categoryId === id) ||
            recurringTransactions.value.some(r => r.categoryId === id);

        if (isUsed) {
            throw new Error('Cannot delete category because it is being used in transactions or recurring payments.');
        }

        categories.value = categories.value.filter(c => c.id !== id);
    };

    const getMonthlyStats = async (date) => {
        reportLoading.value = true;
        try {
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const response = await api.get('/reports/summary', {
                params: {
                    start_date: format(start, 'yyyy-MM-dd'),
                    end_date: format(end, 'yyyy-MM-dd')
                }
            });

            reports.value = response.data;

        } catch (error) {
            console.error('Error fetching monthly stats:', error);
        } finally {
            reportLoading.value = false;
        }
    };

    getMonthlyStats();

    const processRecurring = (month) => {
        const existingForMonth = transactions.value.filter(t => t.date.startsWith(month));

        recurringTransactions.value.forEach(rt => {
            const alreadyExists = existingForMonth.some(t => t.description === `[Recurring] ${rt.description}`);
            if (!alreadyExists) {
                addTransaction({
                    date: `${month}-01`,
                    type: categories.value.find(c => c.id === rt.categoryId)?.type || 'expense',
                    categoryId: rt.categoryId,
                    description: `[Recurring] ${rt.description}`,
                    amount: rt.amount,
                    remarks: 'Auto-generated recurring transaction'
                });
            }
        });
    };

    return {
        transactions,
        categories,
        recurringTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addRecurring,
        deleteRecurring,
        addCategory,
        updateCategory,
        deleteCategory,
        getMonthlyStats,
        processRecurring,
        reports,
        reportLoading
    };
});