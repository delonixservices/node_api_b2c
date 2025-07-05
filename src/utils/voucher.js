const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const {
  parseFlightDuration
} = require('../utils/common');

const {
  parseDate,
  parseTime
} = require('../utils/common');

const generateVoucher = async (transaction) => {
  const {
    package: hotelPackage,
    guest,
    booking_id,
    confirmed_at,
    cancellation_policy
  } = transaction.book_response.data;

  const {
    originalName,
    location,
    imageDetails,
    policy,
    amenities,
    starRating,
    dailyRates
  } = transaction.hotel;

  const {
    checkInTime,
    checkOutTime,
    phone,
    email
  } = transaction.hotel.moreDetails;

  const {
    total_chargeable_amount,
    currency
  } = transaction.pricing;

  const rate_currency = currency === "INR" ? '₹' : currency;

  let cancellationPolicy = "";
  cancellation_policy.cancellation_policies.forEach((data) => {
    cancellationPolicy += `
    <tr class="border-t border-gray-200">
        <td class="py-3 px-4">${parseDate(data.date_from)}</td>
        <td class="py-3 px-4">${parseDate(data.date_to)}</td>
        <td class="py-3 px-4">${data.penalty_percentage}%</td>
    </tr>`;
  });

  const foodType = [
    "",
    "",
    ", Breakfast",
    ", Lunch",
    ", Dinner",
    ", Half Board: Could be any 2 meals (e.g. breakfast and lunch, lunch and dinner)",
    ", Full Board: Breakfast, lunch and dinner",
    ", All Inclusive"
  ];

  // Format amenities for display
  let amenitiesDisplay = "";
  if (amenities && amenities.length > 0) {
    amenitiesDisplay = amenities.slice(0, 8).join(", "); // Show first 8 amenities
    if (amenities.length > 8) {
      amenitiesDisplay += ` and ${amenities.length - 8} more`;
    }
  }

  // Format star rating
  let starRatingDisplay = "";
  if (starRating && starRating.value) {
    starRatingDisplay = `${starRating.value}★ ${starRating.text || ''}`;
  }

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body class="font-['Inter'] bg-gray-50">
        <div class="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-lg my-8">
            <!-- Header -->
            <div class="flex justify-between items-center border-b border-gray-200 pb-4 mb-8">
                <div class="flex items-center">
                    <img src="https://holidayz.tripbazaar.in/wp-content/uploads/2024/12/trip_bazar_logo-removebg-preview-1-e1735115088907.png" alt="TripBazaar Logo" class="h-12 mr-4">
                    <span class="text-2xl font-bold text-red-600">TripBazaar</span>
                </div>
                <div class="text-right text-gray-600">
                    <p class="font-semibold">Booking ID: <span class="text-gray-800">${transaction._id}</span></p>
                    <p>Booked on: ${parseDate(confirmed_at)} ${parseTime(confirmed_at)}</p>
                </div>
            </div>

            <!-- Main Content -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-800 mb-4">Booking Confirmed</h1>
                <p class="text-lg text-gray-700"><strong>Dear ${guest.first_name} ${guest.last_name},</strong></p>
                <p class="text-gray-600 mt-2">Thank you for choosing TripBazaar!</p>
                <p class="text-gray-600">Your hotel booking is confirmed. Your eTicket is attached with the email sent to you.</p>
            </div>

            <!-- Hotel Details -->
            <div class="flex flex-col md:flex-row gap-8 mb-8">
                <div class="md:w-1/2">
                    <img src="${imageDetails ? imageDetails.prefix : ''}0${imageDetails ? imageDetails.suffix : ''}" alt="Hotel Image" class="w-full h-64 object-cover rounded-lg shadow-md">
                </div>
                <div class="md:w-1/2">
                    <h2 class="text-2xl font-semibold text-gray-800">${originalName}</h2>
                    ${starRatingDisplay ? `<p class="text-yellow-600 font-semibold mt-1">${starRatingDisplay}</p>` : ''}
                    <p class="text-gray-600 mt-2">${location.address}<br>${location.city} ${location.postalCode}, ${location.country ? location.country : location.countryCode || ''}</p>
                    ${phone ? `<p class="text-gray-600 mt-2"><strong>Phone:</strong> ${phone}</p>` : ''}
                    ${email ? `<p class="text-gray-600 mt-2"><strong>Email:</strong> ${email}</p>` : ''}
                    ${amenitiesDisplay ? `<p class="text-gray-600 mt-2"><strong>Amenities:</strong> ${amenitiesDisplay}</p>` : ''}
                </div>
            </div>

            <!-- Other Information -->
            <div class="bg-gray-100 p-6 rounded-lg mb-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p class="font-semibold text-gray-700">Guest Name</p>
                        <p class="text-gray-600">${guest.first_name} ${guest.last_name}</p>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-700">Hotel Booking ID</p>
                        <p class="text-gray-600">${booking_id}</p>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-700">Check In</p>
                        <p class="text-gray-600">${parseDate(hotelPackage.check_in_date)} ${checkInTime}</p>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-700">Check Out</p>
                        <p class="text-gray-600">${parseDate(hotelPackage.check_out_date)} ${checkOutTime}</p>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-700">Room Type</p>
                        <p class="text-gray-600">${hotelPackage.room_details.description}</p>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-700">Total Amount</p>
                        <p class="text-gray-600">${rate_currency} ${Math.ceil(total_chargeable_amount)}</p>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-700">Refund Policy</p>
                        <p class="text-gray-600">${hotelPackage.room_details.non_refundable === false ? "Refundable" : "Non Refundable"}</p>
                    </div>
                </div>
            </div>

            <!-- Room Details -->
            <div>
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">Room Details</h2>
                <div class="border-t border-gray-200">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div>
                            <p class="font-semibold text-gray-700">Number of Guests</p>
                            <p class="text-gray-600">Room - ${hotelPackage.room_count} : Adults - ${hotelPackage.adult_count}, Child - ${hotelPackage.child_count}</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-700">Inclusions</p>
                            <p class="text-gray-600">Accommodation${foodType[hotelPackage.room_details.food]}</p>
                        </div>
                    </div>
                    <div class="py-4">
                        <p class="font-semibold text-gray-700 mb-2">Cancellation Policy</p>
                        <table class="w-full border-collapse">
                            <thead>
                                <tr class="bg-gray-200">
                                    <th class="py-3 px-4 text-left text-gray-700">Date From</th>
                                    <th class="py-3 px-4 text-left text-gray-700">Date To</th>
                                    <th class="py-3 px-4 text-left text-gray-700">Penalty %</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cancellationPolicy}
                            </tbody>
                        </table>
                        <p class="text-sm text-gray-500 mt-2">${cancellation_policy.remarks}</p>
                    </div>
                    <div class="py-4">
                        <p class="font-semibold text-gray-700">Hotel Policy</p>
                        <p class="text-gray-600">${policy || 'Standard hotel policies apply. Please contact the hotel directly for specific policy details.'}</p>
                    </div>
                    <div class="py-4">
                        <p class="text-sm text-red-600"><strong>***NOTE***</strong>: Any increase in the price due to taxes will be borne by you and payable at the hotel.</p>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  // Convert voucher to PDF
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
    headless: true
  });

  const page = await browser.newPage();
  await page.setContent(content);
  const buffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      left: '0px',
      top: '40px',
      right: '0px',
      bottom: '40px'
    }
  });
  await browser.close();
  return buffer;
}

