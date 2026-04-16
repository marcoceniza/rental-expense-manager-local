<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
    pagination: {
        type: Object,
        required: true
    }
});

const route = useRoute();
const router = useRouter();

const goToPage = (page) => {
    if (page < 1 || page > props.pagination.last_page) return;

    router.push({
        path: route.path,
        query: {
            ...route.query,
            page
        }
    });
};

const visiblePages = computed(() => {
    const total = props.pagination.last_page || 1;
    const current = props.pagination.current_page || 1;

    const start = Math.max(current - 2, 1);
    const end = Math.min(current + 2, total);

    const pages = [];
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
});
</script>

<template>
    <div v-if="pagination.last_page > 1"
        class="flex items-center justify-between mt-6 px-4 py-3 bg-white border-t border-slate-200 rounded-bl-2xl rounded-br-2xl rounded-tl-none rounded-tr-none">

        <p class="text-sm text-slate-500">
            Page {{ pagination.current_page }} of {{ pagination.last_page }}
        </p>

        <div class="flex items-center gap-2">
            <button @click="goToPage(pagination.current_page - 1)" :disabled="pagination.current_page === 1"
                class="px-3 py-2 rounded-lg border text-sm cursor-pointer" :class="pagination.current_page === 1
                    ? 'text-slate-300 border-slate-200 cursor-not-allowed'
                    : 'text-slate-600 border-slate-300 hover:bg-slate-50'">
                Prev
            </button>

            <button v-for="page in visiblePages" :key="page" @click="goToPage(page)"
                class="px-3 py-2 rounded-lg text-sm cursor-pointer" :class="page === pagination.current_page
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'">
                {{ page }}
            </button>

            <button @click="goToPage(pagination.current_page + 1)"
                :disabled="pagination.current_page === pagination.last_page" class="px-3 py-2 rounded-lg border text-sm cursor-pointer"
                :class="pagination.current_page === pagination.last_page
                    ? 'text-slate-300 border-slate-200 cursor-not-allowed'
                    : 'text-slate-600 border-slate-300 hover:bg-slate-50'">
                Next
            </button>
        </div>
    </div>
</template>