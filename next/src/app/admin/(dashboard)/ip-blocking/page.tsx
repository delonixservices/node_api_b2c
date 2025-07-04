"use client";
import React, { useEffect, useState } from "react";

interface BlockedIP {
  _id: string;
  ip: string;
  reason?: string;
  isActive: boolean;
  blockedAt: string;
  expiresAt?: string;
  hitCount?: number;
  adminId?: { email: string; name: string };
}

interface IPActivity {
  _id: string;
  request: {
    method: string;
    body: any;
    ip: string;
  };
  url: string;
  response: {
    statusCode: number;
    responseTime: number;
  };
  date: string;
}

interface IPStats {
  summary: {
    totalBlocked: number;
    currentlyBlocked: number;
    period: string;
  };
  stats: any[];
  recentBlocks: BlockedIP[];
  topBlockedIPs: any[];
}

interface IPConfig {
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    blockDuration: number;
    consecutiveFailures: number;
    failureWindowMs: number;
  };
  autoBlock: {
    enabled: boolean;
    maxConsecutiveFailures: number;
    blockDuration: number;
  };
}

const IP_BLOCKING_API = `${process.env.NEXT_PUBLIC_API_PATH}/admin`;

const IPBlockingPage = () => {
  const [activeTab, setActiveTab] = useState("blocked-ips");
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [ipActivity, setIpActivity] = useState<IPActivity[]>([]);
  const [ipStats, setIpStats] = useState<IPStats | null>(null);
  const [ipConfig, setIpConfig] = useState<IPConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and search
  const [searchIP, setSearchIP] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [selectedIP, setSelectedIP] = useState("");
  const [activityDays, setActivityDays] = useState(7);
  const [statsDays, setStatsDays] = useState(30);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);

  // Fetch blocked IPs
  const fetchBlockedIPs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: statusFilter,
        ...(searchIP && { search: searchIP })
      });
      
      const res = await fetch(`${IP_BLOCKING_API}/blocked-ips?${params}`);
      if (!res.ok) throw new Error("Failed to fetch blocked IPs");
      const json = await res.json();
      setBlockedIPs(json.data.blockedIPs || []);
      setTotalPages(json.data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch IP activity
  const fetchIPActivity = async () => {
    if (!selectedIP) return;
    
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        days: activityDays.toString()
      });
      
      const res = await fetch(`${IP_BLOCKING_API}/ip-activity/${selectedIP}?${params}`);
      if (!res.ok) throw new Error("Failed to fetch IP activity");
      const json = await res.json();
      setIpActivity(json.data.activity || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch IP blocking statistics
  const fetchIPStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        days: statsDays.toString()
      });
      
      const res = await fetch(`${IP_BLOCKING_API}/ip-blocking-stats?${params}`);
      if (!res.ok) throw new Error("Failed to fetch IP statistics");
      const json = await res.json();
      setIpStats(json.data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch IP blocking configuration
  const fetchIPConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${IP_BLOCKING_API}/ip-blocking-config`);
      if (!res.ok) throw new Error("Failed to fetch IP configuration");
      const json = await res.json();
      setIpConfig(json.data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Bulk unblock expired IPs
  const bulkUnblockExpired = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${IP_BLOCKING_API}/bulk-unblock-expired`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error("Failed to unblock expired IPs");
      const json = await res.json();
      alert(`Successfully unblocked ${json.data.unblockedCount} expired IPs`);
      fetchBlockedIPs(); // Refresh the list
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Block IP
  const blockIP = async (ip: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${IP_BLOCKING_API}/block-ip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip, reason })
      });
      if (!res.ok) throw new Error("Failed to block IP");
      const json = await res.json();
      alert(`Successfully blocked IP: ${ip}`);
      fetchBlockedIPs(); // Refresh the list
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Unblock IP
  const unblockIP = async (ip: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${IP_BLOCKING_API}/unblock-ip/${ip}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error("Failed to unblock IP");
      const json = await res.json();
      alert(`Successfully unblocked IP: ${ip}`);
      fetchBlockedIPs(); // Refresh the list
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case "blocked-ips":
        fetchBlockedIPs();
        break;
      case "ip-activity":
        if (selectedIP) fetchIPActivity();
        break;
      case "statistics":
        fetchIPStats();
        break;
      case "configuration":
        fetchIPConfig();
        break;
    }
  }, [activeTab, currentPage, statusFilter, searchIP, selectedIP, activityDays, statsDays]);

  const tabs = [
    { id: "blocked-ips", label: "Blocked IPs" },
    { id: "ip-activity", label: "IP Activity" },
    { id: "statistics", label: "Statistics" },
    { id: "configuration", label: "Configuration" }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">IP Blocking Management</h1>
        {activeTab === "blocked-ips" && (
          <button
            onClick={bulkUnblockExpired}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Unblock Expired IPs"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {/* Blocked IPs Tab */}
      {activeTab === "blocked-ips" && (
        <div>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search IP..."
              value={searchIP}
              onChange={(e) => setSearchIP(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <table className="min-w-full border">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">IP Address</th>
                    <th className="border px-2 py-1">Reason</th>
                    <th className="border px-2 py-1">Active</th>
                    <th className="border px-2 py-1">Blocked At</th>
                    <th className="border px-2 py-1">Expires At</th>
                    <th className="border px-2 py-1">Hit Count</th>
                    <th className="border px-2 py-1">Blocked By</th>
                    <th className="border px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedIPs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-2">No blocked IPs found.</td>
                    </tr>
                  ) : (
                    blockedIPs.map((ip) => (
                      <tr key={ip._id}>
                        <td className="border px-2 py-1">{ip.ip}</td>
                        <td className="border px-2 py-1">{ip.reason || "-"}</td>
                        <td className="border px-2 py-1">{ip.isActive ? "Yes" : "No"}</td>
                        <td className="border px-2 py-1">{ip.blockedAt ? new Date(ip.blockedAt).toLocaleString() : "-"}</td>
                        <td className="border px-2 py-1">{ip.expiresAt ? new Date(ip.expiresAt).toLocaleString() : "-"}</td>
                        <td className="border px-2 py-1">{ip.hitCount ?? "-"}</td>
                        <td className="border px-2 py-1">{ip.adminId?.name || ip.adminId?.email || "-"}</td>
                        <td className="border px-2 py-1">
                          {ip.isActive ? (
                            <button
                              onClick={() => unblockIP(ip.ip)}
                              disabled={loading}
                              className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => blockIP(ip.ip, ip.reason || 'Manual block')}
                              disabled={loading}
                              className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                            >
                              Block
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <div>
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* IP Activity Tab */}
      {activeTab === "ip-activity" && (
        <div>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter IP address..."
              value={selectedIP}
              onChange={(e) => setSelectedIP(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <select
              value={activityDays}
              onChange={(e) => setActivityDays(Number(e.target.value))}
              className="border px-3 py-2 rounded"
            >
              <option value={1}>Last 1 day</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
            </select>
            <button
              onClick={fetchIPActivity}
              disabled={!selectedIP || loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              View Activity
            </button>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Method</th>
                  <th className="border px-2 py-1">URL</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Response Time</th>
                </tr>
              </thead>
              <tbody>
                {ipActivity.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-2">
                      {selectedIP ? "No activity found for this IP" : "Enter an IP address to view activity"}
                    </td>
                  </tr>
                ) : (
                  ipActivity.map((activity) => (
                    <tr key={activity._id}>
                      <td className="border px-2 py-1">{new Date(activity.date).toLocaleString()}</td>
                      <td className="border px-2 py-1">{activity.request.method}</td>
                      <td className="border px-2 py-1">{activity.url}</td>
                      <td className="border px-2 py-1">{activity.response.statusCode}</td>
                      <td className="border px-2 py-1">{activity.response.responseTime}ms</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === "statistics" && (
        <div>
          <div className="mb-4">
            <select
              value={statsDays}
              onChange={(e) => setStatsDays(Number(e.target.value))}
              className="border px-3 py-2 rounded"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : ipStats ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-100 p-4 rounded">
                  <h3 className="font-bold">Total Blocked</h3>
                  <p className="text-2xl">{ipStats.summary.totalBlocked}</p>
                </div>
                <div className="bg-green-100 p-4 rounded">
                  <h3 className="font-bold">Currently Blocked</h3>
                  <p className="text-2xl">{ipStats.summary.currentlyBlocked}</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded">
                  <h3 className="font-bold">Period</h3>
                  <p className="text-2xl">{ipStats.summary.period}</p>
                </div>
              </div>

              {/* Recent Blocks */}
              <div>
                <h3 className="text-lg font-bold mb-2">Recent Blocks</h3>
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">IP</th>
                      <th className="border px-2 py-1">Reason</th>
                      <th className="border px-2 py-1">Blocked At</th>
                      <th className="border px-2 py-1">Blocked By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ipStats.recentBlocks.map((block) => (
                      <tr key={block._id}>
                        <td className="border px-2 py-1">{block.ip}</td>
                        <td className="border px-2 py-1">{block.reason || "-"}</td>
                        <td className="border px-2 py-1">{new Date(block.blockedAt).toLocaleString()}</td>
                        <td className="border px-2 py-1">{block.adminId?.name || block.adminId?.email || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Top Blocked IPs */}
              <div>
                <h3 className="text-lg font-bold mb-2">Top Blocked IPs by Hit Count</h3>
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">IP</th>
                      <th className="border px-2 py-1">Hit Count</th>
                      <th className="border px-2 py-1">Last Hit</th>
                      <th className="border px-2 py-1">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ipStats.topBlockedIPs.map((ip, index) => (
                      <tr key={index}>
                        <td className="border px-2 py-1">{ip.ip}</td>
                        <td className="border px-2 py-1">{ip.hitCount}</td>
                        <td className="border px-2 py-1">{ip.lastHitAt ? new Date(ip.lastHitAt).toLocaleString() : "-"}</td>
                        <td className="border px-2 py-1">{ip.reason || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>No statistics available</div>
          )}
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === "configuration" && (
        <div>
          {loading ? (
            <div>Loading...</div>
          ) : ipConfig ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-2">Rate Limiting Configuration</h3>
                <div className="bg-gray-100 p-4 rounded">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Window (ms):</strong> {ipConfig.rateLimit.windowMs}
                    </div>
                    <div>
                      <strong>Max Requests:</strong> {ipConfig.rateLimit.maxRequests}
                    </div>
                    <div>
                      <strong>Block Duration (ms):</strong> {ipConfig.rateLimit.blockDuration}
                    </div>
                    <div>
                      <strong>Consecutive Failures:</strong> {ipConfig.rateLimit.consecutiveFailures}
                    </div>
                    <div>
                      <strong>Failure Window (ms):</strong> {ipConfig.rateLimit.failureWindowMs}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">Auto Block Configuration</h3>
                <div className="bg-gray-100 p-4 rounded">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Enabled:</strong> {ipConfig.autoBlock.enabled ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>Max Consecutive Failures:</strong> {ipConfig.autoBlock.maxConsecutiveFailures}
                    </div>
                    <div>
                      <strong>Block Duration (ms):</strong> {ipConfig.autoBlock.blockDuration}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>No configuration available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default IPBlockingPage;
