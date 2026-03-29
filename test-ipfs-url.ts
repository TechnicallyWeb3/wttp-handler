#!/usr/bin/env ts-node

import { WTTPHandler } from "./src/index";

// Well-known IPFS sample root (gateways return 200; often HTML listing, not a /readme.txt child).
const testUrl = "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";

async function testIpfsResolution(): Promise<void> {
    const wttp = new WTTPHandler();

    console.log(`Fetching IPFS URI: ${testUrl}`);
    console.log("(Expecting gateway HTTP 200; body is often HTML from the public gateway)");
    console.log("");

    try {
        const startTime = Date.now();
        const response = await wttp.fetch(testUrl);
        const elapsed = Date.now() - startTime;

        console.log("Response received:");
        console.log(`   Status: ${response.status}`);
        console.log(`   Time: ${elapsed}ms`);
        console.log("");

        if (!response.ok) {
            console.error(`Smoke test failed: expected 2xx, got ${response.status}`);
            process.exit(1);
        }

        const text = await response.text();
        console.log(`Body length: ${text.length} chars`);
        if (text.length > 0) {
            const preview = text.slice(0, 200).replace(/\n/g, "\\n");
            console.log(`Preview: ${preview}${text.length > 200 ? "..." : ""}`);
        }
    } catch (error) {
        console.error("Error:", (error as Error).message);
        console.error((error as Error).stack);
        process.exit(1);
    }
}

testIpfsResolution().catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
});
