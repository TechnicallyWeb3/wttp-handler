import { expect } from 'chai';

describe('Native URL Relative Path Behavior Analysis', () => {
  describe('Basic Relative Path Resolution', () => {
    const baseTests = [
      {
        name: 'simple relative path',
        base: 'wttp://example.com/base/path',
        relative: './file.html',
        description: 'Should resolve relative to current directory'
      },
      {
        name: 'parent directory relative path',
        base: 'wttp://example.com/base/path/',
        relative: '../other.html',
        description: 'Should go up one directory'
      },
      {
        name: 'multiple parent directories',
        base: 'wttp://example.com/deep/nested/path/',
        relative: '../../file.html',
        description: 'Should go up two directories'
      },
      {
        name: 'absolute path relative',
        base: 'wttp://example.com/base/path',
        relative: '/absolute.html',
        description: 'Should replace entire path'
      },
      {
        name: 'query-only relative',
        base: 'wttp://example.com/base/path',
        relative: '?query=value',
        description: 'Should keep path, replace query'
      },
      {
        name: 'fragment-only relative',
        base: 'wttp://example.com/base/path',
        relative: '#fragment',
        description: 'Should keep path and query, replace fragment'
      }
    ];

    baseTests.forEach(({ name, base, relative, description }) => {
      it(`should handle ${name}`, () => {
        // console.log(`\n${description}`);
        // console.log(`Base: ${base}`);
        // console.log(`Relative: ${relative}`);
        
        const url = new URL(relative, base);
        // console.log(`Result: ${url.toString()}`);
        // console.log(`Pathname: ${url.pathname}`);
        expect(url).to.be.instanceof(URL);
      });
    });
  });

  describe('Port-like Relative Paths - CRITICAL TEST', () => {
    const portTests = [
      {
        name: 'port-like relative path',
        base: 'wttp://example.com/base',
        relative: ':8080/path',
        description: 'Colon-prefixed paths - are they relative?'
      },
      {
        name: 'large port-like number',
        base: 'wttp://example.com/base',
        relative: ':11155111/path',
        description: 'Large chain-ID-like number - relative?'
      },
      {
        name: 'string port-like',
        base: 'wttp://example.com/base',
        relative: ':mainnet/path',
        description: 'String alias - relative?'
      },
      {
        name: 'colon only',
        base: 'wttp://example.com/base',
        relative: ':',
        description: 'Just colon - relative?'
      }
    ];

    portTests.forEach(({ name, base, relative, description }) => {
      it(`should handle ${name}`, () => {
        // console.log(`\n${description}`);
        // console.log(`Base: ${base}`);
        // console.log(`Relative: ${relative}`);
        
        try {
          const url = new URL(relative, base);
          // console.log(`✅ WORKS: ${url.toString()}`);
          // console.log(`   Protocol: ${url.protocol}`);
          // console.log(`   Hostname: ${url.hostname}`);
          // console.log(`   Port: ${url.port}`);
          // console.log(`   Pathname: ${url.pathname}`);
          
          // Check if it's actually relative by comparing hostname
          const baseUrl = new URL(base);
          expect(baseUrl.hostname).to.equal(url.hostname);
          // if (url.hostname === baseUrl.hostname) {
          //   console.log(`   ✅ IS RELATIVE (same hostname)`);
          // } else {
          //   console.log(`   ❌ IS ABSOLUTE (different hostname)`);
          // }
          
          expect(url).to.be.instanceof(URL);
        } catch (error: any) {
          console.log(`❌ FAILS: ${error.message}`);
          expect(() => new URL(relative, base)).to.throw();
        }
      });
    });
  });

  describe('Protocol Detection Edge Cases', () => {
    const protocolTests = [
      {
        name: 'wttp protocol (absolute)',
        base: 'wttp://example.com/base',
        relative: 'wttp://other.com/path'
      },
      {
        name: 'data protocol (absolute)',
        base: 'wttp://example.com/base',
        relative: 'data:text/plain,hello'
      },
      {
        name: 'scheme-relative URL',
        base: 'wttp://example.com/base',
        relative: '//other.com/path'
      }
    ];

    protocolTests.forEach(({ name, base, relative }) => {
      it(`should handle ${name}`, () => {
        // console.log(`\nTesting: ${relative}`);
        // console.log(`Base: ${base}`);
        
        try {
          const url = new URL(relative, base);
          // console.log(`✅ Result: ${url.toString()}`);
          // console.log(`   Protocol: ${url.protocol}`);
          // console.log(`   Hostname: ${url.hostname}`);
          expect(url).to.be.instanceof(URL);
        } catch (error: any) {
          console.log(`❌ Error: ${error.message}`);
          expect(() => new URL(relative, base)).to.throw();
        }
      });
    });
  });

  describe('Deep Backtracking Tests', () => {
    const backtrackTests = [
      {
        name: 'excessive backtracking',
        base: 'wttp://example.com/a/b',
        relative: '../../../file.html',
        description: 'More .. than directories available'
      },
      {
        name: 'backtrack to root',
        base: 'wttp://example.com/deep/nested/path/',
        relative: '../../../',
        description: 'Backtrack all the way to root'
      },
      {
        name: 'mixed path operations',
        base: 'wttp://example.com/a/b/c/',
        relative: '../d/./e/../f.html',
        description: 'Complex path with . and .. mixed'
      }
    ];

    backtrackTests.forEach(({ name, base, relative, description }) => {
      it(`should handle ${name}`, () => {
        // console.log(`\n${description}`);
        // console.log(`Base: ${base}`);
        // console.log(`Relative: ${relative}`);
        
        const url = new URL(relative, base);
        // console.log(`✅ Result: ${url.toString()}`);
        // console.log(`   Pathname: ${url.pathname}`);
        expect(url).to.be.instanceof(URL);
      });
    });
  });

  describe('URL Relative Path Behavior Analysis', () => {
    const urlTests = [
      {
        name: 'simple relative path',
        base: 'wttp://example.com/base/path/',
        relative: './file.html',
        description: 'Should resolve relative to current directory',
        expected: {
            href: 'wttp://example.com/base/path/file.html',
            pathname: '/base/path/file.html',
        }
      },
      {
        name: 'parent directory relative path',
        base: 'wttp://example.com/base/path/',
        relative: '../other.html',
        description: 'Should go up one directory',
        expected: {
            href: 'wttp://example.com/base/other.html',
            pathname: '/base/other.html',
        }
      },
      {
        name: 'path without trailing slash',
        base: 'wttp://example.com/deep/nested/path/',
        relative: '../../file.html',
        description: 'Should go up two directories',
        expected: {
            href: 'wttp://example.com/deep/file.html',
            pathname: '/deep/file.html',
        }
      },
      {
        name: 'absolute path relative',
        base: 'wttp://example.com/base/path/',
        relative: '/absolute.html',
        description: 'Should replace entire path',
        expected: {
            href: 'wttp://example.com/absolute.html',
            pathname: '/absolute.html',
        }
      },
      {
        name: 'path with query',
        base: 'wttp://example.com/base/path/',
        relative: '?query=value',
        description: 'Should not include query in pathname',
        expected: {
            href: 'wttp://example.com/base/path/?query=value',
            pathname: '/base/path/',
        }
      },
      {
        name: 'path with fragment',
        base: 'wttp://example.com/base/path/',
        relative: '#fragment',
        description: 'Should not include fragment in pathname',
        expected: {
            href: 'wttp://example.com/base/path/#fragment',
            pathname: '/base/path/',
        }
      }
    ];

    urlTests.forEach(({ name, base, relative, description, expected }) => {
      it(`${description}`, () => {
        const url = new URL(relative!, base);
        expect(url.href).to.equal(expected!.href);
        expect(url.pathname).to.equal(expected!.pathname);
      });
    });
  });
}); 