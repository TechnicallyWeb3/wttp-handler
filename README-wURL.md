# wURL - Wide URL

A TypeScript/JavaScript library that extends the native URL class to support string aliases in the port position, perfect for blockchain applications, environment-specific URLs, and any scenario where the port position needs to contain non-numeric identifiers.

## Features

- 🔗 **100% URL Compatible**: Extends native URL class with full compatibility
- 🔗 **Alias Support**: Handle string identifiers like "mainnet", "sepolia", or custom environment names in port position
- 🔗 **Large Chain IDs**: Support blockchain chain IDs that exceed the 65535 port limit
- 🔗 **IPv6 Ready**: Full IPv6 address support with alias extraction
- 🔗 **Relative Resolution**: Native URL relative path resolution with alias inheritance
- 🔗 **TypeScript Native**: Written in TypeScript with comprehensive type definitions

## Installation

```bash
npm install wurl
```

## Quick Start

```typescript
import { wURL } from 'wurl';

// Standard URL with valid port (works exactly like native URL)
const api = new wURL('https://api.example.com:8080/data');
console.log(api.port);   // "8080"
console.log(api.alias);  // "8080"

// URL with blockchain chain ID
const contract = new wURL('wttp://contract.eth:11155111/api');
console.log(contract.port);   // "" (empty - invalid for native URL)
console.log(contract.alias);  // "11155111"
console.log(contract.toString()); // "wttp://contract.eth:11155111/api"

// URL with environment alias
const staging = new wURL('https://api.example.com:staging/users');
console.log(staging.alias);  // "staging"
console.log(staging.hostname); // "api.example.com" (all URL properties work)

// Relative URL resolution with alias inheritance
const base = new wURL('wttp://example.com:sepolia/v1/');
const endpoint = new wURL('contracts/token', base);
console.log(endpoint.toString()); // "wttp://example.com:sepolia/v1/contracts/token"
console.log(endpoint.alias); // "sepolia" (inherited from base)
```

## Use Cases

### Blockchain Applications
```typescript
// Ethereum chain IDs
const mainnet = new wURL('wttp://api.ethereum.org:1/blocks');
const sepolia = new wURL('wttp://api.ethereum.org:11155111/blocks');
const polygon = new wURL('wttp://api.polygon.org:137/transactions');

// Named networks
const testnet = new wURL('wttp://contracts.eth:sepolia/deploy');
const local = new wURL('wttp://localhost:development/debug');
```

### Environment-Specific URLs
```typescript
// Multi-environment API endpoints
const prod = new wURL('https://api.myapp.com:production/v1/');
const staging = new wURL('https://api.myapp.com:staging/v1/');
const dev = new wURL('https://api.myapp.com:development/v1/');

// Build URLs relative to environment
const userEndpoint = new wURL('users/profile', staging);
// Results in: https://api.myapp.com:staging/v1/users/profile
```

### IPv6 Support
```typescript
// IPv6 with aliases
const local = new wURL('https://[::1]:development/api');
const remote = new wURL('https://[2001:db8::1]:production/secure');

console.log(local.alias);    // "development"
console.log(remote.alias);   // "production"
```

## API Reference

### Constructor

```typescript
new wURL(url: string | URL | wURL, base?: string | URL | wURL)
```

Creates a new wURL instance. Accepts the same parameters as the native URL constructor.

**Parameters:**
- `url` - The URL string, URL object, or wURL object to parse
- `base` - Optional base URL for resolving relative URLs

**Throws:**
- `Error` - When the URL is invalid or malformed
- `Error` - When IPv6 format is invalid  
- `Error` - When alias format contains ambiguous colons

### Properties

#### `alias: string`
The alias/chain identifier extracted from the port position.

```typescript
const url = new wURL('https://api.example.com:mainnet/data');
console.log(url.alias); // "mainnet"
```

### Methods

#### `toString(): string`
Returns the URL string with the alias displayed in the port position.

```typescript
const url = new wURL('https://api.example.com:mainnet/data');
console.log(url.toString()); // "https://api.example.com:mainnet/data"
console.log(url.href);       // "https://api.example.com/data" (native URL)
```

#### `static preprocessUrl(url: string | URL | wURL): ProcessedURL`
Static method that preprocesses URLs to extract aliases. Primarily for internal use.

### Inherited Properties & Methods

wURL extends the native URL class, so all standard URL properties and methods are available:

- `href`, `protocol`, `hostname`, `port`, `pathname`, `search`, `hash`
- `host`, `origin`, `username`, `password`
- `searchParams` (URLSearchParams object)
- All native URL methods

## Behavior Details

### Port vs Alias Logic

1. **Valid ports (≤65535)**: Both `port` and `alias` contain the same value
2. **Invalid large numbers (>65535)**: `port` is empty, `alias` contains the full number
3. **String values**: `port` is empty, `alias` contains the string

### Relative URL Resolution

wURL maintains native URL relative resolution behavior while adding alias inheritance:

```typescript
const base = new wURL('wttp://example.com:mainnet/api/v1/');

// Relative paths
new wURL('./users', base);     // wttp://example.com:mainnet/api/v1/users
new wURL('../v2/users', base); // wttp://example.com:mainnet/api/v2/users
new wURL('/admin', base);      // wttp://example.com:mainnet/admin

// Query and fragment
new wURL('?filter=active', base); // wttp://example.com:mainnet/api/v1/?filter=active
new wURL('#section', base);       // wttp://example.com:mainnet/api/v1/#section
```

### IPv6 Handling

IPv6 addresses are fully supported with proper bracket handling:

```typescript
// IPv6 without port
const ipv6 = new wURL('https://[2001:db8::1]/api');

// IPv6 with valid port  
const ipv6Port = new wURL('https://[::1]:8080/local');

// IPv6 with alias
const ipv6Alias = new wURL('https://[::1]:development/debug');
```

## Error Handling

wURL provides clear error messages for common issues:

```typescript
// Invalid URL format
try {
  new wURL('not-a-url');
} catch (error) {
  console.log(error.message); // "Invalid URL: not-a-url"
}

// Invalid IPv6 format
try {
  new wURL('https://[::1:broken]/path');
} catch (error) {
  console.log(error.message); // "Invalid IPv6 format: [::1:broken]"
}

// Ambiguous alias format
try {
  new wURL('https://host:too:many:colons/path');
} catch (error) {
  console.log(error.message); // "Invalid alias format: host:too:many:colons"
}
```

## Compatibility

- **Node.js**: 14+ (requires native URL support)
- **Browsers**: All modern browsers with URL support
- **TypeScript**: 4.0+
- **Dependencies**: `parse-uri` for URL parsing

## Migration from Native URL

wURL is a drop-in replacement for native URL with additional alias functionality:

```typescript
// Before
const url = new URL('https://api.example.com:8080/data');

// After  
const url = new wURL('https://api.example.com:8080/data');
// All existing code continues to work, plus you get alias support
```

## Testing

wURL includes comprehensive tests covering:
- 219+ test cases
- URL construction and property access
- Relative URL resolution
- IPv6 address handling
- Error conditions and edge cases
- Compatibility with native URL behavior

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## Changelog

See CHANGELOG.md for version history and breaking changes. 