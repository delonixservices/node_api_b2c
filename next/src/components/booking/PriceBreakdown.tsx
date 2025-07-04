import React, { useState, useEffect } from "react";
import { PiCurrencyInrDuotone } from "react-icons/pi";
import { RiCloseLargeFill } from "react-icons/ri";
import { FaGift } from "react-icons/fa";
import { validateCouponFormat } from "../../utils/errorUtils";

interface CouponCode {
  value: number;
  type: string;
  name: string;
}

interface GlobalCoupon {
  _id: string;
  name: string;
  code: string;
  value: string;
  type: string;
  from: string;
  to: string;
  product: string;
}

const PriceBreakdown = React.memo(({ 
  baseAmount, 
  serviceCharge, 
  gst, 
  couponCode,
  onAddGst,
  onApplyCoupon,
  onRemoveCoupon,
  couponError,
}: {
  baseAmount: number;
  serviceCharge: number;
  gst: number;
  couponCode: CouponCode;
  onAddGst: () => void;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  couponError?: string;
}) => {
  console.log('Base Amount:', baseAmount);
  console.log('GST:', gst);
  console.log('Service Charge:', serviceCharge);

  const [coupon, setCoupon] = useState("");
  const [couponValidation, setCouponValidation] = useState("");
  const [globalCoupons, setGlobalCoupons] = useState<GlobalCoupon[]>([]);
  const [showGlobalCoupons, setShowGlobalCoupons] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Fetch global coupons
  const fetchGlobalCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/coupons/global`);
      const result = await response.json();
      
      if (result.status === 200 && result.data) {
        // Filter out expired coupons
        const validCoupons = result.data.filter((coupon: GlobalCoupon) => {
          const expireTime = new Date(coupon.to).getTime();
          const isExpired = Date.now() > expireTime;
          return !isExpired;
        });
        setGlobalCoupons(validCoupons);
      }
    } catch (error) {
      console.error('Error fetching global coupons:', error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchGlobalCoupons();
  }, []);

  const handleApplyCoupon = () => {
    if (!coupon) {
      setCouponValidation("Please enter coupon code");
      return;
    }

    // Use the validation utility for better client-side validation
    const validation = validateCouponFormat(coupon);
    if (!validation.isValid) {
      setCouponValidation(validation.error!);
      return;
    }

    onApplyCoupon(coupon);
    setCouponValidation("");
  };

  const handleApplyGlobalCoupon = (couponCode: string) => {
    onApplyCoupon(couponCode);
    setShowGlobalCoupons(false);
  };

  return (
    <div className="bg-white/60 backdrop-blur-md border-0 rounded-2xl p-6 shadow-neu-soft">
      <h6 className="font-semibold mb-4 text-lg text-stone-700">Price Breakup</h6>

      <div className="flex justify-between items-center mb-2">
        <div className="text-base font-medium text-stone-700">1 Room x 1 Night</div>
        <div className="flex items-center">
          <h5 className="font-semibold text-stone-700 text-2xl flex items-center">
            <PiCurrencyInrDuotone />
            {baseAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </h5>
        </div>
      </div>

      <div className="flex justify-between text-sm text-stone-600 mb-2">
        <div>Base Price</div>
        <div className="flex items-center">
          <PiCurrencyInrDuotone />
          {baseAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </div>
      </div>

      {couponCode.value !== 0 && (
        <div className="flex justify-between text-sm mb-2 text-green-600 font-semibold">
          <div className="flex items-center">Total Discount <span className="ml-1 text-xs text-gray-400">ⓘ</span></div>
          <div className="flex items-center">
            <PiCurrencyInrDuotone />
            {couponCode.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
        </div>
      )}

      <hr className="my-3 border-stone-200/60" />

      <div className="flex justify-between text-sm text-stone-600 mb-2">
        <div className="relative flex items-center group">
          Taxes & Service Fees <span className="ml-1 text-xs text-gray-400 cursor-pointer">ⓘ</span>
          <div className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-gray-800 text-white text-sm rounded py-2 px-3 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            GST: {gst.toLocaleString("en-IN", { maximumFractionDigits: 0 })}<br/>Service Charge: {serviceCharge.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="flex items-center">
          <PiCurrencyInrDuotone />
          {(gst + serviceCharge).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </div>
      </div>

      <hr className="my-3 border-stone-200/60" />

      <div className="flex justify-between">
        <div>
          <h5 className="font-semibold text-stone-700">Total Amount to be paid</h5>
        </div>
        <div className="text-right">
          <h5 className="font-semibold mb-0 flex items-center text-fuchsia-700 text-2xl">
            <PiCurrencyInrDuotone />
            {((baseAmount - couponCode.value) + (gst + serviceCharge)).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </h5>
        </div>
      </div>

      <div className="text-right mt-3">
        <button
          type="button"
          onClick={onAddGst}
          className="text-fuchsia-700 hover:text-blue-600 cursor-pointer text-sm font-medium transition-all ease-in-out bg-white/40 px-3 py-1 rounded-lg shadow-neu-inset"
        >
          Add your GST Details
        </button>
        <small className="text-gray-500 text-xs ml-1">(Optional)</small>
      </div>

      <hr className="my-3 border-stone-200/60" />

      {/* Global Coupons Section - always visible */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h6 className="font-semibold text-stone-700 flex items-center gap-2">
            <FaGift className="text-fuchsia-600" />
            Available Offers
          </h6>
          {globalCoupons.length > 0 && (
            <button
              type="button"
              onClick={() => setShowGlobalCoupons(!showGlobalCoupons)}
              className="text-fuchsia-700 hover:text-blue-600 text-sm font-medium transition-all ease-in-out"
            >
              {showGlobalCoupons ? 'Hide' : 'View'} ({globalCoupons.length})
            </button>
          )}
        </div>
        {loadingCoupons ? (
          <div className="text-center py-2 text-gray-500">Loading offers...</div>
        ) : globalCoupons.length > 0 ? (
          showGlobalCoupons && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {globalCoupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="bg-gradient-to-r from-fuchsia-50 to-blue-50 border border-fuchsia-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => handleApplyGlobalCoupon(coupon.code)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h6 className="font-semibold text-stone-700 text-sm">{coupon.name}</h6>
                      <p className="text-xs text-gray-600 mt-1">
                        {coupon.type === 'Percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Valid till: {new Date(coupon.to).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="bg-fuchsia-600 text-white text-xs px-2 py-1 rounded font-mono">
                        {coupon.code}
                      </div>
                      <button
                        type="button"
                        className="text-fuchsia-700 hover:text-blue-600 text-xs mt-1 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyGlobalCoupon(coupon.code);
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-gray-500 text-sm bg-gray-50 rounded p-3 border border-gray-100">No available offers at this time.</div>
        )}
      </div>

      <h6 className="font-semibold">Have a Promo Code?</h6>

      {!couponCode.name ? (
        <>
          {/* Display validation errors ABOVE the input */}
          {(couponValidation || couponError) && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {couponError || couponValidation}
              </p>
            </div>
          )}
          <div className="flex mt-2 w-full">
            <div className="w-[calc(100%-80px)]">
              <input
                type="text"
                className={`px-3 py-2 border-0 bg-white/40 backdrop-blur rounded-l-lg w-full outline-none text-sm focus:ring-2 focus:ring-fuchsia-200 shadow-neu-inset ${
                  (couponValidation || couponError) ? 'ring-2 ring-red-200 bg-red-50/40' : ''
                }`}
                placeholder="Enter your coupon code"
                value={coupon}
                onChange={(e) => {
                  setCoupon(e.target.value);
                  // Clear validation errors when user starts typing
                  if (couponValidation) setCouponValidation("");
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyCoupon();
                  }
                }}
              />
            </div>
            <button
              type="button"
              className="bg-gradient-to-br from-blue-500 to-fuchsia-600 hover:from-fuchsia-600 hover:to-blue-500 text-white py-2 rounded-r-lg w-20 shadow-neu-soft transition-all duration-200"
              onClick={handleApplyCoupon}
            >
              Apply
            </button>
          </div>
        </>
      ) : (
        <div className="bg-green-50/60 border border-green-200 rounded text-sm px-3 py-2 mt-3 flex justify-between items-center shadow-neu-inset">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="text-green-800 font-medium">{couponCode.name}</span>
            <span className="text-green-600 text-xs">Applied successfully!</span>
          </div>
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Remove coupon"
          >
            <RiCloseLargeFill />
          </button>
        </div>
      )}
    </div>
  );
});
PriceBreakdown.displayName = "PriceBreakdown";

export default PriceBreakdown; 