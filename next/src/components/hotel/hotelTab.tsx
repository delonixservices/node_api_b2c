//hotel tab

import { Hotel } from "@/models/hotel";
import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { TiLocation } from "react-icons/ti";
import { useSearchParams } from "next/navigation";
import hotel1 from "../../assets/hotel1.jpg";
import React, { useMemo } from "react";
import { safeParseURLParam } from "../../utils/urlUtils";

interface HotelTabProps {
  hotel: Hotel;
  transaction_identifier: string;
}

interface RoomDetail {
  adult_count?: number;
  child_count?: number;
  adults?: number;
  children?: number;
}

const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case "INR": return "₹";
    case "USD": return "$";
    case "EUR": return "€";
    case "GBP": return "£";
    default: return currency + ' ';
  }
};

const HotelTab: React.FC<HotelTabProps> = React.memo(({ hotel, transaction_identifier }) => {
  const searchParams = useSearchParams();
  const checkInDate = searchParams.get("checkindate") || "";
  const checkOutDate = searchParams.get("checkoutdate") || "";
  const transactionIdentifier = transaction_identifier;

  // Build details param for the details page
  const details = searchParams.get("details") || (() => {
    // fallback: build details from rooms param if present
    const roomsParam = searchParams.get("rooms");
    const parsed = safeParseURLParam(roomsParam, [{ adults: 2, children: 0 }]);
    // Normalize to expected format
    let normalized;
    if (Array.isArray(parsed) && parsed.length) {
      // Check if the first item has 'adults' property (new format)
      if (parsed[0] && typeof parsed[0] === 'object' && 'adults' in parsed[0]) {
        normalized = parsed;
      } 
      // Check if the first item has 'adult_count' property (old format)
      else if (parsed[0] && typeof parsed[0] === 'object' && 'adult_count' in parsed[0]) {
        normalized = parsed.map((d: RoomDetail) => ({
          adults: Number(d.adult_count),
          children: Number(d.child_count)
        }));
      } 
      // Fallback to default format
      else {
        normalized = [{ adults: 2, children: 0 }];
      }
    } else {
      normalized = [{ adults: 2, children: 0 }];
    }
    // Convert to details format
    return encodeURIComponent(JSON.stringify(normalized));
  })();

  // Memoize query string and derived values
  const query = useMemo(() => {
    const queryParams = new URLSearchParams({
      hotelId: hotel.hotelId,
      checkindate: checkInDate,
      checkoutdate: checkOutDate,
      details: details,
      transaction_identifier: transactionIdentifier,
    });
    return queryParams.toString();
  }, [hotel.hotelId, checkInDate, checkOutDate, details, transactionIdentifier]);

  const packageData = hotel.rates?.packages[0];
  const baseAmount = Number(packageData?.base_amount || 0);
  const serviceComponent = Number(packageData?.service_component || 0);
  const gst = Number(packageData?.gst || 0);
  const taxesAndFees = serviceComponent + gst;
  const currency = packageData?.room_rate_currency || packageData?.chargeable_rate_currency || "";
  const currencySymbol = getCurrencySymbol(currency);
  
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
  const rating = Math.round(bestRating);
  
  // Use real hotel images from API response, fallback to static image if not available
  const images = hotel.imageDetails?.images && hotel.imageDetails.images.length > 0 ? hotel.imageDetails.images : [hotel1];
  
  const amenities = useMemo(() => hotel.amenities || [], [hotel.amenities]);

  // Add state for amenities modal
  const [showAllAmenities, setShowAllAmenities] = React.useState(false);

  // Add state for image carousel
  const [mainImageIdx, setMainImageIdx] = React.useState(0);
  const mainImage = images[mainImageIdx];

  return (
    <aside className="py-8 px-6 bg-white/60 backdrop-blur-md rounded-2xl shadow-neu-soft my-8 transition-all">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="relative overflow-hidden bg-gradient-to-br from-stone-200/80 to-stone-100/60 rounded-xl group min-h-[200px] shadow-neu-inset">
          <div className="flex w-full h-full">
            {/* Big image on the left with carousel arrows */}
            <div className="relative rounded-xl overflow-hidden flex-shrink-0" style={{ width: "70%", aspectRatio: "4/3", minHeight: 0 }}>
              {/* Left arrow */}
              {images.length > 1 && mainImageIdx > 0 && (
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow"
                  onClick={e => { e.stopPropagation(); setMainImageIdx(idx => Math.max(0, idx - 1)); }}
                  aria-label="Previous image"
                >
                  <span style={{ fontSize: 24, fontWeight: 'bold' }}>{'<'}</span>
                </button>
              )}
              {/* Right arrow */}
              {images.length > 1 && mainImageIdx < images.length - 1 && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow"
                  onClick={e => { e.stopPropagation(); setMainImageIdx(idx => Math.min(images.length - 1, idx + 1)); }}
                  aria-label="Next image"
                >
                  <span style={{ fontSize: 24, fontWeight: 'bold' }}>{'>'}</span>
                </button>
              )}
              <Link
                href={`/hotels/details?${query}`}
                className="relative w-full h-full block"
                style={{ minHeight: 0 }}
              >
                <Image
                  src={mainImage}
                  alt="Hotel main"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </Link>
            </div>
            {/* 3 small images in a column on the right */}
            <div className="flex flex-col gap-2 ml-2 w-[30%]">
              {images.slice(1, 4).map((img, idx) => {
                const isLast = idx === 2 && images.length > 4;
                return (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden flex-1 cursor-pointer"
                    style={{ minHeight: 0 }}
                    onClick={() => setMainImageIdx(idx + 1)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Show image ${idx + 2}`}
                  >
                    <Image
                      src={img}
                      alt={`Hotel thumbnail ${idx + 2}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {/* Only the last small image gets the overlay if there are more images */}
                    {isLast && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs cursor-pointer">
                        View All
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-col h-full justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-stone-800 leading-tight tracking-tight">
              {hotel.name}
            </h2>
            <p className="flex items-center gap-2 text-gray-500 mb-3 text-sm">
              <TiLocation className="text-lg" />
              <span>{hotel.location?.address}, {hotel.location?.city}</span>
            </p>
            <div>
              {rating > 0 ? (
                <span className="text-yellow-400 text-lg inline-flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar
                      key={i}
                      className={i < rating ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </span>
              ) : (
                <div className="relative group">
                  <span className="text-xs text-gray-500 truncate block max-w-[200px] cursor-help">
                    {hotel.policy || "Standard hotel policies apply"}
                  </span>
                  {/* Hover popup */}
                  <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-[300px] whitespace-normal">
                    {hotel.policy || "Standard hotel policies apply"}
                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              )}
              {bestReviewCount > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  ({bestReviewCount} reviews)
                </span>
              )}

            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {amenities.slice(0, 5).map((amenity, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-fuchsia-100/60 text-fuchsia-800 rounded-full text-xs font-medium shadow-neu-inset"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 5 && (
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-200/60 text-gray-700 rounded-full text-xs font-medium shadow-neu-inset"
                  onClick={() => setShowAllAmenities(true)}
                >
                  +{amenities.length - 5} more
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center border-t border-stone-200/60 pt-5 mt-4 gap-4">
            <div className="flex flex-col items-start">
              <span className="text-3xl font-extrabold text-stone-800">
                {currencySymbol}{Math.round(Number(baseAmount)).toLocaleString()}
              </span>
              <div className="text-xs text-gray-500 space-y-1">
                {taxesAndFees > 0 && (
                  <div>
                    + {currencySymbol}{Math.round(Number(taxesAndFees)).toLocaleString()} taxes & fees
                  </div>
                )}
                <div>Per Night</div>
              </div>
            </div>
            {baseAmount === 0 && (
              <span className="text-xs text-gray-500">
                No availability
              </span>
            )}
            {baseAmount > 0 && (
              <Link
                href={`/hotels/details?${query}`}
                className="bg-gradient-to-br from-blue-500/80 to-fuchsia-600/80 hover:from-fuchsia-600 hover:to-blue-500 active:scale-95 text-white py-2 px-8 rounded-lg shadow-neu-soft font-semibold text-base transition-all ease-in-out duration-200 backdrop-blur-md"
              >
                Book Now
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* Modal for all amenities */}
      {showAllAmenities && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-xs w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowAllAmenities(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-3">All Amenities</h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {amenities.map((amenity, i) => (
                <li
                  key={i}
                  className="px-3 py-1 bg-fuchsia-100/60 text-fuchsia-800 rounded-full text-xs font-medium shadow-neu-inset inline-block"
                >
                  {amenity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </aside>
  );
});
HotelTab.displayName = "HotelTab";

export default HotelTab;