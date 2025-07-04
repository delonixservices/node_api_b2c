import React from "react";

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

const formatCurrency = (amount: number | undefined | null, currency: string = 'INR'): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currency} 0.00`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const HotelPolicy = React.memo(({ policy }: { policy: Policy }) => {
  const currency = policy.package.client_commission_currency || 'INR';
  const {
    base_amount = 0,
    service_component = 0,
    gst = 0
  } = policy.package;

  // Calculate total as base_amount + gst + service_component
  const totalAmount = base_amount + gst + service_component;

  return (
    <div className="bg-white border rounded-md p-4 mt-6">
      <div className="py-3">
        <h4 className="text-xl font-semibold mb-2">
          Hotel Policies you should know
        </h4>
        <hr className="my-2" />
        
        {/* Package Details */}
        <div className="mb-4">
          <h5 className="font-semibold mb-2">Package Details:</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <p>Base Amount: {formatCurrency(base_amount, currency)}</p>
            <p>Service Charge: {formatCurrency(service_component, currency)}</p>
            <p>GST: {formatCurrency(gst, currency)}</p>
            <p className="md:col-span-2 font-semibold">
              Total Amount: {formatCurrency(totalAmount, currency)}
            </p>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="mb-4">
          <h5 className="font-semibold mb-2">Cancellation Policy:</h5>
          {policy.cancellation_policy.remarks && (
            <p className="mb-3">{policy.cancellation_policy.remarks}</p>
          )}
          {policy.cancellation_policy.cancellation_policies.map((policy, index) => (
            <p key={index} className="mb-2">
              {policy.penalty_percentage > 0 ? (
                `Cancellations made between ${new Date(policy.date_from).toLocaleDateString()} and ${new Date(policy.date_to).toLocaleDateString()} will incur a ${policy.penalty_percentage}% penalty.`
              ) : (
                `Free cancellation available until ${new Date(policy.date_to).toLocaleDateString()}.`
              )}
            </p>
          ))}
        </div>

        {/* Hotel Fees */}
        <div>
          <h5 className="font-semibold mb-2">Hotel Fees:</h5>
          {policy.hotel_fees && Object.entries(policy.hotel_fees).map(([feeName, feeDetails]) => (
            <p key={feeName} className="mb-1">
              {feeName}: {formatCurrency(feeDetails.value, feeDetails.currency)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
});

HotelPolicy.displayName = "HotelPolicy";

export default HotelPolicy;