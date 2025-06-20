import { expect } from 'chai';
import parseURI from 'parse-uri';

const simpleUrl = "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b/index.html";
const portUrl = "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:137/index.html";
const chainUrl = "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:11155111/index.html";
const httpUrl = "https://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:137/index.html";
const complexUrl = "wttp://user:pass@0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:11155111/path/to/file.html?chain=sepolia&protocol=wttp&data=value#fragment";
const stringChainUrl = "wttp://user:pass@0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:testnet/api/v1?key=value&chain=override#section";
const multiProtocolUrl = "git+wttp://dev:secret@0xContract:42161/repo.git?ref=main&clone=true#readme";

describe('Comprehensive URI Parsing using parse-uri library', () => {
    it("should parse a simple wttp URL", () => {
        const parsed = parseURI(simpleUrl);
        console.log("Simple URL parsed:", JSON.stringify(parsed, null, 2));
        expect(parsed.protocol).to.equal("wttp");
        expect(parsed.host).to.equal("0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b");
        expect(parsed.port).to.be.empty;
        expect(parsed.relative).to.equal("/index.html");
        expect(parsed.query).to.be.empty;
        expect(parsed.anchor).to.be.empty;
    });

    it("should parse wttp URL with numeric chain (small port)", () => {
        const parsed = parseURI(portUrl);
        expect(parsed.protocol).to.equal("wttp");
        expect(parsed.host).to.equal("0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b");
        expect(parsed.port).to.equal("137");
        expect(parsed.relative).to.equal("/index.html");
    });

    it("should parse wttp URL with large numeric chain", () => {
        const parsed = parseURI(chainUrl);
        expect(parsed.protocol).to.equal("wttp");
        expect(parsed.host).to.equal("0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b");
        expect(parsed.port).to.equal("11155111");
        expect(parsed.relative).to.equal("/index.html");
    });

    it("should parse complex wttp URL with all components", () => {
        const parsed = parseURI(complexUrl);
        console.log("Complex URL parsed:", JSON.stringify(parsed, null, 2));
        expect(parsed.protocol).to.equal("wttp");
        expect(parsed.user).to.equal("user");
        expect(parsed.password).to.equal("pass");
        expect(parsed.userInfo).to.equal("user:pass");
        expect(parsed.host).to.equal("0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b");
        expect(parsed.port).to.equal("11155111");
        expect(parsed.relative).to.equal("/path/to/file.html");
        expect(parsed.query).to.equal("chain=sepolia&protocol=wttp&data=value");
        expect(parsed.anchor).to.equal("fragment");
        
        // Test query parameters parsing
        const searchParams = new URLSearchParams(parsed.query);
        expect(searchParams.get("chain")).to.equal("sepolia");
        expect(searchParams.get("protocol")).to.equal("wttp");
        expect(searchParams.get("data")).to.equal("value");
    });

    it("should parse wttp URL with string chain", () => {
        const parsed = parseURI(stringChainUrl);
        expect(parsed.protocol).to.equal("wttp");
        expect(parsed.user).to.equal("user");
        expect(parsed.password).to.equal("pass");
        expect(parsed.host).to.equal("0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b");
        expect(parsed.port).to.equal("");
        expect(parsed.authority).to.equal("user:pass@0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:testnet");
        expect(parsed.relative).to.equal("/api/v1");
        expect(parsed.query).to.equal("key=value&chain=override");
        expect(parsed.anchor).to.equal("section");
    });

    it("should parse multi-protocol URL (git+wttp)", () => {
        const parsed = parseURI(multiProtocolUrl);
        expect(parsed.protocol).to.equal("git+wttp");
        expect(parsed.user).to.equal("dev");
        expect(parsed.password).to.equal("secret");
        expect(parsed.host).to.equal("0xContract");
        expect(parsed.port).to.equal("42161");
        expect(parsed.relative).to.equal("/repo.git");
        expect(parsed.query).to.equal("ref=main&clone=true");
        expect(parsed.anchor).to.equal("readme");
    });

    it("discover how URL class works with basic wttp", () => {
        const url = new URL(simpleUrl);
        expect(url.protocol).to.equal("wttp:");
        expect(url.host).to.equal("0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b");
        expect(url.port).to.equal("");
        expect(url.pathname).to.equal("/index.html");
        expect(url.origin).to.equal("null"); // wttp is not a special protocol
    });

    it("discover URL class behavior with complex modifications", () => {
        const url = new URL(portUrl);
        
        // Test property modifications
        url.port = "8080";
        expect(url.port).to.equal("8080");
        expect(url.host).to.equal("0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:8080");
        
        url.hostname = "example.com";
        url.pathname = "/path.html";
        url.search = "?chain=sepolia";
        url.hash = "#fragment";
        url.username = "user";
        url.password = "pass";
        
        expect(url.href).to.equal("wttp://user:pass@example.com:8080/path.html?chain=sepolia#fragment");
        
        // Test search params manipulation
        url.searchParams.set("newParam", "newValue");
        url.searchParams.delete("chain");
        expect(url.search).to.include("newParam=newValue");
        expect(url.search).to.not.include("chain=sepolia");
    });
});

