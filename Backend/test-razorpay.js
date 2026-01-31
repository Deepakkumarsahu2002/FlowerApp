/**
 * Razorpay Configuration Test Script
 * 
 * This script tests if your Razorpay keys are correctly configured.
 * Run: node test-razorpay.js
 */

require('dotenv').config();
const razorpay = require('./config/razorpay');

console.log('\n🔍 Testing Razorpay Configuration...\n');

// Check if keys are set
if (!process.env.RAZORPAY_KEY_ID) {
  console.error('❌ RAZORPAY_KEY_ID is not set in .env file');
  process.exit(1);
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ RAZORPAY_KEY_SECRET is not set in .env file');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log('   Key ID:', process.env.RAZORPAY_KEY_ID.substring(0, 15) + '...');
console.log('   Key Secret:', process.env.RAZORPAY_KEY_SECRET.substring(0, 10) + '...\n');

// Test Razorpay connection
async function testRazorpay() {
  try {
    console.log('🔄 Creating test Razorpay order...');
    
    const order = await razorpay.orders.create({
      amount: 10000, // ₹100 in paise
      currency: 'INR',
      receipt: 'test_' + Date.now()
    });
    
    console.log('✅ Razorpay connection successful!');
    console.log('   Order ID:', order.id);
    console.log('   Amount:', order.amount / 100, 'INR');
    console.log('   Status:', order.status);
    console.log('\n🎉 Your Razorpay configuration is correct!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Razorpay connection failed!\n');
    console.error('Error Details:');
    console.error('   Status Code:', error.statusCode || 'N/A');
    console.error('   Error Code:', error.error?.code || 'N/A');
    console.error('   Description:', error.error?.description || error.message);
    
    if (error.statusCode === 401) {
      console.error('\n🔴 401 Unauthorized Error - This means:');
      console.error('   1. Your Key ID is invalid or has been revoked');
      console.error('   2. Your Key Secret doesn\'t match the Key ID');
      console.error('   3. Your Razorpay account may have restrictions\n');
      console.error('💡 Solutions:');
      console.error('   - Go to Razorpay Dashboard → Settings → API Keys');
      console.error('   - Verify your keys are Active (not revoked)');
      console.error('   - Generate new test keys if needed');
      console.error('   - Make sure Key ID and Key Secret match (they come in pairs)');
      console.error('   - Check your Backend/.env file has correct values\n');
    } else if (error.statusCode === 400) {
      console.error('\n🟡 400 Bad Request Error - This means:');
      console.error('   - Invalid request parameters');
      console.error('   - Check the error description above\n');
    } else {
      console.error('\n⚠️  Unexpected error occurred');
      console.error('   Check your internet connection and Razorpay service status\n');
    }
    
    process.exit(1);
  }
}

testRazorpay();
