import { expect } from 'chai';
import { wURL } from '../src/wurl';

describe('Comparing URLs and wURLs', () => {

    const simpleUrl = "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b";
    const chainUrl = "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:137";
    const highChainUrl = "wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:11155111";
    const relativePath = "./relative.html";
    const complexUrl = "wttp://user:pass@0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5b:137/index.html?chain=sepolia&protocol=wttp#fragment";

    it("should compare URLs and wURLs", () => {
        const url = new URL(simpleUrl);
        const wurl = new wURL(simpleUrl);
        expect(url.href).to.equal(wurl.href);
        expect(url.port).to.equal(wurl.port);
        expect(wurl.chain).to.be.undefined;
        expect(url.hostname).to.equal(wurl.hostname);
        expect(url.href).to.equal(wurl.href);
    });

    it("should compare URLs and wURLs with a chain", () => {
        const url = new URL(chainUrl);
        const wurl = new wURL(chainUrl);
        expect(url.href).to.equal(wurl.href);
        expect(url.port).to.equal(wurl.port);
        expect(wurl.chain).to.equal(url.port);
    });

    it("should compare URLs and wURLs with a high chain", () => {
        expect(() => new URL(highChainUrl)).to.throw("Invalid URL");
        const wurl = new wURL(highChainUrl);
        expect(wurl.href).to.equal(highChainUrl);
        expect(wurl.port).to.equal("65535");
        expect(wurl.chain).to.equal("11155111");
    });

    it("should compare URLs and wURLs with a relative path", () => {
        expect(() => new URL(relativePath)).to.throw("Invalid URL");
        expect(() => new wURL(relativePath)).to.throw("Invalid URL");
    });

    it("should compare URLs and wURLs with a complex URL", () => {
        const url = new URL(complexUrl);
        const wurl = new wURL(complexUrl);
        expect(url.href).to.equal(wurl.href);
        expect(url.port).to.equal(wurl.port);
        expect(wurl.chain).to.equal(url.port);
        expect(url.username).to.equal(wurl.username);
        expect(url.password).to.equal(wurl.password);
        expect(url.pathname).to.equal(wurl.pathname);
        expect(url.search).to.equal(wurl.search);
        expect(url.hash).to.equal(wurl.hash);
    });
});