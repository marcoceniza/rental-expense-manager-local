<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { errors } = storeToRefs(authStore);

const formData = ref({
	name: '',
	email: '',
	password: '',
	password_confirmation: '',
});

const showPassword = ref(false);
const showPasswordConfirmation = ref(false);

const handleRegister = async () => {
	await authStore.createUser(formData.value);

	if(!authStore.loading) {
		formData.value = {
			name: '',
			email: '',
			password: '',
			password_confirmation: '',
		};
	}
};

onMounted(() => {
	errors.value = {};
});
</script>

<template>
	<div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
		<div class="w-full max-w-md">
			<!-- <div class="text-center mb-8">
				<figure><img src="@/assets/logo.png" alt="Rental Manager Logo" class="mx-auto w-62.5"/></figure>
			</div> -->

			<div class="bg-white px-8 py-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
				<h2 class="text-xl font-bold text-slate-900 mb-6">Create User Account</h2>

				<form @submit.prevent="handleRegister" class="space-y-5">
					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
						<div class="relative">
							<User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
							<input v-model="formData.name" type="text" placeholder="User Name"
								class="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
							<p v-if="errors?.name?.length" class="text-red-500 mt-2 text-xs">{{ errors?.name?.[0] }}</p>
						</div>
					</div>

					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
						<div class="relative">
							<Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
							<input v-model="formData.email" type="email" placeholder="user@example.com"
								class="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
							<p v-if="errors?.email?.length" class="text-red-500 mt-2 text-xs">{{ errors?.email?.[0] }}</p>
						</div>
					</div>

					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
						<div class="relative">
							<Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
							<input v-model="formData.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
								class="w-full pl-12 pr-12 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
							<button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
								<Eye v-if="!showPassword" class="w-5 h-5" />
								<EyeOff v-else class="w-5 h-5" />
							</button>
							<p v-if="errors?.password?.length" class="text-red-500 mt-2 text-xs">{{ errors?.password?.[0] }}</p>
						</div>
					</div>

					<div class="space-y-1.5">
						<label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
						<div class="relative">
							<Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
							<input v-model="formData.password_confirmation" :type="showPasswordConfirmation ? 'text' : 'password'" placeholder="••••••••"
								class="w-full pl-12 pr-12 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
							<button type="button" @click="showPasswordConfirmation = !showPasswordConfirmation" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
								<Eye v-if="!showPasswordConfirmation" class="w-5 h-5" />
								<EyeOff v-else class="w-5 h-5" />
							</button>
							<p v-if="errors?.password_confirmation?.length" class="text-red-500 mt-2 text-xs">{{ errors?.password_confirmation?.[0] }}</p>
						</div>
					</div>

					<button type="submit" :disabled="loading"
						class="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer">
						<span v-if="loading"
							class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
						<span v-else>Create Account</span>
					</button>
				</form>
			</div>

			<!-- <p class="text-center text-xs text-slate-400 mt-8">
				&copy; {{ new Date().getFullYear() }} All rights reserved.
			</p> -->
		</div>
	</div>
</template>