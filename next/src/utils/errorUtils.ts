/**
 * Utility functions for handling and formatting error messages
 */

export interface ApiError {
  status?: number;
  message?: string;
  code?: string;
  details?: unknown;
}

/**
 * Formats coupon-related error messages for better user experience
 */
export function formatCouponError(error: unknown): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  // If it's already a formatted string, return as is
  if (typeof error === 'string') {
    return error;
  }

  // Handle axios error response
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response: { status: number; data?: { message?: string } } };
    const { status, data } = axiosError.response;
    
    // Use server message if available
    if (data?.message) {
      return data.message;
    }

    // Fallback to status-based messages
    switch (status) {
      case 400:
        return "Invalid coupon code. Please check and try again.";
      case 404:
        return "Coupon code not found. Please verify the code and try again.";
      case 410:
        return "This coupon has expired. Please try a different code.";
      case 409:
        return "This coupon has already been used or is not applicable for this booking.";
      case 422:
        return "Coupon cannot be applied to this booking. Please check the terms and conditions.";
      case 429:
        return "Too many attempts. Please wait a moment before trying again.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return "Sorry! Invalid coupon code. Please try again.";
    }
  }

  // Handle network errors
  if (error && typeof error === 'object' && 'request' in error) {
    return "Network error. Please check your connection and try again.";
  }

  // Handle other errors
  if (error && typeof error === 'object' && 'message' in error) {
    const errorWithMessage = error as { message: string };
    return errorWithMessage.message;
  }

  return "Sorry! Invalid coupon code. Please try again.";
}

/**
 * Formats general API error messages
 */
export function formatApiError(error: unknown): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const errorWithMessage = error as { message: string };
    return errorWithMessage.message;
  }

  return "An error occurred. Please try again.";
}

/**
 * Validates coupon code format before sending to API
 */
export function validateCouponFormat(code: string): { isValid: boolean; error?: string } {
  if (!code || code.trim().length === 0) {
    return { isValid: false, error: "Please enter a coupon code" };
  }

  if (code.trim().length < 3) {
    return { isValid: false, error: "Coupon code must be at least 3 characters long" };
  }

  if (code.trim().length > 20) {
    return { isValid: false, error: "Coupon code is too long" };
  }

  // Check for valid characters (letters, numbers, hyphens, underscores)
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(code.trim())) {
    return { isValid: false, error: "Coupon code contains invalid characters" };
  }

  return { isValid: true };
}

/**
 * Clears error message after a specified delay
 */
export function clearErrorAfterDelay(
  setError: (message: string) => void, 
  delay: number = 5000
): void {
  setTimeout(() => setError(""), delay);
} 