"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import BookingCard from "@/components/user/BookingCard";
import type { Booking } from "@/components/user/BookingCard";
import React from "react";

const ManageHotelTransactions = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated. Please log in.");

      const userItem = localStorage.getItem("user");
      if (!userItem) throw new Error("User data not found in localStorage.");

      const parsedUser = JSON.parse(userItem);
      const userData = parsedUser.user || parsedUser;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/hotels/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user: userData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch bookings.");
      }

      setBookings(result.data || []);
    } catch (err: unknown) {
      console.error("Error fetching bookings:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while fetching bookings.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Group bookings by status
  const groupedBookings = useMemo(() => {
    const groups = {
      booked: [] as Booking[],
      confirmed: [] as Booking[],
      upcoming: [] as Booking[],
      cancelled: [] as Booking[],
      refunded: [] as Booking[],
    };

    const now = new Date();

    bookings.forEach((booking) => {
      const checkInDate = booking.search?.check_in_date ? new Date(booking.search.check_in_date) : null;
      const status = booking.status;

      // Categorize based on status and dates
      if (status === 7) {
        groups.refunded.push(booking);
      } else if (status === 6) {
        groups.cancelled.push(booking);
      } else if (status === 1) {
        if (checkInDate && checkInDate > now) {
          groups.upcoming.push(booking);
        } else {
          groups.confirmed.push(booking);
        }
      } else if (status === 0 || status === 3 || status === 4) {
        groups.booked.push(booking);
      } else {
        // Default to booked for unknown statuses
        groups.booked.push(booking);
      }
    });

    return groups;
  }, [bookings]);

  // Get filtered bookings based on active filter
  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") {
      return bookings;
    }
    return groupedBookings[activeFilter as keyof typeof groupedBookings] || [];
  }, [activeFilter, groupedBookings, bookings]);

  // Get counts for each category
  const bookingCounts = useMemo(() => ({
    all: bookings.length,
    booked: groupedBookings.booked.length,
    confirmed: groupedBookings.confirmed.length,
    upcoming: groupedBookings.upcoming.length,
    cancelled: groupedBookings.cancelled.length,
    refunded: groupedBookings.refunded.length,
  }), [bookings, groupedBookings]);

  const filterOptions = [
    { key: "all", label: "All Bookings", count: bookingCounts.all },
    { key: "booked", label: "Booked", count: bookingCounts.booked },
    { key: "confirmed", label: "Confirmed", count: bookingCounts.confirmed },
    { key: "upcoming", label: "Upcoming", count: bookingCounts.upcoming },
    { key: "cancelled", label: "Cancelled", count: bookingCounts.cancelled },
    { key: "refunded", label: "Refunded", count: bookingCounts.refunded },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      booked: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      upcoming: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-orange-100 text-orange-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-xl p-8 mb-8">
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">
            My Hotel Bookings
          </h1>
          <p className="text-gray-600 text-lg">
            Manage and track all your hotel reservations in one place
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setActiveFilter(option.key)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeFilter === option.key
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{option.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeFilter === option.key
                    ? "bg-white text-purple-600"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white shadow-lg rounded-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Fetching your bookings...</p>
          </div>
        ) : error ? (
          <div className="bg-white shadow-lg rounded-xl p-12 text-center">
            <div className="text-red-600 text-lg font-semibold mb-4">⚠️ Error</div>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {activeFilter === "all" ? "No bookings found" : `No ${activeFilter} bookings`}
            </h3>
            <p className="text-gray-500">
              {activeFilter === "all" 
                ? "You haven't made any hotel bookings yet." 
                : `You don't have any ${activeFilter} bookings at the moment.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Show grouped sections when "all" is selected */}
            {activeFilter === "all" ? (
              Object.entries(groupedBookings).map(([status, statusBookings]) => {
                if (statusBookings.length === 0) return null;
                
                return (
                  <div key={status} className="bg-white shadow-lg rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900 capitalize">
                          {status} Bookings
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(status)}`}>
                          {statusBookings.length}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveFilter(status)}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        View All →
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {statusBookings.slice(0, 3).map((booking) => (
                        <BookingSummaryCard key={booking.bookingId} booking={booking} />
                      ))}
                    </div>
                    
                    {statusBookings.length > 3 && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setActiveFilter(status)}
                          className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          View All {statusBookings.length} {status} bookings
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              /* Show filtered results */
              <div className="bg-white shadow-lg rounded-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 capitalize">
                    {activeFilter} Bookings
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(activeFilter)}`}>
                    {filteredBookings.length}
                  </span>
                </div>
                
                <div className="space-y-6">
                  {filteredBookings.map((booking) => (
                    <BookingSummaryCard key={booking.bookingId} booking={booking} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface BookingSummaryCardProps {
  booking: Booking;
}

const BookingSummaryCard = React.memo(({ booking }: BookingSummaryCardProps) => {
  // Normalize status string for comparison
  const normalizedStatus = useMemo(() => String(booking.status).toLowerCase(), [booking.status]);

  const statusColors: Record<string, string> = {
    confirmed: "text-green-600 bg-green-100",
    "1": "text-green-600 bg-green-100", // numeric confirmed
    pending: "text-yellow-600 bg-yellow-100",
    cancelled: "text-red-600 bg-red-100",
    "6": "text-red-600 bg-red-100", // numeric cancelled
    "7": "text-orange-600 bg-orange-100", // refunded
    "checked-in": "text-blue-600 bg-blue-100",
    "checked-out": "text-gray-600 bg-gray-200",
  };

  // Extract values safely
  const hotelName = useMemo(() => booking.hotel?.name || booking.hotel?.originalName || "Hotel Name Unavailable", [booking.hotel]);
  const checkInDate = useMemo(() => booking.search?.check_in_date ? new Date(booking.search.check_in_date) : null, [booking.search]);
  const checkOutDate = useMemo(() => booking.search?.check_out_date ? new Date(booking.search.check_out_date) : null, [booking.search]);
  const roomType = useMemo(() => booking.hotel_package?.room_details?.description || "N/A", [booking.hotel_package]);
  const statusLabel = useMemo(() => {
    const statusMap: Record<number, string> = {
      0: "Booked",
      1: "Confirmed", 
      3: "Payment Pending",
      4: "Payment Success",
      6: "Cancelled",
      7: "Refunded"
    };
    return statusMap[booking.status] || "Unknown";
  }, [booking.status]);

  // Action handlers (you can connect real logic)
  const handleViewInvoice = useCallback(() => alert(`View invoice for booking ${booking.bookingId}`), [booking.bookingId]);

  return (
    <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      {/* Booking Summary Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 truncate max-w-[70%]">{hotelName}</h3>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold tracking-wide ${
            statusColors[normalizedStatus] || "text-gray-600 bg-gray-100"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Booking Summary Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-gray-700">
        <div>
          <p className="font-semibold text-gray-800 mb-1">Check-In</p>
          <p>{checkInDate ? checkInDate.toLocaleDateString() : "N/A"}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">Check-Out</p>
          <p>{checkOutDate ? checkOutDate.toLocaleDateString() : "N/A"}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">Room Type</p>
          <p className="truncate">{roomType}</p>
        </div>
      </div>

      {/* Existing BookingCard inside */}
      <div className="mb-6 border rounded-lg border-gray-200 bg-white shadow-sm p-4">
        <BookingCard booking={booking} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleViewInvoice}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition duration-300"
        >
          View Invoice
        </button>
      </div>

      {/* Customer Support */}
      <div className="border-t pt-4 text-gray-700 flex flex-col md:flex-row md:justify-between items-start md:items-center">
        <p className="mb-3 md:mb-0 text-sm">
          Need help? Contact{" "}
          <a href="tel:+18001234567" className="text-sky-600 hover:underline font-semibold">
            Customer Support
          </a>{" "}
          or{" "}
          <a href="mailto:support@hotelbooking.com" className="text-sky-600 hover:underline font-semibold">
            Email Us
          </a>
          .
        </p>
      </div>
    </div>
  );
});

BookingSummaryCard.displayName = "BookingSummaryCard";

export default ManageHotelTransactions;
