"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import React from "react";
import HotelOverview from "@/components/hotelDetails/HotelOverview";
import RoomCard from "@/components/hotelDetails/RoomCard";
import ReviewSection from "@/components/hotelDetails/ReviewSection";
import AmenitiesSection from "@/components/hotelDetails/AmenitiesSection";
import LocationSection from "@/components/hotelDetails/LocationSection";
import { showToast } from "@/components/notify";
import { safeParseURLParam, safeCreateURLParam, bookingSessionStorage } from "../../../utils/urlUtils";
import hotel1 from "../../../assets/hotel1.jpg";

// Types
export interface Room {
  name: string;
  price: number;
  capacity: string;
  size: string;
  beds: string;
  amenities: string[];
  cancellation: string;
  availability: number;
  bookingKey: string;
  gst?: number;
  serviceComponent?: number;
}

export interface Hotel {
  originalName: string;
  name: string;
  starRating: number;
  location: {
    address: string;
    city: string;
    country: string;
    latLng: { lat: number; lng: number };
  };
  rates: {
    packages: {
      base_amount: number;
      booking_key: string;
      room_details: {
        description: string;
        beds: { queen?: number; king?: number; twin?: number };
        supplier_description?: string;
        non_refundable: boolean;
      };
      gst?: number;
      service_component?: number;
    }[];
  };
  amenities: string[];
  imageDetails?: {
    images: string[];
    prefix?: string;
    count?: number;
    suffix?: string;
  };
  moreDetails: { checkInTime: string; checkOutTime: string };
  moreRatings: {
    tripAdvisor?: { rating: number; reviewCount: number };
    trustYou?: { rating: number; reviewCount: number };
  };
  hotelId: string;
  id: string;
  images?: string[];
  dailyRates?: {
    lowest: number;
  };
  filterSource?: string; // Track which filter found this hotel
}

