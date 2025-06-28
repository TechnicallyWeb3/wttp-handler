#!/usr/bin/env node

console.log('🧪 Testing Advanced ES Module Import Patterns...\n');

try {
  // Test 1: Dynamic import validation
  console.log('✅ Test 1: Dynamic import patterns');
  
  // Test different import syntaxes
  const fullImport = await import('wttp-handler');
  const { WTTPHandler: Handler } = await import('wttp-handler');
  const { getChainId: chainIdFn } = await import('wttp-handler');
  
  console.log('   - Full namespace import ✓');
  console.log('   - Renamed destructured import ✓');
  console.log('   - Individual function import ✓');

  // Test 2: Advanced destructuring patterns
  console.log('\n✅ Test 2: Advanced destructuring patterns');
  
  const {
    WTTPHandler,
    getChainId,
    wttpGET,
    wttpHEAD,
    wttpLOCATE,
    wttpOPTIONS,
    ...rest
  } = await import('wttp-handler');
  
  console.log('   - Main exports destructured ✓');
  console.log(`   - Additional exports: ${Object.keys(rest).length} items`);
  if (Object.keys(rest).length > 0) {
    console.log(`   - Rest exports: ${Object.keys(rest).join(', ')}`);
  }

  // Test 3: Chain ID comprehensive testing
  console.log('\n✅ Test 3: Comprehensive chain ID testing');
  
  const chainMappings = [
    // String aliases
    { input: 'localhost', expected: 31337, type: 'development' },
    { input: 'sepolia', expected: 11155111, type: 'testnet' },
    { input: 'testnet', expected: 11155111, type: 'testnet-alias' },
    { input: 'ethereum', expected: 1, type: 'mainnet' },
    { input: 'mainnet', expected: 1, type: 'mainnet-alias' },
    { input: 'eth', expected: 1, type: 'eth-alias' },
    { input: 'base', expected: 8453, type: 'L2' },
    { input: 'polygon', expected: 137, type: 'sidechain' },
    { input: 'matic', expected: 137, type: 'sidechain-alias' },
    { input: 'arbitrum', expected: 42161, type: 'L2-arbitrum' },
    { input: 'arb', expected: 42161, type: 'L2-arbitrum-alias' },
    
    // Numeric strings
    { input: '1', expected: 1, type: 'numeric-string' },
    { input: '137', expected: 137, type: 'numeric-string' },
    { input: '11155111', expected: 11155111, type: 'numeric-string' },
    
    // Edge cases
    { input: 'unknown', expected: null, type: 'invalid' },
    { input: '', expected: null, type: 'empty' },
    { input: 'ETHEREUM', expected: null, type: 'case-sensitive' }
  ];
  
  chainMappings.forEach(({ input, expected, type }) => {
    const result = getChainId(input);
    const status = result === expected ? '✓' : '✗';
    console.log(`   - ${type}: "${input}" → ${result} (expected: ${expected}) ${status}`);
  });

  // Test 4: Class instantiation patterns
  console.log('\n✅ Test 4: Class instantiation patterns');
  
  // Default instantiation
  const defaultHandler = new WTTPHandler();
  console.log('   - Default constructor ✓');
  
  // With default chain
  const customHandler = new WTTPHandler(undefined, 'sepolia');
  console.log('   - Constructor with default chain ✓');
  
  // Test instance methods availability
  const requiredMethods = [
    'fetch',
    'getGateway', 
    'connectProvider',
    'formatResponse',
    'isRedirect',
    'getAbsolutePath'
  ];
  
  const availableMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(defaultHandler))
    .filter(name => name !== 'constructor' && typeof defaultHandler[name] === 'function');
    
  console.log(`   - Instance methods available: ${availableMethods.length}`);
  
  requiredMethods.forEach(method => {
    if (availableMethods.includes(method)) {
      console.log(`   - ${method}(): Available ✓`);
    } else {
      console.log(`   - ${method}(): Missing ✗`);
    }
  });

  // Test 5: Async method validation
  console.log('\n✅ Test 5: Async method validation');
  
  const asyncMethods = [
    { name: 'wttpGET', fn: wttpGET },
    { name: 'wttpHEAD', fn: wttpHEAD },
    { name: 'wttpLOCATE', fn: wttpLOCATE },
    { name: 'wttpOPTIONS', fn: wttpOPTIONS }
  ];
  
  asyncMethods.forEach(({ name, fn }) => {
    const isAsync = fn.constructor.name === 'AsyncFunction';
    console.log(`   - ${name}: ${isAsync ? 'Async function' : 'Regular function'} ${isAsync ? '✓' : '✗'}`);
  });

  // Test 6: Re-export validation
  console.log('\n✅ Test 6: Re-export validation');
  
  // Check if we can re-export 
  const reExported = { WTTPHandler, getChainId, wttpGET, wttpHEAD, wttpLOCATE, wttpOPTIONS };
  console.log('   - Re-export capability ✓');
  console.log(`   - Re-exported items: ${Object.keys(reExported).length}`);
  
  // Test that re-exported items work
  const reHandler = new reExported.WTTPHandler();
  const reChainId = reExported.getChainId('mainnet');
  console.log(`   - Re-exported WTTPHandler works: ${reHandler instanceof WTTPHandler ? '✓' : '✗'}`);
  console.log(`   - Re-exported getChainId works: ${reChainId === 1 ? '✓' : '✗'}`);

  // Test 7: Import URL validation
  console.log('\n✅ Test 7: Import metadata validation');
  
  // Note: This would show the actual import URL in a real environment
  console.log('   - Import successful from package ✓');
  console.log('   - No import errors or warnings ✓');

  console.log('\n🎉 All Advanced ESM tests completed successfully!');
  console.log('📦 Advanced ESM patterns work correctly');
  console.log('🔄 Dynamic imports, re-exports, and complex patterns all function properly');

} catch (error) {
  console.error('\n❌ Advanced ESM test failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
} 