const axios = require('axios');

async function debugAPI() {
  const baseURL = 'http://localhost:3334/api/hotels/search';
  
  console.log('🔍 Debugging API with different payloads...\n');
  
  // Test 1: Correct API payload structure
  console.log('📋 Test 1: Correct API payload structure');
  const payload1 = {
    "perPage": 15,
    "page": 1,
    "checkindate": "2025-06-25",
    "checkoutdate": "2025-06-26",
    "area": {
      "id": "100215,100995,101311,102206,102320,102809,102820,103357,103359,103918,103961,104175,104187,104220,104258,104395,104433,104447,104511,104605,104674,104681,104740,104761,104954,105025,105174,105225,105288,105312,105314,105355,105356,105397,105421,105437,105513,105606,105613,105715,105763,105811,105845,105854,10593,105979,106035,106064,106109,106159",
      "name": "Delhi",
      "type": "city"
    },
    "details": [
      {
        "room": "1",
        "adult_count": "1",
        "child_count": "0"
      }
    ]
  };
  
  try {
    const response1 = await axios.post(baseURL, payload1, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    console.log('✅ Success! Status:', response1.status);
    console.log('Hotels found:', response1.data?.data?.hotels?.length || response1.data?.hotels?.length || 0);
  } catch (error) {
    console.log('❌ Failed:', error.response?.status, error.response?.data);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Frontend payload structure (correct format)
  console.log('📋 Test 2: Frontend payload structure (correct format)');
  const payload2 = {
    perPage: 15,
    page: 1,
    checkindate: "2025-06-25",
    checkoutdate: "2025-06-26",
    area: {
      id: "100215,100995,101311,102206,102320,102809,102820,103357,103359,103918,103961,104175,104187,104220,104258,104395,104433,104447,104511,104605,104674,104681,104740,104761,104954,105025,105174,105225,105288,105312,105314,105355,105356,105397,105421,105437,105513,105606,105613,105715,105763,105811,105845,105854,10593,105979,106035,106064,106109,106159",
      name: "Delhi",
      type: "city"
    },
    details: [
      {
        room: "1",
        adult_count: "1",
        child_count: "0"
      }
    ]
  };
  
  try {
    const response2 = await axios.post(baseURL, payload2, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    console.log('✅ Success! Status:', response2.status);
    console.log('Hotels found:', response2.data?.data?.hotels?.length || response2.data?.hotels?.length || 0);
  } catch (error) {
    console.log('❌ Failed:', error.response?.status, error.response?.data);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Minimal payload (correct format)
  console.log('📋 Test 3: Minimal payload (correct format)');
  const payload3 = {
    perPage: 15,
    page: 1,
    checkindate: "2025-06-25",
    checkoutdate: "2025-06-26",
    area: {
      id: "100215",
      name: "Delhi",
      type: "city"
    },
    details: [
      {
        room: "1",
        adult_count: "1",
        child_count: "0"
      }
    ]
  };
  
  try {
    const response3 = await axios.post(baseURL, payload3, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    console.log('✅ Success! Status:', response3.status);
    console.log('Hotels found:', response3.data?.data?.hotels?.length || response3.data?.hotels?.length || 0);
  } catch (error) {
    console.log('❌ Failed:', error.response?.status, error.response?.data);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Check if API is reachable
  console.log('📋 Test 4: Check API health');
  try {
    const healthResponse = await axios.get('http://localhost:3334/api/health', {
      timeout: 5000
    });
    console.log('✅ API is reachable:', healthResponse.status);
  } catch (error) {
    console.log('❌ API health check failed:', error.message);
  }
}

debugAPI().catch(console.error); 