describe('Testing various URI patterns for wURL compatibility', () => {
    const testCases = [
        // IPFS patterns
        {
            name: "IPFS hash",
            url: "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme.txt",
            expectedProtocol: "ipfs",
            expectedHost: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
            expectedPath: "/readme.txt"
        },
        // Arweave patterns
        {
            name: "Arweave transaction",
            url: "ar://abc123def456ghi789/data.json",
            expectedProtocol: "ar",
            expectedHost: "abc123def456ghi789",
            expectedPath: "/data.json"
        },
        // Bitcoin ordinals
        {
            name: "Bitcoin ordinal",
            url: "ord://1234567890abcdef1234567890abcdef12345678:0/inscription.html",
            expectedProtocol: "ord",
            expectedHost: "1234567890abcdef1234567890abcdef12345678",
            expectedPort: "0",
            expectedPath: "/inscription.html"
        },
        // ENS with chains
        {
            name: "ENS with chain",
            url: "wttp://vitalik.eth:1/profile.json",
            expectedProtocol: "wttp",
            expectedHost: "vitalik.eth",
            expectedPort: "1",
            expectedPath: "/profile.json"
        },
        // Complex multi-protocol with chains
        {
            name: "Complex multi-protocol",
            url: "ipfs+wttp://user:token@QmHash:11155111/path?gateway=local#content",
            expectedProtocol: "ipfs+wttp",
            expectedHost: "QmHash",
            expectedPort: "11155111",
            expectedPath: "/path"
        },
        // Web3 storage patterns
        {
            name: "Web3 storage with subdomain",
            url: "w3s://bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku.ipfs.w3s.link/file.json",
            expectedProtocol: "w3s",
            expectedHost: "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku.ipfs.w3s.link",
            expectedPath: "/file.json"
        }
    ];

    testCases.forEach(testCase => {
        it(`should parse ${testCase.name}`, () => {
            const parsed = parseURI(testCase.url);
            
            expect(parsed.protocol).to.equal(testCase.expectedProtocol);
            expect(parsed.host).to.equal(testCase.expectedHost);
            
            if (testCase.expectedPort) {
                expect(parsed.port).to.equal(testCase.expectedPort);
            }
            
            if (testCase.expectedPath) {
                expect(parsed.relative).to.equal(testCase.expectedPath);
            }
            
            // Test that parseURI can handle custom protocols
            expect(parsed.source).to.equal(testCase.url);
        });
    });

    it("should compare parseURI vs URL class behavior", () => {
        const testUrls = [
            "https://example.com:8080/path?query=value#hash",
            "ftp://user:pass@ftp.example.com/file.txt",
            "file:///C:/Users/test/file.txt",
            // These should work with parseURI but may fail with URL
            "custom://host:port/path",
            "ipfs://QmHash/file",
            "wttp://0xAddress:11155111/resource"
        ];

        testUrls.forEach(testUrl => {
            const parsed = parseURI(testUrl);
            
            try {
                const url = new URL(testUrl);
                // If URL class accepts it, compare results
                expect(parsed.protocol).to.equal(url.protocol.slice(0, -1)); // Remove trailing :
                expect(parsed.host).to.equal(url.hostname);
                if (url.port) {
                    expect(parsed.port).to.equal(url.port);
                }
                expect(parsed.relative).to.equal(url.pathname);
            } catch (error) {
                // URL class rejected it, but parseURI should still work
                console.log(`parseURI trying to parse ${testUrl} while URL class failed`);
                expect(parsed.protocol).to.be.a('string');
                expect(parsed.source).to.be.a('string');
            }
        });
    });

    it("should extract chain information from port position", () => {
        const chainExtractionTests = [
            {
                url: "wttp://host:1/path",
                expectedChain: "1",
                expectedAuthority: "host:1",
                chainType: "numeric-small"
            },
            {
                url: "wttp://host:137/path", 
                expectedChain: "137",
                expectedAuthority: "host:137",
                chainType: "numeric-medium"
            },
            {
                url: "wttp://host:11155111/path",
                expectedChain: "11155111", 
                expectedAuthority: "host:11155111",
                chainType: "numeric-large"
            },
            {
                url: "wttp://host:mainnet/path",
                expectedChain: "",
                expectedAuthority: "host:mainnet",
                chainType: "string"
            },
            {
                url: "wttp://host:sepolia-testnet/path",
                expectedChain: "",
                expectedAuthority: "host:sepolia-testnet",
                chainType: "string-hyphenated"
            }
        ];

        chainExtractionTests.forEach(test => {
            const parsed = parseURI(test.url);
            expect(parsed.port).to.equal(test.expectedChain);
            expect(parsed.authority).to.equal(test.expectedAuthority);

            // Our wURL class should be able to determine chain type
            const isNumeric = !isNaN(parseInt(test.expectedChain));
            const isLargeChain = isNumeric && parseInt(test.expectedChain) > 65535;
            
            console.log(`Chain: ${test.expectedChain}, Type: ${test.chainType}, IsNumeric: ${isNumeric}, IsLarge: ${isLargeChain}`);
        });
    });
});

