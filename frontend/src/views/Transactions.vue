<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useTransactionsStore } from '@/stores/transactionsStore';
import { useCategoriesStore } from '@/stores/categoriesStore';
import { format, parseISO } from 'date-fns';
import { Plus, Search, Filter, Pencil, Trash2, X, RotateCcw, AlertCircle, ReceiptText } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import BasePagination from '@/components/base/BasePagination.vue';
import TransactionModal from '@/components/TransactionModal.vue';
import ConfirmDelete from '@/components/ConfirmDelete.vue';
import { useAuthStore } from '@/stores/authStore';

const transactionsStore = useTransactionsStore();
const categoriesStore = useCategoriesStore();
const { categories, categoryTypes } = storeToRefs(categoriesStore);
const { transactions, transactionsLoading, pagination, trasanctionsTrash, showTrashModal } = storeToRefs(transactionsStore);
const authStore = useAuthStore();

const showTransactionModal = ref(false);
const editingId = ref(null);
const searchQuery = ref('');
const typeFilter = ref('all');
const isSubmitting = ref(false);
const route = useRoute();
const isShowingDeleteConfirm = ref(false);
const getConfirmDeleteData = ref({
	id: null,
	name: '',
});

const formData = ref({
	transaction_date: format(new Date(), 'yyyy-MM-dd'),
	type: 'income',
	category_id: '',
	description: '',
	amount: 0,
	remarks: ''
});

const filteredTransactions = computed(() => {
	return transactions.value.filter(t => {
		const search = searchQuery.value.toLowerCase();

		const fields = [
			t.description,
			t.category?.name,
			t.type,
			t.amount,
			new Date(t.transaction_date).toLocaleDateString()
		];

		const matchesSearch = fields.some(field =>
			String(field ?? '').toLowerCase().includes(search)
		);

		const matchesType = typeFilter.value === 'all' || t.type === typeFilter.value;

		const matchesTuition = t.category?.is_tuition !== true;

		return matchesSearch && matchesType && matchesTuition;
	});
});

const filteredCategories = computed(() => {
	return categories.value.filter(c => c.type === formData.value.type);
});

const openModal = (t) => {
	if (t) {
		editingId.value = t.id;
		formData.value = {
			...t,
			transaction_date: t.transaction_date
				? format(parseISO(t.transaction_date), 'yyyy-MM-dd')
				: ''
		};
	} else {
		editingId.value = null;
		formData.value = {
			transaction_date: format(new Date(), 'yyyy-MM-dd'),
			type: 'income',
			category_id: '',
			description: '',
			amount: 0,
			remarks: ''
		};
	}
	showTransactionModal.value = true;
};

const closeModal = () => {
	showTransactionModal.value = false;
	editingId.value = null;
};

const handleSubmit = async () => {

	if (isSubmitting.value) return;

	isSubmitting.value = true;
	try {
		if (editingId.value) {
			await transactionsStore.updateTransaction(editingId.value, formData.value);
		} else {
			await transactionsStore.addTransaction(formData.value);
		}

		closeModal();
	} catch (error) {
		console.error(error);
	} finally {
		isSubmitting.value = false;
	}
};

const deleteTransaction = async () => {
	await transactionsStore.deleteTransaction(getConfirmDeleteData.value.id);
	isShowingDeleteConfirm.value = false;
};

const formatCurrency = (amount) => {
	return new Intl.NumberFormat('en-PH', {
		style: 'currency',
		currency: 'PHP',
	}).format(amount);
};

watch(() => route.query.page, () => {
	const page = Number(route.query.page) || 1;
	transactionsStore.fetchTransactions(page);
}, { immediate: true });

const confirmDeleteHandler = (id, name) => {
	isShowingDeleteConfirm.value = true;
	getConfirmDeleteData.value.id = id;
	getConfirmDeleteData.value.name = name;
};

const getTransactionTrashedLength = computed(() => trasanctionsTrash.value.length);

onMounted(() => {
    categoriesStore.fetchCategories();

    if (authStore.user?.user_type === 'admin') {
        transactionsStore.fetchTrashedTransactions();
    }
});
</script>

