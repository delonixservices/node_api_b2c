import React from "react";
import type { Hotel } from "@/app/hotels/details/HotelDetailsClient";

const LocationSection: React.FC<{ location: Hotel["location"] }> = React.memo(({ location }) => (
  <section className="container mx-auto px-6 py-8 bg-white shadow-md rounded-2xl">
    <h2 className="text-2xl font-bold mb-6 text-gray-800">Location</h2>
    <div className="h-72 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
      {location.latLng ? (
        <>
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-2 font-medium">
              {location.address}, {location.city}, {location.country}
            </p>
          </div>
          <iframe
            src={`https://maps.google.com/maps?q=${location.latLng.lat},${location.latLng.lng}&z=15&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            aria-hidden="false"
            tabIndex={0}
          ></iframe>
        </>
      ) : (
        <p className="text-gray-400 italic flex items-center justify-center h-full">Location coming soon...</p>
      )}
    </div>
  </section>
));
LocationSection.displayName = "LocationSection";
export default LocationSection;
