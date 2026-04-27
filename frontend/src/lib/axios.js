import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 👉 Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        // ❌ Not authenticated OR session expired
        if (status === 401 || status === 419) {
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;