#!/usr/bin/env node

/**
 * PolyRPC CLI
 *
 * This script wraps the Rust binary and handles:
 * 1. Finding the correct binary for the current platform
 * 2. Passing through all CLI arguments
 * 3. Graceful error handling
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Determine the binary name based on platform
function getBinaryName() {
  const platform = os.platform();
  const arch = os.arch();

  const platformMap = {
    'win32-x64': 'polyrpc-x86_64-pc-windows-msvc.exe',
    'win32-arm64': 'polyrpc-aarch64-pc-windows-msvc.exe',
    'darwin-x64': 'polyrpc-x86_64-apple-darwin',
    'darwin-arm64': 'polyrpc-aarch64-apple-darwin',
    'linux-x64': 'polyrpc-x86_64-unknown-linux-gnu',
    'linux-arm64': 'polyrpc-aarch64-unknown-linux-gnu',
  };

  const key = `${platform}-${arch}`;
  const binary = platformMap[key];

  if (!binary) {
    console.error(`Unsupported platform: ${platform}-${arch}`);
    console.error('Please build from source: cargo install polyrpc-sentinel');
    process.exit(1);
  }

  return binary;
}

// Find the binary path
function findBinary() {
  const binaryName = getBinaryName();

  // Check in package's bin directory
  const packageBin = path.join(__dirname, '..', 'native', binaryName);
  if (fs.existsSync(packageBin)) {
    return packageBin;
  }

  // Check if installed globally via cargo
  const cargoHome = process.env.CARGO_HOME || path.join(os.homedir(), '.cargo');
  const cargoBin = path.join(cargoHome, 'bin', 'polyrpc' + (os.platform() === 'win32' ? '.exe' : ''));
  if (fs.existsSync(cargoBin)) {
    return cargoBin;
  }

  // Binary not found
  console.error('PolyRPC binary not found.');
  console.error('');
  console.error('To install:');
  console.error('  1. Download from GitHub releases');
  console.error('  2. Or build from source: cargo install polyrpc-sentinel');
  console.error('');
  process.exit(1);
}

// Main execution
function main() {
  const binaryPath = findBinary();
  const args = process.argv.slice(2);

  // Spawn the Rust binary with all arguments
  const child = spawn(binaryPath, args, {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('error', (err) => {
    console.error('Failed to start PolyRPC:', err.message);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main();
