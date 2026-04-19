import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import api from '@/lib/axios';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, format, eachMonthOfInterval, isValid, isWithinInterval } from 'date-fns';
import { useCategoriesStore } from '@/stores/categoriesStore';
import { useTransactionsStore } from '@/stores/transactionsStore';

export const useReportsStore = defineStore('reports', () => {
    const monthlyReport = ref({});
    const annualReport = ref({});
    const categoryReport = ref([]);
    const monthlyCache = ref({});
    const annualCache = ref({});
    const monthlyLoading = ref(false);
    const annualLoading = ref(false);
    const categoryLoading = ref(false);
    const charityLoading = ref(false);
    const categoriesStore = useCategoriesStore();
    const transactionsStore = useTransactionsStore();
    const charityStats = ref({
        income: 0,
        expense: 0,
        net: 0,
        transactions: []
    });
    const clearCache = () => {
        monthlyCache.value = {};
        annualCache.value = {};
    };

    const getMonthlyStats = async (date, force = false) => {
        const key = format(date, 'yyyy-MM');

        if (monthlyCache.value[key] && !force) {
            monthlyReport.value = monthlyCache.value[key];
            return;
        }

        monthlyLoading.value = true;

        try {
            const start = format(startOfMonth(date), 'yyyy-MM-dd');
            const end = format(endOfMonth(date), 'yyyy-MM-dd');

            const response = await api.get('/reports/summary', {
                params: { start_date: start, end_date: end }
            });

            const data = {
                income: Number(response.data.income) || 0,
                expense: Number(response.data.expenses) || 0,
                liability: Number(response.data.liabilities) || 0,
                net: Number(response.data.net) || 0
            };

            monthlyReport.value = data;
            monthlyCache.value[key] = data;

        } catch (error) {
            console.error('Error fetching monthly stats:', error);
        } finally {
            monthlyLoading.value = false;
        }
    };

    const getCategoryReport = async (year, force = false) => {
        if (categoryReport.value.length > 0 && !force) return;

        categoryLoading.value = true;
        try {
            const response = await api.get('/reports/category-summary', { params: { year } });
            categoryReport.value = response.data;
        } catch (error) {
            console.error('Error fetching category report:', error);
        } finally {
            categoryLoading.value = false;
        }
    };

    const getAnnualReport = async (year, force = false) => {
        const key = year;

        if (annualCache.value[key] && !force) {
            annualReport.value = annualCache.value[key];
            return;
        }

        annualLoading.value = true;

        try {
            const start = startOfYear(new Date(year, 0, 1));
            const end = endOfYear(new Date(year, 0, 1));

            const months = eachMonthOfInterval({ start, end });

            const monthly = [];

            for (const month of months) {
                const res = await api.get('/reports/summary', {
                    params: {
                        start_date: format(startOfMonth(month), 'yyyy-MM-dd'),
                        end_date: format(endOfMonth(month), 'yyyy-MM-dd')
                    }
                });

                monthly.push({
                    month: format(month, 'MMMM'),
                    income: Number(res.data.income) || 0,
                    expense: Number(res.data.expenses) || 0,
                    liability: Number(res.data.liabilities) || 0,
                    net: Number(res.data.net) || 0
                });
            }

            const totals = monthly.reduce((acc, m) => {
                acc.income += m.income;
                acc.expense += m.expense;
                acc.liability += m.liability;
                acc.net += m.net;
                return acc;
            }, { income: 0, expense: 0, liability: 0, net: 0 });

            const finalData = { monthly, totals };

            annualReport.value = finalData;
            annualCache.value[key] = finalData;

        } catch (error) {
            console.error('Error fetching annual report:', error);
        } finally {
            annualLoading.value = false;
        }
    };

    const loadCharityStats = async (month) => {
        charityLoading.value = true;

        try {
            const start = startOfMonth(month);
            const end = endOfMonth(month);

            const tuitionCategoryIds = (categoriesStore.categories || [])
                .filter(c => Boolean(c.is_tuition))
                .map(c => Number(c.id));

            const filtered = (transactionsStore.transactions || []).filter(t => {
                if (!t.transaction_date || typeof t.transaction_date !== 'string') return false;

                const date = new Date(t.transaction_date);
                if (!isValid(date)) return false;

                return (
                    isWithinInterval(date, { start, end }) &&
                    tuitionCategoryIds.includes(Number(t.category_id))
                );
            });

            // 🔥 ONLY EXPENSE
            const expense = filtered
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Number(t.amount), 0);

            charityStats.value = {
                expense,
                transactions: filtered
                    .filter(t => t.type === 'expense') // optional: only expense in table
                    .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
            };

        } catch (error) {
            console.error('Error fetching charity stats:', error);
        } finally {
            charityLoading.value = false;
        }
    };

    return {
        monthlyReport,
        annualReport,
        monthlyLoading,
        annualLoading,
        categoryLoading,
        getMonthlyStats,
        getAnnualReport,
        categoryReport,
        getCategoryReport,
        loadCharityStats,
        charityLoading,
        charityStats,
        monthlyCache,
        annualCache,
        clearCache
    };
});