// Main Client Component
export default function HotelDetailsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const [roomDetail, setRoomDetail] = useState([{ adults: 1, children: 0 }]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Extract search params values
  const checkIn = searchParams.get("checkindate");
  const checkOut = searchParams.get("checkoutdate");
  const roomsParam = searchParams.get("details");
  const hotelId = searchParams.get("hotelId");
  const transaction_identifier = searchParams.get("transaction_identifier") || "";

  // Section refs for smooth scrolling
  const photosRef = useRef<HTMLDivElement>(null);
  const roomsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const amenitiesRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleScrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Parse search parameters
  useEffect(() => {
    try {
      if (!checkIn || !checkOut || !hotelId) {
        setError("Missing required search parameters. Please provide check-in date, check-out date, and hotel ID.");
        setLoading(false);
        return;
      }
      setCheckInDate(prev => {
        if (prev !== checkIn) {  return checkIn!; } else { return prev; }
      });
      setCheckOutDate(prev => {
        if (prev !== checkOut) {  return checkOut!; } else { return prev; }
      });
      try {
        const parsed = safeParseURLParam(roomsParam, [{ adults: 2, children: 0 }]);
        // Normalize to expected format
        let normalized;
        if (Array.isArray(parsed) && parsed.length && parsed[0].adults !== undefined) {
          normalized = parsed;
        } else if (Array.isArray(parsed) && parsed.length && (parsed[0] as { adult_count?: unknown }).adult_count !== undefined) {
          normalized = (parsed as unknown as Array<{ adult_count?: unknown; child_count?: unknown }>).map((d) => ({
            adults: Number(d.adult_count),
            children: Number(d.child_count)
          }));
        } else {
          normalized = [{ adults: 2, children: 0 }];
        }
        setRoomDetail(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(normalized)) {  return normalized; } else { return prev; }
        });
      } catch (parseError: unknown) {
        if (parseError instanceof Error) {
          setError(parseError.message);
        } else {
          setError("Invalid rooms parameter format.");
        }
        setLoading(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid search parameters.");
      }
      setLoading(false);
    }
  }, [checkIn, checkOut, roomsParam, hotelId]);

  // Fetch hotel data
  const isMounted = useRef(true);
  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);

  const fetchHotelData = useCallback(async () => {
    // Guard clause to ensure all parameters are available
    if (!hotelId || !checkInDate || !checkOutDate) {
      console.error("Missing required parameters for fetch:", {
        hotelId,
        checkInDate,
        checkOutDate,
      });
      setError("Missing required parameters for fetching hotel data.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_PATH}/hotels/packages`,
        {
          checkindate: checkInDate,
          checkoutdate: checkOutDate,
          hotelId: hotelId,
          details: roomDetail.map((room, index) => ({
            room: (index + 1).toString(),
            adult_count: room.adults.toString(),
            child_count: room.children?.toString() || "0",
          })),
          transaction_identifier: transaction_identifier,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (isMounted.current) setHotel(response.data.data.hotel);
    } catch (error) {
      console.error("Error fetching hotel data:", error);
      if (isMounted.current) setError("Error fetching hotel data. Please try again.");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [checkInDate, checkOutDate, hotelId, transaction_identifier, roomDetail]);

  // Trigger fetch only when parameters are ready
  useEffect(() => {
    if (checkInDate && checkOutDate && hotelId && roomDetail && !error) {
      fetchHotelData();
    }
  }, [fetchHotelData, checkInDate, checkOutDate, hotelId, roomDetail, error]);

  // Book room
  const bookNow = useCallback(
    async (room: Room) => {
      if (!hotel) {
        showToast("error", "Hotel data not available. Please try again.");
        return;
      }

      try {
        const transaction_identifier =
          searchParams.get("transaction_identifier") || "";
        // Calculate total child_count and adult_count from roomDetail
        const child_count = roomDetail.reduce((sum, room) => sum + (room.children || 0), 0);
        const room_count = roomDetail.length;
        const adult_count = roomDetail.reduce((sum, room) => sum + (room.adults || 0), 0);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_PATH}/hotels/bookingpolicy`,
          {
            hotelId: hotel.hotelId,
            bookingKey: room.bookingKey,
            search: {
              check_out_date: checkOutDate,
              child_count: child_count,
              room_count: room_count,
              source_market: "IN",
              currency: "INR",
              locale: "en-US",
              hotel_id_list: [hotel.id],
              adult_count: adult_count,
              check_in_date: checkInDate,
            },
            transaction_id: transaction_identifier,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const policyData = response.data;

        // Store booking policy ID in localStorage
        localStorage.setItem(
          "booking_policy_id",
          policyData.data.booking_policy_id
        );
        localStorage.setItem("transaction_identifier", transaction_identifier);

        // Create a simplified hotel object for BookingPage
        const simplifiedHotel = {
          hotelId: hotel.hotelId,
          id: hotel.id,
          name: hotel.name,
          starRating: hotel.starRating,
          location: {
            address: hotel.location.address,
            city: hotel.location.city,
            country: hotel.location.country,
          },
          moreDetails: {
            checkInTime: hotel.moreDetails.checkInTime,
            checkOutTime: hotel.moreDetails.checkOutTime,
          },
        };

        // Store booking details in localStorage for the booking page
        localStorage.setItem(
          "booking_details",
          JSON.stringify({
            hotel: simplifiedHotel,
            room,
            policy: policyData.data,
            checkInDate,
            checkOutDate,
            transaction_id: transaction_identifier,
          })
        );

        console.log("bookingData", {
          hotel: simplifiedHotel,
          room,
          policy: policyData.data,
          checkInDate,
          checkOutDate,
          transaction_id: transaction_identifier,
        });

        console.log("HotelDetails props", hotel, checkInDate, checkOutDate, room_count, adult_count, child_count, policyData.data.room);

        // Create booking data object
        const bookingData = {
          hotel: simplifiedHotel,
          room,
          policy: policyData.data,
          checkInDate,
          checkOutDate,
          transaction_id: transaction_identifier,
          room_count,
          adult_count,
          child_count
        };

        // Store in session storage as backup
        bookingSessionStorage.setBookingData(bookingData);

        // Try to create URL parameter safely
        const hotelParam = safeCreateURLParam(bookingData);
        
        if (hotelParam) {
          router.push(`/hotels/booking?hotel=${hotelParam}`);
        } else {
          // Fallback: redirect without URL parameter, data is already in localStorage and sessionStorage
          router.push('/hotels/booking');
        }
      } catch (error) {
        console.error("Error fetching booking policy:", error);
        showToast("error", "Failed to fetch booking policy. Please try again.");
      }
    },
    [hotel, checkInDate, checkOutDate, router, roomDetail, searchParams]
  );

  // Memoize rooms and mainImage
  const rooms = useMemo((): Room[] => {
    if (!hotel?.rates?.packages) return [];
    return hotel.rates.packages.map((pkg) => {
      const beds = [];
      if (pkg.room_details.beds) {
        if (pkg.room_details.beds.queen)
          beds.push(`${pkg.room_details.beds.queen} Queen Bed`);
        if (pkg.room_details.beds.king)
          beds.push(`${pkg.room_details.beds.king} King Bed`);
        if (pkg.room_details.beds.twin)
          beds.push(`${pkg.room_details.beds.twin} Twin Bed`);
      }
      if (beds.length === 0) {
        beds.push(
          pkg.room_details.supplier_description ||
          pkg.room_details.description ||
          "See details"
        );
      }
      // Set capacity to the room description if available, otherwise fallback
      const capacity = pkg.room_details.description || "See details";
      // Add meal options to amenities if present in description (for demo)
      const amenities = ["Free WiFi", "Air Conditioning"];
      if (pkg.room_details.description?.toLowerCase().includes("breakfast")) {
        amenities.push("Breakfast included");
      }
      if (pkg.room_details.description?.toLowerCase().includes("meal")) {
        amenities.push("Meals included");
      }
      return {
        name:
          pkg.room_details.supplier_description ||
          pkg.room_details.description ||
          "Standard Room",
        price: pkg.base_amount,
        capacity: capacity,
        size: "28m²",
        beds: beds.join(", ") || "1 Double Bed",
        amenities: amenities,
        cancellation: pkg.room_details.non_refundable
          ? "Non-refundable"
          : "Free cancellation",
        availability: 3,
        bookingKey: pkg.booking_key,
        gst: pkg.gst,
        serviceComponent: pkg.service_component,
      };
    });
  }, [hotel]);
  const images = useMemo(() => {
    if (hotel?.imageDetails?.images && hotel.imageDetails.images.length > 0) {
      return hotel.imageDetails.images;
    }
    return [hotel1];
  }, [hotel]);

  // Meal filter state
  const [mealFilter, setMealFilter] = useState<string>("All");
  const mealOptions = ["All", "Breakfast included", "Meals included"];

  // Filtered rooms based on meal option
  const filteredRooms = useMemo(() => {
    if (mealFilter === "All") return rooms;
    return rooms.filter(room => room.amenities.includes(mealFilter));
  }, [rooms, mealFilter]);

  // Handlers for image navigation
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-r-transparent"></div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="flex justify-center items-center h-screen">
        {error || "Hotel not found"}
      </div>
    );
  }
  console.log(hotel.rates.packages)

  return (
    <React.Fragment>
      <div className="bg-gray-50">
        <nav className="container px-4 mx-auto my-4 z-20 pb-8 ">
          <div className="flex items-center justify-center space-x-4 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 rounded-2xl shadow-xl p-4">
            {[
              { label: "Photos", ref: photosRef },
              { label: "Rooms", ref: roomsRef },
              { label: "Reviews", ref: reviewsRef },
              { label: "Amenities", ref: amenitiesRef },
              { label: "Map", ref: mapRef },
            ].map(({ label, ref }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleScrollTo(ref)}
                className="relative py-2 px-6 text-base font-medium text-white tracking-wide uppercase transition-all duration-400 ease-in-out rounded-lg hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 group"
              >
                {label}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-600 transition-all duration-300 ease-in-out group-hover:w-full group-focus:w-full -translate-x-1/2"></span>
              </button>
            ))}
          </div>
        </nav>

        <div className="container px-4 mx-auto my-2">
          <div className="flex gap-6 text-base text-gray-700">
            <span><strong>Rooms:</strong> {roomDetail.length}</span>
            <span><strong>Adults:</strong> {roomDetail.reduce((sum, r) => sum + (r.adults || 0), 0)}</span>
            <span><strong>Children:</strong> {roomDetail.reduce((sum, r) => sum + (r.children || 0), 0)}</span>
          </div>
        </div>
        <div ref={photosRef} />
        {/* Main image with arrows (no wide carousel) */}
        <HotelOverview
          hotel={hotel}
          mainImage={typeof images[currentImageIndex] === 'string' ? images[currentImageIndex] : (images[currentImageIndex] as { src: string }).src}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          onPrevImage={images.length > 1 ? handlePrevImage : undefined}
          onNextImage={images.length > 1 ? handleNextImage : undefined}
          showArrows={images.length > 1}
        />
        <div ref={roomsRef} />
        {/* Meal filter dropdown */}
        <div className="flex items-center gap-4 py-4 px-4 mt-6 rounded-full pl-10">
          {mealOptions.map(option => (
            <button
              key={option}
              type="button"
              className={`px-4 py-2 rounded-full transition-all duration-200 ease-in-out text-sm font-medium ${mealFilter === option
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              onClick={() => setMealFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <section className="container mx-auto px-4 py-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Available Rooms
          </h2>

          <div className="grid grid-cols-1 gap-4 px-4 py-4">
            {filteredRooms.map((room_count, index) => (
              <RoomCard
                key={index}
                room={room_count}
                mainImage={images[currentImageIndex]}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                onBook={bookNow}
              />
            ))}
          </div>
        </section>
        <div ref={reviewsRef} />
        <div className="my-10">
          <ReviewSection />
        </div>
        <div ref={amenitiesRef} />
        <div className="my-10">
          <AmenitiesSection amenities={hotel.amenities} />
        </div>
        <div ref={mapRef} />
        <div className="my-10">
          <LocationSection location={hotel.location} />
        </div>
      </div>
    </React.Fragment>
  );
} 