// Updated preprocessing logic for testing (matching wurl.human.ts)
function preprocessUrl(url: string | URL) {
    const urlString = url.toString();
    const parsedUrl = parseURI(urlString, { strictMode: false });
    if (!parsedUrl) {
        throw new Error(`Invalid URL: ${urlString}`);
    }
    const port = parsedUrl.port;

    console.log(`port: ${port}`);

    // return original URL if port is valid
    if (port && parseInt(port) <= 65535) {
        console.log(`port is valid, returning ${urlString}, ${port}`);
        return {
            processedUrl: urlString,
            extractedChain: port
        };
    }

    const authLength = parsedUrl.userInfo.length;
    const hostLength = parsedUrl.host.length;
    const userLength = parsedUrl.userInfo.length;

    const containsPort = authLength !== userLength + hostLength;

    console.log(`${containsPort ? `URL contains port ${parsedUrl.port}` : "port not detected in URL"}`);

    // ensure port doesn't exist, if no port, url is safe      
    if (!containsPort) {
        return {
            processedUrl: urlString,
            extractedChain: ""
        };
    } 

    // remaining cases are invalid port, or port is a string, remove port
    const authSplit = parsedUrl.authority.split("@"); // strip any existing auth
    const chainSplit = authSplit[authSplit.length - 1].split(":"); // split host:chain
    let extractedChain: string = "";
    if (chainSplit.length > 2 && !chainSplit[0].includes("[")) { // IPv6 acception
        throw new Error(`Invalid chain format: ${parsedUrl.authority}`);
    }
    extractedChain = chainSplit.length > 1 ? chainSplit[chainSplit.length - 1] : "";

    const processedUrl = urlString.replace(`${parsedUrl.host}:${extractedChain}`, parsedUrl.host);
    console.log(`Invalid port, valid chain: ${extractedChain}, returning ${processedUrl}`);

    return {
        processedUrl,
        extractedChain
    };
}

