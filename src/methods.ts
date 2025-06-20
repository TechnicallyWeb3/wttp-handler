import { 
    GETRequestStruct, 
    LOCATERequestStruct, 
    HEADRequestStruct,
    RangeStruct, 
    encodeMimeType,
    encodeCharset,
    encodeEncoding,
    encodeLanguage
} from "@wttp/core";
import { wURL } from "./wurl";
import { ethers } from "ethers";
import { PUTRequestStruct } from "@wttp/core";

export interface WTTPFetchOptions {
    signer?: ethers.Signer;
    ifModifiedSince?: number;
    ifNoneMatch?: string;
    rangeChunks?: RangeStruct;
    rangeBytes?: RangeStruct;
}

export async function wttpGET(url: string | URL | wURL, options?: WTTPFetchOptions) {
    const wurl = new wURL(url, url, options?.signer);
    await wurl.loadHost();
    const getRequest: GETRequestStruct = {
        locate: {
            head: {
                path: wurl.host,
                ifModifiedSince: options?.ifModifiedSince || 0n,
                ifNoneMatch: options?.ifNoneMatch || ethers.ZeroHash,
            },
            rangeChunks: options?.rangeChunks || {
                start: 0n,
                end: 0n,
            },
        },
        rangeBytes: options?.rangeBytes || {
            start: 0n,
            end: 0n,
        },
    }
    try {
        const response = await wurl.gateway.GET(wurl.host, getRequest);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function wttpLOCATE(url: string | URL | wURL, options: WTTPFetchOptions) {
    const wurl = new wURL(url, url, options.signer);
    await wurl.loadHost();
    const locateRequest: LOCATERequestStruct = {
            head: {
                path: wurl.host,
                ifModifiedSince: options.ifModifiedSince || 0n,
                ifNoneMatch: options.ifNoneMatch || ethers.ZeroHash,
            },
            rangeChunks: options.rangeChunks || {
                start: 0n,
                end: 0n,
            },
    }
    try {
        const response = await wurl.gateway.LOCATE(wurl.host, locateRequest);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function wttpHEAD(url: string | URL | wURL, options: WTTPFetchOptions) {
    const wurl = new wURL(url, url, options.signer);
    await wurl.loadHost();
    const headRequest: HEADRequestStruct = {
        path: wurl.host,
        ifModifiedSince: options.ifModifiedSince || 0n,
        ifNoneMatch: options.ifNoneMatch || ethers.ZeroHash,
    }
    try {
        const response = await wurl.gateway.HEAD(wurl.host, headRequest);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function wttpPUT(url: string | URL | wURL, options: WTTPFetchOptions) {
    const wurl = new wURL(url, url, options.signer);
    await wurl.loadHost();
    const putRequest: PUTRequestStruct = {
        head: {
            path: wurl.host,
            ifModifiedSince: options.ifModifiedSince || 0n,
            ifNoneMatch: options.ifNoneMatch || ethers.ZeroHash,
        },
        properties: {
            mimeType: encodeMimeType("text/plain"),
            charset: encodeCharset("utf-8"),
            encoding: encodeEncoding("identity"),
            language: encodeLanguage("en"),
        },
        data: [],
    }
}