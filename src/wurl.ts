import parseUri from "parse-uri"

interface ProcessedURL {
    processedUrl: string;
    extractedAlias: string;
}

// wide URL or wURL is a URL that acts as a URL but less restrictive on port numbers
export class wURL extends URL {
    public alias: string = "";

    constructor(
        url: string | URL | wURL, 
        base?: string | URL | wURL
    ) {
        // Pre-process the URL to extract alias and make it URL-compatible
        const { processedUrl, extractedAlias } = wURL.preprocessUrl(url);
        const isRelative = processedUrl.startsWith(".") || processedUrl.startsWith("/");
        let processedBaseUrl: ProcessedURL = { processedUrl: "", extractedAlias: "" };

        if (base && isRelative) {
            processedBaseUrl = wURL.preprocessUrl(base);
        }

        const baseUrl = processedBaseUrl.processedUrl || base;
        const urlAlias = processedBaseUrl.extractedAlias || extractedAlias;

        super(processedUrl, baseUrl);
        this.alias = urlAlias;

    }

    public toString() {
        if (this.alias === this.port) {
            return super.toString();
        }
        const portString = this.port ? `:${this.port}` : "";
        const aliasString = this.alias ? `:${this.alias}` : "";
        const hostString = `${this.hostname}${portString}`;
        return this.href.replace(hostString, this.hostname + aliasString);
    }
    
    public static preprocessUrl(url: string | URL | wURL, base?: string | URL | wURL): ProcessedURL {
        const urlString = url.toString();
        // relative URLs can be returned as is
        if (urlString.startsWith(".")) {
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
    
        // return original URL if port is valid
        if (port !== "" && parseInt(port) <= 65535) {
            // console.log(`port is valid, returning ${urlString}, ${port}`);
            return {
                processedUrl: urlString,
                extractedAlias: port
            };
        }
    
        const authLength = parsedUrl.authority.length;
        const hostLength = parsedUrl.host.length;
        const userLength = parsedUrl.userInfo.length;
    
        const containsPort = authLength !== userLength + hostLength;

        let extractedAlias: string = "";

        // ensure port doesn't exist, if no port, url is safe      
        if (!containsPort) {
            if(url instanceof wURL) {
                extractedAlias = url.alias;
            }
            return {
                processedUrl: urlString,
                extractedAlias: extractedAlias
            };
        } 

        // remaining cases are invalid port, or port is a string, remove port
        const authSplit = parsedUrl.authority.split("@"); // strip any existing auth
        const aliasSplit = authSplit[authSplit.length - 1].split(":"); // split host:alias
        
        console.log("Debug - authSplit:", authSplit);
        console.log("Debug - aliasSplit:", aliasSplit);
        console.log("Debug - parsedUrl.host:", parsedUrl.host);
        
        if (aliasSplit.length > 2 && !aliasSplit[0].includes("[")) { // IPv6 acception
            throw new Error(`Invalid alias format: ${parsedUrl.authority}`);
        }
        const lastSplit = aliasSplit[aliasSplit.length - 1];

        extractedAlias = aliasSplit.length > 1 && !lastSplit.includes("]") ? lastSplit : "";
        
        console.log("Debug - lastSplit:", lastSplit);
        console.log("Debug - extractedAlias:", extractedAlias);

        const processedUrl = urlString.replace(`${parsedUrl.host}:${extractedAlias}`, parsedUrl.host);
        // console.log(`Invalid port, valid alias: ${extractedAlias}, returning ${processedUrl}`);
    
        return {
            processedUrl,
            extractedAlias
        };
    }
}