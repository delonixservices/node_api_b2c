"use client";

import HotelFilter from "@/components/hotel/hotelFilter";
import HotelSearch from "@/components/hotel/hotelSearch";
import HotelTab from "@/components/hotel/hotelTab";
import { showToast } from "@/components/notify";
import { useAppContext } from "@/context/AppContext";
import { Hotel, HotelSuggestion } from "@/models/hotel";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import React from "react";
import type { FilterState, PriceRange } from "@/components/hotel/hotelFilter";
import { safeParseURLParam } from "../../../utils/urlUtils";
import { Dialog } from "@headlessui/react";

// Memoize child components if not already
const MemoHotelFilter = React.memo(HotelFilter);
const MemoHotelSearch = React.memo(HotelSearch);
const MemoHotelTab = React.memo(HotelTab);

// Hotel Skeleton Component that mimics HotelTab structure exactly
const HotelSkeleton: React.FC = React.memo(() => {
  return (
    <aside className="py-8 px-6 bg-white/60 backdrop-blur-md rounded-2xl shadow-neu-soft my-8 transition-all">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Image Section Skeleton */}
        <div className="relative overflow-hidden bg-gradient-to-br from-stone-200/80 to-stone-100/60 rounded-xl group min-h-[200px] shadow-neu-inset">
          <div className="flex w-full h-full">
            {/* Big image skeleton */}
            <div className="relative rounded-xl overflow-hidden flex-shrink-0" style={{ width: "70%", aspectRatio: "4/3", minHeight: 0 }}>
              <div 
                className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                style={{
                  backgroundSize: '200px 100%',
                  animation: 'shimmer 1.5s infinite linear'
                }}
              ></div>
            </div>
            {/* 3 small images skeleton */}
            <div className="flex flex-col gap-2 ml-2 w-[30%]">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="relative rounded-xl overflow-hidden flex-1"
                  style={{ minHeight: 0 }}
                >
                  <div 
                    className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                    style={{
                      backgroundSize: '200px 100%',
                      animation: 'shimmer 1.5s infinite linear'
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content Section Skeleton */}
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Hotel name skeleton */}
            <div 
              className="h-8 rounded mb-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
              style={{
                backgroundSize: '200px 100%',
                animation: 'shimmer 1.5s infinite linear'
              }}
            ></div>
            <div 
              className="h-6 rounded w-3/4 mb-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
              style={{
                backgroundSize: '200px 100%',
                animation: 'shimmer 1.5s infinite linear'
              }}
            ></div>
            
            {/* Rating skeleton */}
            <div className="flex items-center gap-1 mb-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div 
                    key={star} 
                    className="w-4 h-4 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                    style={{
                      backgroundSize: '200px 100%',
                      animation: 'shimmer 1.5s infinite linear'
                    }}
                  ></div>
                ))}
              </div>
              <div 
                className="h-4 rounded w-16 ml-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                style={{
                  backgroundSize: '200px 100%',
                  animation: 'shimmer 1.5s infinite linear'
                }}
              ></div>
            </div>
            
            {/* Amenities skeleton */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((amenity) => (
                <div
                  key={amenity}
                  className="px-3 py-1 rounded-full w-16 h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                  style={{
                    backgroundSize: '200px 100%',
                    animation: 'shimmer 1.5s infinite linear',
                    animationDelay: `${amenity * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Price and button skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-center border-t border-stone-200/60 pt-5 mt-4 gap-4">
            <div className="flex flex-col items-start">
              <div 
                className="h-8 rounded w-24 mb-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                style={{
                  backgroundSize: '200px 100%',
                  animation: 'shimmer 1.5s infinite linear'
                }}
              ></div>
              <div className="space-y-1">
                <div 
                  className="h-3 rounded w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                  style={{
                    backgroundSize: '200px 100%',
                    animation: 'shimmer 1.5s infinite linear'
                  }}
                ></div>
                <div 
                  className="h-3 rounded w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                  style={{
                    backgroundSize: '200px 100%',
                    animation: 'shimmer 1.5s infinite linear'
                  }}
                ></div>
              </div>
            </div>
            <div 
              className="h-10 rounded-lg w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
              style={{
                backgroundSize: '200px 100%',
                animation: 'shimmer 1.5s infinite linear'
              }}
            ></div>
          </div>
        </div>
      </div>
    </aside>
  );
});
HotelSkeleton.displayName = "HotelSkeleton";

function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(callback: T, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  useEffect(() => { callbackRef.current = callback; }, [callback]);
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay);
  }, [delay]);
}

// Mapping from categoryId to property type string
const CATEGORY_ID_TO_TYPE: Record<string, string> = {
  "Flagship": "Hotel",
  "Townhouse": "Home stay", 
  "Collection O": "Guest House",
  "Apartment": "Apartment",
  // Add more as needed if your backend uses more category IDs
};

export default function SearchPage() {
  const { loading, setLoading } = useAppContext();
  const [area, setArea] = useState<HotelSuggestion | null>(null);
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const [roomDetail, setRoomDetail] = useState([{ adults: 2, children: 0 }]);
  const [hotelList, setHotelList] = useState<Hotel[]>([]);
  const [transactionIdentifier, setTransactionIdentifier] = useState<string>("");
  const [filterState, setFilterState] = useState<FilterState>({
    searchText: "",
    selectedPriceRanges: [],
    selectedStarRatings: [],
    selectedPropertyTypes: [],
  });
  // Add sort order state
  const [sortOrder, setSortOrder] = useState<"low-to-high" | "high-to-low">("low-to-high");

  // Pagination state - Modified for infinite scrolling
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreHotels, setHasMoreHotels] = useState(true); // Start with true for infinite scrolling
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalHotelsFound, setTotalHotelsFound] = useState(0);
  const [apiTotalPages, setApiTotalPages] = useState<number | null>(null);
  const [allHotelsLoaded, setAllHotelsLoaded] = useState<Hotel[]>([]); // Store all hotels
  const [currentItemsCount, setCurrentItemsCount] = useState(0); // Track total items loaded

  const searchParams = useSearchParams();
  const abortControllerRef = useRef<AbortController | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // const [endOfDataToastShown, setEndOfDataToastShown] = useState(false); // Removed - no more loading

  const [showFilterModal, setShowFilterModal] = useState(false);

  // UseEffect for handling URL parameters
  useEffect(() => {
    try {
      const areaParam = searchParams.get("area");
      const checkIn = searchParams.get("checkindate") || "";
      const checkOut = searchParams.get("checkoutdate") || "";
      const roomsParam = searchParams.get("details");

      // Only update state if value changes
      setArea(prev => {
        const parsed = areaParam ? JSON.parse(areaParam) : null;
        console.log('🔍 SearchPage: Parsed area from URL:', {
          area: parsed?.name,
          transaction_identifier: parsed?.transaction_identifier || "Not provided",
          hasTransactionId: !!parsed?.transaction_identifier,
          fullAreaObject: parsed
        });
        return JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev;
      });
      setCheckInDate(prev => prev !== checkIn ? checkIn : prev);
      setCheckOutDate(prev => prev !== checkOut ? checkOut : prev);
      console.log("Raw roomsParam from URL:", roomsParam);
      const parsed = safeParseURLParam(roomsParam, [{ adults: 1, children: 0 }]);
      // Normalize to expected format if needed
      let normalized;
      if (Array.isArray(parsed) && parsed.length && parsed[0].adults !== undefined) {
        normalized = parsed;
      } else if (Array.isArray(parsed) && parsed.length && (parsed[0] as { adult_count?: unknown }).adult_count !== undefined) {
        normalized = (parsed as unknown as Array<{ adult_count?: unknown; child_count?: unknown }>).map(d => ({
          adults: Number(d.adult_count),
          children: Number(d.child_count)
        }));
      } else {
        normalized = [{ adults: 1, children: 0 }];
      }
      setRoomDetail(normalized);
      console.log("Normalized roomDetail from URL:", normalized);
    } catch (err) {
      console.error("Error parsing URL params:", err);
      showToast("error", "Invalid search parameters");
      setArea(null);
      setCheckInDate("");
      setCheckOutDate("");
      setRoomDetail([{ adults: 1, children: 0 }]);
    }
  }, [searchParams]);

  // Debounced hotel search - Modified for infinite scrolling (load 50 initially, then load more on scroll)
  const debouncedSearchHotels = useDebouncedCallback(
    async (params: { area: HotelSuggestion; checkInDate: string; checkOutDate: string; roomDetail: { adults: number; children: number }[]; page: number }) => {
      console.log('🔍 Starting infinite scroll hotel search:', params);
      
      if (!params.area || !params.checkInDate || !params.checkOutDate) {
        console.log('❌ Missing required parameters:', { area: !!params.area, checkIn: !!params.checkInDate, checkOut: !!params.checkOutDate });
        showToast("warning", "Please provide all search parameters");
        return;
      }
      
      console.log('✅ All parameters present, starting infinite scroll search...');
      setLoading(true);
      setHotelList([]);
      setAllHotelsLoaded([]);
      setCurrentPage(1);
      setCurrentItemsCount(0);
      setHasMoreHotels(true);
      setTotalHotelsFound(0);
      setApiTotalPages(null);
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;
      
      try {
        // Load initial 50 hotels
        const hotelsPerPage = 50;
        const requestPayload = {
          perPage: hotelsPerPage,
          page: 1,
          currentItemsCount: 0,
          checkindate: params.checkInDate,
          checkoutdate: params.checkOutDate,
          area: params.area,
          details: params.roomDetail.map((room: { adults: number; children: number }, index: number) => ({
            room: (index + 1).toString(),
            adult_count: room.adults.toString(),
            child_count: room.children.toString(),
          })),
          transaction_identifier: params.area.transaction_identifier || "",
        };
        
        // Log the initial request payload
        console.log('📤 Sending initial request payload:', {
          area: params.area.name,
          page: 1,
          transaction_identifier: requestPayload.transaction_identifier || "Empty string",
          hasTransactionId: !!requestPayload.transaction_identifier,
          fullPayload: requestPayload
        });
        
        const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:3334/api';
        
        const response = await axios.post(
          `${apiPath}/hotels/search`,
          requestPayload,
          {
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            timeout: 30000,
          }
        );
        
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const data = response.data;
        const hotels = data.data?.hotels || data.hotels || [];
        const status = data.data?.status || data.status;
        const totalCount = data.data?.totalHotelsCount || data.totalHotelsCount || 0;
        const responseTransactionId = data.data?.transaction_identifier || data.transaction_identifier;
        
        // Set transaction ID and total count
        setTransactionIdentifier(responseTransactionId);
        setTotalHotelsFound(totalCount);
        
        console.log('📄 Initial search response:', {
          area: params.area.name,
          hotelsCount: hotels.length,
          status: status,
          totalHotels: totalCount,
          isComplete: status === 'complete',
          transaction_identifier: responseTransactionId
        });
        
        // Process and display initial hotels
        if (hotels.length > 0) {
          const normalizedHotels = hotels.map((hotel: Hotel) => ({
            ...hotel,
            dailyRates: {
              ...hotel.dailyRates,
              lowest: hotel.dailyRates && hotel.dailyRates.lowest != null
                ? Number(hotel.dailyRates.lowest)
                : 0
            },
            searchPage: 1
          }));
          
          setAllHotelsLoaded(normalizedHotels);
          setHotelList(normalizedHotels);
          setCurrentItemsCount(hotels.length);
          setCurrentPage(2); // Next page will be 2
          
          // Check if there are more hotels to load
          const hasMore = status !== 'complete' && hotels.length === hotelsPerPage && hotels.length < totalCount;
          setHasMoreHotels(hasMore);
          
          console.log('✅ Initial load complete:', {
            area: params.area.name,
            hotelsLoaded: hotels.length,
            totalAvailable: totalCount,
            hasMoreHotels: hasMore,
            nextPage: 2
          });
          
          showToast("success", `Found ${totalCount} hotels. Showing first ${hotels.length} hotels. Scroll down to load more.`);
        } else {
          setHasMoreHotels(false);
          showToast("info", "No hotels found");
        }
        
      } catch (error: unknown) {
        if (axios.isCancel(error)) {
          console.log('🛑 Request was cancelled');
        } else {
          const axiosError = error as { message?: string; code?: string; response?: { data?: unknown; status?: number }; config?: { url?: string; method?: string; headers?: unknown } };
          console.error("❌ Error searching hotels:", {
            message: axiosError.message,
            code: axiosError.code,
            response: axiosError.response?.data,
            status: axiosError.response?.status,
            config: {
              url: axiosError.config?.url,
              method: axiosError.config?.method,
              headers: axiosError.config?.headers
            }
          });
          
          // More specific error messages
          if (axiosError.code === 'ECONNABORTED') {
            showToast("error", "Request timed out. Please check your connection and try again.");
          } else if (axiosError.response?.status === 404) {
            showToast("error", "API endpoint not found. Please contact support.");
          } else if (axiosError.response?.status && axiosError.response.status >= 500) {
            showToast("error", "Server error. Please try again later.");
          } else if (!axiosError.response) {
            showToast("error", "Network error. Please check your internet connection.");
          } else {
            showToast("error", `Failed to search hotels: ${(axiosError.response?.data as { message?: string })?.message || axiosError.message}`);
          }
        }
      } finally {
        setLoading(false);
        console.log('🏁 Initial search operation completed');
      }
    },
    400
  );

  // UseEffect for initiating hotel search based on parameters
  useEffect(() => {
    if (area && checkInDate && checkOutDate) {
      debouncedSearchHotels({ area, checkInDate, checkOutDate, roomDetail, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, checkInDate, checkOutDate, roomDetail]);

  // Reset pagination and toast flag when filters change
  useEffect(() => {
    setCurrentPage(1);
    setHasMoreHotels(true); // No more loading needed since we load all at once
    setIsLoadingMore(false);
    setApiTotalPages(null);
  }, [filterState]);

  // Function to load more hotels (infinite scroll)
  const loadMoreHotels = useCallback(async () => {
    if (!area || !checkInDate || !checkOutDate || isLoadingMore || !hasMoreHotels) {
      return;
    }

    console.log('📥 Loading more hotels...', {
      currentPage,
      currentItemsCount,
      hasMoreHotels,
      isLoadingMore
    });

    setIsLoadingMore(true);
    
    try {
      const hotelsPerPage = 50;
      const requestPayload = {
        perPage: hotelsPerPage,
        page: currentPage,
        currentItemsCount: currentItemsCount,
        checkindate: checkInDate,
        checkoutdate: checkOutDate,
        area: area,
        details: roomDetail.map((room: { adults: number; children: number }, index: number) => ({
          room: (index + 1).toString(),
          adult_count: room.adults.toString(),
          child_count: room.children.toString(),
        })),
        transaction_identifier: area.transaction_identifier || "",
      };
      
      // Log the load more request payload
      console.log('📤 Sending load more request payload:', {
        area: area.name,
        page: currentPage,
        currentItemsCount: currentItemsCount,
        transaction_identifier: requestPayload.transaction_identifier || "Empty string",
        hasTransactionId: !!requestPayload.transaction_identifier
      });
      
      const apiPath = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:3334/api';
      
      const response = await axios.post(
        `${apiPath}/hotels/search`,
        requestPayload,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        }
      );
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data = response.data;
      const hotels = data.data?.hotels || data.hotels || [];
      const status = data.data?.status || data.status;
      
      console.log('📄 Load more response:', {
        area: area.name,
        page: currentPage,
        hotelsCount: hotels.length,
        status: status,
        isComplete: status === 'complete'
      });
      
      // Process and add new hotels
      if (hotels.length > 0) {
        const normalizedHotels = hotels.map((hotel: Hotel) => ({
          ...hotel,
          dailyRates: {
            ...hotel.dailyRates,
            lowest: hotel.dailyRates && hotel.dailyRates.lowest != null
              ? Number(hotel.dailyRates.lowest)
              : 0
          },
          searchPage: currentPage
        }));
        
        // Add new hotels to the complete list
        const updatedAllHotels = [...allHotelsLoaded, ...normalizedHotels];
        setAllHotelsLoaded(updatedAllHotels);
        setHotelList(updatedAllHotels);
        setCurrentItemsCount(updatedAllHotels.length);
        setCurrentPage(currentPage + 1);
        
        // Check if there are more hotels to load
        const hasMore = status !== 'complete' && hotels.length === hotelsPerPage;
        setHasMoreHotels(hasMore);
        
        console.log('✅ Load more complete:', {
          area: area.name,
          newHotelsLoaded: hotels.length,
          totalHotelsNow: updatedAllHotels.length,
          hasMoreHotels: hasMore,
          nextPage: currentPage + 1
        });
        
        showToast("info", `Loaded ${hotels.length} more hotels. Total: ${updatedAllHotels.length}`);
      } else {
        setHasMoreHotels(false);
        console.log('🏁 No more hotels to load');
        showToast("info", "No more hotels available");
      }
      
    } catch (error: unknown) {
      const axiosError = error as { message?: string; code?: string; response?: { data?: unknown; status?: number } };
      console.error("❌ Error loading more hotels:", {
        message: axiosError.message,
        code: axiosError.code,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      });
      
      showToast("error", "Failed to load more hotels. Please try again.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [area, checkInDate, checkOutDate, roomDetail, currentPage, currentItemsCount, allHotelsLoaded, hasMoreHotels, isLoadingMore]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    console.log('🔧 Setting up intersection observer:', {
      hasMoreHotels,
      isLoadingMore,
      hotelListLength: hotelList.length,
      loadingRefExists: !!loadingRef.current
    });

    if (!hasMoreHotels || isLoadingMore) {
      console.log('❌ Skipping observer setup - no more hotels or already loading');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log('👁️ Intersection observer entry:', {
            isIntersecting: entry.isIntersecting,
            target: entry.target,
            hasMoreHotels,
            isLoadingMore
          });
          
          if (entry.isIntersecting && hasMoreHotels && !isLoadingMore) {
            console.log('🚀 Triggering load more hotels');
            loadMoreHotels();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before reaching the element
        threshold: 0.1
      }
    );

    observerRef.current = observer;

    // Observe the loading ref if it exists
    if (loadingRef.current) {
      console.log('🔍 Observing loading ref element');
      observer.observe(loadingRef.current);
    } else {
      console.log('⚠️ Loading ref not available yet');
    }

    return () => {
      if (observerRef.current) {
        console.log('🧹 Cleaning up intersection observer');
        observerRef.current.disconnect();
      }
    };
  }, [hasMoreHotels, isLoadingMore, loadMoreHotels, hotelList.length]);

  // Observe the loading ref when it becomes available
  useEffect(() => {
    const currentLoadingRef = loadingRef.current;
    const currentObserverRef = observerRef.current;
    
    if (currentObserverRef && currentLoadingRef && hasMoreHotels && !isLoadingMore) {
      console.log('🔍 Observing loading ref element (separate effect)');
      currentObserverRef.observe(currentLoadingRef);
      
      return () => {
        if (currentObserverRef && currentLoadingRef) {
          console.log('🧹 Unobserving loading ref element');
          currentObserverRef.unobserve(currentLoadingRef);
        }
      };
    }
  }, [hasMoreHotels, isLoadingMore, hotelList.length]);

  const totalHotelsCount = useMemo(() => hotelList.length, [hotelList]);

  // Filtering logic
  const filteredHotelList = useMemo(() => {
    return hotelList.filter((hotel) => {
      // Search by hotel name
      if (
        filterState.searchText &&
        !hotel.name.toLowerCase().includes(filterState.searchText.toLowerCase())
      ) {
        return false;
      }
      // Price range (using base_amount from rates.packages)
      if (
        filterState.selectedPriceRanges.length > 0
      ) {
        // Get the lowest base_amount from all packages
        const packages = hotel.rates?.packages || [];
        if (packages.length === 0) {
          return false; // No packages available
        }
        
        const lowestBaseAmount = Math.min(...packages.map(pkg => pkg.base_amount || 0));
        
        if (lowestBaseAmount === 0) {
          return false; // No valid pricing
        }
        
        // Check if the lowest base_amount matches any selected price range
        const matchesPriceRange = filterState.selectedPriceRanges.some(
          (range: PriceRange) => {
            // For the "Rs 15000+" range (max is 100000), check if price >= min
            if (range.max === 100000) {
              return lowestBaseAmount >= range.min;
            }
            
            // For other ranges, check if price is within the range (inclusive)
            return lowestBaseAmount >= range.min && lowestBaseAmount <= range.max;
          }
        );
        
        if (!matchesPriceRange) {
          return false;
        }
      }
      // Star ratings (using real ratings from moreRatings)
      if (
        filterState.selectedStarRatings.length > 0
      ) {
        const tripAdvisorRating = hotel.moreRatings?.tripAdvisor?.rating || 0;
        const trustYouRating = hotel.moreRatings?.trustYou?.rating || 0;
        const bestRating = tripAdvisorRating > 0 ? tripAdvisorRating : 
                         trustYouRating > 0 ? trustYouRating : 
                         hotel.starRating || 0;
        const displayRating = Math.round(bestRating);
        
        if (!filterState.selectedStarRatings.includes(String(displayRating))) {
          return false;
        }
      }
      // Property types (hotel.moreDetails.categoryId as string, if available)
      if (
        filterState.selectedPropertyTypes.length > 0 &&
        !(hotel.moreDetails && filterState.selectedPropertyTypes.includes(CATEGORY_ID_TO_TYPE[hotel.moreDetails.categoryId]))
      ) {
        return false;
      }
      return true;
    });
  }, [hotelList, filterState]);

  // Sorting logic
  const sortedHotelList = useMemo(() => {
    const getLowestBaseAmount = (hotel: Hotel) => {
      const packages = hotel.rates?.packages || [];
      if (packages.length === 0) return Infinity;
      return Math.min(...packages.map(pkg => pkg.base_amount || Infinity));
    };
    const sorted = [...filteredHotelList].sort((a, b) => {
      const priceA = getLowestBaseAmount(a);
      const priceB = getLowestBaseAmount(b);
      if (sortOrder === "low-to-high") {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });
    return sorted;
  }, [filteredHotelList, sortOrder]);

  return (
    <>
      <MemoHotelSearch
        initialArea={area || undefined}
        initialCheckIn={checkInDate}
        initialCheckOut={checkOutDate}
        initialRoomDetail={roomDetail}
      />
      <section className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-medium text-gray-800">
                {area ? `Hotels in ${area.name}` : "Search Hotels"}
              </h2>
              {area && (
                <div className="text-gray-600 text-xs mt-1">
                  <p>
                    Showing <span className="font-medium">{totalHotelsCount}</span> of <span className="font-medium">{totalHotelsFound}</span> properties in <span className="font-medium">{area.name}</span>
                    {checkInDate && checkOutDate && (
                      <span> from <span className="font-medium">{checkInDate}</span> to <span className="font-medium">{checkOutDate}</span></span>
                    )}
                  </p>
                  {totalHotelsFound > 0 && (
                    <p className="mt-1">
                      <span className="font-medium">Loaded: {totalHotelsCount}</span> of <span className="font-medium">{totalHotelsFound}</span> hotels
                      {apiTotalPages !== null && (
                        <span className="ml-1 text-xs text-blue-600">(API: {apiTotalPages})</span>
                      )}
                      {hasMoreHotels && (
                        <span className="ml-2 text-green-600">• Scroll to load more</span>
                      )}
                      {!hasMoreHotels && totalHotelsCount > 0 && (
                        <span className="ml-2 text-gray-500">• All loaded</span>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>

            {hotelList.length > 0 && (
              <div className="flex items-center gap-2">
                <label 
                  htmlFor="sortPrice" 
                  className="text-gray-700 text-xs font-medium whitespace-nowrap"
                >
                  Sort by:
                </label>
                <select 
                  id="sortPrice"
                  className="bg-white border border-gray-300 text-gray-700 text-sm px-2 py-1 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-32"
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as "low-to-high" | "high-to-low")}
                >
                  <option value="low-to-high">Low to High</option>
                  <option value="high-to-low">High to Low</option>
                </select>
                {/* Load More Button in Header - removed */}
                {/* Header Loading Placeholder */}
                {hasMoreHotels && isLoadingMore && (
                  <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>Loading more...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-6">
        <div className="container mx-auto px-4">
          {/* Mobile: Filter as a button, modal for filter options */}
          <div className="block lg:hidden">
            <div className="mb-4 flex justify-end">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded shadow text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setShowFilterModal(true)}
                aria-label="Show filters"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M6 12h12M10 18h4"/></svg>
                Filters
              </button>
            </div>
            {/* Modal for filter options */}
            <Dialog open={showFilterModal} onClose={() => setShowFilterModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
                <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-auto p-6 z-10">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title className="text-lg font-semibold">Filters</Dialog.Title>
                    <button onClick={() => setShowFilterModal(false)} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
                  </div>
                  <MemoHotelFilter
                    filterState={filterState}
                    onFilterChange={setFilterState}
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                      onClick={() => setShowFilterModal(false)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </Dialog>
            <div className="w-full">
              <div className="p-4">
                {/* Show total hotels found at the top */}
                {totalHotelsFound > 0 && (
                  <div className="text-lg font-semibold mb-4">
                    Found {totalHotelsFound} hotels • Showing {totalHotelsCount} • {hasMoreHotels ? 'Scroll down to load more' : 'All hotels loaded'}
                  </div>
                )}
                {loading ? (
                  <div className="space-y-0">
                    {/* Show 6 skeleton items while loading */}
                    {Array.from({ length: 6 }, (_, index) => (
                      <HotelSkeleton key={`skeleton-${index}`} />
                    ))}
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        Loading hotels... This may take a few moments
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {hotelList.length === 0 && !loading && (
                      <div className="text-center py-10">
                        <p className="text-lg">
                          {area
                            ? "No hotels found matching your criteria"
                            : "Please enter search parameters to find hotels"}
                        </p>
                      </div>
                    )}
                    {sortedHotelList.map((hotel, index) => (
                      <div 
                        key={`${hotel.id || hotel.name}-${index}`}
                        className="animate-fadeIn"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        <MemoHotelTab
                          hotel={hotel}
                          transaction_identifier={transactionIdentifier}
                        />
                      </div>
                    ))}
                    {/* Intersection observer target - trigger load more when reaching the end */}
                    {hasMoreHotels && !isLoadingMore && sortedHotelList.length >= 30 && (
                      <div 
                        ref={loadingRef}
                        className="h-1 w-full bg-transparent"
                        data-testid="load-more-trigger"
                        style={{ marginTop: '20px' }}
                      />
                    )}
                    {/* Loading more indicator */}
                    {isLoadingMore && (
                      <div className="space-y-0">
                        {/* Show 3 skeleton items for loading more */}
                        {Array.from({ length: 3 }, (_, index) => (
                          <HotelSkeleton key={`load-more-skeleton-${index}`} />
                        ))}
                        <div className="text-center py-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">Loading more hotels...</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Page {currentPage - 1} • {totalHotelsCount} of {totalHotelsFound} hotels loaded
                          </p>
                        </div>
                      </div>
                    )}
                    {/* End of results message */}
                    {!loading && !isLoadingMore && hotelList.length > 0 && !hasMoreHotels && (
                      <div className="text-center py-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">
                          All {hotelList.length} hotels loaded
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {totalHotelsFound === hotelList.length
                            ? `All ${totalHotelsFound} hotels successfully loaded`
                            : `Loaded ${hotelList.length} of ${totalHotelsFound} available hotels`}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Desktop: Side-by-side layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <MemoHotelFilter
                filterState={filterState}
                onFilterChange={setFilterState}
              />
            </div>
            <div className="lg:col-span-3">
              <div className="p-4">
                {/* Show total hotels found at the top */}
                {totalHotelsFound > 0 && (
                  <div className="text-lg font-semibold mb-4">
                    Found {totalHotelsFound} hotels • Showing {totalHotelsCount} • {hasMoreHotels ? 'Scroll down to load more' : 'All hotels loaded'}
                  </div>
                )}
                {loading ? (
                  <div className="space-y-0">
                    {/* Show 6 skeleton items while loading */}
                    {Array.from({ length: 6 }, (_, index) => (
                      <HotelSkeleton key={`skeleton-${index}`} />
                    ))}
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        Loading hotels... This may take a few moments
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {hotelList.length === 0 && !loading && (
                      <div className="text-center py-10">
                        <p className="text-lg">
                          {area
                            ? "No hotels found matching your criteria"
                            : "Please enter search parameters to find hotels"}
                        </p>
                      </div>
                    )}
                    {sortedHotelList.map((hotel, index) => (
                      <div 
                        key={`${hotel.id || hotel.name}-${index}`}
                        className="animate-fadeIn"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        <MemoHotelTab
                          hotel={hotel}
                          transaction_identifier={transactionIdentifier}
                        />
                      </div>
                    ))}
                    
                    {/* Intersection observer target - trigger load more when reaching the end */}
                    {hasMoreHotels && !isLoadingMore && sortedHotelList.length >= 30 && (
                      <div 
                        ref={loadingRef}
                        className="h-1 w-full bg-transparent"
                        data-testid="load-more-trigger"
                        style={{ marginTop: '20px' }}
                      />
                    )}
                    
                    {/* Loading more indicator */}
                    {isLoadingMore && (
                      <div className="space-y-0">
                        {/* Show 3 skeleton items for loading more */}
                        {Array.from({ length: 3 }, (_, index) => (
                          <HotelSkeleton key={`load-more-skeleton-${index}`} />
                        ))}
                        <div className="text-center py-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">Loading more hotels...</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Page {currentPage - 1} • {totalHotelsCount} of {totalHotelsFound} hotels loaded
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* End of results message */}
                    {!loading && !isLoadingMore && hotelList.length > 0 && !hasMoreHotels && (
                      <div className="text-center py-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">
                          All {hotelList.length} hotels loaded
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {totalHotelsFound === hotelList.length
                            ? `All ${totalHotelsFound} hotels successfully loaded`
                            : `Loaded ${hotelList.length} of ${totalHotelsFound} available hotels`}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}