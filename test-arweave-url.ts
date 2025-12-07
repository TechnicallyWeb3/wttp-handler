#!/usr/bin/env ts-node

import { WTTPHandler } from './src/index';
import { Method } from '@wttp/core';

const testUrl = "wttp://0x2AEe04875F979bD77a887fBCF342D9C54e741f0a:137/hexgrid.png";

async function testArweaveResolution(): Promise<void> {
    const wttp = new WTTPHandler(undefined, "polygon");
    
    console.log(`🌐 Fetching WTTP URL: ${testUrl}`);
    console.log('(Expecting a 301 redirect with ar:// in Location header, then automatic resolution)');
    console.log('');

    try {
        const startTime = Date.now();
        const response = await wttp.fetch(testUrl);
        const elapsed = Date.now() - startTime;

        console.log('✅ Response received:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Time: ${elapsed}ms`);
        console.log('');

        // Show all headers
        console.log('📋 Headers:');
        for (const [key, value] of response.headers.entries()) {
            console.log(`   ${key}: ${value}`);
        }
        console.log('');

        // Get body
        const body = await response.arrayBuffer();
        console.log(`📄 Body:`);
        console.log(`   Size: ${body.byteLength} bytes`);
        console.log('');

        // Analysis
        console.log('🔍 Analysis:');
        if (response.status === 200) {
            console.log('   ✅ Success! Redirect was followed and Arweave content was fetched.');
            
            const contentType = response.headers.get('Content-Type');
            if (contentType) {
                console.log(`   📄 Content-Type: ${contentType}`);
            }
            
            // Check if it looks like an image (PNG)
            if (contentType && contentType.includes('image')) {
                console.log('   🖼️  This appears to be an image file!');
            }
            
            // Show first few bytes to verify it's binary data
            const uint8Array = new Uint8Array(body);
            if (uint8Array.length > 0) {
                const preview = Array.from(uint8Array.slice(0, 8))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join(' ');
                console.log(`   🔢 First 8 bytes (hex): ${preview}`);
                
                // PNG files start with: 89 50 4E 47 0D 0A 1A 0A
                if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && 
                    uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
                    console.log('   ✅ This is a valid PNG file!');
                }
            }
        } else if (response.status >= 300 && response.status < 400) {
            console.log(`   🔄 Redirect response (${response.status})`);
            const location = response.headers.get('Location');
            if (location) {
                console.log(`   📍 Location: ${location}`);
                if (location.startsWith('ar://')) {
                    console.log('   ⚠️  Arweave URI found but redirect was not followed automatically');
                    console.log('   (This might be expected if redirect mode is set to "manual")');
                }
            }
        } else if (response.status === 404) {
            console.log('   ❌ Not found');
        } else if (response.status >= 400) {
            console.log('   ⚠️  Error response');
        }

    } catch (error) {
        console.error('❌ Error:', (error as Error).message);
        console.error((error as Error).stack);
        process.exit(1);
    }
}

// Run the test
testArweaveResolution().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
});
