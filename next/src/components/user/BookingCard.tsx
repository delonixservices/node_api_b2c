'use client';

import React, { useMemo } from "react";
import Link from "next/link";

export type Booking = {
  bookingId: string;
  status: number;
  hotel?: {
    name?: string;
    originalName?: string;
    location?: {
      city?: string;
      address?: string;
    };
  };
  search?: {
    check_in_date?: string;
    check_out_date?: string;
    adult_count?: number;
    child_count?: number;
  };
  contact_details?: {
    name?: string;
    last_name?: string;
    email?: string;
    mobile?: string;
  };
  hotel_package?: {
    room_details?: {
      description?: string;
      beds?: Record<string, number>;
    };
    chargeable_rate?: number;
    room_rate_currency?: string;
    room_rate?: number;
  };
  pricing?: {
    currency?: string;
    total_chargeable_amount?: number;
  };
  cancellation_policy?: {
    remarks?: string;
    cancellation_policies?: Array<{
      date_from?: string;
      date_to?: string;
      penalty_percentage?: number;
    }>;
  };
  created_at?: string;
  cancel_response?: {
    data: {
      cancellation_details: {
        cancelled_at: string;
        api_penalty_percentage: number;
        api_penalty: {
          currency: string;
          value: number;
        };
        penalty: {
          value: number | null;
          currency: string;
        };
        cancellation_charge: number;
        refund: {
          value: number | null;
          currency: string;
        };
        penalty_percentage: number;
      };
      cancellation_policy: {
        cancellation_policies: Array<{
          penalty_percentage: number;
          date_to: string;
          date_from: string;
        }>;
        remarks: string;
      };
    };
  };
};

interface BookingCardProps {
  booking: Booking;
}

const statusMap: Record<number | string, { label: string; color: string }> = {
  0: { label: "Booked", color: "bg-blue-100 text-blue-800" },
  1: { label: "Confirmed", color: "bg-green-100 text-green-800" },
  3: { label: "Payment Pending", color: "bg-yellow-100 text-yellow-800" },
  4: { label: "Payment Success", color: "bg-green-100 text-green-800" },
  6: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  7: { label: "Refunded", color: "bg-orange-100 text-orange-800" },
  default: { label: "Unknown", color: "bg-gray-100 text-gray-800" },
};

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const status = useMemo(() => statusMap[booking.status] || statusMap.default, [booking.status]);

  const totalAmount = booking.pricing?.total_chargeable_amount ?? booking.hotel_package?.chargeable_rate ?? 0;

  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: booking.pricing?.currency || "INR",
      maximumFractionDigits: 0,
    }).format(totalAmount);
  }, [totalAmount, booking.pricing?.currency]);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 p-4 mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate mb-1">
            {booking.hotel?.name || booking.hotel?.originalName || "Hotel Name Unavailable"}
          </h2>
          <div className="flex flex-wrap gap-2 text-sm mb-2">
            {booking.hotel?.location?.city && (
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {booking.hotel.location.city}
              </span>
            )}
            {booking.hotel?.location?.address && (
              <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                {booking.hotel.location.address}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded ${status.color}`}>{status.label}</span>
          </div>
          <div className="text-gray-600 text-sm mb-1">
            <span className="font-medium">Check-in:</span> {booking.search?.check_in_date || "N/A"} &nbsp;|&nbsp;
            <span className="font-medium">Check-out:</span> {booking.search?.check_out_date || "N/A"}
          </div>
          <div className="text-gray-600 text-sm mb-1">
            <span className="font-medium">Total:</span> {formattedAmount}
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <Link
            href={`/user/account/booking/${booking.bookingId}`}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm text-center"
            aria-label={`View details for booking ${booking.bookingId}`}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
