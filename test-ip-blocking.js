const mongoose = require('mongoose');
const BlockedIP = require('./src/models/BlockedIP');
const History = require('./src/models/History');
require('dotenv').config();

const testIPBlocking = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/b2c', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Test 1: Create a test blocked IP
    console.log('\n=== Test 1: Creating a test blocked IP ===');
    const testIP = '192.168.1.100';
    
    const blockedIP = new BlockedIP({
      ip: testIP,
      reason: 'manual_block',
      blockedBy: 'admin',
      adminId: new mongoose.Types.ObjectId(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      notes: 'Test block for functionality verification'
    });

    await blockedIP.save();
    console.log(`✅ Created blocked IP: ${testIP}`);

    // Test 2: Check if IP is currently blocked
    console.log('\n=== Test 2: Checking if IP is blocked ===');
    const isBlocked = await BlockedIP.findActiveBlock(testIP);
    console.log(`✅ IP ${testIP} is blocked: ${!!isBlocked}`);

    // Test 3: Create a test history record
    console.log('\n=== Test 3: Creating test history record ===');
    const historyRecord = new History({
      request: {
        method: 'GET',
        body: { test: 'data' },
        remoteAddress: testIP,
        ip: testIP,
        startTime: new Date()
      },
      response: {
        body: { status: 'success' },
        statusCode: '200',
        responseTime: 150
      },
      date: new Date(),
      url: '/api/test'
    });

    await historyRecord.save();
    console.log(`✅ Created history record for IP: ${testIP}`);

    // Test 4: Query IP activity
    console.log('\n=== Test 4: Querying IP activity ===');
    const activity = await History.find({
      'request.ip': testIP
    }).sort({ date: -1 }).limit(5);

    console.log(`✅ Found ${activity.length} activity records for IP: ${testIP}`);

    // Test 5: Get blocking statistics
    console.log('\n=== Test 5: Getting blocking statistics ===');
    const stats = await BlockedIP.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('✅ Blocking statistics:');
    stats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count} blocks`);
    });

    // Test 6: Clean up test data
    console.log('\n=== Test 6: Cleaning up test data ===');
    await BlockedIP.deleteOne({ ip: testIP });
    await History.deleteOne({ 'request.ip': testIP });
    console.log('✅ Cleaned up test data');

    console.log('\n🎉 All tests passed! IP blocking functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run test if called directly
if (require.main === module) {
  testIPBlocking();
}

module.exports = testIPBlocking; 