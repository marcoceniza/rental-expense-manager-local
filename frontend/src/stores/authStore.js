import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/lib/axios';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/stores/toastStore';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const authLoading = ref(false);
    const router = useRouter();
    const { showToast } = useToastStore();
    const errors = ref({});

    const isAuthenticated = computed(() => !!user.value?.id);
    const isAdmin = computed(() => user.value?.user_type === 'admin');

    const fetchUser = async () => {
        try {
            const res = await api.get('/user');
            user.value = res.data;
        } catch {
            user.value = null;
        }
    };

    const login = async (credentials) => {
        authLoading.value = true;

        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/login', credentials);

            await fetchUser();

            router.push(
                user.value?.user_type === 'admin'
                    ? '/admin/dashboard'
                    : '/dashboard'
            );

        } catch (error) {
            if (error.response?.status === 422) {
                errors.value = error.response.data.errors;
            } else {
                showToast(error.response?.data?.message || 'Login failed', 'error');
            }
            throw error;
        } finally {
            authLoading.value = false;
        }
    };

    const register = async (userData) => {
        authLoading.value = true;

        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/register', userData);

            router.push('/login');

        } catch (error) {
            if (error.response?.status === 422) {
                errors.value = error.response.data.errors;
            } else {
                showToast('Failed to register', 'error');
            }
            throw error;
        } finally {
            authLoading.value = false;
        }
    };

    const logout = async () => {
        authLoading.value = true;

        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/logout');
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            user.value = null;
            authLoading.value = false;
            router.push('/login');
        }
    };

    const updateProfile = async (profileData) => {
        authLoading.value = true;

        try {
            await api.put('/user', profileData);
            await fetchUser();
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            authLoading.value = false;
        }
    };

    return {
        user,
        authLoading,
        errors,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        fetchUser,
        updateProfile
    };
});