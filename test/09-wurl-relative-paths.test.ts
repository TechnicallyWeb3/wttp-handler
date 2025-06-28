import { expect } from 'chai';
import { wURL } from '@wttp/core';

describe('wURL Relative Path Behavior - Comprehensive Tests', () => {
  describe('Port-like Relative Paths (Critical)', () => {
    it('should handle colon-port relative path', () => {
      const base = 'wttp://example.com:11155111/base';
      const relative = ':8080/path';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const baseUrl = new wURL(base);
      console.log(`Base alias: ${baseUrl.alias}`);
      
      const url = new wURL(relative, baseUrl);
      console.log(`Result: ${url.toString()}`);
      console.log(`Pathname: ${url.pathname}`);
      console.log(`Alias: ${url.alias}`);
      
      expect(url.toString()).to.equal('wttp://example.com:11155111/:8080/path');
      expect(url.pathname).to.equal('/:8080/path');
      expect(url.alias).to.equal('11155111');
      expect(url.hostname).to.equal('example.com');
    });

    it('should handle colon-chain relative path', () => {
      const base = 'wttp://example.com:8080/base';
      const relative = ':11155111/path';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.toString()).to.equal('wttp://example.com:8080/:11155111/path');
      expect(url.pathname).to.equal('/:11155111/path');
      expect(url.alias).to.equal('8080');
    });

    it('should handle colon-string relative path', () => {
      const base = 'wttp://example.com:11155111/base';
      const relative = ':mainnet/path';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const baseUrl = new wURL(base);
      console.log(`Base alias: ${baseUrl.alias}`);
      
      const url = new wURL(relative, baseUrl);
      console.log(`Result: ${url.toString()}`);
      console.log(`Pathname: ${url.pathname}`);
      console.log(`Alias: ${url.alias}`);
      
      expect(url.toString()).to.equal('wttp://example.com:11155111/:mainnet/path');
      expect(url.pathname).to.equal('/:mainnet/path');
      expect(url.alias).to.equal('11155111');
      expect(url.hostname).to.equal('example.com');
    });

    it('should handle just colon relative', () => {
      const base = 'wttp://example.com:11155111/base';
      const relative = ':';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const baseUrl = new wURL(base);
      console.log(`Base alias: ${baseUrl.alias}`);
      
      const url = new wURL(relative, baseUrl);
      console.log(`Result: ${url.toString()}`);
      console.log(`Pathname: ${url.pathname}`);
      console.log(`Alias: ${url.alias}`);
      
      expect(url.toString()).to.equal('wttp://example.com:11155111/:');
      expect(url.pathname).to.equal('/:');
      expect(url.alias).to.equal('11155111');
      expect(url.hostname).to.equal('example.com');
    });
  });

  describe('Standard Relative Path Resolution', () => {
    it('should handle dot-relative with alias inheritance', () => {
      const base = 'wttp://example.com:11155111/base/path';
      const relative = './file.html';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.toString()).to.equal('wttp://example.com:11155111/base/file.html');
      expect(url.pathname).to.equal('/base/file.html');
      expect(url.alias).to.equal('11155111');
    });

    it('should handle parent directory with alias inheritance', () => {
      const base = 'wttp://example.com:11155111/base/path/';
      const relative = '../other.html';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.toString()).to.equal('wttp://example.com:11155111/base/other.html');
      expect(url.pathname).to.equal('/base/other.html');
      expect(url.alias).to.equal('11155111');
    });

    it('should handle multiple parent directories', () => {
      const base = 'wttp://example.com:11155111/deep/nested/path/';
      const relative = '../../file.html';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.toString()).to.equal('wttp://example.com:11155111/deep/file.html');
      expect(url.pathname).to.equal('/deep/file.html');
      expect(url.alias).to.equal('11155111');
    });

    it('should handle absolute path (should clear base path but keep alias)', () => {
      const base = 'wttp://example.com:11155111/base/path';
      const relative = '/absolute.html';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.toString()).to.equal('wttp://example.com:11155111/absolute.html');
      expect(url.pathname).to.equal('/absolute.html');
      expect(url.alias).to.equal('11155111');
    });

    it('should handle query-only relative', () => {
      const base = 'wttp://example.com:11155111/base/path';
      const relative = '?query=value';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.toString()).to.equal('wttp://example.com:11155111/base/path?query=value');
      expect(url.pathname).to.equal('/base/path');
      expect(url.alias).to.equal('11155111');
      expect(url.search).to.equal('?query=value');
    });

    it('should handle fragment-only relative', () => {
      const base = 'wttp://example.com:11155111/base/path';
      const relative = '#fragment';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.toString()).to.equal('wttp://example.com:11155111/base/path#fragment');
      expect(url.pathname).to.equal('/base/path');
      expect(url.alias).to.equal('11155111');
      expect(url.hash).to.equal('#fragment');
    });
  });

  describe('Absolute URL Override Tests', () => {
    it('should handle wttp absolute URL', () => {
      const base = 'wttp://example.com:11155111/base';
      const relative = 'wttp://other.com:1/path';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.hostname).to.equal('other.com');
      expect(url.port).to.equal('1');
      expect(url.pathname).to.equal('/path');
    });

    it('should handle https absolute URL', () => {
      const base = 'wttp://example.com:11155111/base';
      const relative = 'https://other.com/path';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.hostname).to.equal('other.com');
      expect(url.alias).to.equal('');
      expect(url.pathname).to.equal('/path');
      expect(url.protocol).to.equal('https:');
    });

    it('should handle wttp with large chain override', () => {
      const base = 'wttp://example.com:8080/base';
      const relative = 'wttp://other.com:11155111/path';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.hostname).to.equal('other.com');
      expect(url.alias).to.equal('11155111');
      expect(url.pathname).to.equal('/path');
    });
  });

  describe('Deep Backtracking with Aliases', () => {
    it('should handle excessive backtracking', () => {
      const base = 'wttp://example.com:11155111/a/b';
      const relative = '../../../file.html';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.toString()).to.equal('wttp://example.com:11155111/file.html');
      expect(url.pathname).to.equal('/file.html');
      expect(url.alias).to.equal('11155111');
    });

    it('should handle backtrack to root', () => {
      const base = 'wttp://example.com:11155111/deep/nested/path/';
      const relative = '../../../';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.toString()).to.equal('wttp://example.com:11155111/');
      expect(url.pathname).to.equal('/');
      expect(url.alias).to.equal('11155111');
    });

    it('should handle complex mixed operations', () => {
      const base = 'wttp://example.com:11155111/a/b/c/';
      const relative = '../d/./e/../f.html';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.toString()).to.equal('wttp://example.com:11155111/a/b/d/f.html');
      expect(url.pathname).to.equal('/a/b/d/f.html');
      expect(url.alias).to.equal('11155111');
    });
  });

  describe('Complex Base URLs with Various Aliases', () => {
    it('should handle base with auth and large chain', () => {
      const base = 'wttp://user:pass@example.com:11155111/base/path/';
      const relative = '../other.html';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.toString()).to.equal('wttp://user:pass@example.com:11155111/base/other.html');
      expect(url.username).to.equal('user');
      expect(url.password).to.equal('pass');
      expect(url.hostname).to.equal('example.com');
      expect(url.alias).to.equal('11155111');
      expect(url.pathname).to.equal('/base/other.html');
    });

    it('should handle query replacement with string alias', () => {
      const base = 'wttp://example.com:mainnet/path?old=value';
      const relative = '?new=value';
      
      console.log(`\nTesting: ${relative} with base ${base}`);
      
      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.toString()).to.equal('wttp://example.com:mainnet/path?new=value');
      expect(url.hostname).to.equal('example.com');
      expect(url.alias).to.equal('mainnet');
      expect(url.pathname).to.equal('/path');
      expect(url.search).to.equal('?new=value');
    });

    it('should handle basic relative path', () => {
      const base = 'wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:11155111/';
      const relative = './index.html';
      
      console.log(`\nTesting: ${relative} with base ${base}`);

      const url = new wURL(relative, base);
      console.log(`Result: ${url.toString()}`);
      
      expect(url.toString()).to.equal('wttp://0xfaC1BF2Be485DaF2A66855CE0e5A3F87eB77E5bb:11155111/index.html');
      expect(url.pathname).to.equal('/index.html');
      expect(url.alias).to.equal('11155111');
    });
  });
}); 