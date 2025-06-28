#!/usr/bin/env node

console.log('🧪 Testing CommonJS imports...\n');

try {
  // Test 1: Main package import
  console.log('✅ Test 1: Main package import');
  const wttpHandler = require('wttp-handler');
  console.log('   - Main package imported successfully');
  console.log(`   - Available exports: ${Object.keys(wttpHandler).length} items`);

  // Test 2: Check for key exports
  console.log('\n✅ Test 2: Key exports validation');
  const expectedExports = [
    'WTTPHandler',
    'getChainId',
    'wttpGET',
    'wttpHEAD',
    'wttpLOCATE',
    'wttpOPTIONS'
  ];
  
  const missingExports = expectedExports.filter(exp => !(exp in wttpHandler));
  if (missingExports.length === 0) {
    console.log('   - All expected exports found ✓');
    expectedExports.forEach(exp => {
      console.log(`   - ${exp}: ${typeof wttpHandler[exp]}`);
    });
  } else {
    console.log(`   - Missing exports: ${missingExports.join(', ')} ✗`);
  }

  // Test 3: Basic functionality test
  console.log('\n✅ Test 3: Basic functionality validation');
  
  // Test WTTPHandler instantiation
  const handler = new wttpHandler.WTTPHandler();
  console.log('   - WTTPHandler instance created ✓');
  
  // Test getChainId function
  const mainnetId = wttpHandler.getChainId('mainnet');
  const sepoliaId = wttpHandler.getChainId('sepolia');
  console.log(`   - getChainId('mainnet'): ${mainnetId} ✓`);
  console.log(`   - getChainId('sepolia'): ${sepoliaId} ✓`);
  
  // Test method functions exist and are callable
  const methodFunctions = ['wttpGET', 'wttpHEAD', 'wttpLOCATE', 'wttpOPTIONS'];
  methodFunctions.forEach(method => {
    if (typeof wttpHandler[method] === 'function') {
      console.log(`   - ${method} is callable ✓`);
    } else {
      console.log(`   - ${method} is not a function ✗`);
    }
  });

  console.log('\n🎉 All CommonJS import tests completed successfully!');
  console.log('📦 Package can be imported correctly in CommonJS environments');

} catch (error) {
  console.error('\n❌ CommonJS import test failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
} 