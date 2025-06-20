// interface URIScheme {
//     protocols: string[];
//     scheme(): string;
// }

// interface URIUserInfo {
//     user?: string;
//     password?: string;
//     userInfo(): string;
// }

// interface URIHost {
//     hostname?: string;
//     port?: string;
//     host(): string;
// }

// interface URIAuthority {
//     userInfo: URIUserInfo;
//     host: URIHost;
//     authority(): string;
// }

// interface URISearch {
//     searchParams: URLSearchParams;
//     search(): string;
// }

// interface URIRelativePath {
//     pathname: string;
//     search: URISearch;
//     fragment: string;
//     relativePath(): string;
// }

// interface URIHref {
//     scheme: URIScheme;
//     authority: URIAuthority;
//     relative: URIRelativePath;
// }

// interface CustomURI {
//     uri: URIHref;
//     href(): string;
//     parse(url: string): CustomURI;
// }

// interface WttpURI extends CustomURI {
//     chain?: string;
//     href(): string; // override the href method
//     parse(url: string): WttpURI;
// }

// export function getChainId(alias: string): number | null {
//     const aliases: Record<string, number> = {    
//         // String aliases
//         "localhost": 31337,
//         "sepolia": 11155111,
//         "testnet": 11155111,
//         "ethereum": 1,
//         "mainnet": 1,
//         "eth": 1,
//         "base": 8453,
//         "polygon": 137,
//         "matic": 137,
//         "arbitrum": 42161,
//         "arb": 42161,
//     };
    
//     return aliases[alias] || parseInt(alias) || null;
// }