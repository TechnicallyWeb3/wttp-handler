import { expect } from "chai";

describe("Basic wttp:// URL Testing", function() {

    const successUrls = [
        "wttp://tw3.eth",
        "wttp://tw3.eth/",
        "wttp://tw3.eth/index.html",
        "wttp://tw3.eth:1",
        "wttp://tw3.eth:137",
        "wttp://tw3.eth:137/index.html",
        "wttp://tw3.eth:137/index.html?chain=sepolia",
        "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb",
        "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb/",
        "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb/index.html",
        "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:1",
        "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:137",
        "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:137/index.html",
        "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:137/index.html?chain=sepolia",
        "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:137/index.html?chain=sepolia#fragment",
        "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:137/index.html?chain=sepolia#fragment",
    ];

    const failureUrls = [
        "0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb",
        "0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb/",
        "0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb/index.html",
        "0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:1",
        "0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:137",
        "0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:137/index.html",
        "0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:137/index.html?chain=sepolia",
        "0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:137/index.html?chain=sepolia#fragment",
        "0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:137/index.html?chain=sepolia#fragment",
        "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:11155111",
        "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:65536",
    ];

    describe("Native URL Constructor with wttp:// protocol", function() {
        successUrls.forEach((successUrl, index) => {
            it(`should create URL object from: ${successUrl}`, function() {
                expect(() => {
                    const url = new URL(successUrl);
                    console.log(`URL ${index + 1} created successfully:`, {
                        protocol: url.protocol,
                        hostname: url.hostname,
                        port: url.port,
                        pathname: url.pathname
                    });
                }).to.not.throw();
            });
        });
    });

    describe("URL Properties Extraction", function() {
        successUrls.forEach((successUrl, index) => {
            it(`should extract properties from: ${successUrl}`, function() {
                try {
                    const url = new URL(successUrl);
                    
                    console.log(`\nURL ${index + 1} properties:`, {
                        href: url.href,
                        protocol: url.protocol,
                        hostname: url.hostname,
                        port: url.port,
                        pathname: url.pathname,
                        host: url.host
                    });

                    // Basic expectations
                    expect(url.protocol).to.equal('wttp:');
                    expect(url.hostname).to.be.a('string');
                    expect(url.pathname).to.be.a('string');
                    
                } catch (error) {
                    console.log(`URL ${index + 1} failed to parse:`, (error as Error).message);
                    throw error;
                }
            });
        });
    });

    describe("Alternative URL Construction Methods", function() {
        it("should try different hostname encodings", function() {
            const alternatives = [
                // Try encoding the 0x
                "wttp://[0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb]/index.html",
                // Try without 0x
                "wttp://faC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb/index.html",
                // Try with different separator
                "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb.eth/index.html"
            ];

            alternatives.forEach((alt, index) => {
                console.log(`\nTrying alternative ${index + 1}: ${alt}`);
                try {
                    const url = new URL(alt);
                    console.log(`✅ Alternative ${index + 1} SUCCESS:`, {
                        protocol: url.protocol,
                        hostname: url.hostname,
                        pathname: url.pathname
                    });
                } catch (error) {
                    console.log(`❌ Alternative ${index + 1} FAILED:`, (error as Error).message);
                }
            });
        });
    });

    describe("Manual URL Parsing", function() {
        it("should manually parse wttp URLs", function() {
            const testUrl = "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:11155111/index.html";
            
            // Manual parsing as backup
            const match = testUrl.match(/^wttp:\/\/([^:\/]+)(?::(\d+))?(.*)$/);
            
            if (match) {
                const [, hostname, port, pathname] = match;
                console.log("Manual parsing result:", {
                    hostname,
                    port,
                    pathname: pathname || '/'
                });
                
                expect(hostname).to.equal("0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb");
                expect(port).to.equal("11155111");
                expect(pathname).to.equal("/index.html");
            } else {
                throw new Error("Manual parsing failed");
            }
        });
    });

    // describe("Chain Alias Testing", function() {
    //     aliasUrls.forEach((testUrl, index) => {
    //         it(`should create URL with chain alias: ${testUrl}`, function() {
    //             try {
    //                 const url = new URL(testUrl);
    //                 console.log(`\nChain Alias URL ${index + 1} properties:`, {
    //                     href: url.href,
    //                     protocol: url.protocol,
    //                     hostname: url.hostname,
    //                     port: url.port,
    //                     pathname: url.pathname,
    //                     host: url.host
    //                 });

    //                 // Basic expectations
    //                 expect(url.protocol).to.equal('wttp:');
    //                 expect(url.hostname).to.be.a('string');
    //                 expect(url.port).to.be.a('string');
    //                 expect(url.pathname).to.be.a('string');
                    
    //                 console.log(`✅ Chain alias "${url.port}" works as port!`);
                    
    //             } catch (error) {
    //                 console.log(`❌ Chain alias URL ${index + 1} failed:`, (error as Error).message);
    //                 throw error;
    //             }
    //         });
    //     });
    // });

    describe("Port Number Limitations", function() {
        it("should test different port number formats", function() {
            const portTests = [
                // Valid numeric ports
                "wttp://0xabc:80/test",
                "wttp://0xabc:443/test",
                "wttp://0xabc:1337/test",
                "wttp://0xabc:8080/test",
                "wttp://0xabc:65535/test", // Max valid port
                // Invalid large numbers
                "wttp://0xabc:65536/test", // Just over max
                "wttp://0xabc:11155111/test", // Sepolia chain ID
                // String ports
                "wttp://0xabc:sepolia/test",
                "wttp://0xabc:mainnet/test",
                // Zero and edge cases
                "wttp://0xabc:0/test",
                "wttp://0xabc:01/test", // Leading zero
            ];

            portTests.forEach(testUrl => {
                console.log(`\nTesting port in: ${testUrl}`);
                try {
                    const url = new URL(testUrl);
                    console.log(`✅ Port "${url.port}" works (hostname: ${url.hostname})`);
                } catch (error) {
                    console.log(`❌ Failed: ${(error as Error).message}`);
                }
            });
        });
    });

    describe("Small Numeric Chain Aliases", function() {
        it("should test small numeric aliases for chain IDs", function() {
            const smallAliasTests = [
                // Small numeric aliases that could map to chains
                "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:1/index.html",      // mainnet
                "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:11/index.html",     // sepolia alias?
                "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:1337/index.html",  // localhost
                "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:8453/index.html",  // base (still within range)
                "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:137/index.html",   // polygon?
                "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:42161/index.html", // arbitrum (within range)
            ];

            smallAliasTests.forEach((testUrl, index) => {
                console.log(`\nTesting small alias ${index + 1}: ${testUrl}`);
                try {
                    const url = new URL(testUrl);
                    console.log(`✅ Small alias "${url.port}" works!`, {
                        href: url.href,
                        host: url.host,
                        hostname: url.hostname,
                        port: url.port,
                        pathname: url.pathname
                    });
                } catch (error) {
                    console.log(`❌ Failed: ${(error as Error).message}`);
                }
            });
        });

        it("should demonstrate the solution: map large chain IDs to small aliases", function() {
            // Proposed mapping system
            const chainIdToAlias = {
                1: 1,           // mainnet -> 1 (direct)
                11155111: 11,   // sepolia -> 11 (small alias)
                8453: 8453,     // base -> 8453 (direct, still in range)
                31337: 1337,    // localhost -> 1337 (direct)
                137: 137,       // polygon -> 137 (direct) 
                42161: 42161,   // arbitrum -> 42161 (direct, in range)
            };

            console.log("\nProposed Chain ID to Port Alias Mapping:");
            Object.entries(chainIdToAlias).forEach(([chainId, alias]) => {
                console.log(`Chain ${chainId} -> Port ${alias}`);
                const testUrl = `wttp://0xabc:${alias}/test`;
                try {
                    new URL(testUrl);
                    console.log(`✅ Alias ${alias} works for chain ${chainId}`);
                } catch (error) {
                    console.log(`❌ Alias ${alias} failed for chain ${chainId}`);
                }
            });
        });
    });

    describe("URL with Different Protocols", function() {
        it("should test what protocols work", function() {
            const protocols = [
                "http://example.com/path",
                "https://example.com/path", 
                "ftp://example.com/path",
                "wttp://example.com/path",
                "custom://example.com/path",
                "git+custom//:example.com/path",
                "file:///test/file.txt",
                "custom:@tw3.eth/path",
            ];

            protocols.forEach(testUrl => {
                console.log(`\nTesting protocol: ${testUrl}`);
                try {
                    const url = new URL(testUrl);
                    console.log(`✅ ${url.protocol} protocol works`);
                } catch (error) {
                    console.log(`❌ Failed: ${(error as Error).message}`);
                }
            });
        });
    });

    describe("URL.parse() testing", function() {
        it("should test URL.parse()", function() {
            const url = URL.parse("wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b/index.html");
            console.log(JSON.stringify(url));
        });
    });

    describe("URL Testing", function() {
        it("what happens when we pass 2 base urls into the constructor", function() {
            const url = new URL("wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:137/index.html");
            const url2 = new URL("wttp://tw3.eth:1/index.html", url);
            console.log(url2.href);
            expect(url2.port).to.equal("1");
            expect(url.port).to.equal("137");
        });
        it("what happens when we pass only a relative path", function() {
            const url = new URL("wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:137/index.html");
            const url2 = new URL("./relative.html", url);
            console.log(url2.href);
            expect(() => new URL("./only-path.html")).to.throw("Invalid URL");
        });
    });
});
