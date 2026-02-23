const fetch = require('node-fetch');

async function testAPI() {
  console.log('Testing API endpoints...\n');

  // Test signup
  try {
    console.log('Testing signup endpoint...');
    const signupResponse = await fetch('https://book-scape-backend.vercel.app/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }),
    });

    const signupData = await signupResponse.json();
    console.log('Signup response:', signupResponse.status, signupData);
  } catch (error) {
    console.error('Signup test failed:', error.message);
  }

  // Test login
  try {
    console.log('\nTesting login endpoint...');
    const loginResponse = await fetch('https://book-scape-backend.vercel.app/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginResponse.status, loginData);
  } catch (error) {
    console.error('Login test failed:', error.message);
  }
}

testAPI(); 