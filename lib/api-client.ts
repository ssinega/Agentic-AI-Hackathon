import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiResponse } from "@/types";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("auth_user");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Failed to retrieve auth token from localStorage:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      try {
        localStorage.removeItem("auth_user");
      } catch (storageError) {
        console.error("Failed to remove auth token from localStorage:", storageError);
      }
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export class ApiClient {
  static async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async put<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async patch<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private static handleError(error: any): ApiResponse<never> {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        message: error.response?.data?.message || "An error occurred",
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default apiClient;
