import { jwtDecode } from "jwt-decode";

// Admin API utility functions

// Types for admin token
export interface AdminTokenPayload {
  adminId: string;
  email: string;
  role: 'admin' | 'employee';
  iat?: number;
  exp?: number;
}

export interface UpdateUserData {
  _id: string;
  name: string;
  last_name?: string;
  mobile: string;
  email: string;
  verified: boolean;
}

export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data?: T;
}

/**
 * Update a user by admin
 * @param userData - The user data to update
 * @param token - Admin authentication token
 * @returns Promise<ApiResponse>
 */
export const updateUser = async (
  userData: UpdateUserData,
  token: string
): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/users`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update user");
    }

    return result;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

/**
 * Get all users (admin only)
 * @param token - Admin authentication token
 * @returns Promise<ApiResponse>
 */
export const getAllUsers = async (token: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch users");
    }

    return result;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Get admin token from localStorage
 * @returns string | null
 */
export const getAdminToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
};

/**
 * Check if admin is authenticated
 * @returns boolean
 */
export const isAdminAuthenticated = (): boolean => {
  const token = getAdminToken();
  return !!token;
};

/**
 * Get all blocked IPs (admin only)
 * @param token - Admin authentication token
 * @returns Promise<ApiResponse>
 */
export const getAllBlockedIPs = async (token: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/blocked-ips`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch blocked IPs");
    }

    return result;
  } catch (error) {
    console.error("Error fetching blocked IPs:", error);
    throw error;
  }
};

/**
 * Get IP activity for a specific IP (admin only)
 * @param ip - IP address to get activity for
 * @param token - Admin authentication token
 * @returns Promise<ApiResponse>
 */
export const getIPActivity = async (ip: string, token: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/ip-activity/${ip}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch IP activity");
    }

    return result;
  } catch (error) {
    console.error("Error fetching IP activity:", error);
    throw error;
  }
};

/**
 * Get IP blocking statistics (admin only)
 * @param token - Admin authentication token
 * @returns Promise<ApiResponse>
 */
export const getIPBlockingStats = async (token: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/ip-blocking-stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch IP blocking stats");
    }

    return result;
  } catch (error) {
    console.error("Error fetching IP blocking stats:", error);
    throw error;
  }
};

/**
 * Get IP blocking configuration (admin only)
 * @param token - Admin authentication token
 * @returns Promise<ApiResponse>
 */
export const getIPBlockingConfig = async (token: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/ip-blocking-config`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch IP blocking config");
    }

    return result;
  } catch (error) {
    console.error("Error fetching IP blocking config:", error);
    throw error;
  }
};

/**
 * Block an IP address (admin only)
 * @param ipData - IP blocking data
 * @param token - Admin authentication token
 * @returns Promise<ApiResponse>
 */
export const blockIP = async (
  ipData: { ip: string; reason: string; duration: number },
  token: string
): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/block-ip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ipData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to block IP");
    }

    return result;
  } catch (error) {
    console.error("Error blocking IP:", error);
    throw error;
  }
};

/**
 * Unblock an IP address (admin only)
 * @param ip - IP address to unblock
 * @param token - Admin authentication token
 * @returns Promise<ApiResponse>
 */
export const unblockIP = async (ip: string, token: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/unblock-ip/${ip}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to unblock IP");
    }

    return result;
  } catch (error) {
    console.error("Error unblocking IP:", error);
    throw error;
  }
};

/**
 * Bulk unblock expired IPs (admin only)
 * @param token - Admin authentication token
 * @returns Promise<ApiResponse>
 */
export const bulkUnblockExpired = async (token: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/bulk-unblock-expired`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to unblock expired IPs");
    }

    return result;
  } catch (error) {
    console.error("Error unblocking expired IPs:", error);
    throw error;
  }
};

// Role checking utility functions

/**
 * Decode admin token and get payload
 * @param token - Admin JWT token
 * @returns AdminTokenPayload | null
 */
export const decodeAdminToken = (token: string): AdminTokenPayload | null => {
  try {
    return jwtDecode<AdminTokenPayload>(token);
  } catch (error) {
    console.error("Error decoding admin token:", error);
    return null;
  }
};

/**
 * Get current admin role from token
 * @returns 'admin' | 'employee' | null
 */
export const getCurrentAdminRole = (): 'admin' | 'employee' | null => {
  const token = getAdminToken();
  if (!token) return null;
  
  const decoded = decodeAdminToken(token);
  return decoded?.role || null;
};

/**
 * Check if current user is an admin
 * @returns boolean
 */
export const isAdmin = (): boolean => {
  return getCurrentAdminRole() === 'admin';
};

/**
 * Check if current user is an employee
 * @returns boolean
 */
export const isEmployee = (): boolean => {
  return getCurrentAdminRole() === 'employee';
};

/**
 * Check if current user has admin role (admin or employee)
 * @returns boolean
 */
export const hasAdminAccess = (): boolean => {
  const role = getCurrentAdminRole();
  return role === 'admin' || role === 'employee';
};

/**
 * Check if current user has specific role
 * @param requiredRole - Role to check for
 * @returns boolean
 */
export const hasRole = (requiredRole: 'admin' | 'employee'): boolean => {
  return getCurrentAdminRole() === requiredRole;
}; 