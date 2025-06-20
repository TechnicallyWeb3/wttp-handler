import parseUri from "parse-uri"

// wide URL or wURL is a URL that acts as a URL but less restrictive than a URL
export class wURL extends URL {
    private alias: string = "";
    
    constructor(
        url: string | URL | wURL, 
        base?: string | URL | wURL
    ) {
        // Handle wURL base objects specially to extract their alias
        let baseAlias = "";
        if (base instanceof wURL) {
            baseAlias = base.alias;
        }

        // Pre-process the URL to extract alias and make it URL-compatible
        const { processedUrl, extractedAlias } = wURL.preprocessUrl(url);
        const { processedUrl: baseUrl } = base ? wURL.preprocessUrl(base) : { processedUrl: undefined };

        // Now call super with a valid URL
        super(processedUrl, baseUrl);

        // Store the extracted alias - url takes precedence over base
        this.alias = extractedAlias || baseAlias; 

        // Override port, host, and href properties since cascading doesn't work
        // We need to override all dependent properties to ensure consistency
        
        // Store original getters/setters for fallback
        const originalPortDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), 'port');
        const originalHostDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), 'host');
        const originalHrefDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), 'href');

        // Override port property
        Object.defineProperty(this, 'port', {
            get: () => this.alias || "",
            set: (value: string) => { this.alias = value; },
            enumerable: true,
            configurable: true
        });

        // Override host property to include alias
        Object.defineProperty(this, 'host', {
            get: () => {
                const hostname = originalHostDescriptor?.get?.call(this) || this.hostname;
                // Remove any existing port from hostname to avoid duplication
                const cleanHostname = hostname.split(':')[0];
                return this.alias ? `${cleanHostname}:${this.alias}` : cleanHostname;
            },
            set: (value: string) => {
                // Parse host value to extract hostname and port/alias
                const parts = value.split(':');
                this.hostname = parts[0];
                if (parts.length > 1) {
                    this.alias = parts.slice(1).join(':'); // Handle IPv6 or complex cases
                } else {
                    this.alias = "";
                }
            },
            enumerable: true,
            configurable: true
        });

        // Override href property to include alias
        Object.defineProperty(this, 'href', {
            get: () => {
                // Rebuild href using our overridden host
                const protocol = this.protocol;
                const username = this.username;
                const password = this.password;
                const host = this.host; // Uses our overridden host getter
                const pathname = this.pathname;
                const search = this.search;
                const hash = this.hash;

                let href = protocol + '//';
                
                if (username) {
                    href += username;
                    if (password) {
                        href += ':' + password;
                    }
                    href += '@';
                }
                
                href += host;
                href += pathname;
                href += search;
                href += hash;

                return href;
            },
            set: (value: string) => {
                // Use original href setter to parse the URL, then extract our alias
                originalHrefDescriptor?.set?.call(this, value);
                
                // Re-extract alias from the newly set URL
                const { extractedAlias } = wURL.preprocessUrl(value);
                this.alias = extractedAlias;
            },
            enumerable: true,
            configurable: true
        });
    }
    
    private static preprocessUrl(url: string | URL | wURL): { processedUrl: string, extractedAlias: string } {
        const urlString = url.toString();
        
        // Handle relative URLs - pass them through unchanged
        if (urlString.startsWith('.')) {
            return {
                processedUrl: urlString,
                extractedAlias: ""
            };
        }

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
    
        // return original URL if port is valid (numeric and <= 65535)
        if (port && parseInt(port) <= 65535) {
            console.log(`port is valid, returning ${urlString}, ${port}`);
            return {
                processedUrl: urlString,
                extractedAlias: port
            };
        }

        // No port present - return as is
        if (!port) {
            return {
                processedUrl: urlString,
                extractedAlias: ""
            };
        }

        // Port exists but is invalid (non-numeric or > 65535)
        // Check for non-numeric port first
        if (isNaN(parseInt(port))) {
            throw new Error(`Invalid URL: ${urlString}`);
        }

        // Port is numeric but > 65535, extract as alias and remove from URL
        const extractedAlias = port;
        
        // Handle different URL formats for removal
        let processedUrl;
        if (parsedUrl.authority && parsedUrl.authority.includes(`${parsedUrl.host}:${extractedAlias}`)) {
            processedUrl = urlString.replace(`${parsedUrl.host}:${extractedAlias}`, parsedUrl.host);
        } else {
            // Fallback: try direct replacement
            processedUrl = urlString.replace(`:${extractedAlias}`, '');
        }
        
        console.log(`Invalid port, valid alias: ${extractedAlias}, returning ${processedUrl}`);
    
        return {
            processedUrl,
            extractedAlias
        };
    }
}