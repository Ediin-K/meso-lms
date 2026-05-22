const API_URL = 'http://localhost:8080/api/auth';

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Email ose password i gabuar!');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('userId', data.userId)
    localStorage.setItem('email', email)        // ✅ shto këtë
    localStorage.setItem('meson-role', data.role ?? '') // ✅ shto këtë

    return {
        ...data,
        email: email,  // ✅ shto këtë
    };
};

export const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('refreshToken')
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