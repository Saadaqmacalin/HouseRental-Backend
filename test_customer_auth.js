const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Customer = require('./models/Customer');

async function testAuth() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const testEmail = 'testcustomer@example.com';
    const testPass = 'password123';

    // 1. Cleanup old test user
    await Customer.deleteOne({ email: testEmail });
    console.log('Cleaned up old test user');

    // 2. Test Registration
    const customer = await Customer.create({
      name: 'Test Customer',
      email: testEmail,
      password: testPass
    });
    console.log('Registration Success:', customer.email);

    // 3. Test Login
    const foundCustomer = await Customer.findOne({ email: testEmail });
    if (!foundCustomer) {
      console.error('Login Fail: Customer not found');
      return;
    }

    const isMatch = await foundCustomer.matchPassword(testPass);
    console.log('Password Match:', isMatch);

    if (isMatch) {
      console.log('✅ Auth Logic is WORKING correctly in isolation.');
    } else {
      console.error('❌ Auth Logic is FAILING: Password mismatch');
    }

    // Cleanup
    await Customer.deleteOne({ email: testEmail });
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Error:', err);
    process.exit(1);
  }
}

testAuth();
