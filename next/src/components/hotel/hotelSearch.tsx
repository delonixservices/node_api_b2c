"use client";

import { HotelSuggestion } from "@/models/hotel";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { showToast } from "../notify";
import { FaHotel, FaCity, FaHome } from "react-icons/fa";
import ReactDOM from 'react-dom';

function useDebounce<T extends unknown[]>(fn: (...args: T) => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  return useCallback((...args: T) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

// Add RoomDetail type
interface RoomDetail {
  adults: number;
  children: number;
  childAges: number[];
}

// Add props for initial values
interface HotelSearchProps {
  initialArea?: HotelSuggestion;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialRoomDetail?: { adults: number; children: number; childAges?: number[] }[];
}

// Utility to highlight search term in result
function highlightText(text: string, highlight: string) {
  if (!highlight) return text;
  // Escape special regex characters to prevent regex errors
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'ig');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <b key={i} className="font-semibold text-black">{part}</b> : part
  );
}

// Portal component for mobile dropdown
function HotelSuggestionPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  if (!mounted || !isMobile) return null;
  if (typeof window === 'undefined') return null;
  return ReactDOM.createPortal(children, document.body);
}

export default function HotelSearch({
  initialArea,
  initialCheckIn,
  initialCheckOut,
  initialRoomDetail,
}: HotelSearchProps = {}) {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t;
  }, []);
  // Parse initial dates if provided
  const initialStartDate = initialCheckIn ? new Date(initialCheckIn) : today;
  const initialEndDate = initialCheckOut ? new Date(initialCheckOut) : tomorrow;
  const [state, setState] = useState([
    {
      startDate: initialStartDate,
      endDate: initialEndDate,
      key: "selection",
    },
  ]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [location, setLocation] = useState<string>(initialArea?.name || "");
  const [area, setArea] = useState<HotelSuggestion | undefined>(initialArea);
  const [searchSuggestions, setSearchSuggestions] = useState<HotelSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [roomDetail, setRoomDetail] = useState<RoomDetail[]>(
    initialRoomDetail && initialRoomDetail.length > 0
      ? initialRoomDetail.map(r => ({ ...r, childAges: r.childAges || [] }))
      : [{ adults: 1, children: 0, childAges: [] }]
  );
  const checkInRef = useRef<HTMLDivElement | null>(null);
  // Add refs for popups
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const datePickerRef = useRef<HTMLDivElement | null>(null);
  const roomPickerRef = useRef<HTMLDivElement | null>(null);
  // Add step state for popup flow
  const [step, setStep] = useState<null | "location" | "checkin" | "checkout" | "room" | "date">(
    null
  );

  const checkIn = useMemo(() => state[0].startDate ? format(state[0].startDate, "yyyy-MM-dd") : "", [state]);
  const checkOut = useMemo(() => state[0].endDate ? format(state[0].endDate, "yyyy-MM-dd") : "", [state]);
  const totalGuests = useMemo(() => roomDetail.reduce((sum, room) => sum + room.adults + room.children, 0), [roomDetail]);

  const handleSearch = useCallback(() => {
    if (!area) {
      showToast("error", "Please select a location");
      return;
    }
    if (!checkIn || !checkOut) {
      showToast("error", "Please select check-in and check-out dates");
      return;
    }
    const { id, name, type, transaction_identifier } = area;
    const details = roomDetail.map((room, index) => ({
      room: `${index + 1}`,
      adult_count: `${room.adults}`,
      child_count: `${room.children}`,
    }));
    
    // Log the transaction_identifier being included
    console.log('🔍 HotelSearch: Including transaction_identifier in search:', {
      area: name,
      transaction_identifier: transaction_identifier || "Not provided",
      hasTransactionId: !!transaction_identifier
    });
    
    const queryParams = new URLSearchParams({
      perPage: "15",
      checkindate: checkIn,
      checkoutdate: checkOut,
      area: JSON.stringify({ id, name, type, transaction_identifier }),
      details: JSON.stringify(details),
    }).toString();
    
    router.push(`/hotels/search?${queryParams}#booknow`);
  }, [area, checkIn, checkOut, roomDetail, router]);
  

  const suggestHotels = useCallback(async (query: string) => {
    setSearchLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/hotels/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: 1,
          perPage: 20,
          currentItemsCount: 0,
          query: query,
        }),
      });
      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
      }
      const data = await response.json();
      console.log('🔍 Auto-suggest API response:', {
        query: query,
        suggestions: data.data || [],
        hotelCounts: (data.data || []).map((s: HotelSuggestion) => ({
          name: s.name,
          type: s.type,
          hotelCount: s.hotelCount,
          hotelCountType: typeof s.hotelCount
        }))
      });
      setSearchSuggestions(data.data || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Suggestion fetch error:", error.message);
      } else {
        console.error("Suggestion fetch error");
      }
      showToast("error", "Failed to fetch hotel suggestions");
    } finally {
      setSearchLoading(false);
    }
  }, []);
  

  const debouncedSuggestHotels = useDebounce(suggestHotels, 300);

  // Outside click handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      // Dropdown
      if (showDropdown && dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false);
      }
      // Date Picker (desktop only, mobile already handled)
      if (step === "date" && datePickerRef.current && !datePickerRef.current.contains(target) && window.innerWidth >= 768) {
        setStep("room");
      }
      // Room Picker
      if (step === "room" && roomPickerRef.current && !roomPickerRef.current.contains(target)) {
        setStep(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown, step]);

  useEffect(() => {
    setArea(initialArea);
    setLocation(initialArea?.name || "");
    setState([{
      startDate: initialCheckIn ? new Date(initialCheckIn) : today,
      endDate: initialCheckOut ? new Date(initialCheckOut) : tomorrow,
      key: "selection",
    }]);
    setRoomDetail(
      initialRoomDetail && initialRoomDetail.length > 0
        ? initialRoomDetail.map(r => ({ ...r, childAges: r.childAges || [] }))
        : [{ adults: 1, children: 0, childAges: [] }]
    );
  }, [initialArea, initialCheckIn, initialCheckOut, initialRoomDetail, today, tomorrow]);

  return (
    <section className="bg-[url('/images/hotel.jpg')] bg-cover bg-center py-20 px-4 md:py-32">
      <aside className="container mx-auto bg-white/50 p-4 sm:p-8 rounded-2xl shadow-xl/20">
        <div className="flex flex-col md:flex-row gap-y-4 md:gap-y-0 md:gap-x-4 mb-4 relative">
          {/* Location */}
          <div className="w-full md:w-1/4 p-2 sm:p-3 bg-white/40 backdrop-blur rounded-xl shadow-neu-inset border-0 cursor-pointer relative overflow-visible">
            <label className="text-gray-500 text-xs font-semibold uppercase">City/Hotel</label>
            <input
              type="text"
              placeholder="Where are you going?"
              value={location}
              className="w-full py-2 outline-none bg-transparent text-stone-800 font-medium text-sm sm:text-base"
              onChange={(e) => {
                setLocation(e.target.value);
                debouncedSuggestHotels(e.target.value);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                // Delay hiding dropdown to allow for clicks
                setTimeout(() => setShowDropdown(false), 200);
              }}
            />
             {showDropdown && (
    <>
      {/* Mobile: use portal */}
      <HotelSuggestionPortal>
        <div ref={dropdownRef} className="fixed top-[90px] left-0 right-0 mx-auto w-[95vw] max-w-md bg-white/95 backdrop-blur shadow-xl rounded-xl z-[9999] max-h-96 overflow-y-auto border border-gray-200 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 md:hidden"
          style={{ margin: '0 auto' }}
        >
          {searchLoading ? (
            <div className="p-4 text-center text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <span className="text-sm">Searching...</span>
            </div>
          ) : searchSuggestions.length > 0 ? (
            <div className="py-2">
              {searchSuggestions.map((suggestion, index) => {
                // Choose icon and description
                let icon = <FaHotel className="text-gray-400 w-5 h-5" />;
                let description = "Hotel";
                if (suggestion.type === 'city') {
                  icon = <FaCity className="text-blue-500 w-5 h-5" />;
                  description = `Area${suggestion.hotelCount ? ` • ${suggestion.hotelCount} hotel${suggestion.hotelCount !== '1' ? 's' : ''}` : ''}`;
                } else if (suggestion.type === 'resort') {
                  icon = <FaHome className="text-green-500 w-5 h-5" />;
                  description = "Resort";
                } else if (suggestion.type === 'homestay') {
                  icon = <FaHome className="text-yellow-500 w-5 h-5" />;
                  description = "Homestay";
                }
                // Try to extract city/state from displayName for hotels
                if (suggestion.type === 'hotel' && suggestion.displayName) {
                  const parts = suggestion.displayName.split(',');
                  if (parts.length > 1) {
                    description = `Hotel in ${parts.slice(-2).join(',').trim()}`;
                  }
                }
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 min-h-[56px] active:bg-gray-100 hover:bg-gray-50 transition-colors duration-150 touch-manipulation"
                    onClick={() => {
                      setArea(suggestion);
                      setLocation(suggestion.name);
                      setShowDropdown(false);
                    }}
                    onTouchStart={() => {
                      const element = event?.currentTarget as HTMLElement;
                      if (element) element.style.backgroundColor = '#f3f4f6';
                    }}
                    onTouchEnd={() => {
                      const element = event?.currentTarget as HTMLElement;
                      if (element) element.style.backgroundColor = '';
                    }}
                  >
                    <div className="flex-shrink-0 mt-1">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-black text-base leading-tight truncate">
                        {highlightText(suggestion.displayName || suggestion.name, location)}
                      </div>
                      <div className="text-xs text-gray-500 leading-tight truncate">
                        {description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : location.trim() && !searchLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="text-sm">No results found for &quot;{location}&quot;</div>
              <div className="text-xs mt-1">Try a different search term</div>
            </div>
          ) : null}
        </div>
      </HotelSuggestionPortal>
      {/* Desktop: render inline as before */}
      <div ref={dropdownRef} className="absolute top-full left-0 mt-1 w-full bg-white/95 backdrop-blur shadow-xl rounded-xl z-[70] max-h-96 overflow-y-auto border border-gray-200 md:max-w-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hidden md:block">
        {searchLoading ? (
          <div className="p-4 text-center text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <span className="text-sm">Searching...</span>
          </div>
        ) : searchSuggestions.length > 0 ? (
          <div className="py-2">
            {searchSuggestions.map((suggestion, index) => {
              // Choose icon and description
              let icon = <FaHotel className="text-gray-400 w-5 h-5" />;
              let description = "Hotel";
              if (suggestion.type === 'city') {
                icon = <FaCity className="text-blue-500 w-5 h-5" />;
                description = `Area${suggestion.hotelCount ? ` • ${suggestion.hotelCount} hotel${suggestion.hotelCount !== '1' ? 's' : ''}` : ''}`;
              } else if (suggestion.type === 'resort') {
                icon = <FaHome className="text-green-500 w-5 h-5" />;
                description = "Resort";
              } else if (suggestion.type === 'homestay') {
                icon = <FaHome className="text-yellow-500 w-5 h-5" />;
                description = "Homestay";
              }
              // Try to extract city/state from displayName for hotels
              if (suggestion.type === 'hotel' && suggestion.displayName) {
                const parts = suggestion.displayName.split(',');
                if (parts.length > 1) {
                  description = `Hotel in ${parts.slice(-2).join(',').trim()}`;
                }
              }
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 min-h-[56px] active:bg-gray-100 hover:bg-gray-50 transition-colors duration-150 touch-manipulation"
                  onClick={() => {
                    setArea(suggestion);
                    setLocation(suggestion.name);
                    setShowDropdown(false);
                  }}
                  onTouchStart={() => {
                    const element = event?.currentTarget as HTMLElement;
                    if (element) element.style.backgroundColor = '#f3f4f6';
                  }}
                  onTouchEnd={() => {
                    const element = event?.currentTarget as HTMLElement;
                    if (element) element.style.backgroundColor = '';
                  }}
                >
                  <div className="flex-shrink-0 mt-1">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-black text-base leading-tight truncate">
                      {highlightText(suggestion.displayName || suggestion.name, location)}
                    </div>
                    <div className="text-xs text-gray-500 leading-tight truncate">
                      {description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : location.trim() && !searchLoading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-sm">No results found for &quot;{location}&quot;</div>
            <div className="text-xs mt-1">Try a different search term</div>
          </div>
        ) : null}
      </div>
    </>
  )}
</div>
          {/* Check-in */}
          <div
            ref={checkInRef}
            className="relative w-full md:w-1/4 p-2 sm:p-3 bg-white/40 backdrop-blur rounded-xl shadow-neu-inset border-0"
          >
            <div onClick={() => setStep('date')}
              className="cursor-pointer">
              <label className="text-gray-500 text-xs font-semibold uppercase">Check-in</label>
              <div className="font-medium text-zinc-900">
                {format(state[0].startDate, "dd-MM-yyyy")}
              </div>
              <div className="text-sm text-gray-400">
                {format(state[0].startDate, "EEEE")}
              </div>
            </div>
          </div>

          {/* Check-out */}
          <div className="relative w-full md:w-1/4 p-2 sm:p-3 bg-white/40 backdrop-blur rounded-xl shadow-neu-inset border-0">
            <div onClick={() => setStep('date')}
              className="cursor-pointer">
              <label className="text-gray-500 text-xs font-semibold uppercase">Check-out</label>
              <div className="font-medium text-zinc-900">
                {format(state[0].endDate, "dd-MM-yyyy")}
              </div>
              <div className="text-sm text-gray-400">
                {format(state[0].endDate, "EEEE")}
              </div>
            </div>
          </div>

          {/* Rooms & Guests */}
          <div className="w-full md:w-1/4 p-2 sm:p-3 bg-white/40 backdrop-blur rounded-xl shadow-neu-inset border-0 relative">
            <button className="w-full text-left" onClick={() => setStep("room")}
            >
              <label className="text-gray-500 text-xs font-semibold uppercase">Rooms & Guests</label>
              <div className="font-medium text-zinc-900">
                {roomDetail.length} Room{roomDetail.length > 1 ? "s" : ""} & {totalGuests} Guest{totalGuests > 1 ? "s" : ""}
              </div>
            </button>
            {step === "room" && (
              <div ref={roomPickerRef} className="absolute top-full left-0 mt-1 w-full md:w-72 p-4 rounded-2xl bg-white z-[65] shadow-lg"
                style={{ maxHeight: '300px', overflowY: 'auto' }}
              >
                {roomDetail.map((room, index) => (
                  <div key={index} className="mb-4 pb-4 border-b last:border-b-0">
                    <div className="font-medium mb-2">Room {index + 1}</div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Adults</span>
                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 rounded-full border flex items-center justify-center bg-white/60 shadow-neu-inset"
                          onClick={() => {
                            const newRooms = [...roomDetail];
                            if (newRooms[index].adults > 1) {
                              newRooms[index].adults -= 1;
                              setRoomDetail(newRooms);
                            }
                          }}
                          disabled={room.adults <= 1}
                        >
                          -
                        </button>
                        <span className="w-4 text-center">{room.adults}</span>
                        <button
                          className="w-8 h-8 rounded-full border flex items-center justify-center bg-white/60 shadow-neu-inset"
                          onClick={() => {
                            const newRooms = [...roomDetail];
                            if (newRooms[index].adults < 3) {
                              newRooms[index].adults += 1;
                              setRoomDetail(newRooms);
                            }
                          }}
                          disabled={room.adults >= 3}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Children</span>
                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 rounded-full border flex items-center justify-center bg-white/60 shadow-neu-inset"
                          onClick={() => {
                            const newRooms = [...roomDetail];
                            if (newRooms[index].children > 0) {
                              newRooms[index].children -= 1;
                              newRooms[index].childAges.pop();
                              setRoomDetail(newRooms);
                            }
                          }}
                          disabled={room.children <= 0}
                        >
                          -
                        </button>
                        <span className="w-4 text-center">{room.children}</span>
                        <button
                          className="w-8 h-8 rounded-full border flex items-center justify-center bg-white/60 shadow-neu-inset"
                          onClick={() => {
                            const newRooms = [...roomDetail];
                            if (newRooms[index].children < 2) {
                              newRooms[index].children += 1;
                              newRooms[index].childAges.push(0); // default age 0
                              setRoomDetail(newRooms);
                            }
                          }}
                          disabled={room.children >= 2}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {/* Child age dropdowns */}
                    {room.children > 0 && (
                      <div className="mt-2">
                        {[...Array(room.children)].map((_, childIdx) => (
                          <div key={childIdx} className="flex items-center gap-2 mb-1">
                            <span>Child {childIdx + 1} Age:</span>
                            <select
                              className="border rounded px-2 py-1"
                              value={room.childAges[childIdx] ?? 0}
                              onChange={e => {
                                const newRooms = [...roomDetail];
                                newRooms[index].childAges[childIdx] = parseInt(e.target.value, 10);
                                setRoomDetail(newRooms);
                              }}
                            >
                              {Array.from({ length: 18 }, (_, i) => (
                                <option key={i} value={i}>{i}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                    {roomDetail.length > 1 && (
                      <button
                        className="text-red-500 text-xs mt-2"
                        onClick={() => {
                          setRoomDetail(roomDetail.filter((_, i) => i !== index));
                        }}
                      >
                        Remove Room
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="w-full bg-sky-600 text-white py-2 rounded-xl mt-2 shadow-neu-soft"
                  onClick={() => setRoomDetail([...roomDetail, { adults: 1, children: 0, childAges: [] }])}
                >
                  Add Room
                </button>
                <button
                  className="w-full bg-gray-300 text-gray-700 py-2 rounded-xl mt-2 shadow-neu-inset"
                  onClick={() => setStep(null)}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Date Picker */}
        {step === "date" && (
          <>
            {/* Overlay for mobile */}
            <div className="fixed inset-0 bg-black bg-opacity-30 z-45 md:hidden" onClick={() => setStep(null)} />
            {/* Date picker */}
            <div
              ref={datePickerRef}
              className={`
                block
                md:absolute md:z-50
                md:left-0 md:top-full
                md:mt-2
                md:w-[350px]
                md:shadow-neu-soft
                md:bg-white
                md:rounded-2xl
                fixed inset-0 flex items-center justify-center z-50 md:static md:flex-none
              `}
              style={step && checkInRef.current && window.innerWidth >= 768
                ? {
                    position: 'absolute',
                    left: checkInRef.current.getBoundingClientRect().left,
                    top: checkInRef.current.getBoundingClientRect().bottom + window.scrollY + 8,
                    width: 350,
                    zIndex: 50,
                  }
                : {}}
            >
              <div className="bg-white rounded-2xl p-2 md:p-4">
                <style>{`
                  .rdrDefinedRangesWrapper { display: none !important; }
                  .rdrCalendarWrapper { width: 100% !important; }
                `}</style>
                <DateRangePicker
                  ranges={state}
                  minDate={today}
                  onChange={(item) => {
                    let start = item.selection.startDate ?? today;
                    let end = item.selection.endDate ?? tomorrow;
                    if (start < today) start = today;
                    if (end <= start) {
                      end = new Date(start);
                      end.setDate(start.getDate() + 1);
                    }
                    setState([
                      {
                        startDate: start,
                        endDate: end,
                        key: "selection",
                      },
                    ]);
                  }}
                  showMonthArrow={true}
                  staticRanges={[]}
                  inputRanges={[]}
                  className="w-full"
                />
                <button
                  className="bg-sky-600 text-white py-1 px-4 rounded-xl mt-2 w-full md:w-auto shadow-neu-soft"
                  onClick={() => setStep(null)}
                >
                  Apply
                </button>
              </div>
            </div>
          </>
        )}

        {/* Search Button */}
        <div id="booknow" className="text-center mt-8">
          <button
            className="bg-gradient-to-br from-blue-500/80 to-fuchsia-600/80 text-white hover:from-fuchsia-600 hover:to-blue-500 active:scale-95 text-base uppercase font-semibold px-8 py-3 rounded-2xl active:scale-90 transition-all ease-in-out duration-200 w-full sm:w-auto shadow-neu-soft backdrop-blur-md"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </aside>
    </section>
  );
}
