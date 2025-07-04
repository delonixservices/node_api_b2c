import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { TiLocation } from "react-icons/ti";
import { HiMiniClock } from "react-icons/hi2";
import Image from "next/image";

interface Hotel {
  hotelId: string | number;
  id: string | number;
  name: string;
  starRating: number;
  location: {
    address: string;
    city: string;
    country: string;
  };
  moreDetails: {
    checkInTime: string;
    checkOutTime: string;
  };
  moreRatings?: {
    tripAdvisor?: { rating: number; reviewCount: number };
    trustYou?: { rating: number; reviewCount: number };
  };
  imageDetails?: {
    images: string[];
  };
}

interface Room {
  name: string;
  price: number;
  capacity: string;
  size: string;
  beds: string;
  amenities: string[];
  cancellation: string;
  availability: number;
  bookingKey: string;
}

interface HotelDetailsProps {
  hotel: Hotel;
  checkInDate: string;
  checkOutDate: string;
  roomCount: number;
  adultCount: number;
  childCount: number;
  room?: Room;
  nights: number;
}

const HotelDetails = React.memo(({ hotel, checkInDate, checkOutDate, roomCount, adultCount, childCount, room, nights }: HotelDetailsProps) => {
  // Get real ratings from moreRatings
  const tripAdvisorRating = hotel.moreRatings?.tripAdvisor?.rating || 0;
  const trustYouRating = hotel.moreRatings?.trustYou?.rating || 0;
  
  // Use the best available rating (prefer TripAdvisor, fallback to TrustYou, then starRating)
  const bestRating = tripAdvisorRating > 0 ? tripAdvisorRating : 
                    trustYouRating > 0 ? trustYouRating : 
                    hotel.starRating || 0;
  const displayRating = Math.round(bestRating);

  // Image carousel logic
  const images = hotel.imageDetails?.images || [];
  const [current, setCurrent] = useState(0);
  const hasImages = images.length > 0;

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  const selectImage = (idx: number) => setCurrent(idx);

  return (
    <div className="flex flex-col md:flex-row mb-4 bg-white/60 backdrop-blur-md rounded-2xl shadow-neu-soft p-6">
      <div className="w-full md:w-5/12 bg-gradient-to-br from-stone-200/80 to-stone-100/60 rounded-xl flex flex-col items-center justify-center shadow-neu-inset relative">
        {hasImages ? (
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full h-48 flex items-center justify-center">
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white z-10"
                aria-label="Previous image"
                type="button"
              >
                &#8592;
              </button>
              <Image
                src={images[current]}
                alt={`Hotel image ${current + 1}`}
                className="object-cover rounded-xl w-full h-48 border"
                style={{ maxHeight: "12rem" }}
                width={400}
                height={192}
                unoptimized
              />
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white z-10"
                aria-label="Next image"
                type="button"
              >
                &#8594;
              </button>
            </div>
            <div className="flex gap-2 mt-2 overflow-x-auto max-w-full">
              {images.map((img, idx) => (
                <Image
                  key={img}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`w-12 h-12 object-cover rounded border cursor-pointer ${current === idx ? "ring-2 ring-blue-500" : "opacity-70"}`}
                  onClick={() => selectImage(idx)}
                  style={{ minWidth: 48, minHeight: 48 }}
                  width={48}
                  height={48}
                  unoptimized
                />
              ))}
            </div>
          </div>
        ) : (
          <span className="text-stone-400 text-3xl">🏨</span>
        )}
      </div>
      <div className="w-full md:w-7/12 md:pl-8 mt-3 md:mt-0 flex flex-col justify-center">
        <h3 className="text-2xl font-bold text-stone-800 mb-1 tracking-tight">{hotel.name}</h3>
        {room?.beds && (
          <p className="text-base text-stone-700 font-medium mb-1">
            <b>Beds:</b> {room.beds}
          </p>
        )}
        <div className="flex items-center gap-1 text-base mb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={displayRating >= star ? "text-yellow-400" : "text-gray-300"}
            />
          ))}
        </div>
        <p className="text-base font-medium flex items-center gap-1 text-slate-500 mt-1">
          <TiLocation />
          {hotel.location.address} | {hotel.location.city}, {hotel.location.country}
        </p>
        <div className="grid grid-cols-2 gap-4 bg-white/40 backdrop-blur rounded-xl my-3 p-4 shadow-neu-inset">
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
        <p className="mt-3 text-base text-center text-stone-600 font-medium">
          {nights} Night{nights > 1 ? 's' : ''} | {roomCount} Room{roomCount > 1 ? 's' : ''}, {adultCount} Adult{adultCount > 1 ? 's' : ''}, {childCount} Child{childCount !== 1 ? 'ren' : ''}
        </p>
      </div>
    </div>
  );
});
HotelDetails.displayName = "HotelDetails";
export default HotelDetails; 