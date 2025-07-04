import React from "react";

interface ContactDetail {
  name: string;
  last_name: string;
  mobile: string;
  email: string;
}

const ContactDetailsForm = React.memo(({
  contactDetail,
  onContactChange,
  validation
}: {
  contactDetail: ContactDetail;
  onContactChange: (data: Partial<ContactDetail>) => void;
  validation: string;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <input
        type="text"
        className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
        placeholder="First Name"
        value={contactDetail.name}
        onChange={(e) => onContactChange({ name: e.target.value })}
        required
      />
    </div>
    <div>
      <input
        type="text"
        className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
        placeholder="Last Name"
        value={contactDetail.last_name}
        onChange={(e) => onContactChange({ last_name: e.target.value })}
        required
      />
    </div>
    <div>
      <input
        type="tel"
        className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
        placeholder="Phone"
        minLength={10}
        maxLength={10}
        pattern="[0-9]{10}"
        value={contactDetail.mobile}
        onChange={(e) => onContactChange({ mobile: e.target.value })}
        required
      />
    </div>
    <div>
      <input
        type="email"
        className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
        placeholder="Email"
        value={contactDetail.email}
        onChange={(e) => onContactChange({ email: e.target.value })}
        required
      />
    </div>
    {validation && (
      <div className="col-span-2 text-red-500 mt-2">{validation}</div>
    )}
  </div>
));

ContactDetailsForm.displayName = "ContactDetailsForm";
export default ContactDetailsForm; 