import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/** Typed error payload from API responses (avoids `as any` and misuse). */
export interface ApiErrorData {
  error?: string;
  errors?: unknown[];
}

// Clerk session token getter – set by ClerkApiAuth so the backend receives Bearer token on protected routes
let authTokenGetter: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  authTokenGetter = getter;
}

// Create axios instance with base configuration.
// Security: NEXT_PUBLIC_* is exposed to the client. Backend must enforce auth (e.g. Clerk token validation),
// strict CORS, and never rely on client-supplied secrets. Keep CLERK_SECRET_KEY and other secrets server-side only.
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
      const data = error.response.data as ApiErrorData;

      if (status === 401) {
        handleUnauthorized(error.config as InternalAxiosRequestConfig);
        return Promise.reject(error);
      }

      if (status === 429) {
        const retryAfter = error.response?.headers?.['retry-after'];
        const msg = retryAfter
          ? `Too many attempts. Please try again after ${retryAfter} seconds.`
          : (data?.error || 'Too many attempts. Please try again later.');
        (error as Error).message = msg;
        return Promise.reject(error);
      }

      // In production, avoid logging full response bodies to prevent leaking sensitive data
      if (process.env.NODE_ENV !== 'production') {
        if (status === 400) {
          console.error('Bad Request:', data);
        } else if (status === 500) {
          console.error('Server Error:', data);
        }
      } else {
        if (status === 400 || status === 500) {
          console.error(`Request failed with status ${status}`);
        }
      }
    } else if (error.request && process.env.NODE_ENV !== 'production') {
      console.error('No response received:', error.request);
    } else if (!error.response && !error.request && process.env.NODE_ENV !== 'production') {
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

/** Backend returns a generic message (no user enumeration). */
export interface CheckUserResponse {
  message: string;
}

/** Request body for POST /client/create. Email must not be sent; backend derives it from Clerk token. */
export interface CreateUserRequest {
  full_name?: string;
  phone?: string;
}

/** User row as returned by backend (id, email from token, optional full_name, phone). */
export interface UserRecord {
  id: string;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  [key: string]: unknown;
}

/**
 * Backend returns 201 (created) or 200 (user already exists). Both include message and data.
 * Email is set server-side from the authenticated user only.
 */
export interface CreateUserResponse {
  message: 'User created successfully' | 'User already exists';
  data: UserRecord | UserRecord[];
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
 * @param batch_num Batch number associated with this checkout (from selected batch)
 * @returns Checkout session URL
 */
export const createCheckoutSession = async (
  items: CheckoutItem[],
  batch_num?: number
): Promise<CheckoutSessionResponse> => {
  try {
    const response = await apiClient.post<CheckoutSessionResponse>(
      '/payments/create-session',
      { items, batch_num }
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
 * Call GET /client/check (e.g. for sign-in flows). Backend returns a generic message only; do not use to infer
 * whether an email exists. Rate-limited; handle 429 (e.g. "Too many attempts. Please try again later.").
 * @param email User email address
 * @returns Generic message from backend (e.g. "If an account exists with this email, you can sign in.")
 */
export const getClientCheckMessage = async (email: string): Promise<string> => {
  const response = await apiClient.get<CheckUserResponse>(
    `/client/check?email=${encodeURIComponent(email)}`
  );
  return response.data.message;
};

/**
 * Create or sync the current user row. Requires Clerk auth; send Bearer token (api client adds it).
 * Do not send email in body; backend sets email from the verified Clerk user.
 * @param userData Optional full_name and phone only
 * @returns Created user data
 */
export const createUser = async (
  userData: CreateUserRequest
): Promise<CreateUserResponse> => {
  try {
    const body = { full_name: userData.full_name, phone: userData.phone };
    const response = await apiClient.post<CreateUserResponse>(
      '/client/create',
      body
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
      `/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`
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
  time: string;
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

/** Strip HTML/script to reduce XSS risk; backend must also escape when rendering. */
function sanitizeForContact(value: string, maxLength: number): string {
  const trimmed = value.trim();
  const noHtml = trimmed.replace(/<[^>]*>/g, '').replace(/[<>"']/g, '');
  return noHtml.slice(0, maxLength);
}

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
 * Submit contact form data. Inputs are sanitized (HTML stripped) before send; backend must escape when rendering.
 * @param formData Contact form data including email, category, and message
 * @returns Success message
 */
export const submitContactForm = async (
  formData: ContactFormRequest
): Promise<ContactFormResponse> => {
  const sanitized = {
    email: sanitizeForContact(formData.email, 255),
    category: sanitizeForContact(formData.category, 100),
    message: sanitizeForContact(formData.message, 10000),
  };
  try {
    const response = await apiClient.post<ContactFormResponse>(
      '/form/insert',
      sanitized
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
  /** @deprecated Backend must determine user from auth token (e.g. Clerk); do not trust client-supplied email. */
  email?: string;
}

export interface CancelOrderResponse {
  message: string;
}

/**
 * Cancel a student order (sets status to PENDING CANCEL and updates batch).
 * Backend must determine the acting user from the authenticated session (Clerk token) and ignore
 * any client-supplied email; cancel only orders belonging to that user.
 * @param payload batch_num, start_date, end_date (email omitted; backend uses token)
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
        // Do not send email: backend must derive identity from Authorization token
        ...(payload.email != null ? { email: payload.email } : {}),
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
