import parseUri from "parse-uri"

/**
 * Interface for the result of URL preprocessing operations
 * @internal
 */
interface ProcessedURL {
    /** The URL string with alias removed, safe for native URL constructor */
    processedUrl: string;
    /** The extracted alias/chain identifier from the port position */
    extractedAlias: string;
}

/**
 * Determines if a URL string is relative according to native URL behavior
 * @param url - The URL string to test
 * @returns true if the URL is relative (doesn't start with a protocol scheme)
 * @internal
 */
function isRelativeUrl(url: string): boolean {
    // Match native URL behavior: anything that doesn't start with a protocol is relative
    // This includes paths starting with :, /, ?, #, ., or regular paths
    return !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url);
}
// in the case of ipv6, this script fails due to a failure to parse ipv6 urls with the parse-uri library

/**
 * Extended URL class that supports string aliases in the port position
 * 
 * wURL (wide URL) extends the native URL class to handle scenarios where the port position
 * contains non-numeric values like blockchain chain identifiers, environment names, or other aliases.
 * 
 * Key features:
 * - Maintains 100% compatibility with native URL behavior
 * - Supports aliases like "mainnet", "sepolia", or large chain IDs (>65535) in port position
 * - Preserves all URL operations (relative resolution, property access, etc.)
 * - Custom toString() that displays the alias instead of processed port
 * - IPv6 address support with alias extraction
 * 
 * @example
 * ```typescript
 * // Standard URL with valid port
 * const url1 = new wURL('https://api.example.com:8080/data');
 * console.log(url1.port);   // "8080"
 * console.log(url1.alias);  // "8080"
 * 
 * // URL with chain ID alias
 * const url2 = new wURL('wttp://contract.eth:11155111/api');
 * console.log(url2.port);   // "" (empty, invalid for native URL)
 * console.log(url2.alias);  // "11155111"
 * 
 * // URL with string alias
 * const url3 = new wURL('https://api.example.com:mainnet/users');
 * console.log(url3.alias);  // "mainnet"
 * console.log(url3.toString()); // "https://api.example.com:mainnet/users"
 * 
 * // Relative URL resolution with alias inheritance
 * const base = new wURL('wttp://example.com:sepolia/base/');
 * const relative = new wURL('../api/data', base);
 * console.log(relative.alias); // "sepolia" (inherited from base)
 * ```
 */
export class wURL extends URL {
    /**
     * The alias/chain identifier extracted from the port position
     * 
     * This property stores the original value from the port position, whether it's:
     * - A valid port number (≤65535): alias equals port
     * - An invalid large number (>65535): alias stores the full number
     * - A string identifier: alias stores the string value
     * 
     * @example
     * ```typescript
     * const url = new wURL('https://api.example.com:mainnet/data');
     * console.log(url.alias); // "mainnet"
     * 
     * const chainUrl = new wURL('wttp://contract.eth:11155111/api');
     * console.log(chainUrl.alias); // "11155111"
     * ```
     */
    public alias: string = "";

    /**
     * Creates a new wURL instance
     * 
     * @param url - The URL string, URL object, or wURL object to parse
     * @param base - Optional base URL for resolving relative URLs
     * 
     * @throws {Error} When the URL is invalid or malformed
     * @throws {Error} When IPv6 format is invalid
     * @throws {Error} When alias format contains too many colons
     * 
     * @example
     * ```typescript
     * // Absolute URLs
     * const url1 = new wURL('https://example.com:mainnet/api');
     * const url2 = new wURL('wttp://contract.eth:11155111/data');
     * 
     * // Relative URLs with base
     * const base = new wURL('https://api.example.com:staging/v1/');
     * const endpoint = new wURL('users/profile', base);
     * console.log(endpoint.alias); // "staging" (inherited from base)
     * 
     * // IPv6 with alias
     * const ipv6 = new wURL('https://[::1]:development/local');
     * console.log(ipv6.alias); // "development"
     * ```
     */
    constructor(
        url: string | URL | wURL, 
        base?: string | URL | wURL
    ) {
        // Pre-process the URL to extract alias and make it URL-compatible
        const { processedUrl, extractedAlias } = wURL.preprocessUrl(url);

        let processedBaseUrl: ProcessedURL = { processedUrl: "", extractedAlias: "" };
        let urlAlias = extractedAlias;

        // Handle relative URL resolution with alias inheritance
        if (base && isRelativeUrl(processedUrl)) {
            processedBaseUrl = wURL.preprocessUrl(base);
            // For relative URLs, inherit the base alias if no alias in relative URL
            if (base instanceof wURL) {
                // Direct access to alias property for wURL instances
                urlAlias = base.alias;
            } else {
                // Extract alias from string/URL base
                urlAlias = processedBaseUrl.extractedAlias;
            }
        } else {
            // For absolute URLs, don't pass base to avoid conflicts
            base = undefined;
        }

        // Construct the native URL with processed components
        const baseUrl = processedBaseUrl.processedUrl || base;
        super(new URL(processedUrl, baseUrl));
        this.alias = urlAlias;
    }