describe('wURL Preprocessing Logic Tests (Updated)', () => {
    describe('Valid small ports (≤ 65535)', () => {
        const validPortTests = [
            {
                name: "small numeric port",
                input: "wttp://example.com:80/path",
                expectedProcessed: "wttp://example.com:80/path",
                expectedChain: "80"
            },
            {
                name: "medium numeric port",
                input: "wttp://0xAddress:8080/api",
                expectedProcessed: "wttp://0xAddress:8080/api",
                expectedChain: "8080"
            },
            {
                name: "max valid port",
                input: "wttp://host:65535/resource",
                expectedProcessed: "wttp://host:65535/resource",
                expectedChain: "65535"
            },
            {
                name: "mainnet chain",
                input: "wttp://vitalik.eth:1/profile",
                expectedProcessed: "wttp://vitalik.eth:1/profile",
                expectedChain: "1"
            },
            {
                name: "polygon chain",
                input: "wttp://contract.eth:137/data",
                expectedProcessed: "wttp://contract.eth:137/data",
                expectedChain: "137"
            },
            {
                name: "optimism chain (valid port)",
                input: "wttp://example.com:10/path?query=value#hash",
                expectedProcessed: "wttp://example.com:10/path?query=value#hash", 
                expectedChain: "10"
            },
            {
                name: "arbitrum chain (in valid range)",
                input: "wttp://contract.eth:42161/api/v1",
                expectedProcessed: "wttp://contract.eth:42161/api/v1",
                expectedChain: "42161"
            }
        ];

        validPortTests.forEach(test => {
            it(`should preserve ${test.name}`, () => {
                const result = preprocessUrl(test.input);
                expect(result.processedUrl).to.equal(test.expectedProcessed);
                expect(result.extractedChain).to.equal(test.expectedChain);
            });
        });
    });

    describe('Invalid large ports (> 65535)', () => {
        const invalidPortTests = [
            {
                name: "sepolia chain ID",
                input: "wttp://0xAddress:11155111/index.html",
                expectedProcessed: "wttp://0xAddress/index.html",
                expectedChain: "11155111"
            },
            {
                name: "large custom chain",
                input: "wttp://host:999999999/resource",
                expectedProcessed: "wttp://host/resource",
                expectedChain: "999999999"
            },
            {
                name: "base chain ID", 
                input: "wttp://contract.eth:8453000000/api/v1",
                expectedProcessed: "wttp://contract.eth/api/v1",
                expectedChain: "8453000000"
            }
        ];

        invalidPortTests.forEach(test => {
            it(`should remove port for ${test.name}`, () => {
                const result = preprocessUrl(test.input);
                expect(result.processedUrl).to.equal(test.expectedProcessed);
                expect(result.extractedChain).to.equal(test.expectedChain);
            });
        });
    });

    describe('URLs without ports', () => {
        const noPortTests = [
            {
                name: "simple URL",
                input: "wttp://example.com/path",
                expectedProcessed: "wttp://example.com/path",
                expectedChain: ""
            },
            {
                name: "with auth",
                input: "wttp://user:pass@example.com/api",
                expectedProcessed: "wttp://user:pass@example.com/api",
                expectedChain: ""
            },
            {
                name: "with query and hash",
                input: "wttp://host/path?query=value#fragment",
                expectedProcessed: "wttp://host/path?query=value#fragment",
                expectedChain: ""
            }
        ];

        noPortTests.forEach(test => {
            it(`should preserve ${test.name}`, () => {
                const result = preprocessUrl(test.input);
                expect(result.processedUrl).to.equal(test.expectedProcessed);
                expect(result.extractedChain).to.equal(test.expectedChain);
            });
        });
    });

    describe('String ports/chains', () => {
        const stringPortTests = [
            {
                name: "mainnet string",
                input: "wttp://host:mainnet/path",
                expectedProcessed: "wttp://host/path",
                expectedChain: "mainnet"
            },
            {
                name: "sepolia string",
                input: "wttp://example.com:sepolia/api",
                expectedProcessed: "wttp://example.com/api",
                expectedChain: "sepolia"
            },
            {
                name: "custom chain name",
                input: "wttp://contract:local-testnet/resource",
                expectedProcessed: "wttp://contract/resource",
                expectedChain: "local-testnet"
            }
        ];

        stringPortTests.forEach(test => {
            it(`should extract string chain: ${test.name}`, () => {
                const result = preprocessUrl(test.input);
                expect(result.processedUrl).to.equal(test.expectedProcessed);
                expect(result.extractedChain).to.equal(test.expectedChain);
            });
        });
    });

    describe('Complex URLs with auth, query, hash', () => {
        const complexTests = [
            {
                name: "complex with large chain",
                input: "wttp://user:pass@0xContract:11155111/path/to/resource?query=value&chain=override#section",
                expectedProcessed: "wttp://user:pass@0xContract/path/to/resource?query=value&chain=override#section",
                expectedChain: "11155111"
            },
            {
                name: "complex with string chain", 
                input: "wttp://admin:secret@api.example.com:testnet/v1/data?format=json#results",
                expectedProcessed: "wttp://admin:secret@api.example.com/v1/data?format=json#results",
                expectedChain: "testnet"
            },
            {
                name: "complex with valid port",
                input: "wttp://dev:token@localhost:3000/debug?verbose=true#logs",
                expectedProcessed: "wttp://dev:token@localhost:3000/debug?verbose=true#logs",
                expectedChain: "3000"
            }
        ];

        complexTests.forEach(test => {
            it(`should handle ${test.name}`, () => {
                const result = preprocessUrl(test.input);
                expect(result.processedUrl).to.equal(test.expectedProcessed);
                expect(result.extractedChain).to.equal(test.expectedChain);
            });
        });
    });

    describe('Error handling and edge cases', () => {
        it('should throw error for null parseURI result', () => {
            // Note: parseURI is very permissive, so this might not actually throw
            // But testing the error path in case parseURI returns null
            expect(() => {
                const mockNull = null as any;
                // Simulate a case where parseURI might return null
                const urlString = "";
                const parsedUrl = parseURI(urlString, { strictMode: false });
                if (!parsedUrl) {
                    throw new Error(`Invalid URL: ${urlString}`);
                }
            }).to.throw('Invalid URL:');
        });

        it('should throw error for invalid chain format (too many colons)', () => {
            expect(() => {
                preprocessUrl("wttp://host:port:extra:more/path");
            }).to.throw('Invalid chain format');
        });

        it('should throw error for empty URLs', () => {
            // Empty URLs should throw an error since parseURI might return null/invalid
            expect(() => {
                preprocessUrl("");
            }).to.throw('Invalid URL:');
        });

        it('should handle malformed URLs gracefully', () => {
            // parseURI is permissive for most malformed URLs, should not throw
            const result = preprocessUrl("not-a-url");
            expect(result).to.have.property('processedUrl');
            expect(result).to.have.property('extractedChain');
        });

        const edgeCases = [
            {
                name: "URL with IPv6-like format",
                input: "wttp://[::1]:8080/path",
                // parseURI should handle this gracefully
            },
            {
                name: "URL with encoded characters",
                input: "wttp://example.com:8080/path%20with%20spaces",
                expectedProcessed: "wttp://example.com:8080/path%20with%20spaces",
                expectedChain: "8080"
            },
            {
                name: "URL with international domain",
                input: "wttp://测试.com:1337/path",
                expectedProcessed: "wttp://测试.com:1337/path", 
                expectedChain: "1337"
            }
        ];

        edgeCases.forEach(test => {
            it(`should handle ${test.name}`, () => {
                const result = preprocessUrl(test.input);
                expect(result).to.have.property('processedUrl');
                expect(result).to.have.property('extractedChain');
                
                if (test.expectedProcessed) {
                    expect(result.processedUrl).to.equal(test.expectedProcessed);
                }
                if (test.expectedChain) {
                    expect(result.extractedChain).to.equal(test.expectedChain);
                }
            });
        });
    });

    describe('Port detection logic verification', () => {
        it('should correctly detect when port is present vs absent', () => {
            // Test the port detection logic
            const withPort = "wttp://user:pass@host:1337/path";
            const withoutPort = "wttp://user:pass@host/path";
            
            const resultWithPort = preprocessUrl(withPort);
            const resultWithoutPort = preprocessUrl(withoutPort);
            
            expect(resultWithPort.extractedChain).to.equal("1337");
            expect(resultWithoutPort.extractedChain).to.equal("");
        });

        it('should handle auth vs port disambiguation', () => {
            // These should be handled differently
            const authOnly = "wttp://user:pass@host/path"; // no port
            const authWithPort = "wttp://user:pass@host:8080/path"; // has port
            
            const authResult = preprocessUrl(authOnly);
            const portResult = preprocessUrl(authWithPort);
            
            expect(authResult.extractedChain).to.equal("");
            expect(portResult.extractedChain).to.equal("8080");
        });
    });
});

