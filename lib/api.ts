import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Clerk session token getter – set by ClerkApiAuth so the backend receives Bearer token on protected routes
let authTokenGetter: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  authTokenGetter = getter;
}

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Extend config so response interceptor can tell if we sent a token (avoid redirect loop on "signature invalid")
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _authHadToken?: boolean;
  }
}

// Request interceptor: add Clerk session token for protected backend routes.
// Backend expects: Authorization: Bearer <token> where token is from Clerk's getToken().
// Backend must have CLERK_SECRET_KEY (and optionally FRONTEND_URL for authorizedParties).
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (authTokenGetter) {
      try {
        const raw = await authTokenGetter();
        const token = typeof raw === 'string' ? raw.trim() : null;
        if (token && token.length > 0) {
          config.headers.Authorization = `Bearer ${token}`;
          config._authHadToken = true;
        }
      } catch (_) {
        // No token (e.g. signed out) – request continues without Authorization
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// On 401: only redirect to sign-in when we didn't send a token (user needs to sign in).
// When we did send a token and backend returns 401 (e.g. "JWT signature invalid"), don't redirect to avoid a loop.
function handleUnauthorized(config?: InternalAxiosRequestConfig) {
  if (typeof window === 'undefined') return;
  if (config?._authHadToken) {
    // Token was sent but backend rejected it – don't redirect; let the caller show an error
    return;
  }
  const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/sign-in?redirect_url=${returnUrl}`;
}

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      if (status === 401) {
        handleUnauthorized(error.config as InternalAxiosRequestConfig);
        return Promise.reject(error);
      }

      if (status === 400) {
        console.error('Bad Request:', data);
      } else if (status === 500) {
        console.error('Server Error:', data);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
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

export interface AuthMeResponse {
  user: {
    id: string;
    email?: string;
    [key: string]: unknown;
  };
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
 * Get the current user from the backend (derived from the Clerk token).
 * Requires the user to be signed in; send the Bearer token via the API client.
 * @returns Backend user object (id, email, etc.)
 */
export const getCurrentUser = async (): Promise<AuthMeResponse['user']> => {
  try {
    const response = await apiClient.get<AuthMeResponse>('/auth/me');
    return response.data.user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string }>;
      if (axiosError.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw new Error(axiosError.message || 'Failed to get current user');
    }
    throw error;
  }
};

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
  batch_num?: number; // required for cancel; ensure backend student/orders returns it
}

export interface GetStudentOrdersResponse {
  data: StudentOrder[];
}

/**
 * Get student orders (backend derives email from the Clerk token).
 * @param email Optional; backend uses token email when auth is required
 * @returns Array of student orders
 */
export const getStudentOrders = async (
  email?: string
): Promise<StudentOrder[]> => {
  try {
    const query = email != null ? `?email=${encodeURIComponent(email)}` : ''
    const response = await apiClient.get<GetStudentOrdersResponse>(
      `/student/orders${query}`
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

export interface CancelOrderRequest {
  batch_num: number;
  start_date: string;
  end_date: string;
  email: string;
}

export interface CancelOrderResponse {
  message: string;
}

/**
 * Cancel a student order (sets status to PENDING CANCEL and updates batch)
 * @param payload batch_num, start_date, end_date, email
 * @returns Success message
 */
export const cancelOrder = async (
  payload: CancelOrderRequest
): Promise<CancelOrderResponse> => {
  try {
    const response = await apiClient.post<CancelOrderResponse>(
      '/student/cancel',
      {
        batch_num: payload.batch_num,
        start_date: payload.start_date,
        end_date: payload.end_date,
        email: payload.email,
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
        throw new Error(errorData.error || 'Failed to cancel order');
      }
      throw new Error(axiosError.message || 'Network error occurred');
    }
    throw error;
  }
};

// Export the axios instance for custom requests if needed
export default apiClient;
