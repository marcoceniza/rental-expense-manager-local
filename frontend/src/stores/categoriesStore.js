import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/lib/axios';
import { useToastStore } from '@/stores/toastStore';

export const useCategoriesStore = defineStore('categories', () => {
    const categories = ref([]);
    const isCategoriesLoaded = ref(false);
    const { showToast } = useToastStore();
    const errors = ref({});
    const categoryTypes = ref(['income', 'expense', 'liability']);
    const categoriesLoading = ref({
        fetch: false,
        add: false,
        update: false,
        delete: false,
    });

    const fetchCategories = async (force = false) => {

        if (isCategoriesLoaded.value && !force) return;

        categoriesLoading.value.fetch = true;
        try {
            const response = await api.get('/categories');
            categories.value = response.data.data;
            isCategoriesLoaded.value = true;
        } catch (error) {
            showToast(`Failed to load categories: ${error.message}`, 'error');
        } finally {
            categoriesLoading.value.fetch = false;
        }
    };

    const addCategory = async (category) => {
        categoriesLoading.value.add = true;
        try {
            await api.post('/categories', category);
            await fetchCategories(true);

            showToast('Category added successfully', 'success');
        } catch (error) {
            if (error.response?.status === 422) {
                errors.value = error.response.data.errors;
            } else {
                showToast('Failed to add category', 'error');
            }
            throw error;
        } finally {
            categoriesLoading.value.add = false;
        }
    };

    const updateCategory = async (categoryId, updatedData) => {
        categoriesLoading.value.update = true;
        try {
            await api.put(`/categories/${categoryId}`, updatedData);
            await fetchCategories(true);
            showToast('Category updated successfully', 'success');
        } catch (error) {
            if (error.response?.status === 422) {
                errors.value = error.response.data.errors;
            } else {
                showToast('Failed to update category', 'error');
            }
            throw error;
        } finally {
            categoriesLoading.value.update = false;
        }
    };

    const deleteCategory = async (categoryId) => {
        categoriesLoading.value.delete = true;
        try {
            await api.delete(`/categories/${categoryId}`);
            await fetchCategories(true);
            showToast('Category deleted successfully', 'success');
        } catch (error) {
            showToast(`Failed to delete category: ${error.message}`, 'error');
        } finally {
            categoriesLoading.value.delete = false;
        }
    };

    return {
        categories,
        categoriesLoading,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        categoryTypes,
        errors,
    };
});