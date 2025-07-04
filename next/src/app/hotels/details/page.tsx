import { Suspense } from "react";
import HotelDetailsClient from "./HotelDetailsClient";

export default function HotelDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      }
    >
      <HotelDetailsClient />
    </Suspense>
  );
}
