import { 
    RangeStruct, 
    IBaseWTTPSite__factory, 
    type IBaseWTTPSite, 
    IWTTPGateway__factory, 
    type IWTTPGateway,
    config,
    Method,
    HEADRequestStruct,
    LOCATERequestStruct,
    GETRequestStruct,
    GETResponseStruct,
    HEADResponseStruct,
    LOCATEResponseStruct,
    LOCATEResponseSecureStruct,
    OPTIONSResponseStruct,
    bitmaskToMethods,
    decodeMimeType,
    decodeEncoding,
    decodeLanguage,
    decodeCharset
} from "@wttp/core";
import { wURL } from "./wurl";
import { ethers } from "ethers";
import { getHostAddress } from "./domains";

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
}

export interface WTTPResponse {
    head?: HEADResponseStruct;
    locate?: LOCATEResponseSecureStruct;
    get?: GETResponseStruct;
    options?: OPTIONSResponseStruct;
}

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

class WTTP {
    private signer: ethers.Signer | undefined;
    private defaultChain: number;

    constructor(signer?: ethers.Signer, defaultChain?: string) {
        this.signer = signer;
        this.defaultChain = getChainId(defaultChain || "") || config.defaultChain;
    }

    public getSite(site: string, chainId?: number, signer?: ethers.Signer): IBaseWTTPSite {
        chainId = chainId || this.defaultChain;
        signer = this.connectProvider(chainId, signer);
        return IBaseWTTPSite__factory.connect(site, signer);
    }

    public getGateway(chainId?: number, signer?: ethers.Signer, gateway?: string): IWTTPGateway {
        chainId = chainId || this.defaultChain;
        signer = this.connectProvider(chainId, signer);
        gateway = gateway || config.chains[chainId].gateway;
        return IWTTPGateway__factory.connect(gateway, signer);
    }

    public connectProvider(chainId?: number, signer?: ethers.Signer, rpc?: string): ethers.Signer {
        chainId = chainId || this.defaultChain;
        signer = signer || this.signer || ethers.Wallet.createRandom();
        rpc = rpc || config.chains[chainId].rpcsList[0];
        return signer.connect(new ethers.JsonRpcProvider(rpc));
    }

    public getRequestStructs(wurl: wURL, headers: WTTPFetchOptions["headers"]): { headRequest: HEADRequestStruct, locateRequest: LOCATERequestStruct, getRequest: GETRequestStruct } {
        const headRequest: HEADRequestStruct = {
            path: wurl.pathname,
            ifModifiedSince: BigInt(headers?.ifModifiedSince || 0),
            ifNoneMatch: headers?.ifNoneMatch || ethers.ZeroHash
        }

        const locateRequest: LOCATERequestStruct = {
            head: headRequest,
            rangeChunks: headers?.rangeChunks || { start: 0, end: 0 },
        }

        const getRequest: GETRequestStruct = {
            locate: locateRequest,
            rangeBytes: headers?.rangeBytes || { start: 0, end: 0 },
        }
        
        return {
            headRequest,
            locateRequest,
            getRequest
        }
    }

    public async fetch(url: string | URL | wURL, options?: WTTPFetchOptions) {
        const wurl = new wURL(url);

        const headers = options?.headers || {};
        const method = options?.method || Method.GET;

        if (wurl.protocol.startsWith("wttp")) {
            const chainId = getChainId(wurl.alias) || this.defaultChain;
            const gateway = this.getGateway(chainId, options?.signer, options?.gateway);
            const siteAddress = await getHostAddress(wurl.hostname);

            let response: SimpleResponse;

            const { headRequest, locateRequest, getRequest } = this.getRequestStructs(wurl, headers);

            switch (method) {
                case Method.OPTIONS:
                    const optionsResponse = await gateway.OPTIONS(siteAddress, wurl.pathname) as OPTIONSResponseStruct;
                    response = {
                        status: Number(optionsResponse.status),
                        headers: {
                            "Allowed-Methods": bitmaskToMethods(Number(optionsResponse.allow)).join(", "),
                        },
                        body: ""
                    };
                    break;
                case Method.HEAD:
                    const headResponse = await gateway.HEAD(siteAddress, headRequest) as HEADResponseStruct;
                    response = {
                        status: Number(headResponse.status),
                        headers: {
                            "Content-Length": headResponse.metadata.size.toString(),
                            "Content-Type": `${decodeMimeType(headResponse.metadata.properties.mimeType as any)}; charset=${decodeCharset(headResponse.metadata.properties.charset as any)}` || "",
                            "Content-Encoding": decodeEncoding(headResponse.metadata.properties.encoding as any) || "",
                            "Content-Language": decodeLanguage(headResponse.metadata.properties.language as any) || "",
                            "ETag": headResponse.etag.toString(),
                            "Last-Modified": headResponse.metadata.lastModified.toString(),
                        },
                        body: ""
                    };
                    break;
                case Method.LOCATE:
                    response = {
                        locate: await gateway.LOCATE(siteAddress, locateRequest) as LOCATEResponseSecureStruct
                    };
                case Method.GET:
                    response = {
                        get: await gateway.GET(siteAddress, getRequest) as GETResponseStruct
                    };
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }

            return response;

        } else {
            return await fetch(url, {
                method: method.toString()
            });
        }
    }
}