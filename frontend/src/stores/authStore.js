import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/lib/axios';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/stores/toastStore';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const authLoading = ref(false);
    const router = useRouter();
    const { showToast } = useToastStore();
    const errors = ref({});
    const isAuthenticated = computed(() => !!user.value);

    const fetchUser = async () => {
        try {
            const res = await api.get('/user');
            user.value = res.data;
        } catch (error) {
            user.value = null;
        }
    };

    const login = async (credentials) => {
        authLoading.value = true;

        try {
            await axios.get('http://localhost/rental-expense-manager/server/public/sanctum/csrf-cookie', { withCredentials: true });
            await api.post('/login', credentials);
            await fetchUser();

            router.push('/dashboard');

        } catch (error) {
            if (error.response?.status === 422) {
                errors.value = error.response.data.errors;
            } else {
                showToast(error.response.data.message, 'error');
            }
            throw error;
        } finally {
            authLoading.value = false;
        }
    };

    const register = async (userData) => {
        authLoading.value = true;
        try {
            await axios.get('http://localhost/rental-expense-manager/server/public/sanctum/csrf-cookie', { withCredentials: true });
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
            await axios.get('http://localhost/rental-expense-manager/server/public/sanctum/csrf-cookie', { withCredentials: true });
            await api.post('/logout');

            user.value = null;

            router.push('/login');

        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            authLoading.value = false;
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
        login,
        register,
        logout,
        errors,
        isAuthenticated,
        fetchUser,
        updateProfile
    };
});