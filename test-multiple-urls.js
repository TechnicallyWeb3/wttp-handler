#!/usr/bin/env node

const { WTTPHandler } = require('./dist/cjs/src/index.js');
const { Method } = require('@wttp/core');

// Parse command line arguments
const args = process.argv.slice(2);
const urlsFile = args[0];
const method = args[1] || 'GET';
const showHeaders = args.includes('--headers') || args.includes('-h');
const showBody = args.includes('--body') || args.includes('-b');
const timeout = parseInt(args.find(arg => arg.startsWith('--timeout='))?.split('=')[1]) || 30000;
const delay = parseInt(args.find(arg => arg.startsWith('--delay='))?.split('=')[1]) || 1000;

if (!urlsFile) {
    console.log('Usage: node test-multiple-urls.js <urls-file> [method] [options]');
    console.log('');
    console.log('Examples:');
    console.log('  node test-multiple-urls.js urls.txt');
    console.log('  node test-multiple-urls.js urls.txt HEAD --delay=2000');
    console.log('  node test-multiple-urls.js urls.txt GET --headers --timeout=60000');
    console.log('');
    console.log('Options:');
    console.log('  --headers, -h    Show response headers');
    console.log('  --body, -b       Show response body');
    console.log('  --timeout=ms     Set timeout in milliseconds (default: 30000)');
    console.log('  --delay=ms       Delay between requests in milliseconds (default: 1000)');
    console.log('');
    console.log('URLs file format: One wURL per line');
    console.log('Methods: GET, HEAD, OPTIONS, LOCATE');
    process.exit(1);
}

// Validate method
const validMethods = ['GET', 'HEAD', 'OPTIONS', 'LOCATE'];
if (!validMethods.includes(method.toUpperCase())) {
    console.error(`Error: Invalid method "${method}". Valid methods: ${validMethods.join(', ')}`);
    process.exit(1);
}

const fs = require('fs');

async function testMultipleUrls() {
    // Read URLs from file
    let urls;
    try {
        const content = fs.readFileSync(urlsFile, 'utf8');
        urls = content.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
    } catch (error) {
        console.error(`❌ Error reading file ${urlsFile}:`, error.message);
        process.exit(1);
    }

    if (urls.length === 0) {
        console.error('❌ No valid URLs found in file');
        process.exit(1);
    }

    const wttp = new WTTPHandler();
    
    console.log(`🌐 Testing ${urls.length} wURLs`);
    console.log(`📋 Method: ${method.toUpperCase()}`);
    console.log(`⏱️  Timeout: ${timeout}ms`);
    console.log(`⏳ Delay: ${delay}ms between requests`);
    console.log('');

    const results = [];

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`[${i + 1}/${urls.length}] Testing: ${url}`);

        try {
            const startTime = Date.now();
            
            const options = {
                method: Method[method.toUpperCase()],
            };

            const response = await Promise.race([
                wttp.fetch(url, options),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout')), timeout)
                )
            ]);

            const elapsed = Date.now() - startTime;
            const body = await response.text();

            const result = {
                url,
                status: response.status,
                time: elapsed,
                size: body.length,
                success: response.status === 200
            };

            results.push(result);

            console.log(`   ✅ ${response.status} (${elapsed}ms, ${body.length} bytes)`);

            if (showHeaders) {
                console.log('   📋 Headers:');
                for (const [key, value] of response.headers.entries()) {
                    console.log(`      ${key}: ${value}`);
                }
            }

            if (showBody && body) {
                console.log('   📄 Body:');
                if (body.length > 500) {
                    console.log('      ' + body.substring(0, 500) + '\n      ... (truncated)');
                } else {
                    console.log('      ' + body);
                }
            }

        } catch (error) {
            const result = {
                url,
                status: 0,
                time: 0,
                size: 0,
                success: false,
                error: error.message
            };

            results.push(result);
            console.log(`   ❌ Error: ${error.message}`);
        }

        // Delay between requests (except for the last one)
        if (i < urls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // Summary
    console.log('\n📊 Summary:');
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    const totalTime = results.reduce((sum, r) => sum + r.time, 0);
    const totalSize = results.reduce((sum, r) => sum + r.size, 0);
    const avgTime = totalTime / results.length;

    console.log(`   ✅ Successful: ${successful}/${results.length}`);
    console.log(`   ❌ Failed: ${failed}/${results.length}`);
    console.log(`   ⏱️  Total time: ${totalTime}ms`);
    console.log(`   ⏱️  Average time: ${avgTime.toFixed(0)}ms`);
    console.log(`   📏 Total data: ${totalSize} bytes`);

    if (failed > 0) {
        console.log('\n🚨 Failed URLs:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`   - ${r.url}: ${r.error || `Status ${r.status}`}`);
        });
    }

    // Save results to file
    const resultsFile = `test-results-${Date.now()}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsFile}`);
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n⏹️  Test interrupted by user');
    process.exit(0);
});

// Run the test
testMultipleUrls().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
});
