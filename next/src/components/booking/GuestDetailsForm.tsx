import React, { Fragment } from "react";

interface Guest {
  firstname: string;
  lastname: string;
  mobile: string;
}

interface RoomGuest {
  room_guest: Guest[];
}

const GuestDetailsForm = React.memo(({
  guest,
  onGuestChange
}: {
  guest: RoomGuest[];
  onGuestChange: (newGuest: RoomGuest[]) => void;
}) => (
  <Fragment>
    {guest.map((room, i) => (
      <div className="mt-4" key={i}>
        <div>
          {room.room_guest.map((guestDetail, j) => (
            <div key={j} className="mt-3">
              <h6 className="pb-2 text-stone-700 text-sm font-medium">
                Guest {j + 1} Details
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
                    placeholder="First Name"
                    value={guestDetail.firstname}
                    onChange={(e) => {
                      const newGuest = [...guest];
                      newGuest[i].room_guest[j].firstname = e.target.value;
                      onGuestChange(newGuest);
                    }}
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
                    placeholder="Last Name"
                    value={guestDetail.lastname}
                    onChange={(e) => {
                      const newGuest = [...guest];
                      newGuest[i].room_guest[j].lastname = e.target.value;
                      onGuestChange(newGuest);
                    }}
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400"
                    placeholder="Mobile"
                    minLength={10}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={guestDetail.mobile}
                    onChange={(e) => {
                      const newGuest = [...guest];
                      newGuest[i].room_guest[j].mobile = e.target.value;
                      onGuestChange(newGuest);
                    }}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </Fragment>
));

GuestDetailsForm.displayName = "GuestDetailsForm";
export default GuestDetailsForm; 