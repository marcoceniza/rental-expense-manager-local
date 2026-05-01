<script setup>
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { User, Mail, Lock, Check, AlertCircle, Save } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { user, loading } = storeToRefs(authStore);
const message = ref({ text: '', type: '' });
const formData = ref({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: ''
});

const handleUpdate = async () => {
    await authStore.updateProfile(formData.value);
};

onMounted( async () => {
    await authStore.fetchUser();
});
</script>

<template>
    <div class="space-y-8">
        <div>
            <h2 class="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3 max-sm:text-2xl">
                <User class="w-8 h-8" />
                Admin Profile
            </h2>
            <p class="text-slate-500 mt-1">Manage your personal information and account security.</p>
        </div>

        <div class="max-w-2xl">
            <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <div class="flex items-center gap-6 mb-8">
                    <div
                        class="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-200">
                        {{ formData.name || 'A' }}
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-slate-900">{{ formData.name }}</h3>
                        <p class="text-slate-500">{{ formData.email }}</p>
                        <span
                            class="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
                            System Administrator
                        </span>
                    </div>
                </div>

                <form @submit.prevent="handleUpdate" class="space-y-6">
                    <div v-if="message.text" :class="[
                        'p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2',
                        message.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-red-50 border border-red-100 text-red-600'
                    ]">
                        <Check v-if="message.type === 'success'" class="w-5 h-5 shrink-0" />
                        <AlertCircle v-else class="w-5 h-5 shrink-0" />
                        {{ message.text }}
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</label>
                            <div class="relative">
                                <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input v-model="formData.name" type="text"
                                    class="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                            <div class="relative">
                                <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input v-model="formData.email" type="email" class="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                            </div>
                        </div>
                    </div>

                    <div class="pt-6 border-t border-slate-100">
                        <h4 class="text-sm font-bold text-slate-900 mb-4">Change Password</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">New
                                    Password</label>
                                <div class="relative">
                                    <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input v-model="formData.password" type="password" placeholder="Leave blank to keep current"
                                        class="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                                </div>
                            </div>

                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New
                                    Password</label>
                                <div class="relative">
                                    <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input v-model="formData.password_confirmation" type="password" placeholder="Confirm new password"
                                        class="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="pt-4 flex justify-end">
                        <button type="submit" :disabled="loading"
                            class="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98] flex items-center gap-2 cursor-pointer">
                            <span v-if="loading"
                                class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <Save v-else class="w-5 h-5" />
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>