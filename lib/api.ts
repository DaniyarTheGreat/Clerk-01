import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for logging and adding auth tokens if needed
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can add auth tokens here if needed
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;
      
      if (status === 400) {
        console.error('Bad Request:', data);
      } else if (status === 401) {
        console.error('Unauthorized:', data);
      } else if (status === 500) {
        console.error('Server Error:', data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API Service Functions

export interface CheckoutItem {
  name: string;
  email?: string; // Optional email for testing
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface CheckUserResponse {
  exists: boolean;
}

export interface CreateUserRequest {
  email: string;
  full_name?: string;
  phone?: string;
}

export interface CreateUserResponse {
  message: string;
  data: any;
}

export interface VerifySessionResponse {
  valid: boolean;
  paid: boolean;
  session_id?: string;
  customer_email?: string;
  amount_total?: number;
  currency?: string;
  error?: string;
}

export interface UpdatePurchaseResponse {
  message: string;
}

/**
 * Create a Stripe checkout session
 * @param items Array of items with name property
 * @returns Checkout session URL
 */
export const createCheckoutSession = async (
  items: CheckoutItem[]
): Promise<CheckoutSessionResponse> => {
  try {
    const response = await apiClient.post<CheckoutSessionResponse>(
      '/payments/create-session',
      { items }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; errors?: any[] }>;
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (errorData.errors) {
          throw new Error(`Validation errors: ${JSON.stringify(errorData.errors)}`);
        }
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      throw new Error(axiosError.message || 'Network error occurred');
    }
    throw error;
  }
};

/**
 * Check if a user exists by email
 * @param email User email address
 * @returns Boolean indicating if user exists
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const response = await apiClient.get<CheckUserResponse>(
      `/client/check?email=${encodeURIComponent(email)}`
    );
    return response.data.exists;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; errors?: any[] }>;
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (errorData.errors) {
          throw new Error(`Validation errors: ${JSON.stringify(errorData.errors)}`);
        }
        throw new Error(errorData.error || 'Failed to check user existence');
      }
      throw new Error(axiosError.message || 'Network error occurred');
    }
    throw error;
  }
};

/**
 * Create a new user
 * @param userData User data including email, optional full_name and phone
 * @returns Created user data
 */
export const createUser = async (
  userData: CreateUserRequest
): Promise<CreateUserResponse> => {
  try {
    const response = await apiClient.post<CreateUserResponse>(
      '/client/create',
      userData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; errors?: any[] }>;
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (errorData.errors) {
          throw new Error(`Validation errors: ${JSON.stringify(errorData.errors)}`);
        }
        throw new Error(errorData.error || 'Failed to create user');
      }
      throw new Error(axiosError.message || 'Network error occurred');
    }
    throw error;
  }
};

/**
 * Verify a Stripe checkout session
 * @param sessionId Stripe checkout session ID from URL query parameter
 * @returns Session verification result with payment status
 */
export const verifySession = async (
  sessionId: string
): Promise<VerifySessionResponse> => {
  try {
    const response = await apiClient.get<VerifySessionResponse>(
      `/payments/verify-session?session_id=${sessionId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; errors?: any[] }>;
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (errorData.errors) {
          throw new Error(`Validation errors: ${JSON.stringify(errorData.errors)}`);
        }
        throw new Error(errorData.error || 'Failed to verify session');
      }
      throw new Error(axiosError.message || 'Network error occurred');
    }
    throw error;
  }
};

/**
 * Update purchase record status to SUCCESS after payment is verified
 * @param sessionId Stripe checkout session ID
 * @returns Success message
 */
export const updatePurchase = async (
  sessionId: string
): Promise<UpdatePurchaseResponse> => {
  try {
    const response = await apiClient.post<UpdatePurchaseResponse>(
      '/payments/update-session',
      { session_id: sessionId }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; errors?: any[] }>;
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (errorData.errors) {
          throw new Error(`Validation errors: ${JSON.stringify(errorData.errors)}`);
        }
        throw new Error(errorData.error || 'Failed to update purchase');
      }
      throw new Error(axiosError.message || 'Network error occurred');
    }
    throw error;
  }
};

// Export the axios instance for custom requests if needed
export default apiClient;
