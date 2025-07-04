/**
 * Safely decodes a URI component, handling malformed URI errors gracefully
 * @param encodedString - The encoded string to decode
 * @returns The decoded string, or the original string if decoding fails
 */
export function safeDecodeURIComponent(encodedString: string): string {
  if (!encodedString || typeof encodedString !== 'string') {
    return encodedString;
  }

  try {
    // First, try to clean the string of any problematic characters
    const cleanedString = encodedString.replace(/[^\w\-._~:/?#[\]@!$&'()*+,;=%]/g, '');
    
    if (!cleanedString) {
      console.warn("String was completely cleaned, returning original");
      return encodedString;
    }

    // Try to decode the cleaned string
    return decodeURIComponent(cleanedString);
  } catch (error) {
    console.error("Error decoding URI component:", error, "Original string:", encodedString);
    
    // Try alternative decoding approaches
    try {
      // Try decoding without the problematic characters
      const fallbackString = encodedString.replace(/[^\w\-._~:/?#[\]@!$&'()*+,;=%]/g, '');
      return decodeURIComponent(fallbackString);
    } catch (fallbackError) {
      console.error("Fallback decoding also failed:", fallbackError);
      
      // Last resort: try to decode character by character
      try {
        let result = '';
        for (let i = 0; i < encodedString.length; i++) {
          const char = encodedString[i];
          if (char === '%' && i + 2 < encodedString.length) {
            try {
              const hex = encodedString.substring(i + 1, i + 3);
              if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
                result += String.fromCharCode(parseInt(hex, 16));
                i += 2;
                continue;
              }
            } catch {
              // If hex decoding fails, just add the % character
            }
          }
          result += char;
        }
        return result;
      } catch (finalError) {
        console.error("All decoding attempts failed:", finalError);
        // Return the original string if all decoding attempts fail
        return encodedString;
      }
    }
  }
}

/**
 * Safely encodes a URI component, handling any encoding errors gracefully
 * @param string - The string to encode
 * @returns The encoded string, or the original string if encoding fails
 */
export function safeEncodeURIComponent(string: string): string {
  try {
    return encodeURIComponent(string);
  } catch (error) {
    console.error("Error encoding URI component:", error, "Original string:", string);
    // Return the original string if encoding fails
    return string;
  }
}

/**
 * Sanitizes data to prevent URI malformation issues
 * @param obj - The object to sanitize
 * @returns The sanitized object
 */
export function sanitizeForURL<T>(obj: T): T {
  if (typeof obj === 'string') {
    // Remove or replace problematic characters
    return obj.replace(/[\u0000-\u001F\u007F-\u009F]/g, '') as T;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeForURL(item)) as T;
    } else {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeForURL(value);
      }
      return sanitized as T;
    }
  }
  
  return obj;
}

/**
 * Safely parses JSON from a URL parameter, handling both URI decoding and JSON parsing errors
 * @param param - The URL parameter to parse
 * @param fallback - The fallback value if parsing fails
 * @returns The parsed object or the fallback value
 */
export function safeParseURLParam<T>(param: string | null, fallback: T): T {
  if (!param) {
    return fallback;
  }

  // Validate and clean the parameter first
  const cleanedParam = validateAndCleanURLParam(param);
  if (!cleanedParam) {
    console.warn("URL parameter validation failed, returning fallback");
    return fallback;
  }

  // Check if the parameter is too large (URLs have length limits)
  if (cleanedParam.length > 2000) {
    console.warn("URL parameter is very large, might cause issues:", cleanedParam.length);
  }

  try {
    const decodedParam = safeDecodeURIComponent(cleanedParam);
    
    // Check if the decoded parameter is valid JSON
    if (!decodedParam || typeof decodedParam !== 'string') {
      console.warn("Decoded parameter is not a valid string");
      return fallback;
    }

    return JSON.parse(decodedParam);
  } catch (error) {
    console.error("Error parsing URL parameter:", error, "Original param length:", param.length);
    
    // Try parsing the original parameter without cleaning
    try {
      const decodedParam = safeDecodeURIComponent(param);
      return JSON.parse(decodedParam);
    } catch (fallbackError) {
      console.error("Fallback parsing also failed:", fallbackError);
      return fallback;
    }
  }
}

/**
 * Safely creates a URL parameter from an object, handling encoding errors gracefully
 * @param obj - The object to encode
 * @returns The encoded string, or null if encoding fails
 */
export function safeCreateURLParam<T>(obj: T): string | null {
  try {
    // Sanitize the object first to prevent URI malformation
    const sanitizedObj = sanitizeForURL(obj);
    const jsonString = JSON.stringify(sanitizedObj);
    return safeEncodeURIComponent(jsonString);
  } catch (error) {
    console.error("Error creating URL parameter:", error, "Object:", obj);
    return null;
  }
}

/**
 * Session storage utilities for booking data
 */
export const bookingSessionStorage = {
  setBookingData: (data: unknown) => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('booking_data_session', JSON.stringify(data));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting session storage:', error);
      return false;
    }
  },
  
  getBookingData: () => {
    try {
      if (typeof window !== 'undefined') {
        const data = window.sessionStorage.getItem('booking_data_session');
        return data ? JSON.parse(data) : null;
      }
      return null;
    } catch (error) {
      console.error('Error getting session storage:', error);
      return null;
    }
  },
  
  clearBookingData: () => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('booking_data_session');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing session storage:', error);
      return false;
    }
  }
};

/**
 * Validates and cleans a URL parameter to prevent URI malformation
 * @param param - The URL parameter to validate
 * @returns The cleaned parameter or null if invalid
 */
export function validateAndCleanURLParam(param: string | null): string | null {
  if (!param || typeof param !== 'string') {
    return null;
  }

  // Remove any null bytes or control characters
  let cleaned = param.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  
  // Remove any non-printable characters
  cleaned = cleaned.replace(/[^\x20-\x7E]/g, '');
  
  // Check if the cleaned string is still valid
  if (!cleaned.trim()) {
    return null;
  }

  // Check for reasonable length (URLs have practical limits)
  if (cleaned.length > 8000) {
    console.warn("URL parameter is very long, truncating:", cleaned.length);
    cleaned = cleaned.substring(0, 8000);
  }

  return cleaned;
}

/**
 * Safely constructs an image URL by combining base URL and image path without double slashes
 * @param baseUrl - The base URL (e.g., https://example.com)
 * @param imagePath - The image path (e.g., uploads/image.jpg)
 * @returns The properly constructed image URL
 */
export function constructImageUrl(baseUrl: string, imagePath: string): string {
  if (!imagePath) return '/images/hotel.jpg';
  
  // If imagePath is already a full URL, return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove trailing slash from baseUrl and leading slash from imagePath to avoid double slashes
  const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanImagePath = imagePath.replace(/^\//, ''); // Remove leading slash
  
  return `${cleanBaseUrl}/${cleanImagePath}`;
} 