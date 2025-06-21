# @wttp/handler

A TypeScript/JavaScript client library for the WTTP (Web Three Transfer Protocol) that enables decentralized web hosting on blockchain networks. This package provides fetch-like functionality for retrieving content from WTTP sites deployed on various blockchain networks.

## Features

- 🌐 **WTTP Protocol Support** - Full implementation of WTTP methods (GET, HEAD, OPTIONS, LOCATE)
- 🔗 **Multi-Chain Support** - Works with Ethereum, Sepolia, Polygon, Base, and other EVM networks
- 📍 **wURL Class** - Extended URL class supporting blockchain chain IDs and aliases in the port position
- ⚡ **Fetch-like API** - Familiar interface similar to the native `fetch()` function
- 🔄 **Redirect Handling** - Automatic redirect following with customizable behavior
- 📊 **Rich Response Data** - Access to blockchain-specific metadata and headers
- 🛡️ **TypeScript Support** - Full type definitions for better development experience

## Installation

```bash
npm install @wttp/handler
```

## Quick Start

```typescript
import { WTTPHandler } from '@wttp/handler';

// Create a WTTP client
const wttp = new WTTPHandler();

// Fetch content from a WTTP site
const response = await wttp.fetch('wttp://example.eth:11155111/index.html');

console.log('Status:', response.status);
console.log('Content:', response.body);
console.log('Headers:', response.headers);
```

## Core Classes

### WTTPHandler Class

The main client for interacting with WTTP sites.

#### Constructor

```typescript
const wttp = new WTTPHandler(signer?, defaultChain?);
```

- **signer** (optional): Ethers.js signer for blockchain interactions
- **defaultChain** (optional): Default chain ID or alias (e.g., "sepolia", "mainnet", "11155111")

#### Methods

##### `fetch(url, options?)`

Fetch content from a WTTP site with a familiar fetch-like interface.

```typescript
const response = await wttp.fetch(url, {
  method: Method.GET,           // GET | HEAD | OPTIONS | LOCATE
  headers: {
    ifModifiedSince: timestamp,
    ifNoneMatch: etag,
    rangeChunks: { start: 0n, end: 100n },
    rangeBytes: { start: 0n, end: 1024n }
  },
  signer: customSigner,         // Override default signer
  gateway: gatewayAddress,      // Override default gateway
  redirect: "follow"            // "follow" | "error" | "manual"
});
```

**Response Object:**
```typescript
{
  status: number;                    // HTTP-like status code
  headers: Record<string, string>;   // Response headers
  body: string | Uint8Array;         // Response body
}
```

### wURL Class

Extended URL class that supports blockchain chain IDs and string aliases in the port position.

#### Basic Usage

```typescript
import { wURL } from '@wttp/handler';

// Chain ID in port position (Sepolia testnet)
const chainUrl = new wURL('wttp://contract.eth:11155111/api/data');
console.log(chainUrl.alias);     // "11155111"
console.log(chainUrl.hostname);  // "contract.eth"
console.log(chainUrl.pathname);  // "/api/data"

// String alias in port position
const envUrl = new wURL('https://api.example.com:staging/users');
console.log(envUrl.alias);       // "staging"

// Standard port (no alias)
const standardUrl = new wURL('https://api.example.com:8080/data');
console.log(standardUrl.alias);  // "8080"
console.log(standardUrl.port);   // "8080"
```

#### Relative URL Resolution

```typescript
const base = new wURL('wttp://example.com:sepolia/api/v1/');
const endpoint = new wURL('../v2/users', base);
console.log(endpoint.toString()); // "wttp://example.com:sepolia/api/v2/users"
console.log(endpoint.alias);      // "sepolia" (inherited from base)
```

#### Properties

- **alias**: The chain ID or alias extracted from the port position
- All standard URL properties (hostname, pathname, search, hash, etc.)

## Supported HTTP Methods

### GET
Fetch content from a WTTP site:

```typescript
const response = await wttp.fetch('wttp://site.eth:11155111/page.html', {
  method: Method.GET
});
```

### HEAD
Get headers without body content:

```typescript
const response = await wttp.fetch('wttp://site.eth:11155111/file.pdf', {
  method: Method.HEAD
});
console.log('Content-Length:', response.headers['Content-Length']);
```

### OPTIONS
Discover allowed methods for a resource:

```typescript
const response = await wttp.fetch('wttp://site.eth:11155111/api/', {
  method: Method.OPTIONS
});
console.log('Allowed:', response.headers['Allowed-Methods']);
```

### LOCATE
Get metadata and structure information:

```typescript
const response = await wttp.fetch('wttp://site.eth:11155111/data/', {
  method: Method.LOCATE
});
// Response body contains JSON structure information
```

## Chain Support

The library supports multiple blockchain networks with convenient aliases:

### Mainnets
- **Ethereum**: `1`, `"ethereum"`, `"mainnet"`, `"eth"`
- **Polygon**: `137`, `"polygon"`, `"matic"`
- **Base**: `8453`, `"base"`

