"use client";

import React, { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { TableWithFilterSort } from "@/components/TableWithFilterSort";
import { updateUser, getAllUsers, getAdminToken, UpdateUserData } from "@/utils/adminApi";

type User = {
  _id: string;
  name: string;
  last_name?: string;
  mobile: string;
  email: string;
  verified: boolean;
  created_at: string;
};

// Define TableColumn type locally
type TableColumn<T> = {
  key: keyof T;
  label: string;
  type?: "text" | "date";
  sortable?: boolean;
};

export default function AllUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UpdateUserData | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = getAdminToken();
        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        const result = await getAllUsers(token);

        if (result.status === 200 && Array.isArray(result.data)) {
          setUsers(result.data);
        } else {
          console.error("Unexpected response:", result);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEditUser = (user: User) => {
    setEditingUser({
      _id: user._id,
      name: user.name,
      last_name: user.last_name || "",
      mobile: user.mobile,
      email: user.email,
      verified: user.verified,
    });
    setEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdateLoading(true);
    try {
      const token = getAdminToken();
      if (!token) {
        console.error("No token found");
        return;
      }

      const result = await updateUser(editingUser, token);

      if (result.status === 200) {
        // Update the users list with the updated user
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === editingUser._id 
              ? { ...user, ...editingUser }
              : user
          )
        );
        setEditModalOpen(false);
        setEditingUser(null);
        alert("User updated successfully!");
      } else {
        alert(result.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update user");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateUserData, value: string | boolean) => {
    if (!editingUser) return;
    setEditingUser(prev => prev ? { ...prev, [field]: value } : null);
  };

  // Table columns definition
  const columns: TableColumn<User>[] = [
    { key: "name", label: "Name", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "mobile", label: "Mobile", type: "text" },
    { key: "created_at", label: "Created", type: "date" },
    { key: "verified", label: "Verified", type: "text" },
  ];

  // Custom row rendering for badges and actions
  const renderRow = (user: User) => (
    <tr key={user._id} className="hover:bg-gray-50">
      <td className="border px-3 py-2">{user.name} {user.last_name || ""}</td>
      <td className="border px-3 py-2">{user.email}</td>
      <td className="border px-3 py-2">{user.mobile}</td>
      <td className="border px-3 py-2">{format(new Date(user.created_at), "dd MMM yyyy, hh:mm a")}</td>
      <td className="border px-3 py-2">
        <span className={`px-2 py-0.5 rounded text-white text-xs ${user.verified ? "bg-green-600" : "bg-red-500"}`}>
          {user.verified ? "Yes" : "No"}
        </span>
      </td>
      <td className="border px-3 py-2">
        <button 
          onClick={() => handleEditUser(user)}
          className="text-blue-600 hover:underline mr-2"
        >
          Edit
        </button>
        <button className="text-blue-600 hover:underline"></button>
      </td>
    </tr>
  );

  // Add Action column header
  const columnsWithAction: TableColumn<User>[] = [
    ...columns.map(col =>
      col.key === "verified"
        ? { ...col, sortable: false }
        : col
    ),
    { key: "action" as keyof User, label: "Action", type: "text", sortable: false },
  ];

  // Export CSV logic (remains unchanged)
  const exportToCSV = useCallback(() => {
    if (!users.length) return;
    const headers = ["ID", "Name", "Email", "Mobile", "Verified", "Created At"];
    const rows = users.map((user) => [
      user._id,
      `${user.name} ${user.last_name || ""}`.trim(),
      user.email,
      user.mobile,
      user.verified ? "Yes" : "No",
      format(new Date(user.created_at), "dd/MM/yyyy hh:mm a"),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.map((field) => `"${field.replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "users.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [users]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">All Users</h1>
        <button
          onClick={exportToCSV}
          disabled={!users.length}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export CSV
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-auto">
          <TableWithFilterSort
            columns={columnsWithAction}
            data={users}
            renderRow={renderRow}
            tableStyle={{ minWidth: 800 }}
          />
        </div>
      )}

      {/* Edit User Modal */}
      {editModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editingUser.last_name || ""}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile
                </label>
                <input
                  type="text"
                  value={editingUser.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingUser.verified}
                    onChange={(e) => handleInputChange("verified", e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Verified</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
