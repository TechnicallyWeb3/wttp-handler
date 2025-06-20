// Debug the relative URL issue
const { wURL } = require('./dist/wurl.js');

console.log('=== Debugging relative paths ===');

try {
    // Test 1: Relative paths with chain inheritance
    console.log('\n1. Creating base URL: wttp://example.com:11155111/base');
    const baseUrl = new wURL('wttp://example.com:11155111/base');
    console.log('Base URL created:', baseUrl.toString());
    console.log('Base alias:', baseUrl.alias);
    console.log('Base href:', baseUrl.href);
    console.log('Base pathname:', baseUrl.pathname);

    console.log('\n2. Creating relative URL: ./relative');
    const relativeUrl = new wURL('./relative', baseUrl);
    console.log('Relative URL result:', relativeUrl.toString());
    console.log('Relative alias:', relativeUrl.alias);
    console.log('Relative href:', relativeUrl.href);
    console.log('Relative pathname:', relativeUrl.pathname);

    console.log('\nExpected: wttp://example.com:11155111/base/relative');
    console.log('Actual  :', relativeUrl.toString());

} catch (error) {
    console.error('Error with relative paths:', error.message);
}

try {
    // Test 2: Absolute paths with chain override
    console.log('\n=== Debugging absolute paths ===');
    console.log('Creating base URL: wttp://example.com:11155111/base');
    const baseUrl2 = new wURL('wttp://example.com:11155111/base');
    
    console.log('Creating absolute URL: wttp://other.com:1/path');
    const absoluteUrl = new wURL('wttp://other.com:1/path', baseUrl2);
    console.log('Absolute URL result:', absoluteUrl.toString());
    console.log('Absolute hostname:', absoluteUrl.hostname);

} catch (error) {
    console.error('Error with absolute paths:', error.message);
} 