const Coupon = require('../../models/Coupon');
const User = require('../../models/User');
const HotelTransaction = require('../../models/HotelTransaction');

/**
 * Get dashboard statistics and metrics
 * Made by: Amber Bisht
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 * @description Retrieves comprehensive dashboard data including user counts, coupon counts,
 * transaction statistics, and booking metrics. Uses parallel processing for efficient data fetching.
 * @returns {Object} Dashboard statistics including:
 *   - totalUsers: Total number of registered users
 *   - totalCoupons: Total number of active coupons
 *   - totalHotelTransactions: Total number of hotel transactions
 *   - totalMoney: Total revenue from successful bookings
 *   - totalBookingsWithStatus1: Count of successful bookings
 *   - avgPrice: Average booking price
 */
exports.getDashboardData = async (req, res, next) => {
  try {
    // Fetch all counts and aggregations in parallel
    const [totalUsers, totalCoupons, totalHotelTransactions, bookingStats] = await Promise.all([
      User.countDocuments(), // Count all users
      Coupon.countDocuments(), // Count all coupons
      HotelTransaction.countDocuments(), // Count all hotel transactions
      HotelTransaction.aggregate([
        {
          $match: { status: 1 } // Only include bookings where status is 1
        },
        {
          $group: {
            _id: null, // Group all matching documents
            totalAmount: { $sum: "$pricing.total_chargeable_amount" }, // Sum up the amounts
            avgPrice: { $avg: "$pricing.total_chargeable_amount" }, // Calculate average price
            count: { $sum: 1 } // Count the total number of bookings
          }
        }
      ])
    ]);

    // Extract booking stats or set defaults
    const totalMoney = bookingStats[0]?.totalAmount || 0;
    const avgPrice = bookingStats[0]?.avgPrice || 0;
    const totalBookingsWithStatus1 = bookingStats[0]?.count || 0;

    // Respond with the dashboard data
    res.json({
      status: 200,
      data: {
        totalUsers,
        totalCoupons,
        totalHotelTransactions,
        totalMoney,
        totalBookingsWithStatus1,
        avgPrice
      }
    });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
};


// new api