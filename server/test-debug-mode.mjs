/**
 * Test script to verify debug mode functionality
 * Tests both debug mode ON and OFF scenarios
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5500/api/v1';

async function testDebugMode() {
  console.log('🧪 Testing Debug Mode Functionality...\n');

  try {
    console.log('🔍 Testing with Debug Mode ON (should return test data):');
    console.log('   Note: Debug mode is controlled from the frontend Settings panel\n');

    // Test browse endpoint with includeTestData
    console.log('📋 Testing browse endpoint:');
    const browseWithTest = await fetch(`${BASE_URL}/browse?includeTestData=true`);
    const browseWithTestData = await browseWithTest.json();
    console.log(`   With ?includeTestData=true: ${browseWithTestData.length} events returned`);

    const browseWithoutTest = await fetch(`${BASE_URL}/browse`);
    const browseWithoutTestData = await browseWithoutTest.json();
    console.log(`   Without parameter: ${browseWithoutTestData.length} events returned\n`);

    // Test committees endpoint
    console.log('📋 Testing committees endpoint:');
    const committeesWithTest = await fetch(`${BASE_URL}/committees?includeTestData=true`);
    const committeesWithTestData = await committeesWithTest.json();
    console.log(`   With ?includeTestData=true: ${committeesWithTestData.length} committees returned`);

    const committeesWithoutTest = await fetch(`${BASE_URL}/committees`);
    const committeesWithoutTestData = await committeesWithoutTest.json();
    console.log(`   Without parameter: ${committeesWithoutTestData.length} committees returned\n`);

    // Summary
    console.log('🎯 Test Results:');
    console.log(`   ✅ Test Data Available: ${browseWithTestData.length > 0 ? 'YES' : 'NO'} (${browseWithTestData.length} events)`);
    console.log(`   ✅ Production Filtering: ${browseWithoutTestData.length === 0 ? 'WORKING' : 'NOT WORKING'} (${browseWithoutTestData.length} events)`);
    console.log(`   ✅ Debug Mode Ready: ${browseWithTestData.length > 0 && browseWithoutTestData.length === 0 ? 'YES' : 'NO'}`);

    if (browseWithTestData.length > 0 && browseWithoutTestData.length === 0) {
      console.log('\n🎉 SUCCESS: Debug mode is working perfectly!');
      console.log('💡 Frontend Settings panel will automatically control this for you');
    } else {
      console.log('\n⚠️  Debug mode may need configuration');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your server is running on port 5500');
    console.log('💡 Make sure you have test data in your database');
  }
}

// Run the test
testDebugMode();
