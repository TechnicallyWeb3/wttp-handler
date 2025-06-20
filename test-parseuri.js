const parseUri = require('parse-uri');

console.log('=== Testing parseUri with IPv6 addresses ===\n');

const testUrls = [
    'https://[::1]:8080',
    'https://[::1]:myalias', 
    'https://[2001:db8::1]',
    'https://example.com:8080'
];

testUrls.forEach(url => {
    console.log(`Testing: ${url}`);
    try {
        const parsed = parseUri(url, { strictMode: false });
        console.log('  authority:', parsed.authority);
        console.log('  host:', parsed.host);
        console.log('  port:', parsed.port);
        console.log('  userInfo:', parsed.userInfo);
        console.log('');
    } catch (error) {
        console.log('  ERROR:', error.message);
        console.log('');
    }
}); 