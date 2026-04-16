<script setup>
import { computed } from 'vue';

const props = defineProps({
    size: {
        type: String,
        default: 'md',
    },
    color: {
        type: String,
        default: 'blue',
    },
    center: {
        type: Boolean,
        default: true,
    },
});

const sizeClass = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'w-4 h-4 border-2';
        case 'lg':
            return 'w-12 h-12 border-4';
        default:
            return 'w-8 h-8 border-4';
    }
});

const borderClass = 'border-gray-300';

const colorClass = computed(() => {
    return {
        blue: 'border-t-blue-600',
        red: 'border-t-red-500',
        green: 'border-t-green-500',
        gray: 'border-t-gray-600',
    }[props.color] || 'border-t-blue-600';
});

const wrapperClass = computed(() => {
    return props.center ? 'flex justify-center items-center' : '';
});
</script>

<template>
    <div :class="wrapperClass">
        <div :class="[
            'rounded-full animate-spin',
            sizeClass,
            borderClass,
            colorClass
        ]"></div>
    </div>
</template>