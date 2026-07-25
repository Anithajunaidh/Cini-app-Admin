import { type AxiosError } from 'axios';

export class ApiError extends Error {
  status: number;

  code?: string;

  fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    code?: string,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function normalizeApiError(error: AxiosError<any>): ApiError {
  if (error.response) {
    const { status, data } = error.response;
    return new ApiError(
      data?.message ?? 'Something went wrong. Please try again.',
      status,
      data?.code,
      data?.errors,
    );
  }
  if (error.request) {
    return new ApiError(
      'Network error. Check your connection.',
      0,
      'NETWORK_ERROR',
    );
  }
  return new ApiError(error.message ?? 'Unexpected error.', 0, 'UNKNOWN_ERROR');
}
