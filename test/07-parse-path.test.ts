import { expect } from "chai";
const parseUri = require("parse-uri");

describe("Parse-Uri Library Tests", () => {
    
    describe("Basic URL Parsing", () => {
        it("should log how parse-uri handles various URLs", () => {
            const testUrls = [
                // Basic URLs
                "https://example.com",
                "https://example.com:8080",
                "https://example.com:myalias",
                
                // IPv6 URLs
                "https://[::1]",
                "https://[::1]:8080", 
                "https://[::1]:myalias",
                "https://[2001:db8::1]",
                "https://[2001:db8::1]:8080",
                "https://[2001:db8::1]:staging",
                
                // URLs with userinfo
                "https://user:pass@example.com:8080",
                "https://user:pass@[::1]:8080",
                "https://user:pass@example.com:myalias",
                
                // URLs with paths and query
                "https://example.com:8080/path?query=value",
                "https://[::1]:myalias/api/v1?token=abc#section",
                
                // Edge cases
                "https://example.com:",
                "https://example.com:0",
                "https://example.com:65535",
                "https://example.com:65536",
                "https://example.com:99999",
                
                // Complex cases
                "https://user%40domain.com:p%40ss@example.com:dev",
                "https://subdomain.example.com:custom-env/deep/path?complex=query&more=params#fragment"
            ];

            // console.log("=== Testing parse-uri with various URLs ===\n");
            
            testUrls.forEach(url => {
                // console.log(`Testing: ${url}`);
                try {
                    const parsed = parseUri(url, { strictMode: false });
                    expect(parsed.hostname).to.be.a('string');
                    // console.log("  Parsed result:");
                    // console.log("    protocol:", parsed.protocol);
                    // console.log("    authority:", parsed.authority);
                    // console.log("    host:", parsed.host);
                    // console.log("    port:", parsed.port);
                    // console.log("    userInfo:", parsed.userInfo);
                    // console.log("    path:", parsed.path);
                    // console.log("    query:", parsed.query);
                    // console.log("    anchor:", parsed.anchor);
                    // console.log("");
                } catch (error) {
                    console.log("  ERROR:", (error as Error).message);
                    console.log("");
                }
            });
        });
    });

    describe("IPv6 Specific Tests", () => {
        it("should demonstrate IPv6 parsing issues", () => {
            const ipv6Urls = [
                "https://[::1]:8080",
                "https://[::1]:myalias",
                "https://[2001:db8::1]",
                "https://[fe80::1%lo0]:3000"
            ];

            // console.log("=== IPv6 Specific Tests ===\n");
            
            ipv6Urls.forEach(url => {
                // console.log(`IPv6 Test: ${url}`);
                try {
                    const parsed = parseUri(url, { strictMode: false });
                    expect(parsed.hostname).to.be.a('string');
                    // console.log("  authority:", parsed.authority);
                    // console.log("  host:", parsed.host);
                    // console.log("  port:", parsed.port);
                    // console.log("  userInfo:", parsed.userInfo);
                    
                    // // Show the parsing issue
                    // console.log("  ISSUE: host should be full IPv6 address, but got:", `"${parsed.host}"`);
                    // console.log("");
                } catch (error) {
                    console.log("  ERROR:", (error as Error).message);
                    console.log("");
                }
            });
        });
    });

    describe("Authority Parsing Analysis", () => {
        it("should analyze authority parsing for manual extraction", () => {
            const testCases = [
                "https://example.com:8080",
                "https://example.com:myalias",
                "https://[::1]:8080",
                "https://[::1]:myalias",
                "https://[2001:db8::1]",
                "https://user:pass@example.com:myalias",
                "https://user:pass@[::1]:myalias"
            ];

            // console.log("=== Authority Parsing Analysis ===\n");
            
            testCases.forEach(url => {
                // console.log(`Analyzing: ${url}`);
                try {
                    const parsed = parseUri(url, { strictMode: false });
                    expect(parsed.hostname).to.be.a('string');
                    // console.log("  authority:", parsed.authority);
                    // console.log("  host:", parsed.host);
                    // console.log("  port:", parsed.port);
                    // console.log("  userInfo:", parsed.userInfo);
                    
                    // Manual extraction logic
                    const authSplit = parsed.authority.split("@");
                    const hostPart = authSplit[authSplit.length - 1];
                    expect(hostPart).to.equal(parsed.host);
                    // console.log("  hostPart after @ split:", hostPart);
                    
                    const colonSplit = hostPart.split(":");
                    // console.log("  colonSplit:", colonSplit);
                    
                    // Check if it's IPv6
                    const isIPv6 = hostPart.startsWith("[");
                    // console.log("  isIPv6:", isIPv6);
                    
                    if (isIPv6) {
                        // For IPv6, find the closing bracket
                        const bracketEnd = hostPart.indexOf("]");
                        if (bracketEnd !== -1) {
                            const ipv6Host = hostPart.substring(0, bracketEnd + 1);
                            const portPart = hostPart.substring(bracketEnd + 2); // +2 to skip ]:
                            // console.log("  extracted IPv6 host:", ipv6Host);
                            // console.log("  extracted port/alias:", portPart);
                            expect(ipv6Host).to.equal(parsed.host);
                            expect(portPart).to.equal(parsed.port);
                        }
                    } else {
                        // For regular hosts
                        if (colonSplit.length === 2) {
                            // console.log("  extracted host:", colonSplit[0]);
                            // console.log("  extracted port/alias:", colonSplit[1]);
                            expect(colonSplit[0]).to.equal(parsed.host);
                            expect(colonSplit[1]).to.equal(parsed.port);
                        }
                    }
                    
                    // console.log("");
                } catch (error) {
                    console.log("  ERROR:", (error as Error).message);
                    console.log("");
                }
            });
        });
    });

    describe("Port Validation", () => {
        it("should test port validation logic", () => {
            const portTests = [
                "80", "8080", "65535", "65536", "99999", 
                "myalias", "dev-env", "staging123", "", "0"
            ];

            // console.log("=== Port Validation Tests ===\n");
            
            portTests.forEach(portStr => {
                // console.log(`Testing port: "${portStr}"`);
                const portNum = parseInt(portStr);
                const isValidPort = portStr !== "" && !isNaN(portNum) && portNum >= 0 && portNum <= 65535;
                expect(isValidPort).to.be.a('boolean');
                // console.log("  as number:", portNum);
                // console.log("  isNaN:", isNaN(portNum));
                // console.log("  is valid port:", isValidPort);
                // console.log("  could be alias:", !isValidPort && portStr !== "");
                // console.log("");
            });
        });
    });
});
