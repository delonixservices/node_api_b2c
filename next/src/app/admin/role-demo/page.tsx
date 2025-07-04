"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  getCurrentAdminRole, 
  isAdmin, 
  isEmployee, 
  hasAdminAccess,
  hasRole,
  decodeAdminToken,
  getAdminToken
} from "@/utils/adminApi";
import { 
  RoleBasedComponent, 
  AdminOnlyContent, 
  EmployeeOnlyContent, 
  RoleDisplay,
  useAdminRole 
} from "@/components/admin/RoleBasedComponent";

export default function RoleDemoPage() {
  const router = useRouter();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const { role, loading, isAdmin: isAdminUser, isEmployee: isEmployeeUser } = useAdminRole();

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/auth/login");
      return;
    }

    const decoded = decodeAdminToken(token);
    setTokenInfo(decoded);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Role-Based Access Control Demo</h1>
        
        {/* Current Role Display */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Current User Role</h2>
          <div className="flex items-center gap-4">
            <RoleDisplay />
            <span className="text-gray-600">
              {role ? `Logged in as: ${role}` : 'No role found'}
            </span>
          </div>
        </div>

        {/* Token Information */}
        {tokenInfo && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">JWT Token Information</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(tokenInfo, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Role Check Results */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Role Check Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="font-medium text-blue-800">isAdmin()</div>
              <div className="text-2xl font-bold text-blue-600">
                {isAdmin() ? '✅' : '❌'}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <div className="font-medium text-green-800">isEmployee()</div>
              <div className="text-2xl font-bold text-green-600">
                {isEmployee() ? '✅' : '❌'}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-md">
              <div className="font-medium text-purple-800">hasAdminAccess()</div>
              <div className="text-2xl font-bold text-purple-600">
                {hasAdminAccess() ? '✅' : '❌'}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-md">
              <div className="font-medium text-orange-800">hasRole('admin')</div>
              <div className="text-2xl font-bold text-orange-600">
                {hasRole('admin') ? '✅' : '❌'}
              </div>
            </div>
          </div>
        </div>

        {/* Role-Based Content Examples */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Role-Based Content Examples</h2>
          
          {/* Admin Only Content */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Admin Only Content</h3>
            <AdminOnlyContent>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800 font-medium">🎉 Welcome Admin!</p>
                <p className="text-green-700 text-sm mt-1">
                  You have full access to all administrative features including:
                </p>
                <ul className="text-green-700 text-sm mt-2 list-disc list-inside">
                  <li>User management</li>
                  <li>System configuration</li>
                  <li>IP blocking management</li>
                  <li>All employee features</li>
                </ul>
              </div>
            </AdminOnlyContent>
          </div>

          {/* Employee Only Content */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Employee Only Content</h3>
            <EmployeeOnlyContent>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-blue-800 font-medium">👋 Welcome Employee!</p>
                <p className="text-blue-700 text-sm mt-1">
                  You have access to employee features including:
                </p>
                <ul className="text-blue-700 text-sm mt-2 list-disc list-inside">
                  <li>Transaction management</li>
                  <li>Customer support</li>
                  <li>Basic reporting</li>
                </ul>
              </div>
            </EmployeeOnlyContent>
          </div>

          {/* Conditional Content */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Conditional Content</h3>
            <RoleBasedComponent>
              {isAdminUser && (
                <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-4">
                  <p className="text-purple-800 font-medium">🔧 Admin Dashboard</p>
                  <p className="text-purple-700 text-sm">Advanced admin controls are available.</p>
                </div>
              )}
              
              {isEmployeeUser && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                  <p className="text-yellow-800 font-medium">📊 Employee Dashboard</p>
                  <p className="text-yellow-700 text-sm">Employee tools and reports are available.</p>
                </div>
              )}
              
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-gray-800 font-medium">📋 Common Features</p>
                <p className="text-gray-700 text-sm">These features are available to all authenticated users.</p>
              </div>
            </RoleBasedComponent>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Direct Function Calls:</h3>
              <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
{`// Check if user is admin
if (isAdmin()) {
  // Show admin features
}

// Check if user is employee
if (isEmployee()) {
  // Show employee features
}

// Check for any admin access
if (hasAdminAccess()) {
  // Show admin panel
}

// Check specific role
if (hasRole('admin')) {
  // Show admin-only content
}`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Component Usage:</h3>
              <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
{`// Admin only content
<AdminOnlyContent>
  <AdminDashboard />
</AdminOnlyContent>

// Employee only content
<EmployeeOnlyContent>
  <EmployeeTools />
</EmployeeOnlyContent>

// Custom role-based component
<RoleBasedComponent adminOnly={true} fallback={<AccessDenied />}>
  <AdminFeatures />
</RoleBasedComponent>`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Hook Usage:</h3>
              <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
{`const { role, loading, isAdmin, isEmployee, hasAdminAccess } = useAdminRole();

if (loading) return <Loading />;
if (isAdmin) return <AdminView />;
if (isEmployee) return <EmployeeView />;`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 