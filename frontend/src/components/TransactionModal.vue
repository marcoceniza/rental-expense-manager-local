<script setup>
import { X, Check } from "lucide-vue-next";
import BaseButton from "./base/BaseButton.vue";

const props = defineProps({
    isOpen: { type: Boolean, required: true },
    editingId: { type: [Number, null], default: null },
    formData: { type: Object, required: true },
    categoryTypes: { type: Array, required: true },
    filteredCategories: { type: Array, required: true },
    isSubmitting: { type: Boolean, default: false },
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
                <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

                    <!-- Header -->
                    <div class="p-6 border-b border-slate-100 flex justify-between bg-slate-50">
                        <h3 class="text-xl font-bold text-slate-900">
                            {{ editingId ? 'Edit Transaction' : 'New Transaction' }}
                        </h3>
                        <button @click="close" class="p-2 hover:bg-white rounded-lg">
                            <X class="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <!-- Body -->
                    <form @submit.prevent="handleSubmit" class="p-6 space-y-4">

                        <!-- Date + Type -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-slate-500 uppercase">Date</label>
                                <input v-model="formData.transaction_date" type="date" required
                                    class="w-full px-4 py-3 bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-slate-500 uppercase">Type</label>
                                <select v-model="formData.type"
                                    class="w-full px-4 py-3 bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500">
                                    <option v-for="type in categoryTypes" :key="type" :value="type">
                                        {{ type }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <!-- Category -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-500 uppercase">Category</label>
                            <select v-model="formData.category_id" required
                                class="w-full px-4 py-3 bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500">
                                <option value="" disabled>Select a category</option>
                                <option v-for="c in filteredCategories" :key="c.id" :value="c.id">
                                    {{ c.name }}
                                </option>
                            </select>
                        </div>

                        <!-- Description -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-500 uppercase">Description</label>
                            <input v-model="formData.description" type="text" placeholder="e.g., Rent Payment - Ground Floor"
                                class="w-full px-4 py-3 bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <!-- Amount -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-500 uppercase">Amount (PHP)</label>
                            <input v-model.number="formData.amount" type="number" step="0.01"
                                class="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-lg" />
                        </div>

                        <!-- Remarks -->
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-500 uppercase">Remarks</label>
                            <textarea v-model="formData.remarks" placeholder="Add any additional notes..." rows="2"
                                class="w-full px-4 py-3 bg-slate-50 rounded-xl resize-none"></textarea>
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