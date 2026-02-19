export const API_URL = import.meta.env.VITE_API_URL

console.log('Injected API_URL', API_URL)

export const api = {
    getToken() {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
    },

    headers() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    },

    async request(endpoint, method = 'GET', body = null) {
        const opts = { method, headers: this.headers() };
        if (body) opts.body = JSON.stringify(body);

        try {
            const res = await fetch(API_URL + endpoint, opts);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Ошибка сети');
            return data;
        } catch (e) {
            throw e;
        }
    },

    login: (email, password) => api.request('/auth/login', 'POST', { email, password }),
    register: (data) => api.request('/auth/register', 'POST', data),
    verify: (email, code) => api.request('/auth/verify', 'POST', { email, code }),

    getMe: () => api.request('/auth/me'),

    getCategories: () => api.request('/categories'),
    getThreads: (catId, page) => api.request(`/threads/${catId}?page=${page}`),
    getPosts: (threadId, page) => api.request(`/posts/${threadId}?page=${page}`),
    createThread: (data) => api.request('/threads', 'POST', data),
    createPost: (data) => api.request('/posts', 'POST', data),

    updateProfile: (data) => api.request('/profile', 'PUT', data),
    getThreadById: (id) => api.request(`/posts/${id}`),

    toggleReaction: (postId, emoji) => api.request('/react', 'POST', { postId, emoji }),
    getStats: () => api.request('/stats'),
    deleteThread: (id) => api.request(`/threads/${id}`, 'DELETE'),
    deletePost: (id) => api.request(`/posts/${id}`, 'DELETE'),
    editPost: (id, content) => api.request(`/posts/${id}`, 'PUT', { content }),

    requestSkins: (name) => api.request(`/skins?usernames=${name}`, `GET`),

    setToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    },

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
    }
};
