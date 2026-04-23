<script setup>
import { X, Check } from "lucide-vue-next";
import BaseButton from "./base/BaseButton.vue";

const props = defineProps({
    isOpen: { type: Boolean, required: true },
    editingId: { type: [Number, null], default: null },
    formData: { type: Object, required: true },
    categoryTypes: { type: Array, required: true },
    errors: { type: Object, default: () => ({}) },
    isSubmitting: { type: Boolean, default: false },
    selectedCategory: { type: Object, default: null },
});

const emit = defineEmits([
    "update:isOpen",
    "submit"
]);

const close = () => emit("update:isOpen", false);
const handleSubmit = () => emit("submit");
</script>

<template>
    <Transition name="fade">
        <div v-if="isOpen"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <Transition name="scale">
                <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

                    <!-- Header -->
                    <div class="p-6 border-b border-slate-100 flex justify-between bg-slate-50">
                        <h3 class="text-xl font-bold text-slate-900">
                            {{ editingId ? 'Edit Category' : 'New Category' }}
                        </h3>
                        <button @click="close" class="p-2 hover:bg-white rounded-lg cursor-pointer">
                            <X class="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <!-- Body -->
                    <form @submit.prevent="handleSubmit" class="p-6 space-y-4">

                        <!-- Name -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-500 uppercase">Category Name</label>
                            <input v-model="formData.name" type="text" placeholder="e.g., Maintenance, Rent, etc."
                                class="w-full px-4 py-3 bg-slate-50 border rounded-xl" :class="errors?.name?.[0]
                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500'" />
                            <p v-if="errors?.name?.length" class="text-red-500 text-xs">
                                {{ errors.name[0] }}
                            </p>
                        </div>

                        <!-- Type -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-500 uppercase">Type</label>
                            <select 
                                v-model="formData.type" 
                                class="w-full px-4 py-3 bg-slate-50 rounded-xl"
                                :class="{ 'cursor-not-allowed opacity-50 pointer-none': selectedCategory?.transactions_count > 0 }"
                                :disabled="selectedCategory?.transactions_count > 0"
                                :title="selectedCategory?.transactions_count > 0 ? 'Category is in use and cannot be deleted' : ''"
                            >
                                <option v-for="type in categoryTypes" :key="type" :value="type">
                                    {{ type }}
                                </option>
                            </select>
                        </div>

                        <!-- Checkbox -->
                        <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                            <input type="checkbox" v-model="formData.is_tuition" class="w-6 h-6 cursor-pointer" />
                            <div>
                                <p class="text-sm font-bold text-slate-700">Tuition Related</p>
                                <p class="text-xs text-slate-500">
                                    Mark this category for Charity/Tuition tracking.
                                </p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="pt-4 flex gap-3">
                            <BaseButton type="button" fullWidth variant="secondary" @click="close">
                                Cancel
                            </BaseButton>

                            <BaseButton type="submit" fullWidth variant="primary" :disabled="isSubmitting">
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
            </Transition>
        </div>
    </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.scale-enter-active {
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.scale-enter-from {
    transform: scale(0.9);
    opacity: 0;
}

.scale-leave-to {
    transform: scale(0.9);
    opacity: 0;
}
</style>