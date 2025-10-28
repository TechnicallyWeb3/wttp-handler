import { 
    RangeStruct, 
    IWTTPGateway__factory, 
    type IWTTPGateway,
    config,
    Method,
    GETResponseStruct,
    HEADResponseStruct,
    LOCATEResponseSecureStruct,
    OPTIONSResponseStruct,
    bitmaskToMethods,
    decodeMimeType,
    decodeCharset,
    decodeEncoding,
    decodeLanguage,
    DataPointSizesStruct,
    wURL,
    getHostAddress,
} from "@wttp/core";
import { ethers } from "ethers";
import { 
    wttpOPTIONS,
    wttpHEAD,
    wttpLOCATE,
    wttpGET,
    HEADOptions,
    LOCATEOptions,
    GETOptions,
 } from ".";

const MAX_REDIRECTS = 30;

export interface WTTPFetchOptions {
    method?: Method;
    headers?: {
        ifModifiedSince?: number;
        ifNoneMatch?: string;
        rangeChunks?: RangeStruct;
        rangeBytes?: RangeStruct;
    },
    signer?: ethers.Signer;
    gateway?: string;
    rpc?: string;
    redirect?: "follow" | "error" | "manual";
}

export type WTTPResponse = 
    HEADResponseStruct | 
    LOCATEResponseSecureStruct | 
    GETResponseStruct | 
    OPTIONSResponseStruct;

export interface SimpleResponse {
    status: number;
    headers: Record<string, string>;
    body: string | Uint8Array;
}

export function getChainId(alias: string): number | null {
    const aliases: Record<string, number> = {    
        // String aliases
        "localhost": 31337,
        "sepolia": 11155111,
        "testnet": 11155111,
        "ethereum": 1,
        "mainnet": 1,
        "eth": 1,
        "base": 8453,
        "polygon": 137,
        "matic": 137,
        "arbitrum": 42161,
        "arb": 42161,
    };
    
    return aliases[alias] || parseInt(alias) || null;
}

export class WTTPHandler {
    private signer: ethers.Signer | undefined;
    private defaultChain: number;
    private rpc: string;
    private visited: string[] = [];

    constructor(signer?: ethers.Signer, defaultChain?: string, rpc?: string) {
        this.signer = signer;
        const chainId = getChainId(defaultChain || "") || config.defaultChain;
        this.defaultChain = chainId;
        // console.log("defaultChain", this.defaultChain, chainId);
        this.rpc = rpc || config.chains[chainId].rpcsList[0];
        // console.log("rpc", rpc, this.rpc);
    }

    // not actually needed for read only operations
    // public getSite(site: string, chainId?: number, signer?: ethers.Signer): IBaseWTTPSite {
    //     chainId = chainId || this.defaultChain;
    //     signer = this.connectProvider(chainId, signer);
    //     return IBaseWTTPSite__factory.connect(site, signer);
    // }

    public getGateway(chainId?: number, signer?: ethers.Signer, gateway?: string, rpc?: string): IWTTPGateway {
        const gatewayChain = chainId || this.defaultChain;
        rpc = rpc || gatewayChain === this.defaultChain ? this.rpc : config.chains[gatewayChain].rpcsList[0];
        signer = this.connectProvider(gatewayChain, signer, rpc);
        gateway = gateway || config.chains[gatewayChain].gateway;
        return IWTTPGateway__factory.connect(gateway, signer);
    }

    public connectProvider(chainId?: number, signer?: ethers.Signer, rpc?: string): ethers.Signer {
        chainId = chainId || this.defaultChain;
        signer = signer || this.signer || ethers.Wallet.createRandom();
        rpc = rpc || this.rpc;
        return signer.connect(new ethers.JsonRpcProvider(rpc));
    }

