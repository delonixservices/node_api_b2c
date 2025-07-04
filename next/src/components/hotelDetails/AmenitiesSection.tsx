import React from "react";
import { MdWifi, MdPool, MdFitnessCenter, MdRestaurant, MdLocalBar, MdMeetingRoom, MdSpa } from "react-icons/md";

const AmenitiesSection: React.FC<{ amenities: string[] }> = React.memo(({ amenities }) => (
  <section className="container mx-auto px-6 py-8 bg-white shadow-md rounded-2xl">
    <h2 className="text-2xl font-bold mb-6 text-gray-800">Amenities</h2>
    <div className="h-72 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
      {amenities.length > 0 ? (
        amenities.map((amenity, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50"
          >
            <div className="text-blue-600">
              {amenity === "Free WiFi" && <MdWifi className="h-5 w-5" />}
              {amenity === "Swimming Pool" && <MdPool className="h-5 w-5" />}
              {amenity === "Fitness Center" && (
                <MdFitnessCenter className="h-5 w-5" />
              )}
              {amenity === "Restaurant" && <MdRestaurant className="h-5 w-5" />}
              {amenity === "Bar" && <MdLocalBar className="h-5 w-5" />}
              {amenity === "Conference Room" && (
                <MdMeetingRoom className="h-5 w-5" />
              )}
              {amenity === "Spa" && <MdSpa className="h-5 w-5" />}
              {![
                "Free WiFi",
                "Swimming Pool",
                "Fitness Center",
                "Restaurant",
                "Bar",
                "Conference Room",
                "Spa",
              ].includes(amenity) && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-gray-700">{amenity}</span>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center text-gray-400 italic py-8">
          Amenities coming soon...
        </div>
      )}
    </div>
  </section>
));
AmenitiesSection.displayName = "AmenitiesSection";
export default AmenitiesSection; 