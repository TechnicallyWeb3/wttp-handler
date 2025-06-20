import { expect } from 'chai';
import { wURL } from '../src/wurl';

describe('wURL Implementation', () => {
  
  describe('Basic wURL Construction', () => {
    const basicConstructionTests = [
      {
        name: 'standard WTTP URLs without chains',
        input: 'wttp://example.com/path',
        expected: {
          protocol: 'wttp:',
          hostname: 'example.com',
          pathname: '/path',
          port: ''
        }
      },
      {
        name: 'chain IDs that exceed port limits',
        input: 'wttp://example.com:11155111/path',
        expected: {
          protocol: 'wttp:',
          hostname: 'example.com',
          pathname: '/path',
          port: '11155111',
        }
      },
      {
        name: 'small numeric chain IDs in port position',
        input: 'wttp://example.com:1/path',
        expected: {
          protocol: 'wttp:',
          hostname: 'example.com',
          pathname: '/path',
          port: '1'
        }
      },
      {
        name: 'common chain IDs (Ethereum mainnet)',
        input: 'wttp://example.com:1/index.html',
        expected: {
          protocol: 'wttp:',
          hostname: 'example.com',
          pathname: '/index.html',
          port: '1'
        }
      },
      {
        name: 'common chain IDs (Polygon)',
        input: 'wttp://example.com:137/dapp',
        expected: {
          protocol: 'wttp:',
          hostname: 'example.com',
          pathname: '/dapp',
          port: '137'
        }
      },
      {
        name: 'maximum valid port value',
        input: 'wttp://example.com:65535/path',
        expected: {
          protocol: 'wttp:',
          hostname: 'example.com',
          pathname: '/path',
          port: '65535'
        }
      }
    ];

    basicConstructionTests.forEach(({ name, input, expected }) => {
      it(`should handle ${name}`, () => {
        const url = new wURL(input);
        expect(url.protocol).to.equal(expected.protocol);
        expect(url.hostname).to.equal(expected.hostname);
        expect(url.pathname).to.equal(expected.pathname);
        expect(url.port).to.equal(expected.port);
      });
    });
  });

  describe('Complex URL Components', () => {
    const complexComponentTests = [
      {
        name: 'userinfo with chain-like values',
        input: 'wttp://user:123@example.com:1/path',
        expected: {
          username: 'user',
          password: '123',
          hostname: 'example.com',
          port: '1',
          pathname: '/path'
        }
      },
      {
        name: 'numeric userinfo with large chain IDs',
        input: 'wttp://1337:11155111@example.com:42161/path',
        expected: {
          username: '1337',
          password: '11155111',
          hostname: 'example.com',
          port: '42161',
          pathname: '/path'
        }
      },
      {
        name: 'hex addresses in various positions',
        input: 'wttp://0xabcdef:123@0x012345:11155111/path.html',
        expected: {
          username: '0xabcdef',
          password: '123',
          hostname: '0x012345',
          port: '11155111',
          pathname: '/path.html'
        }
      },
      {
        name: 'empty userinfo components',
        input: 'wttp://:@example.com:11155111/',
        expected: {
          username: '',
          password: '',
          hostname: 'example.com',
          port: '11155111',
          pathname: '/'
        }
      },
      {
        name: 'special characters in components',
        input: 'wttp://user%20name:pass%20word@example.com:11155111/path%20name',
        expected: {
          username: 'user%20name',
          password: 'pass%20word',
          hostname: 'example.com',
          port: '11155111',
          pathname: '/path%20name'
        }
      }
    ];

    complexComponentTests.forEach(({ name, input, expected }) => {
      it(`should handle ${name}`, () => {
        const url = new wURL(input);
        expect(url.username).to.equal(expected.username);
        expect(url.password).to.equal(expected.password);
        expect(url.hostname).to.equal(expected.hostname);
        expect(url.port).to.equal(expected.port);
        expect(url.pathname).to.equal(expected.pathname);
      });
    });
  });

  describe('URL Components Preservation', () => {
    const preservationTests = [
      {
        name: 'query parameters and fragments',
        input: 'wttp://example.com:11155111/path?key=value&chain=1#fragment',
        expected: {
          hostname: 'example.com',
          port: '11155111',
          pathname: '/path',
          search: '?key=value&chain=1',
          hash: '#fragment'
        }
      },
      {
        name: 'complex query strings with encoded values',
        input: 'wttp://example.com:1/api?data=%7B%22key%22%3A%22value%22%7D&type=json',
        expected: {
          hostname: 'example.com',
          port: '1',
          pathname: '/api',
          search: '?data=%7B%22key%22%3A%22value%22%7D&type=json'
        }
      },
      {
        name: 'multiple hash fragments (only last preserved)',
        input: 'wttp://example.com:137/page#section1#section2',
        expected: {
          hostname: 'example.com',
          port: '137',
          pathname: '/page',
          hash: '#section1#section2'
        }
      }
    ];

    preservationTests.forEach(({ name, input, expected }) => {
      it(`should preserve ${name}`, () => {
        const url = new wURL(input);
        expect(url.hostname).to.equal(expected.hostname);
        expect(url.port).to.equal(expected.port);
        expect(url.pathname).to.equal(expected.pathname);
        if (expected.search) expect(url.search).to.equal(expected.search);
        if (expected.hash) expect(url.hash).to.equal(expected.hash);
      });
    });
  });

  describe('Base URL and Relative Paths', () => {
    const relativePathTests = [
      {
        name: 'relative paths with chain inheritance',
        base: 'wttp://example.com:11155111/base',
        relative: './relative',
        expected: {
          href: 'wttp://example.com:65535/base/relative',
          port: '11155111',
          pathname: '/base/relative'
        }
      },
      {
        name: 'absolute paths with chain override',
        base: 'wttp://example.com:11155111/base',
        relative: 'wttp://other.com:1/path',
        expected: {
          hostname: 'other.com',
          port: '1',
          pathname: '/path'
        }
      },
      {
        name: 'relative paths with component changes',
        base: 'wttp://user:pass@example.com:11155111/base?q=1#hash',
        relative: '../other?q=2#new',
        expected: {
          username: 'user',
          password: 'pass',
          hostname: 'example.com',
          port: '11155111',
          pathname: '/other',
          search: '?q=2',
          hash: '#new'
        }
      },
      {
        name: 'query-only relative URLs',
        base: 'wttp://example.com:1/path',
        relative: '?newquery=value',
        expected: {
          hostname: 'example.com',
          port: '1',
          pathname: '/path',
          search: '?newquery=value'
        }
      }
    ];

    relativePathTests.forEach(({ name, base, relative, expected }) => {
      it(`should handle ${name}`, () => {
        const baseUrl = new wURL(base);
        const url = new wURL(relative, baseUrl);
        
        if (expected.href) expect(url.href).to.equal(expected.href);
        if (expected.hostname) expect(url.hostname).to.equal(expected.hostname);
        if (expected.port) expect(url.port).to.equal(expected.port);
        if (expected.pathname) expect(url.pathname).to.equal(expected.pathname);
        if (expected.username) expect(url.username).to.equal(expected.username);
        if (expected.password) expect(url.password).to.equal(expected.password);
        if (expected.search) expect(url.search).to.equal(expected.search);
        if (expected.hash) expect(url.hash).to.equal(expected.hash);
      });
    });
  });

  describe('Input Type Handling', () => {
    const inputTypeTests = [
      {
        name: 'URL objects as input',
        input: () => new URL('wttp://example.com:1337/path'),
        expected: {
          hostname: 'example.com',
          port: '1337',
          pathname: '/path'
        }
      },
      {
        name: 'existing wURL objects as input',
        input: () => new wURL('wttp://example.com:11155111/path'),
        expected: {
          hostname: 'example.com',
          port: '11155111',
          pathname: '/path'
        }
      }
    ];

    inputTypeTests.forEach(({ name, input, expected }) => {
      it(`should handle ${name}`, () => {
        const url = new wURL(input());
        expect(url.hostname).to.equal(expected.hostname);
        expect(url.port).to.equal(expected.port);
        expect(url.pathname).to.equal(expected.pathname);
      });
    });

    it('should maintain toString() and href consistency', () => {
      const urlString = 'wttp://user:pass@example.com:11155111/path?q=1#hash';
      const url = new wURL(urlString);
      expect(urlString).to.equal(url.href);
      expect(url.toString()).to.equal(url.href);
      expect(url.port).to.equal('11155111');
    });
  });

  describe('Error Cases', () => {
    const errorTests = [
      {
        name: 'non-numeric chain values',
        input: 'wttp://example.com:invalidchain',
        expectedError: 'Invalid URL'
      },
      {
        name: 'empty URLs',
        input: '',
        expectedError: 'Invalid URL'
      },
      {
        name: 'invalid protocol with numeric port',
        input: 'inv@lid://example.com:123',
        expectedError: 'Invalid URL'
      }
    ];

    errorTests.forEach(({ name, input, expectedError }) => {
      it(`should throw error for ${name}`, () => {
        expect(() => new wURL(input)).to.throw(expectedError);
      });
    });
  });

  describe('Chain ID Edge Cases', () => {
    const chainEdgeCases = [
      {
        name: 'very large chain IDs (greater than max port)',
        input: 'wttp://example.com:999999999/path',
        expected: {
          port: '999999999'
        }
      },
      {
        name: 'zero chain ID',
        input: 'wttp://example.com:0/path',
        expected: {
          port: '0',
        }
      },
      {
        name: 'common testnet chain IDs (Sepolia)',
        input: 'wttp://example.com:11155111/path',
        expected: {
          port: '11155111'
        }
      },
      {
        name: 'common sidechain IDs (Arbitrum One)',
        input: 'wttp://example.com:42161/path',
        expected: {
          port: '42161',
        }
      }
    ];

    chainEdgeCases.forEach(({ name, input, expected }) => {
      it(`should handle ${name}`, () => {
        const url = new wURL(input);
        expect(url.port).to.equal(expected.port);
      });
    });
  });

  describe('Port Property Behavior Tests', () => {
    const portTests = [
      {
        name: 'setting port property to small valid number',
        initial: 'wttp://example.com:1/path',
        action: (url: wURL) => { url.port = '137'; },
        expected: {
          port: '137'
        }
      },
      {
        name: 'setting port to large number (>65535)',
        initial: 'wttp://example.com/path',
        action: (url: wURL) => { url.port = '11155111'; },
        expected: {
          port: '11155111'
        }
      },
      {
        name: 'setting port to string value',
        initial: 'wttp://example.com/path',
        action: (url: wURL) => { url.port = 'mainnet'; },
        expected: {
          port: 'mainnet'
        }
      },
      {
        name: 'setting port to empty string',
        initial: 'wttp://example.com:8080/path',
        action: (url: wURL) => { url.port = ''; },
        expected: {
          port: ''
        }
      },
      {
        name: 'port getter returns value for valid ports',
        initial: 'wttp://example.com:65535/path',
        action: (url: wURL) => { /* no action */ },
        expected: {
          port: '65535'
        }
      },
      {
        name: 'port getter returns value for large chain IDs',
        initial: 'wttp://example.com:11155111/path',
        action: (url: wURL) => { /* no action */ },
        expected: {
          port: '11155111'
        }
      }
    ];

    portTests.forEach(({ name, initial, action, expected }) => {
      it(`should handle ${name}`, () => {
        const url = new wURL(initial);
        action(url);
        
        expect(url.port).to.equal(expected.port);
      });
    });

        it('should maintain port value consistency', () => {
      const url = new wURL('wttp://example.com/path');
      
      // Set through port property
      url.port = '1337';
      expect(url.port).to.equal('1337');
      
      // Set large value through port
      url.port = '999999999';
      expect(url.port).to.equal('999999999');
      
      // Set string value through port
      url.port = 'testnet';
      expect(url.port).to.equal('testnet');
    });

    it('should handle edge cases in port property', () => {
      const url = new wURL('wttp://example.com/path');
      
      // Test zero
      url.port = '0';
      expect(url.port).to.equal('0');
      
      // Test negative (converted to string)
      url.port = '-1';
      expect(url.port).to.equal('-1');
      
      // Test decimal
      url.port = '80.5';
      expect(url.port).to.equal('80.5');
      
      // Test whitespace
      url.port = ' 80 ';
      expect(url.port).to.equal(' 80 ');
    });

    it('should update href and host when port is set (cascading effect)', () => {
      const url = new wURL('wttp://example.com/path');
      
      console.log('Initial state:');
      console.log('- href:', url.href);
      console.log('- host:', url.host);
      console.log('- port:', url.port);
      
      // Set valid port
      url.port = '8080';
      console.log('After setting port to 8080:');
      console.log('- href:', url.href);
      console.log('- host:', url.host);
      console.log('- port:', url.port);
      
      expect(url.port).to.equal('8080');
      expect(url.host).to.include('8080'); // Should include the port
      expect(url.href).to.include('8080'); // Should include the port
      
      // Set large port (should still work)
      url.port = '11155111';
      console.log('After setting port to 11155111:');
      console.log('- href:', url.href);
      console.log('- host:', url.host);
      console.log('- port:', url.port);
      
      expect(url.port).to.equal('11155111');
      expect(url.host).to.include('11155111'); // Should include the large port
      expect(url.href).to.include('11155111'); // Should include the large port
      
      // Set string port (should still work)
      url.port = 'mainnet';
      console.log('After setting port to mainnet:');
      console.log('- href:', url.href);
      console.log('- host:', url.host);
      console.log('- port:', url.port);
      
      expect(url.port).to.equal('mainnet');
      expect(url.host).to.include('mainnet'); // Should include the string port
      expect(url.href).to.include('mainnet'); // Should include the string port
    });
  });
});
