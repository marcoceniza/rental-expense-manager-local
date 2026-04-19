<script setup>
import { RouterLink, useRoute } from "vue-router";
import { LogOut } from "lucide-vue-next";
import { useAuthStore } from "@/stores/authStore";
import { useNavStore } from "@/stores/navStore";
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";

const route = useRoute();
const authStore = useAuthStore();
const { navItems } = storeToRefs(useNavStore());

const isMenuOpen = ref(false);

const handleLogout = () => {
	authStore.logout();
};

// Close menu on route change
watch(() => route.path, () => {
	isMenuOpen.value = false;
});
</script>

<template>
	<!-- Mobile Sidebar Overlay -->
	<div v-if="isMenuOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-60 md:hidden"
		@click="isMenuOpen = false"></div>

	<!-- Sidebar -->
	<aside v-if="!['Login', 'Register'].includes(route.name)"
		class="fixed md:sticky top-0 left-0 z-70 w-64 bg-slate-900 text-white shrink-0 flex flex-col h-screen border-r border-slate-800 transition-transform duration-300 md:translate-x-0"
		:class="isMenuOpen ? 'translate-x-0' : '-translate-x-full'">
		<div class="p-6 border-b border-slate-800">
			<h1 class="text-xl font-bold tracking-tight">RentalManager</h1>
			<p class="text-xs text-slate-400 mt-1">Financial Control System</p>
		</div>

		<nav class="flex-1 p-4 space-y-1 overflow-y-auto">
			<RouterLink v-for="item in navItems" :key="item.path" :to="item.path"
				class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
				active-class="bg-blue-600 text-white shadow-lg shadow-blue-900/20">
				<component :is="item.icon" class="w-5 h-5 transition-transform group-hover:scale-110" />
				<span class="font-medium">{{ item.name }}</span>
			</RouterLink>
		</nav>

		<div class="p-4 border-t border-slate-800 space-y-2">
			<div class="flex items-center gap-3 px-4 py-3 text-slate-400 bg-slate-800/50 rounded-xl">
				<div
					class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
					A
				</div>
				<div class="flex-1 overflow-hidden">
					<p class="text-sm font-bold text-white truncate">Admin</p>
					<p class="text-[10px] truncate opacity-60">admin@gmail.com</p>
				</div>
			</div>

			<button @click="handleLogout"
				class="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200 group cursor-pointer">
				<LogOut class="w-5 h-5 transition-transform group-hover:-translate-x-1" />
				<span class="font-medium">Logout</span>
			</button>
		</div>
	</aside>
</template>