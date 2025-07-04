"use client";

import { useState, useEffect, useMemo, useCallback, Suspense} from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FaUsers, FaHotel } from "react-icons/fa";
import axios from "axios";
import React from "react";
import dynamic from "next/dynamic";
import HotelDetails from "../../../components/booking/HotelDetails";
import PriceBreakdown from "../../../components/booking/PriceBreakdown";
import HotelPolicy from "../../../components/booking/HotelPolicy";
import TermsCheckbox from "../../../components/booking/TermsCheckbox";
import GuestDetailsForm from "../../../components/booking/GuestDetailsForm";
import ContactDetailsForm from "../../../components/booking/ContactDetailsForm";
import LoginPopup from "../../../components/LoginPopup";
import { safeParseURLParam, bookingSessionStorage, validateAndCleanURLParam } from "@/utils/urlUtils";
import { validateCouponFormat, clearErrorAfterDelay } from "@/utils/errorUtils";
const GstPanel = dynamic(() => import("../../../components/booking/GstPanel"), { ssr: false });

// TypeScript Interfaces
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
  imageDetails?: {
    images: string[];
  };
  rates?: {
    packages: {
      base_amount: number;
      service_component: number;
      processing_fee: number;
      gst: number;
      chargeable_rate: number;
      client_commission_currency: string;
    }[];
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

interface Policy {
  id: string;
  package: {
    base_amount: number;
    service_component: number;
    processing_fee: number;
    gst: number;
    chargeable_rate: number;
    client_commission_currency: string;
  };
  cancellation_policy: {
    remarks: string;
    cancellation_policies: Array<{
      date_from: string;
      date_to: string;
      penalty_percentage: number;
    }>;
  };
  hotel_fees: Record<string, { currency: string; value: number }>;
}

interface BookingData {
  hotel: Hotel;
  room: Room;
  policy: Policy;
  checkInDate: string;
  checkOutDate: string;
  transaction_id: string;
  room_count?: number;
  adult_count?: number;
  child_count?: number;
}

interface Guest {
  firstname: string;
  lastname: string;
  mobile: string;
}

interface RoomGuest {
  room_guest: Guest[];
}

interface ContactDetail {
  name: string;
  last_name: string;
  mobile: string;
  email: string;
}

interface CouponCode {
  value: number;
  type: string;
  name: string;
}

interface GstDetail {
  gstnumber: string;
  name: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  mobile: string;
}

function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess] = useState(false);
  const [contactDetail, setContactDetail] = useState<ContactDetail>({
    name: "",
    last_name: "",
    mobile: "",
    email: "",
  });
  const [guest, setGuest] = useState<RoomGuest[]>([
    {
      room_guest: [{ firstname: "", lastname: "", mobile: "" }],
    },
  ]);
  const [userAgree, setUserAgree] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showGstPanel, setShowGstPanel] = useState(false);
  const [couponCode, setCouponCode] = useState<CouponCode>({ value: 0, type: "", name: "" });
  const [gstDetail, setGstDetail] = useState<GstDetail>({
    gstnumber: "",
    name: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    mobile: "",
  });
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const handleGstChange = useCallback((data: Partial<GstDetail>) => setGstDetail(prev => ({ ...prev, ...data })), []);
  const handleGstClose = useCallback(() => setShowGstPanel(false), []);

  const handleLoginSuccess = useCallback((userData: { name?: string }) => {
    setUser({ name: userData.name || 'Profile' });
    setShowLoginPopup(false);
  }, []);

  // Fix useMemo 'any' usage for room_count with a type guard
  const { room_count, adult_count, child_count } = useMemo(() => {
    if (!bookingData) {
      return { room_count: 1, adult_count: 1, child_count: 0 };
    }
    return {
      room_count: bookingData.room_count ?? 1,
      adult_count: bookingData.adult_count ?? 1,
      child_count: bookingData.child_count ?? 0
    };
  }, [bookingData]);

  // Calculate number of nights between checkInDate and checkOutDate
  const nights = useMemo(() => {
    const checkInDate = bookingData?.checkInDate;
    const checkOutDate = bookingData?.checkOutDate;
    if (!checkInDate || !checkOutDate) return 1;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [bookingData?.checkInDate, bookingData?.checkOutDate]);

  useEffect(() => {
    const hotelParam = searchParams.get('hotel');
    console.log('Raw hotel param:', hotelParam);
    console.log('Hotel param length:', hotelParam?.length);
    console.log('Hotel param first 100 chars:', hotelParam?.substring(0, 100));
    
    // Function to load data from localStorage
    const loadFromLocalStorage = () => {
      try {
        const storedData = localStorage.getItem('booking_details');
        console.log('Stored booking details:', storedData);
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('Parsed localStorage data:', parsedData);
          
          if (parsedData.hotel && parsedData.hotel.name) {
            setBookingData(parsedData);
            console.log('Booking Data from localStorage:', parsedData);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("Error with localStorage data:", error);
        return false;
      }
    };

    // Function to load data from session storage
    const loadFromSessionStorage = () => {
      try {
        const sessionData = bookingSessionStorage.getBookingData();
        console.log('Session storage booking details:', sessionData);
        
        if (sessionData && sessionData.hotel && sessionData.hotel.name) {
          setBookingData(sessionData);
          console.log('Booking Data from session storage:', sessionData);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error with session storage data:", error);
        return false;
      }
    };

    // Function to set error and loading state
    const handleError = (message: string) => {
      setApiError(message);
      setLoading(false);
    };
    
    if (hotelParam) {
      try {
        // Validate and clean the parameter first
        const validatedParam = validateAndCleanURLParam(hotelParam);
        if (!validatedParam) {
          console.warn("Hotel parameter validation failed, trying fallback sources");
          if (loadFromLocalStorage()) {
            setLoading(false);
            return;
          } else if (loadFromSessionStorage()) {
            setLoading(false);
            return;
          } else {
            handleError("Invalid booking data. Please start your search again.");
            return;
          }
        }

        // Check if the parameter looks valid before trying to parse
        if (validatedParam.length > 10000) {
          console.warn('Hotel parameter is very long, might cause issues:', validatedParam.length);
          // Try to load from storage instead of parsing the URL
          if (loadFromLocalStorage()) {
            setLoading(false);
            return;
          } else if (loadFromSessionStorage()) {
            setLoading(false);
            return;
          }
        }
        
        // Validate the parameter format before parsing
        if (!validatedParam.trim() || validatedParam.length < 10) {
          throw new Error("Invalid hotel parameter: too short or empty");
        }
        
        // Provide a proper fallback value instead of null
        const data = safeParseURLParam<BookingData | null>(validatedParam, null);
        console.log('Parsed hotel data:', data);
        
        if (!data || !data.hotel || !data.hotel.name) {
          throw new Error("Invalid hotel data: missing name");
        }
        setBookingData(data);
        console.log('Booking Data after parsing:', data);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing hotel data from URL:", error);
        console.error("Error details:", {
          error: error instanceof Error ? error.message : error,
          hotelParamLength: hotelParam.length,
          hotelParamStart: hotelParam.substring(0, 200)
        });
        
        // Try to get data from localStorage as fallback
        if (loadFromLocalStorage()) {
          setLoading(false);
        } else if (loadFromSessionStorage()) {
          setLoading(false);
        } else {
          handleError("Invalid booking data. Please start your search again.");
        }
      }
    } else {
      console.log('No hotel param in URL, checking localStorage...');
      // Try to get data from localStorage if no URL parameter
      if (loadFromLocalStorage()) {
        setLoading(false);
      } else if (loadFromSessionStorage()) {
        setLoading(false);
      } else {
        handleError("No booking data found. Please start your search again.");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser({ name: parsed?.name || 'Profile' });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUser(null);
      } else {
        console.error("Unexpected error:", err);
        setUser(null);
      }
    }
  }, []);

  const hotelPreBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!userAgree) {
      setApiError("Please agree to terms and conditions.");
      return;
    }

    const { name, last_name, mobile, email } = contactDetail;
    if (!name || !last_name || !mobile || !email) {
      setApiError("Please fill all contact details.");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setApiError("Please enter a valid 10-digit mobile number.");
      return;
    }

    for (const room of guest) {
      for (const guestDetail of room.room_guest) {
        if (!guestDetail.firstname || !guestDetail.lastname || !guestDetail.mobile) {
          setApiError("Please fill all guest details.");
          return;
        }
        if (!/^\d{10}$/.test(guestDetail.mobile)) {
          setApiError("Please enter valid 10-digit mobile numbers for all guests.");
          return;
        }
      }
    }

    if (!bookingData) {
      setApiError("Booking data is missing. Please start your search again.");
      return;
    }

    const transaction_id = bookingData.transaction_id || localStorage.getItem('transaction_identifier') || '';
    const booking_policy_id = localStorage.getItem('booking_policy_id') || '';

    const payload = {
      booking_policy_id: booking_policy_id,
      transaction_id: transaction_id,
      contactDetail: {
        name: name,
        last_name: last_name,
        mobile: mobile,
        email: email
      },
      search: {
        check_in_date: bookingData.checkInDate,
        check_out_date: bookingData.checkOutDate,
        adult_count: adult_count,
        child_count: child_count,
        room_count: room_count,
        currency: "INR",
        locale: "en-US",
        hotel_id_list: [bookingData.hotel.id || bookingData.hotel.hotelId],
        source_market: "IN"
      },
      coupon: couponCode.name ? {
        name: couponCode.name,
        value: couponCode.value,
        type: couponCode.type
      } : {
        name: "",
        value: 0,
        type: ""
      },
      guest: guest.map(room => ({
        room_guest: room.room_guest.map(guestDetail => ({
          firstname: guestDetail.firstname,
          lastname: guestDetail.lastname,
          mobile: guestDetail.mobile,
          nationality: "IN"
        }))
      })),
    };

    try {
      setIsSubmitting(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/hotels/prebook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      const bookingId = result?.data?.booking_id;
      const url = `${process.env.NEXT_PUBLIC_API_PATH}/hotels/process-payment/${bookingId}`;
      router.push(url)
      console.log("Redirecting to voucher with bookingId:", bookingId);


      if (!response.ok) {
        console.error('Booking error:', result);
        setApiError(result.message || "Failed to book hotel. Please try again.");
        return;
      }

    } catch (error) {
      console.error("Error during booking:", error);
      setApiError("An error occurred during booking. Please try again.");
    } finally {

    }
  };

  const handleApplyCoupon = async (code: string) => {
    // First validate the coupon format
    const validation = validateCouponFormat(code);
    if (!validation.isValid) {
      setApiError("Wrong promo code");
      clearErrorAfterDelay(setApiError, 3000);
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_PATH}/couponCheck`, { code });
      if (response.data && response.data.code) {
        const receivedCoupon = response.data.code;
        setCouponCode(receivedCoupon);
        setApiError("");
      } else {
        setApiError("Wrong promo code");
        clearErrorAfterDelay(setApiError, 3000);
      }
    } catch {
      handleRemoveCoupon();
      setApiError("Wrong promo code");
      clearErrorAfterDelay(setApiError, 5000);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode({ value: 0, type: "", name: "" });
  };

  const gstSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !gstDetail.gstnumber ||
      !gstDetail.name ||
      !gstDetail.email ||
      !gstDetail.mobile ||
      !gstDetail.city ||
      !gstDetail.pincode ||
      !gstDetail.address ||
      !gstDetail.state
    ) {
      setApiError("Required fields are empty");
      return;
    }
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_PATH}/gst-details`, gstDetail);
      if (response.data) {
        setGstDetail(response.data);
        setShowGstPanel(false);
        setApiError("");
        alert("Your GST Details Successfully Updated.");
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message) {
        setApiError(error.message);
      }
    }
  };

  // Memoize handlers to avoid unnecessary re-renders
  const handleContactChange = useCallback((data: Partial<ContactDetail>) => {
    setContactDetail(prev => ({ ...prev, ...data }));
  }, []);

  const handleGuestChange = useCallback((newGuest: RoomGuest[]) => {
    setGuest(newGuest);
  }, []);

  const checkUserAgree = useCallback(() => {
    setUserAgree(prev => !prev);
  }, []);

  // Memoize base amounts to avoid recalculation
  const baseAmount = useMemo(() => bookingData?.policy.package.base_amount || 0, [bookingData?.policy.package.base_amount]);
  const serviceCharge = useMemo(() => bookingData?.policy.package.service_component || 0, [bookingData?.policy.package.service_component]);
  const gst = useMemo(() => bookingData?.policy.package.gst || 0, [bookingData?.policy.package.gst]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!bookingData || !bookingData.hotel) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Booking data not found</h2>
          <p className="mb-4">{apiError || `1 Night | ${room_count} Room${room_count > 1 ? 's' : ''}, ${adult_count} Adult${adult_count > 1 ? 's' : ''}, ${child_count} Child${child_count !== 1 ? 'ren' : ''}`}</p>
          
          {/* Debug section */}
          <div className="mb-4 p-4 bg-gray-100 rounded text-left text-sm">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <p>URL Hotel Param: {searchParams.get('hotel') ? 'Present' : 'Missing'}</p>
            <p>LocalStorage booking_details: {localStorage.getItem('booking_details') ? 'Present' : 'Missing'}</p>
            <button 
              onClick={() => {
                const sampleData = {
                  hotel: {
                    hotelId: "test123",
                    id: "test123",
                    name: "Test Hotel",
                    starRating: 4,
                    location: {
                      address: "123 Test Street",
                      city: "Test City",
                      country: "India"
                    },
                    moreDetails: {
                      checkInTime: "14:00",
                      checkOutTime: "12:00"
                    }
                  },
                  room: {
                    name: "Standard Room",
                    price: 5000,
                    capacity: "2 Adults",
                    size: "28m²",
                    beds: "1 Double Bed",
                    amenities: ["Free WiFi", "Air Conditioning"],
                    cancellation: "Free cancellation",
                    availability: 3,
                    bookingKey: "test-key"
                  },
                  policy: {
                    id: "test-policy",
                    package: {
                      base_amount: 5000,
                      service_component: 500,
                      processing_fee: 100,
                      gst: 900,
                      chargeable_rate: 6500,
                      client_commission_currency: "INR"
                    },
                    cancellation_policy: {
                      remarks: "Free cancellation until 24 hours before check-in",
                      cancellation_policies: []
                    },
                    hotel_fees: {}
                  },
                  checkInDate: "2024-12-25",
                  checkOutDate: "2024-12-26",
                  transaction_id: "test-transaction",
                  room_count: 1,
                  adult_count: 2,
                  child_count: 0
                };
                setBookingData(sampleData);
                setApiError("");
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mb-2"
            >
              Load Test Data
            </button>
          </div>
          
          <Link
            href="/hotels"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Search Hotels
          </Link>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">For testing the complete flow:</p>
            <Link
              href="/hotels/search?perPage=15&checkindate=2024-12-25&checkoutdate=2024-12-26&area=%7B%22id%22%3A%22delhi%22%2C%22name%22%3A%22Delhi%22%2C%22type%22%3A%22city%22%7D&details=%5B%7B%22room%22%3A%221%22%2C%22adult_count%22%3A%222%22%2C%22child_count%22%3A%220%22%7D%5D"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Test Hotel Search (Delhi, Dec 25-26)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { hotel, policy, checkInDate, checkOutDate } = bookingData;

  if (loading) {
    return <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-r-transparent">Loading...</div>;
  }

  return (
    <section className="container py-8 mx-auto px-2 md:px-8 bg-gradient-to-br from-white/80 to-stone-100/60 min-h-screen">

      <h2 className="text-3xl font-bold mb-4 flex items-center gap-2 text-stone-800 tracking-tight">
        <FaHotel /> Review Your Booking
      </h2>

      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {apiError}
        </div>
      )}

      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Booking successful! Redirecting to confirmation page...
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-3">
          <HotelDetails hotel={hotel} checkInDate={checkInDate} checkOutDate={checkOutDate} roomCount={room_count} adultCount={adult_count} childCount={child_count} room={bookingData.room} nights={nights} />
          <div className="mt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-200/60 pb-2 mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2 text-stone-600">
                <FaUsers /> Enter Guest Details
              </h2>
              {!user && (
                <p className="text-gray-600 text-base font-medium mt-2 md:mt-0 md:ml-4">
                  <span
                    className="text-blue-600 hover:text-blue-700 cursor-pointer"
                    onClick={() => setShowLoginPopup(true)}
                  >
                    Log in
                  </span> to book faster
                </p>
              )}
              {user && (
                <p className="text-gray-600 text-base font-medium mt-2 md:mt-0 md:ml-4">
                  Welcome, <span className="text-blue-600 font-semibold">{user.name}</span>
                  <span
                    className="text-red-600 hover:text-red-700 cursor-pointer ml-2 text-sm"
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('refreshToken');
                      localStorage.removeItem('user');
                      setUser(null);
                    }}
                  >
                    (Logout)
                  </span>
                </p>
              )}
            </div>

            <form onSubmit={hotelPreBook}>
              <div>
                <div className="mb-4">
                  <h5 className="text-lg font-semibold">
                    Guest&apos;s Information
                  </h5>
                </div>

                <ContactDetailsForm
                  contactDetail={contactDetail}
                  onContactChange={handleContactChange}
                  validation={apiError}
                />

                <hr className="my-4" />

                <h5 className="text-lg font-semibold">Member Details</h5>
                <GuestDetailsForm guest={guest} onGuestChange={handleGuestChange} />

                <HotelPolicy policy={policy} />

                <TermsCheckbox checked={userAgree} onChange={checkUserAgree} />

                <button
                  type="submit"
                  disabled={!userAgree || isSubmitting || showSuccess}
                  className={`w-full py-2 px-4 rounded-md text-white ${userAgree && !showSuccess
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                    } ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  {isSubmitting ? "Processing..." : showSuccess ? "Booking Confirmed!" : "Book Hotel"}
                </button>
              </div>
            </form>
          </div>
        </aside>

        <aside className="md:col-span-1">
          <PriceBreakdown
            baseAmount={baseAmount}
            serviceCharge={serviceCharge}
            gst={gst}
            couponCode={couponCode}
            onAddGst={() => setShowGstPanel(true)}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            couponError={apiError}
          />
        </aside>
      </section>

      {showGstPanel && (
        <GstPanel
          gstDetail={gstDetail}
          onGstChange={handleGstChange}
          onClose={handleGstClose}
          onSubmit={gstSubmit}
        />
      )}

      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </section>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  );
}