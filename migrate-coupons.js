const mongoose = require('mongoose');
const Coupon = require('./src/models/Coupon');

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name';

async function migrateCoupons() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all coupons that don't have the isGlobal field
    const couponsWithoutIsGlobal = await Coupon.find({
      isGlobal: { $exists: false }
    });

    console.log(`Found ${couponsWithoutIsGlobal.length} coupons without isGlobal field`);

    if (couponsWithoutIsGlobal.length > 0) {
      // Update all existing coupons to have isGlobal: false
      const result = await Coupon.updateMany(
        { isGlobal: { $exists: false } },
        { $set: { isGlobal: false } }
      );

      console.log(`Updated ${result.modifiedCount} coupons with isGlobal: false`);
    }

    // Set specific coupons as global (you can modify this list)
    const globalCouponCodes = ['amber_op', 'DIWALI']; // Add the coupon codes you want to make global
    
    if (globalCouponCodes.length > 0) {
      const globalResult = await Coupon.updateMany(
        { code: { $in: globalCouponCodes } },
        { $set: { isGlobal: true } }
      );

      console.log(`Set ${globalResult.modifiedCount} coupons as global: ${globalCouponCodes.join(', ')}`);
    }

    // Verify the update
    const allCoupons = await Coupon.find({});
    console.log(`Total coupons in database: ${allCoupons.length}`);
    
    const globalCoupons = await Coupon.find({ isGlobal: true });
    console.log(`Global coupons: ${globalCoupons.length}`);
    globalCoupons.forEach(coupon => {
      console.log(`- ${coupon.code} (${coupon.name})`);
    });
    
    const nonGlobalCoupons = await Coupon.find({ isGlobal: false });
    console.log(`Non-global coupons: ${nonGlobalCoupons.length}`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
migrateCoupons(); 