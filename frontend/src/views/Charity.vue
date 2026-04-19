<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { format, subMonths, addMonths } from 'date-fns';
import { Heart, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Wallet } from 'lucide-vue-next';
import { useReportsStore } from '@/stores/reportsStore';
import { useCategoriesStore } from '@/stores/categoriesStore';
import { useTransactionsStore } from '@/stores/transactionsStore';
import { storeToRefs } from 'pinia';

const categoriesStore = useCategoriesStore();
const transactionsStore = useTransactionsStore();
const reportStore = useReportsStore();
const currentMonth = ref(new Date());
const { charityStats, charityLoading } = storeToRefs(reportStore);

const categoryMap = computed(() => {
	const map = {};
	categoriesStore.categories.forEach(c => {
		map[c.id] = c.name;
	});
	return map;
});

const prevMonth = () => {
	currentMonth.value = subMonths(currentMonth.value, 1);
};

const nextMonth = () => {
	currentMonth.value = addMonths(currentMonth.value, 1);
};

const formatCurrency = (amount) => {
	return new Intl.NumberFormat('en-PH', {
		style: 'currency',
		currency: 'PHP',
	}).format(amount);
};

watch(currentMonth, (month) => {
	reportStore.loadCharityStats(month);
});

const charityAreaChart = computed(() => {
	const expense = Number(charityStats.value.expense) || 0;

	return {
		series: [
			{
				name: 'Tuition Expense',
				data: [0, expense], // subtle sparkline effect
			},
		],

		options: {
			chart: {
				type: 'area',
				sparkline: {
					enabled: false,
				},
				toolbar: { show: false },
				animations: {
					enabled: true,
					easing: 'easeinout',
					speed: 600,
				},
			},

			stroke: {
				curve: 'smooth',
				width: 3,
			},

			fill: {
				type: 'gradient',
				gradient: {
					shadeIntensity: 1,
					opacityFrom: 0.4,
					opacityTo: 0.05,
					stops: [0, 100],
				},
			},

			xaxis: {
				categories: ['Start', 'This Month'],
				labels: {
					show: false,
				},
				axisBorder: {
					show: false,
				},
				axisTicks: {
					show: false,
				},
			},

			yaxis: {
				labels: {
					formatter: (val) => {
					if (val >= 1000) return `₱${(val / 1000).toFixed(1)}K`;
					return `₱${val}`;
					},
				},
			},

			dataLabels: {
				enabled: false,
			},

			colors: ['#ef4444'],

			grid: {
				show: false,
			},

			tooltip: {
				y: {
					formatter: (val) => {
						if (val >= 1000) return `₱${(val / 1000).toFixed(1)}K`;
						return `₱${val}`;
					},
				},
			},
		},
	};
});

onMounted(async () => {
	await categoriesStore.fetchCategories();
	await transactionsStore.fetchTransactions();
	await reportStore.loadCharityStats(currentMonth.value);
});
</script>

<template>
	<div class="space-y-8">
		<!-- Header -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div>
				<h2 class="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
					<Heart class="w-8 h-8 text-rose-500 fill-rose-500" />
					Charity & Tuition
				</h2>
				<p class="text-slate-500 mt-1">
					Monitor all transactions related to tuition and educational support.
				</p>
			</div>

			<div class="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
				<button @click="prevMonth" class="p-2 hover:bg-slate-50 rounded-lg transition-colors">
					<ArrowDownRight class="w-5 h-5 rotate-90 text-slate-400" />
				</button>

				<span class="text-sm font-semibold text-slate-700 min-w-35 text-center">
					{{ format(currentMonth, 'MMMM yyyy') }}
				</span>

				<button @click="nextMonth" class="p-2 hover:bg-slate-50 rounded-lg transition-colors">
					<ArrowUpRight class="w-5 h-5 -rotate-90 text-slate-400" />
				</button>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
				<apexchart
					v-if="!charityLoading"
					type="line"
					height="300"
					:options="charityAreaChart.options"
					:series="charityAreaChart.series"
				/>

				<div v-else class="text-center text-slate-400 italic py-12">
					No data available for this year.
				</div>
			</div>

			<div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
				<div class="flex items-center gap-3 mb-4">
					<div class="p-2 bg-rose-50 text-rose-600 rounded-lg">
						<TrendingDown class="w-5 h-5" />
					</div>
					<p class="text-sm font-bold text-slate-500 uppercase tracking-wider">
						Tuition Expense
					</p>
				</div>
				<h3 class="text-2xl font-bold text-slate-900">
					{{ formatCurrency(charityStats.expense || 0) }}
				</h3>
			</div>
		</div>

		<div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
			<div class="p-6 border-b border-slate-100">
				<h3 class="text-lg font-bold text-slate-900">
					Tuition Related Transactions
				</h3>
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
						<tr v-if="charityLoading">
							<td colspan="4" class="px-6 py-12 text-center text-slate-400 italic">
								Loading tuition data...
							</td>
						</tr>
						<tr v-else-if="charityStats.transactions.length === 0">
							<td colspan="4" class="px-6 py-12 text-center text-slate-400 italic">
								No tuition-related transactions found for this month.
							</td>
						</tr>
						<tr v-else v-for="t in charityStats.transactions" :key="t.id"
							class="hover:bg-slate-50 transition-colors">
							<td class="px-6 py-4 text-sm text-slate-600">
								{{ format(new Date(t.transaction_date), 'MMM dd, yyyy') }}
							</td>
							<td class="px-6 py-4">
								<p class="text-sm font-medium text-slate-900">
									{{ t.description }}
								</p>
								<p v-if="t.remarks" class="text-xs text-slate-400 mt-0.5">
									{{ t.remarks }}
								</p>
							</td>
							<td class="px-6 py-4">
								<span
									class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
									{{ categoryMap[t.category_id] || 'Uncategorized' }}
								</span>
							</td>
							<td class="px-6 py-4 text-right">
								<span class="text-sm font-bold"
									:class="t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'">
									{{ t.type === 'income' ? '+' : '-' }}
									{{ formatCurrency(t.amount) }}
								</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>