    public formatResponse(response: WTTPResponse, method: Method): SimpleResponse {
        let status: number;
        let head: HEADResponseStruct | undefined;
        let headers: Record<string, string>;
        let structure: DataPointSizesStruct | undefined;
        let body: string | Uint8Array | undefined;

        if (method === Method.OPTIONS) {
            status = Number((response as OPTIONSResponseStruct).status);
            headers = {
                "Allowed-Methods": bitmaskToMethods(Number((response as OPTIONSResponseStruct).allow)).join(", "),
            };
            body = "";
            return {
                status,
                headers,
                body,
            }
        } else if (method === Method.HEAD) {
            head = response as HEADResponseStruct;
            body = "";
        } else if (method === Method.LOCATE) {
            const locateResponse = response as LOCATEResponseSecureStruct;
            head = locateResponse.locate.head;
            structure = locateResponse.structure;
            body = JSON.stringify(structure, (key, value) => 
                typeof value === 'bigint' ? value.toString() : value
            );
        } else if (method === Method.GET) {
            const getResponse = response as GETResponseStruct;
            head = getResponse.head;
            structure = getResponse.body.sizes;
            body = head.metadata.properties.charset == "0x7556" || head.metadata.properties.charset == "0x7508" ? ethers.toUtf8String(getResponse.body.data) : ethers.getBytes(getResponse.body.data);
        }

        if (head) {
            status = Number(head.headerInfo.redirect.code || head.status);
            headers = {
                "Content-Length": method === Method.HEAD ? head.metadata.size.toString() : structure?.totalSize.toString() || "0",
                "Content-Type": `${decodeMimeType(head.metadata.properties.mimeType as any)}; charset=${decodeCharset(head.metadata.properties.charset as any)}` || "",
                "Content-Encoding": decodeEncoding(head.metadata.properties.encoding as any) || "",
                "Content-Language": decodeLanguage(head.metadata.properties.language as any) || "",
                "Content-Version": head.metadata.version.toString(),
                "Last-Modified": head.metadata.lastModified.toString(),
                "ETag": head.etag.toString(),
                "Cache-Control": head.headerInfo.cache.preset.toString(),
                "Immutable-Flag": head.headerInfo.cache.immutableFlag.toString(),
                "Cache-Custom": head.headerInfo.cache.custom.toString(),
                "CORS-Preset": head.headerInfo.cors.preset.toString(),
                "CORS-Custom": head.headerInfo.cors.custom.toString(),
                "Allow-Origin": head.headerInfo.cors.origins.toString(),
                "Allow-Methods": bitmaskToMethods(Number(head.headerInfo.cors.methods)).join(", "),
                "Location": head.headerInfo.redirect.location.toString(),
                // "Content-Range": we need the request struct to get the response range
            }
        } else {
            throw new Error("Head not found in response");
        }
        
        return {
            status,
            headers,
            body: body || "",
        }
    }

