// Test script to verify signup and login
// Run this in the browser console while on http://localhost:3004

async function testAuthFlow() {
  console.log("=== Starting Auth Flow Test ===\n");

  // Step 1: Signup
  console.log("Step 1: Testing Signup...");
  const signupResponse = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "testuser@example.com",
      password: "TestPass@123",
      confirmPassword: "TestPass@123",
      name: "Test User"
    })
  });

  console.log("Signup Response Status:", signupResponse.status);
  const signupData = await signupResponse.json();
  console.log("Signup Response:", signupData);

  if (signupResponse.status !== 201) {
    console.error("Signup failed!");
    return;
  }

  console.log("\n✓ Signup successful!\n");

  // Step 2: Login
  console.log("Step 2: Testing Login...");
  const loginResponse = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "testuser@example.com",
      password: "TestPass@123"
    })
  });

  console.log("Login Response Status:", loginResponse.status);
  const loginData = await loginResponse.json();
  console.log("Login Response:", loginData);

  if (loginResponse.status !== 200) {
    console.error("Login failed!");
    return;
  }

  console.log("\n✓ Login successful!\n");

  // Step 3: Store user and verify
  console.log("Step 3: Storing user in localStorage...");
  localStorage.setItem("auth_user", JSON.stringify({
    email: loginData.user.email,
    id: loginData.user.id,
    createdAt: new Date().toISOString()
  }));

  console.log("localStorage auth_user:", localStorage.getItem("auth_user"));
  console.log("\n✓ User stored in localStorage!\n");

  console.log("=== Auth Flow Test Complete ===");
  console.log("Now try navigating to /dashboard");
}

// Run the test
testAuthFlow();
