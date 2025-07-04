export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-medium text-blue-600 mb-6 border-b pb-4">
        For Business
      </h2>

      <div className="space-y-6">
        <p className="text-gray-700 leading-relaxed">
          Trip Bazaar offers unbeatable deals on flight bookings (inclusive of travel insurance), 
          hotel reservations, cruise bookings, and a wide range of insurance plans — all under one trusted platform.
        </p>

        <p className="text-gray-700 leading-relaxed">
          Our parent company, Delonix, established in 2017, is one of India&apos;s premier online travel agencies. 
          From its inception, Delonix has empowered Indian travellers with instant bookings, diverse travel choices, 
          and cutting-edge technology, backed by 24/7 customer support.
        </p>

        <div className="mt-8">
          <h3 className="text-2xl font-medium text-blue-600 mb-4">What We Offer:</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Lowest Domestic & International Flight Fares</li>
            <li>Over 500,000 Hotels Worldwide – Matching your budget with the best deals</li>
            <li>Cruise Booking Options for Luxurious Getaways</li>
            <li>Travel Insurance for a safe and worry-free journey</li>
          </ul>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-medium text-blue-600 mb-4">Coming Soon:</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Bus Ticket Bookings</li>
            <li>IRCTC Train Ticket Integration</li>
            <li>Custom Holiday Packages</li>
            <li>Cab Booking Services</li>
          </ul>
        </div>

        <p className="text-gray-700 leading-relaxed mt-6">
          Our goal is to become the leading one-stop travel solution globally, catering to all travel needs 
          with reliability, affordability, and seamless user experience.
        </p>

        <p className="text-xl font-medium text-blue-600 italic mt-4">
          Trip Bazaar – Safar aapka, zimmedari hamari!
        </p>

        <div className="mt-8 space-y-2">
          <p className="flex items-center text-gray-700">
            <span className="mr-2">📞</span> Contact us: 
            <a href="tel:7678105666" className="text-blue-600 hover:text-blue-800 ml-2">7678105666</a>
          </p>
          <p className="flex items-center text-gray-700">
            <span className="mr-2">🌐</span> Visit: 
            <a href="https://tripbazaar.in" className="text-blue-600 hover:text-blue-800 ml-2" target="_blank" rel="noopener noreferrer">
              https://tripbazaar.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
