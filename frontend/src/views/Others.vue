<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { format } from 'date-fns';
import { LayoutGrid, ArrowUpRight, ArrowDownRight } from 'lucide-vue-next';
import { useReportsStore } from '@/stores/reportsStore';
import { useCategoriesStore } from '@/stores/categoriesStore';
import { storeToRefs } from 'pinia';
import ConfirmDateChangeModal from '@/components/ConfirmDateChangeModal.vue';

const categoriesStore = useCategoriesStore();
const reportStore = useReportsStore();

const currentYear = ref(new Date().getFullYear());
const { otherStats, otherLoading } = storeToRefs(reportStore);
const pendingYear = ref(null);
const showYearModal = ref(false);

const categoryMap = computed(() => {
	const map = {};
	(categoriesStore.categories || []).forEach(c => {
		map[c.id] = c.name;
	});
	return map;
});

const handleYearChange = (newYear) => {
	if (newYear === currentYear.value) return;

	pendingYear.value = newYear;
	showYearModal.value = true;
};

const prevYear = () => {
	handleYearChange(currentYear.value - 1);
};

const nextYear = () => {
	handleYearChange(currentYear.value + 1);
};

const confirmYearChange = () => {
	if (pendingYear.value !== null) {
		currentYear.value = pendingYear.value;
	}

	showYearModal.value = false;
	pendingYear.value = null;
};

const cancelYearChange = () => {
	showYearModal.value = false;
	pendingYear.value = null;
};

const label = computed(() => String(pendingYear.value));

const formatCurrency = (amount) => {
	return new Intl.NumberFormat('en-PH', {
		style: 'currency',
		currency: 'PHP',
	}).format(amount);
};

watch(currentYear, (year) => {
	reportStore.loadOtherStats(year);
});

onMounted(async () => {
	await categoriesStore.fetchCategories();
	await reportStore.loadOtherStats(currentYear.value);
});
</script>

<template>
	<div class="space-y-8">
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div>
				<h2 class="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3 max-sm:text-2xl">
					<LayoutGrid class="w-8 h-8" />
					Others
				</h2>
				<p class="text-slate-500 mt-1">
					Monitor all transactions related to others.
				</p>
			</div>

			<div class="flex items-center max-sm:justify-around gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
				<button @click="prevYear" class="p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
					<ArrowDownRight class="w-5 h-5 rotate-90 text-slate-400" />
				</button>
				<span class="text-sm font-semibold text-slate-700 min-w-35 text-center">
					{{ currentYear }}
				</span>
				<button
					@click="nextYear"
					class="p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
					:class="{ 'cursor-not-allowed opacity-50': currentYear >= new Date().getFullYear() }"
					:disabled="currentYear >= new Date().getFullYear()"
				>
					<ArrowUpRight class="w-5 h-5 -rotate-90 text-slate-400" />
				</button>
			</div>
		</div>

		<div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
			<div class="p-6 border-b border-slate-100 flex justify-between items-center">
				<h3 class="text-lg font-bold text-slate-900">
					Tuition Related Transactions
				</h3>
				<p class="text-red-500">Total: <strong>{{ formatCurrency(otherStats.expense || 0) }}</strong></p>
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
						<tr v-if="otherLoading">
							<td colspan="4" class="px-6 py-12 text-center text-slate-400 italic">
								Loading tuition data...
							</td>
						</tr>
						<tr v-else-if="otherStats.transactions.length === 0">
							<td colspan="4" class="px-6 py-12 text-center text-slate-400 italic">
								No tuition-related transactions found for this year.
							</td>
						</tr>
						<tr v-else v-for="t in otherStats.transactions" :key="t.id"
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
	<ConfirmDateChangeModal
		:show="showYearModal"
		:label="label"
		@confirm="confirmYearChange"
		@cancel="cancelYearChange"
	/>
</template>