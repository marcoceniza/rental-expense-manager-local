import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
    const isMenuOpen = ref(false)

    const toggleMenu = () => {
        isMenuOpen.value = !isMenuOpen.value
    }

    const closeMenu = () => {
        isMenuOpen.value = false
    }

    return {
        isMenuOpen,
        toggleMenu,
        closeMenu
    }
})