import axiosInstance from './axiosInstance'

const API_URL = 'http://localhost:8080/api/auth';

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Email ose password i gabuar!');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token)
    localStorage.setItem('userId', data.userId)
    localStorage.setItem('email', email)
    localStorage.setItem('meson-role', data.role ?? '')

    return {
        ...data,
        email: email,
    };
};

export const logout = async () => {
    try {
        await axiosInstance.post('/auth/logout')
    } catch {
        // vazhdo edhe nëse backend-i dështon
    }
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('meson-role')
    localStorage.removeItem('userId')
    localStorage.removeItem('lastCourseId')
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};
