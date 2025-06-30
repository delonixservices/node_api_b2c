const mongoose = require('mongoose');
const History = require('./src/models/History');
require('dotenv').config();

const migrateIPHistory = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/b2c', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all history records without IP addresses
    const recordsWithoutIP = await History.find({
      $or: [
        { 'request.ip': { $exists: false } },
        { 'request.ip': null },
        { 'request.ip': '' }
      ]
    });

    console.log(`Found ${recordsWithoutIP.length} records without IP addresses`);

    if (recordsWithoutIP.length === 0) {
      console.log('No records need migration');
      return;
    }

    // Update records with a default IP if remoteAddress exists
    let updatedCount = 0;
    for (const record of recordsWithoutIP) {
      const updateData = {};
      
      if (record.request.remoteAddress && record.request.remoteAddress !== 'unknown') {
        updateData['request.ip'] = record.request.remoteAddress;
      } else {
        updateData['request.ip'] = 'unknown';
      }

      await History.updateOne(
        { _id: record._id },
        { $set: updateData }
      );
      
      updatedCount++;
      
      if (updatedCount % 100 === 0) {
        console.log(`Updated ${updatedCount} records...`);
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} records.`);

    // Verify migration
    const remainingRecords = await History.find({
      $or: [
        { 'request.ip': { $exists: false } },
        { 'request.ip': null },
        { 'request.ip': '' }
      ]
    });

    console.log(`Remaining records without IP: ${remainingRecords.length}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateIPHistory();
}

module.exports = migrateIPHistory; 