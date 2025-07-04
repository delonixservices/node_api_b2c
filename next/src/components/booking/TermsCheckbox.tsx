import React from "react";
import Link from "next/link";

const TermsCheckbox = React.memo(({ 
  checked, 
  onChange 
}: { 
  checked: boolean; 
  onChange: () => void 
}) => (
  <div className="my-4">
    <label className="flex items-start">
      <input
        className="w-5 h-5 mr-2 mt-0.5"
        type="checkbox"
        checked={checked}
        onChange={onChange}
        required
      />
      <span>
        I agree to the
        <button type="button" className="text-blue-600 mx-1">
          Hotel Booking Policy
        </button>
        ,
        <button type="button" className="text-blue-600 mx-1">
          Hotel Cancellation Policy
        </button>
        ,
        <Link href="/policy" className="text-blue-600 mx-1">
          Privacy Policy
        </Link>
        ,
        <Link href="/agreement" className="text-blue-600 mx-1">
          User Agreement
        </Link>{" "}
        &
        <Link href="/term" className="text-blue-600 mx-1">
          Terms of Service
        </Link>{" "}
        of TripBazaar
      </span>
    </label>
  </div>
));
TermsCheckbox.displayName = "TermsCheckbox";
export default TermsCheckbox; 