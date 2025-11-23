const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testLogin() {
  try {
    console.log('🧪 Testing Login Functionality...\n');

    // Test Admin Login
    console.log('1️⃣ Testing Admin Login...');
    const adminLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@thalai.com',
      password: 'password123',
    });
    
    if (adminLogin.data.success && adminLogin.data.data.token) {
      console.log('✅ Admin login successful!');
      console.log(`   Token: ${adminLogin.data.data.token.substring(0, 20)}...`);
      console.log(`   User: ${adminLogin.data.data.user.name} (${adminLogin.data.data.user.role})\n`);
      
      const adminToken = adminLogin.data.data.token;

      // Test Patient Login
      console.log('2️⃣ Testing Patient Login...');
      const patientLogin = await axios.post(`${API_URL}/auth/login`, {
        email: 'patient1@thalai.com',
        password: 'password123',
      });
      
      if (patientLogin.data.success) {
        console.log('✅ Patient login successful!');
        console.log(`   User: ${patientLogin.data.data.user.name} (${patientLogin.data.data.user.role})\n`);
      }

      // Test Donor Login
      console.log('3️⃣ Testing Donor Login...');
      const donorLogin = await axios.post(`${API_URL}/auth/login`, {
        email: 'donor1@thalai.com',
        password: 'password123',
      });
      
      if (donorLogin.data.success) {
        console.log('✅ Donor login successful!');
        console.log(`   User: ${donorLogin.data.data.user.name} (${donorLogin.data.data.user.role})\n`);
      }

      // Test Protected Route (Profile)
      console.log('4️⃣ Testing Protected Route (Profile)...');
      const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      
      if (profileResponse.data.success) {
        console.log('✅ Profile route accessible!');
        console.log(`   User: ${profileResponse.data.data.user.name}\n`);
      }

      // Test Public Stats
      console.log('5️⃣ Testing Public Stats...');
      const statsResponse = await axios.get(`${API_URL}/public/stats`);
      
      if (statsResponse.data.success) {
        console.log('✅ Public stats fetched!');
        console.log(`   Total Patients: ${statsResponse.data.data.totalPatients}`);
        console.log(`   Total Donors: ${statsResponse.data.data.totalDonors}`);
        console.log(`   Verified Donors: ${statsResponse.data.data.verifiedDonors}`);
        console.log(`   Pending Requests: ${statsResponse.data.data.pendingRequests}\n`);
      }

      // Test Public Donors
      console.log('6️⃣ Testing Public Donors...');
      const donorsResponse = await axios.get(`${API_URL}/public/donors`);
      
      if (donorsResponse.data.success) {
        const total = donorsResponse.data.data.total || donorsResponse.data.data.donors?.length || 0;
        console.log(`✅ Public donors fetched! (${total} verified donors)`);
        if (donorsResponse.data.data.donors && donorsResponse.data.data.donors.length > 0) {
          console.log(`   Example: ${donorsResponse.data.data.donors[0].name} (${donorsResponse.data.data.donors[0].bloodGroup})\n`);
        } else {
          console.log('\n');
        }
      }

      // Test Public Requests
      console.log('7️⃣ Testing Public Requests...');
      const requestsResponse = await axios.get(`${API_URL}/public/requests`);
      
      if (requestsResponse.data.success) {
        const totalPending = requestsResponse.data.data.totalPending || 0;
        const totalUrgent = requestsResponse.data.data.totalUrgent || 0;
        console.log(`✅ Public requests fetched!`);
        console.log(`   Pending: ${totalPending}, Urgent: ${totalUrgent}\n`);
      }

      // Test Admin Stats (Protected)
      console.log('8️⃣ Testing Admin Stats (Protected Route)...');
      const adminStatsResponse = await axios.get(`${API_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      
      if (adminStatsResponse.data.success) {
        console.log('✅ Admin stats fetched!');
        console.log(`   Total Patients: ${adminStatsResponse.data.data.totalPatients}`);
        console.log(`   Total Donors: ${adminStatsResponse.data.data.totalDonors}`);
        console.log(`   Verified Donors: ${adminStatsResponse.data.data.verifiedDonors}`);
        console.log(`   Pending Requests: ${adminStatsResponse.data.data.pendingRequests}`);
        console.log(`   Completed Requests: ${adminStatsResponse.data.data.completedRequests}\n`);
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ ALL TESTS PASSED!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } else {
      console.log('❌ Login failed - Invalid response');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.response.data);
    }
    console.log('\n⚠️  Make sure the backend server is running on port 5000!');
    process.exit(1);
  }
}

// Wait a bit for server to be ready, then test
setTimeout(() => {
  testLogin();
}, 3000);

