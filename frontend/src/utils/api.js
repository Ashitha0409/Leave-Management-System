import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Leave API
export const leaveAPI = {
    createLeave: (data) => api.post('/leaves', data),
    getMyLeaves: () => api.get('/leaves/my-leaves'),
    getAllLeaves: () => api.get('/leaves'),
    updateLeaveStatus: (id, status) => api.put(`/leaves/${id}`, { status }),
    deleteLeave: (id) => api.delete(`/leaves/${id}`),
    getSanctioningAuthorities: () => api.get('/leaves/sanctioning-authorities'),
};

export default api;
