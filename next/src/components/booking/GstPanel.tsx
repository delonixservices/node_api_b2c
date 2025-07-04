import React from "react";

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

const GstPanel = React.memo(({
  gstDetail,
  onGstChange,
  onClose,
  onSubmit
}: {
  gstDetail: GstDetail;
  onGstChange: (data: Partial<GstDetail>) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
    <div className="bg-white w-full md:w-96 h-full p-6 overflow-y-auto animate-slide-in-right">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold">GST Details</h4>
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <span className="text-2xl">×</span>
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
              placeholder="GST Number"
              value={gstDetail.gstnumber}
              onChange={(e) => onGstChange({ gstnumber: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
              placeholder="Name"
              value={gstDetail.name}
              onChange={(e) => onGstChange({ name: e.target.value })}
            />
          </div>
          <div>
            <input
              type="email"
              className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
              placeholder="Email"
              value={gstDetail.email}
              onChange={(e) => onGstChange({ email: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
              placeholder="Address"
              value={gstDetail.address}
              onChange={(e) => onGstChange({ address: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
              placeholder="City"
              value={gstDetail.city}
              onChange={(e) => onGstChange({ city: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
              placeholder="Pincode"
              value={gstDetail.pincode}
              onChange={(e) => onGstChange({ pincode: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
              placeholder="State"
              value={gstDetail.state}
              onChange={(e) => onGstChange({ state: e.target.value })}
            />
          </div>
          <div>
            <input
              type="tel"
              className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
              placeholder="Phone number"
              minLength={10}
              maxLength={10}
              pattern="[0-9]{10}"
              value={gstDetail.mobile}
              onChange={(e) => onGstChange({ mobile: e.target.value })}
            />
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md"
          >
            Add GST Details
          </button>
        </div>

        <p className="mt-4 text-sm">
          <b>Please Note:</b> Your taxes may get updated post submitting
          your GST details. Please review the final amount in Fare
          Details.
        </p>
      </form>
    </div>
  </div>
));
GstPanel.displayName = "GstPanel";
export default GstPanel; 