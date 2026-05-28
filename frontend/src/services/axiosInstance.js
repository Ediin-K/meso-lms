import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
})

// REQUEST Interceptor — shton token automatikisht
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// RESPONSE Interceptor — menaxhon token skaduar
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Nese token skadoi (401) dhe nuk kemi provuar refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = localStorage.getItem('refreshToken')
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                })

                // Ruaj token-at e rinj
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('refreshToken', response.data.refreshToken)

                // Provo kërkesën origjinale përsëri
                originalRequest.headers = originalRequest.headers || {}
                originalRequest.headers.Authorization = `Bearer ${response.data.token}`
                return axiosInstance(originalRequest)
            } catch {
                // Refresh token skadoi — logout
                localStorage.clear()
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
