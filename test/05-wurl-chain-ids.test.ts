import { expect } from 'chai';
import { wURL } from '@wttp/core';

const simpleUrl = "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b/index.html";
const portUrl = "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:137/index.html";
const chainUrl = "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:11155111/index.html";
const testnetUrl = "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:testnet/index.html";

describe('wURL Chain ID Handling', () => {
    it("should handle simple URL without chain", () => {
        const url = new wURL(simpleUrl);
        expect(url.protocol).to.equal("wttp:");
        expect(url.hostname).to.equal("0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b");
        expect(url.port).to.equal("");
        expect(url.pathname).to.equal("/index.html");
        expect(url.alias).to.equal("");
    });

    it("should handle small numeric chain ID", () => {
        const url = new wURL(portUrl);
        expect(url.protocol).to.equal("wttp:");
        expect(url.hostname).to.equal("0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b");
        expect(url.port).to.equal("137");
        expect(url.pathname).to.equal("/index.html");
        expect(url.alias).to.equal("137");
    });

    it("should handle large chain ID like Sepolia (11155111)", () => {
        const url = new wURL(chainUrl);
        expect(url.protocol).to.equal("wttp:");
        expect(url.hostname).to.equal("0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b");
        expect(url.port).to.equal(""); // URL port limit
        expect(url.pathname).to.equal("/index.html");
        expect(url.alias).to.equal("11155111"); // Original chain preserved
    });

    it("should handle string chain names like testnet", () => {
        const url = new wURL(testnetUrl);
        expect(url.protocol).to.equal("wttp:");
        expect(url.hostname).to.equal("0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b");
        expect(url.port).to.equal(""); // String chains don't use port
        expect(url.pathname).to.equal("/index.html");
        expect(url.alias).to.equal("testnet");
    });

    it("should allow setting chain programmatically", () => {
        const url = new wURL(simpleUrl);
        
        // Set to large chain ID
        url.alias = "11155111";
        expect(url.port).to.equal("");
        expect(url.alias).to.equal("11155111");
        expect(url.toString()).to.include(":11155111");
        
        // Set to small chain ID
        url.port = "137";
        url.alias = "137";
        expect(url.port).to.equal("137");
        expect(url.alias).to.equal("137");
        expect(url.href).to.include(":137");
        
        // Set to string chain
        url.alias = "mainnet";
        expect(url.port).to.equal("137");
        expect(url.alias).to.equal("mainnet");
        expect(url.href).to.include(":137");
        expect(url.toString()).to.include(":mainnet");
    });

    it("should preserve URL operations", () => {
        const url = new wURL(chainUrl);
        
        // Test URL property changes
        url.hostname = "example.com";
        url.pathname = "/path.html";
        url.search = "?param=value";
        url.hash = "#fragment";
        
        expect(url.hostname).to.equal("example.com");
        expect(url.pathname).to.equal("/path.html");
        expect(url.search).to.equal("?param=value");
        expect(url.hash).to.equal("#fragment");
        expect(url.alias).to.equal("11155111"); // Chain should be preserved
        expect(url.port).to.equal(""); // Port should still be limited
    });

    it("should handle userinfo with chain", () => {
        const complexUrl = "wttp://user:pass@0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:11155111/path";
        const url = new wURL(complexUrl);
        
        expect(url.username).to.equal("user");
        expect(url.password).to.equal("pass");
        expect(url.hostname).to.equal("0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b");
        expect(url.port).to.equal("");
        expect(url.alias).to.equal("11155111");
    });
}); 