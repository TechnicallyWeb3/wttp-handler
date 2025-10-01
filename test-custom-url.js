#!/usr/bin/env node

const { WTTPHandler } = require('./dist/cjs/src/index.js');
const { Method } = require('@wttp/core');

// Parse command line arguments
const args = process.argv.slice(2);
const url = args[0];
const method = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-') && arg !== url) || 'GET';
const showHeaders = args.includes('--headers') || args.includes('-h');
const showBody = args.includes('--body') || args.includes('-b');
const timeout = parseInt(args.find(arg => arg.startsWith('--timeout='))?.split('=')[1]) || 30000;

if (!url) {
    console.log('Usage: node test-custom-url.js <wURL> [method] [options]');
    console.log('');
    console.log('Examples:');
    console.log('  node test-custom-url.js "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:11155111/index.html"');
    console.log('  node test-custom-url.js "wttp://wordl3.eth/index.html" HEAD');
    console.log('  node test-custom-url.js "wttp://0xc7E99e9fdf714B4A604c7224d7B14d2ef324b952:137/manifest.json" --headers --body');
    console.log('');
    console.log('Options:');
    console.log('  --headers, -h    Show response headers');
    console.log('  --body, -b       Show response body');
    console.log('  --timeout=ms     Set timeout in milliseconds (default: 30000)');
    console.log('');
    console.log('Methods: GET, HEAD, OPTIONS, LOCATE');
    process.exit(1);
}

// Validate method
const validMethods = ['GET', 'HEAD', 'OPTIONS', 'LOCATE'];
if (!validMethods.includes(method.toUpperCase())) {
    console.error(`Error: Invalid method "${method}". Valid methods: ${validMethods.join(', ')}`);
    process.exit(1);
}

async function testCustomUrl() {
    const wttp = new WTTPHandler();
    
    console.log(`🌐 Testing wURL: ${url}`);
    console.log(`📋 Method: ${method.toUpperCase()}`);
    console.log(`⏱️  Timeout: ${timeout}ms`);
    console.log('');

    try {
        const startTime = Date.now();
        
        const options = {
            method: Method[method.toUpperCase()],
            // Add timeout handling
        };

        const response = await Promise.race([
            wttp.fetch(url, options),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
        ]);

        const elapsed = Date.now() - startTime;
        const body = await response.text();

        console.log('✅ Response received:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Time: ${elapsed}ms`);
        console.log(`   Size: ${body.length} bytes`);

        if (showHeaders) {
            console.log('\n📋 Headers:');
            for (const [key, value] of response.headers.entries()) {
                console.log(`   ${key}: ${value}`);
            }
        }

        if (showBody && body) {
            console.log('\n📄 Body:');
            if (body.length > 1000) {
                console.log(body.substring(0, 1000) + '\n... (truncated)');
            } else {
                console.log(body);
            }
        }

        // Additional analysis
        console.log('\n🔍 Analysis:');
        if (response.status === 200) {
            console.log('   ✅ Success');
        } else if (response.status === 404) {
            console.log('   ❌ Not found');
        } else if (response.status >= 400) {
            console.log('   ⚠️  Error response');
        }

        const contentType = response.headers.get('Content-Type');
        if (contentType) {
            console.log(`   📄 Content-Type: ${contentType}`);
        }

        const contentLength = response.headers.get('Content-Length');
        if (contentLength) {
            console.log(`   📏 Content-Length: ${contentLength}`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.message.includes('timeout')) {
            console.error('   The request timed out. Try increasing the timeout with --timeout=60000');
        } else if (error.message.includes('execution reverted')) {
            console.error('   The contract call failed. This might be a 404 or invalid site.');
        } else if (error.message.includes('network')) {
            console.error('   Network error. Check your internet connection and RPC endpoint.');
        }
        
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n⏹️  Test interrupted by user');
    process.exit(0);
});

// Run the test
testCustomUrl().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
});
