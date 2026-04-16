<script setup>
import { useRoomStore } from '@/stores/RoomStore';

const roomStore = useRoomStore();

const props = defineProps({
    isOpen: { type: Boolean, required: true },
    title: { type: String, default: "Modal Title" },
    titleBadge: { type: String, default: "" },
    titleBadgeClass: { type: String, default: "" },
    mode: { type: String, default: "view" },
});

const emit = defineEmits(["update:isOpen"]);
const close = () => {
    roomStore.clearErrors();
    emit("update:isOpen", false);
}
</script>

<template>
    <Transition name="fade">
        <div
            v-if="props.isOpen"
            class="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            @click.self="close"
        >
            <Transition name="scale">
                <div
                    class="bg-white m-5 rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] flex flex-col p-6 relative"
                    @keydown.escape.window="close"
                >
                    <!-- Modal Header -->
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-2xl font-semibold flex items-center gap-2">
                            {{ props.title }}
                            <span
                                v-if="props.titleBadge"
                                :class="`px-2 py-1 rounded-full text-sm font-semibold ${props.titleBadgeClass}`"
                            >
                                {{ props.titleBadge }}
                            </span>
                        </h3>
                        <button @click="close" class="text-gray-400 cursor-pointer absolute right-3 top-1 text-2xl hover:text-gray-600">&times;</button>
                    </div>

                    <!-- Modal Body -->
                    <div class="flex-1 overflow-y-auto py-3 pr-3">
                        <slot></slot>
                    </div>

                    <!-- Modal Footer -->
                    <div v-if="$slots.footer" class="mt-4">
                        <slot name="footer"></slot>
                    </div>
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
.scale-leave-active {
    transition: transform 0.2s ease, opacity 0.2s ease;
}
.scale-leave-to {
    transform: scale(0.9);
    opacity: 0;
}
</style>