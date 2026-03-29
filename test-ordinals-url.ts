#!/usr/bin/env ts-node

import { WTTPHandler } from "./src/index";

// Genesis inscription - the first Bitcoin Ordinals inscription
const genesisInscriptionId =
    "6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799";
const testUrl = `ord://${genesisInscriptionId}:0`;

async function testOrdinalsResolution(): Promise<void> {
    const wttp = new WTTPHandler();

    console.log(`Fetching Ordinals URI: ${testUrl}`);
    console.log(
        `(Resolved to: https://ordinals.com/content/${genesisInscriptionId}i0)`
    );
    console.log("(Expecting gateway HTTP 200 with inscription content)");
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
            console.error(
                `Smoke test failed: expected 2xx, got ${response.status}`
            );
            process.exit(1);
        }

        const contentType = response.headers.get("content-type") || "";
        console.log(`Content-Type: ${contentType}`);

        const buffer = await response.arrayBuffer();
        console.log(`Body size: ${buffer.byteLength} bytes`);

        if (buffer.byteLength > 0) {
            const uint8 = new Uint8Array(buffer);
            const hexPreview = Array.from(uint8.slice(0, 8))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join(" ");
            console.log(`First 8 bytes (hex): ${hexPreview}`);
        }

        console.log("");
        console.log("Success! Ordinals gateway resolved correctly.");
    } catch (error) {
        console.error("Error:", (error as Error).message);
        console.error((error as Error).stack);
        process.exit(1);
    }
}

testOrdinalsResolution().catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
});