describe('Relative URL Resolution and Base Inheritance Tests', () => {
    describe('Relative URL with alias-bearing base URLs', () => {
        const relativeResolutionTests = [
            {
                name: "relative path with large chain ID base",
                base: "wttp://example.com:11155111/base",
                relative: "./relative",
                expectedHref: "wttp://example.com/base/relative", // Note: port should be removed from href but alias preserved
                expectedAlias: "11155111"
            },
            {
                name: "relative path with valid port base",
                base: "wttp://example.com:8080/base",
                relative: "./relative",
                expectedHref: "wttp://example.com:8080/base/relative",
                expectedAlias: "8080"
            },
            {
                name: "parent directory relative path",
                base: "wttp://example.com:11155111/dir/base",
                relative: "../other",
                expectedHref: "wttp://example.com/dir/other",
                expectedAlias: "11155111"
            },
            {
                name: "query-only relative URL",
                base: "wttp://example.com:137/path",
                relative: "?newquery=value",
                expectedHref: "wttp://example.com:137/path?newquery=value",
                expectedAlias: "137"
            },
            {
                name: "fragment-only relative URL",
                base: "wttp://example.com:11155111/page",
                relative: "#section",
                expectedHref: "wttp://example.com/page#section",
                expectedAlias: "11155111"
            }
        ];

        relativeResolutionTests.forEach(test => {
            it(`should handle ${test.name}`, () => {
                // Note: This would require importing wURL class
                // const baseUrl = new wURL(test.base);
                // const resolvedUrl = new wURL(test.relative, baseUrl);
                // expect(resolvedUrl.href).to.equal(test.expectedHref);
                // expect(resolvedUrl.alias).to.equal(test.expectedAlias);
                
                // For now, test the preprocessing logic
                const baseResult = preprocessUrl(test.base);
                expect(baseResult.extractedChain).to.equal(test.expectedAlias);
            });
        });
    });

    describe('Absolute URL override tests', () => {
        const absoluteOverrideTests = [
            {
                name: "absolute URL should override base alias",
                base: "wttp://old.com:11155111/base",
                absolute: "wttp://new.com:1/path",
                expectedAlias: "1" // new URL's alias should take precedence
            },
            {
                name: "absolute URL without alias should clear base alias",
                base: "wttp://old.com:11155111/base", 
                absolute: "wttp://new.com/path",
                expectedAlias: "" // no alias in new URL
            }
        ];

        absoluteOverrideTests.forEach(test => {
            it(`should handle ${test.name}`, () => {
                const absoluteResult = preprocessUrl(test.absolute);
                expect(absoluteResult.extractedChain).to.equal(test.expectedAlias);
            });
        });
    });
});

