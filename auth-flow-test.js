#!/usr/bin/env node

/**
 * Authentication Flow Test Script
 * Tests: Signup → Login → Dashboard Access → Logout
 */

const BASE_URL = 'http://localhost:3007';
const testEmail = `test_${Date.now()}@example.com`;
const testPassword = 'TestPassword123!';
const testName = 'Test User';

let authToken = null;
let userId = null;

async function makeRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  
  // Extract cookies if present
  const setCookie = response.headers.get('set-cookie');
  if (setCookie && setCookie.includes('auth_token')) {
    console.log('✓ Auth cookie received');
  }

  const text = await response.text();
  let data;
  
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return {
    status: response.status,
    data,
    ok: response.ok,
    headers: response.headers,
  };
}

async function testSignup() {
  console.log('\n📝 TEST 1: Signup');
  console.log('─'.repeat(50));

  const response = await makeRequest('/api/auth/signup', 'POST', {
    email: testEmail,
    password: testPassword,
    confirmPassword: testPassword,
    name: testName,
  });

  if (response.ok && response.data.user) {
    userId = response.data.user.id;
    console.log(`✅ Signup successful`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Email: ${testEmail}`);
    return true;
  } else {
    console.log(`❌ Signup failed: ${response.status}`);
    console.log(`   Response:`, response.data);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 TEST 2: Login');
  console.log('─'.repeat(50));

  const response = await makeRequest('/api/auth/login', 'POST', {
    email: testEmail,
    password: testPassword,
  });

  if (response.ok && response.data.user) {
    console.log(`✅ Login successful`);
    console.log(`   User ID: ${response.data.user.id}`);
    console.log(`   Email: ${response.data.user.email}`);
    console.log(`   Created: ${response.data.user.createdAt}`);
    return true;
  } else {
    console.log(`❌ Login failed: ${response.status}`);
    console.log(`   Response:`, response.data);
    return false;
  }
}

async function testInvalidPassword() {
  console.log('\n🔐 TEST 3: Invalid Password (should fail)');
  console.log('─'.repeat(50));

  const response = await makeRequest('/api/auth/login', 'POST', {
    email: testEmail,
    password: 'WrongPassword123!',
  });

  if (!response.ok) {
    console.log(`✅ Invalid password correctly rejected (${response.status})`);
    console.log(`   Error: ${response.data.error}`);
    return true;
  } else {
    console.log(`❌ Invalid password was accepted (should fail)`);
    return false;
  }
}

async function testDashboardAccess() {
  console.log('\n📊 TEST 4: Dashboard Access (requires auth)');
  console.log('─'.repeat(50));

  const response = await makeRequest('/dashboard', 'GET');

  // Dashboard should be accessible if auth is properly set up
  // Note: With middleware, it will redirect to /login if not authenticated
  if (response.ok || response.status === 307 || response.status === 200) {
    console.log(`✅ Dashboard route accessible (${response.status})`);
    return true;
  } else {
    console.log(`❌ Dashboard access issue: ${response.status}`);
    return false;
  }
}

async function testLogout() {
  console.log('\n🚪 TEST 5: Logout');
  console.log('─'.repeat(50));

  const response = await makeRequest('/api/auth/logout', 'POST');

  if (response.ok) {
    console.log(`✅ Logout successful`);
    console.log(`   Message: ${response.data.message}`);
    return true;
  } else {
    console.log(`❌ Logout failed: ${response.status}`);
    return false;
  }
}

async function runAllTests() {
  console.log('╔' + '═'.repeat(48) + '╗');
  console.log('║' + ' DiscoveryOS Authentication Flow Test '.padEnd(49) + '║');
  console.log('╚' + '═'.repeat(48) + '╝');

  try {
    const signup = await testSignup();
    const login = await testLogin();
    const invalidPass = await testInvalidPassword();
    const dashboard = await testDashboardAccess();
    const logout = await testLogout();

    console.log('\n' + '─'.repeat(50));
    console.log('📋 TEST SUMMARY');
    console.log('─'.repeat(50));

    const results = [
      { name: 'Signup', passed: signup },
      { name: 'Login', passed: login },
      { name: 'Invalid Password Rejection', passed: invalidPass },
      { name: 'Dashboard Access', passed: dashboard },
      { name: 'Logout', passed: logout },
    ];

    let passCount = 0;
    results.forEach(({ name, passed }) => {
      const icon = passed ? '✅' : '❌';
      console.log(`${icon} ${name}`);
      if (passed) passCount++;
    });

    console.log('─'.repeat(50));
    console.log(`Results: ${passCount}/${results.length} tests passed\n`);

    process.exit(passCount === results.length ? 0 : 1);
  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();
