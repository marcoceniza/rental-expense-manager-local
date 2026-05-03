import axios from 'axios';
import router from '@/router';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let isRedirecting = false;

// 👉 Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if ((status === 401 || status === 419) && !isRedirecting) {
            isRedirecting = true;

            localStorage.clear();
            router.push('/login');
        }

        if (status === 403) {
            router.push('/dashboard');
        }

        return Promise.reject(error);
    }
);

export default api;