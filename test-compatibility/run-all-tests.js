#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Comprehensive Import Compatibility Tests for wttp-handler\n');

const tests = [
  {
    name: 'CommonJS Basic Tests',
    directory: 'cjs-test',
    command: 'npm',
    args: ['test'],
    description: 'Basic CommonJS require() imports'
  },
  {
    name: 'CommonJS Advanced Tests', 
    directory: 'cjs-test',
    command: 'npm',
    args: ['run', 'test:imports'],
    description: 'Advanced CommonJS functionality tests'
  },
  {
    name: 'ESM Basic Tests',
    directory: 'esm-test', 
    command: 'npm',
    args: ['test'],
    description: 'Basic ES Module import syntax'
  },
  {
    name: 'ESM Advanced Tests',
    directory: 'esm-test',
    command: 'npm', 
    args: ['run', 'test:imports'],
    description: 'Advanced ESM functionality tests'
  }
];

async function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log(`\n📦 Running: ${test.name}`);
    console.log(`📁 Directory: ${test.directory}`);
    console.log(`📝 Description: ${test.description}`);
    console.log('─'.repeat(60));

    const testDir = path.join(__dirname, test.directory);
    
    const child = spawn(test.command, test.args, {
      cwd: testDir,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${test.name} - PASSED`);
        resolve({ test: test.name, status: 'PASSED', code });
      } else {
        console.log(`❌ ${test.name} - FAILED (exit code: ${code})`);
        reject(new Error(`${test.name} failed with exit code ${code}`));
      }
    });

    child.on('error', (err) => {
      console.log(`❌ ${test.name} - ERROR: ${err.message}`);
      reject(err);
    });
  });
}

async function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');
  
  // Check if package is built
  const fs = require('fs');
  const distExists = fs.existsSync(path.join(__dirname, '..', 'dist'));
  
  if (!distExists) {
    console.log('❌ Dist folder not found. Please run "npm run build" first.');
    console.log('💡 Building the package is required for compatibility testing.');
    process.exit(1);
  }
  
  console.log('✅ Dist folder found');
  
  // Check for required dist folders
  const requiredFolders = ['cjs', 'esm', 'types'];
  const missingFolders = requiredFolders.filter(folder => 
    !fs.existsSync(path.join(__dirname, '..', 'dist', folder))
  );
  
  if (missingFolders.length > 0) {
    console.log(`❌ Missing dist folders: ${missingFolders.join(', ')}`);
    console.log('💡 Please run "npm run build" to generate all required output formats.');
    process.exit(1);
  }
  
  console.log('✅ All required dist folders found (cjs, esm, types)');
  
  // Check package.json exports
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  
  if (!packageJson.exports || !packageJson.exports['.']) {
    console.log('❌ Package.json missing exports field');
    console.log('💡 Dual package setup requires proper exports configuration.');
    process.exit(1);
  }
  
  console.log('✅ Package.json exports configuration found');
  console.log(`   - CJS: ${packageJson.exports['.'].require}`);
  console.log(`   - ESM: ${packageJson.exports['.'].import}`);
  console.log(`   - Types: ${packageJson.exports['.'].types}`);
  
  console.log('\n🎯 All prerequisites met, proceeding with tests...\n');
}

async function installDependencies() {
  console.log('📦 Installing test dependencies...\n');
  
  const directories = ['cjs-test', 'esm-test'];
  
  for (const dir of directories) {
    const testDir = path.join(__dirname, dir);
    console.log(`Installing dependencies in ${dir}...`);
    
    await new Promise((resolve, reject) => {
      const child = spawn('npm', ['install'], {
        cwd: testDir,
        stdio: 'inherit',
        shell: process.platform === 'win32'
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Dependencies installed in ${dir}`);
          resolve();
        } else {
          reject(new Error(`Failed to install dependencies in ${dir}`));
        }
      });

      child.on('error', reject);
    });
  }
  
  console.log('\n✅ All dependencies installed successfully!\n');
}

async function validateTestEnvironment() {
  console.log('🔬 Validating test environment...\n');
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  console.log(`📌 Node.js version: ${nodeVersion}`);
  
  if (majorVersion < 16) {
    console.log('⚠️  Warning: Node.js 16+ recommended for best ESM support');
  } else {
    console.log('✅ Node.js version compatible');
  }
  
  // Check npm version
  try {
    const { execSync } = require('child_process');
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`📌 npm version: ${npmVersion}`);
  } catch (error) {
    console.log('⚠️  Could not determine npm version');
  }
  
  console.log('');
}

async function main() {
  const startTime = Date.now();
  const results = [];
  
  try {
    await validateTestEnvironment();
    await checkPrerequisites();
    await installDependencies();
    
    for (const test of tests) {
      try {
        const result = await runTest(test);
        results.push(result);
      } catch (error) {
        results.push({ 
          test: test.name, 
          status: 'FAILED', 
          error: error.message 
        });
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 WTTP-HANDLER COMPATIBILITY TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passed = results.filter(r => r.status === 'PASSED').length;
    const failed = results.filter(r => r.status === 'FAILED').length;
    
    console.log(`⏱️  Total Duration: ${duration}s`);
    console.log(`✅ Passed: ${passed}/${results.length}`);
    console.log(`❌ Failed: ${failed}/${results.length}`);
    
    results.forEach(result => {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} ${result.test}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    if (failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('📦 wttp-handler is fully compatible with both CommonJS and ES Module environments');
      console.log('🔄 The package can be safely used in:');
      console.log('   - Node.js CommonJS projects (require)');
      console.log('   - Node.js ES Module projects (import)');
      console.log('   - Modern bundlers (webpack, vite, rollup)');
      console.log('   - TypeScript projects (both module systems)');
    } else {
      console.log('\n❌ SOME TESTS FAILED');
      console.log('💡 Please check the failed tests and ensure:');
      console.log('   - Package is properly built (npm run build)');
      console.log('   - All exports are correctly configured');
      console.log('   - Dependencies are properly installed');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test runner failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

main(); 