const generateFlightVoucher = async (transaction) => {
  let data;
  if (transaction.order_doc_issue_response && transaction.order_doc_issue_response.Response.TicketDocInfos) {
    data = transaction.order_doc_issue_response.Response;
  } else {
    data = transaction.order_create_response.Response;
  }

  let passengerRef = [];
  if (!Array.isArray(data.DataLists.PassengerList.Passenger)) {
    passengerRef[0] = data.DataLists.PassengerList.Passenger;
  } else {
    passengerRef = data.DataLists.PassengerList.Passenger;
  }

  let orderItems = [];
  if (!Array.isArray(data.Order.OrderItems.OrderItem)) {
    orderItems[0] = data.Order.OrderItems.OrderItem;
  } else {
    orderItems = data.Order.OrderItems.OrderItem;
  }

  let totalBaseAmount = 0;
  let totalTaxes = 0;

  orderItems.forEach((el) => {
    totalBaseAmount += el.FareDetail.Price.BaseAmount.content;
    totalTaxes += el.FareDetail.Price.TotalAmount.DetailCurrencyPrice.Taxes.Total.content;
  });

  const totalAmount = data.Order.TotalOrderPrice.DetailCurrencyPrice.Total.content;

  const segmentList = data.DataLists.FlightSegmentList.FlightSegment;

  let flightSegmentList = [];

  if (Array.isArray(segmentList)) {
    flightSegmentList = segmentList;
  } else {
    flightSegmentList[0] = segmentList;
  }

  const flightSegments = [];

  flightSegmentList.forEach((flightSegment) => {
    const flightSegmentsObj = {
      airlineName: flightSegment.MarketingCarrier.Name,
      airlineId: flightSegment.MarketingCarrier.AirlineID,
      flightNo: flightSegment.MarketingCarrier.FlightNumber,
      duration: parseFlightDuration(flightSegment.FlightDetail.FlightDuration.Value),
      arrival: {
        airportCode: flightSegment.Arrival.AirportCode,
        airportName: flightSegment.Arrival.AirportName,
        date: flightSegment.Arrival.Date,
        time: flightSegment.Arrival.Time
      },
      departure: {
        airportCode: flightSegment.Departure.AirportCode,
        airportName: flightSegment.Departure.AirportName,
        date: flightSegment.Departure.Date,
        time: flightSegment.Arrival.Time
      }
    }
    flightSegments.push(flightSegmentsObj);
  });

  const PNR = data.Order.BookingReferences.BookingReference[0].ID;

  let ticketDocInfo = [];
  if (!Array.isArray(data.TicketDocInfos.TicketDocInfo)) {
    ticketDocInfo[0] = data.TicketDocInfos.TicketDocInfo;
  } else {
    ticketDocInfo = data.TicketDocInfos.TicketDocInfo;
  }

  const bookingDate = ticketDocInfo[0].TicketDocument.DateOfIssue;

  const formatedBookingDate = moment(bookingDate).format('Do MMMM YYYY, dddd');

  const passengers = [];

  passengerRef.forEach((el) => {
    const ticketDoc = ticketDocInfo.filter((doc) => doc.PassengerReference === el.PassengerID)[0];
    const ticketDocNbr = ticketDoc.TicketDocument.TicketDocNbr;
    const passenger = {
      'firstName': el.Individual.GivenName,
      'lastName': el.Individual.Surname,
      'ticketDocNbr': ticketDocNumber,
    }
    passengers.push(passenger);
  });

  const base64Img = fs.readFileSync(path.join(__dirname, '../../public/logo.png'), 'base64');

  const dataObj = {
    'bookingId': transaction._id,
    'passengers': passengers,
    'baseAmount': totalBaseAmount,
    'totalTaxes': totalTaxes,
    'totalAmount': totalAmount,
    'PNR': PNR,
    'flightSegments': flightSegments,
    'logoUrl': `data:image/png;base64,${base64Img}`,
    'bookingDate': formatedBookingDate
  }

  const file = fs.readFileSync(path.join(__dirname, '../views/flightVoucher.hbs'), 'utf-8');

  const template = handlebars.compile(file);

  const html = template(dataObj);

  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
    headless: true
  });

  const page = await browser.newPage();
  await page.setContent(html);
  const buffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      left: '0px',
      top: '40px',
      right: '0px',
      bottom: '40px'
    }
  });
  await browser.close();
  return buffer;
}

module.exports = {
  generateVoucher,
  generateFlightVoucher
}