    /**
     * Returns the string representation of the URL with alias displayed
     * 
     * When the alias differs from the port, this method replaces the port
     * in the URL string with the alias for display purposes.
     * 
     * @returns The URL string with alias in the port position
     * 
     * @example
     * ```typescript
     * const url = new wURL('https://api.example.com:mainnet/data');
     * console.log(url.toString()); // "https://api.example.com:mainnet/data"
     * console.log(url.href);       // "https://api.example.com/data" (native URL)
     * 
     * const validPort = new wURL('https://api.example.com:8080/data');
     * console.log(validPort.toString()); // "https://api.example.com:8080/data"
     * ```
     */
    public toString(): string {
        // If alias matches port, use native toString (no modification needed)
        if (this.alias === this.port) {
            return super.toString();
        }
        
        // Replace the port in href with the alias for display
        const portString = this.port ? `:${this.port}` : "";
        const aliasString = this.alias ? `:${this.alias}` : "";
        const hostString = `${this.hostname}${portString}`;
        return this.href.replace(hostString, this.hostname + aliasString);
    }
    
    /**
     * Preprocesses a URL to extract alias and make it compatible with native URL constructor
     * 
     * This static method handles the complex logic of:
     * - Detecting relative vs absolute URLs
     * - Parsing port vs alias in the authority section
     * - Handling IPv6 addresses with brackets
     * - Extracting aliases while preserving URL structure
     * - Creating URL strings safe for native URL constructor
     * 
     * @param url - The URL to preprocess
     * @param base - Optional base URL (currently unused but kept for API consistency)
     * @returns Object containing the processed URL and extracted alias
     * 
     * @throws {Error} When the URL is invalid
     * @throws {Error} When IPv6 format is malformed
     * @throws {Error} When authority contains too many colons (ambiguous parsing)
     * 
     * @internal This method is primarily for internal use but exposed for testing
     * 
     * @example
     * ```typescript
     * // Valid port - returned as-is
     * wURL.preprocessUrl('https://example.com:8080/path');
     * // Returns: { processedUrl: 'https://example.com:8080/path', extractedAlias: '8080' }
     * 
     * // Invalid large port - alias extracted, port removed
     * wURL.preprocessUrl('wttp://contract.eth:11155111/api');
     * // Returns: { processedUrl: 'wttp://contract.eth/api', extractedAlias: '11155111' }
     * 
     * // String alias - extracted and removed
     * wURL.preprocessUrl('https://api.example.com:mainnet/data');
     * // Returns: { processedUrl: 'https://api.example.com/data', extractedAlias: 'mainnet' }
     * 
     * // IPv6 with alias
     * wURL.preprocessUrl('https://[::1]:development/local');
     * // Returns: { processedUrl: 'https://[::1]/local', extractedAlias: 'development' }
     * ```
     */
    public static preprocessUrl(url: string | URL | wURL, base?: string | URL | wURL): ProcessedURL {
        const urlString = url.toString();
        
        // Relative URLs can be returned as-is (no alias extraction needed)
        if (isRelativeUrl(urlString)) {
            return {
                processedUrl: urlString,
                extractedAlias: ""
            };
        }
        
        // Parse the URL using parse-uri library for authority extraction
        let parsedUrl;
        try {
            parsedUrl = parseUri(urlString, { strictMode: false });
        } catch (error) {
            throw new Error(`Invalid URL: ${urlString}`);
        }
        if (!parsedUrl) {
            throw new Error(`Invalid URL: ${urlString}`);
        }
        
        const port = parsedUrl.port;
    
        // If port is valid (numeric and ≤65535), return original URL
        // Both port and alias will be the same value
        if (port !== "" && parseInt(port) <= 65535) {
            return {
                processedUrl: urlString,
                extractedAlias: port
            };
        }

        let extractedAlias: string = "";

        // Handle URLs with invalid ports or string aliases
        // Need to extract from authority and remove for native URL compatibility
        const authSplit = parsedUrl.authority.split("@"); // Handle userinfo@host:port format
        const hostPart = authSplit[authSplit.length - 1]; // Get the host:port part

        // No port/alias present, or IPv6 without port (ends with ])
        if (!hostPart.includes(":") || hostPart.endsWith("]")) {
            return {
                processedUrl: urlString,
                extractedAlias: ""
            };
        }
        
        // IPv6 vs regular hostname handling
        const isIPv6 = hostPart.startsWith("[");
        let actualHost: string;
        
        if (isIPv6) {
            // IPv6 format: [address]:port or [address]:alias
            // Find the closing bracket to separate address from port
            const bracketEnd = hostPart.indexOf("]");
            if (bracketEnd === -1) {
                throw new Error(`Invalid IPv6 format: ${parsedUrl.authority}`);
            }
            actualHost = hostPart.substring(0, bracketEnd + 1); // Include the ]
            const portPart = hostPart.substring(bracketEnd + 2); // Skip ]:
            extractedAlias = portPart || "";
        } else {
            // Regular hostname format: hostname:port or hostname:alias
            const colonSplit = hostPart.split(":");
            if (colonSplit.length === 2) {
                actualHost = colonSplit[0];
                extractedAlias = colonSplit[1];
            } else if (colonSplit.length > 2) {
                // Too many colons - ambiguous parsing
                throw new Error(`Invalid alias format: ${parsedUrl.authority}`);
            } else {
                actualHost = hostPart;
                extractedAlias = "";
            }
        }

        // Remove the alias from the URL to make it compatible with native URL constructor
        if (extractedAlias) {
            const extractedUrl = urlString.replace(`${actualHost}:${extractedAlias}`, actualHost);
            // Normalize through URL constructor to ensure proper formatting
            const processedUrl = new URL(extractedUrl).href;
            return {
                processedUrl,
                extractedAlias
            };
        } else {
            return {
                processedUrl: urlString,
                extractedAlias: ""
            };
        }
    }
}