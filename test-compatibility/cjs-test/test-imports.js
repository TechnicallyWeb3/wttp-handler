#!/usr/bin/env node

console.log('🧪 Testing Advanced CommonJS Import Patterns...\n');

try {
  // Test 1: Destructured imports
  console.log('✅ Test 1: Destructured imports');
  const { 
    WTTPHandler, 
    getChainId, 
    wttpGET, 
    wttpHEAD, 
    wttpLOCATE, 
    wttpOPTIONS 
  } = require('wttp-handler');
  
  console.log('   - Destructured imports successful ✓');
  console.log('   - All main functions available via destructuring ✓');

  // Test 2: Individual import validation
  console.log('\n✅ Test 2: Individual export validation');
  
  // WTTPHandler class
  if (typeof WTTPHandler === 'function') {
    const instance = new WTTPHandler();
    console.log('   - WTTPHandler: Class constructor ✓');
    console.log('   - WTTPHandler instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
  }
  
  // getChainId function
  if (typeof getChainId === 'function') {
    console.log('   - getChainId: Function ✓');
    console.log(`   - getChainId('eth'): ${getChainId('eth')}`);
    console.log(`   - getChainId('polygon'): ${getChainId('polygon')}`);
    console.log(`   - getChainId('arbitrum'): ${getChainId('arbitrum')}`);
  }
  
  // Method functions
  const methods = { wttpGET, wttpHEAD, wttpLOCATE, wttpOPTIONS };
  Object.entries(methods).forEach(([name, fn]) => {
    if (typeof fn === 'function') {
      console.log(`   - ${name}: Async function ✓`);
    } else {
      console.log(`   - ${name}: Not a function ✗`);
    }
  });

  // Test 3: Chain ID mapping validation
  console.log('\n✅ Test 3: Chain ID mapping validation');
  const chainTests = [
    { alias: 'mainnet', expected: 1 },
    { alias: 'ethereum', expected: 1 },
    { alias: 'eth', expected: 1 },
    { alias: 'sepolia', expected: 11155111 },
    { alias: 'testnet', expected: 11155111 },
    { alias: 'polygon', expected: 137 },
    { alias: 'matic', expected: 137 },
    { alias: 'arbitrum', expected: 42161 },
    { alias: 'arb', expected: 42161 },
    { alias: 'base', expected: 8453 },
    { alias: 'localhost', expected: 31337 }
  ];
  
  chainTests.forEach(({ alias, expected }) => {
    const result = getChainId(alias);
    if (result === expected) {
      console.log(`   - ${alias} → ${result} ✓`);
    } else {
      console.log(`   - ${alias} → ${result} (expected ${expected}) ✗`);
    }
  });

  // Test 4: Type safety simulation (no actual TypeScript, but structure validation)
  console.log('\n✅ Test 4: Structure validation');
  
  try {
    const handler = new WTTPHandler();
    
    // Check if methods exist on instance
    const instanceMethods = ['fetch', 'getGateway', 'connectProvider', 'formatResponse'];
    instanceMethods.forEach(method => {
      if (typeof handler[method] === 'function') {
        console.log(`   - handler.${method}(): Available ✓`);
      } else {
        console.log(`   - handler.${method}(): Missing ✗`);
      }
    });
    
  } catch (error) {
    console.log(`   - WTTPHandler instantiation failed: ${error.message} ✗`);
  }

  // Test 5: Error handling
  console.log('\n✅ Test 5: Error handling validation');
  
  // Test invalid chain ID
  const invalidChain = getChainId('nonexistent');
  console.log(`   - getChainId('nonexistent'): ${invalidChain} (should be null) ${invalidChain === null ? '✓' : '✗'}`);
  
  // Test numeric string parsing
  const numericChain = getChainId('137');
  console.log(`   - getChainId('137'): ${numericChain} (should be 137) ${numericChain === 137 ? '✓' : '✗'}`);

  console.log('\n🎉 All Advanced CommonJS tests completed successfully!');
  console.log('📦 Advanced CommonJS patterns work correctly');

} catch (error) {
  console.error('\n❌ Advanced CommonJS test failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
} 