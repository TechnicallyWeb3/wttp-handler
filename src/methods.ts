import { 
    GETRequestStruct, 
    LOCATERequestStruct, 
    HEADRequestStruct,
    RangeStruct, 
    IWTTPGateway,
    GETResponseStruct,
    LOCATEResponseSecureStruct,
    HEADResponseStruct,
    OPTIONSResponseStruct,
} from "@wttp/core";
import { ethers } from "ethers";

export interface HEADOptions {
    ifModifiedSince?: number;
    ifNoneMatch?: string;
}

export interface LOCATEOptions extends HEADOptions {
    rangeChunks?: RangeStruct;
}

export interface GETOptions extends LOCATEOptions {
    rangeBytes?: RangeStruct;
}

// function processHEADResponse(head: HEADResponseStruct, contentLength: number) {
//     return {
//         "Content-Length": contentLength.toString(), // size is total size, structure gives returned content length
//         "Content-Version": head.metadata.version.toString(), // size is total size, structure gives returned content length
//         "Last-Modified": head.metadata.lastModified.toString(),
//         "ETag": head.etag.toString(),
//         "Content-Type": `${decodeMimeType(head.metadata.properties.mimeType as any)}; charset=${decodeCharset(head.metadata.properties.charset as any)}` || "",
//         "Content-Encoding": decodeEncoding(head.metadata.properties.encoding as any) || "",
//         "Content-Language": decodeLanguage(head.metadata.properties.language as any) || "",
//         "Content-Security-Policy": head.headerInfo.cors.custom || "",
//         "Access-Control-Preset": head.headerInfo.cors.preset.toString() || "",
//         "Access-Control-Allow-Origin": head.headerInfo.cors.origins.join(", "),
//         "Access-Control-Allow-Methods": bitmaskToMethods(Number(head.headerInfo.cors.methods)).join(", "),
//         "Cache-Control": head.headerInfo.cache.custom || "",
//         "Cache-Preset": head.headerInfo.cache.preset.toString() || "",
//         "Immutable-Flag": head.headerInfo.cache.immutableFlag.toString(),
//         "Location": head.headerInfo.redirect.location || "",
//     }
// }

export async function wttpGET(gateway: IWTTPGateway, siteAddress: string, path: string, options: GETOptions): Promise<GETResponseStruct> {
    // function processGETResponse(response: GETResponseStruct) {
    //     if ()
    //     return {
    //         status: Number(response.head.status),
    //         headers: processHEADResponse(response.head, Number(response.body.sizes.totalSize)),
    //         body: response.body.data,
    //     }
    // }
    const getRequest: GETRequestStruct = {
        locate: {
            head: {
                path,
                ifModifiedSince: options?.ifModifiedSince || 0n,
                ifNoneMatch: options?.ifNoneMatch || ethers.ZeroHash,
            },
            rangeChunks: options?.rangeChunks || {start: 0n, end: 0n},
        },
        rangeBytes: options?.rangeBytes || {start: 0n, end: 0n},
    }
    try {
        const response = await gateway.GET(siteAddress, getRequest);
        return response;
    } catch (error) {
        // console.error(error);
        throw error;
    }
}

export async function wttpLOCATE(gateway: IWTTPGateway, siteAddress: string, path: string, options: LOCATEOptions): Promise<LOCATEResponseSecureStruct> {
    const locateRequest: LOCATERequestStruct = {
            head: {
                path,
                ifModifiedSince: options?.ifModifiedSince || 0n,
                ifNoneMatch: options?.ifNoneMatch || ethers.ZeroHash,
            },
            rangeChunks: options?.rangeChunks || {
                start: 0n,
                end: 0n,
            },
    }
    try {
        const response = await gateway.LOCATE(siteAddress, locateRequest);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function wttpHEAD(gateway: IWTTPGateway, siteAddress: string, path: string, options: HEADOptions): Promise<HEADResponseStruct> {
    const headRequest: HEADRequestStruct = {
        path,
        ifModifiedSince: options?.ifModifiedSince || 0n,
        ifNoneMatch: options?.ifNoneMatch || ethers.ZeroHash,
    }
    try {
        const response = await gateway.HEAD(siteAddress, headRequest);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function wttpOPTIONS(gateway: IWTTPGateway, siteAddress: string, path: string): Promise<OPTIONSResponseStruct> {
    try {
        const response = await gateway.OPTIONS(siteAddress, path);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
