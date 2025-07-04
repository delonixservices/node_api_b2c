"use client";

import React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { FaUsers, FaHotel, FaTicketAlt, FaMoneyBillWave, FaEdit, FaHistory } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { 
  getCurrentAdminRole, 
  isAdmin, 
  isEmployee, 
  hasAdminAccess 
} from "@/utils/adminApi";

// Types
interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  totalCoupons: number;
  averageRevenuePerTransaction: number;
  couponPerUserRatio: number;
}

interface ConfigData {
  markup: { type: string; value: number };
  service_charge: { type: string; value: number };
  processing_fee: number;
  cancellation_charge: { type: string; value: number };
  changeHistory?: Array<ConfigHistoryItem>;
}

interface ConfigHistoryItem {
  changedBy: { ip: string; userId?: string };
  changes: Record<string, { from: { type: string; value: number }, to: { type: string; value: number } }>;
  timestamp: string;
}

const defaultConfig: ConfigData = {
  markup: { type: "percentage", value: 0 },
  service_charge: { type: "fixed", value: 0 },
  processing_fee: 0,
  cancellation_charge: { type: "percentage", value: 0 },
};

// Stat Card Subcomponent
const StatCard = ({ icon, value, label, color }: { icon: React.ReactNode; value: string | number; label: string; color: string }) => (
  <div className="w-full md:w-1/4 p-2">
    <div className="p-4 flex items-center gap-3 bg-white shadow-md rounded-lg">
      <div className={`text-4xl ${color}`}>{icon}</div>
      <div>
        <p className="text-stone-700 text-xl font-bold">{value}</p>
        <p className="text-gray-500">{label}</p>
      </div>
    </div>
  </div>
);

// Config Value Formatter
const formatConfigValue = (configItem: { type: string; value: number } | number | undefined) => {
  if (!configItem) return "Loading...";
  if (typeof configItem === "number") return `Rs ${configItem}`;
  return configItem.type === "percentage" ? `${configItem.value}%` : `Rs ${configItem.value}`;
};

// Config Change Formatter
const formatChange = (change: Record<string, { from: { type: string; value: number }, to: { type: string; value: number } }> | undefined) => {
  if (!change) return "No changes";
  return Object.entries(change).map(([key, value]) => (
    <div key={key} className="mb-2">
      <strong>{key.replace('_', ' ')}:</strong>
      <div className="ml-4">
        From: {value.from?.type === 'percentage' ? `${value.from.value}%` : `Rs ${value.from.value}`}<br />
        To: {value.to?.type === 'percentage' ? `${value.to.value}%` : `Rs ${value.to.value}`}
      </div>
    </div>
  ));
};

// Config History List Subcomponent
const HistoryList = ({ history, loading, onBack }: { history: ConfigHistoryItem[]; loading: boolean; onBack: () => void }) => (
  <div className="mt-4">
    <h4 className="text-lg font-medium mb-3">Configuration Change History</h4>
    {loading ? (
      <div className="flex justify-center py-4">Loading history...</div>
    ) : history.length === 0 ? (
      <div className="text-gray-500 py-2">No history available</div>
    ) : (
      <div className="space-y-4">
        {history.map((item, index) => (
          <div key={index} className="border-b pb-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">
                  Changed by: {item.changedBy.ip}
                  {item.changedBy.userId && ` (User ID: ${item.changedBy.userId})`}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="mt-2 p-2 bg-gray-50 rounded">{formatChange(item.changes)}</div>
          </div>
        ))}
      </div>
    )}
    <button className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors" onClick={onBack}>
      Back to Current Config
    </button>
  </div>
);

