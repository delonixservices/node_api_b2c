const axios = require('axios');

// Test the API call with the exact same payload as your Postman test
async function testHotelSearch() {
  try {
    console.log('🔍 Testing Hotel Search API...');
    
    // Use the exact payload from your Postman test
    const payload = {
      "search": {
        "check_out_date": "2025-06-26",
        "room_count": "1",
        "child_count": "0",
        "source_market": "IN",
        "region_id": "100215,100995,101311,102206,102320,102809,102820,103357,103359,103918,103961,104175,104187,104220,104258,104395,104433,104447,104511,104605,104674,104681,104740,104761,104954,105025,105174,105225,105288,105312,105314,105355,105356,105397,105421,105437,105513,105606,105613,105715,105763,105811,105845,105854,10593,105979,106035,106064,106109,106159",
        "limit": 0,
        "currency": "INR",
        "optional": "",
        "locale": "",
        "adult_count": "1",
        "check_in_date": "2025-06-25"
      },
      "region": {
        "country": "India",
        "city": "Delhi",
        "countryCode": "IN"
      }
    };

    const endpoint = 'http://localhost:3334/api/hotels/search';
    console.log(`\n🌐 Testing endpoint: ${endpoint}`);
    
    try {
      const response = await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('✅ Success!');
      console.log('Status:', response.status);
      console.log('Data keys:', Object.keys(response.data || {}));
      
      if (response.data?.data?.hotels) {
        console.log('Hotels found:', response.data.data.hotels.length);
        console.log('First hotel:', response.data.data.hotels[0]?.name);
        console.log('Response structure matches frontend expectation!');
      } else if (response.data?.hotels) {
        console.log('Hotels found (direct):', response.data.hotels.length);
        console.log('First hotel:', response.data.hotels[0]?.name);
        console.log('Response structure is direct (no data wrapper)');
      } else {
        console.log('No hotels in response');
        console.log('Response structure:', JSON.stringify(response.data, null, 2));
      }
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Error data:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Also test the frontend payload structure
async function testFrontendPayload() {
  try {
    console.log('\n🔍 Testing Frontend Payload Structure...');
    
    const frontendPayload = {
      search: {
        check_out_date: "2025-06-26",
        room_count: "1",
        child_count: "0",
        source_market: "IN",
        region_id: "100215,100995,101311,102206,102320,102809,102820,103357,103359,103918,103961,104175,104187,104220,104258,104395,104433,104447,104511,104605,104674,104681,104740,104761,104954,105025,105174,105225,105288,105312,105314,105355,105356,105397,105421,105437,105513,105606,105613,105715,105763,105811,105845,105854,10593,105979,106035,106064,106109,106159",
        limit: 0,
        currency: "INR",
        optional: "",
        locale: "",
        adult_count: "1",
        check_in_date: "2025-06-25"
      },
      region: {
        country: "India",
        city: "Delhi",
        countryCode: "IN"
      }
    };

    const endpoint = 'http://localhost:3334/api/hotels/search';
    console.log(`\n🌐 Testing frontend payload with: ${endpoint}`);
    
    try {
      const response = await axios.post(endpoint, frontendPayload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('✅ Frontend payload success!');
      console.log('Status:', response.status);
      console.log('Data keys:', Object.keys(response.data || {}));
      
      if (response.data?.data?.hotels) {
        console.log('Hotels found:', response.data.data.hotels.length);
        console.log('✅ Frontend payload works correctly!');
      } else if (response.data?.hotels) {
        console.log('Hotels found (direct):', response.data.hotels.length);
        console.log('⚠️ Response structure is different than expected');
      } else {
        console.log('No hotels in response');
      }
      
    } catch (error) {
      console.log('❌ Frontend payload failed:', error.message);
    }
    
  } catch (error) {
    console.error('Frontend payload test failed:', error.message);
  }
}

// Run tests
testHotelSearch().then(() => {
  testFrontendPayload();
}); 