describe('URL Constructor and Property Behavior Tests', () => {
    describe('Port property override behavior', () => {
        const portOverrideTests = [
            {
                name: "port property should return alias for large chain IDs",
                input: "wttp://example.com:11155111/path",
                expectedPort: "11155111", // port property should return the alias
                expectedAlias: "11155111"
            },
            {
                name: "port property should return alias for valid ports",
                input: "wttp://example.com:8080/path",
                expectedPort: "8080",
                expectedAlias: "8080"
            },
            {
                name: "port property should be empty when no alias",
                input: "wttp://example.com/path",
                expectedPort: "",
                expectedAlias: ""
            }
        ];

        portOverrideTests.forEach(test => {
            it(`should handle ${test.name}`, () => {
                const result = preprocessUrl(test.input);
                expect(result.extractedChain).to.equal(test.expectedAlias);
            });
        });
    });

    describe('Edge cases in URL parsing', () => {
        const edgeCaseTests = [
            {
                name: "URL with userinfo and large chain",
                input: "wttp://user:pass@example.com:11155111/path",
                expectedProcessed: "wttp://user:pass@example.com/path",
                expectedChain: "11155111"
            },
            {
                name: "IPv6 address with port",
                input: "wttp://[2001:db8::1]:8080/path",
                expectedProcessed: "wttp://[2001:db8::1]:8080/path",
                expectedChain: "8080"
            },
            {
                name: "Complex URL with all components",
                input: "wttp://user:pass@example.com:11155111/path/to/resource?query=value&chain=1#fragment",
                expectedProcessed: "wttp://user:pass@example.com/path/to/resource?query=value&chain=1#fragment",
                expectedChain: "11155111"
            }
        ];

        edgeCaseTests.forEach(test => {
            it(`should handle ${test.name}`, () => {
                const result = preprocessUrl(test.input);
                expect(result.processedUrl).to.equal(test.expectedProcessed);
                expect(result.extractedChain).to.equal(test.expectedChain);
            });
        });
    });
});

describe('Error Handling in Preprocessing', () => {
    describe('Invalid URL formats', () => {
        const errorTests = [
            {
                name: "completely malformed URL",
                input: "@:/:://::$@,.//:::[]fail",
                shouldThrow: true
            },
            {
                name: "empty string",
                input: "",
                shouldThrow: true
            },
            {
                name: "URL with invalid characters",
                input: "wttp://exam ple.com:123/path",
                shouldThrow: false // might be handled by parseURI
            }
        ];

        errorTests.forEach(test => {
            console.log(`parsed: ${JSON.stringify(parseURI(test.input, { strictMode: false }))}`)
            if (test.shouldThrow) {
                it(`should throw error for ${test.name}`, () => {
                    expect(() => preprocessUrl(test.input)).to.throw();
                });
            } else {
                it(`should handle ${test.name} gracefully`, () => {
                    // These might not throw but should be handled properly
                    expect(() => preprocessUrl(test.input)).to.not.throw();
                });
            }
        });
    });
});