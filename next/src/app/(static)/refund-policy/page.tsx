'use client';
import React from 'react';

const RefundPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Refund Policy – Trip Bazaar Services Pvt. Ltd.
      </h1>
      <p className="text-gray-700 leading-relaxed mb-4">
        At Trip Bazaar, we are committed to offering transparent, fair, and customer-friendly refund policies for all your travel bookings — including flights, hotels, cruises, travel insurance, and more.
      </p>
      <p className="text-gray-700 leading-relaxed mb-4">
        Trip Bazaar is operated by Trip Bazaar Services Pvt. Ltd., a leading Indian travel company founded in 2017 under the brand Delonix. We strive to provide a seamless booking experience, competitive prices, and a wide selection of travel options supported by cutting-edge technology and 24/7 customer support.
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">Refund Eligibility</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        Refunds are subject to the terms and conditions set by the respective service providers (airlines, hotels, cruise lines, insurance companies, etc.). Trip Bazaar acts as an intermediary and facilitates the refund process as per the policies of these providers.
      </p>
      <p className="text-gray-700 leading-relaxed mb-4">Refunds may be applicable in the following scenarios:</p>
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
        <li>Flight Cancellations: Refunds will be processed based on the airline&#39;s cancellation policy and applicable fare rules.</li>
        <li>Hotel Bookings: Refund eligibility depends on the cancellation policy selected at the time of booking.</li>
        <li>Cruise Bookings: These are governed by the cruise operator&#39;s refund rules.</li>
        <li>Travel Insurance: Non-refundable unless specified otherwise by the insurer.</li>
        <li>Force Majeure Events: Refunds in such cases will be subject to the respective vendor&#39;s discretion.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">Refund Process</h2>
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
        <li>
          Cancellation Request: To initiate a refund, the User must cancel the booking via our website, mobile app, or by contacting our customer support.
        </li>
        <li>
          Verification & Processing: Once the request is received, Trip Bazaar will verify the eligibility and process the refund request with the service provider.
        </li>
        <li>
          Timelines: Refunds, once approved by the provider, will be processed within 7–21 working days to the original mode of payment. Delays may occur depending on the provider&#39;s internal timelines or banking channels.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">Trip Bazaar Service Fees</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        In some cases, Trip Bazaar&#39;s service charges or convenience fees may be non-refundable. This includes payment gateway charges, booking assistance fees, and any cancellation facilitation charges. These will be clearly outlined at the time of booking.
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">Future Expansion & Policy Updates</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        As Trip Bazaar expands its offerings to include bus tickets, IRCTC train bookings, holiday packages, and cab services, the refund policies for these services will be updated and published accordingly.
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">Contact for Refund Support</h2>
      <p className="text-gray-700 leading-relaxed mb-4">For any refund-related queries, please contact:</p>
      <ul className="list-none text-gray-700 mb-4 space-y-2">
        <li>📞 Customer Support: 7678105666</li>
        <li>📧 Email: support@tripbazaar.in</li>
      </ul>
      <p className="text-gray-700 leading-relaxed font-semibold">
        Trip Bazaar Services Pvt. Ltd.<br />
        Your Journey, Our Responsibility.
      </p>
    </div>
  );
};

export default RefundPolicy;