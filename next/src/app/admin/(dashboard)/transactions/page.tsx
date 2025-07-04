'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { TableWithFilterSort } from '@/components/TableWithFilterSort';
import type { TableColumn } from '@/components/useTableFilterSort';
import axios from 'axios';
// Toast imports removed
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

export default function AllTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>('');

  useEffect(() => {
    const fetchTransactions = async () => {
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
          setError('Unexpected response from server.');
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Table columns for TableWithFilterSort
  const columns: TableColumn<Transaction & { actions?: string }>[] = [
    { key: 'hotelName', label: 'Hotel Name', type: 'text' },
    { key: 'first_name', label: 'First Name', type: 'text' },
    { key: 'last_name', label: 'Last Name', type: 'text' },
    { key: 'coupon_used', label: 'Coupon Used', type: 'text' },
    { key: 'room_count', label: 'Room Count', type: 'text' },
    { key: 'check_in_date', label: 'Check-in', type: 'date' },
    { key: 'check_out_date', label: 'Check-out', type: 'date' },
    { key: 'base_amount', label: 'Base Amount', type: 'text' },
    { key: 'service_component', label: 'Service Component', type: 'text' },
    { key: 'gst', label: 'GST', type: 'text' },
    { key: 'chargeable_rate', label: 'Total Amount', type: 'text' },
    { key: 'transaction_status', label: 'Status', type: 'text' },
    { key: 'actions', label: 'Actions', type: 'text' },
  ];

  // Custom row renderer to add the action select
  const handleAction = useCallback(async (action: string, transactionId: string) => {
    try {
      switch (action) {
        case 'view-details':
          const token = localStorage.getItem('admin_token');
          if (token) {
            try {
              const response = await axios.get(`${process.env.NEXT_PUBLIC_API_PATH}/admin/voucher`, {
                params: { transactionId: transactionId },
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob",
              });

              // Check if the response is a PDF
              const contentType = response.headers['content-type'];
              if (contentType !== 'application/pdf') {
                // Convert blob to text for error message
                const errorText = await new Response(response.data).text();
                console.error('Error downloading voucher:', errorText);
                break;
              }

              const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
              setPdfUrl(url);
              setPdfTitle('Voucher');
              setPdfModalOpen(true);
            } catch (err: unknown) {
              // Axios error: show error message, don't throw
              let errorMsg = 'Error downloading voucher.';
              if (err instanceof Error) {
                errorMsg = err.message;
              } else {
                errorMsg = 'An unexpected error occurred. Please check your connection and try again.';
              }
              console.error('Error downloading voucher:', errorMsg);
            }
          }
          break;
        case 'cancel-transaction':
          const tokenInvoice = localStorage.getItem('admin_token');
          if (tokenInvoice) {
            try {
              const response = await axios.get(`${process.env.NEXT_PUBLIC_API_PATH}/admin/invoice`, {
                params: { transactionId: transactionId },
                headers: { Authorization: `Bearer ${tokenInvoice}` },
                responseType: "blob",
              });

              // Check if the response is a PDF
              const contentType = response.headers['content-type'];
              if (contentType !== 'application/pdf') {
                // Convert blob to text for error message
                const errorText = await new Response(response.data).text();
                console.error('Error downloading invoice:', errorText);
                break;
              }

              const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
              setPdfUrl(url);
              setPdfTitle('Invoice');
              setPdfModalOpen(true);
            } catch (err: unknown) {
              let errorMsg = 'Error downloading invoice.';
              if (err instanceof Error) {
                errorMsg = err.message;
              } else {
                errorMsg = 'An unexpected error occurred. Please check your connection and try again.';
              }
              console.error('Error downloading invoice:', errorMsg);
            }
          }
          break;
        case 'mark-as-complete': {
          const mobile = prompt('Enter mobile number:');
          const message = prompt('Enter message:');
          if (mobile && message) {
            alert(`SMS sent to ${mobile} with message: ${message}`);
          }
          break;
        }
        case 'send-reminder': {
          const email = prompt('Enter email address:');
          if (email) {
            alert(`Email sent to ${email} for transaction ID: ${transactionId}`);
          }
          break;
        }
        default:
          console.warn('Unknown action:', action);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(`Error performing action: ${action}`);
      }
      alert(`Error performing action: ${action}`);
    }
  }, []);

  // Export to Excel function
  const exportToExcel = useCallback(() => {
    if (transactions.length === 0) {
      console.warn('No transactions to export');
      return;
    }

    try {
      // Prepare data for Excel
      const excelData = transactions.map(txn => ({
        'Hotel Name': txn.hotelName,
        'First Name': txn.first_name,
        'Last Name': txn.last_name,
        'Coupon Used': txn.coupon_used,
        'Room Count': txn.room_count,
        'Check-in Date': format(new Date(txn.check_in_date), 'dd MMM yyyy'),
        'Check-out Date': format(new Date(txn.check_out_date), 'dd MMM yyyy'),
        'Base Amount': `₹${txn.base_amount}`,
        'Service Component': txn.service_component ? `₹${txn.service_component}` : '-',
        'GST': `₹${txn.gst}`,
        'Total Amount': `₹${txn.chargeable_rate}`,
        'Status': txn.transaction_status,
        'Transaction ID': txn.id,
        'Created At': format(new Date(txn.createdAt), 'dd MMM yyyy HH:mm')
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

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
        { wch: 20 }, // Status
        { wch: 25 }, // Transaction ID
        { wch: 20 }, // Created At
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

      // Generate filename with current date
      const fileName = `transactions_report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, fileName);
      
      console.log('Excel report downloaded successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      console.error('Failed to export Excel report. Please try again.');
    }
  }, [transactions]);

  const renderRow = (txn: Transaction) => (
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
      <span
  className={`px-2 py-0.5 rounded text-white text-xs ${
    txn.transaction_status === 'payment_pending'
      ? 'bg-yellow-500'
      : txn.transaction_status === 'payment_failed'
      ? 'bg-red-500'
      : 'bg-green-500'
  }`}
>
  {txn.transaction_status}
</span>

      </td>
      <td className="border px-3 py-2">
        <select
          className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded px-2 py-1"
          onChange={(e) => handleAction(e.target.value, txn.id)}
          defaultValue=""
        >
          <option value="" disabled>
            Select Action
          </option>
          <option value="view-details">View voucher</option>
          <option value="cancel-transaction">View invoice</option>
          <option value="mark-as-complete">Send Sms</option>
          <option value="send-reminder">Send Emails</option>
        </select>
      </td>
    </tr>
  );

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">All Transactions</h1>
        <button
          onClick={exportToExcel}
          disabled={loading || transactions.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to Excel
        </button>
      </div>
      {pdfModalOpen && pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-700 text-2xl"
              onClick={() => {
                setPdfModalOpen(false);
                if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
                setPdfUrl(null);
              }}
              aria-label="Close"
            >×</button>
            <h2 className="text-xl font-bold mb-2">{pdfTitle}</h2>
            <iframe
              src={pdfUrl}
              title={pdfTitle}
              width="100%"
              height="600px"
              className="border rounded"
            />
            <div className="flex justify-end mt-2">
              <a
                href={pdfUrl}
                download={`${pdfTitle.toLowerCase()}_${Date.now()}.pdf`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div
          className="overflow-auto"
          style={{
            overflowX: 'auto',
            overflowY: 'auto',
            maxHeight: '80vh',
            minHeight: '400px',
          }}
        >
          <TableWithFilterSort
            columns={columns}
            data={transactions}
            renderRow={renderRow}
            tableStyle={{ minWidth: '1200px' }}
          />
        </div>
      )}
    </div>
  );
}