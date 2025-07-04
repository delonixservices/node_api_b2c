"use client";

import React, { useEffect, useState, useCallback, memo } from "react";
import { useParams } from "next/navigation";

type Transaction = {
  id:string;
  transaction_id: string;
  hotelName: string;
  createdAt?: string;
  check_in_date?: string;
  check_out_date?: string;
  room_count?: number;
  first_name: string;
  last_name: string;
  coupon_used: string;
  base_amount?: number;
  service_charges?: number;
  processing_fee?: number;
  gst?: number;
  chargeable_rate?: number;
  transaction_status?: string;
};

const CancelPage = () => {
  const params = useParams();
  const id = (params as Record<string, string>)?.id || "";

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [refundResponse, setRefundResponse] = useState<unknown>(null);
  const [orderStatusResponse, setOrderStatusResponse] = useState<unknown>(null);
  const [refundCheckResponse, setRefundCheckResponse] = useState<unknown>(null);

  const fetchTransaction = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (!id) throw new Error("No transaction ID provided in URL");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/transactions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Failed to fetch transactions");

      const matchedTransaction = result.data.find(
        (txn: Transaction) => txn.id === id
      );

      if (matchedTransaction) {
        setTransaction(matchedTransaction);
      } else {
        throw new Error(`Transaction with ID ${id} not found`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "An error occurred while fetching the transaction");
      } else {
        setError("An error occurred while fetching the transaction");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  const handleApiCall = useCallback(async (url: string, body: object, setResponse: React.Dispatch<React.SetStateAction<unknown>>) => {
    setApiLoading(true);
    setApiError("");

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to process the API call");

      const data = await response.json();
      setResponse(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setApiError(error.message || "API call failed");
      } else {
        setApiError("API call failed");
      }
    } finally {
      setApiLoading(false);
    }
  }, []);

  const handleProcessRefund = useCallback(() => {
    handleApiCall(
      `${process.env.NEXT_PUBLIC_API_PATH}/admin/refund-process`,
      { transactionId: id },
      setRefundResponse
    );
  }, [id, handleApiCall]);

  const handlecheclRefund = useCallback(() => {
    handleApiCall(
      `${process.env.NEXT_PUBLIC_API_PATH}/admin/refundamountcheck`,
      { transactionId: id },
      setRefundCheckResponse
    );
  }, [id, handleApiCall]);

  const handleOrderStatus = useCallback(() => {
    handleApiCall(
      `${process.env.NEXT_PUBLIC_API_PATH}/admin/order-Status`,
      { transactionId: id },
      setOrderStatusResponse
    );
  }, [id, handleApiCall]);

  if (loading) return <div className="p-4">Loading transaction details...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">CANCEL USER DETAILS</h1>
      <div className="space-y-2">
        <p><strong>Transaction ID:</strong> {id}</p>
        <p><strong>Hotel Name:</strong> {transaction?.hotelName}</p>
        <p><strong>Created At:</strong> {transaction?.createdAt ? new Date(transaction.createdAt).toLocaleString() : "N/A"}</p>
        <p><strong>Check-in Date:</strong> {transaction?.check_in_date || "N/A"}</p>
        <p><strong>Check-out Date:</strong> {transaction?.check_out_date || "N/A"}</p>
        <p><strong>Room Count:</strong> {transaction?.room_count || "N/A"}</p>
        <p><strong>First Name:</strong> {transaction?.first_name}</p>
        <p><strong>Last Name:</strong> {transaction?.last_name}</p>
        <p><strong>Coupon Used:</strong> {transaction?.coupon_used || "None"}</p>
        <p><strong>Base Amount:</strong> ₹{transaction?.base_amount || 0}</p>
        <p><strong>Service Charges:</strong> ₹{transaction?.service_charges || 0}</p>
        <p><strong>Processing Fee:</strong> ₹{transaction?.processing_fee || 0}</p>
        <p><strong>GST:</strong> ₹{transaction?.gst || 0}</p>
        <p><strong>Chargeable Rate:</strong> ₹{transaction?.chargeable_rate || 0}</p>
        <p><strong>Transaction Status:</strong> {transaction?.transaction_status || "N/A"}</p>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleProcessRefund}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={apiLoading}
        >
          Process Refund
        </button>
        <button
          onClick={handlecheclRefund}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          disabled={apiLoading}
        >
          Check Refund
        </button>
        <button
          onClick={handleOrderStatus}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={apiLoading}
        >
          Order Status
        </button>
      </div>

      {apiLoading && <div className="mt-4 text-gray-500">Processing...</div>}
      {apiError && <div className="mt-4 text-red-500">{apiError}</div>}
      {refundResponse !== null && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          <h3 className="font-bold mb-2">Refund API Response:</h3>
          <pre className="bg-white p-2 rounded">{JSON.stringify(refundResponse, null, 2)}</pre>
        </div>
      )}
      {refundCheckResponse !== null && (
        <div className="mt-4 p-4 bg-yellow-50 rounded">
          <h3 className="font-bold mb-2">Refund Check Response:</h3>
          <pre className="bg-white p-2 rounded">{JSON.stringify(refundCheckResponse, null, 2)}</pre>
        </div>
      )}
      {orderStatusResponse !== null && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3 className="font-bold mb-2">Order Status API Response:</h3>
          <pre className="bg-white p-2 rounded">{JSON.stringify(orderStatusResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default memo(CancelPage);