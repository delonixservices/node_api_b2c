"use client";

import { useState, useEffect, useCallback } from "react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    email: "",
    contactNumber: "",
    currency: "INR",
  });

  const [token, setToken] = useState("");

  useEffect(() => {
    if (!token) {
      const storedToken = localStorage.getItem("admin_token");
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, [token]);

  const handleChange = (field: keyof typeof settings) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/settings`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settings),
        });

        if (response.ok) {
          alert("Settings updated successfully");
        } else {
          alert("Failed to update settings");
        }
      } catch (error) {
        console.error("Error updating settings:", error);
        alert("Error updating settings");
      }
    },
    [settings, token]
  );

  return (
    <div className="bg-white shadow-sm rounded-md p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
        Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Email
          </label>
          <input
            type="email"
            placeholder="admin@example.com"
            value={settings.email}
            onChange={handleChange("email")}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Support Contact Number
          </label>
          <input
            type="text"
            placeholder="+91 9876543210"
            value={settings.contactNumber}
            onChange={handleChange("contactNumber")}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Currency
          </label>
          <select
            value={settings.currency}
            onChange={handleChange("currency")}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
