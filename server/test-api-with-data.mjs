/**
 * Quick test script to demonstrate the includeTestData parameter
 * Run this to see the API behavior with and without test data
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5500/api/v1';

async function testApi() {
  console.log('🧪 Testing API with test data parameter...\n');

  try {
    // Test committees endpoint
    console.log('📋 Testing /committees endpoint:');

    // Without test data (production behavior)
    const committeesProd = await fetch(`${BASE_URL}/committees`);
    const committeesProdData = await committeesProd.json();
    console.log(`   Production (no param): ${committeesProdData.length} committees`);

    // With test data (development testing)
    const committeesTest = await fetch(`${BASE_URL}/committees?includeTestData=true`);
    const committeesTestData = await committeesTest.json();
    console.log(`   Development (+test data): ${committeesTestData.length} committees`);

    console.log('\n📅 Testing /browse endpoint:');

    // Without test data
    const browseProd = await fetch(`${BASE_URL}/browse`);
    const browseProdData = await browseProd.json();
    console.log(`   Production (no param): ${browseProdData.length} events`);

    // With test data
    const browseTest = await fetch(`${BASE_URL}/browse?includeTestData=true`);
    const browseTestData = await browseTest.json();
    console.log(`   Development (+test data): ${browseTestData.length} events`);

    console.log('\n🎉 API Testing Complete!');
    console.log('💡 Use ?includeTestData=true in your frontend during development');
    console.log('🔒 Production APIs stay clean automatically');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your server is running on port 5500');
  }
}

// Run the test
testApi();
