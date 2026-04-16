<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCategoriesStore } from '@/stores/categoriesStore';
import { Plus, Search, Filter, Pencil, Trash2, X, Check, Tag } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import BaseButton from '@/components/base/BaseButton.vue';
import ConfirmDelete from '@/components/ConfirmDelete.vue';

const categoriesStore = useCategoriesStore();
const { categories, categoriesLoading, categoryTypes, errors } = storeToRefs(categoriesStore);

const showModal = ref(false);
const editingId = ref(null);
const searchQuery = ref('');
const typeFilter = ref('all');
const isSubmitting = ref(false);
const isShowingDeleteConfirm = ref(false);
const getConfirmDeleteData = ref({
    id: null,
    name: '',
});

const formData = ref({
    name: '',
    type: 'expense',
    is_tuition: false
});

const filteredCategories = computed(() => {
    return categories.value.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.value.toLowerCase());
            const matchesType = typeFilter.value === 'all' || c.type === typeFilter.value;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
});

const openModal = (c) => {
    if (c) {
        editingId.value = c.id;
        formData.value = { ...c };
    } else {
        editingId.value = null;
        formData.value = {
            name: '',
            type: 'expense',
            is_tuition: false
        };
    }
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    editingId.value = null;

	formData.value = {
		name: '',
		type: 'income',
		is_tuition: false
	};

	errors.value = {}; 
};

const handleSubmit = async () => {
	if (isSubmitting.value) return;

	isSubmitting.value = true;
	try {
		if (editingId.value) {
			await categoriesStore.updateCategory(editingId.value, formData.value);
		} else {
			await categoriesStore.addCategory(formData.value);
		}

		closeModal();
	} catch (error) {
		console.error(error);
	} finally {
		isSubmitting.value = false;
	}
};
    
const confirmDeleteHandler = (id, name) => {
    isShowingDeleteConfirm.value = true;
    getConfirmDeleteData.value.id = id;
    getConfirmDeleteData.value.name = name;
};

const deleteCategory = async () => {
    await categoriesStore.deleteCategory(getConfirmDeleteData.value.id);
    isShowingDeleteConfirm.value = false;
};

onMounted(() => {
    categoriesStore.fetchCategories();
});
</script>

<template>
    <div class="space-y-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Categories</h2>
                <p class="text-slate-500 mt-1">Manage income and expense categories for your records.</p>
            </div>

            <button @click="openModal()"
                class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95 cursor-pointer">
                <Plus class="w-5 h-5" />
                Add Category
            </button>
        </div>

        <div
            class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
            <div class="relative flex-1 w-full">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input v-model="searchQuery" type="text" placeholder="Search categories..."
                    class="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>

            <div class="flex items-center gap-2 w-full md:w-auto">
                <Filter class="w-5 h-5 text-slate-400" />
                <select v-model="typeFilter"
                    class="bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700 min-w-37.5">
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="liability">Liability</option>
                </select>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-if="categoriesLoading.fetch" class="col-span-full py-12 text-center text-slate-400 italic">
                Loading categories...
            </div>
            <div v-else-if="filteredCategories.length === 0" class="col-span-full py-12 text-center text-slate-400 italic">
                No categories found matching your criteria.
            </div>
            <div v-else v-for="c in filteredCategories" :key="c.id"
                class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-200 transition-all group relative overflow-hidden">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 rounded-xl" :class="{
                        'bg-blue-50 text-blue-600': c.type === 'income',
                        'bg-red-50 text-red-600': c.type === 'expense',
                        'bg-amber-50 text-amber-600': c.type === 'liability'
                    }">
                        <Tag class="w-6 h-6" />
                    </div>

                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click="openModal(c)"
                            class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                            <Pencil class="w-4 h-4" />
                        </button>
                        <button @click="confirmDeleteHandler(c.id, c.name)"
                            class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                            <Trash2 class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <h3 class="text-lg font-bold text-slate-900 mb-1">{{ c.name }}</h3>
                <p class="text-xs font-bold uppercase tracking-wider" :class="{
                    'text-blue-500': c.type === 'income',
                    'text-red-500': c.type === 'expense',
                    'text-amber-500': c.type === 'liability'
                }">{{ c.type }}</p>

                <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Tag class="w-24 h-24 rotate-12" />
                </div>
            </div>
        </div>

        <div v-if="showModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div
                class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 class="text-xl font-bold text-slate-900">{{ editingId ? 'Edit Category' : 'New Category' }}</h3>
                    <button @click="closeModal" class="p-2 hover:bg-white rounded-lg transition-colors">
                        <X class="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-slate-500 uppercase">Category Name</label>
                        <input
                            v-model="formData.name"
                            type="text"
                            placeholder="e.g., Maintenance, Rent, etc."
                            class="w-full px-4 py-3 bg-slate-50 border rounded-xl transition-all font-medium"
                            :class="errors?.name?.[0]
                                ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                : 'border-slate-200 focus:ring-2 focus:ring-blue-500'"
                        />
                        <p v-if="errors?.name?.length" class="text-red-500 mt-2 text-xs">{{ errors?.name?.[0] }}</p>
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

                    <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <input
                            type="checkbox"
                            v-model="formData.is_tuition"
                            class="w-6 h-6 rounded cursor-pointer border-2 flex items-center justify-center transition-all" :class="formData.is_tuition ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'"
                        />
                        <div class="flex-1">
                            <p class="text-sm font-bold text-slate-700">Tuition Related</p>
                            <p class="text-xs text-slate-500">Mark this category for Charity/Tuition tracking.</p>
                        </div>
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

        <ConfirmDelete
            v-if="isShowingDeleteConfirm"
            :isOpen="true"
            title="Delete Category"
            :message="getConfirmDeleteData.name"
            :loading="categoriesLoading.delete"
            @confirm="deleteCategory()"
            @close="isShowingDeleteConfirm = false"
        />

    </div>
</template>