// room card 
import React from "react";
import Image, { StaticImageData } from "next/image";
import type { Room } from "@/app/hotels/details/HotelDetailsClient";

const RoomCard: React.FC<{
  room: Room;
  mainImage: string | StaticImageData;
  checkInDate: string;
  checkOutDate: string;
  onBook: (room: Room) => void;
}> = React.memo(({ room, mainImage, onBook }) => (
  <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-1/4">
        <div className="h-48 bg-gray-200 rounded-md flex items-center justify-center">
          {typeof mainImage === "string" ? (
            <Image
              src={mainImage}
              alt={room.name}
              className="w-full h-full object-cover rounded-md"
              width={200}
              height={150}
              unoptimized
            />
          ) : (
            <Image
              src={mainImage}
              alt={room.name}
              className="w-full h-full object-cover rounded-md"
              width={200}
              height={150}
              unoptimized
            />
          )}
        </div>
      </div>
      <div className="w-full md:w-2/4">
        <h3 className="text-lg font-medium text-gray-800">{room.capacity}</h3>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-medium">Capacity:</span> {room.capacity}
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Size:</span> {room.size}
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Beds:</span> {room.beds}
          </div>
        </div>
        <div className="mt-3">
          <div className="flex flex-wrap gap-2 mb-2">
            {room.amenities.map((amenity: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
              >
                {amenity}
              </span>
            ))}
          </div>
          <p
            className={`text-sm ${
              room.cancellation === "Non-refundable"
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {room.cancellation}
          </p>
        </div>
      </div>
      <div className="w-full md:w-1/4 flex flex-col justify-between">
        <div className="text-right">
          <div className="text-xl text-fuchsia-600 font-semibold">
            INR {Math.round(room.price).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">
            {((room.gst || 0) + (room.serviceComponent || 0)) > 0 && (
              <span>+ INR {Math.round((room.gst || 0) + (room.serviceComponent || 0)).toLocaleString()} Taxes & Fees per night</span>
            )}
          </div>
        </div>
        <button
          onClick={() => onBook(room)}
          className="mt-4 w-full py-2 bg-gradient-to-br from-blue-500 to-fuchsia-600 hover:from-blue-600 hover:to-fuchsia-700 active:scale-95 text-white font-medium rounded-lg transition-all ease-in-out duration-200"
        >
          SELECT ROOM
        </button>
      </div>
    </div>
  </div>
));
RoomCard.displayName = "RoomCard";
export default RoomCard; 