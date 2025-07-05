const puppeteer = require('puppeteer');
const {
  parseDate,
  parseTime
} = require('../utils/common');

const generateInvoice = async (transaction) => {
  const {
    package: hotelPackage,
    guest,
    confirmed_at,
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
    coupon_discount,
    client_discount,
    service_component,
    gst,
    total_chargeable_amount,
    currency
  } = transaction.pricing;

  // Get base_amount from hotel package
  const base_amount = hotelPackage.base_amount || 0;

  const rate_currency = currency === "INR" ? '₹' : currency;

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
                    <p>Confirmed: ${parseDate(confirmed_at)} ${parseTime(confirmed_at)}</p>
                </div>
            </div>

            <!-- Guest Information -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-800 mb-4">Invoice</h1>
                <div class="bg-gray-100 p-6 rounded-lg">
                    <p class="font-semibold text-gray-700">${guest.first_name} ${guest.last_name}</p>
                    <p class="text-gray-600">${guest.contact_no}</p>
                    <p class="text-gray-600">${guest.email}</p>
                </div>
            </div>

            <!-- Hotel Details -->
            <div class="mb-8">
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">Booking Details</h2>
                <div class="bg-gray-100 p-6 rounded-lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p class="font-semibold text-gray-700">Hotel Name</p>
                            <p class="text-gray-600">${originalName}</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-700">Hotel Address</p>
                            <p class="text-gray-600">${location.address}<br>${location.city} ${location.postalCode}, ${location.country ? location.country : location.countryCode || ''}</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-700">Room Type</p>
                            <p class="text-gray-600">${hotelPackage.room_details.description}</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-700">Check-In</p>
                            <p class="text-gray-600">${parseDate(hotelPackage.check_in_date)} ${checkInTime}</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-700">Check-Out</p>
                            <p class="text-gray-600">${parseDate(hotelPackage.check_out_date)} ${checkOutTime}</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-700">No. of Rooms</p>
                            <p class="text-gray-600">${hotelPackage.room_count}</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-700">Payment Method</p>
                            <p class="text-gray-600">${transaction.payment_response.payment_mode}</p>
                        </div>
                        ${phone ? `<div>
                            <p class="font-semibold text-gray-700">Hotel Phone</p>
                            <p class="text-gray-600">${phone}</p>
                        </div>` : ''}
                        ${email ? `<div>
                            <p class="font-semibold text-gray-700">Hotel Email</p>
                            <p class="text-gray-600">${email}</p>
                        </div>` : ''}
                    </div>
                </div>
            </div>

            <!-- Pricing Details -->
            <div>
                <h2 class="text-2xl font-semibold text-gray-800 mb-4">Payment Details</h2>
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-gray-200">
                            <th class="py-3 px-4 text-left text-gray-700 font-semibold">Description</th>
                            <th class="py-3 px-4 text-right text-gray-700 font-semibold">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-t border-gray-200">
                            <td class="py-3 px-4">Base Amount</td>
                            <td class="py-3 px-4 text-right">${rate_currency} ${Math.ceil(base_amount)}</td>
                        </tr>
                        <tr class="border-t border-gray-200">
                            <td class="py-3 px-4">Discount</td>
                            <td class="py-3 px-4 text-right">- ${rate_currency} ${Math.ceil(client_discount || 0)}</td>
                        </tr>
                        <tr class="border-t border-gray-200">
                            <td class="py-3 px-4">Coupon Amount</td>
                            <td class="py-3 px-4 text-right">- ${rate_currency} ${Math.ceil(coupon_discount || 0)}</td>
                        </tr>
                        <tr class="border-t border-gray-200">
                            <td class="py-3 px-4">Service Charges</td>
                            <td class="py-3 px-4 text-right">+ ${rate_currency} ${Math.ceil(service_component || 0)}</td>
                        </tr>
                        <tr class="border-t border-gray-200">
                            <td class="py-3 px-4">GST @ 18% (including HR-SGST & CGST)</td>
                            <td class="py-3 px-4 text-right">+ ${rate_currency} ${Math.ceil(gst || 0)}</td>
                        </tr>
                        <tr class="border-t-2 border-gray-300">
                            <td class="py-3 px-4 font-bold">GRAND TOTAL</td>
                            <td class="py-3 px-4 text-right font-bold">${rate_currency} ${Math.ceil(total_chargeable_amount || 0)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Footer -->
            <div class="mt-8 text-gray-600 text-sm">
                <p>Total has been rounded off to the next rupee value</p>
                <p class="font-semibold">TripBazaar</p>
                <p>Registered Office: Dehradun 248001</p>
            </div>
        </div>
    </body>
    </html>
  `;

  // Convert invoice to PDF
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
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

module.exports = {
  generateInvoice
};