    public async fetch(url: string | URL | wURL, options?: WTTPFetchOptions): Promise<Response> {
        const wurl = new wURL(url);
        const chainId = getChainId(wurl.alias) || this.defaultChain;
        const gateway = this.getGateway(chainId, options?.signer, options?.gateway, options?.rpc);
        const fetchHostname = wurl.hostname.endsWith(".contractaddress0x") ? 
            wurl.hostname.replace(".contractaddress0x", "") : wurl.hostname;
        const siteAddress = await getHostAddress(fetchHostname);

        let response: SimpleResponse | undefined;

        options = options || {};
        if (options.method === undefined) {
            options.method = Method.GET;
        }
        if (options.redirect === undefined) {
            options.redirect = "follow";
        }

        if (options.method === Method.OPTIONS) {
            try {
                const optionsResponse = await wttpOPTIONS(gateway, siteAddress, wurl.pathname);
                response = this.formatResponse(optionsResponse, Method.OPTIONS);
            } catch (error) {
                if (error instanceof Error) {
                    if(chainId == 11155111 && error.message.includes("execution reverted")) {
                        const simpleResponse: SimpleResponse = {
                            status: 404,
                            headers: {},
                            body: "",
                        };
                        return this.createResponse(simpleResponse.body, simpleResponse.status, simpleResponse.headers);
                    } else if (error.message.includes(" _4")) {
                        const simpleResponse: SimpleResponse = {
                            status: Number(error.message.split(" _")[1].slice(0, 2)),
                            headers: {},
                            body: "",
                        };
                        return this.createResponse(simpleResponse.body, simpleResponse.status, simpleResponse.headers);
                    } else {
                        throw new Error("OPTIONS error: " + error.message); // error;
                    }
                }
            }
        } else if (options.method === Method.HEAD) {
            try {
                const headResponse = await wttpHEAD(gateway, siteAddress, wurl.pathname, options?.headers as HEADOptions);
                response = this.formatResponse(headResponse, Method.HEAD);
            } catch (error) {
                if (error instanceof Error) {
                    if(chainId == 11155111 && error.message.includes("execution reverted")) {
                        const simpleResponse: SimpleResponse = {
                            status: 404,
                            headers: {},
                            body: "",
                        };
                        return this.createResponse(simpleResponse.body, simpleResponse.status, simpleResponse.headers);
                    } else if (error.message.includes(" _4")) {
                        const simpleResponse: SimpleResponse = {
                            status: Number(error.message.split(" _")[1].slice(0, 2)),
                            headers: {},
                            body: "",
                        };
                        return this.createResponse(simpleResponse.body, simpleResponse.status, simpleResponse.headers);
                    } else {
                        throw new Error("HEAD error: " + error.message); // error;
                    }
                }
            }
        } else if (options.method === Method.LOCATE) {
            try {
                const locateResponse = await wttpLOCATE(gateway, siteAddress, wurl.pathname, options?.headers as LOCATEOptions);
                response = this.formatResponse(locateResponse, Method.LOCATE);
            } catch (error) {
                if (error instanceof Error) {
                    if(error.message.includes("execution reverted")) {
                        const simpleResponse: SimpleResponse = {
                            status: 404,
                            headers: {},
                            body: "",
                        };
                        return this.createResponse(simpleResponse.body, simpleResponse.status, simpleResponse.headers);
                    } else if (error.message.includes(" _4")) {
                        const simpleResponse: SimpleResponse = {
                            status: Number(error.message.split(" _")[1].slice(0, 2)),
                            headers: {},
                            body: "",
                        };
                        return this.createResponse(simpleResponse.body, simpleResponse.status, simpleResponse.headers);
                    } else {
                        throw new Error("LOCATE error: " + error.message); // error;
                    }
                }
            }
        } else if (options.method === Method.GET) {
            try {
                const getResponse = await wttpGET(gateway, siteAddress, wurl.pathname, options?.headers as GETOptions);
                response = this.formatResponse(getResponse, Method.GET);
            } catch (error) {
                if (error instanceof Error) {
                    if(error.message.includes("execution reverted")) {
                        const simpleResponse: SimpleResponse = {
                            status: 404,
                            headers: {},
                            body: "",
                        };
                        return this.createResponse(simpleResponse.body, simpleResponse.status, simpleResponse.headers);
                    } else if (error.message.includes(" _4")) {
                        const simpleResponse: SimpleResponse = {
                            status: Number(error.message.split(" _")[1].slice(0, 2)),
                            headers: {},
                            body: "",
                        };
                        return this.createResponse(simpleResponse.body, simpleResponse.status, simpleResponse.headers);
                    } else {
                        const simpleResponse: SimpleResponse = {
                            status: 404,
                            headers: {},
                            body: "",
                        };
                        return this.createResponse(simpleResponse.body, simpleResponse.status, simpleResponse.headers);
                        // throw new Error("GET error: " + error.message); // error;
                    }
                }
            }
        }

        if (!response) {
            throw new Error(`Unsupported method: ${options?.method}`);
        }

        if (
            this.isRedirect(response.status) &&
            options.redirect === "follow"
        ) {
            this.visited.push(wurl.toString());
            const absolutePath = this.getAbsolutePath(response.headers.Location, wurl);
            if (this.visited.includes(absolutePath)) {
                const simpleResponse: SimpleResponse = {
                    status: 508,
                    headers: {},
                    body: "LOOP_DETECTED: " + this.visited.join(", "),
                };
                return this.createResponse(simpleResponse.body, simpleResponse.status, simpleResponse.headers);
            }
            if (this.visited.length > MAX_REDIRECTS) {
                const simpleResponse: SimpleResponse = {
                    status: 310,
                    headers: {},
                    body: "TOO_MANY_REDIRECTS: " + this.visited.join(", "),
                };
                return this.createResponse(simpleResponse.body, simpleResponse.status, simpleResponse.headers);
            }
            return await this.fetch(new wURL(response.headers.Location, wurl), {
                method: options.method,
                headers: options?.headers,
                signer: options?.signer,
                gateway: gateway.target.toString(),
            });
        }

        if (this.isRedirect(response.status) && options.redirect === "error") {
            throw new Error(`Redirect error: ${response.status} Redirect to ${response.headers.Location}`);
        }

        return this.createResponse(response.body, response.status, response.headers);
    }

    private createResponse(body: string | Uint8Array, status: number, headers: Record<string, string>): Response {
        // Handle null body status codes according to Fetch spec
        if (status === 204 || status === 304 || (status >= 100 && status < 200)) {
            return new Response(null, {
                status,
                headers
            });
        }
        
        return new Response(body, {
            status,
            headers
        });
    }

    public isRedirect(status: number): boolean {
        return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
    }

    public getAbsolutePath(url: string, base: string | URL | wURL): string {
        return new wURL(url, base).toString();
    }

}