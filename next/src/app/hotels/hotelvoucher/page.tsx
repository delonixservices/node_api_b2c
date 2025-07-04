"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import axios from 'axios';
import Image from 'next/image';

interface Hotel {
  name: string;
  location: { address: string; city: string; country: string };
  moreDetails?: { checkInTime?: string; checkOutTime?: string };
  images?: string[];
  imageDetails?: {
    images?: string[];
  };
}
interface ContactDetail {
  name: string;
  last_name?: string;
  mobile: string;
  email: string;
}
interface Pricing {
  total_chargeable_amount: number;
  currency: string;
}
interface HotelPackage {
  room_type?: string;
  room_details?: {
    description?: string;
    beds?: Record<string, number>;
  };
  // add more fields as needed
}
interface Transaction {
  _id: string;
  hotel: Hotel;
  contactDetail: ContactDetail;
  // Support snake_case from API
  contact_details?: ContactDetail;
  search: {
    check_in_date: string;
    check_out_date: string;
    adult_count?: number;
    child_count?: number;
    room_count?: number;
  };
  hotelPackage?: HotelPackage;
  hotel_package?: HotelPackage;
  pricing: Pricing;
  payment_response?: { method?: string; status?: string; date?: string };
  book_response?: { data?: { booking_id?: string; confirmed_at?: string } };
  created_at?: string;
  bookingId?: string;
}

const HotelVoucherInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Fetch transaction data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    setIsAuthenticated(true);
    axios.get(`${process.env.NEXT_PUBLIC_API_PATH}/hotels/details`, {
      params: { transactionid: id },
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setTransaction(res.data || null);
      })
      .catch(err => {
        setTransaction(null);
        setError(
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          'Failed to fetch booking details.'
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch PDF (optional, for download)
  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof window === 'undefined') throw new Error('This operation must be performed on the client side');
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token is missing. Please log in.');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_PATH}/hotels/voucher`, {
        params: { transactionid: id },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || err.message || 'Failed to fetch the invoice.');
      else if (err instanceof Error) setError(err.message);
      else setError('Failed to fetch the invoice.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (transaction?.bookingId) fetchInvoice();
  }, [transaction?.bookingId, fetchInvoice]);

  // Handle countdown when not authenticated
  useEffect(() => {
    if (error?.includes('Authentication token is missing')) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // router.push('user/auth/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [error, router]);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `hotel-invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const navigateToDashboard = () => {
    router.push('/user/account/manage');
  };

  // Helper: calculate nights
  const getNights = (checkIn: string, checkOut: string) => {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diff = (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  };

  // Data extraction with fallback
  const hotel = transaction?.hotel;
  // Support both 'contactDetail' and 'contact_details' from API
  const contact = transaction?.contactDetail || transaction?.contact_details;
  const search = transaction?.search;
  const pricing = transaction?.pricing;
  // Support both hotel_package and hotelPackage
  const hotelPackage = transaction?.hotel_package || transaction?.hotelPackage;
  const payment = transaction?.payment_response;
  const checkIn = search?.check_in_date;
  const checkOut = search?.check_out_date;
  const nights = checkIn && checkOut ? getNights(checkIn, checkOut) : 1;
  // Room type: prefer hotelPackage.room_details.description, fallback to hotelPackage.room_type, fallback to 'Room'
  const roomType = hotelPackage?.room_details?.description || hotelPackage?.room_type || 'Room';
  const guestName = contact ? `${contact.name}${contact.last_name ? ' ' + contact.last_name : ''}` : '';
  const guestMobile = contact?.mobile || '';
  const guestEmail = contact?.email || '';
  const amountPaid = pricing?.total_chargeable_amount;
  const currency = pricing?.currency === 'INR' ? '₹' : (pricing?.currency || '');
  const paymentMethod = payment?.method;
  const paymentStatus = payment?.status;
  const paymentDate = payment?.date || transaction?.created_at;
  const roomCount = search?.room_count ;
  const adultCount = search?.adult_count ;
  const childCount = search?.child_count;
  const hotelImage = hotel?.imageDetails?.images?.[0] || hotel?.images?.[0] || '/images/hotel-sample.jpg';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-2">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-0 overflow-hidden animate-fade-in">
        {/* Header with logo and booking status */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-100 to-blue-50 px-10 py-6 border-b border-blue-100">
          <Image src="/images/logo.png" alt="Trip Bazaar Logo" width={120} height={52} className="h-14" priority />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-4 py-1 rounded-full bg-green-100 text-green-700 text-base font-semibold shadow">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Confirmed
            </span>
          </div>
        </div>
        {/* If not authenticated, show only confirmation and login link */}
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <svg className="w-16 h-16 text-green-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-700 mb-6 text-center">
              Your hotel booking is confirmed.<br/>
              Log in to view your invoice and booking details.<br/>
              Redirecting in {countdown} seconds...
            </p>
            <a href="/user/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition text-lg">Login to View booking</a>
          </div>
        ) : (
        <>
        {/* Booking Summary */}
        <div className="flex flex-col md:flex-row gap-8 px-10 py-8 border-b border-gray-100 bg-white">
          <div className="flex-shrink-0 flex items-center justify-center">
            <Image src={hotelImage} alt="Hotel" width={130} height={130} className="rounded-2xl object-cover border border-gray-200 shadow" unoptimized />
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <h2 className="text-2xl font-extrabold text-blue-800 mb-1">{hotel?.name || 'Hotel Name'}</h2>
            <div className="flex items-center text-gray-600 gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12.414a4 4 0 10-5.657 5.657l4.243 4.243a8 8 0 1011.314-11.314l-4.243 4.243z" /></svg>
              {hotel?.location?.address || 'Hotel Address'}
            </div>
            <div className="flex items-center text-gray-600 gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2" /></svg>
              {roomType}
            </div>
            <div className="flex items-center text-gray-600 gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2 .896 2 2 2 2-.896 2-2 2-2-.896-2-2z" /></svg>
              {adultCount} Adults{childCount ? `, ${childCount} Children` : ''}
            </div>
            <div className="flex items-center text-gray-600 gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Booking ID: <span className="ml-1 font-semibold text-gray-800">{id}</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-10 py-8 bg-gray-50">
          {/* Guest Details */}
          <div className="p-6 bg-white rounded-2xl shadow flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-3 text-blue-700 text-lg font-semibold">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Guest Details
            </div>
            <div className="text-gray-800 text-base font-semibold mb-1">{guestName}</div>
            <div className="text-gray-600 text-sm mb-1 flex items-center gap-1">
              <svg className="inline w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 8h.01M17 12a5 5 0 11-10 0 5 5 0 0110 0zm7 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {guestMobile}
            </div>
            <div className="text-gray-600 text-sm flex items-center gap-1">
              <svg className="inline w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 2a10 10 0 110 20 10 10 0 010-20zm-1 6l-2 5-2-5" /></svg>
              {guestEmail}
            </div>
          </div>
          {/* Stay Details */}
          <div className="p-6 bg-white rounded-2xl shadow flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-3 text-blue-700 text-lg font-semibold">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Stay Details
            </div>
            <div className="flex flex-col gap-1 text-gray-700">
              <div className="flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Check-in: <span className="font-semibold">{checkIn}</span></div>
              <div className="flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Check-out: <span className="font-semibold">{checkOut}</span></div>
              <div className="flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Nights: <span className="font-semibold">{nights}</span></div>
              <div className="flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2" /></svg>Rooms: <span className="font-semibold">{roomCount}</span></div>
              <div className="flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2" /></svg>Room Type: <span className="font-semibold">{roomType}</span></div>
              <div className="flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2 .896 2 2 2 2-.896 2-2 2-2-.896-2-2z" /></svg>Guests: <span className="font-semibold">{adultCount} Adults{childCount ? `, ${childCount} Children` : ''}</span></div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="px-10 py-8 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 mb-3 text-blue-700 text-lg font-semibold">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 7v7" /></svg>
            Payment Details
          </div>
          <div className="flex flex-col gap-2 text-gray-700">
            <div className="flex items-center gap-2"><span>Amount Paid:</span> <span className="font-semibold text-green-700">{currency} {amountPaid}</span></div>
            <div className="flex items-center gap-2"><span>Payment Method:</span> <span className="font-semibold">{paymentMethod}</span></div>
            <div className="flex items-center gap-2"><span>Payment Status:</span> <span className="font-semibold text-green-700">{paymentStatus}</span></div>
            <div className="flex items-center gap-2"><span>Payment Date:</span> <span className="font-semibold">{paymentDate ? new Date(paymentDate).toLocaleString() : ''}</span></div>
          </div>
        </div>

        {/* Error/Loading/Actions */}
        <div className="px-10 py-8 flex flex-col gap-6 items-center bg-white rounded-b-3xl">
          {loading && (
            <div className="flex flex-col items-center gap-2 animate-pulse">
              <svg className="w-8 h-8 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <p className="text-blue-500 font-medium">Loading invoice...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2 text-red-700 flex flex-col items-center">
              <svg className="w-6 h-6 mb-1 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold">{error}</p>
            </div>
          )}
          {!loading && !error && (
            <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
              <button
                onClick={handleDownload}
                disabled={!pdfUrl}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-2 px-8 rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download PDF
              </button>
              <button
                onClick={navigateToDashboard}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-bold py-2 px-8 rounded-lg shadow transition text-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                </svg>
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default function HotelVoucher() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HotelVoucherInner />
    </Suspense>
  );
}