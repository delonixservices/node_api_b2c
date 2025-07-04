import React, { useMemo } from "react";
import Image, { StaticImageData } from "next/image";
import { HiMiniClock } from "react-icons/hi2";
import { FaStar } from "react-icons/fa6";
import type { Hotel } from "../../app/hotels/details/HotelDetailsClient";

const HotelOverview: React.FC<{
  hotel: Hotel;
  mainImage: string | StaticImageData;
  checkInDate: string;
  checkOutDate: string;
  onPrevImage?: () => void;
  onNextImage?: () => void;
  showArrows?: boolean;
}> = React.memo(({ hotel, mainImage, checkInDate, checkOutDate, onPrevImage, onNextImage, showArrows }) => {
  // Get real ratings from moreRatings
  const tripAdvisorRating = hotel.moreRatings?.tripAdvisor?.rating || 0;
  const tripAdvisorReviewCount = hotel.moreRatings?.tripAdvisor?.reviewCount || 0;
  const trustYouRating = hotel.moreRatings?.trustYou?.rating || 0;
  const trustYouReviewCount = hotel.moreRatings?.trustYou?.reviewCount || 0;
  
  // Use the best available rating (prefer TripAdvisor, fallback to TrustYou, then starRating)
  const bestRating = tripAdvisorRating > 0 ? tripAdvisorRating : 
                    trustYouRating > 0 ? trustYouRating : 
                    hotel.starRating || 0;
  const bestReviewCount = tripAdvisorReviewCount > 0 ? tripAdvisorReviewCount : trustYouReviewCount;
  const displayRating = bestRating > 0 ? bestRating : hotel.starRating || 0;

  // Get additional images from the API response
  const additionalImages = useMemo(() => {
    if (hotel.imageDetails?.images && hotel.imageDetails.images.length > 1) {
      return hotel.imageDetails.images.slice(1, 4); // Get next 3 images after main image
    }
    return [];
  }, [hotel.imageDetails?.images]);

  // Dynamic label based on rating
  const getRatingLabel = (rating: number) => {
    if (rating >= 9) return "Excellent";
    if (rating >= 8) return "Very Good";
    if (rating >= 7) return "Good";
    if (rating >= 6) return "Pleasant";
    return "Average";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <aside className="col-span-3">
        <div className="flex gap-4">
          <div className="w-4/5 pl-4 relative">
            {showArrows && (
              <>
                <button
                  onClick={onPrevImage}
                  className="absolute left-2 top-1/2 z-10 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow hover:bg-opacity-100"
                  aria-label="Previous image"
                  type="button"
                >
                  &#8592;
                </button>
                <button
                  onClick={onNextImage}
                  className="absolute right-2 top-1/2 z-10 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow hover:bg-opacity-100"
                  aria-label="Next image"
                  type="button"
                >
                  &#8594;
                </button>
              </>
            )}
            {typeof mainImage === "string" ? (
              <Image
                src={mainImage}
                alt={hotel.name}
                className="w-full border border-gray-200 rounded object-cover"
                width={800}
                height={450}
                priority
                unoptimized
              />
            ) : (
              <Image
                className="w-full border border-gray-200 rounded object-cover"
                src={mainImage}
                alt={hotel.name}
                width={800}
                height={450}
                priority
                unoptimized
              />
            )}
          </div>
          <div className="w-1/5 flex flex-col gap-4">
            {additionalImages.length > 0 ? (
              additionalImages.map((image, index) => (
                <div key={index} className="w-full h-28 border border-gray-200 rounded overflow-hidden">
                  <Image
                    src={image}
                    alt={`${hotel.name} - Image ${index + 2}`}
                    className="w-full h-full object-cover"
                    width={200}
                    height={112}
                    unoptimized
                  />
                </div>
              ))
            ) : (
              // Fallback to placeholder divs if no additional images
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full h-28 border border-gray-200 rounded bg-gray-200"
                ></div>
              ))
            )}
          </div>
        </div>
      </aside>
      <aside className="col-span-2">
        <div className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded-lg">
          <div className="col-span-1">
            <h3 className="flex items-center gap-1 text-base text-fuchsia-700 font-semibold">
              <HiMiniClock /> Check In
            </h3>
            <p className="text-slate-500 font-medium text-sm pl-5">
              {checkInDate}
            </p>
          </div>
          <div className="col-span-1">
            <h3 className="flex items-center gap-1 text-base text-fuchsia-700 font-semibold">
              <HiMiniClock /> Check Out
            </h3>
            <p className="text-slate-500 font-medium text-sm pl-5">
              {checkOutDate}
            </p>
          </div>
        </div>
        <div className="py-3">
          <h4 className="font-semibold mb-2 text-lg text-stone-600">Overview</h4>
          <p className="text-base text-slate-500">
            {hotel.originalName || hotel.name} offers comfortable accommodations in{" "}
            {hotel.location.city}. Located at {hotel.location.address}, this{" "}
            {Math.round(displayRating) > 0 ? `${Math.round(displayRating)}-star` : ""} hotel provides a
            pleasant stay for both business and leisure travelers.
          </p>
        </div>
        <div className="py-3">
          <div className="bg-white border border-gray-200 rounded-md p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 text-white font-semibold rounded px-2 py-1 text-sm">
                {displayRating.toFixed(1)}
              </div>
              <div>
                <span className="font-medium text-gray-800">{getRatingLabel(displayRating)}</span>
                <div className="text-xs text-gray-500">
                  Based on {bestReviewCount} reviews
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center text-sm">
                <div className="flex mr-2">
                  {[1, 2, 3, 4, 5].map((star, index) => (
                    <FaStar
                      key={index}
                      className={
                        index < Math.round(displayRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                      size={14}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({Math.round(displayRating)}/5)</span>
              </div>
              <button className="text-fuchsia-600 text-sm font-medium hover:text-fuchsia-800 transition-all ease-in-out" disabled>
                Coming soon...
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
});
HotelOverview.displayName = "HotelOverview";
export default HotelOverview; 