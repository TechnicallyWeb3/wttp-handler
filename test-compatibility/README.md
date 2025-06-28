# CJS/ESM Compatibility Testing for wttp-handler

This directory contains comprehensive tests to ensure the `wttp-handler` package works correctly in both CommonJS (CJS) and ES Module (ESM) environments.

## Overview

The testing suite validates:
- ✅ **CommonJS imports** using `require()`
- ✅ **ES Module imports** using `import` and dynamic `import()`
- ✅ **Dual package exports** configuration
- ✅ **TypeScript declaration files** compatibility
- ✅ **Function and class instantiation** in both environments
- ✅ **Advanced import patterns** (destructuring, re-exports, etc.)

## Structure

```
test-compatibility/
├── cjs-test/
│   ├── package.json         # CommonJS test package config
│   ├── index.js            # Basic CJS import tests
│   └── test-imports.js     # Advanced CJS functionality tests
├── esm-test/
│   ├── package.json        # ES Module test package config
│   ├── index.js            # Basic ESM import tests
│   └── test-imports.js     # Advanced ESM functionality tests
├── run-all-tests.js        # Automated test runner
└── README.md               # This file
```

## Quick Start

### 1. Build the Package

Before running compatibility tests, ensure the package is built:

```bash
npm run build
```

This generates the required output formats:
- `dist/cjs/` - CommonJS build
- `dist/esm/` - ES Module build  
- `dist/types/` - TypeScript declarations

### 2. Run All Tests

```bash
npm run test:compatibility
```

Or manually:

```bash
cd test-compatibility
node run-all-tests.js
```

### 3. Run Individual Test Suites

```bash
# CommonJS tests only
cd test-compatibility/cjs-test
npm test
npm run test:imports

# ESM tests only  
cd test-compatibility/esm-test
npm test
npm run test:imports
```

## Test Coverage

### CommonJS Tests (`cjs-test/`)

**Basic Tests (`index.js`):**
- Main package import validation
- Export availability checking
- Basic functionality verification
- Class instantiation testing

**Advanced Tests (`test-imports.js`):**
- Destructured imports
- Chain ID mapping validation
- Instance method verification
- Error handling testing
- Type structure validation

### ESM Tests (`esm-test/`)

**Basic Tests (`index.js`):**
- Dynamic import syntax
- Destructured import patterns
- Namespace imports
- Functionality validation

**Advanced Tests (`test-imports.js`):**
- Multiple import patterns
- Advanced destructuring with rest operators
- Comprehensive chain ID testing
- Class instantiation patterns
- Async method validation
- Re-export capability testing

## Expected Output

### Successful Test Run

```
🚀 Starting Comprehensive Import Compatibility Tests for wttp-handler

🔬 Validating test environment...
📌 Node.js version: v18.17.0
✅ Node.js version compatible

🔍 Checking prerequisites...
✅ Dist folder found
✅ All required dist folders found (cjs, esm, types)
✅ Package.json exports configuration found

📦 Installing test dependencies...
✅ Dependencies installed in cjs-test
✅ Dependencies installed in esm-test

📦 Running: CommonJS Basic Tests
✅ CommonJS Basic Tests - PASSED

📦 Running: CommonJS Advanced Tests  
✅ CommonJS Advanced Tests - PASSED

📦 Running: ESM Basic Tests
✅ ESM Basic Tests - PASSED

📦 Running: ESM Advanced Tests
✅ ESM Advanced Tests - PASSED

============================================================
📊 WTTP-HANDLER COMPATIBILITY TEST SUMMARY
============================================================
⏱️  Total Duration: 15.32s
✅ Passed: 4/4
❌ Failed: 0/4

🎉 ALL TESTS PASSED!
📦 wttp-handler is fully compatible with both CommonJS and ES Module environments
```

## What Gets Tested

### Core Exports Validation

All tests verify these main exports work correctly:

- **`WTTPHandler`** - Main class for WTTP operations
- **`getChainId`** - Chain ID resolution function
- **`wttpGET`** - GET method implementation
- **`wttpHEAD`** - HEAD method implementation  
- **`wttpLOCATE`** - LOCATE method implementation
- **`wttpOPTIONS`** - OPTIONS method implementation

### Chain ID Mapping Testing

Comprehensive validation of chain aliases:

```javascript
// String aliases
'mainnet' → 1
'ethereum' → 1  
'eth' → 1
'sepolia' → 11155111
'testnet' → 11155111
'polygon' → 137
'matic' → 137
'arbitrum' → 42161
'arb' → 42161
'base' → 8453
'localhost' → 31337

// Numeric strings
'1' → 1
'137' → 137
'11155111' → 11155111

// Error cases
'unknown' → null
'' → null
```

### Instance Method Verification

Tests verify these `WTTPHandler` methods are available:

- `fetch()` - Main fetch method
- `getGateway()` - Gateway connection  
- `connectProvider()` - Provider connection
- `formatResponse()` - Response formatting
- `isRedirect()` - Redirect detection
- `getAbsolutePath()` - Path resolution

## Troubleshooting

### Common Issues

1. **"Dist folder not found"**
   ```bash
   npm run build
   ```

2. **"Missing dist folders"**
   - Ensure all build scripts complete successfully
   - Check for TypeScript compilation errors

3. **Import/Export Errors**
   - Verify `package.json` exports configuration
   - Check that built files exist in expected locations

4. **Dependency Issues**
   - Clear node_modules: `rm -rf test-compatibility/*/node_modules`
   - Reinstall: Run tests again (auto-installs)

### Manual Debugging

To debug specific import issues:

```javascript
// Test CommonJS import manually
const wttp = require('wttp-handler');
console.log(Object.keys(wttp));

// Test ESM import manually  
const wttp = await import('wttp-handler');
console.log(Object.keys(wttp));
```

## Integration with CI/CD

Add to your GitHub Actions or CI pipeline:

```yaml
- name: Test Package Compatibility
  run: |
    npm run build
    npm run test:compatibility
```

## Extending the Tests

To add new tests:

1. **Add to existing files** - Modify test files in `cjs-test/` or `esm-test/`
2. **Add new test types** - Create additional scripts and update `run-all-tests.js`
3. **Test subpath exports** - If you add subpath exports to package.json, test them here

## Node.js Version Compatibility

Tested and supported on:
- ✅ Node.js 16.x (minimum)
- ✅ Node.js 18.x (recommended)  
- ✅ Node.js 20.x (latest)

## Related Documentation

- [Node.js Package Exports](https://nodejs.org/api/packages.html#exports)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Dual Package Hazard](https://nodejs.org/api/packages.html#dual-package-hazard) 