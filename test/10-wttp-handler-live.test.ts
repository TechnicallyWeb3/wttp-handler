import { expect } from "chai";
import { WTTPHandler, WTTPFetchOptions } from "../src/handler";
import { Method } from "@wttp/core";

describe("WTTP Handler - Live Site Testing & Edge Cases", function() {
    this.timeout(30000); // Increase timeout for network calls

    let wttp: WTTPHandler;
    const liveTestSite = "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:11155111";

    beforeEach(() => {
        wttp = new WTTPHandler();
    });

    describe("Live Site Content Fetching", function() {
        
        it("should fetch index.html from live site", async function() {
            const response = await wttp.fetch(`${liveTestSite}/index.html`);
            const body = await response.text();
            
            console.log("Index.html response:", {
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                bodyType: typeof body,
                bodyLength: body.length
            });
            
            expect(response.status).to.equal(200);
            expect(response.headers.get("Content-Type")).to.exist;
            expect(body).to.be.a("string");
            expect(body).to.include("html");
        });

        it("should fetch main.js from live site", async function() {
            const response = await wttp.fetch(`${liveTestSite}/main.js`);
            const body = await response.text();
            
            console.log("Main.js response:", {
                status: response.status,
                contentType: response.headers.get("Content-Type"),
                bodyLength: body.length
            });
            
            expect(response.status).to.equal(200);
            expect(response.headers.get("Content-Type")).to.include("javascript");
        });

        it("should fetch main.js.LICENSE.txt from live site", async function() {
            const response = await wttp.fetch(`${liveTestSite}/main.js.LICENSE.txt`);
            const body = await response.text();
            
            console.log("License file response:", {
                status: response.status,
                contentType: response.headers.get("Content-Type"),
                bodyLength: body.length
            });
            
            expect(response.status).to.equal(200);
            expect(body).to.be.a("string");
        });

        it("should fetch example/example.txt and analyze content", async function() {
            const response = await wttp.fetch(`${liveTestSite}/example/example.txt`);
            const content = await response.text();
            
            console.log("Example.txt response:", {
                status: response.status,
                contentType: response.headers.get("Content-Type"),
                bodyContent: content.substring(0, 200) + "..."
            });
            
            expect(response.status).to.equal(200);
            expect(content).to.be.a("string");
            
            console.log("📄 Example.txt content analysis:");
            console.log("- Length:", content.length, "characters");
            console.log("- Lines:", content.split('\n').length);
            console.log("- Contains 'example':", content.toLowerCase().includes('example'));
            console.log("- Contains 'test':", content.toLowerCase().includes('test'));
            console.log("- Contains 'wttp':", content.toLowerCase().includes('wttp'));
            console.log("- First 500 chars:", content.substring(0, 500));
            
            // Report what the example is about
            if (content.toLowerCase().includes('hello')) {
                console.log("🎯 Content appears to be a 'Hello' example");
            }
            if (content.toLowerCase().includes('demo')) {
                console.log("🎯 Content appears to be a demo file");
            }
            if (content.toLowerCase().includes('readme')) {
                console.log("🎯 Content appears to be documentation");
            }
        });

        it("should handle directory listing requests", async function() {
            try {
                const response = await wttp.fetch(`${liveTestSite}/example/`);
                
                console.log("Directory response:", {
                    status: response.status,
                    headers: Object.fromEntries(response.headers.entries()),
                    bodyType: typeof await response.text()
                });
                
                // Directory listings might return different status codes
                expect([200, 403, 404]).to.include(response.status);
            } catch (error) {
                console.log("🚨 Directory listing failed:", (error as Error).message);
                // This might be expected behavior
            }
        });

        it("should handle root directory request", async function() {
            const response = await wttp.fetch(`${liveTestSite}/`);
            const body = await response.text();
            
            console.log("Root directory response:", {
                status: response.status,
                bodyLength: body.length
            });

            console.log(body);
            
            expect(response.status).to.equal(200);
        });
    });

    describe("HTTP Method Testing", function() {
        
        it("should perform HEAD request on index.html", async function() {
            const response = await wttp.fetch(`${liveTestSite}/index.html`, { 
                method: Method.HEAD 
            });
            const body = await response.text();
            
            console.log("HEAD response:", {
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                bodyEmpty: body === ""
            });
            
            expect(response.status).to.equal(200);
            expect(body).to.equal("");
            expect(response.headers.get("Content-Length")).to.exist;
        });

        it("should perform OPTIONS request", async function() {
            const response = await wttp.fetch(`${liveTestSite}/index.html`, { 
                method: Method.OPTIONS 
            });
            
            console.log("OPTIONS response:", {
                status: response.status,
                allowedMethods: response.headers.get("Allowed-Methods"),
                headers: Object.fromEntries(response.headers.entries())
            });
            
            expect(response.status).to.be.a("number");
            expect(response.headers.get("Allowed-Methods")).to.exist;
        });

        it("should perform LOCATE request", async function() {
            const response = await wttp.fetch(`${liveTestSite}/index.html`, { 
                method: Method.LOCATE 
            });
            const body = await response.text();
            
            console.log("LOCATE response:", {
                status: response.status,
                bodyType: typeof body,
                bodyContent: typeof body === 'string' ? 
                    body.substring(0, 200) : 'Binary data'
            });
            
            expect(response.status).to.be.a("number");
        });
    });

    describe("Edge Cases & Error Conditions", function() {
        
        it("should handle non-existent file (404)", async function() {
            try {
                const response = await wttp.fetch(`${liveTestSite}/nonexistent-file.html`);
                console.log("Non-existent file response:", response.status);
                expect(response.status).to.equal(404);
            } catch (error) {
                console.log("🚨 404 handling threw error:", (error as Error).message);
                throw new Error(`BUG: 404 should return response, not throw error: ${(error as Error).message}`);
            }
        });

        it("should handle deeply nested paths", async function() {
            try {
                const response = await wttp.fetch(`${liveTestSite}/very/deep/nested/path/that/probably/doesnt/exist.html`);
                console.log("Deep path response status:", response.status);
                expect([404, 500]).to.include(response.status);
            } catch (error) {
                console.log("🚨 Deep path error:", (error as Error).message);
            }
        });

        it("should handle special characters in paths", async function() {
            const specialPaths = [
                "/file%20with%20spaces.html",
                "/file-with-dashes.html", 
                "/file_with_underscores.html",
                "/file.with.dots.html",
                "/UPPERCASE.HTML",
                "/file with spaces.html", // unencoded spaces
                "/file?query=value",
                "/file#fragment"
            ];

            for (const path of specialPaths) {
                try {
                    console.log(`Testing special path: ${path}`);
                    const response = await wttp.fetch(`${liveTestSite}${path}`);
                    console.log(`Special path ${path} returned:`, response.status);
                } catch (error) {
                    console.log(`🚨 Special path ${path} error:`, (error as Error).message);
                }
            }
        });

        it("should handle malformed URLs", async function() {
            const malformedUrls = [
                "wttp://invalid-address:11155111/file.html",
                "wttp://:11155111/file.html", // empty hostname
                "wttp://0xTOOSHORT:11155111/file.html", // invalid address
                "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:999999999/file.html", // invalid chain
            ];

            for (const url of malformedUrls) {
                try {
                    console.log(`Testing malformed URL: ${url}`);
                    const response = await wttp.fetch(url);
                    console.log(`🚨 BUG: Malformed URL ${url} should have failed but got status:`, response.status);
                } catch (error) {
                    console.log(`✅ Malformed URL ${url} correctly failed:`, (error as Error).message);
                }
            }
        });

        it("should handle range requests", async function() {
            try {
                const response = await wttp.fetch(`${liveTestSite}/main.js`, {
                    headers: {
                        rangeBytes: { start: 0n, end: 100n }
                    }
                });
                const body = await response.text();
                
                console.log("Range request response:", {
                    status: response.status,
                    bodyLength: body.length,
                    contentRange: response.headers.get("Content-Range")
                });
                
            } catch (error) {
                console.log("🚨 Range request error:", (error as Error).message);
            }
        });

        it("should handle conditional requests (If-Modified-Since)", async function() {
            try {
                const response = await wttp.fetch(`${liveTestSite}/index.html`, {
                    headers: {
                        ifModifiedSince: Date.now() // Should return 304 if not modified
                    }
                });
                
                console.log("Conditional request response:", {
                    status: response.status,
                    lastModified: response.headers.get("Last-Modified")
                });
                
            } catch (error) {
                console.log("🚨 Conditional request error:", (error as Error).message);
            }
        });

        it("should handle ETag validation", async function() {
            try {
                // First get the file to obtain ETag
                const firstResponse = await wttp.fetch(`${liveTestSite}/index.html`);
                const etag = firstResponse.headers.get("ETag");
                
                if (etag) {
                    // Then request with If-None-Match
                    const secondResponse = await wttp.fetch(`${liveTestSite}/index.html`, {
                        headers: {
                            ifNoneMatch: etag
                        }
                    });
                    
                    console.log("ETag validation response:", {
                        firstStatus: firstResponse.status,
                        etag: etag,
                        secondStatus: secondResponse.status
                    });
                }
            } catch (error) {
                console.log("🚨 ETag validation error:", (error as Error).message);
            }
        });
    });

    describe("Redirect Handling", function() {
        
        it("should follow redirects by default", async function() {
            // This would need a site that actually returns redirects
            // For now, just test the redirect setting
            const options: WTTPFetchOptions = { redirect: "follow" };
            expect(options.redirect).to.equal("follow");
        });

        it("should handle manual redirect mode", async function() {
            const options: WTTPFetchOptions = { redirect: "manual" };
            expect(options.redirect).to.equal("manual");
        });

        it("should handle error redirect mode", async function() {
            const options: WTTPFetchOptions = { redirect: "error" };
            expect(options.redirect).to.equal("error");
        });
    });

    describe("Chain ID and Gateway Testing", function() {
        
        it("should handle different chain aliases", async function() {
            const chainTests = [
                { alias: "sepolia", expected: 11155111 },
                { alias: "ethereum", expected: 1 },
                { alias: "mainnet", expected: 1 },
                { alias: "polygon", expected: 137 },
                { alias: "arbitrum", expected: 42161 }
            ];

            for (const test of chainTests) {
                const wttp = new WTTPHandler(undefined, test.alias);
                expect((wttp as any).defaultChain).to.equal(test.expected);
                console.log(`✅ Chain alias '${test.alias}' maps to ${test.expected}`);
            }
        });

        it("should handle invalid chain aliases", async function() {
            const invalidChains = ["invalid", "notachain", "123abc"];
            
            for (const chain of invalidChains) {
                try {
                    const wttp = new WTTPHandler(undefined, chain);
                    console.log(`Chain '${chain}' defaulted to:`, (wttp as any).defaultChain);
                } catch (error) {
                    console.log(`🚨 Invalid chain '${chain}' error:`, (error as Error).message);
                }
            }
        });
    });

    describe("Response Format Validation", function() {
        
        it("should validate response headers are properly formatted", async function() {
            const response = await wttp.fetch(`${liveTestSite}/index.html`);
            
            // Check required headers
            const requiredHeaders = [
                "Content-Length",
                "Content-Type", 
                "ETag",
                "Last-Modified"
            ];
            
            console.log("Response headers validation:");
            for (const header of requiredHeaders) {
                const value = response.headers.get(header);
                const exists = value !== null;
                console.log(`- ${header}: ${exists ? '✅' : '❌'} ${value || 'MISSING'}`);
                
                if (!exists) {
                    console.log(`🚨 BUG: Missing required header: ${header}`);
                }
            }
        });

        it("should validate Content-Type header format", async function() {
            const response = await wttp.fetch(`${liveTestSite}/index.html`);
            const contentType = response.headers.get("Content-Type");
            
            console.log("Content-Type analysis:", contentType);
            
            if (contentType) {
                expect(contentType).to.be.a("string");
                expect(contentType.length).to.be.greaterThan(0);
                
                // Should contain mime type
                expect(contentType).to.match(/^[a-zA-Z]+\/[a-zA-Z0-9\-\+]+/);
            } else {
                console.log("🚨 BUG: Content-Type header is missing");
            }
        });

        it("should validate numeric headers are properly converted", async function() {
            const response = await wttp.fetch(`${liveTestSite}/index.html`);
            
            const numericHeaders = [
                "Content-Length",
                "Last-Modified",
                "Content-Version"
            ];
            
            for (const header of numericHeaders) {
                const value = response.headers.get(header);
                if (value !== null) {
                    const parsed = parseInt(value);
                    console.log(`${header}: ${value} (parsed: ${parsed})`);
                    
                    if (isNaN(parsed)) {
                        console.log(`🚨 BUG: ${header} should be numeric but got: ${value}`);
                    }
                }
            }
        });
    });

    describe("Binary Data Handling", function() {
        
        it("should handle binary files correctly", async function() {
            // Try to fetch what might be a binary file
            try {
                const response = await wttp.fetch(`${liveTestSite}/main.js`);
                const body = await response.text();
                
                console.log("Binary data test:", {
                    bodyType: typeof body,
                    isString: typeof body === 'string',
                    length: body.length
                });
                
                // Body should be string when using text()
                expect(body).to.be.a('string');
            } catch (error) {
                console.log("🚨 Binary handling error:", (error as Error).message);
            }
        });
    });

    describe("Memory and Performance", function() {
        
        it("should handle multiple simultaneous requests", async function() {
            const requests = [
                wttp.fetch(`${liveTestSite}/index.html`),
                wttp.fetch(`${liveTestSite}/main.js`),
                wttp.fetch(`${liveTestSite}/main.js.LICENSE.txt`)
            ];
            
            try {
                const responses = await Promise.all(requests);
                const bodies = await Promise.all(responses.map(r => r.text()));
                console.log("Simultaneous requests results:", 
                    responses.map((r, i) => ({ status: r.status, size: bodies[i].length }))
                );
                
                responses.forEach(response => {
                    expect(response.status).to.equal(200);
                });
            } catch (error) {
                console.log("🚨 Simultaneous requests error:", (error as Error).message);
            }
        });

        it("should handle large file requests", async function() {
            // This might timeout or fail if files are too large
            try {
                const start = Date.now();
                const response = await wttp.fetch(`${liveTestSite}/main.js`);
                const body = await response.text();
                const elapsed = Date.now() - start;
                
                console.log("Large file performance:", {
                    time: elapsed + "ms",
                    size: body.length,
                    status: response.status
                });
                
            } catch (error) {
                console.log("🚨 Large file error:", (error as Error).message);
            }
        });
    });
}); 