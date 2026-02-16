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
  start_date?: string;
  end_date?: string;
  batch_number?: number;
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
  batch_number?: string | number;
  full_name?: string;
  email?: string;
}

export interface UpdatePurchaseResponse {
  message: string;
}

export interface RegisterStudentRequest {
  batch_number: string | number;
  full_name: string;
  email: string;
  start_date?: string;
  end_date?: string;
}

export interface RegisterStudentResponse {
  message: string;
  error?: string;
  details?: string;
  warning?: string;
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

/**
 * Register a student to a batch
 * This function registers a student and automatically updates the batch student count.
 * If the batch reaches max capacity, it will be marked as full and inactive.
 * @param studentData Student registration data including batch_number, full_name, and user_id
 * @returns Success message
 */
export const registerStudent = async (
  studentData: RegisterStudentRequest
): Promise<RegisterStudentResponse> => {
  try {
    const response = await apiClient.post<RegisterStudentResponse>(
      '/student/register',
      {
        batch_number: studentData.batch_number,
        full_name: studentData.full_name,
        email: studentData.email,
        start_date: studentData.start_date,
        end_date: studentData.end_date,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; errors?: any[]; details?: string; warning?: string }>;
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (errorData.errors) {
          throw new Error(`Validation errors: ${JSON.stringify(errorData.errors)}`);
        }
        // Return the error response with all details (including warning if present)
        throw new Error(errorData.error || 'Failed to register student');
      }
      throw new Error(axiosError.message || 'Network error occurred');
    }
    throw error;
  }
};

export interface Batch {
  start_date: string;
  end_date: string;
  active: boolean;
  students: number;
  full: boolean;
  length: number;
  batch_num: number;
  max_students: number;
  description: string | null;
  class_type: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Get all active batches
 * @returns Array of active batches
 */
export const getBatch = async (): Promise<Batch[]> => {
  try {
    const response = await apiClient.get<Batch[]>('/batch/get');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; errors?: any[] }>;
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (errorData.errors) {
          throw new Error(`Validation errors: ${JSON.stringify(errorData.errors)}`);
        }
        throw new Error(errorData.error || 'Failed to fetch batches');
      }
      throw new Error(axiosError.message || 'Network error occurred');
    }
    throw error;
  }
};

export interface ContactFormRequest {
  email: string;
  category: string;
  message: string;
}

export interface ContactFormResponse {
  message: string;
  data?: any;
}

/**
 * Submit contact form data
 * @param formData Contact form data including email, category, and message
 * @returns Success message
 */
export const submitContactForm = async (
  formData: ContactFormRequest
): Promise<ContactFormResponse> => {
  try {
    const response = await apiClient.post<ContactFormResponse>(
      '/form/insert',
      {
        email: formData.email,
        category: formData.category,
        message: formData.message,
      }
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
        throw new Error(errorData.error || 'Failed to submit contact form');
      }
      throw new Error(axiosError.message || 'Network error occurred');
    }
    throw error;
  }
};

export interface StudentOrder {
  class_type: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface GetStudentOrdersResponse {
  data: StudentOrder[];
}

/**
 * Get student orders by email
 * @param email User email address
 * @returns Array of student orders
 */
export const getStudentOrders = async (
  email: string
): Promise<StudentOrder[]> => {
  try {
    const response = await apiClient.get<GetStudentOrdersResponse>(
      `/student/orders?email=${encodeURIComponent(email)}`
    );
    return response.data.data || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; errors?: any[] }>;
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (errorData.errors) {
          throw new Error(`Validation errors: ${JSON.stringify(errorData.errors)}`);
        }
        throw new Error(errorData.error || 'Failed to fetch student orders');
      }
      throw new Error(axiosError.message || 'Network error occurred');
    }
    throw error;
  }
};

// Export the axios instance for custom requests if needed
export default apiClient;
