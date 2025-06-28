/**
 * wURL - Wide URL
 * 
 * Extended URL class that supports string aliases in the port position.
 * Perfect for blockchain applications, environment-specific URLs, and any 
 * scenario where the port position needs non-numeric identifiers.
 * 
 * @example
 * ```typescript
 * import { wURL } from 'wurl';
 * 
 * // Blockchain chain ID
 * const contract = new wURL('wttp://contract.eth:11155111/api');
 * console.log(contract.alias); // "11155111"
 * 
 * // Environment alias
 * const staging = new wURL('https://api.example.com:staging/users');
 * console.log(staging.alias); // "staging"
 * ```
 * 
 * @packageDocumentation
 */

// Export everything from the main modules
export * from "./methods";
export * from "./handler";