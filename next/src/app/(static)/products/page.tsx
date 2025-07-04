'use client';
import React from 'react';

const products = [
  { title: '✈️ Flight Bookings', details: ['Domestic & International Flights', 'Real-time fare comparison from top airlines', 'Instant e-ticket generation', 'Special offers for students, senior citizens & groups'] },
  { title: '🏨 Hotel Bookings', details: ['Budget to Luxury Hotels in 50,000+ locations', 'Verified property listings with guest reviews', 'Flight + Hotel Combo Discounts', 'Flexible booking & easy cancellation'] },
  { title: '🧳 Holiday Packages', details: ['Ready-to-book tour packages (domestic & international)', 'Customized travel itineraries', 'Honeymoon, Family, and Adventure Tours', 'End-to-end planning with expert consultation'] },
  { title: '🚖 Airport Transfers', details: ['Private cabs for airport pickup & drop', 'Intercity & intracity cab booking products', 'Transparent pricing with no hidden charges'] },
  { title: '📃 Visa Assistance', details: ['Tourist visa application support', 'Documentation help & embassy appointments', 'Consultation for Schengen, UAE, Singapore, and more'] },
  { title: '💼 Corporate Travel', details: ['Business flight & hotel bookings', 'Monthly invoicing & GST-compliant bills', 'Dedicated account managers for enterprises'] },
  { title: '🔁 Flight Rescheduling', details: ['Easy ticket modifications', 'Quick refunds processing', '24/7 customer assistance'] },
  { title: '🎁 Deals & Discounts', details: ['Daily & seasonal offers on flights and hotels', 'Cashback & promo codes', 'Trip Bazaar Wallet for faster checkout & savings'] },
  { title: '🤝 Partner Programs', details: ['Travel agent tie-ups & B2B portal access', 'Commission-based referrals & co-branded platforms'] },
];

const productsInteractive: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((service, index) => (
        <div
          key={index}
          className="bg-white shadow-lg rounded-lg p-6 text-center border border-gray-200"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{service.title}</h3>
          <ul className="text-gray-600 text-left space-y-2">
            {service.details.map((detail, detailIndex) => (
              <li key={detailIndex} className="list-disc list-inside">
                {detail}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default productsInteractive;