### Testnets
- **Sepolia**: `11155111`, `"sepolia"`, `"testnet"`
- **Localhost**: `31337`, `"localhost"`

### Usage Examples

```typescript
// Using chain ID
const mainnetSite = new wURL('wttp://example.eth:1/index.html');

// Using alias
const sepoliaSite = new wURL('wttp://example.eth:sepolia/index.html');

// Setting default chain
const wttp = new WTTPHandler(undefined, "sepolia");
```

## Advanced Features

### Custom Headers

```typescript
const response = await wttp.fetch('wttp://site.eth:11155111/api/data', {
  headers: {
    ifModifiedSince: Date.now() - 86400000, // 24 hours ago
    ifNoneMatch: 'previous-etag-value',
    rangeBytes: { start: 0n, end: 1023n }   // First 1KB
  }
});
```

### Redirect Handling

```typescript
// Follow redirects automatically (default)
const response = await wttp.fetch(url, { redirect: "follow" });

// Return redirect response without following
const response = await wttp.fetch(url, { redirect: "manual" });

// Throw error on redirect
const response = await wttp.fetch(url, { redirect: "error" });
```

### Custom Signer and Gateway

```typescript
import { ethers } from 'ethers';

const customSigner = new ethers.Wallet('private-key');
const response = await wttp.fetch(url, {
  signer: customSigner,
  gateway: '0x1234567890abcdef...'
});
```

## Response Headers

WTTP responses include rich metadata:

```typescript
const response = await wttp.fetch('wttp://site.eth:11155111/file.html');

console.log(response.headers);
// {
//   "Content-Type": "text/html; charset=utf-8",
//   "Content-Length": "1024",
//   "Content-Version": "1",
//   "Last-Modified": "1640995200",
//   "ETag": "0x1234...",
//   "Cache-Control": "public, max-age=3600",
//   "Allow-Methods": "GET, HEAD, OPTIONS",
//   "Location": "" // For redirects
// }
```

## Error Handling

```typescript
try {
  const response = await wttp.fetch('wttp://site.eth:11155111/missing.html');
  if (response.status === 404) {
    console.log('File not found');
  }
} catch (error) {
  console.error('Network or protocol error:', error);
}
```

## TypeScript Support

The library is written in TypeScript and provides full type definitions:

```typescript
import { WTTPHandler, wURL, Method, WTTPFetchOptions, SimpleResponse } from '@wttp/handler';

const options: WTTPFetchOptions = {
  method: Method.GET,
  redirect: "follow"
};

const response: SimpleResponse = await wttp.fetch(url, options);
```

## Comparison with Standard fetch()

| Feature | `fetch()` | `wttp.fetch()` |
|---------|-----------|----------------|
| Protocol | HTTP/HTTPS | WTTP |
| Network | Internet | Blockchain |
| URLs | Standard URLs | wURL with chain IDs |
| Caching | Browser cache | Blockchain immutability |
| Authentication | Headers/cookies | Blockchain signatures |
| Decentralization | Centralized servers | Decentralized storage |

## Examples

### Basic Website Fetching

```typescript
import { WTTPHandler } from '@wttp/handler';

const wttp = new WTTPHandler();

// Fetch a webpage
const html = await wttp.fetch('wttp://myblog.eth:sepolia/index.html');
console.log(html.body); // HTML content

// Fetch an API endpoint
const api = await wttp.fetch('wttp://myapi.eth:sepolia/api/users');
const users = JSON.parse(api.body as string);
```

### Working with Different File Types

```typescript
// Text content
const textResponse = await wttp.fetch('wttp://site.eth:11155111/readme.txt');
console.log(textResponse.body); // string

// Binary content (images, PDFs, etc.)
const imageResponse = await wttp.fetch('wttp://site.eth:11155111/logo.png');
console.log(imageResponse.body); // Uint8Array
```

### Chain-Specific Operations

```typescript
// Different chains for dev/staging/prod
const devSite = new wURL('wttp://myapp.eth:localhost/');
const stagingSite = new wURL('wttp://myapp.eth:sepolia/');
const prodSite = new wURL('wttp://myapp.eth:mainnet/');

// Connect to different environments
const wttps = {
  dev: new WTTPHandler(undefined, "localhost"),
  staging: new WTTPHandler(undefined, "sepolia"),
  production: new WTTPHandler(undefined, "mainnet")
};
```

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- **[@wttp/core](https://www.npmjs.com/package/@wttp/core)** - Core WTTP protocol definitions
- **[@wttp/gateway](https://www.npmjs.com/package/@wttp/gateway)** - WTTP gateway smart contracts
- **[@wttp/site](https://www.npmjs.com/package/@wttp/site)** - WTTP site deployment tools

## Support

- 📖 [Documentation](https://github.com/TechnicallyWeb3/wttp-handler#readme)
- 🐛 [Issue Tracker](https://github.com/TechnicallyWeb3/wttp-handler/issues)
- 💬 [Discussions](https://github.com/TechnicallyWeb3/wttp-handler/discussions)

---

Built with ❤️ by [TechnicallyWeb3](https://github.com/TechnicallyWeb3) 