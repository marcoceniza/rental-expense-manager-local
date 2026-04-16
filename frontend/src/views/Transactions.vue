<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useTransactionsStore } from '@/stores/transactionsStore';
import { useCategoriesStore } from '@/stores/categoriesStore';
import { format, parseISO } from 'date-fns';
import { Plus, Search, Filter, Pencil, Trash2, X, Check } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import BaseButton from '@/components/base/BaseButton.vue';
import { useRoute } from 'vue-router';
import BasePagination from '@/components/base/BasePagination.vue';

const transactionsStore = useTransactionsStore();
const categoriesStore = useCategoriesStore();
const { categories, categoryTypes } = storeToRefs(categoriesStore);
const { transactions, transactionsLoading, pagination } = storeToRefs(transactionsStore);

const showModal = ref(false);
const editingId = ref(null);
const searchQuery = ref('');
const typeFilter = ref('all');
const isSubmitting = ref(false);
const route = useRoute();

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
		const matchesSearch = t.description.toLowerCase().includes(searchQuery.value.toLowerCase());
		const matchesType = typeFilter.value === 'all' || t.type === typeFilter.value;

		return matchesSearch && matchesType;
		
	}).sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));
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
	showModal.value = true;
};

const closeModal = () => {
	showModal.value = false;
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

const deleteTransaction = async (id) => {
	if (confirm('Are you sure you want to delete this transaction?')) {
		try {
			await transactionsStore.deleteTransaction(id);
		} catch (error) {
			console.error(error);
		}
	}
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

onMounted(() => {
	categoriesStore.fetchCategories();
});
</script>

<template>
	<div class="space-y-8">
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div>
				<h2 class="text-3xl font-bold text-slate-900 tracking-tight">Transactions</h2>
				<p class="text-slate-500 mt-1">Manage all your financial records in one place.</p>
			</div>
			<button @click="openModal()"
				class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95">
				<Plus class="w-5 h-5" />
				Add Transaction
			</button>
		</div>

		<div
			class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
			<div class="relative flex-1 w-full">
				<Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
				<input v-model="searchQuery" type="text" placeholder="Search transactions..."
					class="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" />
			</div>

			<div class="flex items-center gap-2 w-full md:w-auto">
				<Filter class="w-5 h-5 text-slate-400" />
				<select v-model="typeFilter"
					class="bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700 min-w-37.5 cursor-pointer">
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
							<th class="px-6 py-4 text-center">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						<tr v-if="transactionsLoading.fetch">
							<td colspan="5" class="px-6 py-12 text-center text-slate-400 italic">
								Loading transactions...
							</td>
						</tr>
						<tr v-else-if="filteredTransactions.length === 0">
							<td colspan="5"
								class="px-6 py-12 text-center text-slate-400 italic">
								No transactions found matching your criteria.
							</td>
						</tr>
						<tr v-else v-for="t in filteredTransactions" :key="t.id"
							class="hover:bg-slate-50 transition-colors group">
							<td class="px-6 py-4 text-sm text-slate-600">{{ format(parseISO(t.transaction_date), 'MMM dd, yyyy') }}</td>
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
							<td class="px-6 py-4">
								<div
									class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
									<button @click="openModal(t)"
										class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
										<Pencil class="w-4 h-4" />
									</button>
									<button @click="deleteTransaction(t.id)"
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

		<div v-if="showModal"
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
			<div
				class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
				<div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
					<h3 class="text-xl font-bold text-slate-900">{{ editingId ? 'Edit Transaction' : 'New Transaction'
					}}</h3>
					<button @click="closeModal" class="p-2 hover:bg-white rounded-lg transition-colors">
						<X class="w-5 h-5 text-slate-400" />
					</button>
				</div>

				<form @submit.prevent="handleSubmit" class="p-6 space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-500 uppercase">Date</label>
							<input v-model="formData.transaction_date" type="date" required
								class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
						</div>
						<div class="space-y-1.5">
							<label class="text-xs font-bold text-slate-500 uppercase">Type</label>
							<select v-model="formData.type"
								class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium">
								<option v-for="type in categoryTypes" :key="type" :value="type">
									{{ type }}
								</option>
							</select>
						</div>
					</div>

					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-500 uppercase">Category</label>
						<select v-model="formData.category_id" required
							class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium">
							<option value="" disabled>Select a category</option>
							<option v-for="c in filteredCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
						</select>
					</div>

					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-500 uppercase">Description</label>
						<input v-model="formData.description" type="text" required
							placeholder="e.g., Rent Payment - Unit 101"
							class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
					</div>

					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-500 uppercase">Amount (PHP)</label>
						<input v-model.number="formData.amount" type="number" step="0.01" required
							class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg" />
					</div>

					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-500 uppercase">Remarks (Optional)</label>
						<textarea v-model="formData.remarks" rows="2" placeholder="Add any additional notes..."
							class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none"></textarea>
					</div>

					<div class="pt-4 flex gap-3">
						<BaseButton type="button" fullWidth variant="secondary" @click="closeModal" title="Cancel">
                            Cancel
                        </BaseButton>
                        <BaseButton type="submit" fullWidth variant="primary" :title="editingId ? 'Update Category' : 'Add Category'" :disabled="isSubmitting">
                            <Check class="w-5 h-5" />
                            <span v-if="isSubmitting">
								{{ editingId ? 'Updating...' : 'Saving...' }}
							</span>
							<span v-else>
								{{ editingId ? 'Update' : 'Save' }}
							</span>
                        </BaseButton>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>