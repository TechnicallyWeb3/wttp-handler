import { ethers } from 'ethers';
import { config } from '@wttp/core';
import parseUri from "parse-uri"

interface ParsedWttpUrl {
    wttpUrl: URL;
    chain: string | undefined;
}

export class wURL extends URL {
    public chain: string | undefined;
    
    constructor(
        url: string | URL | wURL, 
        base?: string | URL | wURL
    ) {
        


        super(wttpUrl);
        this.chain = chain;
    }

    // get href() {
    //     return `${this.protocol}://${this.hostname}${this.port ? `:${this.port}` : ''}${this.pathname}${this.search}${this.hash}`;
    // }

    private static isWURL = (value: any): value is wURL => {
        return value instanceof wURL;
    };

    /**
     * Parse wttp:// URL, handling both valid and invalid port ranges
     */
    private static parseWttpUrl(url: string | URL | wURL, base?: string | URL | wURL): ParsedWttpUrl {
        if (!(typeof url === 'string')) {
            url = url.href;
        } 
        if (base && !(typeof base === 'string')) {
            base = base.href;
        }

        let parsedUrl = parseUri(url, { strictMode: false });

        // console.log(`URL: ${url}`);
        // console.log(`Parsed URL: ${JSON.stringify(parsedUrl)}`);
        // console.log(`URL port: ${parsedUrl.port}`);

        const chainUrl: string | undefined = parsedUrl.port || undefined;
        let portUrl: number | null = chainUrl ? parseInt(chainUrl) : null;
        // console.log(`URL chain : ${chainUrl}, URL port: ${portUrl}`);

        if (portUrl && portUrl > 65535) {
            portUrl = 65535;
        }
        if (chainUrl) {
            parsedUrl.source = parsedUrl.source.replace(
                `${parsedUrl.host}:${chainUrl}`, 
                `${parsedUrl.host}${portUrl ? `:${portUrl}` : ''}`
            );
            // console.log(`URL after: ${parsedUrl.source}`);
        }

        let parsedBase: any;
        let chainBase: string | undefined = undefined;
        let portBase: number | null = null;

        let newUrl: URL | null = null;
        if (base) {
            parsedBase = parseUri(base, { strictMode: false });
            // we should be good to override the chain here right? 
            // Since base is the parent url, url shouldn't contain the chain or port?
            chainBase = parsedBase.port;
            portBase = chainBase ? parseInt(chainBase) : null;

            // console.log(`Base chain : ${chainBase}, Base port: ${portBase}`);

            if (portBase && portBase > 65535) {
                portBase = 65535;
            }
            if (chainBase) {
                parsedBase.source = parsedBase.source.replace(
                    `${parsedBase.resource}:${chainBase}`, 
                    `${parsedBase.resource}${portBase ? `:${portBase}` : ''}`
                );
                // console.log(`Base after: ${parsedBase.href}`);
            }
            newUrl = new URL(parsedUrl.source, parsedBase!.source);
        } else {
            // console.log(parsedUrl.source);
            newUrl = new URL(parsedUrl.source);
        }

        let chain = chainBase || chainUrl;



        if (this.isWURL(base)) {
            chain = base.chain;
        } else if (this.isWURL(url)) {
            chain = url.chain;
        }

        return { wttpUrl: newUrl, chain };
    }
 
}