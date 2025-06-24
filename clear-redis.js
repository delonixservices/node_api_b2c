const { getRedisClient, closeRedisClient } = require('./src/config/redis');

async function clearRedisData() {
  let client = null;
  
  try {
    console.log('🔍 Connecting to Redis...');
    client = await getRedisClient();
    
    if (!client || !client.isOpen) {
      console.log('❌ Failed to connect to Redis');
      return;
    }
    
    console.log('✅ Connected to Redis successfully');
    
    // Get all keys
    console.log('🔍 Fetching all Redis keys...');
    const keys = await client.keys('*');
    
    if (keys.length === 0) {
      console.log('ℹ️  No keys found in Redis - database is already empty');
      return;
    }
    
    console.log(`📊 Found ${keys.length} keys in Redis`);
    
    // Show some sample keys (first 10)
    const sampleKeys = keys.slice(0, 10);
    console.log('📋 Sample keys found:');
    sampleKeys.forEach((key, index) => {
      console.log(`  ${index + 1}. ${key}`);
    });
    
    if (keys.length > 10) {
      console.log(`  ... and ${keys.length - 10} more keys`);
    }
    
    // Clear all keys
    console.log('🗑️  Clearing all Redis data...');
    await client.flushAll();
    
    console.log('✅ Successfully cleared all Redis data');
    
    // Verify the database is empty
    const remainingKeys = await client.keys('*');
    console.log(`📊 Remaining keys: ${remainingKeys.length}`);
    
  } catch (error) {
    console.error('❌ Error clearing Redis data:', error.message);
  } finally {
    if (client) {
      await closeRedisClient();
      console.log('🔌 Redis connection closed');
    }
  }
}

// Run the function
clearRedisData()
  .then(() => {
    console.log('🎉 Redis clearing process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }); 