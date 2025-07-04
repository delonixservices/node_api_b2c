"use client";

import { useState, useCallback, memo, useEffect } from "react";

// Define Payment type for payment history
interface Payment {
  id?: string | number;
  name?: string;
  amount?: number;
  date?: string;
  status?: string | number;
  createdAt?: string;
  timestamp?: string;
  payment_date?: string;
  created_at?: string;
}

// Helper for status label and color


const AdmPayments = () => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [paymentValidation, setPaymentValidation] = useState("");
  const [tooltipShown, setTooltipShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState("");

  const validateInputs = useCallback(() => {
    if (!name.trim()) {
      return "Please enter the payer's name.";
    }
    if (!amount || Number(amount) < 100) {
      return "Amount must be at least ₹100.";
    }
    return "";
  }, [name, amount]);

  const generatePaymentLink = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const validationError = validateInputs();
      if (validationError) {
        setPaymentValidation(validationError);
        return;
      }

      setPaymentValidation("");
      setIsLoading(true);

      const orderDetails = {
        name,
        amount: Number(amount),
      };

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_PATH}/admin/payment-generate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
            },
            body: JSON.stringify(orderDetails),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to generate payment link");
        }

        const data = await response.json();

        if (data.data?.payment_id) {
          setPaymentId(data.data.payment_id);
          setPaymentValidation("Payment link generated successfully!");
        } else {
          setPaymentValidation("Failed to get payment link from server.");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setPaymentValidation(error.message);
        } else {
          setPaymentValidation("An unexpected error occurred. Please check your connection and try again.");
        }
        setPaymentValidation(
          "An unexpected error occurred. Please check your connection and try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [validateInputs, name, amount]
  );

  const getFullPaymentLink = useCallback(() => {
    return paymentId
      ? `${process.env.NEXT_PUBLIC_API_PATH}/admin/payment-process/${paymentId}`
      : "";
  }, [paymentId]);

  const copyPaymentLink = useCallback(() => {
    const url = getFullPaymentLink();
    if (!url) return;

    navigator.clipboard.writeText(url);
    setTooltipShown(true);
    setTimeout(() => setTooltipShown(false), 2000);
    setPaymentValidation("Payment link copied to clipboard!");
  }, [getFullPaymentLink]);

  useEffect(() => {
    const fetchPayments = async () => {
      setPaymentsLoading(true);
      setPaymentsError("");
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/admin/payments`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch payments");
        const data =  await response.json();
        setPayments(data.data || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setPaymentsError(err.message);
        } else {
          setPaymentsError("An unexpected error occurred. Please check your connection and try again.");
        }
      } finally {
        setPaymentsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={generatePaymentLink}
          className="bg-white p-6 shadow rounded"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Payer's Name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium" htmlFor="amount">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Amount"
              min={100}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate Payment Link"}
          </button>
        </form>

        {paymentValidation && (
          <p
            className={`mt-4 ${
              paymentValidation.toLowerCase().includes("error") ||
              paymentValidation.toLowerCase().includes("failed")
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {paymentValidation}
          </p>
        )}

        {paymentId && (
          <div className="mt-6 bg-gray-100 p-4 rounded shadow">
            <p>Payment Link:</p>
            <p className="text-blue-500 break-all" onClick={() => {
              navigator.clipboard.writeText(getFullPaymentLink() || "");
              setTooltipShown(true);
              setTimeout(() => setTooltipShown(false), 2000);
            }}>{getFullPaymentLink()}</p>
            <button
              onClick={copyPaymentLink}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
            >
              {tooltipShown ? "Copied!" : "Copy Link"}
            </button>
          </div>
        )}
      </div>

      {/* Payment History Section */}
      <div className="max-w-4xl mx-auto mt-10">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        {paymentsLoading ? (
          <p>Loading payment history...</p>
        ) : paymentsError ? (
          <p className="text-red-600">{paymentsError}</p>
        ) : payments.length === 0 ? (
          <p>No payments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Name</th>
                  <th className="border px-3 py-2 text-left">Amount</th>
                  <th className="border px-3 py-2 text-left">Date</th>
                  <th className="border px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{p.name || "-"}</td>
                    <td className="border px-3 py-2">₹{p.amount}</td>
                    <td className="border px-3 py-2">
                      {/* Use payment_date or created_at for date */}
                      {p.payment_date
                        ? new Date(p.payment_date).toLocaleString()
                        : p.created_at
                        ? new Date(p.created_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="border px-3 py-2">
                      {p.status === 4 ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-green-500 text-white">Success</span>
                      ) : p.status === 6 ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-red-500 text-white">Failed</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-yellow-500 text-white">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(AdmPayments);
