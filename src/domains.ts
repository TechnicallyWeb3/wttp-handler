import { getRpcUrl } from "@wttp/core";
import { wURL } from "../src";
import { ethers } from "ethers";

/**
 * Formats and validates an Ethereum address
 * 
 * @param address - The Ethereum address to format and validate
 * @returns The checksummed Ethereum address
 * @throws Error if the address is invalid
 */
export function formatEthereumAddress(address: string | ethers.Addressable): string {
    try {
        // Use ethers to validate the host is a valid address
        const checksumAddress = ethers.getAddress(String(address));
        // ethers.isAddress(checksumAddress); // try/catch implemented, so this is not needed
        return checksumAddress;
    } catch (error) {
        throw `Invalid Ethereum address: ${address} - ${error}`;
    }
}

/**
 * Resolves an ENS (Ethereum Name Service) name to its corresponding Ethereum address
 * 
 * @param name - The ENS name to resolve (e.g., "example.eth")
 * @returns Promise resolving to the Ethereum address
 * @throws Error if the ENS name cannot be resolved
 */
export async function resolveEnsName(name: string): Promise<string> {
    const rpcUrl = getRpcUrl(1);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    try {
        const resolved = await provider.resolveName(name);
        if (resolved) {
            return resolved;
        } else {
            throw `Could not resolve ENS name: ${name}`;
        }
    } catch (error) {
        throw `Invalid ENS name: ${name} - ${error}`;
    }
}

/**
 * Resolves a hostname to an Ethereum address
 * Handles both ENS names and direct Ethereum addresses
 * 
 * @param hostname - The hostname to resolve (can be URL, wURL, or hostname string)
 * @returns Promise resolving to the Ethereum address
 */
export async function getHostAddress(hostname: string | URL | wURL): Promise<string> {
    let host: string;
    
    if (typeof hostname === 'string') {
        // If it's a URL string, parse it, otherwise treat as hostname
        if (hostname.includes('://')) {
            const url = new URL(hostname);
            host = url.hostname;
        } else {
            host = hostname;
        }
    } else {
        host = hostname.hostname;
    }
    
    if (host.endsWith('.eth')) {
        return await resolveEnsName(host);
    }
    return formatEthereumAddress(host);
}