'use client';
import React from 'react';

const CustomerCare: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Customer Care  <span className="text-blue-500">Trip</span> <span className="text-purple-500">Bazaar</span>
      </h1>
      <p className="text-gray-700 leading-relaxed mb-4">
        At <span className="text-blue-500 font-semibold">Trip</span> <span className="text-purple-500 font-semibold">Bazaar</span>, we are committed to offering you the best travel deals across flights, hotels, cruises, and travel insurance all in one place. Operated by <span className="italic">Delonix</span>, India leading online travel company established in 2017, our platform is designed to empower travelers with seamless booking options, wide-ranging choices, and 24/7 dedicated customer support.
      </p>
      <p className="text-gray-700 leading-relaxed mb-4">
        We specialize in finding the lowest domestic airfares across India and affordable international flights to top global destinations. With access to over 500,000 hotels worldwide, we ensure that you find the perfect stay that suits both your preferences and your budget.
      </p>
      <p className="text-gray-700 leading-relaxed mb-4">
        <span className="text-blue-500 font-semibold">Trip</span> <span className="text-purple-500 font-semibold">Bazaar</span> is not just a booking platform it is your one-stop travel solution. In the near future, we will also offer bus tickets, IRCTC train bookings, holiday packages, and cab services, ensuring an end-to-end travel experience for customers across the globe.
      </p>
      <p className="text-gray-700 leading-relaxed mb-4">
        Driven by cutting-edge technology and a customer-first approach, <span className="text-blue-500 font-semibold">Trip</span> <span className="text-purple-500 font-semibold">Bazaar</span> is on a mission to redefine travel convenience, comfort, and affordability.
      </p>
      <p className="text-gray-700 leading-relaxed font-semibold">
        Your journey, our responsibility  <span className="text-blue-500 font-semibold">Trip</span> <span className="text-purple-500 font-semibold">Bazaar</span>.
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">Customer Support</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        For any queries or concerns, please contact:
      </p>
      <ul className="list-none text-gray-700 mb-4 space-y-2">
        <li>📞 Customer Support: 7678105666</li>
      </ul>
    </div>
  );
};

export default CustomerCare;