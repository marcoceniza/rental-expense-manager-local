<script setup>
const props = defineProps({
    show: Boolean,
    label: String,
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
    <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div class="bg-white p-6 rounded-xl shadow-lg w-85 max-w-full">
            <p class="text-lg text-slate-700 mb-7">
                You're about to change the reporting period to: <strong>{{ label }}</strong>
            </p>

            <div class="flex justify-end gap-2">
                <button @click="$emit('cancel')" class="px-3 py-2 text-sm bg-slate-200 rounded cursor-pointer hover:bg-slate-300 transition-colors">
                    Cancel
                </button>

                <button @click="$emit('confirm')" class="px-3 py-2 text-sm bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition-colors">
                    Proceed
                </button>
            </div>
        </div>
    </div>
</template>