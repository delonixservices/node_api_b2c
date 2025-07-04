class DailyRates {
  highest!: number;
  lowest!: number;
}

export class Location {
  address!: string;
  city!: string;
  country!: string;
  latLng!: { lng: number; lat: number };
}

class MoreDetails {
  destinationIds!: string[];
  approximateCost!: number;
  website!: string;
  chainCode!: number;
  checkInTime!: string;
  payments!: string[];
  description!: string;
  regionIds!: string[];
  checkOutTime!: string;
  phone!: string;
  airportCode!: string;
  fax!: string;
  categoryId!: string;
  email!: string;
}

class MoreRatings {
  tripAdvisor!: { reviewCount: number; rating: number };
  rating!: number;
  reviewCount!: number;
  trustYou!: { reviewCount: number; rating: number };
}

class RoomDetails {
  supplier_description!: string;
  room_code!: number;
  room_view!: string;
  description!: string;
  rate_plan_code!: number;
  non_refundable!: boolean;
  food!: string;
  room_type!: string;
}

class Package {
  chargeable_rate!: number;
  room_details!: RoomDetails;
  booking_key!: string;
  room_rate!: number;
  client_commission!: number;
  guest_discount_percentage!: number;
  _id!: string;
  base_amount!: number;
  service_component!: number;
  gst!: number;
  room_rate_currency?: string;
  chargeable_rate_currency?: string;
}

class ImageDetails {
  images!: string[];
  prefix!: string;
  count!: number;
  suffix!: string;
}

export class Hotel {
  _id!: string;
  amenities!: string[];
  dailyRates!: DailyRates;
  created_at!: string;
  hotelId!: string;
  id!: string;
  location!: Location;
  moreDetails!: MoreDetails;
  moreRatings!: MoreRatings;
  name!: string;
  originalName!: string;
  images!: string[];               // <-- Added based on your HotelTab usage
  imageDetails?: ImageDetails;     // <-- Added imageDetails for API response
  rates!: { packages: Package[] };
  starRating!: number;
  reviewCount?: number;             // <-- Added reviewCount (optional)
  checkindate?: string;             // <-- Added checkindate (optional)
  checkoutdate?: string;            // <-- Added checkoutdate (optional)
  details!: { room: string; adult_count: number }[]; // <-- Added details
  transaction_identifier?: string; // <-- Added transaction_identifier
  policy?: string;                  // <-- Added policy
  __v?: number;                     // <-- Added __v
  updated_at?: string;              // <-- Added updated_at
  searchPage?: number;              // <-- Added searchPage to track which API page this hotel came from
}

export class HotelSearchInfo {
  location!: string;
  checkInDate!: Date;
  checkOutDate!: Date;
  guests!: number;
  rooms!: number;
}

export class HotelSuggestion {
  name!: string;
  id!: string;
  type!: string;
  transaction_identifier!: string;
  displayName!: string;
  hotelCount?: string;
}
