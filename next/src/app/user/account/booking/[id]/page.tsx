"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Booking } from "@/components/user/BookingCard";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

interface RefundDetails {
  refundAmount: number;
  refundStatus: string;
  refundDate?: string;
  refundReason?: string;
  data?: {
    bank_ref_no?: string;
    payment_mode?: string;
    card_name?: string;
  };
  cancel_response?: {
    status: string;
    message?: string;
    refundAmount?: number;
    refundDate?: string;
    data?: {
      status: string;
      message?: string;
      cancellation_details?: {
        cancelled_at: string;
        api_penalty_percentage: number;
        api_penalty?: {
          currency: string;
          value: number;
        };
        penalty?: {
          currency: string;
          value: number;
        };
        cancellation_charge: number;
        refund?: {
          currency: string;
          value: number;
        };
        penalty_percentage: number;
      };
      cancellation_policy?: {
        remarks: string;
        cancellation_policies: Array<{
          date_from: string;
          date_to: string;
          penalty_percentage: number;
        }>;
      };
    };
  };
  status?: string;
}

export default function BookingDetails() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isLoadingRefund, setIsLoadingRefund] = useState(false);
  const [refundDetails, setRefundDetails] = useState<RefundDetails | null>(null);

  // Booking progress steps based on status codes 0-7
  const bookingSteps = [
    { label: "Initial", status: 0 },
    { label: "Booking Success", status: 1 },
    { label: "Booking Cancelled", status: 2 },
    { label: "Payment Pending", status: 3 },
    { label: "Payment Success", status: 4 },
    { label: "Booking Failed", status: 5 },
    { label: "Payment Failed", status: 6 },
    { label: "Payment Refunded", status: 7 },
  ];

  // Determine the current step index based on booking.status
  const getCurrentStep = (status: number) => {
    // If status is not in 0-7, fallback to 0
    if (typeof status !== 'number' || status < 0 || status > 7) return 0;
    return status;
  };

  // Helper to determine color for each step
  const getStepColor = (idx: number, status: number) => {
    if (idx < status) return 'bg-green-500 border-green-500 text-white';
    if (idx === status) {
      if ([2, 5, 6, 7].includes(status)) return 'bg-red-500 border-red-500 text-white';
      return 'bg-green-500 border-green-500 text-white';
    }
    return 'bg-white border-gray-300 text-gray-400';
  };

  const getStepTextColor = (idx: number, status: number) => {
    if (idx < status) return 'text-green-600';
    if (idx === status) {
      if ([2, 5, 6, 7].includes(status)) return 'text-red-600';
      return 'text-green-600';
    }
    return 'text-gray-400';
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        const userData: Record<string, unknown> = {};
        try {
          const userString = localStorage.getItem("user");
          if (userString) {
            const parsedUser = JSON.parse(userString);
            userData.user = parsedUser.user || parsedUser;
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error("Failed to parse user data");
          }
        }

        // Use the transactions API to get all bookings
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_PATH}/hotels/transactions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          }
        );

        const data = await response.json();
        if (response.ok) {
          // Find the specific booking by ID
          const foundBooking = data.data?.find((b: Booking) => b.bookingId === params.id);
          if (foundBooking) {
            setBooking(foundBooking);
          } else {
            setError("Booking not found.");
          }
        } else {
          setError(data.message || "Failed to fetch booking details.");
        }
      } catch (err: unknown) {
        toast.error("Error fetching booking details:");
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred while fetching booking details.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBookingDetails();
    }
  }, [params.id]);

  const handleCancelBooking = async () => {
    if (!booking?.bookingId) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      
      setError("Please login to cancel booking");
      return;
    }
  
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }
  
    setIsCancelling(true);
    
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
  
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/hotels/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: userData,
            transactionId: booking.bookingId
          }),
        }
      );
  
      const data = await response.json();
      if (response.ok) {
        toast.success("Booking cancelled successfully");
        router.push("/user/account/manage");
      } else {
        setError(data.message || "Failed to cancel booking");
      }
    } catch (error: unknown) {
      toast.error("Cancellation error:");
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred while cancelling the booking");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const handleViewInvoice = async () => {
    if (!booking?.bookingId) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/hotels/invoice?transactionid=${booking.bookingId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      setError("Failed to fetch invoice.");
    }
  };

  const handleViewVoucher = async () => {
    if (!booking?.bookingId) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/hotels/voucher?transactionid=${booking.bookingId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      setError("Failed to fetch voucher.");
    }
  };

  const handleCheckOrderStatus = async () => {
    if (!booking?.bookingId) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to check order status");
      return;
    }

    setIsCheckingStatus(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/hotels/booking-status?bookingId=${booking.bookingId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert(`Order Status: ${data.order_status}\nAmount: ${data.order_amount}\nStatus Message: ${data.status_message}\nPayment Mode: ${data.payment_mode}\nTransaction Date: ${data.trans_date}`);
      } else {
        setError(data.message || "Failed to check order status");
      }
    } catch (error: unknown) {
      console.error("Order status check error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred while checking order status");
      }
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleGetRefundDetails = async () => {
    if (!booking?.bookingId) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to view refund details");
      return;
    }

    setIsLoadingRefund(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/hotels/refund-details?transactionId=${booking.bookingId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }
      );

      const data = await response.json();
      console.log("Full Refund Details Response:", data);
      console.log("Booking Status:", booking.status);
      console.log("Cancel Response:", data?.cancel_response);
      console.log("Cancellation Details:", data?.cancel_response?.data?.cancellation_details);
      console.log("Cancellation Policy:", data?.cancel_response?.data?.cancellation_policy);
      
      if (response.ok) {
        setRefundDetails(data);
        toast.success("Refund details fetched successfully");
      } else {
        setError(data.message || "Failed to fetch refund details");
      }
    } catch (error: unknown) {
      console.error("Refund details fetch error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred while fetching refund details");
      }
    } finally {
      setIsLoadingRefund(false);
    }
  };

  // Helper function to get status text and styling
  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { text: "Initial State", bg: "bg-gray-100", textColor: "text-gray-800" };
      case 1:
        return { text: "Booking Success", bg: "bg-green-100", textColor: "text-green-800" };
      case 2:
        return { text: "Booking Cancelled", bg: "bg-red-100", textColor: "text-red-800" };
      case 3:
        return { text: "Payment Pending", bg: "bg-yellow-100", textColor: "text-yellow-800" };
      case 4:
        return { text: "Payment Success", bg: "bg-green-100", textColor: "text-green-800" };
      case 5:
        return { text: "Booking Failed", bg: "bg-red-100", textColor: "text-red-800" };
      case 6:
        return { text: "Payment Failed", bg: "bg-red-100", textColor: "text-red-800" };
      case 7:
        return { text: "Payment Refunded", bg: "bg-orange-100", textColor: "text-orange-800" };
      default:
        return { text: "Unknown Status", bg: "bg-gray-100", textColor: "text-gray-800" };
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-r-transparent"></div>
  </div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!booking) return <div className="p-4">Booking not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Booking Progress Timeline (0-7 status codes) */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Booking Progress</h2>
        {booking.status === 1 ? (
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold border-2 bg-green-500 border-green-500 text-white">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="mt-2 text-lg font-semibold text-green-600">Booking Success</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {bookingSteps.map((step, idx) => {
              const currentStep = getCurrentStep(booking.status);
              return (
                <div key={step.label} className="flex items-center w-full">
                  <div className="flex flex-col items-center">
                    <div className={`rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold border-2 ${getStepColor(idx, currentStep)}`}>
                      {idx < currentStep ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className={`mt-2 text-base font-semibold ${getStepTextColor(idx, currentStep)}`}>{step.label}</span>
                  </div>
                  {idx < bookingSteps.length - 1 && (
                    <div className="flex-1 h-1 mx-2" style={{ minWidth: 40 }}>
                      <div className={`h-full w-full rounded ${idx < currentStep ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* End Booking Progress Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Hotel Name and Basic Info */}
        <div className="text-center mb-8 border-b pb-6">
          <h1 className="text-4xl font-extrabold mb-3 text-gray-800">{booking.hotel?.name || booking.hotel?.originalName}</h1>
          
          {/* Cancellation Status Banner */}
          {(booking.status === 2 || booking.status === 7) && booking.cancel_response && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-semibold">
                  {booking.status === 2 ? "Booking Cancelled" : "Payment Refunded"}
                </span>
              </div>
              <div className="mt-2 text-sm text-red-600">
                Cancelled on: {new Date(booking.cancel_response.data.cancellation_details.cancelled_at).toLocaleString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </div>
              {booking.cancel_response.data.cancellation_details.refund?.value !== null && (
                <div className="mt-1 text-sm text-red-600">
                  Refund Amount: {booking.cancel_response.data.cancellation_details.refund?.currency} {booking.cancel_response.data.cancellation_details.refund?.value}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-base font-medium">
              {booking.hotel?.location?.city}
            </span>
            <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-base font-medium">
              {booking.hotel?.location?.address}
            </span>
            {(() => {
              const statusInfo = getStatusInfo(booking.status);
              return (
                <span className={`px-4 py-2 rounded-full text-base font-medium ${statusInfo.bg} ${statusInfo.textColor}`}>
                  {statusInfo.text}
                </span>
              );
            })()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Booking Details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Booking Details</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <p><span className="font-semibold">Booking ID:</span> {booking.bookingId}</p>
                <p><span className="font-semibold">Check-in:</span> {booking.search?.check_in_date}</p>
                <p><span className="font-semibold">Check-out:</span> {booking.search?.check_out_date}</p>
                <p><span className="font-semibold">Room Type:</span> {booking.hotel_package?.room_details?.description}</p>
                <p><span className="font-semibold">Bed Type:</span> {
                  Object.entries(booking.hotel_package?.room_details?.beds as Record<string, number> || {}).map(([type, count]) => 
                    `${count} ${type} bed${count > 1 ? 's' : ''}`
                  ).join(', ') || 'Not specified'
                }</p>
                <p><span className="font-semibold">Guests:</span> {booking.search?.adult_count || 0} Adult(s), {booking.search?.child_count || 0} Child(ren)</p>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Guest Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <p><span className="font-semibold">Name:</span> {booking.contact_details?.name} {booking.contact_details?.last_name}</p>
                <p><span className="font-semibold">Email:</span> {booking.contact_details?.email}</p>
                <p><span className="font-semibold">Mobile:</span> {booking.contact_details?.mobile}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Pricing Details */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Pricing Details</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="border-t pt-3 mt-3">
                  <p className="text-lg">Booking Amount: {booking.pricing?.currency} {booking.pricing?.total_chargeable_amount}</p>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            {booking.cancellation_policy && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Cancellation Policy</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-3 font-medium">{booking.cancellation_policy.remarks}</p>
                  {booking.cancellation_policy.cancellation_policies?.map((policy, idx) => (
                    <div key={idx} className="border-t pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0">
                      <p><span className="font-semibold">From:</span> {policy.date_from ? new Date(policy.date_from).toLocaleDateString() : 'Not specified'}</p>
                      <p><span className="font-semibold">To:</span> {policy.date_to ? new Date(policy.date_to).toLocaleDateString() : 'Not specified'}</p>
                      <p><span className="font-semibold">Penalty:</span> {policy.penalty_percentage || 0}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation Details - Show when booking is cancelled (2) or refunded (7) */}
            {(booking.status === 2 || booking.status === 7) && booking.cancel_response && (
              <div className="mt-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Cancellation Details</h2>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <p>
                    <span className="font-semibold">Cancellation Date:</span> {new Date(booking.cancel_response.data.cancellation_details.cancelled_at).toLocaleString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                  <p>
                    <span className="font-semibold">API Penalty:</span> {booking.cancel_response.data.cancellation_details.api_penalty?.currency} {booking.cancel_response.data.cancellation_details.api_penalty?.value || 0}
                  </p>
                  <p>
                    <span className="font-semibold">Penalty Percentage:</span> {booking.cancel_response.data.cancellation_details.penalty_percentage}%
                  </p>
                  <p>
                    <span className="font-semibold">Cancellation Charge:</span> {booking.cancel_response.data.cancellation_details.cancellation_charge}%
                  </p>
                  {booking.cancel_response.data.cancellation_details.refund?.value !== null && (
                    <p>
                      <span className="font-semibold">Refund Amount:</span> {booking.cancel_response.data.cancellation_details.refund?.currency} {booking.cancel_response.data.cancellation_details.refund?.value}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleViewInvoice}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            View Invoice
          </button>
          <button
            onClick={handleViewVoucher}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            View Voucher
          </button>
          
          {/* Show Check Order Status button only when status is 2 (Cancelled) */}
          {booking.status === 2 && (
            <button
              onClick={handleCheckOrderStatus}
              disabled={isCheckingStatus}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCheckingStatus ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking Status...
                </>
              ) : (
                "Check Order Status"
              )}
            </button>
          )}

          {/* Show Get Refund Details button only when status is 7 (Payment Refunded) */}
          {booking.status === 7 && (
            <button
              onClick={handleGetRefundDetails}
              disabled={isLoadingRefund}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoadingRefund ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading Refund Details...
                </>
              ) : (
                "Get Refund Details"
              )}
            </button>
          )}
          
          {/* Hide Cancel button when status is 2 (Cancelled), 5 (Booking Failed), 6 (Payment Failed), or 7 (Payment Refunded) */}
          {![2, 5, 6, 7].includes(booking.status) && (
            <button
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCancelling ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cancelling...
                </>
              ) : (
                "Cancel Booking"
              )}
            </button>
          )}
        </div>

        {/* Display Refund Details if available */}
        {refundDetails && (() => {
          console.log("Rendering Refund Details:", refundDetails);
          console.log("Booking Status in Render:", booking.status);
          console.log("Cancel Response in Render:", refundDetails?.cancel_response);
          return (
            <div className="mt-8 bg-gray-50 p-6 rounded-lg">
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Refund Details</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      refundDetails.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {refundDetails.status?.toUpperCase() || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cancellation Response Details - Only show when status is 2 (Cancelled) or 7 (Refunded) */}
              {(booking.status === 2 || booking.status === 7) && refundDetails?.cancel_response?.data?.cancellation_details && (
                <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Cancellation Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-medium">Cancelled At:</span>
                        <span className="ml-2 text-gray-800">
                          {new Date(refundDetails.cancel_response.data.cancellation_details.cancelled_at).toLocaleString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">API Penalty Percentage:</span>
                        <span className="ml-2 text-gray-800">{refundDetails.cancel_response.data.cancellation_details.api_penalty_percentage}%</span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">API Penalty Amount:</span>
                        <span className="ml-2 text-gray-800">
                          {refundDetails.cancel_response.data.cancellation_details.api_penalty?.currency} {refundDetails.cancel_response.data.cancellation_details.api_penalty?.value}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Penalty Amount:</span>
                        <span className="ml-2 text-gray-800">
                          {refundDetails.cancel_response.data.cancellation_details.penalty?.currency} {refundDetails.cancel_response.data.cancellation_details.penalty?.value}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Cancellation Charge:</span>
                        <span className="ml-2 text-gray-800">{refundDetails.cancel_response.data.cancellation_details.cancellation_charge}%</span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Refund Amount:</span>
                        <span className="ml-2 text-gray-800">
                          {refundDetails.cancel_response.data.cancellation_details.refund?.currency} {refundDetails.cancel_response.data.cancellation_details.refund?.value}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Penalty Percentage:</span>
                        <span className="ml-2 text-gray-800">{refundDetails.cancel_response.data.cancellation_details.penalty_percentage}%</span>
                      </p>
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  {refundDetails.cancel_response.data.cancellation_policy && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-md font-semibold mb-2 text-gray-700">Cancellation Policy</h4>
                      <p className="text-gray-600 mb-3">{refundDetails.cancel_response.data.cancellation_policy.remarks}</p>
                      <div className="space-y-2">
                        {refundDetails.cancel_response.data.cancellation_policy.cancellation_policies?.map((policy: { date_from: string; date_to: string; penalty_percentage: number }, idx: number) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded">
                            <p className="text-gray-600">
                              <span className="font-medium">From:</span> {new Date(policy.date_from).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">To:</span> {new Date(policy.date_to).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Penalty:</span> {policy.penalty_percentage}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Details Section */}
              {refundDetails.data && (
                <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Payment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-medium">Bank Reference No:</span>
                        <span className="ml-2 text-gray-800">{refundDetails.data.bank_ref_no || 'N/A'}</span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Payment Mode:</span>
                        <span className="ml-2 text-gray-800">{refundDetails.data.payment_mode || 'N/A'}</span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Card Name:</span>
                        <span className="ml-2 text-gray-800">{refundDetails.data.card_name || 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Debug section */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(refundDetails, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })()}
      </div>
      
      <div className="text-xs text-gray-400 mt-4 text-center">
        Booking created on: {booking.created_at ? new Date(booking.created_at).toLocaleString() : 'Date not available'}
      </div>
    </div>
  );
}