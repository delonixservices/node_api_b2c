import { Suspense } from "react";
import SearchPage from "./searchPg";

export default function HotelSearchPage() {
  return (
    <Suspense
    fallback={
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    }
  >
      <SearchPage />
    </Suspense>
  );
}
