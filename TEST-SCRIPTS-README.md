# WTTP Handler Test Scripts

This directory contains several scripts to help you test custom wURLs using the WTTP handler.

## Available Scripts

### 1. `test-custom-url.js` - Single URL Testing

Test a single wURL with various options.

**Usage:**
```bash
# Build the project first
npm run build

# Test a single URL
node test-custom-url.js "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:11155111/index.html"

# Test with different method
node test-custom-url.js "wttp://wordl3.eth/index.html" HEAD

# Show headers and body
node test-custom-url.js "wttp://0xc7E99e9fdf714B4A604c7224d7B14d2ef324b952:137/manifest.json" --headers --body

# Set custom timeout
node test-custom-url.js "wttp://example.eth/slow-file.html" --timeout=60000
```

**Options:**
- `--headers`, `-h`: Show response headers
- `--body`, `-b`: Show response body
- `--timeout=ms`: Set timeout in milliseconds (default: 30000)

**Methods:** GET, HEAD, OPTIONS, LOCATE

### 2. `test-custom-url.ts` - TypeScript Version

Same functionality as the JavaScript version but with TypeScript support.

**Usage:**
```bash
# Test a single URL with TypeScript
ts-node test-custom-url.ts "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:11155111/index.html"
```

### 3. `test-multiple-urls.js` - Batch Testing

Test multiple URLs from a file with configurable delays.

**Usage:**
```bash
# Test multiple URLs from file
node test-multiple-urls.js sample-urls.txt

# Test with custom delay between requests
node test-multiple-urls.js sample-urls.txt GET --delay=2000

# Show headers and set timeout
node test-multiple-urls.js sample-urls.txt HEAD --headers --timeout=60000
```

**Options:**
- `--headers`, `-h`: Show response headers
- `--body`, `-b`: Show response body
- `--timeout=ms`: Set timeout in milliseconds (default: 30000)
- `--delay=ms`: Delay between requests in milliseconds (default: 1000)

### 4. `sample-urls.txt` - Sample URLs File

Contains example wURLs for testing, including:
- Live test sites on Sepolia and Polygon
- ENS domains
- Non-existent files (for 404 testing)

## Running the Scripts

### Prerequisites

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

### Quick Start

1. **Test a single URL:**
   ```bash
   node test-custom-url.js "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:11155111/index.html"
   ```

2. **Test multiple URLs:**
   ```bash
   node test-multiple-urls.js sample-urls.txt
   ```

3. **Run the full test suite:**
   ```bash
   npm test
   ```

## Example Output

### Single URL Test
```
🌐 Testing wURL: wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:11155111/index.html
📋 Method: GET
⏱️  Timeout: 30000ms

✅ Response received:
   Status: 200
   Time: 1250ms
   Size: 1024 bytes

🔍 Analysis:
   ✅ Success
   📄 Content-Type: text/html; charset=utf-8
   📏 Content-Length: 1024
```

### Batch Test Summary
```
📊 Summary:
   ✅ Successful: 8/10
   ❌ Failed: 2/10
   ⏱️  Total time: 12500ms
   ⏱️  Average time: 1250ms
   📏 Total data: 8192 bytes

🚨 Failed URLs:
   - wttp://example.eth/nonexistent.html: Error: execution reverted
   - wttp://invalid.eth/test.html: Error: execution reverted

💾 Results saved to: test-results-1703123456789.json
```

## Troubleshooting

### Common Issues

1. **"Request timeout"**
   - Increase timeout with `--timeout=60000`
   - Check your internet connection

2. **"execution reverted"**
   - Usually means 404 (file not found)
   - Check if the wURL is correct
   - Verify the site exists on the blockchain

3. **"Network error"**
   - Check your internet connection
   - Verify RPC endpoints are working

4. **"Invalid method"**
   - Use one of: GET, HEAD, OPTIONS, LOCATE
   - Check method name spelling

### Debug Mode

For more detailed debugging, you can modify the scripts to add console.log statements or use the existing test suite:

```bash
# Run specific test file
npm test -- --grep "Live Site Content Fetching"

# Run with verbose output
npm test -- --reporter spec
```

## Integration with Existing Tests

The existing test suite in `test/10-wttp-handler-live.test.ts` provides comprehensive testing including:
- Live site content fetching
- HTTP method testing
- Edge cases and error conditions
- Redirect handling
- Chain ID and gateway testing
- Response format validation
- Binary data handling
- Memory and performance testing

You can run these tests with:
```bash
npm test
```

## Contributing

Feel free to modify these scripts for your specific testing needs. The scripts are designed to be simple and extensible.
