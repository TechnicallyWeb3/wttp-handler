import { expect } from "chai";
import { wURL } from "@wttp/core";
import parseUri from "parse-uri";

describe("wURL Human Tests", () => {
    
    describe("Basic Functionality", () => {
        it("should handle regular URL with valid port", () => {
            const url = new wURL("https://example.com:8080");
            expect(url.alias).to.equal("8080");
            expect(url.port).to.equal("8080");
            expect(url.href).to.equal("https://example.com:8080/");
            expect(url.toString()).to.equal("https://example.com:8080/");
        });

        it("should handle URL without port", () => {
            const url = new wURL("https://example.com");
            expect(url.alias).to.equal("");
            expect(url.port).to.equal("");
            expect(url.href).to.equal("https://example.com/");
            expect(url.toString()).to.equal("https://example.com/");
        });

        it("should handle URL with path and query", () => {
            const url = new wURL("https://example.com:8080/path?query=value");
            expect(url.alias).to.equal("8080");
            expect(url.port).to.equal("8080");
            expect(url.href).to.equal("https://example.com:8080/path?query=value");
            expect(url.toString()).to.equal("https://example.com:8080/path?query=value");
        });
    });

    describe("Alias Behavior", () => {
        it("should handle URL with string alias (invalid port)", () => {
            const url = new wURL("https://example.com:myalias");
            expect(url.alias).to.equal("myalias");
            expect(url.port).to.equal(""); // stripped for super()
            expect(url.href).to.equal("https://example.com/"); // compliant URL
            expect(url.toString()).to.equal("https://example.com:myalias/"); // extended context
        });

        it("should handle URL with numeric string alias", () => {
            const url = new wURL("https://example.com:99999"); // invalid port number
            expect(url.alias).to.equal("99999");
            expect(url.port).to.equal(""); // stripped because > 65535
            expect(url.href).to.equal("https://example.com/");
            expect(url.toString()).to.equal("https://example.com:99999/");
        });

        it("should handle URL with alphanumeric alias", () => {
            const url = new wURL("https://example.com:dev123");
            expect(url.alias).to.equal("dev123");
            expect(url.port).to.equal("");
            expect(url.href).to.equal("https://example.com/");
            expect(url.toString()).to.equal("https://example.com:dev123/");
        });

        it("should handle URL with alias containing special characters", () => {
            const url = new wURL("https://example.com:my-alias_v2");
            expect(url.alias).to.equal("my-alias_v2");
            expect(url.port).to.equal("");
            expect(url.href).to.equal("https://example.com/");
            expect(url.toString()).to.equal("https://example.com:my-alias_v2/");
        });
    });

    describe("IPv6 Support", () => {
        it.skip("should handle IPv6 with valid port", () => {
            // this test is skipped because parse-uri doesn't fully support ipv6 urls
            const url = new wURL("https://[::1]:8080");
            const parsedUrl = parseUri(url.href);
            console.log("Parsed URL:", JSON.stringify(parsedUrl));
            expect(url.alias).to.equal("8080");
            expect(url.port).to.equal("8080");
            expect(url.href).to.equal("https://[::1]:8080/");
            expect(url.toString()).to.equal("https://[::1]:8080/");
        });

        it("should handle IPv6 with string alias", () => {
            const originalUrl = "https://[::1]:myalias";
            console.log("Original URL:", originalUrl);
            
            // Test if native URL can handle this
            try {
                const nativeUrl = new URL(originalUrl);
                console.log("Native URL worked:", nativeUrl.href);
            } catch (error) {
                console.log(`Native URL failed: ${error}`);
            }
            
            const preprocessed = wURL.preprocessUrl(originalUrl);
            console.log("Preprocessed:", preprocessed);
            
            // Test if native URL can handle the preprocessed URL
            try {
                const nativeUrlPreprocessed = new URL(preprocessed.processedUrl);
                console.log("Native URL with preprocessed worked:", nativeUrlPreprocessed.href);
            } catch (error) {
                console.log(`Native URL with preprocessed failed: ${error}`);
            }
            
            const url = new wURL(originalUrl);
            expect(url.alias).to.equal("myalias");
            expect(url.port).to.equal("");
            expect(url.href).to.equal("https://[::1]/");
            expect(url.toString()).to.equal("https://[::1]:myalias/");
        });

        it("should handle IPv6 without port", () => {
            const originalUrl = "https://[2001:db8::1]";
            console.log("Original URL:", originalUrl);
            
            // Test if native URL can handle this
            try {
                const nativeUrl = new URL(originalUrl);
                console.log("Native URL worked:", nativeUrl.href);
            } catch (error) {
                console.log(`Native URL failed: ${error}`);
            }
            
            const preprocessed = wURL.preprocessUrl(originalUrl);
            console.log("Preprocessed:", preprocessed);

            expect(preprocessed.processedUrl).to.equal(originalUrl);
            
            // Test if native URL can handle the preprocessed URL
            try {
                const nativeUrlPreprocessed = new URL(preprocessed.processedUrl);
                console.log("Native URL with preprocessed worked:", nativeUrlPreprocessed.href);
            } catch (error) {
                console.log(`Native URL with preprocessed failed: ${error}`);
            }
            
            const url = new wURL(originalUrl);
            expect(url.alias).to.equal("");
            expect(url.port).to.equal("");
            expect(url.href).to.equal("https://[2001:db8::1]/");
            expect(url.toString()).to.equal("https://[2001:db8::1]/");
        });
    });

    describe("URLs with UserInfo", () => {
        it("should handle URL with userinfo and valid port", () => {
            const url = new wURL("https://user:pass@example.com:8080");
            expect(url.alias).to.equal("8080");
            expect(url.port).to.equal("8080");
            expect(url.href).to.equal("https://user:pass@example.com:8080/");
            expect(url.toString()).to.equal("https://user:pass@example.com:8080/");
        });

        it("should handle URL with userinfo and string alias", () => {
            const url = new wURL("https://user:pass@example.com:myalias");
            expect(url.alias).to.equal("myalias");
            expect(url.port).to.equal("");
            expect(url.href).to.equal("https://user:pass@example.com/");
            expect(url.toString()).to.equal("https://user:pass@example.com:myalias/");
        });

        it("should handle URL with complex userinfo", () => {
            const url = new wURL("https://user%40domain.com:p%40ss@example.com:dev");
            expect(url.alias).to.equal("dev");
            expect(url.port).to.equal("");
            expect(url.href).to.equal("https://user%40domain.com:p%40ss@example.com/");
            expect(url.toString()).to.equal("https://user%40domain.com:p%40ss@example.com:dev/");
        });
    });

    describe("Constructor Variations", () => {
        it("should preserve alias when copying wURL", () => {
            const original = new wURL("https://example.com:myalias");
            const copy = new wURL(original);
            expect(copy.alias).to.equal("myalias");
            expect(copy.port).to.equal("");
            expect(copy.href).to.equal("https://example.com/");
            expect(copy.toString()).to.equal("https://example.com:myalias/");
        });

        it("should handle relative URL with wURL base", () => {
            const base = new wURL("https://example.com:myalias");
            const relative = new wURL("./path", base);
            expect(relative.alias).to.equal("myalias");
            expect(relative.href).to.equal("https://example.com/path");
            expect(relative.toString()).to.equal("https://example.com:myalias/path");
        });

        it("should handle absolute path with wURL base", () => {
            const base = new wURL("https://example.com:myalias/oldpath");
            console.log("Base URL created successfully");
            
            const relativeUrl = "/newpath";
            console.log("Relative URL:", relativeUrl);
            
            const preprocessed = wURL.preprocessUrl(relativeUrl, base);
            console.log("Preprocessed:", preprocessed);
            
            const absolute = new wURL(relativeUrl, base);
            expect(absolute.alias).to.equal("myalias");
            expect(absolute.href).to.equal("https://example.com/newpath");
            expect(absolute.toString()).to.equal("https://example.com:myalias/newpath");
        });

        it("should handle regular URL base with alias", () => {
            const base = new URL("https://example.com:8080");
            const wurl = new wURL("./path", base);
            expect(wurl.alias).to.equal("8080"); // inherited from base processing
            expect(wurl.href).to.equal("https://example.com:8080/path");
            expect(wurl.toString()).to.equal("https://example.com:8080/path");
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty alias gracefully", () => {
            const url = new wURL("https://example.com:");
            expect(url.alias).to.equal("");
            expect(url.port).to.equal("");
            expect(url.href).to.equal("https://example.com/");
            expect(url.toString()).to.equal("https://example.com/");
        });

        it("should handle port 0", () => {
            const url = new wURL("https://example.com:0");
            expect(url.alias).to.equal("0");
            expect(url.port).to.equal("0");
            expect(url.href).to.equal("https://example.com:0/");
            expect(url.toString()).to.equal("https://example.com:0/");
        });

        it("should handle maximum valid port", () => {
            const url = new wURL("https://example.com:65535");
            expect(url.alias).to.equal("65535");
            expect(url.port).to.equal("65535");
            expect(url.href).to.equal("https://example.com:65535/");
            expect(url.toString()).to.equal("https://example.com:65535/");
        });

        it("should handle port just above maximum", () => {
            const url = new wURL("https://example.com:65536");
            expect(url.alias).to.equal("65536");
            expect(url.port).to.equal(""); // invalid port, stripped
            expect(url.href).to.equal("https://example.com/");
            expect(url.toString()).to.equal("https://example.com:65536/");
        });
    });

    describe("URL Inheritance", () => {
        it("should maintain URL properties", () => {
            const url = new wURL("https://user:pass@example.com:myalias/path?query=value#fragment");
            expect(url.protocol).to.equal("https:");
            expect(url.hostname).to.equal("example.com");
            expect(url.pathname).to.equal("/path");
            expect(url.search).to.equal("?query=value");
            expect(url.hash).to.equal("#fragment");
            expect(url.username).to.equal("user");
            expect(url.password).to.equal("pass");
        });

        it("should be instanceof URL", () => {
            const url = new wURL("https://example.com:myalias");
            expect(url instanceof URL).to.equal(true);
            expect(url instanceof wURL).to.equal(true);
        });
    });

    describe("Error Handling", () => {
        it("should throw on invalid URL", () => {
            expect(() => new wURL("not-a-url")).to.throw();
        });

        it("should throw on invalid alias format with multiple colons", () => {
            expect(() => new wURL("https://example.com:alias:extra")).to.throw("Invalid alias format");
        });

        it("should handle malformed URLs gracefully", () => {
            expect(() => new wURL("https://")).to.throw();
        });
    });

    describe("String Representation Logic", () => {
        it("should show original port when alias equals port", () => {
            const url = new wURL("https://example.com:8080");
            // alias should equal port for valid ports
            expect(url.alias).to.equal(url.port);
            expect(url.toString()).to.equal("https://example.com:8080/");
        });

        it("should show alias when alias differs from port", () => {
            const url = new wURL("https://example.com:myalias");
            expect(url.alias).not.to.equal(url.port);
            expect(url.toString()).to.equal("https://example.com:myalias/");
        });

        it("should handle complex URLs with alias", () => {
            const url = new wURL("https://user:pass@example.com:staging/api/v1?token=abc#section");
            expect(url.alias).to.equal("staging");
            expect(url.port).to.equal("");
            expect(url.href).to.equal("https://user:pass@example.com/api/v1?token=abc#section");
            expect(url.toString()).to.equal("https://user:pass@example.com:staging/api/v1?token=abc#section");
        });
    });
}); 