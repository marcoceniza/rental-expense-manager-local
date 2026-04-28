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
        
        // Check if we are already on the login page to avoid loops
        const isLoginPage = window.location.pathname.includes('/login');

        if ((status === 401 || status === 419) && !isRedirecting && !isLoginPage) {
            isRedirecting = true;

            localStorage.clear();

            // Use href or replace, but ensure the path is correct
            window.location.href = '/rental-expense-manager/login';
        }

        return Promise.reject(error);
    }
);

export default api;