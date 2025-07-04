"use client";

import { useEffect, useState } from "react";
import { 
  getCurrentAdminRole, 
  isAdmin, 
  isEmployee, 
  hasAdminAccess,
  hasRole 
} from "@/utils/adminApi";

interface RoleBasedComponentProps {
  children?: React.ReactNode;
  adminOnly?: boolean;
  employeeOnly?: boolean;
  fallback?: React.ReactNode;
}

export default function RoleBasedComponent({ 
  children, 
  adminOnly = false, 
  employeeOnly = false, 
  fallback = null 
}: RoleBasedComponentProps) {
  const [role, setRole] = useState<'admin' | 'employee' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentRole = getCurrentAdminRole();
    setRole(currentRole);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if user has access based on props
  let hasAccess = true;
  
  if (adminOnly && !isAdmin()) {
    hasAccess = false;
  }
  
  if (employeeOnly && !isEmployee()) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}

// Example usage components
export function AdminOnlyContent({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedComponent adminOnly={true} fallback={
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    }>
      {children}
    </RoleBasedComponent>
  );
}

export function EmployeeOnlyContent({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedComponent employeeOnly={true} fallback={
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-600">Access denied. Employee privileges required.</p>
      </div>
    }>
      {children}
    </RoleBasedComponent>
  );
}

export function RoleDisplay() {
  const [role, setRole] = useState<'admin' | 'employee' | null>(null);

  useEffect(() => {
    setRole(getCurrentAdminRole());
  }, []);

  if (!role) {
    return <div className="text-gray-500">No role found</div>;
  }

  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
      {role === 'admin' ? (
        <span className="bg-purple-100 text-purple-800">Admin</span>
      ) : (
        <span className="bg-blue-100 text-blue-800">Employee</span>
      )}
    </div>
  );
}

// Hook for role checking
export function useAdminRole() {
  const [role, setRole] = useState<'admin' | 'employee' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentRole = getCurrentAdminRole();
    setRole(currentRole);
    setLoading(false);
  }, []);

  return {
    role,
    loading,
    isAdmin: role === 'admin',
    isEmployee: role === 'employee',
    hasAdminAccess: role === 'admin' || role === 'employee'
  };
} 