'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import * as XLSX from 'xlsx';

type Transaction = {
  id: string;
  hotelName: string;
  createdAt: string;
  check_in_date: string;
  check_out_date: string;
  room_count: number;
  first_name: string;
  last_name: string;
  coupon_used: string;
  base_amount: number;
  service_component: number | null;
  gst: number;
  chargeable_rate: number;
  transaction_status: string;
};

const FilterInput = ({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="mt-1 p-1 border rounded w-full"
    />
  </div>
);

export default function AllTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [hotelNameFilter, setHotelNameFilter] = useState('');
  const [firstNameFilter, setFirstNameFilter] = useState('');
  const [lastNameFilter, setLastNameFilter] = useState('');
  const [couponUsedFilter, setCouponUsedFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/transactions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
        });

        const result = await response.json();
        if (result.status === 200) {
          setTransactions(result.data);
        } else {
          console.error('Unexpected response:', result);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        (txn) =>
          txn.transaction_status === 'refunded' &&
          txn.hotelName.toLowerCase().includes(hotelNameFilter.toLowerCase()) &&
          txn.first_name.toLowerCase().includes(firstNameFilter.toLowerCase()) &&
          txn.last_name.toLowerCase().includes(lastNameFilter.toLowerCase()) &&
          txn.coupon_used.toLowerCase().includes(couponUsedFilter.toLowerCase())
      ),
    [transactions, hotelNameFilter, firstNameFilter, lastNameFilter, couponUsedFilter]
  );

  const handleSort = (key: keyof Transaction) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedTransactions = useMemo(() => {
    if (!sortConfig) return filteredTransactions;
    const sorted = [...filteredTransactions].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue === undefined || bValue === undefined) return 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
    return sorted;
  }, [filteredTransactions, sortConfig]);

  const exportToExcel = () => {
    // Prepare data for export
    const exportData = sortedTransactions.map((txn) => ({
      'Hotel Name': txn.hotelName,
      'First Name': txn.first_name,
      'Last Name': txn.last_name,
      'Coupon Used': txn.coupon_used,
      'Room Count': txn.room_count,
      'Check-in Date': txn.check_in_date ? format(new Date(txn.check_in_date), 'dd MMM yyyy') : '-',
      'Check-out Date': txn.check_out_date ? format(new Date(txn.check_out_date), 'dd MMM yyyy') : '-',
      'Base Amount': `₹${txn.base_amount}`,
      'Service Component': txn.service_component ? `₹${txn.service_component}` : '-',
      'GST': `₹${txn.gst}`,
      'Total Amount': `₹${txn.chargeable_rate}`,
      'Status': txn.transaction_status,
      'Transaction ID': txn.id,
      'Created At': txn.createdAt ? format(new Date(txn.createdAt), 'dd MMM yyyy HH:mm') : '-'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Hotel Name
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 15 }, // Coupon Used
      { wch: 12 }, // Room Count
      { wch: 15 }, // Check-in Date
      { wch: 15 }, // Check-out Date
      { wch: 15 }, // Base Amount
      { wch: 18 }, // Service Component
      { wch: 12 }, // GST
      { wch: 15 }, // Total Amount
      { wch: 12 }, // Status
      { wch: 20 }, // Transaction ID
      { wch: 20 }, // Created At
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Refund Transactions');

    // Generate filename with current date
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const filename = `refund-transactions-${currentDate}.xlsx`;

    // Save the file
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Refund Transactions</h1>
        <button
          onClick={exportToExcel}
          disabled={loading || sortedTransactions.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to Excel
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-auto">
          <div className="mb-4 text-sm text-gray-600">
            Showing {sortedTransactions.length} refund transactions
          </div>
          <table className="min-w-[1200px] w-full border border-gray-300 text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort('hotelName')}>
                  Hotel Name {sortConfig?.key === 'hotelName' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  <FilterInput
                    placeholder="Search by hotel name"
                    value={hotelNameFilter}
                    onChange={(e) => setHotelNameFilter(e.target.value)}
                  />
                </th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort('first_name')}>
                  First Name {sortConfig?.key === 'first_name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  <FilterInput
                    placeholder="Search by first name"
                    value={firstNameFilter}
                    onChange={(e) => setFirstNameFilter(e.target.value)}
                  />
                </th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort('last_name')}>
                  Last Name {sortConfig?.key === 'last_name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  <FilterInput
                    placeholder="Search by last name"
                    value={lastNameFilter}
                    onChange={(e) => setLastNameFilter(e.target.value)}
                  />
                </th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort('coupon_used')}>
                  Coupon Used {sortConfig?.key === 'coupon_used' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  <FilterInput
                    placeholder="Search by coupon"
                    value={couponUsedFilter}
                    onChange={(e) => setCouponUsedFilter(e.target.value)}
                  />
                </th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort('room_count')}>
                  Room Count {sortConfig?.key === 'room_count' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort('check_in_date')}>
                  Check-in {sortConfig?.key === 'check_in_date' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort('check_out_date')}>
                  Check-out {sortConfig?.key === 'check_out_date' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort('base_amount')}>
                  Base Amount {sortConfig?.key === 'base_amount' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th className="border px-3 py-2">Service Component</th>
                <th className="border px-3 py-2">GST</th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort('chargeable_rate')}>
                  Total Amount {sortConfig?.key === 'chargeable_rate' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort('transaction_status')}>
                  Status {sortConfig?.key === 'transaction_status' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{txn.hotelName}</td>
                  <td className="border px-3 py-2">{txn.first_name}</td>
                  <td className="border px-3 py-2">{txn.last_name}</td>
                  <td className="border px-3 py-2">{txn.coupon_used}</td>
                  <td className="border px-3 py-2">{txn.room_count}</td>
                  <td className="border px-3 py-2">{txn.check_in_date ? format(new Date(txn.check_in_date), 'dd MMM yyyy') : '-'}</td>
                  <td className="border px-3 py-2">{txn.check_out_date ? format(new Date(txn.check_out_date), 'dd MMM yyyy') : '-'}</td>
                  <td className="border px-3 py-2">₹{txn.base_amount}</td>
                  <td className="border px-3 py-2">{txn.service_component ? `₹${txn.service_component}` : '-'}</td>
                  <td className="border px-3 py-2">₹{txn.gst}</td>
                  <td className="border px-3 py-2 font-semibold">₹{txn.chargeable_rate}</td>
                  <td className="border px-3 py-2">
                    <span className="px-2 py-0.5 rounded text-white text-xs bg-red-500">
                      {txn.transaction_status}
                    </span>
                  </td>
                  <td className="border px-3 py-2">
                    <Link
                      href={`/admin/cancel/${txn.id}`}
                      className="px-3 py-1 bg-violet-600 text-white rounded hover:bg-violet-700 text-sm"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
