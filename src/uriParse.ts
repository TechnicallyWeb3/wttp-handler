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

