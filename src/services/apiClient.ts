import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { storage } from '../utils/storage';

// Configurable base URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.insureease.in/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});


// Request interceptor to attach Bearer token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getSecureItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);



// Response interceptor for unified error formatting
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'Something went wrong. Please try again.',
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response,
    };
    return Promise.reject(customError);
  }
);


  

  
  