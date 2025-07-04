"use client";

import { useState, useEffect, useCallback } from "react";
import { RiCloseLargeFill } from "react-icons/ri";
import { TableWithFilterSort } from "@/components/TableWithFilterSort";
import type { TableColumn } from "@/components/useTableFilterSort";

const baseUrl = process.env.NEXT_PUBLIC_API_PATH || "";

type VendorRowType = {
  _id: string;
  created_at: string;
  vendor: { name: string; referenceId?: string };
};

export default function AdmMetaSearch() {
  const [addVendor, setAddVendor] = useState(false);
  const [vendor, setVendor] = useState({ name: "" });
  const [addVendorValidation, setAddVendorValidation] = useState("");
  const [vendors, setVendors] = useState<VendorRowType[]>([]);
  const [loading, setLoading] = useState(false);

  // Transactions modal states
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
  const [modalTransactions, setModalTransactions] = useState<{ date: string; amount: number; status: string }[]>([]);

  // Table columns for TableWithFilterSort
  const columns: TableColumn<{ _id: string; created_at: string; vendorName: string; referenceId: string; }>[] = [
    { key: "created_at", label: "Created At", type: "date" },
    { key: "vendorName", label: "Vendor Name", type: "text" },
    { key: "referenceId", label: "Reference ID", type: "text" },
  ];

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/admin/meta-search/vendor-all`);
      const data = await res.json();
      if (res.ok) {
        setVendors(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleViewTransactions = useCallback(async (vendorId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/admin/meta-search/${vendorId}/transactions`);
      const data = await res.json();
      if (res.ok) {
        setModalTransactions(data.transactions || []);
      } else {
        setModalTransactions([]);
      }
      setTransactionsModalOpen(true);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setModalTransactions([]);
      setTransactionsModalOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddVendor = useCallback(async () => {
    if (!vendor.name.trim()) {
      setAddVendorValidation("Vendor name cannot be empty");
      return;
    }
    setAddVendorValidation("");
    try {
      const res = await fetch(`${baseUrl}/admin/meta-search/vendor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: vendor.name }),
      });
      const data = await res.json();
      if (res.ok) {
        setVendors((prev) => [...prev, data.data]);
        setAddVendor(false);
        setVendor({ name: "" });
      } else {
        setAddVendorValidation(data.message || "Failed to add vendor");
      }
    } catch (error) {
      console.error("Error adding vendor:", error);
      setAddVendorValidation("Error adding vendor");
    }
  }, [vendor]);

  const onBtnExport = useCallback(() => {
    if (vendors.length === 0) {
      alert("No vendors to export");
      return;
    }
    const csvRows = [
      ["CreatedAt", "Vendor Name", "Reference ID"],
      ...vendors.map((v) => [
        formatDate(v.created_at),
        v.vendor.name,
        v.vendor.referenceId || "",
      ]),
    ];
    const csvContent = csvRows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendors.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [vendors]);

  // Format created_at date to readable string (YYYY-MM-DD HH:mm)
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Transform vendors to flat rows for the table
  const tableData = vendors.map((v) => ({
    _id: v._id,
    created_at: v.created_at,
    vendorName: v.vendor.name,
    referenceId: v.vendor.referenceId || "",
  }));

  // Custom row renderer to add the action button
  const renderRow = (row: { _id: string; created_at: string; vendorName: string; referenceId: string; }) => (
    <tr key={row._id} className="even:bg-gray-50 hover:bg-gray-100 transition">
      <td className="border px-4 py-2">{row.created_at ? new Date(row.created_at).toLocaleString() : ""}</td>
      <td className="border-b border-gray-200 px-6 py-3 text-gray-700">{row.vendorName}</td>
      <td className="border-b border-gray-200 px-6 py-3 text-gray-700">{row.referenceId}</td>
      <td className="border px-4 py-2 text-center">
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded items"
          onClick={() => handleViewTransactions(row._id)}
        >
          View Transactions
        </button>
      </td>
    </tr>
  );

  return (
    <>
      <section className="max-w-5xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-3">
          <h2 className="uppercase text-2xl font-semibold text-gray-700 tracking-wide">Vendors</h2>
          <div className="space-x-3">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md shadow-md transition"
              onClick={() => setAddVendor(true)}
              type="button"
            >
              Add Vendor
            </button>
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2 rounded-md shadow-md transition"
              onClick={onBtnExport}
              type="button"
            >
              Export As CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-md border border-gray-300 shadow-sm bg-white">
          {loading ? (
            <p className="p-6 text-center text-gray-500">Loading...</p>
          ) : (
            <TableWithFilterSort
              columns={columns}
              data={tableData}
              renderRow={renderRow}
            />
          )}
        </div>
      </section>
      <AddVendorModal
        isOpen={addVendor}
        onClose={setAddVendor}
        vendor={vendor}
        setVendor={setVendor}
        validationMessage={addVendorValidation}
        onSubmit={handleAddVendor}
      />
      <TransactionsModal
        isOpen={transactionsModalOpen}
        onClose={setTransactionsModalOpen}
        transactions={modalTransactions}
      />
    </>
  );
}

const AddVendorModal = ({
  isOpen,
  onClose,
  vendor,
  setVendor,
  validationMessage,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: (status: boolean) => void;
  vendor: { name: string };
  setVendor: React.Dispatch<React.SetStateAction<{ name: string }>>;
  validationMessage: string;
  onSubmit: () => void;
}) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div
            className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              onClick={() => onClose(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close modal"
            >
              <RiCloseLargeFill size={24} />
            </button>
            <div className="p-6">
              <h3
                id="modal-title"
                className="text-xl font-semibold text-gray-800 mb-4"
              >
                Add Vendor
              </h3>
              <label
                htmlFor="vendor_name"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Vendor Name
              </label>
              <input
                type="text"
                id="vendor_name"
                value={vendor.name}
                onChange={(e) => setVendor({ name: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              {validationMessage && (
                <p className="mt-2 text-sm text-red-600">{validationMessage}</p>
              )}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  className="bg-gray-300 hover:bg-gray-400 rounded px-4 py-2 transition"
                  onClick={() => onClose(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 transition"
                  onClick={onSubmit}
                >
                  Add Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const TransactionsModal = ({
  isOpen,
  onClose,
  transactions,
}: {
  isOpen: boolean;
  onClose: (status: boolean) => void;
  transactions: { date: string; amount: number; status: string }[];
}) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div
            className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl mx-auto max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transactions-title"
          >
            <button
              onClick={() => onClose(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close modal"
            >
              <RiCloseLargeFill size={24} />
            </button>
            <div className="p-6">
              <h3
                id="transactions-title"
                className="text-xl font-semibold text-gray-800 mb-4"
              >
                Transactions
              </h3>
              {transactions.length === 0 ? (
                <p className="text-gray-500">No transactions available.</p>
              ) : (
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-4 py-2 text-left font-semibold text-gray-600">Date</th>
                      <th className="border px-4 py-2 text-left font-semibold text-gray-600">Amount</th>
                      <th className="border px-4 py-2 text-left font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, idx) => (
                      <tr key={idx} className="even:bg-gray-50 hover:bg-gray-100 transition">
                        <td className="border px-4 py-2">{new Date(t.date).toLocaleString()}</td>
                        <td className="border px-4 py-2">{t.amount}</td>
                        <td className="border px-4 py-2">{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};



