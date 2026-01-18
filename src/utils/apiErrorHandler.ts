import { ToastConfig, ToastType } from '../components/Toast';

// Error types
export enum ApiErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  SERVER = 'SERVER',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  originalError?: unknown;
}

// Turkish error messages
const ERROR_MESSAGES: Record<ApiErrorType, string> = {
  [ApiErrorType.NETWORK]: 'Internet baglantisi yok. Lutfen baglantinizi kontrol edin.',
  [ApiErrorType.TIMEOUT]: 'Istek zaman asimina ugradi. Lutfen tekrar deneyin.',
  [ApiErrorType.SERVER]: 'Sunucu hatasi olustu. Lutfen daha sonra tekrar deneyin.',
  [ApiErrorType.UNAUTHORIZED]: 'Oturum suresi doldu. Lutfen tekrar giris yapin.',
  [ApiErrorType.FORBIDDEN]: 'Bu islemi yapmaya yetkiniz yok.',
  [ApiErrorType.NOT_FOUND]: 'Aranan icerik bulunamadi.',
  [ApiErrorType.VALIDATION]: 'Girilen bilgilerde hata var. Lutfen kontrol edin.',
  [ApiErrorType.UNKNOWN]: 'Beklenmeyen bir hata olustu.',
};

/**
 * Parse error and return structured ApiError
 */
export function parseApiError(error: unknown): ApiError {
  // Network error
  if (error instanceof TypeError && error.message === 'Network request failed') {
    return {
      type: ApiErrorType.NETWORK,
      message: ERROR_MESSAGES[ApiErrorType.NETWORK],
      originalError: error,
    };
  }

  // Timeout error
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      type: ApiErrorType.TIMEOUT,
      message: ERROR_MESSAGES[ApiErrorType.TIMEOUT],
      originalError: error,
    };
  }

  // HTTP error with status code
  if (error && typeof error === 'object' && 'status' in error) {
    const statusCode = (error as { status: number }).status;
    return parseHttpError(statusCode, error);
  }

  // Response object
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as { statusCode: number }).statusCode;
    return parseHttpError(statusCode, error);
  }

  // Generic Error
  if (error instanceof Error) {
    return {
      type: ApiErrorType.UNKNOWN,
      message: error.message || ERROR_MESSAGES[ApiErrorType.UNKNOWN],
      originalError: error,
    };
  }

  return {
    type: ApiErrorType.UNKNOWN,
    message: ERROR_MESSAGES[ApiErrorType.UNKNOWN],
    originalError: error,
  };
}

function parseHttpError(statusCode: number, originalError: unknown): ApiError {
  if (statusCode === 401) {
    return {
      type: ApiErrorType.UNAUTHORIZED,
      message: ERROR_MESSAGES[ApiErrorType.UNAUTHORIZED],
      statusCode,
      originalError,
    };
  }

  if (statusCode === 403) {
    return {
      type: ApiErrorType.FORBIDDEN,
      message: ERROR_MESSAGES[ApiErrorType.FORBIDDEN],
      statusCode,
      originalError,
    };
  }

  if (statusCode === 404) {
    return {
      type: ApiErrorType.NOT_FOUND,
      message: ERROR_MESSAGES[ApiErrorType.NOT_FOUND],
      statusCode,
      originalError,
    };
  }

  if (statusCode === 422 || statusCode === 400) {
    return {
      type: ApiErrorType.VALIDATION,
      message: ERROR_MESSAGES[ApiErrorType.VALIDATION],
      statusCode,
      originalError,
    };
  }

  if (statusCode >= 500) {
    return {
      type: ApiErrorType.SERVER,
      message: ERROR_MESSAGES[ApiErrorType.SERVER],
      statusCode,
      originalError,
    };
  }

  return {
    type: ApiErrorType.UNKNOWN,
    message: ERROR_MESSAGES[ApiErrorType.UNKNOWN],
    statusCode,
    originalError,
  };
}

/**
 * Convert ApiError to ToastConfig
 */
export function errorToToast(error: ApiError): ToastConfig {
  let type: ToastType = 'error';

  // Use warning for recoverable errors
  if (
    error.type === ApiErrorType.NETWORK ||
    error.type === ApiErrorType.TIMEOUT
  ) {
    type = 'warning';
  }

  return {
    message: error.message,
    type,
    duration: error.type === ApiErrorType.NETWORK ? 5000 : 3000,
  };
}

/**
 * Handle API error and return toast config
 *
 * Usage:
 * try {
 *   await fetchData();
 * } catch (err) {
 *   const toastConfig = handleApiError(err);
 *   showToast(toastConfig);
 * }
 */
export function handleApiError(error: unknown): ToastConfig {
  const apiError = parseApiError(error);
  return errorToToast(apiError);
}

/**
 * Create a fetch wrapper with timeout and error handling
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw { status: response.status, statusText: response.statusText };
    }

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