<template>
	<div class="space-y-8">
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div>
				<h2 class="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3 max-sm:text-2xl">
					<ReceiptText class="w-8 h-8" />
					Transactions
				</h2>
				<p class="text-slate-500 mt-1">Manage all your financial records in one place.</p>
			</div>
			<div v-if="authStore.user?.user_type === 'admin'" class="flex items-center gap-3 max-sm:justify-end">
				<button @click="showTrashModal = true"
					class="relative p-3 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-all shadow-sm group cursor-pointer">
					<Trash2 class="w-5 h-5 group-hover:scale-110 transition-transform" />
					<span
						v-show="getTransactionTrashedLength > 0"
						class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
						{{ getTransactionTrashedLength }}
					</span>
				</button>
				<button @click="openModal()"
					class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95 cursor-pointer">
					<Plus class="w-5 h-5" />
					Add Transaction
				</button>
			</div>
		</div>

		<div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
			<div class="relative flex-1 w-full">
				<Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
				<input v-model="searchQuery" type="text" placeholder="Search transactions..."
					class="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" />
			</div>

			<div class="flex items-center gap-2 w-full md:w-auto">
				<Filter class="w-5 h-5 text-slate-400" />
				<select v-model="typeFilter"
					class="bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700 min-w-37.5 max-sm:w-full cursor-pointer">
					<option value="all">All Types</option>
					<option value="income">Income</option>
					<option value="expense">Expense</option>
					<option value="liability">Liability</option>
				</select>
			</div>
		</div>

		<div class="bg-white rounded-2xl shadow-sm border border-slate-200">
			<div class="overflow-x-auto">
				<table class="w-full text-left">
					<thead class="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
						<tr>
							<th class="px-6 py-4">Date</th>
							<th class="px-6 py-4">Description</th>
							<th class="px-6 py-4">Category</th>
							<th class="px-6 py-4 text-right">Amount</th>
							<th v-if="authStore.user?.user_type === 'admin'" class="px-6 py-4 text-center">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						<tr v-if="transactionsLoading.fetch">
							<td colspan="5" class="px-6 py-12 text-center text-slate-400 italic">
								Loading transactions...
							</td>
						</tr>
						<tr v-else-if="filteredTransactions.length === 0">
							<td colspan="5" class="px-6 py-12 text-center text-slate-400 italic">
								No transactions found matching your criteria.
							</td>
						</tr>
						<tr v-else v-for="t in filteredTransactions" :key="t.id"
							class="hover:bg-slate-50 transition-colors group">
							<td class="px-6 py-4 text-sm text-slate-600">
								<div class="flex flex-col">
									<span class="font-medium text-slate-800">
										{{ format(parseISO(t.transaction_date), 'MMM dd, yyyy') }}
									</span>
								</div>
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
									{{categories.find(c => c.id === Number(t.category_id))?.name || 'Uncategorized'}}
								</span>
							</td>
							<td class="px-6 py-4 text-right">
								<span class="text-sm font-bold"
									:class="t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'">
									{{ t.type === 'income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
								</span>
							</td>
							<td v-if="authStore.user?.user_type === 'admin'" class="px-6 py-4">
								<div
									class="flex items-center justify-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
									<button @click="openModal(t)"
										class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
										<Pencil class="w-4 h-4" />
									</button>
									<button @click="confirmDeleteHandler(t.id, t.description)"
										class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
										<Trash2 class="w-4 h-4" />
									</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
				<BasePagination v-if="pagination.last_page && pagination.last_page > 1" :pagination="pagination" />
			</div>
		</div>

		<TransactionModal v-model:isOpen="showTransactionModal" :editingId="editingId" :formData="formData"
			:categoryTypes="categoryTypes" :filteredCategories="filteredCategories" :isSubmitting="isSubmitting"
			@submit="handleSubmit" />

		<ConfirmDelete v-if="isShowingDeleteConfirm" :isOpen="true" title="Delete Transaction"
			:message="getConfirmDeleteData.name" :loading="transactionsLoading.delete" @confirm="deleteTransaction()"
			@close="isShowingDeleteConfirm = false" actionName="transaction" />

		<div v-if="showTrashModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
			<div
				class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
				<div class="p-6 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
					<div class="flex items-center gap-3 text-red-600">
						<Trash2 class="w-6 h-6" />
						<h3 class="text-xl font-bold">Trash Bin</h3>
					</div>
					<button @click="showTrashModal = false" class="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
						<X class="w-5 h-5 text-slate-400" />
					</button>
				</div>

				<div class="max-h-[60vh] overflow-y-auto">
					<table v-if="trasanctionsTrash.length > 0" class="w-full text-left">
						<thead class="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold sticky top-0 z-10">
							<tr>
								<th class="px-6 py-3">Details</th>
								<th class="px-6 py-3 text-right">Amount</th>
								<th class="px-6 py-3 text-right">Deleted Date</th>
								<th class="px-6 py-3 text-center">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							<tr
								v-for="trash in trasanctionsTrash" :key="trash.id"
								class="hover:bg-slate-50 transition-colors">
								<td class="px-6 py-4">
									<p class="text-xs text-slate-500 mb-1">{{ format(parseISO(trash.transaction_date), 'MMM dd, yyyy') }}</p>
									<p class="text-sm font-bold text-slate-900">{{ trash.description }}</p>
									<p class="text-[10px] text-slate-600 mt-0.5">{{ trash.type.toUpperCase() }}</p>
								</td>
								<td class="px-6 py-4 text-right">
									<span class="text-sm font-bold text-slate-600">
										{{ formatCurrency(trash.amount) }}
									</span>
								</td>
								<td class="px-6 py-4 text-right">
									<p class="text-xs">{{ format(parseISO(trash.deleted_at), 'MMM dd, yyyy') }}</p>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center justify-center gap-2">
										<button
											@click="transactionsStore.restoreTransaction(trash.id)"
											class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
											title="Restore">
											<RotateCcw class="w-4 h-4" />
										</button>
										<button
											@click="transactionsStore.deletePermanentlyTransaction(trash.id)"
											class="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
											title="Delete Permanently">
											<Trash2 class="w-4 h-4" />
										</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>

					<div v-else class="p-12 text-center text-slate-400 flex flex-col items-center gap-4">
						<AlertCircle class="w-12 h-12 opacity-20" />
						<p class="italic">The trash bin is currently empty.</p>
					</div>
				</div>

				<div class="p-6 bg-slate-50 border-t border-slate-100 text-right">
					<button @click="showTrashModal = false"
						class="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
						Close
					</button>
				</div>
			</div>
		</div>

	</div>
</template>