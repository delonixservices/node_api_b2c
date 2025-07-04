"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

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

const CancelledTransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotelNameFilter, setHotelNameFilter] = useState('');
  const [firstNameFilter, setFirstNameFilter] = useState('');
  const [lastNameFilter, setLastNameFilter] = useState('');
  const [couponUsedFilter, setCouponUsedFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' } | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/transactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setTransactions(result.data);
      } else {
        console.error('Error fetching transactions:', result);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = transactions.filter((txn) => {
    return (
      txn.transaction_status === 'cancelled' &&
      txn.hotelName.toLowerCase().includes(hotelNameFilter.toLowerCase()) &&
      txn.first_name.toLowerCase().includes(firstNameFilter.toLowerCase()) &&
      txn.last_name.toLowerCase().includes(lastNameFilter.toLowerCase()) &&
      txn.coupon_used.toLowerCase().includes(couponUsedFilter.toLowerCase())
    );
  });

  const handleSort = (key: keyof Transaction) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedTransactions = React.useMemo(() => {
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

  const exportToCSV = () => {
    if (sortedTransactions.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Hotel Name',
      'First Name',
      'Last Name',
      'Coupon Used',
      'Room Count',
      'Check-in Date',
      'Check-out Date',
      'Base Amount',
      'Service Component',
      'GST',
      'Total Amount',
      'Status'
    ];

    const csvData = sortedTransactions.map(txn => [
      txn.hotelName,
      txn.first_name,
      txn.last_name,
      txn.coupon_used,
      txn.room_count,
      format(new Date(txn.check_in_date), 'dd MMM yyyy'),
      format(new Date(txn.check_out_date), 'dd MMM yyyy'),
      txn.base_amount,
      txn.service_component || '-',
      txn.gst,
      txn.chargeable_rate,
      txn.transaction_status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cancelled-transactions-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Cancelled Transactions</h1>
        <button
          onClick={exportToCSV}
          disabled={sortedTransactions.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export as CSV
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-[1200px] w-full border border-gray-300 text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort('hotelName')}>
                  Hotel Name {sortConfig?.key === 'hotelName' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  <input
                    type="text"
                    placeholder="Search by hotel name"
                    value={hotelNameFilter}
                    onChange={(e) => setHotelNameFilter(e.target.value)}
                    className="mt-1 p-1 border rounded w-full"
                  />
                </th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort('first_name')}>
                  First Name {sortConfig?.key === 'first_name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  <input
                    type="text"
                    placeholder="Search by first name"
                    value={firstNameFilter}
                    onChange={(e) => setFirstNameFilter(e.target.value)}
                    className="mt-1 p-1 border rounded w-full"
                  />
                </th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort('last_name')}>
                  Last Name {sortConfig?.key === 'last_name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  <input
                    type="text"
                    placeholder="Search by last name"
                    value={lastNameFilter}
                    onChange={(e) => setLastNameFilter(e.target.value)}
                    className="mt-1 p-1 border rounded w-full"
                  />
                </th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort('coupon_used')}>
                  Coupon Used {sortConfig?.key === 'coupon_used' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  <input
                    type="text"
                    placeholder="Search by coupon"
                    value={couponUsedFilter}
                    onChange={(e) => setCouponUsedFilter(e.target.value)}
                    className="mt-1 p-1 border rounded w-full"
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
                  <td className="border px-3 py-2">{format(new Date(txn.check_in_date), 'dd MMM yyyy')}</td>
                  <td className="border px-3 py-2">{format(new Date(txn.check_out_date), 'dd MMM yyyy')}</td>
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
};

export default memo(CancelledTransactionsPage);
