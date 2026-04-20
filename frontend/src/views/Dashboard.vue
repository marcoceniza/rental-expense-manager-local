<script setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { format, subMonths, addMonths, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, CreditCard, LayoutDashboard } from 'lucide-vue-next';
import SpinnerLoader from '@/components/SpinnerLoader.vue';
import { useTransactionsStore } from '@/stores/transactionsStore';
import { useCategoriesStore } from '@/stores/categoriesStore';
import { useReportsStore } from '@/stores/reportsStore';

const transactionsStore = useTransactionsStore();
const categoriesStore = useCategoriesStore();
const reportsStore = useReportsStore();
const { transactions, transactionsLoading } = storeToRefs(transactionsStore);
const { categories } = storeToRefs(categoriesStore);
const { monthlyReport, monthlyLoading } = storeToRefs(reportsStore);
const { fetchTransactions } = transactionsStore;
const { fetchCategories } = categoriesStore;
const { getMonthlyStats, getAnnualReport } = reportsStore;
const currentMonth = ref(new Date());

const prevMonth = () => {
    currentMonth.value = subMonths(currentMonth.value, 1);
    getMonthlyStats(currentMonth.value);
};

const nextMonth = () => {
    currentMonth.value = addMonths(currentMonth.value, 1);
    getMonthlyStats(currentMonth.value);
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
};

const monthlyDonutSeries = computed(() => [
    Number(monthlyReport.value?.income) || 0,
    Number(monthlyReport.value?.expense) || 0,
    Number(monthlyReport.value?.liability) || 0,
]);

const monthlyDonutOptions = {
    labels: ['Income', 'Expense', 'Liability'],
    colors: ['#22c55e', '#ef4444', '#f59e0b'],
    legend: { position: 'bottom' },
    responsive: [{
        breakpoint: 480,
        options: { chart: { width: 300 },
        legend: { position: 'bottom' } } 
    }],
};

onMounted(() => {
    fetchTransactions();
    fetchCategories();
    getAnnualReport(new Date().getFullYear());
    getMonthlyStats(currentMonth.value);
});
</script>

<template>
    <div class="space-y-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 class="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <LayoutDashboard class="w-8 h-8" />
                    Financial Overview
                </h2>
                <p class="text-slate-500 mt-1">
                    Track your rental income and expenses efficiently.
                </p>
            </div>
            <div class="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                <button @click="prevMonth" class="p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                    <ArrowDownRight class="w-5 h-5 rotate-90 text-slate-400" />
                </button>
                <span class="text-sm font-semibold text-slate-700 min-w-35 text-center">
                    {{ format(currentMonth, 'MMMM yyyy') }}
                </span>
                <button @click="nextMonth" class="p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                    <ArrowUpRight class="w-5 h-5 -rotate-90 text-slate-400" />
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
                class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-200 transition-colors group">
                <div class="flex items-center justify-between mb-4">
                    <div
                        class="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <TrendingUp class="w-6 h-6" />
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                        Total Income
                    </p>
                    <SpinnerLoader v-if="monthlyLoading" color="blue" />
                    <h3 v-else class="text-2xl font-bold text-slate-900 mt-1">
                        {{ formatCurrency(monthlyReport?.income || 0) }}
                    </h3>
                </div>
            </div>

            <div
                class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-red-200 transition-colors group">
                <div class="flex items-center justify-between mb-4">
                    <div
                        class="p-3 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <TrendingDown class="w-6 h-6" />
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                        Total Expenses
                    </p>
                    <SpinnerLoader v-if="monthlyLoading" color="blue" />
                    <h3 v-else class="text-2xl font-bold text-slate-900 mt-1">
                        {{ formatCurrency(monthlyReport?.expense || 0) }}
                    </h3>
                </div>
            </div>

            <div
                class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-amber-200 transition-colors group">
                <div class="flex items-center justify-between mb-4">
                    <div
                        class="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <CreditCard class="w-6 h-6" />
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                        Liabilities
                    </p>
                    <SpinnerLoader v-if="monthlyLoading" color="blue" />
                    <h3 v-else class="text-2xl font-bold text-slate-900 mt-1">
                        {{ formatCurrency(monthlyReport?.liability || 0) }}
                    </h3>
                </div>
            </div>

            <div
                class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-200 transition-colors group">
                <div class="flex items-center justify-between mb-4">
                    <div
                        class="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Wallet class="w-6 h-6" />
                    </div>
                </div>
                <div>
                    <p class="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                        Net Balance
                    </p>
                    <SpinnerLoader v-if="monthlyLoading" color="blue" />
                    <h3 v-else class="text-2xl font-bold text-slate-900 mt-1"
                        :class="monthlyReport?.net >= 0 ? 'text-emerald-600' : 'text-red-600'">
                        {{ formatCurrency(monthlyReport?.net || 0) }}
                    </h3>
                </div>
            </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-6">
            <div
                class="lg:w-1/4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                <h3 class="xl:text-xl lg:mt-2.5 lg:text-center text-lg font-bold text-slate-900 mb-4 w-full">
                    Monthly Overview
                </h3>

                <div v-if="monthlyLoading" class="text-center text-slate-400 italic py-12">
                    Loading chart...
                </div>
                <apexchart
                    v-else
                    type="donut"
                    height="280"
                    :options="monthlyDonutOptions"
                    :series="monthlyDonutSeries"
                />
            </div>

            <div class="lg:w-4/5 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 class="text-lg font-bold text-slate-900">Recent Activity</h3>
                    <RouterLink to="/transactions" class="text-sm font-semibold text-blue-600 hover:text-blue-700">
                        View All
                    </RouterLink>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th class="px-6 py-4">Date</th>
                                <th class="px-6 py-4">Description</th>
                                <th class="px-6 py-4">Category</th>
                                <th class="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-if="transactionsLoading.fetch">
                                <td colspan="5" class="px-6 py-12 text-center text-slate-400 italic">
                                    Loading transactions...
                                </td>
                            </tr>
                            <tr v-else-if="transactions.length === 0">
                                <td colspan="4" class="px-6 py-12 text-center text-slate-400 italic">
                                    No transactions recorded yet.
                                </td>
                            </tr>
                            <tr v-else v-for="t in transactions.slice(0, 5)" :key="t.id"
                                class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 text-sm text-slate-600">
                                    {{ format(parseISO(t.transaction_date), 'MMM dd, yyyy') }}
                                </td>
                                <td class="px-6 py-4">
                                    <p class="text-sm font-medium text-slate-900">{{ t.description }}</p>
                                    <p v-if="t.remarks" class="text-xs text-slate-400 mt-0.5">{{ t.remarks }}</p>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold" :class="{
                                        'bg-blue-50 text-blue-600': t.type === 'income',
                                        'bg-red-50 text-red-600': t.type === 'expense',
                                        'bg-amber-50 text-amber-600': t.type === 'liability'
                                    }">
                                        {{categories.find(c => c.id === Number(t.category_id))?.name || 'Uncategorized'
                                        }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <span class="text-sm font-bold"
                                        :class="t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'">
                                        {{ t.type === 'income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>