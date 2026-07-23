import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { normalizeApiError } from "./errors";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- REQUEST INTERCEPTOR ----
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken(); // implement per your auth strategy
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- RESPONSE INTERCEPTOR ----
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Example: auto-refresh token on 401, retry once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshAccessToken(); // implement per your auth strategy
        return apiClient(originalRequest);
      } catch (refreshError) {
        handleLogout(); // clear session, redirect to /login
        return Promise.reject(normalizeApiError(error));
      }
    }

    // Every other error is normalized here, ONCE, centrally.
    return Promise.reject(normalizeApiError(error));
  }
);

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function refreshAccessToken() {
  // call refresh endpoint, store new token
}

function handleLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }
}
