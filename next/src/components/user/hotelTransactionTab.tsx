"use client";

import React from "react";

// Interfaces copied from hoteldetails.tsx for type safety
interface Hotel {
  name: string;
}

interface RoomDetails {
  description: string;
}

interface HotelPackage {
  room_details: RoomDetails;
}

interface SearchDetails {
  check_in_date: string;
  check_out_date: string;
  adult_count: number;
  child_count: number;
}

interface Pricing {
  total_chargeable_amount: number;
}

interface ContactDetails {
  name: string;
  mobile: string;
}

export interface Booking {
  hotel: Hotel;
  hotel_package: HotelPackage;
  search: SearchDetails;
  pricing: Pricing;
  contact_details: ContactDetails;
}

const DetailsModal = ({ booking, onClose }: { booking: Booking; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full">
        <h2 className="text-lg font-bold mb-2">{booking.hotel.name}</h2>
        <p><strong>Room:</strong> {booking.hotel_package.room_details.description}</p>
        <p><strong>Check-in:</strong> {booking.search.check_in_date}</p>
        <p><strong>Check-out:</strong> {booking.search.check_out_date}</p>
        <p><strong>Guests:</strong> {booking.search.adult_count} Adults, {booking.search.child_count} Children</p>
        <p><strong>Rate:</strong> ₹{booking.pricing.total_chargeable_amount}</p>
        <p><strong>Contact:</strong> {booking.contact_details.name} - {booking.contact_details.mobile}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DetailsModal;