// Config Edit Form Subcomponent
const ConfigForm = ({
  config,
  editConfig,
  preset,
  saving,
  onChange,
  onPresetChange,
  onCancel,
  onSave,
}: {
  config: ConfigData;
  editConfig: Partial<ConfigData>;
  preset: string;
  saving: boolean;
  onChange: (field: keyof ConfigData, value: { type: string; value: number } | number) => void;
  onPresetChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCancel: () => void;
  onSave: () => void;
}) => (
  <div className="space-y-4">
    <div className="flex items-center py-2">
      <label className="w-1/3">Preset:</label>
      <select className="border rounded p-1 flex-1" value={preset} onChange={onPresetChange}>
        <option value="">Select Preset</option>
        <option value="percentage">Percentage</option>
        <option value="fixed">Fixed</option>
      </select>
    </div>
    {(["markup", "service_charge", "cancellation_charge"] as const).map((field) => (
      <div className="flex items-center py-2" key={field}>
        <label className="w-1/3">{field.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}:</label>
        <div className="flex-1 flex items-center">
          <select
            className="border rounded p-1 mr-2"
            value={editConfig[field]?.type || config[field].type}
            onChange={(e) =>
              onChange(field, {
                ...(editConfig[field] || config[field]),
                type: e.target.value,
              })
            }
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
          </select>
          <input
            type="number"
            className="border rounded p-1 w-20"
            value={editConfig[field]?.value ?? config[field].value}
            onChange={(e) =>
              onChange(field, {
                ...(editConfig[field] || config[field]),
                value: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>
    ))}
    <div className="flex items-center py-2">
      <label className="w-1/3">Processing Fee:</label>
      <input
        type="number"
        className="border rounded p-1 flex-1"
        value={editConfig.processing_fee ?? config.processing_fee}
        onChange={(e) => onChange("processing_fee", parseFloat(e.target.value) || 0)}
      />
    </div>
    <div className="flex justify-end space-x-2 pt-4">
      <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors" onClick={onCancel} disabled={saving}>
        Cancel
      </button>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" onClick={onSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [config, setConfig] = useState<ConfigData>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editConfig, setEditConfig] = useState<Partial<ConfigData>>({});
  const [preset, setPreset] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ConfigHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  // Check role and redirect if not admin
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/auth/login");
      return;
    }
    try {
      const currentRole = getCurrentAdminRole();
      setRole(currentRole);
      
      // Only admins can access dashboard, employees should go to transactions
      if (currentRole !== "admin") {
        router.replace("/admin/transactions");
      }
    } catch (e) {
      router.replace("/admin/auth/login");
    }
  }, [router]);

  // Fetch stats and config in parallel
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) throw new Error("Admin token is not available. Please log in.");
        const [statsResponse, configResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/getDashboardData`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/config`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }),
        ]);
        if (!statsResponse.ok) throw new Error("Failed to fetch dashboard data");
        if (!configResponse.ok) throw new Error("Failed to fetch config data");
        const statsData = await statsResponse.json();
        const configData = await configResponse.json();
        setStats({
          totalRevenue: statsData.data.totalMoney || 0,
          totalBookings: statsData.data.totalBookingsWithStatus1 || 0,
          totalUsers: statsData.data.totalUsers || 0,
          totalCoupons: statsData.data.totalCoupons || 0,
          averageRevenuePerTransaction: statsData.data.avgPrice || 0,
          couponPerUserRatio: statsData.data.totalCoupons / (statsData.data.totalUsers || 1) || 0,
        });
        setConfig(configData.data || defaultConfig);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch config history
  const fetchConfigHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const token = localStorage.getItem("admin_token");
      if (!token) throw new Error("Admin token is not available. Please log in.");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/getConfigHistory`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch config history");
      const historyData = await response.json();
      setHistory(historyData.data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Handlers
  const handleHistoryClick = useCallback(() => {
    if (!showHistory) fetchConfigHistory();
    setShowHistory((prev) => !prev);
  }, [showHistory, fetchConfigHistory]);

  const handleEditClick = useCallback(() => {
    setEditing(true);
    setEditConfig(config || defaultConfig);
    setPreset("");
    setShowHistory(false);
  }, [config]);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    setEditConfig({});
    setPreset("");
    setError(null);
  }, []);

  const handleConfigChange = useCallback((field: keyof ConfigData, value: { type: string; value: number } | number) => {
    setEditConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPreset = e.target.value;
    setPreset(selectedPreset);
    if (selectedPreset === "percentage") {
      setEditConfig((prev) => ({
        ...prev,
        markup: { type: "percentage", value: prev.markup?.value ?? config.markup.value },
        service_charge: { type: "percentage", value: prev.service_charge?.value ?? config.service_charge.value },
        cancellation_charge: { type: "fixed", value: prev.cancellation_charge?.value ?? config.cancellation_charge.value },
      }));
    } else if (selectedPreset === "fixed") {
      setEditConfig((prev) => ({
        ...prev,
        markup: { type: "fixed", value: prev.markup?.value ?? config.markup.value },
        service_charge: { type: "fixed", value: prev.service_charge?.value ?? config.service_charge.value },
        cancellation_charge: { type: "fixed", value: prev.cancellation_charge?.value ?? config.cancellation_charge.value },
      }));
    }
  }, [config]);

  const handleSaveConfig = useCallback(async () => {
    try {
      const markupValue = editConfig.markup?.value ?? config.markup.value;
      const serviceChargeValue = editConfig.service_charge?.value ?? config.service_charge.value;
      const processingFeeValue = editConfig.processing_fee ?? config.processing_fee;
      const cancellationChargeValue = editConfig.cancellation_charge?.value ?? config.cancellation_charge.value;
      if ([markupValue, serviceChargeValue, processingFeeValue, cancellationChargeValue].some((v) => v < 0)) {
        setError("Values cannot be negative");
        return;
      }
      const token = localStorage.getItem("admin_token");
      if (!token) throw new Error("Admin token is not available. Please log in.");
      setSaving(true);
      const configToSend = {
        markup: editConfig.markup ?? config.markup,
        serviceCharge: editConfig.service_charge ?? config.service_charge,
        processingFee: editConfig.processing_fee ?? config.processing_fee,
        cancellationCharge: editConfig.cancellation_charge ?? config.cancellation_charge,
      };
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/config`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(configToSend),
      });
      if (!response.ok) throw new Error("Failed to update config");
      const updatedConfig = await response.json();
      setConfig(updatedConfig.data || defaultConfig);
      setEditing(false);
      setEditConfig({});
      setPreset("");
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setSaving(false);
    }
  }, [editConfig, config]);

  // Memoized stat values
  const statCards = useMemo(() => stats && [
    {
      icon: <FaMoneyBillWave />, value: `Rs ${stats.totalRevenue.toLocaleString()}`, label: "Total Revenue", color: "text-green-500"
    },
    {
      icon: <FaHotel />, value: stats.totalBookings.toLocaleString(), label: "Total Bookings", color: "text-blue-500"
    },
    {
      icon: <FaTicketAlt />, value: stats.totalCoupons.toLocaleString(), label: "Total Coupons", color: "text-purple-500"
    },
    {
      icon: <FaUsers />, value: stats.totalUsers.toLocaleString(), label: "Total Users", color: "text-sky-500"
    },
  ], [stats]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!stats || !config) return <div className="text-yellow-500 p-4">Data not available</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap -mx-2">
        {statCards && statCards.map((card, i) => <StatCard key={i} {...card} />)}
        <div className="w-full md:w-1/2 p-2">
          <div className="p-4 bg-white shadow-md rounded-lg">
            <p className="text-gray-600">
              Avg Revenue per Transaction: <span className="font-bold">Rs {stats.averageRevenuePerTransaction.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="w-full mt-6">
        <div className="flex flex-wrap my-5 mx-2">
          <div className="w-full bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="py-2 text-blue-500 text-xl">Config</h3>
              <div className="flex gap-4">
                {!editing && (
                  <>
                    <div className="relative group">
                      <FaHistory
                        className={`text-gray-700 text-2xl cursor-pointer hover:text-blue-500 ${showHistory ? 'text-blue-500' : ''}`}
                        onClick={handleHistoryClick}
                        aria-label="View configuration history"
                      />
                      <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -mt-8 ml-2">View History</span>
                    </div>
                    <div className="relative group">
                      <FaEdit
                        className="text-gray-700 text-2xl cursor-pointer hover:text-blue-500"
                        onClick={handleEditClick}
                        aria-label="Edit configuration"
                      />
                      <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -mt-8 ml-2">Edit Configuration</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {showHistory ? (
              <HistoryList history={history} loading={historyLoading} onBack={() => setShowHistory(false)} />
            ) : editing ? (
              <ConfigForm
                config={config}
                editConfig={editConfig}
                preset={preset}
                saving={saving}
                onChange={handleConfigChange}
                onPresetChange={handlePresetChange}
                onCancel={handleCancelEdit}
                onSave={handleSaveConfig}
              />
            ) : (
              <div className="space-y-2">
                <div className="py-2">Markup: <span className="font-medium">{formatConfigValue(config.markup)}</span></div>
                <div className="py-2">Service Charge: <span className="font-medium">{formatConfigValue(config.service_charge)}</span></div>
                <div className="py-2">Processing Fee: <span className="font-medium">{formatConfigValue(config.processing_fee)}</span></div>
                <div className="py-2">Cancellation Charge: <span className="font-medium">{formatConfigValue(config.cancellation_charge)}</span></div>
              </div>
            )}
            {error && <div className="pt-3 text-red-500">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
