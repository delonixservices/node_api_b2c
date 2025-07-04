export default function FlightSearch() {
  return (
    <section className="bg-[url('/images/flight.jpg')] bg-cover bg-center py-16">
      <aside className="container mx-auto bg-white bg-opacity-95 p-4 rounded-lg shadow-lg">
        <div className="flex justify-start mb-4">
          <label className="mr-4">
            <input
              type="radio"
              name="tripType"
              value="oneWay"
              className="mr-2"
            />
            One Way
          </label>
          <label>
            <input
              type="radio"
              name="tripType"
              value="roundTrip"
              className="mr-2"
            />
            Round Trip
          </label>
        </div>
        <div className="flex flex-wrap location">
          <div className="w-full md:w-1/4 px-0">
            <div className="form-control">
              <label htmlFor="fromLocation">From</label>
              <input
                type="text"
                id="fromLocation"
                placeholder="Enter city or airport"
              />
            </div>
            {/* <HotelAutosuggest onSelectedAreaChange={selectedAreaChanged} /> */}
          </div>

          <div className="w-full md:w-1/4 px-0">
            <div>
              <div id="checkindate">
                <div id="checkInStatus">CHECK-IN</div>
                <div id="checkInDate">{"formatDate(fromDate)"}</div>
                <div id="checkInDay">{"fromDay"}</div>
              </div>

              <div className="hidden md:block">
                {/* <NgbDatepicker
            ref={dp}
            onSelect={onDateSelection}
            displayMonths={2}
            dayTemplate={t}
            outsideDays="hidden"
            className={!showDatePicker ? "hidden" : ""}
              /> */}
              </div>
              <div className="md:hidden">
                {/* <NgbDatepicker
            ref={dp}
            onSelect={onDateSelection}
            displayMonths={1}
            dayTemplate={t}
            outsideDays="hidden"
            className={!showDatePicker ? "hidden" : ""}
              /> */}
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/4 px-0">
            <div>
              <div id="checkoutdate">
                <div id="checkOutStatus">CHECK-OUT</div>
                <div id="checkOutDate">{"formatDate(toDate)"}</div>
                <div id="checkOutDay">{"toDay"}</div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/4 px-0">
            <div className="hidden md:block">
              <div
              // ref={guestDropdown}
              // className="form-control customDropdown"
              // autoClose="outside"
              >
                <div className="customDropdownToggle">
                  <div className="dropdown_header">Rooms & Guests</div>
                  <div>
                    {/* {roomdetail.length} Room{roomdetail.length > 1 ? "s" : ""} &{" "}
                {guests} Guest{guests > 1 ? "s" : ""} */}
                  </div>
                  <div
                    className="select_room-menu ml-auto px-3"
                    aria-labelledby="hotel-menu"
                  >
                    {/* <HotelSelectGuests
                roomdetail={roomdetail}
                guests={guests}
                onGuestsChange={onGuestsChange}
                onRoomdetailChange={onRoomdetailChange}
                onApplyClicked={() => guestDropdown.close()}
              /> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="md:hidden">
              <div
                className="form-control customDropdown"
                // onClick={() => openModal(selectGuestModal)}
              >
                <div className="dropdown_header">Rooms & Guests</div>
                <div>
                  {/* {roomdetail.length} Room{roomdetail.length > 1 ? "s" : ""} &{" "}
              {guests} Guest{guests > 1 ? "s" : ""} */}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full text-center pt-3">
            <button
              type="button"
              tabIndex={12}
              // onClick={onSearchClicked}
              className="btn hotel_search-btn"
            >
              Search
            </button>
          </div>

          {/* <ng-template ref={selectGuestModal} let-modal> */}
          <div className="modal-header">
            <h4 className="modal-title" id="modal-basic-title">
              Rooms and Guests
            </h4>
            <button
              type="button"
              className="close"
              aria-label="Close"
              // onClick={() => modal.dismiss("Cross click")}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {/* <HotelSelectGuests
              roomdetail={roomdetail}
              guests={guests}
              onGuestsChange={onGuestsChange}
              onRoomdetailChange={onRoomdetailChange}
              onApplyClicked={() => modal.dismiss()}
            /> */}
          </div>
          {/* </ng-template> */}
        </div>
      </aside>
    </section>
  );
}
