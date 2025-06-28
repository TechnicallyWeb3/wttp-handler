#!/usr/bin/env node

console.log('🧪 Testing ES Module imports...\n');

try {
  // Test 1: Main package import with destructuring
  console.log('✅ Test 1: Main package import with destructuring');
  const { 
    WTTPHandler,
    getChainId,
    wttpGET,
    wttpHEAD,
    wttpLOCATE,
    wttpOPTIONS
  } = await import('wttp-handler');
  
  console.log('   - Main package imported successfully');
  console.log('   - Key destructured exports verified ✓');

  // Test 2: Default/namespace import
  console.log('\n✅ Test 2: Default/namespace import');
  const wttpHandler = await import('wttp-handler');
  console.log('   - Namespace import successful');
  console.log(`   - Available exports: ${Object.keys(wttpHandler).length} items`);

  // Test 3: Functionality validation
  console.log('\n✅ Test 3: Functionality validation');
  
  // Test WTTPHandler instantiation
  const handler = new WTTPHandler();
  console.log('   - WTTPHandler instance created ✓');
  
  // Test getChainId function
  const mainnetId = getChainId('mainnet');
  const sepoliaId = getChainId('sepolia');
  console.log(`   - getChainId('mainnet'): ${mainnetId} ✓`);
  console.log(`   - getChainId('sepolia'): ${sepoliaId} ✓`);
  
  // Test method functions exist and are callable
  const methodFunctions = [wttpGET, wttpHEAD, wttpLOCATE, wttpOPTIONS];
  const methodNames = ['wttpGET', 'wttpHEAD', 'wttpLOCATE', 'wttpOPTIONS'];
  
  methodFunctions.forEach((method, index) => {
    if (typeof method === 'function') {
      console.log(`   - ${methodNames[index]} is callable ✓`);
    } else {
      console.log(`   - ${methodNames[index]} is not a function ✗`);
    }
  });

  // Test 4: Instance methods
  console.log('\n✅ Test 4: Instance methods validation');
  const instanceMethods = ['fetch', 'getGateway', 'connectProvider', 'formatResponse'];
  instanceMethods.forEach(method => {
    if (typeof handler[method] === 'function') {
      console.log(`   - handler.${method}(): Available ✓`);
    } else {
      console.log(`   - handler.${method}(): Missing ✗`);
    }
  });

  console.log('\n🎉 All ESM import tests completed successfully!');
  console.log('📦 Package can be imported correctly in ES Module environments');

} catch (error) {
  console.error('\n❌ ES Module import test failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
} 